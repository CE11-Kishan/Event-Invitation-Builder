import { useState, useEffect, useRef } from 'react';
import { Button } from './components/ui/button';
import { API_ROUTES, defaultBgFor } from './config/api';
import { useToast } from './components/ui/toast/toast-context';
import { InvitationForm, InvitationPreview, InvitationsList, InvitationDetails, MyInvitationsList } from './components';
import { generateInvitationPdf } from './utils/generatePdfFromPreview';
import { useRsvps } from './hooks/useRsvps';

const initialForm = {
  title: '',
  host: '',
  startDateTime: '',
  location: '',
  description: '',
  eventType: 'other',
  backgroundImageUrl: ''
};

function App() {
  const { push } = useToast();
  // We no longer persist creator email in localStorage; user will enter it when needed.
  const [activeTab, setActiveTab] = useState('create');
  const [form, setForm] = useState({ ...initialForm, creatorEmail: '' });
  const [myEmailInput, setMyEmailInput] = useState('');
  const [previewImg, setPreviewImg] = useState('');
  const [saving, setSaving] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState('');
  const [fetchIdInput, setFetchIdInput] = useState('');
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [invitationError, setInvitationError] = useState('');
  const detailsRef = useRef(null);
  const { rsvps, loading: rsvpsLoading, error: rsvpsError, form: rsvpForm, submitting: rsvpSubmitting, updateField: updateRsvpField, refresh: refreshRsvps, submit: submitRSVP } = useRsvps(selectedInvitation?.id, push);
  const [myInvitations, setMyInvitations] = useState([]);
  const [myLoading, setMyLoading] = useState(false);
  const [myError, setMyError] = useState('');
  const [lastCreatedId, setLastCreatedId] = useState(null);
  // For shareable link invite param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteId = params.get('invite');
    if (inviteId) {
      setActiveTab('view');
      setFetchIdInput(inviteId);
      fetchInvitationById(inviteId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function buildShareUrl(id) {
    const url = new URL(window.location.href);
    url.searchParams.set('invite', id);
    return url.toString();
  }
  function setUrlInviteParam(id) {
    const url = new URL(window.location.href);
    if (id) url.searchParams.set('invite', id); else url.searchParams.delete('invite');
    window.history.replaceState({}, '', url.toString());
  }
  function copyShareLink(id) {
    const link = buildShareUrl(id);
    navigator.clipboard.writeText(link).then(() => push({ title: 'Link copied', description: link, type: 'info' }));
  }

  useEffect(() => { setPreviewImg(defaultBgFor(form.eventType)); }, [form.eventType]);

  function updateField(field, value) { setForm(f => ({ ...f, [field]: value })); }
  function resetForm() { setForm({ ...initialForm, creatorEmail: '' }); setPreviewImg(''); }
  function handleCreatorEmailChange(val) { updateField('creatorEmail', val); }
  function copyLastId() { if (!lastCreatedId) return; navigator.clipboard.writeText(lastCreatedId).then(() => push({ title: 'Copied', description: lastCreatedId, type: 'info' })); }
  const previewRef = useRef(null);
  async function downloadPdfFront() {
    try {
      await generateInvitationPdf(previewRef.current, `invitation-${form.title || 'event'}.pdf`);
      push({ title: 'PDF ready', description: 'Downloaded preview PDF', type: 'success' });
    } catch (e) {
      console.error(e);
      push({ title: 'PDF error', description: 'Failed to generate PDF', type: 'error' });
    }
  }

  async function handleSave() {
    if (!form.title.trim() || !form.host.trim() || !form.startDateTime) { push({ title: 'Missing fields', description: 'Title, Host, and Date/Time are required', type: 'error' }); return; }
    setSaving(true);
    try {
      const resp = await fetch(API_ROUTES.invitations(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!resp.ok) { const err = await resp.json().catch(() => ({})); push({ title: 'Save failed', description: (err.errors?.join(', ') || err.error || ('Status ' + resp.status)), type: 'error' }); return; }
      const data = await resp.json();
      push({ title: 'Invitation created', description: 'ID: ' + data.id, type: 'success' });
      if (activeTab === 'view') fetchInvitations();
      if (activeTab === 'mine') fetchMyInvitations();
      setLastCreatedId(data.id);
    } catch (e) { console.error(e); push({ title: 'Network error', description: 'Could not save invitation', type: 'error' }); }
    finally { setSaving(false); }
  }

  async function fetchInvitations() {
    setListLoading(true); setListError('');
    try { const resp = await fetch(API_ROUTES.invitations()); if (!resp.ok) throw new Error('Failed'); const data = await resp.json(); setInvitations(data); }
    catch (e) { console.error(e); setListError(e.message || 'Error loading list'); }
    finally { setListLoading(false); }
  }
  async function fetchMyInvitations(emailOverride) {
    const creator = emailOverride !== undefined ? emailOverride : form.creatorEmail;
    if (!creator) { setMyInvitations([]); return; }
    setMyLoading(true); setMyError('');
    try { const resp = await fetch(API_ROUTES.invitations() + `?creatorEmail=${encodeURIComponent(creator)}`); if (!resp.ok) throw new Error('Failed'); const data = await resp.json(); setMyInvitations(data); }
    catch (e) { console.error(e); setMyError(e.message || 'Error'); }
    finally { setMyLoading(false); }
  }
  async function fetchInvitationById(id) {
    if (!id) return; setInvitationLoading(true); setInvitationError('');
    try { const resp = await fetch(API_ROUTES.invitationById(id)); if (resp.status === 404) { setInvitationError('Not found'); setSelectedInvitation(null); return; } if (!resp.ok) throw new Error('Failed'); const data = await resp.json(); setSelectedInvitation(data); }
    catch (e) { console.error(e); setInvitationError(e.message || 'Error fetching invitation'); }
    finally { setInvitationLoading(false); }
  }
  function handleSelect(inv) { setSelectedInvitation(inv); setFetchIdInput(inv.id); }
  // Update URL when selection changes
  useEffect(() => { if (selectedInvitation?.id) setUrlInviteParam(selectedInvitation.id); }, [selectedInvitation]);

  // Scroll details section into view when a selection occurs (including share link load)
  useEffect(() => {
    if (activeTab === 'view' && selectedInvitation && detailsRef.current) {
      // Use smooth scrolling and focus for accessibility
      detailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Delay focus slightly to ensure element is in DOM / layout settled
      setTimeout(() => {
        try { detailsRef.current.focus(); } catch (_) { /* noop */ }
      }, 120);
    }
  }, [activeTab, selectedInvitation]);

  useEffect(() => { if (activeTab === 'view' && invitations.length === 0 && !listLoading) fetchInvitations(); /* For 'mine' we wait for explicit email submission */ /* eslint-disable-next-line */ }, [activeTab]);
  // Refresh RSVPs when invitation changes
  useEffect(() => { if (selectedInvitation) refreshRsvps(); }, [selectedInvitation, refreshRsvps]);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Event Invitation Builder</h1>
          <p className="text-sm text-gray-500">Create, preview and share digital event invitations.</p>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 pb-2">
          <Button
            variant={activeTab === 'create' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('create')}
          >
            Create Invitation
          </Button>
          <Button
            variant={activeTab === 'view' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('view')}
          >
            View Events
          </Button>
          <Button
            variant={activeTab === 'mine' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('mine')}
          >
            My Invitations
          </Button>
        </div>

        {/* Hidden preview container for PDF capture when not on create tab */}
        {activeTab !== 'create' && (
          <div className="absolute -left-[9999px] -top-[9999px]">
            <InvitationPreview
              ref={previewRef}
              form={(() => {
                const source = activeTab === 'view' ? selectedInvitation : null;
                const mineSource = activeTab === 'mine' ? myInvitations.find(i => i.id === selectedInvitation?.id) || null : null;
                const base = source || mineSource;
                if (!base) return { ...form };
                return {
                  title: base.title,
                  host: base.host,
                  startDateTime: base.start_datetime,
                  location: base.location,
                  description: base.description,
                  eventType: base.event_type,
                  backgroundImageUrl: base.background_image_url
                };
              })()}
              previewImg={(() => {
                const base = selectedInvitation || null;
                return base?.background_image_url || previewImg || defaultBgFor(form.eventType);
              })()}
            />
          </div>
        )}

        {/* CREATE TAB */}
        {activeTab === 'create' && (
          <div className="grid gap-6 md:grid-cols-2">
            <InvitationForm
              form={form}
              saving={saving}
              lastCreatedId={lastCreatedId}
              onChangeField={updateField}
              onCreatorEmailChange={handleCreatorEmailChange}
              onReset={resetForm}
              onSave={handleSave}
              onCopyId={copyLastId}
              onShareLink={() => lastCreatedId && copyShareLink(lastCreatedId)}
              onDownloadPdf={downloadPdfFront}
            />
            <InvitationPreview ref={previewRef} form={form} previewImg={previewImg} />
          </div>
        )}

        {/* VIEW TAB */}
        {activeTab === 'view' && (
          <div className="space-y-6">
            <InvitationsList
              invitations={invitations}
              listLoading={listLoading}
              listError={listError}
              selectedInvitation={selectedInvitation}
              fetchIdInput={fetchIdInput}
              onChangeFetchId={setFetchIdInput}
              onRefresh={fetchInvitations}
              onFetchById={fetchInvitationById}
              onSelect={handleSelect}
            />
            <InvitationDetails
              ref={detailsRef}
              invitation={selectedInvitation}
              loading={invitationLoading}
              error={invitationError}
              rsvps={rsvps}
              rsvpsLoading={rsvpsLoading}
              rsvpsError={rsvpsError}
              rsvpForm={rsvpForm}
              rsvpSubmitting={rsvpSubmitting}
              onUpdateRsvpField={updateRsvpField}
              onSubmitRsvp={submitRSVP}
              onDownloadPdf={() => downloadPdfFront()}
              onCopyId={(id) => { navigator.clipboard.writeText(id); push({ title: 'Copied', description: id, type: 'info' }); }}
              onShare={(id) => copyShareLink(id)}
            />
          </div>
        )}

        {/* MINE TAB */}
        {activeTab === 'mine' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 p-4 border rounded-md bg-gray-50">
              <label className="text-sm font-medium text-gray-700">Enter your creator email to load your invitations</label>
              <div className="flex gap-2 flex-col sm:flex-row">
                <input
                  type="email"
                  value={myEmailInput}
                  onChange={(e) => setMyEmailInput(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Button
                  size="sm"
                  disabled={!myEmailInput.trim() || myLoading}
                  onClick={() => {
                    const trimmed = myEmailInput.trim();
                    updateField('creatorEmail', trimmed);
                    fetchMyInvitations(trimmed);
                  }}
                >
                  {myLoading ? 'Loading...' : 'Load'}
                </Button>
              </div>
              <p className="text-xs text-gray-500">We only use this email to filter invitations you created. No authentication yet.</p>
            </div>
            <MyInvitationsList
              creatorEmail={form.creatorEmail}
              invitations={myInvitations}
              loading={myLoading}
              error={myError}
              onRefresh={() => fetchMyInvitations()}
              onDownloadPdf={() => downloadPdfFront()}
              onCopy={(id) => { navigator.clipboard.writeText(id); push({ title: 'Copied', description: id, type: 'info' }); }}
              onShare={(id) => copyShareLink(id)}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
