import React, { useState } from "react";
import Button from "../../components/ui/button";
import Select from "../../components/ui/Select";
import { 
  Wrench,
  UserPlus,
  Mail,
  Smartphone,
  Gift,
  Globe,
  Moon,
  CheckCircle,
  Clock,
  Server,
  Database,
  Code,
  Trash2,
  Zap,
  Download,
  RotateCcw,
  ChevronRight,
  RefreshCw
} from "lucide-react";

function AppSettings() {
  const [toggles, setToggles] = useState({
    maintenanceMode: false,
    userRegistration: true,
    emailVerification: true,
    phoneVerification: true,
    referralSystem: true,
    multiLanguage: true,
    darkMode: false,
  });

  const toggleSetting = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <div className="flex-1 space-y-6">
        
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">App Settings</h2>
          <p className="text-xs text-muted">Manage your application basic information.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[2.5fr_1fr] items-start">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            
            {/* Application Information */}
            <div className="rounded-2xl border border-border bg-surface shadow-sm">
              <div className="p-5 border-b border-border">
                <h3 className="font-semibold text-foreground text-sm">Application Information</h3>
                <p className="text-xs text-muted mt-1">Manage your application basic information.</p>
              </div>
              
              <div className="p-5 flex flex-col md:flex-row gap-8">
                
                {/* Logo Upload Area */}
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <div className="h-28 w-28 rounded-2xl bg-primary flex items-center justify-center text-white text-5xl font-bold shadow-md">
                    V
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-primary cursor-pointer hover:underline">Change Logo</p>
                    <p className="text-[10px] text-muted mt-1">PNG, JPG or SVG<br/>(Max. 2MB)</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">Application Name</label>
                    <input type="text" defaultValue="Vayzo Delivery" className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">Application Tagline</label>
                    <input type="text" defaultValue="Fast. Reliable. Delivered." className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">Application Version</label>
                    <input type="text" defaultValue="2.4.0" className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">Support Email</label>
                    <input type="text" defaultValue="support@vayzo.com" className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">Default Timezone</label>
                    <Select defaultValue="(GMT +05:30) Asia/Kolkata" className="h-[38px] text-sm">
                      <option>(GMT +05:30) Asia/Kolkata</option>
                      <option>(GMT +00:00) UTC</option>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">Date Format</label>
                    <Select defaultValue="DD MMM YYYY" className="h-[38px] text-sm">
                      <option>DD MMM YYYY</option>
                      <option>MM/DD/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">Time Format</label>
                    <Select defaultValue="12 Hour (hh:mm AM/PM)" className="h-[38px] text-sm">
                      <option>12 Hour (hh:mm AM/PM)</option>
                      <option>24 Hour (HH:mm)</option>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">Currency</label>
                    <Select defaultValue="INR (₹) - Indian Rupee" className="h-[38px] text-sm">
                      <option>INR (₹) - Indian Rupee</option>
                      <option>USD ($) - US Dollar</option>
                      <option>EUR (€) - Euro</option>
                    </Select>
                  </div>
                </div>

              </div>
            </div>

            {/* Application Preferences */}
            <div className="rounded-2xl border border-border bg-surface shadow-sm p-5">
              <h3 className="font-semibold text-foreground text-sm mb-1">Application Preferences</h3>
              <p className="text-xs text-muted mb-6">Manage general application behavior and preferences.</p>
              
              <div className="space-y-6">
                
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-500/10 text-orange-500 p-2 rounded-lg"><Wrench size={18} /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Maintenance Mode</p>
                      <p className="text-[11px] text-muted mt-0.5">Enable maintenance mode to disable the app for users.</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => toggleSetting('maintenanceMode')} className={`relative h-5 w-9 rounded-full transition-colors ${toggles.maintenanceMode ? "bg-primary" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${toggles.maintenanceMode ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500/10 text-green-500 p-2 rounded-lg"><UserPlus size={18} /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Allow User Registration</p>
                      <p className="text-[11px] text-muted mt-0.5">Allow new users to register on the platform.</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => toggleSetting('userRegistration')} className={`relative h-5 w-9 rounded-full transition-colors ${toggles.userRegistration ? "bg-primary" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${toggles.userRegistration ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 text-blue-500 p-2 rounded-lg"><Mail size={18} /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Email Verification</p>
                      <p className="text-[11px] text-muted mt-0.5">Require email verification for new user registration.</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => toggleSetting('emailVerification')} className={`relative h-5 w-9 rounded-full transition-colors ${toggles.emailVerification ? "bg-primary" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${toggles.emailVerification ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-500/10 text-yellow-500 p-2 rounded-lg"><Smartphone size={18} /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Phone Verification</p>
                      <p className="text-[11px] text-muted mt-0.5">Require phone verification for new user registration.</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => toggleSetting('phoneVerification')} className={`relative h-5 w-9 rounded-full transition-colors ${toggles.phoneVerification ? "bg-primary" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${toggles.phoneVerification ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-500/10 text-purple-500 p-2 rounded-lg"><Gift size={18} /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Referral System</p>
                      <p className="text-[11px] text-muted mt-0.5">Enable referral system for users.</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => toggleSetting('referralSystem')} className={`relative h-5 w-9 rounded-full transition-colors ${toggles.referralSystem ? "bg-primary" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${toggles.referralSystem ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="bg-teal-500/10 text-teal-500 p-2 rounded-lg"><Globe size={18} /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Multi Language Support</p>
                      <p className="text-[11px] text-muted mt-0.5">Allow users to select their preferred language.</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => toggleSetting('multiLanguage')} className={`relative h-5 w-9 rounded-full transition-colors ${toggles.multiLanguage ? "bg-primary" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${toggles.multiLanguage ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-500/10 text-indigo-500 p-2 rounded-lg"><Moon size={18} /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Dark Mode</p>
                      <p className="text-[11px] text-muted mt-0.5">Enable dark mode option in the application.</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => toggleSetting('darkMode')} className={`relative h-5 w-9 rounded-full transition-colors ${toggles.darkMode ? "bg-primary" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${toggles.darkMode ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                  </button>
                </div>

              </div>
            </div>

            {/* App Update */}
            <div className="rounded-2xl border border-border bg-surface shadow-sm p-5 relative">
              <h3 className="font-semibold text-foreground text-sm mb-1">App Update</h3>
              <p className="text-xs text-muted mb-4">Check for the latest version of the application.</p>
              
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 flex items-center justify-between max-w-2xl">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 text-primary p-1.5 rounded-full">
                    <CheckCircle size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">You are using the latest version</p>
                    <p className="text-xs text-muted mt-0.5">Current Version 2.4.0</p>
                  </div>
                </div>
                <Button variant="outline" className="h-[36px] text-primary border-primary hover:bg-primary-light flex items-center gap-2">
                  <RefreshCw size={14} />
                  Check for Update
                </Button>
              </div>

              {/* Position absolute to match the design placing save at bottom right */}
              <div className="absolute right-5 bottom-5">
                <Button type="button" className="bg-primary text-white px-6">
                  Save Changes
                </Button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            
            {/* App Status */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <h3 className="mb-2 font-semibold text-foreground text-sm">App Status</h3>
              <p className="text-[11px] text-muted mb-5">Overview of your application status.</p>
              
              <div className="bg-success/5 border border-success/20 rounded-lg p-3 mb-6 flex items-start gap-3">
                <div className="bg-success/20 text-success p-1 rounded-full mt-0.5">
                  <CheckCircle size={14} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-success">Application is Active</p>
                  <p className="text-[10px] text-muted mt-0.5">Your application is running smoothly.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 text-muted">
                    <Globe size={14} />
                    <span>Environment</span>
                  </div>
                  <span className="font-medium text-foreground">Production</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 text-muted">
                    <Clock size={14} />
                    <span>Last Update</span>
                  </div>
                  <span className="font-medium text-foreground">2 days ago</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 text-muted">
                    <Server size={14} />
                    <span>Installed On</span>
                  </div>
                  <span className="font-medium text-foreground">12 Jan 2024</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 text-muted">
                    <Database size={14} />
                    <span>Database Version</span>
                  </div>
                  <span className="font-medium text-foreground">v4.8.1</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 text-muted">
                    <Code size={14} />
                    <span>PHP Version</span>
                  </div>
                  <span className="font-medium text-foreground">8.2.12</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <h3 className="mb-4 font-semibold text-foreground text-sm">Quick Actions</h3>
              
              <div className="space-y-2">
                <button className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-surface-50 group border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                      <Trash2 size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Clear Cache</p>
                      <p className="text-[11px] text-muted">Clear application cache</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted" />
                </button>
                
                <button className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-surface-50 group border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                      <Zap size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Optimize App</p>
                      <p className="text-[11px] text-muted">Optimize database and files</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted" />
                </button>

                <button className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-surface-50 group border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                      <Download size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Export Settings</p>
                      <p className="text-[11px] text-muted">Download app configuration</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted" />
                </button>

                <button className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-surface-50 group border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                      <RotateCcw size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Reset Settings</p>
                      <p className="text-[11px] text-muted">Reset all settings to default</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted" />
                </button>
              </div>
            </div>

            {/* Social Links */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <h3 className="mb-1 font-semibold text-foreground text-sm">Social Links</h3>
              <p className="text-[11px] text-muted mb-5">Manage social media links for your app.</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <label className="text-xs font-medium text-foreground w-16">Facebook</label>
                  <input type="text" defaultValue="https://facebook.com/vayzo" className="flex-1 rounded-md border border-border bg-surface px-3 py-1.5 text-xs focus:border-primary outline-none" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <label className="text-xs font-medium text-foreground w-16">Twitter</label>
                  <input type="text" defaultValue="https://twitter.com/vayzo" className="flex-1 rounded-md border border-border bg-surface px-3 py-1.5 text-xs focus:border-primary outline-none" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <label className="text-xs font-medium text-foreground w-16">Instagram</label>
                  <input type="text" defaultValue="https://instagram.com/vayzo" className="flex-1 rounded-md border border-border bg-surface px-3 py-1.5 text-xs focus:border-primary outline-none" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <label className="text-xs font-medium text-foreground w-16">LinkedIn</label>
                  <input type="text" defaultValue="https://linkedin.com/company/vayzo" className="flex-1 rounded-md border border-border bg-surface px-3 py-1.5 text-xs focus:border-primary outline-none" />
                </div>
              </div>

              <div className="flex justify-end pt-5">
                <Button type="button" className="bg-primary text-white text-xs px-4 py-1.5 h-auto">
                  Save Social Links
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default AppSettings;
