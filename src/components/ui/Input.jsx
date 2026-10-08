function Input({ label, error, id, className = "", prefix, suffix, ...props }) {
 return (
 <div className="w-full">
 {label && (
 <label
 htmlFor={id}
 className={["mb-1.5 block text-sm font-medium", props.disabled ? "text-muted" : "text-foreground"].filter(Boolean).join(" ")}
 >
 {label}
 </label>
 )}

 <div className={[
 "relative flex items-center w-full rounded-lg border transition-colors overflow-hidden",
 props.disabled ? "bg-background opacity-50 cursor-not-allowed border-border" : "bg-surface focus-within:border-primary",
 error ? "border-danger" : (!props.disabled ? "border-border" : "")
 ].filter(Boolean).join(" ")}>
 {prefix && (
 <div className="flex h-full items-center">
 {prefix}
 </div>
 )}
 <input
 id={id}
 className={[
 "w-full min-w-0 bg-transparent py-2.5",
 !prefix ? "pl-3.5" : "",
 !suffix ? "pr-3.5" : "",
 "text-sm outline-none",
 props.disabled ? "text-muted cursor-not-allowed" : "text-foreground",
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
