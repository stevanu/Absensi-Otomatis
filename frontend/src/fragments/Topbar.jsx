import { useUI } from '../store/ui.jsx';

/** Top bar with menu toggle, title, and a live sync/store status chip. */
export default function Topbar({ title, subtitle, actions }) {
  const { sidebarOpen, setSidebarOpen } = useUI();
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-ink-100 bg-white/80 px-4 py-3 backdrop-blur">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="rounded-lg p-2 text-ink-600 hover:bg-ink-100"
        aria-label="Toggle menu"
      >
        ☰
      </button>
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold text-ink-900">{title}</h1>
        {subtitle && <p className="truncate text-xs text-ink-500">{subtitle}</p>}
      </div>
      <div className="ml-auto flex items-center gap-2">{actions}</div>
    </header>
  );
}
