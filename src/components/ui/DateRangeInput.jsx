import { useState, useEffect } from "react";
import { CalendarDays } from "lucide-react";

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateDisplay(dateStr) {
  if (!dateStr || dateStr.length !== 10) return dateStr;
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
}

function parseDateValue(displayStr) {
  if (!displayStr) return "";
  const parts = displayStr.split("-");
  if (parts.length === 3 && parts[2].length === 4 && parts[1].length === 2 && parts[0].length === 2) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return "";
}

function CustomDateInput({ id, value, min, max, onChange, placeholder }) {
  const [displayValue, setDisplayValue] = useState(() => formatDateDisplay(value));

  useEffect(() => {
    setDisplayValue(formatDateDisplay(value));
  }, [value]);

  const handleTextChange = (e) => {
    const val = e.target.value;
    let raw = val.replace(/[^\d]/g, "");
    let formatted = "";

    if (raw.length > 0) {
      let day = raw.substring(0, 2);
      if (day.length === 2 && parseInt(day, 10) > 31) day = "31";
      if (day.length === 2 && parseInt(day, 10) === 0) day = "01";
      formatted += day;
    }
    if (raw.length > 2) {
      let month = raw.substring(2, 4);
      if (month.length === 2 && parseInt(month, 10) > 12) month = "12";
      if (month.length === 2 && parseInt(month, 10) === 0) month = "01";
      formatted += "-" + month;
    }
    if (raw.length > 4) {
      formatted += "-" + raw.substring(4, 8);
    }

    setDisplayValue(formatted);

    if (formatted.length === 10) {
      const parsed = parseDateValue(formatted);
      if (parsed) {
        let finalVal = parsed;
        if (max && parsed > max) {
          finalVal = max;
        }
        if (min && parsed < min) {
          finalVal = min;
        }
        if (finalVal !== parsed) {
          setDisplayValue(formatDateDisplay(finalVal));
        }
        onChange({ target: { value: finalVal } });
      }
    } else if (formatted.length === 0) {
      onChange({ target: { value: "" } });
    }
  };

  const handleDateChange = (e) => {
    const val = e.target.value;
    if (val) {
      let finalVal = val;
      if (max && val > max) finalVal = max;
      if (min && val < min) finalVal = min;
      onChange({ target: { value: finalVal } });
    } else {
      onChange({ target: { value: "" } });
    }
  };

  return (
    <div className="flex flex-1 items-center">
      <div className="relative mr-2 flex shrink-0 items-center" title="Select Date">
        <CalendarDays
          size={17}
          strokeWidth={1.8}
          className="text-muted transition-colors hover:text-foreground"
        />
        <input
          type="date"
          value={value || ""}
          min={min}
          max={max}
          onChange={handleDateChange}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
      <input
        id={id}
        type="text"
        value={displayValue}
        onChange={handleTextChange}
        placeholder={placeholder || "DD-MM-YYYY"}
        maxLength={10}
        className="w-full bg-transparent p-0 text-xs text-foreground outline-none placeholder:text-muted/50"
      />
    </div>
  );
}

function DateRangeInput({
  label = "",
  fromValue = "",
  toValue = "",
  onFromChange,
  onToChange,
  id = "date-range",
  className = "",
}) {
  const today = getToday();

  const handleFromChange = (event) => {
    const newFrom = event.target.value;

    if (newFrom && toValue && newFrom.length === 10 && toValue.length === 10) {
      if (newFrom > toValue) {
        onToChange?.({
          target: {
            value: "",
          },
        });
      }
    }

    onFromChange?.(event);
  };

  const handleToChange = (event) => {
    const newTo = event.target.value;

    if (fromValue && newTo && fromValue.length === 10 && newTo.length === 10) {
      if (newTo < fromValue) {
        return;
      }
    }

    onToChange?.(event);
  };

  return (
    <div className={["w-full lg:w-auto", className].filter(Boolean).join(" ")}>
      {label && (
        <label
          htmlFor={`${id}-from`}
          className="mb-1.5 block text-xs font-medium text-muted"
        >
          {label}
        </label>
      )}

      <div
        className={[
          "flex h-10 items-center rounded-lg border bg-background px-3",
          "text-xs transition focus-within:ring-1",
          "border-border focus-within:border-primary focus-within:ring-primary",
        ].join(" ")}
      >
        <CustomDateInput
          id={`${id}-from`}
          value={fromValue}
          max={today}
          onChange={handleFromChange}
          placeholder="From Date"
        />

        <span className="mx-1.5 shrink-0 text-xs text-muted">–</span>

        <CustomDateInput
          id={`${id}-to`}
          value={toValue}
          min={fromValue || undefined}
          max={today}
          onChange={handleToChange}
          placeholder="To Date"
        />
      </div>
    </div>
  );
}

export default DateRangeInput;
