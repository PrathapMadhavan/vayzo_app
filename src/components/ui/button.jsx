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
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover",

    secondary:
      "border border-border bg-surface text-foreground hover:bg-primary-light",

    danger: "bg-danger text-white hover:bg-danger/90",
    
    success: "bg-success text-white hover:bg-success/90",

    ghost:
      "bg-transparent text-muted hover:bg-primary-light hover:text-primary",

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
