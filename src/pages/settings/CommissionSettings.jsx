import React, { useState } from "react";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Toggle from "../../components/ui/Toggle";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/button";
import { 
  Info, 
  Utensils, 
  ShoppingBag, 
  Bike, 
  Car, 
  Package, 
  Store, 
  Home, 
  CircleDollarSign,
  Banknote,
  Percent,
  CheckSquare
} from "lucide-react";

function CommissionSettings() {
  const [services, setServices] = useState([
    { id: "food", name: "Food Delivery", desc: "Restaurants orders", type: "Percentage (%)", comm: "18.00", gst: "18", active: true, icon: Utensils, iconColor: "text-orange-500", iconBg: "bg-orange-500/10" },
    { id: "buy", name: "Buy & Get It", desc: "Store pickup/delivery", type: "Percentage (%)", comm: "10.00", gst: "18", active: true, icon: ShoppingBag, iconColor: "text-green-500", iconBg: "bg-green-500/10" },
    { id: "bike", name: "Bike Ride", desc: "Ride booking", type: "Percentage (%)", comm: "15.00", gst: "18", active: true, icon: Bike, iconColor: "text-blue-500", iconBg: "bg-blue-500/10" },
    { id: "car", name: "Car Booking", desc: "Outstation / Local", type: "Percentage (%)", comm: "12.00", gst: "18", active: true, icon: Car, iconColor: "text-indigo-500", iconBg: "bg-indigo-500/10" },
    { id: "delivery", name: "Delivery Service", desc: "Parcel delivery", type: "Percentage (%)", comm: "8.00", gst: "18", active: true, icon: Package, iconColor: "text-yellow-500", iconBg: "bg-yellow-500/10" },
    { id: "dukaan", name: "Dukaan", desc: "Online store", type: "Percentage (%)", comm: "5.00", gst: "18", active: true, icon: Store, iconColor: "text-pink-500", iconBg: "bg-pink-500/10" },
    { id: "home", name: "Home Services", desc: "Service booking", type: "Percentage (%)", comm: "10.00", gst: "18", active: true, icon: Home, iconColor: "text-emerald-500", iconBg: "bg-emerald-500/10" },
  ]);

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

  const [toggles, setToggles] = useState({
    extraCod: false,
    peakTime: false,
    surge: false,
    rounded: true,
  });

  return (
    <>
      <div className="flex-1 space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">Commission Settings</h2>
          <p className="text-xs text-muted">Manage platform commission for different services and modules.</p>
        </div>

        {/* Info Alert */}
        <div className="rounded-xl border border-primary/20 bg-primary-light/10 p-3.5 flex items-center gap-3">
          <Info size={16} className="text-primary shrink-0" />
          <p className="text-[13px] font-medium text-primary">These commission values will be applied to all new orders. Existing orders will not be affected.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[2.5fr_1fr] items-start">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            
            {/* Service Wise Commission */}
            <div className="rounded-2xl border border-border bg-surface shadow-sm">
              <div className="p-5 border-b border-border">
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
                                <p className="text-[11px] text-muted">{svc.desc}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <Select 
                              value={svc.type} 
                              onChange={(e) => handleServiceChange(idx, 'type', e.target.value)}
                              className="text-xs h-9 w-32"
                            >
                              <option>Percentage (%)</option>
                              <option>Fixed (₹)</option>
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
                            <button className="text-xs font-semibold text-foreground hover:text-primary transition-colors border border-border rounded px-3 py-1.5 shadow-sm bg-white">Edit</button>
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
                    <Input type="text" defaultValue="5.00" className="!py-1.5 !px-3 !text-sm text-right font-medium" />
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
                    <Input type="text" defaultValue="100.00" className="!py-1.5 !px-3 !text-sm text-right font-medium" />
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
            </Card>

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
            <Card className="p-5">
              <h3 className="mb-5 font-semibold text-foreground">Additional Commission Settings</h3>
              
              <div className="space-y-6">
                
                {/* Extra COD */}
                <div className="pb-5 border-b border-border">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Extra Commission for COD Orders</p>
                      <p className="text-[11px] text-muted mt-1 leading-relaxed">Apply extra commission for Cash on Delivery orders.</p>
                    </div>
                    <Toggle checked={toggles.extraCod} onChange={() => setToggles(p => ({...p, extraCod: !p.extraCod}))} />
                  </div>
                  {toggles.extraCod && (
                    <div className="mt-4">
                      <label className="text-xs text-muted mb-1 block">Extra Commission (%)</label>
                      <Input type="text" defaultValue="0" className="!py-2 !text-sm" suffix={<span className="text-sm text-muted">%</span>} />
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
                    <Toggle checked={toggles.peakTime} onChange={() => setToggles(p => ({...p, peakTime: !p.peakTime}))} />
                  </div>
                  {toggles.peakTime && (
                    <div className="mt-4">
                      <label className="text-xs text-muted mb-1 block">Extra Commission (%)</label>
                      <Input type="text" defaultValue="0" className="!py-2 !text-sm" suffix={<span className="text-sm text-muted">%</span>} />
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
                    <Toggle checked={toggles.surge} onChange={() => setToggles(p => ({...p, surge: !p.surge}))} />
                  </div>
                  {toggles.surge && (
                    <div className="mt-4">
                      <label className="text-xs text-muted mb-1 block">Surge Commission (%)</label>
                      <Input type="text" defaultValue="0" className="!py-2 !text-sm" suffix={<span className="text-sm text-muted">%</span>} />
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
                    <Toggle checked={toggles.rounded} onChange={() => setToggles(p => ({...p, rounded: !p.rounded}))} />
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
