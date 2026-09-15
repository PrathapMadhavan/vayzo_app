function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-primary/10 text-primary border border-primary/20",
    success: "bg-success/20 text-success border border-success/30 shadow-sm",
    warning: "bg-warning/20 text-warning border border-warning/30 shadow-sm",
    danger: "bg-danger/20 text-danger border border-danger/30 shadow-sm",
    info: "bg-info/20 text-info border border-info/30 shadow-sm",
  };

  return (
    <span
      className={[
        "inline-flex items-center justify-center rounded-md px-2.5 py-1",
        "text-xs font-medium",
        variants[variant],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export default Badge;
