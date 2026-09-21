import React, { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import { getDeliverySettings, saveDeliverySettings } from "../../api/settingsApi";
import { 
  Info, 
  Lock, 
  MapPin, 
  Banknote, 
  Clock, 
  X,
  ChevronDown,
  Save
} from "lucide-react";

function DeliverySettings() {
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");
  
  const [baseFee, setBaseFee] = useState("20.00");
  const [deliveryRadius, setDeliveryRadius] = useState("10");

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

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getDeliverySettings();
        if (isMounted && data) {
          setBaseFee(data.baseFee ? data.baseFee.toString() : "20.00");
          setDeliveryRadius(data.deliveryRadius ? data.deliveryRadius.toString() : "10");
        }
      } catch (err) {
        console.error("Failed to load delivery settings", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const toggleSetting = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const removeArea = (areaToRemove) => {
    setDeliveryAreas((prev) => prev.filter((area) => area !== areaToRemove));
  };

  const handleSave = async () => {
    try {
      await saveDeliverySettings({
        baseFee: parseFloat(baseFee) || 0,
        deliveryRadius: parseFloat(deliveryRadius) || 0,
      });
      setSaveMessage("Delivery settings saved successfully.");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save delivery settings.");
    }
  };

  if (loading) return <div className="p-6 text-muted">Loading settings...</div>;

  return (
    <>
      <div className="flex-1 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex justify-between items-center w-full">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Delivery Configuration</h2>
              <p className="text-xs text-muted">Manage delivery preferences and related settings.</p>
            </div>
            <Button type="button" onClick={handleSave} size="sm" className="bg-primary text-white flex items-center gap-2">
              <Save size={16} /> Save Changes
            </Button>
          </div>
        </div>

        {saveMessage && (
          <div className="rounded-xl border border-success/30 bg-success/5 p-4 text-sm font-medium text-success">
            {saveMessage}
          </div>
        )}

        <div className="flex justify-center mt-4">
          <div className="space-y-6 w-full max-w-4xl">
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
                      <span className="absolute left-3 top-2 text-sm text-muted">₹</span>
                      <input type="text" value={baseFee} onChange={(e) => setBaseFee(e.target.value)} className="w-full rounded-md border border-border bg-surface pl-7 pr-3 py-2 text-sm focus:border-primary outline-none" />
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
                    <label className="text-xs font-medium text-foreground mb-2 block">Max Delivery Distance</label>
                    <div className="relative">
                      <input type="text" value={deliveryRadius} onChange={(e) => setDeliveryRadius(e.target.value)} className="w-full rounded-md border border-border bg-surface pl-3 pr-8 py-2 text-sm focus:border-primary outline-none" />
                      <span className="absolute right-3 top-2 text-sm text-muted">km</span>
                    </div>
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
                      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${toggles.autoAssign ? "bg-success" : "bg-muted"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${toggles.autoAssign ? "translate-x-[18px]" : "translate-x-0.5"}`}
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
                      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${toggles.scheduleOrder ? "bg-success" : "bg-muted"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${toggles.scheduleOrder ? "translate-x-[18px]" : "translate-x-0.5"}`}
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
                      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${toggles.codAvailable ? "bg-success" : "bg-muted"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${toggles.codAvailable ? "translate-x-[18px]" : "translate-x-0.5"}`}
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
                      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${toggles.multiStop ? "bg-success" : "bg-muted"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${toggles.multiStop ? "translate-x-[18px]" : "translate-x-0.5"}`}
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

          </div>
        </div>
      </div>`r`n      </>
  );
}

export default DeliverySettings;
