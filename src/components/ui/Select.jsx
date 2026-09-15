import { ChevronDown } from "lucide-react";
import { Children, useEffect, useRef, useState } from "react";

function Select({
  label,
  error,
  id,
  className = "",
  children,
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  containerClassName = "",
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const optionsList =
    options.length > 0
      ? options.map((option) =>
          typeof option === "string"
            ? { label: option, value: option }
            : option,
        )
      : Children.toArray(children)
          .map((child) => {
            if (!child?.props) {
              return null;
            }

            return {
              label: child.props.children,
              value: child.props.value,
              disabled: child.props.disabled,
            };
          })
          .filter((option) => option?.value !== undefined);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (selectedValue) => {
    if (disabled) {
      return;
    }

    onChange?.({
      target: {
        value: selectedValue,
        name: props.name,
      },
    });

    setIsOpen(false);
  };

  const activeOption = optionsList.find((option) => option.value === value);

  const displayLabel = activeOption?.label ?? placeholder;

  return (
    <div className={["w-full", containerClassName].filter(Boolean).join(" ")} ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          id={id}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => {
            if (!disabled) {
              setIsOpen((prev) => !prev);
            }
          }}
          className={[
            "flex h-10 w-full items-center justify-between rounded-lg border px-3.5 py-2.5",
            "text-left text-sm transition-colors outline-none",
            disabled
              ? "cursor-not-allowed bg-background opacity-50"
              : "cursor-pointer bg-background text-foreground",
            error
              ? "border-danger focus:border-danger focus:ring-1 focus:ring-danger"
              : isOpen
                ? "border-primary ring-1 ring-primary"
                : "border-border focus:border-primary focus:ring-1 focus:ring-primary",
            className,
          ].join(" ")}
          {...props}
        >
          <span className={activeOption ? "text-foreground" : "text-muted"}>
            {displayLabel}
          </span>

          <ChevronDown
            size={18}
            strokeWidth={1.8}
            className={[
              "shrink-0 text-muted transition-transform duration-200",
              isOpen ? "rotate-180" : "",
            ].join(" ")}
          />
        </button>

        {isOpen && (
          <div
            role="listbox"
            aria-labelledby={id}
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto scrollbar-none rounded-lg border border-border bg-surface shadow-lg"
          >
            {optionsList.length > 0 ? (
              optionsList.map((option) => {
                const isSelected = option.value === value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={option.disabled}
                    onClick={() => {
                      if (!option.disabled) {
                        handleSelect(option.value);
                      }
                    }}
                    className={[
                      "flex w-full items-center px-3.5 py-2.5 text-left text-sm transition-colors",
                      option.disabled
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer",
                      isSelected
                        ? "bg-primary text-white"
                        : "bg-surface text-foreground hover:bg-primary-light hover:text-primary",
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                );
              })
            ) : (
              <div className="px-3.5 py-2.5 text-sm text-muted">
                No options available
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}

export default Select;
