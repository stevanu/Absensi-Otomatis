/** Friendly placeholder when a list/table has no rows. */
export default function EmptyState({ title = 'Belum ada data', hint, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <div className="text-3xl">📭</div>
      <p className="text-sm font-medium text-ink-700">{title}</p>
      {hint && <p className="max-w-sm text-xs text-ink-500">{hint}</p>}
      {action}
    </div>
  );
}
