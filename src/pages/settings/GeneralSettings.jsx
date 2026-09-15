import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Bell,
  CreditCard,
  Database,
  FileText,
  Globe,
  LayoutGrid,
  Mail,
  MonitorCog,
  Shield,
  Smartphone,
  TrendingUp,
  Truck,
} from "lucide-react";

import Button from "../../components/ui/button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Toggle from "../../components/ui/Toggle";
import Card from "../../components/ui/Card";
import { generalSettings } from "../../mock/vayzoApiMock";

function GeneralSettings() {
  const location = useLocation();
  const [formValues, setFormValues] = useState({
    platformName: generalSettings.platformName,
    platformTagline: generalSettings.platformTagline,
    supportEmail: generalSettings.supportEmail,
    supportPhone: generalSettings.supportPhone,
    timezone: generalSettings.timezone,
    dateFormat: generalSettings.dateFormat,
    timeFormat: "12h",
    defaultCurrency: generalSettings.defaultCurrency,
    currencyPosition: "before",
    numberFormat: generalSettings.numberFormat,
    language: generalSettings.language,
    contactAddress: generalSettings.contactAddress,
    facebook: generalSettings.socialLinks.facebook,
    instagram: generalSettings.socialLinks.instagram,
    twitter: generalSettings.socialLinks.twitter,
    platformStatus: true,
    maintenanceMode: generalSettings.maintenanceMode,
  });
  const [saveMessage, setSaveMessage] = useState("");

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (saveMessage) setSaveMessage("");
  };

  const handleSave = (event) => {
    event.preventDefault();
    setSaveMessage("Changes saved successfully.");
  };

  const phonePrefix = (
    <div className="flex items-center gap-2 border-r border-border bg-surface px-3 py-2 text-sm text-foreground h-full">
      <span className="text-lg">🇮🇳</span>
      <span>+91</span>
    </div>
  );

  return (
    <div className="flex-1 space-y-6">
      {/* TOP SECTION: General Settings (Left) | Site Status & Quick Links (Right) */}
      <div className="grid gap-6 xl:grid-cols-[2.5fr_1fr]">
        {/* Left Column: General Settings */}
        <Card className="p-5 sm:p-6">
          <form onSubmit={handleSave}>
            <div className="mb-5 flex flex-col gap-1 border-b border-border pb-4">
              <h2 className="text-lg font-semibold text-foreground">
                General Settings
              </h2>
              <p className="text-xs text-muted">
                Manage your platform general settings and preferences.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Left Inner Column */}
              <div className="space-y-4">
                <Input
                  id="platformName"
                  label="Platform Name *"
                  value={formValues.platformName}
                  onChange={(event) =>
                    handleChange("platformName", event.target.value)
                  }
                />
                <Input
                  id="platformTagline"
                  label="Platform Tagline"
                  value={formValues.platformTagline}
                  onChange={(event) =>
                    handleChange("platformTagline", event.target.value)
                  }
                />
                <Input
                  id="supportEmail"
                  label="Support Email *"
                  type="email"
                  value={formValues.supportEmail}
                  onChange={(event) =>
                    handleChange("supportEmail", event.target.value)
                  }
                />
                <Input
                  id="supportPhone"
                  label="Support Phone *"
                  value={formValues.supportPhone}
                  onChange={(event) =>
                    handleChange("supportPhone", event.target.value)
                  }
                  placeholder="98765 43210"
                  prefix={phonePrefix}
                />

                <Select
                  id="timezone"
                  label="Default Timezone *"
                  value={formValues.timezone}
                  onChange={(event) =>
                    handleChange("timezone", event.target.value)
                  }
                >
                  <option value="Asia/Kolkata">(GMT+05:30) Asia/Kolkata</option>
                </Select>
                <Select
                  id="dateFormat"
                  label="Date Format"
                  value={formValues.dateFormat}
                  onChange={(event) =>
                    handleChange("dateFormat", event.target.value)
                  }
                >
                  <option value="DD/MM/YYYY">DD MMM YYYY (12 May 2024)</option>
                </Select>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Time Format
                  </label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <input
                        type="radio"
                        name="timeFormat"
                        className="h-4 w-4 text-primary focus:ring-primary"
                        checked={formValues.timeFormat === "12h"}
                        onChange={() => handleChange("timeFormat", "12h")}
                      />
                      <span
                        className={
                          formValues.timeFormat === "12h"
                            ? "text-primary font-medium"
                            : "text-muted"
                        }
                      >
                        12 Hours (02:30 PM)
                      </span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <input
                        type="radio"
                        name="timeFormat"
                        className="h-4 w-4 text-primary focus:ring-primary"
                        checked={formValues.timeFormat === "24h"}
                        onChange={() => handleChange("timeFormat", "24h")}
                      />
                      <span
                        className={
                          formValues.timeFormat === "24h"
                            ? "text-primary font-medium"
                            : "text-muted"
                        }
                      >
                        24 Hours (14:30)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Inner Column */}
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Platform Logo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-32 items-center justify-center rounded-lg border border-border bg-surface shadow-sm">
                      <span className="text-xl font-bold text-foreground">
                        VAYZO
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-fit rounded-full border-primary/20 px-4 text-primary hover:bg-primary-light"
                      >
                        Change Logo
                      </Button>
                      <span className="text-[10px] text-muted">
                        PNG, JPG or SVG (Max 2MB)
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Favicon
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary shadow-md shadow-primary/20">
                      <span className="text-xl font-bold text-white">V</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-fit rounded-full border-primary/20 px-4 text-primary hover:bg-primary-light"
                      >
                        Change Favicon
                      </Button>
                      <span className="text-[10px] text-muted">
                        ICO, PNG (Max 1MB)
                      </span>
                    </div>
                  </div>
                </div>
                <Select
                  id="defaultCurrency"
                  label="Default Currency *"
                  value={formValues.defaultCurrency}
                  onChange={(event) =>
                    handleChange("defaultCurrency", event.target.value)
                  }
                >
                  <option value="INR">INR (₹) - Indian Rupee</option>
                </Select>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Currency Position
                  </label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <input
                        type="radio"
                        name="currencyPosition"
                        className="h-4 w-4 text-primary focus:ring-primary"
                        checked={formValues.currencyPosition === "before"}
                        onChange={() =>
                          handleChange("currencyPosition", "before")
                        }
                      />
                      <span
                        className={
                          formValues.currencyPosition === "before"
                            ? "text-primary font-medium"
                            : "text-muted"
                        }
                      >
                        Before Amount (₹100)
                      </span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <input
                        type="radio"
                        name="currencyPosition"
                        className="h-4 w-4 text-primary focus:ring-primary"
                        checked={formValues.currencyPosition === "after"}
                        onChange={() =>
                          handleChange("currencyPosition", "after")
                        }
                      />
                      <span
                        className={
                          formValues.currencyPosition === "after"
                            ? "text-primary font-medium"
                            : "text-muted"
                        }
                      >
                        After Amount (100₹)
                      </span>
                    </label>
                  </div>
                </div>
                <Select
                  id="numberFormat"
                  label="Number Format"
                  value={formValues.numberFormat}
                  onChange={(event) =>
                    handleChange("numberFormat", event.target.value)
                  }
                >
                  <option value="1,234.56">1,234.56.78</option>
                </Select>
                <Select
                  id="language"
                  label="Language"
                  value={formValues.language}
                  onChange={(event) =>
                    handleChange("language", event.target.value)
                  }
                >
                  <option value="English">English</option>
                </Select>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    size="md"
                    className="bg-primary text-white px-8"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Card>

        {/* Right Column: Site Status & Quick Links */}
        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="mb-4 text-base font-semibold text-foreground">
              Site Status
            </h3>
            <p className="mb-4 text-xs text-muted">
              Turn your platform on/off for users.
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Platform Status
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium ${formValues.platformStatus ? "text-success" : "text-muted"}`}
                  >
                    {formValues.platformStatus ? "Active" : "Offline"}
                  </span>
                  <Toggle
                    checked={formValues.platformStatus}
                    onChange={(val) => handleChange("platformStatus", val)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Maintenance Mode
                  </p>
                  <p className="text-[10px] text-muted leading-tight mt-1">
                    Enable maintenance mode to restrict
                    <br />
                    access to the platform.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Toggle
                    checked={formValues.maintenanceMode}
                    onChange={(val) => handleChange("maintenanceMode", val)}
                    className={formValues.maintenanceMode ? "bg-warning" : ""}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-4 text-base font-semibold text-foreground">
              Quick Links
            </h3>
            <div className="space-y-2 text-sm text-muted">
              <a
                href="#"
                className="flex items-center gap-3 rounded-lg px-2 py-2 text-primary hover:bg-primary-light"
              >
                <div className="bg-primary-light/30 p-1.5 rounded text-primary">
                  <LayoutGrid size={16} />
                </div>
                <div>
                  <span className="block font-medium">Clear Cache</span>
                  <span className="block text-xs text-muted">
                    Clear system cache
                  </span>
                </div>
              </a>
              <a
                href="#"
                className="flex items-center gap-3 rounded-lg px-2 py-2 text-primary hover:bg-primary-light"
              >
                <div className="bg-primary-light/30 p-1.5 rounded text-primary">
                  <Database size={16} />
                </div>
                <div>
                  <span className="block font-medium">System Backup</span>
                  <span className="block text-xs text-muted">
                    Download system backup
                  </span>
                </div>
              </a>
              <a
                href="#"
                className="flex items-center gap-3 rounded-lg px-2 py-2 text-primary hover:bg-primary-light"
              >
                <div className="bg-primary-light/30 p-1.5 rounded text-primary">
                  <Database size={16} />
                </div>
                <div>
                  <span className="block font-medium">Database Backup</span>
                  <span className="block text-xs text-muted">
                    Download database backup
                  </span>
                </div>
              </a>
              <a
                href="#"
                className="flex items-center gap-3 rounded-lg px-2 py-2 text-primary hover:bg-primary-light"
              >
                <div className="bg-primary-light/30 p-1.5 rounded text-primary">
                  <FileText size={16} />
                </div>
                <div>
                  <span className="block font-medium">System Logs</span>
                  <span className="block text-xs text-muted">
                    View system logs
                  </span>
                </div>
              </a>
            </div>
          </Card>
        </div>
      </div>

      {/* BOTTOM SECTION: 4 Columns */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 items-start">
        {/* Contact Address */}
        <Card className="flex flex-col justify-between p-5 h-full">
          <div>
            <h3 className="mb-4 text-base font-semibold text-foreground">
              Contact Address
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="addressLine1"
                  label="Address Line 1"
                  placeholder="123, Anna Salai"
                />
                <Input
                  id="addressLine2"
                  label="Address Line 2"
                  placeholder="Teynampet"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input id="city" label="City" placeholder="Chennai" />
                <Select id="state" label="State">
                  <option>Tamil Nadu</option>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="postalCode"
                  label="Postal Code"
                  placeholder="600018"
                />
                <Select id="country" label="Country">
                  <option>India</option>
                </Select>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <Button
              type="button"
              size="sm"
              className="w-[80%] bg-primary text-white"
            >
              Save Changes
            </Button>
          </div>
        </Card>

        {/* Social Links */}
        <Card className="flex flex-col justify-between p-5 h-full">
          <div>
            <h3 className="mb-4 text-base font-semibold text-foreground">
              Social Links
            </h3>
            <div className="space-y-4">
              <Input
                id="facebookUrl"
                label="Facebook"
                value="https://facebook.com/vayzo"
              />
              <Input
                id="instagramUrl"
                label="Instagram"
                value="https://instagram.com/vayzohq"
              />
              <Input
                id="twitterUrl"
                label="Twitter"
                value="https://twitter.com/vayzo"
              />
              <Input
                id="linkedinUrl"
                label="LinkedIn"
                value="https://linkedin.com/company/vayzo"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <Button
              type="button"
              size="sm"
              className="w-[80%] bg-primary text-white"
            >
              Save Changes
            </Button>
          </div>
        </Card>

        {/* Upload Banners */}
        <Card className="flex flex-col justify-between p-5 h-full">
          <div>
            <h3 className="mb-4 text-base font-semibold text-foreground">
              Upload Banners
            </h3>
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-medium text-foreground">
                  Home Banner (1920x600)
                </label>
                <div className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-primary/50 bg-primary-light/20 text-center hover:bg-primary-light/40 transition-colors">
                  <span className="text-primary text-xl">↑</span>
                  <span className="mt-1 text-xs font-medium text-primary">
                    Click to upload
                  </span>
                  <span className="text-[10px] text-muted">
                    PNG, JPG (Max 2MB)
                  </span>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-foreground">
                  Offer Banner (1920x600)
                </label>
                <div className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-primary/50 bg-primary-light/20 text-center hover:bg-primary-light/40 transition-colors">
                  <span className="text-primary text-xl">↑</span>
                  <span className="mt-1 text-xs font-medium text-primary">
                    Click to upload
                  </span>
                  <span className="text-[10px] text-muted">
                    PNG, JPG (Max 2MB)
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <Button
              type="button"
              size="sm"
              className="w-[80%] bg-primary text-white"
            >
              Save Changes
            </Button>
          </div>
        </Card>

        {/* System Info */}
        <Card className="flex flex-col justify-between p-5 h-full">
          <div>
            <h3 className="mb-4 text-base font-semibold text-foreground">
              System Info
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="font-medium text-foreground">
                  Current Version
                </span>
                <span className="text-muted">v 1.0.0</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="font-medium text-foreground">PHP Version</span>
                <span className="text-muted">8.2.12</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="font-medium text-foreground">
                  Laravel Version
                </span>
                <span className="text-muted">11.x</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="font-medium text-foreground">Server Time</span>
                <span className="text-muted">12 May 2024, 10:30 AM</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="font-medium text-foreground">
                  Storage Used
                </span>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] text-muted">
                    40% (20 GB / 50 GB)
                  </span>
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-border">
                    <div className="h-full w-[40%] bg-primary"></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between pb-2">
                <span className="font-medium text-foreground">Last Backup</span>
                <span className="text-[10px] text-muted">
                  11 May 2024, 11:30 PM
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 21v-5h5" />
              </svg>
              Check for Updates
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default GeneralSettings;
