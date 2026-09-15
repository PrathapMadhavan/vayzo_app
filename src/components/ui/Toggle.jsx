import React from "react";

function Toggle({ checked, onChange, disabled = false, className = "", ...props }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={[
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-opacity-75",
        checked ? "bg-success" : "bg-muted",
        disabled ? "cursor-not-allowed opacity-50" : "",
        className
      ].filter(Boolean).join(" ")}
      {...props}
    >
      <span
        aria-hidden="true"
        className={[
          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-4" : "translate-x-0"
        ].join(" ")}
      />
    </button>
  );
}

export default Toggle;
