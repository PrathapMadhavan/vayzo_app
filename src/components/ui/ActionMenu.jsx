import { MoreVertical } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

function ActionMenu({ actions = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, position: "bottom" });
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);

  const calculatePosition = () => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropdownHeight = 150; // approximate max height
    
    let position = "bottom";
    let top = rect.bottom + window.scrollY;
    
    if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
      position = "top";
      top = rect.top + window.scrollY; // We'll translate -100% in CSS
    }

    setDropdownPos({
      top,
      left: rect.right + window.scrollX,
      position
    });
  };

  useEffect(() => {
    if (isOpen) {
      calculatePosition();
      
      const handleScrollOrResize = () => {
        calculatePosition();
      };
      
      window.addEventListener("scroll", handleScrollOrResize, true);
      window.addEventListener("resize", handleScrollOrResize);
      
      return () => {
        window.removeEventListener("scroll", handleScrollOrResize, true);
        window.removeEventListener("resize", handleScrollOrResize);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  if (!actions || actions.length === 0) return null;

  const renderDropdown = () => {
    if (!isOpen) return null;
    
    return createPortal(
      <div 
        ref={dropdownRef}
        className="absolute z-[9999] w-36 rounded-md border border-border bg-surface shadow-md py-1"
        style={{
          top: `${dropdownPos.top}px`,
          left: `${dropdownPos.left}px`,
          transform: `translateX(-100%) ${dropdownPos.position === 'top' ? 'translateY(calc(-100% - 4px))' : 'translateY(4px)'}`
        }}
      >
        {actions.map((action, index) => {
          const Icon = action.icon;
          const isDanger = action.danger;
          return (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                if (action.onClick) action.onClick(e);
              }}
              className={`w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 transition-colors focus:outline-none focus:bg-background ${
                isDanger
                  ? "text-danger hover:bg-danger/10"
                  : "text-foreground hover:bg-background"
              }`}
            >
              {Icon && <Icon size={14} />}
              {action.label}
            </button>
          );
        })}
      </div>,
      document.body
    );
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-primary transition hover:bg-background shrink-0 focus:outline-none focus:ring-2 focus:ring-primary/30"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <MoreVertical size={14} />
      </button>

      {renderDropdown()}
    </div>
  );
}

export default ActionMenu;
