/** KPI stat card for dashboards. */
export default function Stat({ label, value, hint, tone = 'brand', icon }) {
  const accent = {
    brand: 'text-brand-600',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    danger: 'text-red-600',
    info: 'text-sky-600',
  }[tone];
  return (
    <div className="card flex items-center gap-4 p-5">
      {icon && (
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-ink-100 text-xl ${accent}`}>
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-2xl font-bold text-ink-900">{value}</p>
        <p className="truncate text-sm text-ink-500">{label}</p>
        {hint && <p className="truncate text-xs text-ink-400">{hint}</p>}
      </div>
    </div>
  );
}
