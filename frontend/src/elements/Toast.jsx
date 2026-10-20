/** Toast viewport, rendered once at the app root via UIProvider. */
import { useUI } from '../store/ui.jsx';

const TONE = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-sky-200 bg-sky-50 text-sky-800',
};

export default function Toast() {
  const { toasts } = useUI();
  return (
    <div className="fixed bottom-5 right-5 z-[60] flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-xl border px-4 py-3 text-sm shadow-card ${TONE[t.type] || TONE.info}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
