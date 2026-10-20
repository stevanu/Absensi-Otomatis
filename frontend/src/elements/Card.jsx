/** Surface card used across the app. */
export default function Card({ children, className = '', title, action, padded = true }) {
  return (
    <div className={`card ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3.5">
          <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
          {action}
        </div>
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </div>
  );
}
