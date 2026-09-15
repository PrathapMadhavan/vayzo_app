import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import Card from "./Card";

function StatCard({
  title,
  value,
  trend,
  icon: Icon,
  colorClass = "text-primary",
  bgClass = "bg-primary-light",
  className = "",
  variant = "vertical",
  isNegative: explicitIsNegative,
}) {
  const isPositive = trend && trend.includes("+");
  const isNegative = explicitIsNegative !== undefined ? explicitIsNegative : (trend && trend.includes("-"));

  if (variant === "compact") {
    return (
      <Card className={`p-3 ${className}`}>
        <div className="flex items-center gap-2 h-12">
          {Icon && <Icon size={17} strokeWidth={1.8} className={colorClass} />}
          <span className="text-xs text-muted">{title}</span>
        </div>
        <div className="mt-2">
          <span className="text-xl font-semibold text-foreground">{value}</span>
        </div>
      </Card>
    );
  }

  if (variant === "horizontal") {
    return (
      <Card className={`p-4 flex items-center gap-4 ${className}`}>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bgClass} ${colorClass}`}>
          {Icon && <Icon size={24} />}
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-[11px] xl:text-xs font-medium text-muted mb-1 whitespace-nowrap tracking-tight">{title}</p>
          <h3 className="text-xl font-bold text-foreground leading-none mb-1.5">{value}</h3>
          {trend && (
            <span className="flex items-center text-xs font-medium text-muted mt-1 whitespace-nowrap truncate">
              <span className={`flex items-center ${isNegative ? "text-danger" : "text-success"} mr-1 font-semibold`}>
                {isNegative ? <TrendingDown size={14} className="mr-0.5" /> : <TrendingUp size={14} className="mr-0.5" />}
                {trend.replace("-", "").replace("+", "").trim()}
              </span>
              <span className="truncate">from last month</span>
            </span>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className={`flex flex-col justify-between relative overflow-hidden ${className}`}>
      {/* Decorative SVG wave for visual polish */}
      <div className="absolute -bottom-6 -right-6 opacity-5 pointer-events-none">
        <svg width="120" height="120" viewBox="0 0 100 100" fill="currentColor" className={colorClass}>
           <path d="M0,50 C20,30 40,70 60,40 C80,10 100,50 100,50 L100,100 L0,100 Z" />
        </svg>
      </div>

      <div className="flex flex-col z-10">
        <p className="text-sm font-medium text-muted">{title}</p>
        <h3 className="mt-2 text-2xl font-bold text-foreground">{value}</h3>
      </div>

      <div className="mt-4 flex items-center justify-between z-10">
        {trend ? (
          <span
            className={`flex items-center text-xs font-medium ${
              isNegative ? "text-danger" : "text-success"
            }`}
          >
            {isNegative ? (
              <TrendingDown size={14} className="mr-1" />
            ) : (
              <TrendingUp size={14} className="mr-1" />
            )}
            {trend}
          </span>
        ) : (
          <div></div>
        )}
        <div className={`rounded-full p-2 ${bgClass} ${colorClass}`}>
          {Icon && <Icon size={20} />}
        </div>
      </div>
    </Card>
  );
}

export default StatCard;
