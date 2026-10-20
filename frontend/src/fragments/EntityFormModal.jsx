import { useEffect, useState } from 'react';
import Modal from '../elements/Modal.jsx';
import Input from '../elements/Input.jsx';
import Select from '../elements/Select.jsx';
import Button from '../elements/Button.jsx';
import { useLookups } from '../hooks/useLookups.js';

/**
 * Generic form modal generated from an entity config. Eliminates one-off forms
 * for every module. Supports text/number/date/time/email/tel/password/textarea,
 * static option lists, and lookup-backed selects. Read-only fields are locked.
 */
export default function EntityFormModal({ entity, initial, onClose, onSubmit, saving }) {
  const { list } = useLookups();
  const [form, setForm] = useState(() => ({ ...initial }) || {});

  useEffect(() => {
    setForm({ ...initial } || {});
  }, [initial]);

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }));
  const isEdit = Boolean(initial?.id);

  const submit = (e) => {
    e.preventDefault();
    // Drop empty optional strings so Sheets stays clean (no "" placeholders).
    const cleaned = {};
    for (const [k, v] of Object.entries(form)) {
      cleaned[k] = v === '' ? null : v;
    }
    onSubmit(cleaned);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`${isEdit ? 'Edit' : 'Tambah'} ${entity.label}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={submit} loading={saving}>
            {isEdit ? 'Simpan' : 'Tambah'}
          </Button>
        </>
      }
    >
      <form id="entity-form" onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {entity.fields.map((f) => {
          if (f.readonly) {
            return (
              <div key={f.name} className="sm:col-span-2">
                <Input label={f.label} value={form[f.name] || '-'} disabled />
              </div>
            );
          }
          if (f.type === 'bool') {
            return (
              <label key={f.name} className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  checked={Boolean(form[f.name])}
                  onChange={(e) => set(f.name, e.target.checked)}
                  className="h-4 w-4 rounded border-ink-300 text-brand-600"
                />
                <span className="text-sm text-ink-700">{f.label}</span>
              </label>
            );
          }
          const common = { label: f.label, required: f.required, placeholder: f.placeholder };
          if (f.type === 'select') {
            const opts = f.optionsFrom ? list(f.optionsFrom) : f.options || [];
            return (
              <Select
                key={f.name}
                {...common}
                value={form[f.name] ?? ''}
                onChange={(e) => set(f.name, e.target.value)}
                options={opts}
                placeholder={f.placeholder || `Pilih ${f.label}`}
              />
            );
          }
          if (f.type === 'textarea') {
            return (
              <div key={f.name} className="sm:col-span-2">
                <Input
                  as="textarea"
                  rows={3}
                  {...common}
                  value={form[f.name] ?? ''}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              </div>
            );
          }
          return (
            <Input
              key={f.name}
              type={f.type}
              {...common}
              value={form[f.name] ?? ''}
              onChange={(e) => set(f.name, e.target.value)}
            />
          );
        })}
      </form>
    </Modal>
  );
}
