import Badge from "./Badge";

/**
 * Renders a badge in a table cell that is precisely as wide as the widest badge in that column.
 * By rendering the widest text invisibly in the same CSS grid cell, the cell stretches 
 * exactly to fit the widest content. The actual badge then fills 100% of that cell, 
 * perfectly standardizing widths without hardcoding magic numbers.
 */
function BadgeCell({ content, maxContent, variant = "default", className = "" }) {
  return (
    <div className="grid place-items-center w-full">
      {/* Invisible element sets the exact width based on the longest badge content */}
      <div 
        className="invisible col-start-1 row-start-1 px-2.5 py-1 text-xs font-medium whitespace-nowrap border border-transparent"
        aria-hidden="true"
      >
        {maxContent}
      </div>
      
      {/* Actual visible badge spans the full width of the cell defined above */}
      <Badge 
        variant={variant} 
        className={`col-start-1 row-start-1 w-full text-center ${className}`}
      >
        {content}
      </Badge>
    </div>
  );
}

export default BadgeCell;
