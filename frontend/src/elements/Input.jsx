/** Text input / textarea / number / date / time wrappers sharing one style. */
export default function Input({ label, error, className = '', as = 'input', ...props }) {
  const Tag = as;
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1 block text-xs font-medium text-ink-700">{label}</span>}
      <Tag className="input-base" {...props} />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
