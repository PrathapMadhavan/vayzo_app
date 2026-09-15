import { Search } from "lucide-react";

function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  id = "search",
  className = "",
}) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={18}
        strokeWidth={1.8}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
      />

      <input
        id={id}
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}

export default SearchInput;
