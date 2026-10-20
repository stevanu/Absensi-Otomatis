import Modal from '../elements/Modal.jsx';
import Button from '../elements/Button.jsx';

/** Reusable confirmation dialog (delete, sync, etc). */
export default function ConfirmDialog({ open, title = 'Konfirmasi', message, confirmLabel = 'Ya', tone = 'danger', onConfirm, onClose, loading }) {
  if (!open) return null;
  return (
    <Modal
      open
      onClose={onClose}
      title={title}
      width="max-w-sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button variant={tone} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-ink-700">{message}</p>
    </Modal>
  );
}
