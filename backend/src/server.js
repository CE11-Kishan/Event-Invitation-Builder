import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { v4 as uuid } from 'uuid';
import { validateInvitation, validateRSVP, EVENT_TYPES } from './utils/validation.js';
import { defaultBackgroundFor } from './utils/backgrounds.js';

const app = express();
const PORT = process.env.PORT || 4000;
const startedAt = Date.now();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const db = new Database('data.db');
db.pragma('journal_mode = WAL');

// Migration: remove style_variant, add creator_email if missing
const invitationCols = db.prepare("PRAGMA table_info(invitations)").all();
const invitationsExists = invitationCols.length > 0;
const hasStyleVariant = invitationCols.some(c => c.name === 'style_variant');
const hasCreatorEmail = invitationCols.some(c => c.name === 'creator_email');
if (invitationsExists && (hasStyleVariant || !hasCreatorEmail)) {
  console.log('[Migration] Removing style_variant column from invitations table');
  db.transaction(() => {
    db.exec(`ALTER TABLE invitations RENAME TO invitations_old;`);
    db.exec(`CREATE TABLE invitations (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      host TEXT NOT NULL,
      description TEXT,
      location TEXT,
      start_datetime TEXT NOT NULL,
      event_type TEXT DEFAULT 'other',
      background_image_url TEXT,
      creator_email TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );`);
    db.exec(`INSERT INTO invitations (id,title,host,description,location,start_datetime,event_type,background_image_url,creator_email,created_at,updated_at)
             SELECT id,title,host,description,location,start_datetime,event_type,background_image_url,NULL as creator_email,created_at,updated_at FROM invitations_old;`);
    db.exec(`DROP TABLE invitations_old;`);
  })();
}
// Ensure tables exist
db.exec(`
CREATE TABLE IF NOT EXISTS invitations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  host TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_datetime TEXT NOT NULL,
  event_type TEXT DEFAULT 'other',
  background_image_url TEXT,
  creator_email TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS rsvps (
  id TEXT PRIMARY KEY,
  invitation_id TEXT NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  status TEXT NOT NULL CHECK (status IN ('yes','no','maybe')),
  message TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rsvps_invitation ON rsvps(invitation_id);
`);

// Helpers
function nowISO() { return new Date().toISOString(); }



// Statements
const insertInvitationStmt = db.prepare(`INSERT INTO invitations (id,title,host,description,location,start_datetime,event_type,background_image_url,creator_email,created_at,updated_at) VALUES (@id,@title,@host,@description,@location,@start_datetime,@event_type,@background_image_url,@creator_email,@created_at,@updated_at)`);
const getInvitationStmt = db.prepare('SELECT * FROM invitations WHERE id = ?');
const listInvitationsStmt = db.prepare('SELECT * FROM invitations ORDER BY created_at DESC LIMIT 50');
const listInvitationsByCreatorStmt = db.prepare('SELECT * FROM invitations WHERE creator_email = ? ORDER BY created_at DESC LIMIT 50');
const insertRSVPStmt = db.prepare(`INSERT INTO rsvps (id, invitation_id, name, email, status, message, created_at) VALUES (@id,@invitation_id,@name,@email,@status,@message,@created_at)`);
const listRSVPsStmt = db.prepare('SELECT * FROM rsvps WHERE invitation_id = ? ORDER BY created_at ASC');

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString()
  });
});

// Create invitation
app.post('/api/invitations', (req, res, next) => {
  try {
    const errors = validateInvitation(req.body);
    if (errors.length) return res.status(400).json({ errors });
    const id = uuid();
    const record = {
      id,
      title: req.body.title.trim(),
      host: req.body.host.trim(),
      description: req.body.description?.trim() || null,
      location: req.body.location?.trim() || null,
      start_datetime: req.body.startDateTime,
      event_type: req.body.eventType && EVENT_TYPES.includes(req.body.eventType) ? req.body.eventType : 'other',
      background_image_url: req.body.backgroundImageUrl || defaultBackgroundFor(req.body.eventType),
      creator_email: req.body.creatorEmail?.trim() || null,
      created_at: nowISO(),
      updated_at: nowISO()
    };
    insertInvitationStmt.run(record);
    res.status(201).json({ id, ...record });
  } catch (e) { next(e); }
});

// List invitations
app.get('/api/invitations', (req, res, next) => {
  try {
    const creator = req.query.creatorEmail?.trim();
    let rows;
    if (creator) {
      rows = listInvitationsByCreatorStmt.all(creator);
    } else {
      rows = listInvitationsStmt.all();
    }
    res.json(rows);
  } catch (e) { next(e); }
});

// Get invitation by id
app.get('/api/invitations/:id', (req, res, next) => {
  try {
    const row = getInvitationStmt.get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (e) { next(e); }
});

// Create RSVP
app.post('/api/invitations/:id/rsvp', (req, res, next) => {
  try {
    const invitation = getInvitationStmt.get(req.params.id);
    if (!invitation) return res.status(404).json({ error: 'Invitation not found' });
    const errors = validateRSVP(req.body);
    if (errors.length) return res.status(400).json({ errors });
    const rec = {
      id: uuid(),
      invitation_id: invitation.id,
      name: req.body.name.trim(),
      email: req.body.email?.trim() || null,
      status: req.body.status,
      message: req.body.message?.trim() || null,
      created_at: nowISO()
    };
    insertRSVPStmt.run(rec);
    res.status(201).json(rec);
  } catch (e) { next(e); }
});

// List RSVPs
app.get('/api/invitations/:id/rsvps', (req, res, next) => {
  try {
    const invitation = getInvitationStmt.get(req.params.id);
    if (!invitation) return res.status(404).json({ error: 'Invitation not found' });
    const rows = listRSVPsStmt.all(invitation.id);
    res.json(rows);
  } catch (e) { next(e); }
});


// 404
app.use((req, res, next) => {
  if (res.headersSent) return next();
  res.status(404).json({ error: 'Route not found' });
});

// Error middleware
app.use((err, req, res, next) => { // eslint-disable-line
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
