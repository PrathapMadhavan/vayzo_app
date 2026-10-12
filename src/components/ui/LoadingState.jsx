import { RefreshCw } from "lucide-react";

/**
 * Standard Loading State Component across all VAYZO Admin pages
 * Matches Image 1: Centered purple spinning icon with clean text below
 * @param {string} message - Display message (e.g., "Loading activity logs...")
 * @param {string} className - Additional CSS classes
 * @param {boolean} minHeight - Optional min-height class, default "min-h-64"
 */
export default function LoadingState({
  message = "Loading...",
  className = "",
  minHeight = "min-h-64",
}) {
  return (
    <div
      className={`flex ${minHeight} w-full items-center justify-center bg-surface p-6 ${className}`}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted">{message}</p>
      </div>
    </div>
  );
}
