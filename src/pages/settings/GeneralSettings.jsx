import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Bell,
  CreditCard,
  Database,
  FileText,
  Globe,
  LayoutGrid,
  Mail,
  MonitorCog,
  Settings as SettingsIcon,
  Shield,
  Smartphone,
  TrendingUp,
  Truck,
} from "lucide-react";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/input";
import Select from "../../components/ui/Select";
import { getGeneralSettings, saveGeneralSettings } from "../../api/settingsApi";

function GeneralSettings() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState({
    platformName: "",
    platformTagline: "",
    supportEmail: "",
    supportPhone: "",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "12h",
    defaultCurrency: "INR",
    currencyPosition: "before",
    numberFormat: "1,234.56",
    language: "English",
    contactAddress: "",
    facebook: "",
    instagram: "",
    twitter: "",
    platformStatus: true,
    maintenanceMode: false,
  });
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getGeneralSettings();
        if (isMounted && data) {
          setFormValues({
            platformName: data.platformName || "",
            platformTagline: data.platformTagline || "",
            supportEmail: data.supportEmail || "",
            supportPhone: data.supportPhone || "",
            timezone: data.timezone || "Asia/Kolkata",
            dateFormat: data.dateFormat || "DD/MM/YYYY",
            timeFormat: data.timeFormat || "12h",
            defaultCurrency: data.defaultCurrency || "INR",
            currencyPosition: data.currencyPosition || "before",
            numberFormat: data.numberFormat || "1,234.56",
            language: data.language || "English",
            contactAddress: data.contactAddress || "",
            facebook: data.facebook || "",
            instagram: data.instagram || "",
            twitter: data.twitter || "",
            platformStatus: data.platformStatus ?? true,
            maintenanceMode: data.maintenanceMode ?? false,
          });
        }
      } catch (err) {
        console.error("Failed to load general settings", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (saveMessage) setSaveMessage("");
  };

  const handleSave = async (event) => {
    if (event) event.preventDefault();
    try {
      await saveGeneralSettings(formValues);
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
            {/* TOP SECTION: General Settings (Left) | Site Status & Quick Links (Right) */}
            <div className="grid gap-6 xl:grid-cols-[2.5fr_1fr]">
              
              {/* Left Column: General Settings */}
              <form onSubmit={handleSave} className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex flex-col gap-1 border-b border-border pb-4">
                  <h2 className="text-lg font-semibold text-foreground">General Settings</h2>
                  <p className="text-xs text-muted">Manage your platform general settings and preferences.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Left Inner Column */}
                  <div className="space-y-4">
                    <Input id="platformName" label="Platform Name *" value={formValues.platformName} onChange={(event) => handleChange("platformName", event.target.value)} />
                    <Input id="platformTagline" label="Platform Tagline" value={formValues.platformTagline} onChange={(event) => handleChange("platformTagline", event.target.value)} />
                    <Input id="supportEmail" label="Support Email *" type="email" value={formValues.supportEmail} onChange={(event) => handleChange("supportEmail", event.target.value)} />
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Support Phone *</label>
                      <div className="flex rounded-lg border border-border focus-within:border-primary">
                        <div className="flex items-center gap-2 border-r border-border bg-surface px-3 py-2 text-sm">
                          <span className="text-lg">🇮🇳</span><span>+91</span>
                          <svg className="h-4 w-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                        </div>
                        <input type="text" value={formValues.supportPhone} onChange={(e) => handleChange("supportPhone", e.target.value)} className="w-full rounded-r-lg bg-surface px-3 py-2 text-sm outline-none" placeholder="98765 43210" />
                      </div>
                    </div>
                    <Select id="timezone" label="Default Timezone *" value={formValues.timezone} onChange={(event) => handleChange("timezone", event.target.value)}>
                      <option value="Asia/Kolkata">(GMT+05:30) Asia/Kolkata</option>
                    </Select>
                    <Select id="dateFormat" label="Date Format" value={formValues.dateFormat} onChange={(event) => handleChange("dateFormat", event.target.value)}>
                      <option value="DD/MM/YYYY">DD MMM YYYY (12 May 2024)</option>
                    </Select>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">Time Format</label>
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                          <input type="radio" name="timeFormat" className="h-4 w-4 text-primary focus:ring-primary" defaultChecked />
                          <span className="text-primary font-medium">12 Hours (02:30 PM)</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                          <input type="radio" name="timeFormat" className="h-4 w-4 border-muted focus:ring-primary" />
                          <span>24 Hours (14:30)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Right Inner Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Platform Logo</label>
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-32 items-center justify-center rounded-lg border border-border bg-surface shadow-sm">
                          <span className="text-xl font-bold text-foreground">VAYZO</span>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button type="button" variant="outline" size="sm" className="w-fit rounded-full border-primary/20 px-4 text-primary hover:bg-primary-light">Change Logo</Button>
                          <span className="text-[10px] text-muted">PNG, JPG or SVG (Max 2MB)</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Favicon</label>
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary shadow-md shadow-primary/20">
                          <span className="text-xl font-bold text-white">V</span>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button type="button" variant="outline" size="sm" className="w-fit rounded-full border-primary/20 px-4 text-primary hover:bg-primary-light">Change Favicon</Button>
                          <span className="text-[10px] text-muted">ICO, PNG (Max 1MB)</span>
                        </div>
                      </div>
                    </div>
                    <Select id="defaultCurrency" label="Default Currency *" value={formValues.defaultCurrency} onChange={(event) => handleChange("defaultCurrency", event.target.value)}>
                      <option value="INR">INR (₹) - Indian Rupee</option>
                    </Select>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">Currency Position</label>
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                          <input type="radio" name="currencyPosition" className="h-4 w-4 text-primary focus:ring-primary" defaultChecked />
                          <span className="text-primary font-medium">Before Amount (₹100)</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                          <input type="radio" name="currencyPosition" className="h-4 w-4 border-muted focus:ring-primary" />
                          <span>After Amount (100₹)</span>
                        </label>
                      </div>
                    </div>
                    <Select id="numberFormat" label="Number Format" value={formValues.numberFormat} onChange={(event) => handleChange("numberFormat", event.target.value)}>
                      <option value="1,234.56">1,234.56.78</option>
                    </Select>
                    <Select id="language" label="Language" value={formValues.language} onChange={(event) => handleChange("language", event.target.value)}>
                      <option value="English">English</option>
                    </Select>
                    
                    <div className="pt-2 flex justify-end">
                      <Button type="submit" size="md" className="bg-primary text-white px-8">Save Changes</Button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Right Column: Site Status & Quick Links */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                  <h3 className="mb-4 text-base font-semibold text-foreground">Site Status</h3>
                  <p className="mb-4 text-xs text-muted">Turn your platform on/off for users.</p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Platform Status</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium ${formValues.platformStatus ? "text-success" : "text-muted"}`}>
                          {formValues.platformStatus ? "Active" : "Offline"}
                        </span>
                        <button type="button" aria-label="Toggle platform status" onClick={() => handleChange("platformStatus", !formValues.platformStatus)} className={`relative h-5 w-9 rounded-full transition-colors ${formValues.platformStatus ? "bg-success" : "bg-muted"}`}>
                          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${formValues.platformStatus ? "left-4.5" : "left-0.5"}`} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Maintenance Mode</p>
                        <p className="text-[10px] text-muted leading-tight mt-1">Enable maintenance mode to restrict<br/>access to the platform.</p>
                      </div>
                      <button type="button" aria-label="Toggle maintenance mode" onClick={() => handleChange("maintenanceMode", !formValues.maintenanceMode)} className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${formValues.maintenanceMode ? "bg-primary" : "bg-muted"}`}>
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${formValues.maintenanceMode ? "left-4.5" : "left-0.5"}`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                  <h3 className="mb-4 text-base font-semibold text-foreground">Quick Links</h3>
                  <div className="space-y-2 text-sm text-muted">
                    <a href="#" className="flex items-center gap-3 rounded-lg px-2 py-2 text-primary hover:bg-primary-light">
                      <div className="bg-primary-light/30 p-1.5 rounded text-primary"><LayoutGrid size={16} /></div>
                      <div>
                        <span className="block font-medium">Clear Cache</span>
                        <span className="block text-xs text-muted">Clear system cache</span>
                      </div>
                    </a>
                    <a href="#" className="flex items-center gap-3 rounded-lg px-2 py-2 text-primary hover:bg-primary-light">
                      <div className="bg-primary-light/30 p-1.5 rounded text-primary"><Database size={16} /></div>
                      <div>
                        <span className="block font-medium">System Backup</span>
                        <span className="block text-xs text-muted">Download system backup</span>
                      </div>
                    </a>
                    <a href="#" className="flex items-center gap-3 rounded-lg px-2 py-2 text-primary hover:bg-primary-light">
                      <div className="bg-primary-light/30 p-1.5 rounded text-primary"><Database size={16} /></div>
                      <div>
                        <span className="block font-medium">Database Backup</span>
                        <span className="block text-xs text-muted">Download database backup</span>
                      </div>
                    </a>
                    <a href="#" className="flex items-center gap-3 rounded-lg px-2 py-2 text-primary hover:bg-primary-light">
                      <div className="bg-primary-light/30 p-1.5 rounded text-primary"><FileText size={16} /></div>
                      <div>
                        <span className="block font-medium">System Logs</span>
                        <span className="block text-xs text-muted">View system logs</span>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM SECTION: 4 Columns */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 items-start">
              
              {/* Contact Address */}
              <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-sm">
                <div>
                  <h3 className="mb-4 text-base font-semibold text-foreground">Contact Address</h3>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3">
                      <label className="text-sm font-medium text-foreground">Complete Address</label>
                      <textarea 
                        className="w-full rounded-lg border border-border bg-surface p-3 text-sm outline-none focus:border-primary min-h-[140px]" 
                        placeholder="e.g. 123, Anna Salai, Teynampet, Chennai, Tamil Nadu 600018, India"
                        value={formValues.contactAddress}
                        onChange={(e) => handleChange("contactAddress", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-center">
                  <Button type="button" onClick={handleSave} size="sm" className="w-[80%] bg-primary text-white">Save Changes</Button>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-sm">
                <div>
                  <h3 className="mb-4 text-base font-semibold text-foreground">Social Links</h3>
                  <div className="space-y-3">
                    <Input id="facebookUrl" label="Facebook" value={formValues.facebook} onChange={(e) => handleChange("facebook", e.target.value)} />
                    <Input id="instagramUrl" label="Instagram" value={formValues.instagram} onChange={(e) => handleChange("instagram", e.target.value)} />
                    <Input id="twitterUrl" label="Twitter" value={formValues.twitter} onChange={(e) => handleChange("twitter", e.target.value)} />
                  </div>
                </div>
                <div className="mt-6 flex justify-center">
                  <Button type="button" onClick={handleSave} size="sm" className="w-[80%] bg-primary text-white">Save Changes</Button>
                </div>
              </div>

            </div>
          </div>
    </>
  );
}

export default GeneralSettings;
