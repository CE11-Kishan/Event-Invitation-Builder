import { Button } from './ui/button';
import { Input } from './ui/input';

export function InvitationsList({
  invitations,
  listLoading,
  listError,
  selectedInvitation,
  fetchIdInput,
  onChangeFetchId,
  onRefresh,
  onFetchById,
  onSelect
}) {
  return (
    <section className="rounded-lg border border-gray-200 p-6 bg-gray-50 space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-sm font-semibold text-gray-700">Invitations (latest {invitations.length})</h2>
        <div className="flex gap-2 flex-wrap">
          <Input
            value={fetchIdInput}
            onChange={(e) => onChangeFetchId(e.target.value)}
            placeholder="Enter Invitation ID"
            className="w-64"
          />
          <Button size="sm" type="button" onClick={() => onFetchById(fetchIdInput.trim())}>Fetch</Button>
          <Button size="sm" variant="outline" type="button" onClick={onRefresh} disabled={listLoading}>
            {listLoading ? 'Loading' : 'Refresh'}
          </Button>
        </div>
      </div>
      {listError && <p className="text-xs text-red-600">{listError}</p>}
      <div className="border border-gray-200 rounded-md divide-y max-h-60 overflow-auto bg-white">
        {listLoading && invitations.length === 0 && (
          <div className="p-3 text-xs text-gray-500">Loading invitations...</div>
        )}
        {!listLoading && invitations.length === 0 && (
          <div className="p-3 text-xs text-gray-500">No invitations yet.</div>
        )}
        {invitations.map((inv) => (
          <button
            key={inv.id}
            onClick={() => onSelect(inv)}
            className={`w-full text-left p-3 flex items-center justify-between gap-4 hover:bg-gray-50 ${selectedInvitation?.id === inv.id ? 'bg-gray-100' : ''}`}
          >
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{inv.title}</p>
              <p className="text-[11px] text-gray-500 truncate">{inv.event_type} • {inv.start_datetime}</p>
            </div>
            <span className="text-[10px] font-mono text-gray-400 flex-shrink-0">{inv.id.slice(0, 8)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
