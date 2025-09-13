import { forwardRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { SegmentedControl } from './ui/segmented-control';

export const InvitationDetails = forwardRef(function InvitationDetails({
  invitation,
  loading,
  error,
  rsvps,
  rsvpsLoading,
  rsvpsError,
  rsvpForm,
  rsvpSubmitting,
  onUpdateRsvpField,
  onSubmitRsvp,
  onDownloadPdf,
  onCopyId,
  onShare
}, ref) {
  return (
    <section ref={ref} className="rounded-lg border border-gray-200 p-6 bg-gray-50 min-h-[320px] flex flex-col focus:outline-none" tabIndex={-1}>
      {!invitation && !loading && !error && (
        <p className="text-sm text-gray-600">Select an invitation from the list or fetch by ID to view details.</p>
      )}
      {loading && <p className="text-sm text-gray-600">Loading invitation...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {invitation && !loading && (
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="text-lg font-semibold tracking-tight">{invitation.title}</h3>
            <span className="flex gap-1">
              <Button size="sm" variant="outline" type="button" onClick={() => onDownloadPdf(invitation.id)}>PDF</Button>
              <Button size="sm" variant="outline" type="button" onClick={() => onCopyId(invitation.id)}>Copy ID</Button>
              <Button size="sm" variant="ghost" type="button" onClick={() => onShare(invitation.id)}>Share</Button>
            </span>
          </div>
          <p className="text-sm text-gray-600">Hosted by {invitation.host}</p>
          <p className="text-xs text-gray-500">{invitation.start_datetime}</p>
          {invitation.location && (
            <p className="text-sm text-gray-600">📍 {invitation.location}</p>
          )}
          <div
            className="relative rounded-md border border-dashed border-gray-300 p-4 bg-white overflow-hidden"
            style={{
              backgroundImage: invitation.background_image_url?.startsWith('data:')
                ? `url(${invitation.background_image_url})`
                : invitation.background_image_url,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-white/70" />
            <div className="relative space-y-2">
              {invitation.description && (
                <p className="text-sm text-gray-700 whitespace-pre-line">{invitation.description}</p>
              )}
              <span className="inline-block mt-2 text-[10px] uppercase tracking-wide rounded bg-gray-900 text-white px-2 py-1">
                {invitation.event_type.replace('_', ' ')}
              </span>
            </div>
          </div>
          <div className="pt-2">
            <div className="grid md:grid-cols-2 gap-6">
              {/* RSVPs List */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  RSVPs {rsvpsLoading && (
                    <span className="text-[10px] font-normal text-gray-500">loading...</span>
                  )}
                </h4>
                {rsvpsError && <p className="text-xs text-red-600">{rsvpsError}</p>}
                <div className="border border-gray-200 rounded-md divide-y max-h-48 overflow-auto bg-white">
                  {rsvps.length === 0 && !rsvpsLoading && (
                    <div className="p-3 text-xs text-gray-500">No RSVPs yet.</div>
                  )}
                  {rsvps.map((r) => (
                    <div key={r.id} className="p-3 text-xs flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-gray-800 truncate">{r.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wide ${
                            r.status === 'yes'
                              ? 'bg-green-600 text-white'
                              : r.status === 'no'
                                ? 'bg-red-600 text-white'
                                : 'bg-yellow-500 text-white'
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                      {r.email && <p className="text-[10px] text-gray-500 truncate">{r.email}</p>}
                      {r.message && (
                        <p className="text-[10px] text-gray-600 whitespace-pre-line">{r.message}</p>
                      )}
                      <p className="text-[9px] text-gray-400">{r.created_at}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* RSVP Form */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">Add RSVP</h4>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label className="text-[10px]">Name *</Label>
                    <Input
                      value={rsvpForm.name}
                      onChange={(e) => onUpdateRsvpField('name', e.target.value)}
                      className="h-8 px-2 py-1 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Email</Label>
                    <Input
                      value={rsvpForm.email}
                      onChange={(e) => onUpdateRsvpField('email', e.target.value)}
                      className="h-8 px-2 py-1 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Status</Label>
                    <SegmentedControl
                      options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'maybe', label: 'Maybe' }]}
                      value={rsvpForm.status}
                      onChange={(val) => onUpdateRsvpField('status', val)}
                    />
                    <p className="text-[10px] text-gray-500">Choose your attendance response.</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Message</Label>
                    <Textarea
                      rows={2}
                      value={rsvpForm.message}
                      onChange={(e) => onUpdateRsvpField('message', e.target.value)}
                      className="px-2 py-1 text-xs"
                    />
                  </div>
                  <div className="pt-1">
                    <Button size="sm" onClick={onSubmitRsvp} disabled={rsvpSubmitting}>
                      {rsvpSubmitting ? 'Submitting...' : 'Submit RSVP'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
});
