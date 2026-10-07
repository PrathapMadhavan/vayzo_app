function Button({
 children,
 variant = "primary",
 size = "md",
 type = "button",
 disabled = false,
 onClick,
 className = "",
}) {
 const baseStyles =
 "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50";

 const variants = {
 primary: "border border-transparent bg-primary text-white hover:bg-primary-hover",

 secondary:
 "border border-border bg-surface text-foreground hover:bg-primary-light",

 danger: "border border-transparent bg-danger text-white hover:bg-danger/90",
 
 "danger-soft": "border border-transparent bg-danger/15 text-danger hover:bg-danger/25",
 
 success: "border border-transparent bg-success text-white hover:bg-success/90",

 "outline-soft": "border border-border text-primary bg-transparent hover:bg-primary/5 hover:border-primary/30",
 ghost:
 "border border-transparent bg-transparent text-muted hover:bg-primary-light hover:text-primary",

 outline:
 "border-2 border-primary text-primary bg-transparent hover:bg-primary/5",
 };

 const sizes = {
 sm: "px-3 py-2 text-sm",
 md: "px-4 py-2.5 text-sm",
 lg: "px-5 py-3 text-base",
 };

 return (
 <button
 type={type}
 disabled={disabled}
 onClick={onClick}
 className={[baseStyles, variants[variant], sizes[size], className].join(
 " ",
 )}
 >
 {children}
 </button>
 );
}

export default Button;
