import { useState, useEffect } from "react";
import {
  Globe,
  Mail,
  Search,
  Map,
  Palette,
  Share2,
  Grid,
  Trash2,
  Upload,
  ExternalLink,
  RotateCcw,
  MonitorCog,
  ChevronRight,
  ShieldCheck,
  Folder,
  CheckSquare
} from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { getGeneralSettings, saveGeneralSettings } from "../../api/settingsApi";

function SiteSettings() {
  const userStr = localStorage.getItem("vayzo_admin_user");
  const user = userStr ? JSON.parse(userStr) : {};
  const [activeTab, setActiveTab] = useState("General");
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState({
    siteName: "",
    tagline: "",
    siteEmail: "",
    sitePhone: "",
    siteAddress: "",
    siteTimezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    currency: "INR",
    currencyPosition: "Prefix",
  });

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getGeneralSettings();
        if (isMounted && data) {
          setFormValues({
            siteName: data.platformName || "",
            tagline: data.platformTagline || "",
            siteEmail: data.supportEmail || "",
            sitePhone: data.supportPhone || "",
            siteAddress: data.contactAddress || "",
            siteTimezone: data.timezone || "Asia/Kolkata",
            dateFormat: data.dateFormat || "DD/MM/YYYY",
            currency: data.defaultCurrency || "INR",
            currencyPosition: data.currencyPosition || "Prefix",
          });
        }
      } catch (err) {
        console.error("Failed to load site settings", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      const data = await getGeneralSettings();
      if (data) {
        setFormValues({
          siteName: data.platformName || "",
          tagline: data.platformTagline || "",
          siteEmail: data.supportEmail || "",
          sitePhone: data.supportPhone || "",
          siteAddress: data.contactAddress || "",
          siteTimezone: data.timezone || "Asia/Kolkata",
          dateFormat: data.dateFormat || "DD/MM/YYYY",
          currency: data.defaultCurrency || "INR",
          currencyPosition: data.currencyPosition || "Prefix",
        });
      }
      alert("Settings reset to original values.");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await saveGeneralSettings({
        platformName: formValues.siteName,
        platformTagline: formValues.tagline,
        supportEmail: formValues.siteEmail,
        supportPhone: formValues.sitePhone,
        contactAddress: formValues.siteAddress,
        timezone: formValues.siteTimezone,
        dateFormat: formValues.dateFormat,
        defaultCurrency: formValues.currency,
        currencyPosition: formValues.currencyPosition,
      });
      alert("Site Settings saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save site settings.");
    }
  };

  const renderTabButton = (name, icon) => {
    const isActive = activeTab === name;
    return (
      <button 
        onClick={() => setActiveTab(name)}
        className={`pb-3 text-sm flex items-center gap-2 whitespace-nowrap transition-colors ${isActive ? "border-b-2 border-primary font-semibold text-primary" : "font-medium text-muted hover:text-foreground"}`}
      >
        {icon} {name}
      </button>
    );
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="grid gap-6 xl:grid-cols-[2.5fr_1fr]">
        
        {/* Left Column */}
        <div className="flex flex-col gap-6 min-w-0">
          {/* Page Header */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center w-full">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Site Settings</h2>
                <p className="text-xs text-muted">Manage your platform's basic details, contact information, branding and preferences.</p>
              </div>
              <div className="flex items-center gap-3">
                <Button type="button" onClick={handleReset} size="sm" variant="outline" className="border-border">
                  Reset
                </Button>
                <Button type="button" onClick={handleSave} size="sm" className="bg-primary text-white flex items-center gap-2">
                  <CheckSquare size={16} /> Save Changes
                </Button>
              </div>
            </div>
          </div>

          {/* Form Container */}
          <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden flex flex-col h-full min-w-0">
            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-border px-6 pt-4 overflow-x-auto scrollbar-hide">
              {renderTabButton("General", <Globe size={16} />)}
              {renderTabButton("Contact", <Mail size={16} />)}
              {renderTabButton("SEO", <Search size={16} />)}
              {renderTabButton("Localization", <Map size={16} />)}
              {renderTabButton("Appearance", <Palette size={16} />)}
              {renderTabButton("Social Media", <Share2 size={16} />)}
              {renderTabButton("Others", <Grid size={16} />)}
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 flex-1 min-w-0">
              {activeTab === "General" ? (
                <>
                  <div>
                      <h3 className="text-base font-semibold text-primary">General Information</h3>
                      <p className="text-xs text-muted mt-1">Update your website and platform basic information.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                          <Input id="siteName" label={<span className="font-semibold text-xs text-foreground">Site Name <span className="text-red-500">*</span></span>} value={formValues.siteName} onChange={(e) => handleChange("siteName", e.target.value)} />
                          <div className="text-[10px] text-muted text-right mt-1">{formValues.siteName?.length || 0} / 50</div>
                      </div>
                      <div>
                          <Input id="tagline" label={<span className="font-semibold text-xs text-foreground">Tagline</span>} value={formValues.tagline} onChange={(e) => handleChange("tagline", e.target.value)} />
                          <div className="text-[10px] text-muted text-right mt-1">{formValues.tagline?.length || 0} / 100</div>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Input id="siteEmail" type="email" label={<span className="font-semibold text-xs text-foreground">Site Email <span className="text-red-500">*</span></span>} value={formValues.siteEmail} onChange={(e) => handleChange("siteEmail", e.target.value)} />
                      <div>
                          <Input
                            id="sitePhone"
                            label={<span className="font-semibold text-xs text-foreground">Site Phone <span className="text-red-500">*</span></span>}
                            value={formValues.sitePhone.replace("+91 ", "")}
                            onChange={(e) => handleChange("sitePhone", "+91 " + e.target.value)}
                            placeholder="98765 43210"
                            prefix={
                              <div className="flex items-center gap-2 border-r border-border bg-surface px-3 py-2 text-sm text-foreground h-full cursor-pointer hover:bg-muted/5">
                                <span className="text-base leading-none">🇮🇳</span><span className="text-sm font-medium">+91</span>
                              </div>
                            }
                          />
                      </div>
                  </div>

                  <div>
                      <Input id="siteAddress" label={<span className="font-semibold text-xs text-foreground">Site Address <span className="text-red-500">*</span></span>} value={formValues.siteAddress} onChange={(e) => handleChange("siteAddress", e.target.value)} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Select id="siteTimezone" label={<span className="font-semibold text-xs text-foreground">Site Timezone <span className="text-red-500">*</span></span>} value={formValues.siteTimezone} onChange={(e) => handleChange("siteTimezone", e.target.value)}>
                          <option value="Asia/Kolkata">(GMT+05:30) Asia/Kolkata</option>
                      </Select>
                      <Select id="dateFormat" label={<span className="font-semibold text-xs text-foreground">Date Format <span className="text-red-500">*</span></span>} value={formValues.dateFormat} onChange={(e) => handleChange("dateFormat", e.target.value)}>
                          <option value="DD/MM/YYYY">DD MMM YYYY</option>
                      </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Select id="currency" label={<span className="font-semibold text-xs text-foreground">Currency <span className="text-red-500">*</span></span>} value={formValues.currency} onChange={(e) => handleChange("currency", e.target.value)}>
                          <option value="INR">INR - Indian Rupee (₹)</option>
                      </Select>
                      <Select id="currencyPosition" label={<span className="font-semibold text-xs text-foreground">Currency Position</span>} value={formValues.currencyPosition} onChange={(e) => handleChange("currencyPosition", e.target.value)}>
                          <option value="Prefix">Before Amount (₹100.00)</option>
                          <option value="Suffix">After Amount (100.00₹)</option>
                      </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                      <div>
                          <h4 className="text-sm font-semibold text-foreground mb-1">Site Logo</h4>
                          <p className="text-[10px] text-muted mb-3">Upload your logo. Recommended size: 512x512px</p>
                          <div className="flex items-center gap-4">
                              <div className="flex h-16 w-32 items-center justify-center rounded-lg border border-border bg-surface p-2 shadow-sm">
                                  <div className="text-2xl font-bold tracking-tighter text-foreground flex items-center">
                                      VAYZO <span className="text-red-500 text-[10px] ml-0.5 relative -top-2">●</span>
                                  </div>
                              </div>
                              <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                                  <Trash2 size={16} />
                              </button>
                              <div className="flex flex-col gap-1.5">
                                  <Button variant="outline" size="sm" className="rounded-lg border-primary/20 text-primary hover:bg-primary-light flex items-center gap-1.5 px-3">
                                      <Upload size={14} /> Change Logo
                                  </Button>
                                  <span className="text-[9px] text-muted text-center">PNG, JPG or SVG. Max size 2MB</span>
                              </div>
                          </div>
                      </div>
                      
                      <div>
                          <h4 className="text-sm font-semibold text-foreground mb-1">Favicon</h4>
                          <p className="text-[10px] text-muted mb-3">Upload favicon for your site. Recommended size: 32x32px</p>
                          <div className="flex items-center gap-4">
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[#110B29] shadow-sm border border-border">
                                  <span className="text-2xl font-bold text-white">V</span>
                              </div>
                              <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                                  <Trash2 size={16} />
                              </button>
                              <div className="flex flex-col gap-1.5">
                                  <Button variant="outline" size="sm" className="rounded-lg border-primary/20 text-primary hover:bg-primary-light flex items-center gap-1.5 px-3">
                                      <Upload size={14} /> Change Favicon
                                  </Button>
                                  <span className="text-[9px] text-muted text-center">ICO, PNG. Max size 1MB</span>
                              </div>
                          </div>
                      </div>
                  </div>

                  
                </>
              ) : (
                <div className="flex items-center justify-center h-48 text-muted">
                  <p>Settings for {activeTab} are coming soon.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Site Status */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-foreground">Site Status</h3>
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">Live</span>
            </div>
            
            <div className="space-y-4">
                <div>
                    <p className="text-xs font-semibold text-foreground mb-1">Website URL</p>
                    <a href="#" className="text-sm text-primary font-medium flex items-center justify-between hover:underline truncate block">
                        https://www.vayzo.com <ExternalLink size={14} className="text-muted inline ml-2" />
                    </a>
                </div>
                <div>
                    <p className="text-xs font-semibold text-foreground mb-1">Site Version</p>
                    <p className="text-sm text-muted">v2.4.0</p>
                </div>
                <div>
                    <p className="text-xs font-semibold text-foreground mb-1">Last Updated</p>
                    <p className="text-sm text-muted">25 May 2024, 04:30 PM</p>
                </div>
                <div className="border-b border-border pb-4">
                    <p className="text-xs font-semibold text-foreground mb-2">Updated By</p>
                    <div className="flex items-center gap-2">
                        <img src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "Admin")}&background=random&color=fff&size=150`} alt="User Avatar" className="h-6 w-6 rounded-full object-cover" />
                        <span className="text-sm font-semibold text-foreground">{user.name || "Admin"}</span>
                    </div>
                </div>

                <div className="rounded-xl bg-primary-light/20 p-4 flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-sm border border-primary/10">
                        <ShieldCheck size={18} />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-foreground">Your site is up and running smoothly.</h4>
                        <p className="text-[10px] text-muted mt-0.5">Keep up the good work!</p>
                    </div>
                </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <h3 className="mb-4 text-base font-bold text-foreground">Quick Actions</h3>
            <div className="space-y-2">
                <a href="#" className="flex items-center justify-between rounded-xl p-2.5 hover:bg-muted/5 transition-colors border border-transparent hover:border-border group">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light/30 text-primary">
                            <Trash2 size={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-foreground">Clear Site Cache</h4>
                            <p className="text-[10px] text-muted mt-0.5 leading-tight">Clear cache to apply recent changes</p>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-muted group-hover:text-primary transition-colors shrink-0" />
                </a>
                <a href="#" className="flex items-center justify-between rounded-xl p-2.5 hover:bg-muted/5 transition-colors border border-transparent hover:border-border group">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light/30 text-primary">
                            <Upload size={18} className="rotate-180" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-foreground">Backup Site Settings</h4>
                            <p className="text-[10px] text-muted mt-0.5 leading-tight">Download a backup of site settings</p>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-muted group-hover:text-primary transition-colors shrink-0" />
                </a>
                <a href="#" className="flex items-center justify-between rounded-xl p-2.5 hover:bg-muted/5 transition-colors border border-transparent hover:border-border group">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light/30 text-primary">
                            <RotateCcw size={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-foreground">Restore Default Settings</h4>
                            <p className="text-[10px] text-muted mt-0.5 leading-tight">Reset all settings to default</p>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-muted group-hover:text-primary transition-colors shrink-0" />
                </a>
                <a href="#" className="flex items-center justify-between rounded-xl p-2.5 hover:bg-muted/5 transition-colors border border-transparent hover:border-border group">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light/30 text-primary">
                            <MonitorCog size={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-foreground">Site Maintenance Mode</h4>
                            <p className="text-[10px] text-muted mt-0.5 leading-tight">Put your site in maintenance mode</p>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-muted group-hover:text-primary transition-colors shrink-0" />
                </a>
            </div>
          </div>

          {/* Storage Usage */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <h3 className="mb-4 text-base font-bold text-foreground">Storage Usage</h3>
            <div className="flex items-center gap-5">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-8 border-gray-100">
                    <div className="absolute inset-0 rounded-full border-8 border-primary" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 35%, 0 35%)' }}></div>
                    <div className="flex flex-col items-center justify-center bg-surface h-full w-full rounded-full z-10 relative shadow-sm">
                        <span className="text-sm font-bold text-foreground">35%</span>
                    </div>
                </div>
                
                <div className="flex-1 space-y-2.5 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">3.5 GB <span className="text-muted font-medium">/ 10 GB Used</span></p>
                    <Button variant="outline" size="sm" className="rounded-lg border-border text-foreground hover:bg-muted/5 w-full flex justify-center gap-2 py-1.5 text-xs font-semibold">
                        <Folder size={14} /> Manage Storage
                    </Button>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Temporary icon mock for the illustration
function ImageIcon(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
}

export default SiteSettings;
