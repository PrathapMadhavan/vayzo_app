import React from "react";

/**
 * Reusable Tabs component
 * @param {Object} props
 * @param {Array<string>} props.tabs - Array of tab labels
 * @param {string} props.activeTab - Currently active tab
 * @param {Function} props.onChange - Callback when a tab is clicked
 */
function Tabs({ tabs = [], activeTab, onChange }) {
  return (
    <nav className="flex gap-6 overflow-x-auto border-b border-border text-sm font-medium text-muted scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange?.(tab)}
          className={`whitespace-nowrap border-b-2 px-1 pb-3 transition-colors ${
            activeTab === tab
              ? "border-primary text-primary font-semibold"
              : "border-transparent hover:text-foreground"
          }`}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
}

export default Tabs;
