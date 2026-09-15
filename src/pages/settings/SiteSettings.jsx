import { useState } from "react";
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
  Folder
} from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { generalSettings } from "../../mock/vayzoApiMock";

function SiteSettings() {
  const userStr = localStorage.getItem("vayzo_admin_user");
  const user = userStr ? JSON.parse(userStr) : {};
  const [activeTab, setActiveTab] = useState("General");
  const [formValues, setFormValues] = useState({
    siteName: generalSettings.platformName,
    tagline: generalSettings.platformTagline,
    siteEmail: generalSettings.supportEmail,
    sitePhone: generalSettings.supportPhone,
    siteAddress: generalSettings.contactAddress,
    siteTimezone: generalSettings.timezone,
    dateFormat: generalSettings.dateFormat,
    currency: generalSettings.defaultCurrency,
    currencyPosition: generalSettings.currencyPosition,
  });

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setFormValues({
      siteName: generalSettings.platformName,
      tagline: generalSettings.platformTagline,
      siteEmail: generalSettings.supportEmail,
      sitePhone: generalSettings.supportPhone,
      siteAddress: generalSettings.contactAddress,
      siteTimezone: generalSettings.timezone,
      dateFormat: generalSettings.dateFormat,
      currency: generalSettings.defaultCurrency,
      currencyPosition: generalSettings.currencyPosition,
    });
    alert("Settings reset to original values.");
  };

  const handleSave = () => {
    console.log("Saving settings:", formValues);
    alert("Site Settings saved successfully!");
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
          {/* Banner */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm flex items-center justify-between overflow-hidden relative min-h-[140px]">
             <div className="flex items-center gap-4 z-10 w-2/3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Globe className="text-primary" size={32} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-foreground">Site Settings</h2>
                    <p className="text-sm text-muted mt-1 leading-relaxed">Manage your platform's basic details, contact<br/>information, branding and preferences.</p>
                </div>
             </div>
             
             {/* Decorative Elements - Illustration Mock */}
             <div className="absolute right-0 top-0 bottom-0 w-[40%] bg-primary/5 pointer-events-none flex items-center justify-end pr-8 overflow-hidden rounded-l-full">
                 <div className="relative h-24 w-40 bg-white rounded-lg shadow-sm border border-border mr-4 mt-2">
                    {/* Browser header */}
                    <div className="h-4 border-b border-border flex items-center gap-1 px-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-400"></div>
                        <div className="h-1.5 w-1.5 rounded-full bg-yellow-400"></div>
                        <div className="h-1.5 w-1.5 rounded-full bg-green-400"></div>
                    </div>
                    {/* Content mock */}
                    <div className="p-2 space-y-2">
                        <div className="h-2 w-1/2 bg-gray-100 rounded"></div>
                        <div className="h-12 w-full bg-primary/10 rounded flex items-center justify-center text-primary/30">
                            <ImageIcon size={20} />
                        </div>
                    </div>
                    {/* Floating gear */}
                    <div className="absolute -bottom-4 -right-4 h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg border-2 border-white">
                        <MonitorCog size={20} />
                    </div>
                 </div>
                 {/* Leaf decorations */}
                 <div className="absolute left-4 text-primary/20 top-1/2 -translate-y-1/2 -scale-x-100">
                    <svg width="40" height="80" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
                 </div>
                 <div className="absolute right-2 text-primary/20 top-10">
                    <svg width="30" height="60" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
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

                  <div className="flex items-center gap-4 pt-4 border-t border-border mt-6">
                      <Button type="button" onClick={handleSave} size="md" className="bg-primary text-white px-6 flex items-center gap-2 font-medium">
                          <Folder size={16} /> Save Changes
                      </Button>
                      <Button type="button" onClick={handleReset} size="md" variant="outline" className="border-border px-8 font-medium">
                          Reset
                      </Button>
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
