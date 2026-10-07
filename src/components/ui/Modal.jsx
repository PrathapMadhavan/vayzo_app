function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-md", overflow = "auto" }) {
 if (!isOpen) return null;

 return (
 <div 
 className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
 onClick={onClose}
 >
 <div 
 className={`w-full ${maxWidth} rounded-xl bg-surface p-6 max-h-[90vh] flex flex-col`}
 onClick={(e) => e.stopPropagation()}
 >
 <div className="mb-4 flex items-center justify-between shrink-0">
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

 <div className="overflow-y-auto overflow-x-hidden scrollbar-none p-5" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }} >
        <style>{`.scrollbar-none::-webkit-scrollbar { display: none; }`}</style>
 {children}
 </div>
 </div>
 </div>
 );
}

export default Modal;
