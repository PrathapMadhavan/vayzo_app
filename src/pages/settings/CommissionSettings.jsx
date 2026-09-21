import React, { useState, useEffect } from "react";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Toggle from "../../components/ui/Toggle";
import Card from "../../components/ui/Card";
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



  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getCommissionSettings();
        if (isMounted && data) {
          setServices([
            { id: "restaurantCommission", name: "Food Delivery", desc: "Restaurants orders", type: data.restaurantCommissionType || "Percentage (%)", comm: data.restaurantCommission || "0", gst: data.restaurantGst || "18", active: data.restaurantActive !== false, icon: Utensils, iconColor: "text-orange-500", iconBg: "bg-orange-500/10" },
            { id: "deliveryCommission", name: "Delivery Service", desc: "Parcel delivery", type: data.deliveryCommissionType || "Percentage (%)", comm: data.deliveryCommission || "0", gst: data.deliveryGst || "18", active: data.deliveryActive !== false, icon: Package, iconColor: "text-yellow-500", iconBg: "bg-yellow-500/10" },
          ]);
          setRules({
            minCommission: data.minCommission || "5.00",
            maxCommission: data.maxCommission || "100.00",
            applyOn: data.applyOn || "Subtotal",
            applicability: data.applicability || "All Orders"
          });
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

  const [rules, setRules] = useState({
    minCommission: "5.00",
    maxCommission: "100.00",
    applyOn: "Subtotal",
    applicability: "All Orders"
  });

  const handleSave = async (event) => {
    if (event) event.preventDefault();
    try {
      const dataToSave = {
        restaurantCommission: parseFloat(services[0].comm) || 0,
        restaurantCommissionType: services[0].type,
        restaurantGst: parseFloat(services[0].gst) || 0,
        restaurantActive: services[0].active,
        
        deliveryCommission: parseFloat(services[1].comm) || 0,
        deliveryCommissionType: services[1].type,
        deliveryGst: parseFloat(services[1].gst) || 0,
        deliveryActive: services[1].active,

        minCommission: parseFloat(rules.minCommission) || 0,
        maxCommission: parseFloat(rules.maxCommission) || 0,
        applyOn: rules.applyOn,
        applicability: rules.applicability
      };
      await saveCommissionSettings(dataToSave);
      setSaveMessage("Changes saved successfully.");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      console.error("Failed to save", err);
    }
  };

  const handleUpdateSingleService = async (index) => {
    try {
      const svc = services[index];
      const dataToPatch = {};
      if (svc.id === "restaurantCommission") {
        dataToPatch.restaurantCommission = parseFloat(svc.comm) || 0;
        dataToPatch.restaurantCommissionType = svc.type;
        dataToPatch.restaurantGst = parseFloat(svc.gst) || 0;
        dataToPatch.restaurantActive = svc.active;
      } else {
        dataToPatch.deliveryCommission = parseFloat(svc.comm) || 0;
        dataToPatch.deliveryCommissionType = svc.type;
        dataToPatch.deliveryGst = parseFloat(svc.gst) || 0;
        dataToPatch.deliveryActive = svc.active;
      }
      await saveCommissionSettings(dataToPatch);
      setSaveMessage(`${svc.name} updated successfully.`);
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      console.error("Failed to update service", err);
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

        <div className="mt-4">
          
          {/* MAIN CONTENT AREA */}
          <div className="space-y-6 w-full">
            
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
                            <div className="w-24">
                              <Input 
                                type="text" 
                                value={svc.comm} 
                                onChange={(e) => handleServiceChange(idx, 'comm', e.target.value)}
                                className="!py-1.5 !px-3 !text-xs text-right"
                                suffix={<span className="text-xs text-muted">%</span>}
                              />
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <div className="w-20">
                              <Input 
                                type="text" 
                                value={svc.gst} 
                                onChange={(e) => handleServiceChange(idx, 'gst', e.target.value)}
                                className="!py-1.5 !px-3 !text-xs text-right"
                                suffix={<span className="text-xs text-muted">%</span>}
                              />
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <Toggle checked={svc.active} onChange={() => toggleServiceStatus(idx)} />
                          </td>
                          <td className="py-4 pl-2 text-right">
                            <Button type="button" onClick={() => handleUpdateSingleService(idx)} variant="secondary" size="sm" className="h-8 text-xs hover:text-primary">Update</Button>
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
              </div>
            </div>

            {/* Commission Rules */}
            <Card className="p-5">
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
                  <div className="flex items-center gap-3 w-32">
                    <Input 
                      type="number" 
                      value={rules.minCommission} 
                      onChange={(e) => setRules(p => ({ ...p, minCommission: e.target.value }))}
                      className="!py-1.5 !px-3 !text-sm text-right font-medium" 
                    />
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
                  <div className="flex items-center gap-3 w-32">
                    <Input 
                      type="number" 
                      value={rules.maxCommission} 
                      onChange={(e) => setRules(p => ({ ...p, maxCommission: e.target.value }))}
                      className="!py-1.5 !px-3 !text-sm text-right font-medium" 
                    />
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
                      <input 
                        type="radio" 
                        name="applyOn" 
                        checked={rules.applyOn === "Subtotal"}
                        onChange={() => setRules(p => ({ ...p, applyOn: "Subtotal" }))}
                        className="text-primary focus:ring-primary h-4 w-4" 
                      />
                      <span className="text-foreground font-medium text-xs">Subtotal <span className="text-muted font-normal">(Before Delivery Charge)</span></span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="applyOn" 
                        checked={rules.applyOn === "Total"}
                        onChange={() => setRules(p => ({ ...p, applyOn: "Total" }))}
                        className="text-primary focus:ring-primary h-4 w-4" 
                      />
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
                      <input 
                        type="radio" 
                        name="applicability" 
                        checked={rules.applicability === "All Orders"}
                        onChange={() => setRules(p => ({ ...p, applicability: "All Orders" }))}
                        className="text-primary focus:ring-primary h-4 w-4" 
                      />
                      <span className="text-foreground font-medium text-xs">All Orders</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="applicability" 
                        checked={rules.applicability === "Only Completed Orders"}
                        onChange={() => setRules(p => ({ ...p, applicability: "Only Completed Orders" }))}
                        className="text-primary focus:ring-primary h-4 w-4" 
                      />
                      <span className="text-foreground font-medium text-xs">Only Completed Orders</span>
                    </label>
                  </div>
                </div>
              </div>
            </Card>

          </div>
        </div>
            

      </div>
    </>
  );
}

export default CommissionSettings;
