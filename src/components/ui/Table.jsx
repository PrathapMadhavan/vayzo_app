import { ChevronLeft, ChevronRight } from "lucide-react";

function Table({
  headers,
  children,
  currentCount,
  totalCount,
  minWidth = "900px",
  className = "",
  currentPage = 1,
  totalPages = 1,
  itemsPerPage = 20,
  onPageChange = () => {},
}) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const pages = getPageNumbers();

  // Determine starting and ending record indices safely
  const startIndex = Math.min(
    (currentPage - 1) * itemsPerPage + 1,
    totalCount > 0 ? totalCount : 0,
  );
  const endIndex = Math.min(currentPage * itemsPerPage, totalCount);

  return (
    <div
      className={[
        "w-full overflow-clip rounded-xl border border-border bg-surface shadow-sm",
        className,
      ].join(" ")}
    >
      <div className="w-full overflow-auto no-scrollbar max-h-[600px] relative">
        <div style={{ minWidth }} className="flex flex-col">
          <table className="w-full border-collapse text-left text-xs relative">
            <thead className="bg-surface border-b border-border shadow-sm sticky top-0 z-10">
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    className="whitespace-nowrap px-4 py-4 font-semibold text-foreground"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="[&_tr]:h-16 [&_td]:align-middle [&_tr]:transition-colors [&_tr:hover]:bg-primary-light [&_tr]:border-b [&_tr]:border-border last:[&_tr]:border-b-1">
              {children}
            </tbody>
          </table>
        </div>
      </div>

      {/* Structured pagination footer */}
      <div className="border-t border-border bg-surface px-5 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xs text-muted font-medium">
          Showing {startIndex} to {endIndex} of {totalCount} results
        </p>

        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || totalCount === 0}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted hover:bg-background transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>

          {pages.map((p, index) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="flex h-8 w-4 items-center justify-center text-muted"
                >
                  ...
                </span>
              );
            }
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`flex h-8 min-w-[32px] px-2 items-center justify-center rounded-md transition ${
                  currentPage === p
                    ? "bg-primary text-white shadow-sm"
                    : "text-foreground hover:bg-background border border-transparent"
                }`}
              >
                {p}
              </button>
            );
          })}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalCount === 0}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-foreground hover:bg-background transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Table;
