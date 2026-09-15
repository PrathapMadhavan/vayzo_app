function TableFooter({ currentCount, totalCount }) {
  return (
    <div className="flex items-center justify-between border-t border-border bg-surface px-4 py-3">
      <p className="text-xs text-muted">
        Showing{" "}
        <span className="font-medium text-foreground">{currentCount}</span> of{" "}
        <span className="font-medium text-foreground">{totalCount}</span>{" "}
        results
      </p>
    </div>
  );
}

export default TableFooter;
