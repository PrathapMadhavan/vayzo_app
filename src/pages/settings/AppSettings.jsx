import React, { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import { getAppSettings, saveAppSettings } from "../../api/settingsApi";
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
  RefreshCw,
  Save,
  AlertTriangle
} from "lucide-react";

function AppSettings() {
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");
  
  const [version, setVersion] = useState("2.4.0");
  const [forceUpdate, setForceUpdate] = useState(false);

  const [toggles, setToggles] = useState({
    maintenanceMode: false,
    userRegistration: true,
    emailVerification: true,
    phoneVerification: true,
    referralSystem: true,
    multiLanguage: true,
    darkMode: false,
  });

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getAppSettings();
        if (isMounted && data) {
          setVersion(data.version || "2.4.0");
          setForceUpdate(data.forceUpdate || false);
        }
      } catch (err) {
        console.error("Failed to load app settings", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const handleSave = async () => {
    try {
      await saveAppSettings({
        version,
        forceUpdate
      });
      setSaveMessage("App settings saved successfully.");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save app settings.");
    }
  };

  const toggleSetting = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) return <div className="p-6 text-muted">Loading settings...</div>;

  return (
    <>
      <div className="flex-1 space-y-6">
        
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex justify-between items-center w-full">
            <div>
              <h2 className="text-lg font-semibold text-foreground">App Settings</h2>
              <p className="text-xs text-muted">Manage your application basic information.</p>
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
                    <input type="text" value={version} onChange={(e) => setVersion(e.target.value)} className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none" />
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
                  <button type="button" onClick={() => toggleSetting('maintenanceMode')} className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${toggles.maintenanceMode ? "bg-primary" : "bg-muted"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${toggles.maintenanceMode ? "translate-x-[18px]" : "translate-x-0.5"}`} />
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
                  <button type="button" onClick={() => toggleSetting('userRegistration')} className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${toggles.userRegistration ? "bg-primary" : "bg-muted"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${toggles.userRegistration ? "translate-x-[18px]" : "translate-x-0.5"}`} />
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
                  <button type="button" onClick={() => toggleSetting('emailVerification')} className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${toggles.emailVerification ? "bg-primary" : "bg-muted"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${toggles.emailVerification ? "translate-x-[18px]" : "translate-x-0.5"}`} />
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
                  <button type="button" onClick={() => toggleSetting('phoneVerification')} className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${toggles.phoneVerification ? "bg-primary" : "bg-muted"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${toggles.phoneVerification ? "translate-x-[18px]" : "translate-x-0.5"}`} />
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
                  <button type="button" onClick={() => toggleSetting('referralSystem')} className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${toggles.referralSystem ? "bg-primary" : "bg-muted"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${toggles.referralSystem ? "translate-x-[18px]" : "translate-x-0.5"}`} />
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
                  <button type="button" onClick={() => toggleSetting('multiLanguage')} className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${toggles.multiLanguage ? "bg-primary" : "bg-muted"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${toggles.multiLanguage ? "translate-x-[18px]" : "translate-x-0.5"}`} />
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
                  <button type="button" onClick={() => toggleSetting('darkMode')} className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${toggles.darkMode ? "bg-primary" : "bg-muted"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${toggles.darkMode ? "translate-x-[18px]" : "translate-x-0.5"}`} />
                  </button>
                </div>

              </div>
            </div>

            {/* App Update */}
            <div className="rounded-2xl border border-border bg-surface shadow-sm p-5 relative">
              <h3 className="font-semibold text-foreground text-sm mb-1">App Update</h3>
              <p className="text-xs text-muted mb-4">Check for the latest version of the application.</p>
              
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 flex items-center justify-between max-w-2xl mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 text-primary p-1.5 rounded-full">
                    <CheckCircle size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">You are using the latest version</p>
                    <p className="text-xs text-muted mt-0.5">Current Version {version}</p>
                  </div>
                </div>
                <Button variant="outline" className="h-[36px] text-primary border-primary hover:bg-primary-light flex items-center gap-2">
                  <RefreshCw size={14} />
                  Check for Update
                </Button>
              </div>

              <div className="flex items-center justify-between pb-4 max-w-2xl border-t border-border pt-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-500/10 text-red-500 p-2 rounded-lg"><AlertTriangle size={18} /></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Force Update</p>
                    <p className="text-[11px] text-muted mt-0.5">Force all users to update their app to the latest version.</p>
                  </div>
                </div>
                <button type="button" onClick={() => setForceUpdate(!forceUpdate)} className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${forceUpdate ? "bg-primary" : "bg-muted"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${forceUpdate ? "translate-x-[18px]" : "translate-x-0.5"}`} />
                </button>
              </div>

            </div>

          </div>

          </div>
        </div>
      </div>
      </>
  );
}

export default AppSettings;
