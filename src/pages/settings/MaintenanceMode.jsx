import React, { useState } from "react";
import Button from "../../components/ui/button";
import Select from "../../components/ui/Select";
import { 
  Shield, 
  Sun, 
  Moon, 
  Droplets, 
  Image as ImageIcon, 
  Calendar, 
  Eye, 
  Save, 
  Monitor, 
  Tablet, 
  Smartphone,
  Info,
  Lock,
  Settings,
  Edit3,
  CheckSquare,
  X
} from "lucide-react";

function MaintenanceMode() {
  const [maintenanceOn, setMaintenanceOn] = useState(true);
  const [bgStyle, setBgStyle] = useState("light");
  const [deviceView, setDeviceView] = useState("monitor");
  const [ips, setIps] = useState(["127.0.0.1"]);

  const removeIp = (ipToRemove) => {
    setIps(ips.filter(ip => ip !== ipToRemove));
  };

  return (
    <>
      <div className="flex-1 space-y-6 pb-10">
        
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">Maintenance Mode</h2>
          <p className="text-xs text-muted">Manage your website's maintenance state.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[2.5fr_1fr] items-start">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            
            {/* Master Toggle Card */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Shield size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">Maintenance Mode</h3>
                  <p className="text-[11px] text-muted mt-1">Enable maintenance mode to notify users that we'll be back soon.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 pl-4">
                <span className="text-xs font-semibold text-foreground">Maintenance Mode</span>
                <button type="button" onClick={() => setMaintenanceOn(!maintenanceOn)} className={`relative h-6 w-11 rounded-full transition-colors ${maintenanceOn ? "bg-primary" : "bg-muted"}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${maintenanceOn ? "left-5.5 translate-x-5" : "left-0.5"}`} />
                </button>
                <span className={`text-xs font-bold ${maintenanceOn ? "text-primary" : "text-muted"}`}>{maintenanceOn ? "ON" : "OFF"}</span>
              </div>
            </div>

            {/* General Settings */}
            <div className="rounded-2xl border border-border bg-surface shadow-sm p-5 relative">
              <h3 className="font-semibold text-foreground text-sm mb-6">General Settings</h3>
              
              <div className="space-y-6">
                
                {/* Title */}
                <div>
                  <label className="text-xs font-medium text-foreground mb-2 block">Title</label>
                  <input type="text" defaultValue="We'll Be Back Soon!" className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none" />
                  <p className="text-[10px] text-muted text-right mt-1">19 / 60</p>
                </div>

                {/* Message */}
                <div>
                  <label className="text-xs font-medium text-foreground mb-2 block">Message</label>
                  <textarea rows="4" defaultValue="We're currently performing some scheduled maintenance. We apologize for the inconvenience. Please try again later." className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none resize-none" />
                  <p className="text-[10px] text-muted text-right mt-1">102 / 200</p>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">Estimated Time</label>
                    <div className="relative flex items-center">
                      <input type="text" defaultValue="25 May 2024" className="w-full rounded-md border border-border bg-surface pl-10 pr-3 py-2 text-sm focus:border-primary outline-none" />
                      <Calendar size={14} className="absolute left-3 text-muted" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block invisible">Time</label>
                    <input type="text" defaultValue="04:30 PM" className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">Timezone</label>
                    <Select defaultValue="(GMT +05:30) Asia/Kolkata" className="h-[38px] text-sm">
                      <option>(GMT +05:30) Asia/Kolkata</option>
                      <option>(GMT +00:00) UTC</option>
                    </Select>
                  </div>
                </div>

                {/* Background Style */}
                <div>
                  <label className="text-xs font-medium text-foreground mb-2 block">Background Style</label>
                  <div className="flex flex-wrap gap-4">
                    <label className={`cursor-pointer border rounded-lg px-4 py-3 flex flex-col items-center justify-center gap-2 transition-all w-28 ${bgStyle === 'light' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-surface hover:bg-surface-50'}`} onClick={() => setBgStyle('light')}>
                      <div className="relative w-full flex justify-center">
                        <div className={`absolute -top-1 -left-1 h-3 w-3 rounded-full border-2 ${bgStyle === 'light' ? 'border-primary flex items-center justify-center' : 'border-border'}`}>
                          {bgStyle === 'light' && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                        </div>
                        <Sun size={20} />
                      </div>
                      <span className="text-[11px] font-medium mt-1 text-foreground">Light</span>
                    </label>

                    <label className={`cursor-pointer border rounded-lg px-4 py-3 flex flex-col items-center justify-center gap-2 transition-all w-28 ${bgStyle === 'dark' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-surface hover:bg-surface-50'}`} onClick={() => setBgStyle('dark')}>
                      <div className="relative w-full flex justify-center">
                        <div className={`absolute -top-1 -left-1 h-3 w-3 rounded-full border-2 ${bgStyle === 'dark' ? 'border-primary flex items-center justify-center' : 'border-border'}`}>
                          {bgStyle === 'dark' && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                        </div>
                        <Moon size={20} />
                      </div>
                      <span className="text-[11px] font-medium mt-1 text-foreground">Dark</span>
                    </label>

                    <label className={`cursor-pointer border rounded-lg px-4 py-3 flex flex-col items-center justify-center gap-2 transition-all w-28 ${bgStyle === 'gradient' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-surface hover:bg-surface-50'}`} onClick={() => setBgStyle('gradient')}>
                      <div className="relative w-full flex justify-center">
                        <div className={`absolute -top-1 -left-1 h-3 w-3 rounded-full border-2 ${bgStyle === 'gradient' ? 'border-primary flex items-center justify-center' : 'border-border'}`}>
                          {bgStyle === 'gradient' && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                        </div>
                        <Droplets size={20} />
                      </div>
                      <span className="text-[11px] font-medium mt-1 text-foreground">Gradient</span>
                    </label>

                    <label className={`cursor-pointer border rounded-lg px-4 py-3 flex flex-col items-center justify-center gap-2 transition-all w-28 ${bgStyle === 'image' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-surface hover:bg-surface-50'}`} onClick={() => setBgStyle('image')}>
                      <div className="relative w-full flex justify-center">
                        <div className={`absolute -top-1 -left-1 h-3 w-3 rounded-full border-2 ${bgStyle === 'image' ? 'border-primary flex items-center justify-center' : 'border-border'}`}>
                          {bgStyle === 'image' && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                        </div>
                        <ImageIcon size={20} />
                      </div>
                      <span className="text-[11px] font-medium mt-1 text-foreground">Image</span>
                    </label>
                  </div>
                </div>

                {/* Allow Access */}
                <div className="pb-16">
                  <label className="text-xs font-semibold text-foreground block">Allow Access (Optional)</label>
                  <p className="text-[11px] text-muted mt-1 mb-3">Add IP addresses to allow access to the website even in maintenance mode.</p>
                  
                  <div className="flex items-center gap-3 max-w-lg mb-3">
                    <input type="text" placeholder="Enter IP address" className="flex-1 rounded-md border border-border bg-surface px-3 h-[38px] text-sm focus:border-primary outline-none" />
                    <Button type="button" className="bg-primary/90 text-white px-6 h-[38px]">
                      Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {ips.map((ip) => (
                      <span key={ip} className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[11px] font-medium px-2.5 py-1 rounded-md">
                        {ip}
                        <button type="button" onClick={() => removeIp(ip)} className="hover:text-primary-light">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="absolute right-5 bottom-5 flex items-center gap-3">
                <Button variant="outline" className="border-border text-foreground hover:bg-surface-50 flex items-center gap-2">
                  <Eye size={14} /> Preview
                </Button>
                <Button className="bg-primary text-white flex items-center gap-2">
                  <Save size={14} /> Save Changes
                </Button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            
            {/* Live Preview */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="mb-1 font-semibold text-foreground text-sm">Live Preview</h3>
                  <p className="text-[10px] text-muted">See how your maintenance page will look.</p>
                </div>
                <div className="flex items-center rounded-lg border border-border overflow-hidden">
                  <button onClick={() => setDeviceView('monitor')} className={`p-1.5 ${deviceView === 'monitor' ? 'bg-primary text-white' : 'bg-surface text-muted hover:text-foreground'}`}>
                    <Monitor size={14} />
                  </button>
                  <button onClick={() => setDeviceView('tablet')} className={`p-1.5 border-l border-r border-border ${deviceView === 'tablet' ? 'bg-primary text-white' : 'bg-surface text-muted hover:text-foreground'}`}>
                    <Tablet size={14} />
                  </button>
                  <button onClick={() => setDeviceView('mobile')} className={`p-1.5 ${deviceView === 'mobile' ? 'bg-primary text-white' : 'bg-surface text-muted hover:text-foreground'}`}>
                    <Smartphone size={14} />
                  </button>
                </div>
              </div>
              
              {/* Preview Container */}
              <div className="flex flex-col items-center justify-center text-center px-2 py-6 border border-border/50 rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                
                {/* Graphics */}
                <div className="relative mb-6">
                  {/* Cogs & Wrench mockup (Simulated with simple SVG structure) */}
                  <svg width="100" height="80" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="40" r="16" fill="#f4f7ff" stroke="#e0e7ff" strokeWidth="2" />
                    <path d="M40 30L60 50M60 30L40 50" stroke="#8b5cf6" strokeWidth="6" strokeLinecap="round" />
                    <circle cx="35" cy="25" r="8" fill="#e0e7ff" />
                    <circle cx="65" cy="20" r="10" fill="#f4f7ff" stroke="#e0e7ff" strokeWidth="2" />
                    <circle cx="70" cy="55" r="6" fill="#e0e7ff" />
                    <path d="M30 55L70 25" stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </div>

                <h2 className="text-xl font-bold text-foreground mb-3">We'll Be Back Soon!</h2>
                <p className="text-[11px] text-muted max-w-[250px] leading-relaxed mb-8">
                  We're currently performing some scheduled maintenance. We apologize for the inconvenience. Please try again later.
                </p>

                {/* Countdown */}
                <div className="flex items-center justify-center gap-3 mb-8 w-full max-w-[320px]">
                  <div className="flex flex-col items-center justify-center bg-surface border border-border rounded-lg w-16 h-16">
                    <span className="text-lg font-bold text-primary">01</span>
                    <span className="text-[9px] text-muted">Days</span>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-surface border border-border rounded-lg w-16 h-16">
                    <span className="text-lg font-bold text-primary">02</span>
                    <span className="text-[9px] text-muted">Hours</span>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-surface border border-border rounded-lg w-16 h-16">
                    <span className="text-lg font-bold text-primary">15</span>
                    <span className="text-[9px] text-muted">Minutes</span>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-surface border border-border rounded-lg w-16 h-16">
                    <span className="text-lg font-bold text-primary">40</span>
                    <span className="text-[9px] text-muted">Seconds</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-[10px] text-muted">
                  <Calendar size={12} />
                  <span>25 May 2024, 04:30 PM (IST)</span>
                </div>
              </div>
            </div>

            {/* Maintenance Mode Info */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary/10 text-primary p-1 rounded-full">
                  <Info size={14} />
                </div>
                <h4 className="font-semibold text-foreground text-sm">Maintenance Mode Info</h4>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-primary">
                    <Lock size={14} />
                  </div>
                  <span className="text-[11px] text-muted leading-tight">Only administrators will be able to access the dashboard.</span>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-primary">
                    <Eye size={14} />
                  </div>
                  <span className="text-[11px] text-muted leading-tight">Users will see the maintenance page.</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-primary">
                    <Edit3 size={14} />
                  </div>
                  <span className="text-[11px] text-muted leading-tight">You can customize the content and appearance of the page.</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-primary">
                    <CheckSquare size={14} />
                  </div>
                  <span className="text-[11px] text-muted leading-tight">Don't forget to disable maintenance mode after the work is done.</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default MaintenanceMode;
