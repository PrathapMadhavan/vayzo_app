import { ArrowLeft, FileQuestion } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";

/**
 * Standard 404 / Resource Not Found Component across all VAYZO Admin pages
 * Matches VAYZO design standards with clear typography, status icon, and navigation actions
 * @param {string} title - Heading (default: "404 - Page Not Found")
 * @param {string} message - Explanatory text
 * @param {string} backPath - Destination route when clicking back (default: navigate(-1))
 * @param {string} backLabel - Label for back button (default: "Go Back")
 * @param {string} className - Additional CSS classes
 */
export default function NotFoundState({
  title = "Page Not Found",
  message = "The page or resource you are looking for does not exist, has been removed, or is temporarily unavailable.",
  backPath,
  backLabel = "Go Back",
  className = "",
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <div
      className={`m-4 sm:m-8 flex min-h-[50vh] flex-col items-center justify-center p-6 text-center ${className}`}
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <FileQuestion size={32} />
        </div>

        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-danger/10 text-danger border border-danger/20 mb-2">
          404 Error
        </span>

        <h2 className="text-xl font-bold text-foreground">{title}</h2>

        <p className="mt-2 text-xs text-muted leading-relaxed max-w-sm mx-auto">
          {message}
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleBack}
            className="h-10 px-5 text-xs font-medium"
          >
            <ArrowLeft size={14} className="mr-1.5" />
            {backLabel}
          </Button>

          <Button
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="h-10 px-5 text-xs font-semibold bg-primary hover:bg-primary-hover text-white shadow-sm"
          >
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
