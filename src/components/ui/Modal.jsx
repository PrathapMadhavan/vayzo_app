function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>

          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-foreground"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

export default Modal;
