// Centralized API configuration & constants

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export const API_ROUTES = {
  health: () => `${API_BASE_URL}/health`,
  invitations: () => `${API_BASE_URL}/api/invitations`,
  invitationById: (id) => `${API_BASE_URL}/api/invitations/${id}`,
  rsvpsForInvitation: (id) => `${API_BASE_URL}/api/invitations/${id}/rsvps`,
  createRSVP: (id) => `${API_BASE_URL}/api/invitations/${id}/rsvp`,
  pdfExport: (id) => `${API_BASE_URL}/api/invitations/${id}/pdf`
};

export const EVENT_TYPES = Object.freeze([
  'birthday',
  'wedding',
  'anniversary',
  'baby_shower',
  'graduation',
  'corporate',
  'meetup',
  'other'
]);

export function isValidEventType(val) {
  return EVENT_TYPES.includes(val);
}

// Backgrounds (CSS gradients) matching backend palette intent
export const DEFAULT_BG_BY_EVENT = Object.freeze({
  birthday: 'linear-gradient(135deg,#f59e0b,#f472b6)',
  wedding: 'linear-gradient(135deg,#f5d0fe,#9333ea)',
  anniversary: 'linear-gradient(135deg,#fde68a,#fca5a5)',
  baby_shower: 'linear-gradient(135deg,#bfdbfe,#c084fc)',
  graduation: 'linear-gradient(135deg,#93c5fd,#1d4ed8)',
  corporate: 'linear-gradient(135deg,#cbd5e1,#64748b)',
  meetup: 'linear-gradient(135deg,#6ee7b7,#3b82f6)',
  other: 'linear-gradient(135deg,#e5e7eb,#9ca3af)'
});

export function defaultBgFor(eventType) {
  return DEFAULT_BG_BY_EVENT[eventType] || DEFAULT_BG_BY_EVENT.other;
}
