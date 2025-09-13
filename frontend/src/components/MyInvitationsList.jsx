import { Button } from './ui/button';

export function MyInvitationsList({
  creatorEmail,
  invitations,
  loading,
  error,
  onRefresh,
  onDownloadPdf,
  onCopy
}) {
  return (
    <section className="rounded-lg border border-gray-200 p-6 bg-gray-50 space-y-4">
      <h2 className="text-sm font-semibold text-gray-700">
        My Invitations {creatorEmail ? '' : '(enter creator email in Create tab to use)'}
      </h2>
      <div className="flex gap-2 items-center flex-wrap">
        <Button
          size="sm"
          variant="outline"
            disabled={!creatorEmail || loading}
            onClick={onRefresh}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
        {creatorEmail && (
          <span className="text-[11px] text-gray-500">{creatorEmail}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="border border-gray-200 rounded-md divide-y max-h-80 overflow-auto bg-white">
        {loading && invitations.length === 0 && (
          <div className="p-3 text-xs text-gray-500">Loading...</div>
        )}
        {!loading && invitations.length === 0 && (
          <div className="p-3 text-xs text-gray-500">No invitations.</div>
        )}
        {invitations.map((inv) => (
          <div key={inv.id} className="p-3 text-xs flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-gray-800 truncate">{inv.title}</span>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => onDownloadPdf(inv.id)}>PDF</Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onCopy(inv.id)}
                >
                  Copy
                </Button>
              </div>
            </div>
            <span className="text-[10px] text-gray-500">{inv.start_datetime} • {inv.event_type}</span>
            {inv.location && (
              <span className="text-[10px] text-gray-500">📍 {inv.location}</span>
            )}
            <span className="text-[9px] text-gray-400">{inv.id}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
