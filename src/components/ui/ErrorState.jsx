import { RefreshCw } from "lucide-react";
import Button from "./Button";

/**
 * Standard Error State Component across all VAYZO Admin pages
 * Matches Image 2: Centered rounded red box with subtle red background and border
 * @param {string} message - Error message
 * @param {function} onRetry - Optional retry callback
 * @param {string} className - Additional CSS classes
 */
export default function ErrorState({
  message = "Unable to connect to the server. Please check your connection or server status.",
  onRetry,
  className = "",
}) {
  return (
    <div
      className={`m-4 sm:m-6 rounded-xl border border-danger/30 bg-danger/5 p-8 text-center text-sm font-medium text-danger ${className}`}
    >
      <p>{message}</p>
      {onRetry && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={onRetry}
            className="h-9 px-4 text-xs font-semibold hover:border-danger/40 hover:text-danger"
          >
            <RefreshCw size={13} className="mr-1.5" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
