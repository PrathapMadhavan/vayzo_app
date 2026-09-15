function Input({ label, error, id, className = "", prefix, suffix, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}

      <div className={[
        "relative flex items-center w-full rounded-lg border bg-surface transition-colors focus-within:border-primary overflow-hidden",
        error ? "border-danger focus-within:border-danger" : "border-border"
      ].filter(Boolean).join(" ")}>
        {prefix && (
          <div className="flex h-full items-center">
            {prefix}
          </div>
        )}
        <input
          id={id}
          className={[
            "w-full bg-transparent py-2.5",
            !prefix ? "pl-3.5" : "",
            !suffix ? "pr-3.5" : "",
            "text-sm text-foreground outline-none",
            "placeholder:text-subtle",
            className,
          ].filter(Boolean).join(" ")}
          {...props}
        />
        {suffix && (
          <div className="flex h-full items-center">
            {suffix}
          </div>
        )}
      </div>

      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}

export default Input;
