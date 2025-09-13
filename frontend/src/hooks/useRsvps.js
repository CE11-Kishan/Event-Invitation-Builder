import { useEffect, useState, useCallback } from 'react';
import { API_ROUTES } from '../config/api';

export function useRsvps(invitationId, pushToast) {
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', status: 'yes', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const fetchRsvps = useCallback(async () => {
    if (!invitationId) return;
    setLoading(true); setError('');
    try {
      const resp = await fetch(API_ROUTES.rsvpsForInvitation(invitationId));
      if (resp.status === 404) { setError('Invitation not found'); setRsvps([]); return; }
      if (!resp.ok) throw new Error('Failed');
      const data = await resp.json();
      setRsvps(data);
    } catch (e) {
      console.error(e); setError(e.message || 'Error loading RSVPs');
    } finally { setLoading(false); }
  }, [invitationId]);

  useEffect(() => { fetchRsvps(); }, [fetchRsvps]);

  const submit = async () => {
    if (!invitationId) return;
    if (!form.name.trim()) {
      pushToast?.({ title: 'Name required', description: 'Please enter a name for the RSVP', type: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      const resp = await fetch(API_ROUTES.createRSVP(invitationId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        pushToast?.({ title: 'RSVP failed', description: (err.errors?.join(', ') || err.error || ('Status ' + resp.status)), type: 'error' });
        return;
      }
      const data = await resp.json();
      setRsvps(prev => [...prev, data]);
      setForm({ name: '', email: '', status: 'yes', message: '' });
      pushToast?.({ title: 'RSVP added', description: data.name + ' - ' + data.status, type: 'success' });
    } catch (e) {
      console.error(e);
      pushToast?.({ title: 'Network error', description: 'Could not submit RSVP', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    rsvps,
    loading,
    error,
    form,
    submitting,
    updateField,
    refresh: fetchRsvps,
    submit
  };
}
