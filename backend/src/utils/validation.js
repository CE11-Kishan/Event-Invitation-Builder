export const EVENT_TYPES = ['birthday','wedding','anniversary','baby_shower','graduation','corporate','meetup','other'];

export function validateInvitation(payload) {
  const errors = [];
  if (!payload.title || typeof payload.title !== 'string') errors.push('title required');
  if (!payload.host || typeof payload.host !== 'string') errors.push('host required');
  if (!payload.startDateTime || typeof payload.startDateTime !== 'string') errors.push('startDateTime required (ISO string)');
  if (payload.eventType && !EVENT_TYPES.includes(payload.eventType)) errors.push('eventType invalid');
  if (payload.creatorEmail && typeof payload.creatorEmail !== 'string') errors.push('creatorEmail must be string');
  return errors;
}

export function validateRSVP(payload) {
  const errors = [];
  if (!payload.name) errors.push('name required');
  if (!['yes','no','maybe'].includes(payload.status)) errors.push('status must be yes|no|maybe');
  return errors;
}
