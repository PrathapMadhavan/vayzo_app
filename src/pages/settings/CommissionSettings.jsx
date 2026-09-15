import React, { useState, useEffect } from "react";
import Input from "../../components/ui/input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import { getCommissionSettings, saveCommissionSettings } from "../../api/settingsApi";
import { 
  Info, 
  Utensils, 
  Package, 
  CircleDollarSign,
  Percent,
  CheckSquare
} from "lucide-react";

function CommissionSettings() {
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");
  const [services, setServices] = useState([
    { id: "restaurantCommission", name: "Food Delivery", desc: "Restaurants orders", type: "Percentage (%)", comm: "15", gst: "18", active: true, icon: Utensils, iconColor: "text-orange-500", iconBg: "bg-orange-500/10" },
    { id: "deliveryCommission", name: "Delivery Service", desc: "Parcel delivery", type: "Percentage (%)", comm: "10", gst: "18", active: true, icon: Package, iconColor: "text-yellow-500", iconBg: "bg-yellow-500/10" },
  ]);

  const [toggles, setToggles] = useState({
    extraCod: false,
    peakTime: false,
    surge: false,
    rounded: true,
  });

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getCommissionSettings();
        if (isMounted && data) {
          setServices([
            { id: "restaurantCommission", name: "Food Delivery", desc: "Restaurants orders", type: "Percentage (%)", comm: data.restaurantCommission || "0", gst: "18", active: true, icon: Utensils, iconColor: "text-orange-500", iconBg: "bg-orange-500/10" },
            { id: "deliveryCommission", name: "Delivery Service", desc: "Parcel delivery", type: "Percentage (%)", comm: data.deliveryCommission || "0", gst: "18", active: true, icon: Package, iconColor: "text-yellow-500", iconBg: "bg-yellow-500/10" },
          ]);
        }
      } catch (err) {
        console.error("Failed to load commission settings", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const toggleServiceStatus = (index) => {
    const newServices = [...services];
    newServices[index].active = !newServices[index].active;
    setServices(newServices);
  };

  const handleServiceChange = (index, field, value) => {
    const newServices = [...services];
    newServices[index][field] = value;
    setServices(newServices);
  };

  const handleSave = async (event) => {
    if (event) event.preventDefault();
    try {
      const dataToSave = {
        restaurantCommission: parseFloat(services[0].comm) || 0,
        deliveryCommission: parseFloat(services[1].comm) || 0,
      };
      await saveCommissionSettings(dataToSave);
      setSaveMessage("Changes saved successfully.");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      console.error("Failed to save", err);
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
              <h2 className="text-lg font-semibold text-foreground">Commission Settings</h2>
              <p className="text-xs text-muted">Manage platform commission for different services and modules.</p>
            </div>
            <Button type="button" onClick={handleSave} size="sm" className="bg-primary text-white flex items-center gap-2">
              <CheckSquare size={16} /> Save Changes
            </Button>
          </div>
        </div>

        {/* Info Alert */}
        <div className="rounded-xl border border-primary/20 bg-primary-light/10 p-3.5 flex items-center gap-3 mt-4">
          <Info size={16} className="text-primary shrink-0" />
          <p className="text-[13px] font-medium text-primary">These commission values will be applied to all new orders. Existing orders will not be affected.</p>
        </div>

        {saveMessage && (
          <div className="rounded-xl border border-success/30 bg-success/5 p-4 text-sm font-medium text-success mt-4">
            {saveMessage}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[2.5fr_1fr] items-start mt-4">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            
            {/* Service Wise Commission */}
            <div className="rounded-2xl border border-border bg-surface shadow-sm">
              <div className="p-5 border-b border-border flex justify-between items-center">
                <h3 className="font-semibold text-foreground">Service Wise Commission</h3>
              </div>
              
              <div className="p-5 overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border pb-2 text-xs font-semibold text-foreground">
                      <th className="pb-3 w-48">Service</th>
                      <th className="pb-3 px-2 w-36">Commission Type</th>
                      <th className="pb-3 px-2 w-32 flex items-center gap-1">Platform Commission <Info size={12} className="text-muted" /></th>
                      <th className="pb-3 px-2 w-28"><div className="flex items-center gap-1">GST (%) <Info size={12} className="text-muted" /></div></th>
                      <th className="pb-3 px-2 w-20">Status</th>
                      <th className="pb-3 pl-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {services.map((svc, idx) => {
                      const Icon = svc.icon;
                      return (
                        <tr key={svc.id}>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${svc.iconBg} ${svc.iconColor}`}>
                                <Icon size={18} />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground text-[13px]">{svc.name}</p>
                                <p className="text-[10px] text-muted">{svc.desc}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <Select className="h-9 text-xs" value={svc.type} onChange={(e) => handleServiceChange(idx, "type", e.target.value)}>
                              <option>Percentage (%)</option>
                              <option>Fixed Amount (₹)</option>
                            </Select>
                          </td>
                          <td className="py-4 px-2">
                            <Input className="h-9 text-xs font-medium" value={svc.comm} onChange={(e) => handleServiceChange(idx, "comm", e.target.value)} />
                          </td>
                          <td className="py-4 px-2">
                            <Input className="h-9 text-xs" value={svc.gst} onChange={(e) => handleServiceChange(idx, "gst", e.target.value)} />
                          </td>
                          <td className="py-4 px-2">
                            <button type="button" onClick={() => toggleServiceStatus(idx)} className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${svc.active ? "bg-success" : "bg-muted"}`}>
                              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${svc.active ? "left-4.5" : "left-0.5"}`} />
                            </button>
                          </td>
                          <td className="py-4 pl-2 text-right">
                            <Button variant="secondary" size="sm" className="h-8 text-xs hover:text-primary">Update</Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-5 border-t border-border flex items-center justify-between bg-surface-50">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Info size={14} />
                  <span>Commission will be calculated on the order amount (after discounts).</span>
                </div>
                <Button size="sm" className="bg-primary text-white">Save All Changes</Button>
              </div>
            </div>

            {/* Commission Rules */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <h3 className="mb-5 font-semibold text-foreground">Commission Rules</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary p-2 rounded-lg"><CircleDollarSign size={18} /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Minimum Commission Per Order</p>
                      <p className="text-xs text-muted mt-0.5">Set minimum commission amount per order.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted font-medium">Amount (₹)</span>
                    <input type="text" defaultValue="5.00" className="w-24 rounded-md border border-border bg-surface px-3 py-1.5 text-sm focus:border-primary outline-none text-right font-medium" />
                  </div>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary p-2 rounded-lg"><CircleDollarSign size={18} /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Maximum Commission Per Order</p>
                      <p className="text-xs text-muted mt-0.5">Set maximum commission amount per order.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted font-medium">Amount (₹)</span>
                    <input type="text" defaultValue="100.00" className="w-24 rounded-md border border-border bg-surface px-3 py-1.5 text-sm focus:border-primary outline-none text-right font-medium" />
                  </div>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="bg-pink-500/10 text-pink-500 p-2 rounded-lg"><Percent size={18} /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Apply Commission On</p>
                      <p className="text-xs text-muted mt-0.5">Select on which amount commission should be applied.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="applyOn" className="text-primary focus:ring-primary h-4 w-4" defaultChecked />
                      <span className="text-foreground font-medium text-xs">Subtotal <span className="text-muted font-normal">(Before Delivery Charge)</span></span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="applyOn" className="text-primary focus:ring-primary h-4 w-4" />
                      <span className="text-foreground font-medium text-xs">Total <span className="text-muted font-normal">(After Delivery Charge)</span></span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-500/10 text-purple-500 p-2 rounded-lg"><CheckSquare size={18} /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Commission Applicability</p>
                      <p className="text-xs text-muted mt-0.5">Choose when commission should be applicable.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="applicability" className="text-primary focus:ring-primary h-4 w-4" defaultChecked />
                      <span className="text-foreground font-medium text-xs">All Orders</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="applicability" className="text-primary focus:ring-primary h-4 w-4" />
                      <span className="text-foreground font-medium text-xs">Only Completed Orders</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            
            {/* Calculation Example */}
            <div className="rounded-2xl border border-success/20 bg-[#f6fbf7] p-5 shadow-sm">
              <h3 className="mb-4 font-semibold text-foreground text-sm">Commission Calculation Example</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-foreground text-xs">Order Amount</span>
                  <span className="font-medium">₹500.00</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted font-medium">Platform Commission (18%)</span>
                  <span className="text-foreground">- ₹90.00</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted font-medium">GST (18% on Commission)</span>
                  <span className="text-foreground">- ₹16.20</span>
                </div>
                <div className="pt-3 border-t border-success/20 flex justify-between items-center">
                  <span className="font-semibold text-success text-[13px]">You Will Get</span>
                  <span className="font-semibold text-success">₹393.80</span>
                </div>
              </div>
            </div>

            {/* Additional Settings */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <h3 className="mb-5 font-semibold text-foreground">Additional Commission Settings</h3>
              
              <div className="space-y-6">
                
                {/* Extra COD */}
                <div className="pb-5 border-b border-border">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Extra Commission for COD Orders</p>
                      <p className="text-[11px] text-muted mt-1 leading-relaxed">Apply extra commission for Cash on Delivery orders.</p>
                    </div>
                    <button type="button" onClick={() => setToggles(p => ({...p, extraCod: !p.extraCod}))} className={`shrink-0 relative h-5 w-9 rounded-full transition-colors ${toggles.extraCod ? "bg-success" : "bg-muted"}`}>
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${toggles.extraCod ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                    </button>
                  </div>
                  {toggles.extraCod && (
                    <div className="mt-4">
                      <label className="text-xs text-muted mb-1 block">Extra Commission (%)</label>
                      <div className="relative">
                        <input type="text" defaultValue="0" className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none" />
                        <span className="absolute right-3 top-2 text-sm text-muted">%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Peak Time */}
                <div className="pb-5 border-b border-border">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Peak Time Commission</p>
                      <p className="text-[11px] text-muted mt-1 leading-relaxed">Apply extra commission during peak hours.</p>
                    </div>
                    <button type="button" onClick={() => setToggles(p => ({...p, peakTime: !p.peakTime}))} className={`shrink-0 relative h-5 w-9 rounded-full transition-colors ${toggles.peakTime ? "bg-success" : "bg-muted"}`}>
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${toggles.peakTime ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                    </button>
                  </div>
                  {toggles.peakTime && (
                    <div className="mt-4">
                      <label className="text-xs text-muted mb-1 block">Extra Commission (%)</label>
                      <div className="relative">
                        <input type="text" defaultValue="0" className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none" />
                        <span className="absolute right-3 top-2 text-sm text-muted">%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Surge */}
                <div className="pb-5 border-b border-border">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Surge Commission</p>
                      <p className="text-[11px] text-muted mt-1 leading-relaxed">Enable surge commission for high demand.</p>
                    </div>
                    <button type="button" onClick={() => setToggles(p => ({...p, surge: !p.surge}))} className={`shrink-0 relative h-5 w-9 rounded-full transition-colors ${toggles.surge ? "bg-success" : "bg-muted"}`}>
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${toggles.surge ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                    </button>
                  </div>
                  {toggles.surge && (
                    <div className="mt-4">
                      <label className="text-xs text-muted mb-1 block">Surge Commission (%)</label>
                      <div className="relative">
                        <input type="text" defaultValue="0" className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none" />
                        <span className="absolute right-3 top-2 text-sm text-muted">%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Rounded Off */}
                <div>
                  <div className="flex justify-between items-center gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Rounded Off</p>
                      <p className="text-[11px] text-muted mt-0.5">Round off commission to nearest rupee.</p>
                    </div>
                    <button type="button" onClick={() => setToggles(p => ({...p, rounded: !p.rounded}))} className={`shrink-0 relative h-5 w-9 rounded-full transition-colors ${toggles.rounded ? "bg-success" : "bg-muted"}`}>
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${toggles.rounded ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default CommissionSettings;
