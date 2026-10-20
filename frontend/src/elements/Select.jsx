/** Select dropdown. Accepts options as [{id,name}] or [string]. */
export default function Select({ label, error, className = '', options = [], placeholder, ...props }) {
  const normalized = options.map((o) =>
    typeof o === 'string' ? { id: o, name: o } : { id: o.id ?? o.value, name: o.name ?? o.label }
  );
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1 block text-xs font-medium text-ink-700">{label}</span>}
      <select className="input-base" {...props}>
        {placeholder !== null && <option value="">{placeholder || 'Pilih…'}</option>}
        {normalized.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
