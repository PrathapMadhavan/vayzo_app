import { useState, useEffect, useRef } from "react";
import { 
  Globe, 
  Mail, 
  Search, 
  Map, 
  Palette, 
  Share2, 
  Grid, 
  Upload, 
  RotateCcw, 
  Check,
  Info,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Toggle from "../../components/ui/Toggle";
import Card from "../../components/ui/Card";
import { getGeneralSettings, saveGeneralSettings } from "../../api/settingsApi";
import { applyThemeToDocument } from "../../utils/themeUtils";

const TABS = [
  { id: 'general', label: 'General', icon: Globe },
  { id: 'contact', label: 'Contact', icon: Mail },
  { id: 'seo', label: 'SEO', icon: Search },
  { id: 'localization', label: 'Localization', icon: Map },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'social', label: 'Social Media', icon: Share2 },
  { id: 'others', label: 'Others', icon: Grid },
];

const PRESET_COLORS = [
  { name: 'Purple (Default)', value: '#3d14b8' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Rose', value: '#e11d48' },
];

function GeneralSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const tabContainerRef = useRef(null);
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  const defaultState = {
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
    linkedin: "",
    platformStatus: true,
    maintenanceMode: false,
    logo: "",
    favicon: "",
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    primaryColor: "#3d14b8",
    themeMode: "light",
  };

  const [formValues, setFormValues] = useState(defaultState);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await getGeneralSettings();
      if (data) {
        const loadedData = {
          ...defaultState,
          ...data
        };
        setFormValues(loadedData);
        applyThemeToDocument(loadedData.primaryColor, loadedData.themeMode);
      }
    } catch (err) {
      console.error("Failed to load general settings", err);
      setErrorMessage("Failed to load settings from server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (field, value) => {
    setFormValues((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'primaryColor' || field === 'themeMode') {
        applyThemeToDocument(next.primaryColor, next.themeMode);
      }
      return next;
    });
    if (saveMessage) setSaveMessage("");
    if (errorMessage) setErrorMessage("");
  };

  const handleSave = async (event) => {
    if (event) event.preventDefault();
    try {
      setSaving(true);
      setErrorMessage("");
      setSaveMessage("");
      await saveGeneralSettings(formValues);
      setSaveMessage("Changes saved successfully.");
      setTimeout(() => setSaveMessage(""), 3000);
      await loadData(); // refresh to ensure sync
    } catch (err) {
      console.error("Failed to save", err);
      setErrorMessage("Failed to save settings. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to discard your changes and reload settings from the database?")) {
      loadData();
    }
  };

  const scrollTabs = (direction) => {
    if (tabContainerRef.current) {
      const scrollAmount = 200;
      tabContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage("Logo must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange("logo", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        setErrorMessage("Favicon must be less than 1MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange("favicon", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">General Settings</h2>
          <p className="text-sm text-muted mt-1">Manage your platform configuration and preferences.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleReset} disabled={saving} className="flex items-center gap-2">
            <RotateCcw size={16} />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
            {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div> : <Check size={16} />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {saveMessage && (
        <div className="rounded-lg bg-success/10 border border-success/20 p-4 text-sm text-success flex items-center gap-2 transition-all">
          <Check size={16} /> {saveMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="rounded-lg bg-danger/10 border border-danger/20 p-4 text-sm text-danger flex items-center gap-2 transition-all">
          <Info size={16} /> {errorMessage}
        </div>
      )}

      {/* Unified Settings Card with Tabs */}
      <Card className="overflow-hidden">
        
        {/* Tab Navigation */}
        <div className="relative border-b border-border bg-surface">
          <div className="absolute left-0 top-0 bottom-0 flex items-center md:hidden bg-gradient-to-r from-surface via-surface to-transparent px-2 z-10">
            <button onClick={() => scrollTabs('left')} className="p-1 rounded-full hover:bg-background text-muted">
              <ChevronLeft size={20} />
            </button>
          </div>
          
          <div 
            ref={tabContainerRef}
            className="flex overflow-x-auto sidebar-scroll px-8 md:px-2 scroll-smooth"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    // scroll into view slightly
                    const el = document.getElementById(`tab-${tab.id}`);
                    if(el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                  }}
                  id={`tab-${tab.id}`}
                  className={`flex items-center gap-2 whitespace-nowrap px-5 py-4 text-sm font-medium transition-colors border-b-2 ${
                    isActive 
                      ? 'border-primary text-primary bg-primary/5' 
                      : 'border-transparent text-muted hover:text-foreground hover:bg-background/50'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-primary' : 'text-muted'} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="absolute right-0 top-0 bottom-0 flex items-center md:hidden bg-gradient-to-l from-surface via-surface to-transparent px-2 z-10">
            <button onClick={() => scrollTabs('right')} className="p-1 rounded-full hover:bg-background text-muted">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 md:p-8 min-h-[400px]">
          
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid gap-6 sm:grid-cols-2 max-w-4xl">
                <Input
                  id="platformName"
                  label="Platform Name *"
                  value={formValues.platformName}
                  onChange={(e) => handleChange("platformName", e.target.value)}
                  required
                />
                <Input
                  id="platformTagline"
                  label="Platform Tagline"
                  value={formValues.platformTagline}
                  onChange={(e) => handleChange("platformTagline", e.target.value)}
                />
                <Input
                  id="supportEmail"
                  label="Support Email *"
                  type="email"
                  value={formValues.supportEmail}
                  onChange={(e) => handleChange("supportEmail", e.target.value)}
                  required
                />
                <Input
                  id="supportPhone"
                  label="Support Phone *"
                  value={formValues.supportPhone}
                  onChange={(e) => handleChange("supportPhone", e.target.value)}
                  required
                />
              </div>

              <div className="border-t border-border pt-8 grid gap-8 sm:grid-cols-2 max-w-4xl">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Platform Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-32 rounded-lg border border-border bg-background flex items-center justify-center overflow-hidden relative group">
                      {formValues.logo ? (
                        <>
                          <img src={formValues.logo} alt="Logo" className="h-full object-contain" />
                          <button 
                            type="button" 
                            onClick={() => handleChange('logo', '')}
                            className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-muted">No Logo</span>
                      )}
                    </div>
                    <button 
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-transparent px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary-light border-2 border-primary"
                    >
                      <Upload size={16} className="mr-2" /> Change Logo
                    </button>
                    <input 
                      type="file" 
                      ref={logoInputRef}
                      accept="image/png,image/jpeg,image/jpg,image/svg+xml" 
                      className="hidden" 
                      onChange={handleLogoUpload}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted">PNG, JPG or SVG (Max 2MB)</p>
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Favicon</label>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg border border-border bg-background flex items-center justify-center overflow-hidden relative group">
                      {formValues.favicon ? (
                        <>
                          <img src={formValues.favicon} alt="Favicon" className="h-full w-full object-contain" />
                          <button 
                            type="button" 
                            onClick={() => handleChange('favicon', '')}
                            className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px]"
                          >
                            X
                          </button>
                        </>
                      ) : (
                        <div className="h-full w-full bg-primary flex items-center justify-center text-white font-bold">V</div>
                      )}
                    </div>
                    <button 
                      type="button"
                      onClick={() => faviconInputRef.current?.click()}
                      className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-transparent px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary-light border-2 border-primary"
                    >
                      <Upload size={16} className="mr-2" /> Change Favicon
                    </button>
                    <input 
                      type="file" 
                      ref={faviconInputRef}
                      accept="image/x-icon,image/png" 
                      className="hidden" 
                      onChange={handleFaviconUpload}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted">ICO, PNG (Max 1MB)</p>
                </div>
              </div>
            </div>
          )}

          {/* CONTACT TAB */}
          {activeTab === 'contact' && (
            <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
              <div className="w-full">
                <label className="mb-2 block text-sm font-medium text-foreground">Complete Address</label>
                <textarea
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary"
                  rows={4}
                  placeholder="e.g. 123, Anna Salai, Chennai, 600002"
                  value={formValues.contactAddress}
                  onChange={(e) => handleChange("contactAddress", e.target.value)}
                />
                <p className="mt-2 text-xs text-muted">Use this field for your complete business address. This is stored directly in the backend schema.</p>
              </div>
            </div>
          )}

          {/* SEO TAB */}
          {activeTab === 'seo' && (
            <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
              <Input
                id="metaTitle"
                label="Meta Title"
                placeholder="Vayzo - Admin Dashboard"
                value={formValues.metaTitle}
                onChange={(e) => handleChange("metaTitle", e.target.value)}
              />
              <div className="w-full">
                <label className="mb-2 block text-sm font-medium text-foreground">Meta Description</label>
                <textarea
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary"
                  rows={3}
                  placeholder="Enter a brief description of the platform for search engines..."
                  value={formValues.metaDescription}
                  onChange={(e) => handleChange("metaDescription", e.target.value)}
                />
              </div>
              <Input
                id="keywords"
                label="Meta Keywords"
                placeholder="delivery, admin, food, dashboard"
                value={formValues.keywords}
                onChange={(e) => handleChange("keywords", e.target.value)}
              />
            </div>
          )}

          {/* LOCALIZATION TAB */}
          {activeTab === 'localization' && (
            <div className="grid gap-6 sm:grid-cols-2 animate-in fade-in duration-300 max-w-4xl">
              <Select
                id="timezone"
                label="Default Timezone *"
                value={formValues.timezone}
                onChange={(e) => handleChange("timezone", e.target.value)}
              >
                <option value="Asia/Kolkata">(GMT+05:30) Asia/Kolkata</option>
                <option value="America/New_York">(GMT-05:00) America/New_York</option>
                <option value="Europe/London">(GMT+00:00) Europe/London</option>
              </Select>
              
              <Select
                id="defaultCurrency"
                label="Currency *"
                value={formValues.defaultCurrency}
                onChange={(e) => handleChange("defaultCurrency", e.target.value)}
              >
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
              </Select>

              <Select
                id="currencyPosition"
                label="Currency Position"
                value={formValues.currencyPosition}
                onChange={(e) => handleChange("currencyPosition", e.target.value)}
              >
                <option value="before">Before Amount (₹100)</option>
                <option value="after">After Amount (100₹)</option>
              </Select>

              <Select
                id="dateFormat"
                label="Date Format"
                value={formValues.dateFormat}
                onChange={(e) => handleChange("dateFormat", e.target.value)}
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (12/05/2024)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (05/12/2024)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (2024-05-12)</option>
              </Select>

              <Select
                id="numberFormat"
                label="Number Format"
                value={formValues.numberFormat}
                onChange={(e) => handleChange("numberFormat", e.target.value)}
              >
                <option value="1,234.56">1,234.56</option>
                <option value="1.234,56">1.234,56</option>
                <option value="1 234.56">1 234.56</option>
              </Select>

              <Select
                id="language"
                label="Language"
                value={formValues.language}
                onChange={(e) => handleChange("language", e.target.value)}
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </Select>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-foreground">Time Format</label>
                <div className="flex items-center gap-6 py-2.5">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                    <input
                      type="radio"
                      name="timeFormat"
                      className="h-4 w-4 text-primary"
                      checked={formValues.timeFormat === "12h"}
                      onChange={() => handleChange("timeFormat", "12h")}
                    />
                    <span>12 Hours (02:30 PM)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                    <input
                      type="radio"
                      name="timeFormat"
                      className="h-4 w-4 text-primary"
                      checked={formValues.timeFormat === "24h"}
                      onChange={() => handleChange("timeFormat", "24h")}
                    />
                    <span>24 Hours (14:30)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === 'appearance' && (
            <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl">
              
              <div>
                <h4 className="text-sm font-medium text-foreground mb-4">Theme Mode</h4>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleChange("themeMode", "light")}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${formValues.themeMode === 'light' ? 'border-primary bg-primary/5' : 'border-border bg-surface hover:border-primary/50'}`}
                  >
                    <div className="w-24 h-16 rounded border border-gray-200 bg-gray-50 flex flex-col gap-1 p-2">
                      <div className="w-full h-2 bg-gray-200 rounded"></div>
                      <div className="w-2/3 h-2 bg-primary rounded"></div>
                    </div>
                    <span className="text-sm font-medium text-foreground">Light Mode</span>
                  </button>

                  <button 
                    onClick={() => handleChange("themeMode", "dark")}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${formValues.themeMode === 'dark' ? 'border-primary bg-primary/5' : 'border-border bg-surface hover:border-primary/50'}`}
                  >
                    <div className="w-24 h-16 rounded border border-gray-700 bg-gray-900 flex flex-col gap-1 p-2">
                      <div className="w-full h-2 bg-gray-700 rounded"></div>
                      <div className="w-2/3 h-2 bg-primary rounded"></div>
                    </div>
                    <span className="text-sm font-medium text-foreground">Dark Mode</span>
                  </button>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h4 className="text-sm font-medium text-foreground mb-4">Primary Brand Color</h4>
                <div className="flex flex-wrap gap-4 items-center">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color.value}
                      onClick={() => handleChange("primaryColor", color.value)}
                      title={color.name}
                      className={`w-10 h-10 rounded-full transition-all flex items-center justify-center ${formValues.primaryColor === color.value ? 'ring-2 ring-offset-2 ring-offset-surface ring-primary scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: color.value }}
                    >
                      {formValues.primaryColor === color.value && <Check size={16} className="text-white" />}
                    </button>
                  ))}
                  
                  <div className="h-8 border-l border-border mx-2"></div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formValues.primaryColor}
                      onChange={(e) => handleChange("primaryColor", e.target.value)}
                      className="w-10 h-10 p-1 rounded cursor-pointer bg-surface border border-border"
                      title="Custom Color"
                    />
                    <span className="text-xs text-muted uppercase font-mono">{formValues.primaryColor}</span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted">Selecting a color immediately previews it across the admin interface. Click Save Changes to apply it permanently for all users.</p>
              </div>

            </div>
          )}

          {/* SOCIAL MEDIA TAB */}
          {activeTab === 'social' && (
            <div className="grid gap-6 sm:grid-cols-2 animate-in fade-in duration-300 max-w-4xl">
              <Input
                id="facebook"
                label="Facebook"
                placeholder="https://facebook.com/..."
                value={formValues.facebook}
                onChange={(e) => handleChange("facebook", e.target.value)}
              />
              <Input
                id="instagram"
                label="Instagram"
                placeholder="https://instagram.com/..."
                value={formValues.instagram}
                onChange={(e) => handleChange("instagram", e.target.value)}
              />
              <Input
                id="twitter"
                label="Twitter / X"
                placeholder="https://twitter.com/..."
                value={formValues.twitter}
                onChange={(e) => handleChange("twitter", e.target.value)}
              />
              <Input
                id="linkedin"
                label="LinkedIn"
                placeholder="https://linkedin.com/..."
                value={formValues.linkedin}
                onChange={(e) => handleChange("linkedin", e.target.value)}
              />
            </div>
          )}

          {/* OTHERS TAB */}
          {activeTab === 'others' && (
            <div className="grid gap-6 sm:grid-cols-2 animate-in fade-in duration-300 max-w-4xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border p-5 bg-background">
                <div>
                  <h4 className="font-medium text-foreground">Platform Status</h4>
                  <p className="text-xs text-muted mt-1">Turn the platform online or offline for public users.</p>
                </div>
                <Toggle
                  checked={formValues.platformStatus}
                  onChange={(val) => handleChange("platformStatus", val)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border p-5 bg-background">
                <div>
                  <h4 className="font-medium text-foreground border-danger text-danger">Maintenance Mode</h4>
                  <p className="text-xs text-muted mt-1">Restrict public access during updates and maintenance.</p>
                </div>
                <Toggle
                  checked={formValues.maintenanceMode}
                  onChange={(val) => handleChange("maintenanceMode", val)}
                />
              </div>
            </div>
          )}

        </div>
      </Card>
    </div>
  );
}

export default GeneralSettings;
