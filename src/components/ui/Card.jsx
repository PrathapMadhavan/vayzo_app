import React from "react";

function Card({ children, className = "", noPadding = false, ...props }) {
 return (
 <div
 className={`rounded-xl border border-border bg-surface shadow-sm ${
 noPadding ? "" : "p-4"
 } ${className}`}
 {...props}
 >
 {children}
 </div>
 );
}

export default Card;
