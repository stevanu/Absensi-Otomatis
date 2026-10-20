import Badge from '../elements/Badge.jsx';
import EmptyState from '../elements/EmptyState.jsx';
import { useLookups } from '../hooks/useLookups.js';

/**
 * Generic data table driven by an entity config. Renders configured columns,
 * resolves select/lookup labels, and exposes row actions. No per-module dupes.
 */
export default function CrudTable({ entity, rows, onEdit, onDelete, extraActions, loading }) {
  const { label } = useLookups();
  const cols = entity.columns || [];

  const renderCell = (field, row) => {
    const value = row[field];
    const def = entity.fields.find((f) => f.name === field);
    if (def?.type === 'bool') {
      return value ? <Badge tone="success">Ya</Badge> : <Badge tone="neutral">Tidak</Badge>;
    }
    if (def?.optionsFrom) {
      return <span className="text-ink-700">{label(def.optionsFrom, value)}</span>;
    }
    if (def?.options) {
      const tone = value === 'Disetujui' ? 'success' : value === 'Ditolak' ? 'danger' : 'warning';
      return <Badge tone={tone}>{value || '-'}</Badge>;
    }
    return <span className="text-ink-700">{value ?? '-'}</span>;
  };

  if (loading) return <div className="py-10 text-center text-sm text-ink-400">Memuat…</div>;
  if (!rows.length) return <EmptyState hint="Tambah data pertama untuk memulai." />;

  return (
    <div className="overflow-x-auto rounded-xl border border-ink-100">
      <table className="w-full text-left text-sm">
        <thead className="bg-ink-100/60 text-xs uppercase text-ink-500">
          <tr>
            {cols.map((c) => (
              <th key={c} className="px-4 py-3 font-semibold">
                {entity.fields.find((f) => f.name === c)?.label || c}
              </th>
            ))}
            <th className="px-4 py-3 text-right font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {rows.map((row, i) => (
            <tr key={row.id || i} className="hover:bg-ink-100/40">
              {cols.map((c) => (
                <td key={c} className="max-w-xs truncate px-4 py-3">
                  {renderCell(c, row)}
                </td>
              ))}
              <td className="px-4 py-3 text-right">
                <div className="inline-flex gap-1">
                  {extraActions?.(row)}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(row)}
                      className="rounded-md px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(row)}
                      className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
