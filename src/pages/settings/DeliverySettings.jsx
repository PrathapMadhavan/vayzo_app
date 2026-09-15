import React, { useState } from "react";
import Button from "../../components/ui/button";
import Select from "../../components/ui/Select";
import {
  Info,
  Lock,
  MapPin,
  Banknote,
  Clock,
  X,
  ChevronDown,
} from "lucide-react";

function DeliverySettings() {
  const [toggles, setToggles] = useState({
    autoAssign: true,
    scheduleOrder: true,
    codAvailable: true,
    multiStop: false,
  });

  const [deliveryAreas, setDeliveryAreas] = useState([
    "Chennai",
    "Tambaram",
    "Velachery",
    "OMR",
    "Porur",
  ]);

  const toggleSetting = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const removeArea = (areaToRemove) => {
    setDeliveryAreas((prev) => prev.filter((area) => area !== areaToRemove));
  };

  return (
    <>
      <div className="flex-1 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">
            Delivery Configuration
          </h2>
          <p className="text-xs text-muted">
            Manage delivery preferences and related settings.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[2.5fr_1fr] items-start">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* General Delivery Settings */}
            <div className="rounded-2xl border border-border bg-surface shadow-sm">
              <div className="p-5 border-b border-border">
                <h3 className="font-semibold text-foreground">
                  General Delivery Settings
                </h3>
              </div>

              <div className="p-5 space-y-6">
                {/* Inputs Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">
                      Minimum Order Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-sm text-muted">
                        ₹
                      </span>
                      <input
                        type="text"
                        defaultValue="100.00"
                        className="w-full rounded-md border border-border bg-surface pl-7 pr-3 py-2 text-sm focus:border-primary outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">
                      Delivery Charge
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-sm text-muted">
                        ₹
                      </span>
                      <input
                        type="text"
                        defaultValue="20.00"
                        className="w-full rounded-md border border-border bg-surface pl-7 pr-3 py-2 text-sm focus:border-primary outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">
                      Free Delivery Above
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-sm text-muted">
                        ₹
                      </span>
                      <input
                        type="text"
                        defaultValue="500.00"
                        className="w-full rounded-md border border-border bg-surface pl-7 pr-3 py-2 text-sm focus:border-primary outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Inputs Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">
                      Estimated Delivery Time
                    </label>
                    <Select
                      defaultValue="30-45 Minutes"
                      className="h-[38px] text-sm"
                    >
                      <option>15-30 Minutes</option>
                      <option>30-45 Minutes</option>
                      <option>45-60 Minutes</option>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">
                      Max Delivery Distance
                    </label>
                    <Select defaultValue="10 km" className="h-[38px] text-sm">
                      <option>5 km</option>
                      <option>10 km</option>
                      <option>15 km</option>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between pt-6">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-foreground">
                        Auto Assign Delivery
                      </span>
                      <Info size={14} className="text-muted" />
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSetting("autoAssign")}
                      className={`relative h-5 w-9 rounded-full transition-colors ${toggles.autoAssign ? "bg-success" : "bg-muted"}`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${toggles.autoAssign ? "left-4.5 translate-x-4" : "left-0.5"}`}
                      />
                    </button>
                  </div>
                </div>

                {/* Toggles Row 3 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Schedule Order
                      </p>
                      <p className="text-[11px] text-muted mt-0.5">
                        Allow users to schedule orders
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSetting("scheduleOrder")}
                      className={`relative h-5 w-9 rounded-full transition-colors ${toggles.scheduleOrder ? "bg-success" : "bg-muted"}`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${toggles.scheduleOrder ? "left-4.5 translate-x-4" : "left-0.5"}`}
                      />
                    </button>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        COD Available
                      </p>
                      <p className="text-[11px] text-muted mt-0.5">
                        Allow Cash on Delivery
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSetting("codAvailable")}
                      className={`relative h-5 w-9 rounded-full transition-colors ${toggles.codAvailable ? "bg-success" : "bg-muted"}`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${toggles.codAvailable ? "left-4.5 translate-x-4" : "left-0.5"}`}
                      />
                    </button>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-foreground">
                          Multi Stop Delivery
                        </p>
                        <Info size={14} className="text-muted" />
                      </div>
                      <p className="text-[11px] text-muted mt-0.5">
                        Allow delivery partner multi stop
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSetting("multiStop")}
                      className={`relative h-5 w-9 rounded-full transition-colors ${toggles.multiStop ? "bg-success" : "bg-muted"}`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${toggles.multiStop ? "left-4.5 translate-x-4" : "left-0.5"}`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Partner Settings */}
            <div className="rounded-2xl border border-border bg-surface shadow-sm">
              <div className="p-5 border-b border-border">
                <h3 className="font-semibold text-foreground">
                  Delivery Partner Settings
                </h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">
                      Delivery Partner Commission
                    </label>
                    <Select defaultValue="10%" className="h-[38px] text-sm">
                      <option>5%</option>
                      <option>10%</option>
                      <option>15%</option>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">
                      Max Orders Per Delivery Partner
                    </label>
                    <input
                      type="number"
                      defaultValue="5"
                      className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">
                      Daily Earning Target (Optional)
                    </label>
                    <input
                      type="text"
                      defaultValue="0.00"
                      className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Areas */}
            <div className="rounded-2xl border border-border bg-surface shadow-sm">
              <div className="p-5 border-b border-border">
                <h3 className="font-semibold text-foreground">
                  Delivery Areas
                </h3>
              </div>
              <div className="p-5 space-y-6">
                <div>
                  <p className="text-xs text-muted mb-3">
                    Select areas where delivery is available.
                  </p>

                  {/* Multi Select Fake Input */}
                  <div className="flex min-h-[42px] w-full flex-wrap items-center justify-between rounded-md border border-border bg-surface px-3 py-1.5 cursor-pointer">
                    <div className="flex flex-wrap gap-2">
                      {deliveryAreas.map((area) => (
                        <div
                          key={area}
                          className="flex items-center gap-1.5 rounded bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                        >
                          <span>{area}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeArea(area);
                            }}
                            className="hover:text-primary-dark"
                          >
                            <X size={12} strokeWidth={2.5} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <ChevronDown size={16} className="text-muted" />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="button" className="bg-primary text-white px-6">
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Delivery Settings Status */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <h3 className="mb-2 font-semibold text-foreground text-sm">
                Delivery Settings Status
              </h3>
              <p className="text-xs text-muted mb-5">
                Overview of delivery configuration.
              </p>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-foreground">
                    Delivery Service
                  </span>
                  <span className="rounded bg-success/10 px-2 py-0.5 font-medium text-success">
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-foreground">
                    COD Service
                  </span>
                  <span className="rounded bg-success/10 px-2 py-0.5 font-medium text-success">
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-foreground">
                    Schedule Order
                  </span>
                  <span className="rounded bg-success/10 px-2 py-0.5 font-medium text-success">
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-foreground">
                    Free Delivery
                  </span>
                  <span className="text-muted font-medium">Above ₹500.00</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-foreground">
                    Delivery Charge
                  </span>
                  <span className="text-muted font-medium">₹20.00</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <h3 className="mb-4 font-semibold text-foreground">
                Quick Links
              </h3>

              <div className="space-y-2">
                <button className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-surface-50 group border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                      <Lock size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        Delivery Partners
                      </p>
                      <p className="text-[11px] text-muted">
                        Manage delivery partners
                      </p>
                    </div>
                  </div>
                  <ChevronDown size={14} className="text-muted -rotate-90" />
                </button>

                <button className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-surface-50 group border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                      <MapPin size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        Delivery Zones
                      </p>
                      <p className="text-[11px] text-muted">
                        Manage delivery areas
                      </p>
                    </div>
                  </div>
                  <ChevronDown size={14} className="text-muted -rotate-90" />
                </button>

                <button className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-surface-50 group border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                      <Banknote size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        Earning Settings
                      </p>
                      <p className="text-[11px] text-muted">
                        Configure earning rules
                      </p>
                    </div>
                  </div>
                  <ChevronDown size={14} className="text-muted -rotate-90" />
                </button>

                <button className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-surface-50 group border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                      <Clock size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        Delivery Time Slots
                      </p>
                      <p className="text-[11px] text-muted">
                        Manage time slots
                      </p>
                    </div>
                  </div>
                  <ChevronDown size={14} className="text-muted -rotate-90" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DeliverySettings;
