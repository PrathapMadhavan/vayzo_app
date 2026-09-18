import { useState } from "react";
import { Filter, X, RotateCcw } from "lucide-react";
import Button from "./Button";

export default function FilterPanel({ search, actions, filters, hasActiveFilters, onReset }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-4">
      {/* Top Row: Search | Filters Toggle | Primary Actions */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 sm:gap-4 justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 flex-1">
          <div className="w-full sm:max-w-sm flex-1">
            {search}
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            {(filters || hasActiveFilters) && (
              <Button 
                variant={isOpen || hasActiveFilters ? "primary" : "secondary"}
                onClick={() => setIsOpen(!isOpen)}
                className="flex-1 sm:flex-none w-full sm:w-auto h-10 flex items-center justify-center gap-2 shrink-0 text-sm"
              >
                {isOpen ? <X size={16} strokeWidth={2} /> : <Filter size={16} strokeWidth={2} />}
                <span className="hidden sm:inline">{isOpen ? "Hide Filters" : "Filters"}</span>
                <span className="sm:hidden">Filters</span>
              </Button>
            )}
            
            {/* Show actions directly next to Filters on mobile if there's enough space, or keep them separate */}
            <div className="sm:hidden flex-1 flex items-center gap-2">
               {actions}
            </div>
          </div>
        </div>

        {actions && (
          <div className="hidden sm:flex flex-row items-center gap-3 shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Expanded Filters Row */}
      {isOpen && (
        <div className="pt-2">
          <div className="flex flex-col lg:flex-row lg:items-end gap-4 lg:flex-nowrap">
            {filters}
            
            {hasActiveFilters && onReset && (
              <Button
                variant="secondary"
                onClick={onReset}
                className="h-10 w-max sm:w-auto shrink-0"
              >
                <RotateCcw size={16} strokeWidth={2} className="mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
