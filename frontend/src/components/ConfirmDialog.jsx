const ConfirmDialog = ({ open, title, message, confirmLabel = 'Confirm', danger = false, busy = false, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div className="bg-white rounded shadow-lg max-w-sm w-full p-6">
        <h2 id="confirm-dialog-title" className="text-lg font-bold mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} disabled={busy} className="px-4 py-2 rounded border hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`px-4 py-2 rounded text-white disabled:opacity-50 ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {busy ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
