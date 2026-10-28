import { useUI } from "../store/ui.jsx";

export default function Topbar({ title, subtitle, actions }) {
  const { sidebarOpen, setSidebarOpen } = useUI();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-ink-100 bg-white/80 px-4 py-3 backdrop-blur">
      {/* Hamburger */}
      {!sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="inline-flex shrink-0 items-center justify-center rounded-lg p-2 text-ink-600 transition-colors hover:bg-ink-100 focus:outline-none focus:ring-2 focus:ring-ink-300 lg:hidden"
          aria-label="Buka menu navigasi"
          aria-expanded={sidebarOpen}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
      )}

      {/* Judul halaman */}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold text-ink-900">
          {title}
        </h1>

        {subtitle && (
          <p className="truncate text-xs text-ink-500">{subtitle}</p>
        )}
      </div>

      {actions && (
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  );
}
