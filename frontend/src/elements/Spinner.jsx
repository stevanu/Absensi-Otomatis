/** Centered spinner for loading states. */
export default function Spinner({ label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-ink-500">
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-ink-300 border-t-brand-500" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
