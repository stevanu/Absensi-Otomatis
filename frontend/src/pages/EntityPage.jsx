import { useCallback, useEffect, useState } from "react";
import ENTITIES from "../lib/entities.js";
import api from "../lib/api.js";
import { useUI } from "../store/ui.jsx";
import Topbar from "../fragments/Topbar.jsx";
import PageHeader from "../fragments/PageHeader.jsx";
import CrudTable from "../fragments/CrudTable.jsx";
import EntityFormModal from "../fragments/EntityFormModal.jsx";
import ConfirmDialog from "../fragments/ConfirmDialog.jsx";
import Button from "../elements/Button.jsx";
import Input from "../elements/Input.jsx";

/**
 * One page to rule them all: any Sheets-backed entity renders through here.
 * search / add / edit / delete are generic; `readOnly` entities are list-only.
 */
export default function EntityPage({ entityKey }) {
  const entity = ENTITIES[entityKey];
  const { toast } = useUI();
  // Render langsung dari cache saat balik ke menu ini (tanpa spinner).
  const initial = api.peek(`/${entityKey}`);
  const [rows, setRows] = useState(initial?.data || []);
  const [loading, setLoading] = useState(!initial);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmRow, setConfirmRow] = useState(null);

  const load = useCallback(async () => {
    const q = search ? `?q=${encodeURIComponent(search)}` : "";
    const path = `/${entityKey}${q}`;
    // Jangan tampilkan spinner kalau datanya sudah ada di cache.
    if (!api.peek(path)) setLoading(true);
    try {
      const res = await api.get(path);
      setRows(res.data || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [entityKey, search, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditing({});
    setModalOpen(true);
  };
  const openEdit = (row) => {
    setEditing(row);
    setModalOpen(true);
  };

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      if (editing?.id) {
        await api.put(`/${entityKey}/${editing.id}`, data);
        toast.success("Disimpan");
      } else {
        await api.post(`/${entityKey}`, data);
        toast.success("Ditambahkan");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.del(`/${entityKey}/${confirmRow.id}`);
      toast.success("Dihapus");
      setConfirmRow(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <Topbar
        title={`${entity.icon} ${entity.label}`}
        subtitle={
          entity.readOnly
            ? "Data hanya-baca (diperbarui dari perangkat / sinkronisasi)"
            : "Kelola data melalui Google Sheets"
        }
      />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <PageHeader
          title={entity.label}
          description={`Modul ${entity.label}. Data tersimpan di Google Spreadsheet dan dicadangkan ke MySQL setiap 12 jam.`}
          actions={
            !entity.readOnly && (
              <Button onClick={openAdd}>+ Tambah {entity.label}</Button>
            )
          }
        />

        {!entity.readOnly && (
          <div className="mb-4 max-w-sm">
            <Input
              placeholder="Cari…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}

        <CrudTable
          entity={entity}
          rows={rows}
          loading={loading}
          onEdit={entity.readOnly ? null : openEdit}
          onDelete={entity.readOnly ? null : setConfirmRow}
        />
      </div>

      {modalOpen && (
        <EntityFormModal
          entity={entity}
          initial={editing}
          saving={saving}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}

      <ConfirmDialog
        open={Boolean(confirmRow)}
        title={`Hapus ${entity.label}?`}
        message="Tindakan ini akan menghapus data dari Google Sheets. Lanjutkan?"
        confirmLabel="Hapus"
        onConfirm={handleDelete}
        onClose={() => setConfirmRow(null)}
      />
    </>
  );
}
