/**
 * Standard Empty State Component across all VAYZO Admin pages
 * Displays a clean message when API requests succeed with 0 results or filters yield nothing.
 * @param {string} message - Explanatory empty message (e.g. "No delivery partners found.")
 * @param {string} className - Additional CSS classes
 * @param {number|null} colSpan - If rendered inside a table <tr>, provides colSpan
 * @param {React.ReactNode} action - Optional action button or element (e.g. "Reset Filters")
 */
export default function EmptyState({
  message = "No records found.",
  className = "",
  colSpan = null,
  action = null,
}) {
  const content = (
    <div className={`p-8 text-center text-sm font-medium text-muted flex flex-col items-center justify-center gap-2 ${className}`}>
      <p>{message}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );

  if (colSpan !== null) {
    return (
      <tr>
        <td colSpan={colSpan} className="border-0 p-0">
          {content}
        </td>
      </tr>
    );
  }

  return content;
}
