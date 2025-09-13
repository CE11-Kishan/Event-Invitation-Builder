import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select } from './ui/select';
import { EVENT_TYPES } from '../config/api';

export function InvitationForm({
  form,
  saving,
  lastCreatedId,
  onChangeField,
  onCreatorEmailChange,
  onReset,
  onSave,
  onCopyId,
  onDownloadPdf,
  onShareLink
}) {
  return (
    <section className="rounded-lg border border-gray-200 p-6 bg-gray-50 min-h-[420px] space-y-4">
      <div className="space-y-1">
        <Label>Creator Email (identify you)</Label>
        <Input
          value={form.creatorEmail || ''}
          onChange={(e) => onCreatorEmailChange(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-1">
        <Label>Title *</Label>
        <Input
          value={form.title}
          onChange={(e) => onChangeField('title', e.target.value)}
          placeholder="e.g. John's Birthday Bash"
        />
      </div>
      <div className="space-y-1">
        <Label>Host *</Label>
        <Input
          value={form.host}
          onChange={(e) => onChangeField('host', e.target.value)}
          placeholder="Host name"
        />
      </div>
      <div className="space-y-1">
        <Label>Start Date / Time (ISO) *</Label>
        <Input
          type="datetime-local"
          value={form.startDateTime}
          onChange={(e) => onChangeField('startDateTime', e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label>Location</Label>
        <Input
          value={form.location}
          onChange={(e) => onChangeField('location', e.target.value)}
          placeholder="Venue or address"
        />
      </div>
      <div className="space-y-1">
        <Label>Description</Label>
        <Textarea
          value={form.description}
          onChange={(e) => onChangeField('description', e.target.value)}
          rows={3}
          placeholder="Short message"
        />
      </div>
      <div className="space-y-1">
        <Label>Event Type</Label>
        <Select
          value={form.eventType}
          onChange={(e) => onChangeField('eventType', e.target.value)}
        >
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>{t.replace('_', ' ')}</option>
          ))}
        </Select>
      </div>
      <p className="text-[11px] text-gray-500">Background auto-selected based on event type.</p>
      <div className="flex gap-2 pt-2 flex-wrap">
        <Button size="sm" onClick={onSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
        <Button variant="outline" size="sm" type="button" onClick={onReset}>Reset</Button>
        {lastCreatedId && (
          <Button variant="outline" size="sm" type="button" onClick={onCopyId}>Copy ID</Button>
        )}
        {lastCreatedId && (
          <Button variant="ghost" size="sm" type="button" onClick={() => onDownloadPdf(lastCreatedId)}>PDF</Button>
        )}
        {lastCreatedId && (
          <Button variant="ghost" size="sm" type="button" onClick={onShareLink}>Share Link</Button>
        )}
      </div>
    </section>
  );
}
