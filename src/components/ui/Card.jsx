import React from "react";

function Card({ children, className = "", noPadding = false }) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface shadow-sm ${
        noPadding ? "" : "p-4"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;
