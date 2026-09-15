import React, { useState } from "react";
import Button from "../../components/ui/button";
import Select from "../../components/ui/Select";
import { 
  ExternalLink,
  Image as ImageIcon,
  Trash2,
  Globe,
  Copy,
  FileEdit,
  RefreshCw,
  Layout,
  Smartphone,
  Timer,
  Share2,
  Map,
  ArrowRightCircle,
  BarChart,
  Code,
  Lightbulb,
  Check,
  ArrowRight,
  ChevronRight
} from "lucide-react";

function SEOSettings() {
  const [toggles, setToggles] = useState({
    engineIndexing: true,
    enableSitemap: true,
  });

  const toggleSetting = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <div className="flex-1 space-y-6 pb-10">
        
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">SEO Settings</h2>
          <p className="text-xs text-muted">Manage your website's search engine optimization.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[2.5fr_1fr] items-start">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            
            {/* Global SEO Settings */}
            <div className="rounded-2xl border border-border bg-surface shadow-sm">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground text-sm">Global SEO Settings</h3>
                  <p className="text-xs text-muted mt-1">Configure the default SEO settings for your website.</p>
                </div>
                <Button variant="outline" className="h-[36px] text-primary border-primary hover:bg-primary-light flex items-center gap-2 text-xs">
                  Preview Website <ExternalLink size={14} />
                </Button>
              </div>
              
              <div className="p-5 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">Site Title</label>
                    <input type="text" defaultValue="Vayzo Delivery - Fast. Reliable. Delivered." className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none" />
                    <p className="text-[10px] text-muted text-right mt-1">43 / 60</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">Site Tagline</label>
                    <input type="text" defaultValue="Your favorite food, delivered to your door." className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none" />
                    <p className="text-[10px] text-muted text-right mt-1">41 / 80</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">Meta Description</label>
                    <textarea rows="3" defaultValue="Vayzo Delivery connects you with the best restaurants and delivers your favorite food fast and fresh." className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none resize-none" />
                    <p className="text-[10px] text-muted text-right mt-1">121 / 160</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">Meta Keywords</label>
                    <textarea rows="3" defaultValue="food delivery, online food order, restaurants, fast delivery, vayzo, takeaway, home delivery" className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none resize-none" />
                    <p className="text-[10px] text-muted text-right mt-1">77 / 200</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">Default OG Image</label>
                    <div className="border border-dashed border-primary/40 rounded-lg p-5 flex items-center gap-4 bg-primary/5">
                      <div className="h-14 w-14 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <ImageIcon size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">Upload Image</p>
                        <p className="text-[10px] text-muted">Recommended size: 1200x630px</p>
                      </div>
                      <Button variant="outline" className="h-[32px] px-4 text-primary border-primary text-xs shrink-0">Change Image</Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">Favicon</label>
                    <div className="flex items-center gap-6 mt-4">
                      <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-white text-2xl font-bold shadow-md">
                        V
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Button variant="outline" className="h-[30px] px-3 text-primary border-primary text-xs">Change Icon</Button>
                          <button className="flex items-center gap-1 text-danger text-xs font-medium hover:underline">
                            <Trash2 size={12} /> Remove
                          </button>
                        </div>
                        <p className="text-[10px] text-muted mt-2">Recommended: 512x512px (PNG, ICO)</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Search Engine Settings */}
            <div className="rounded-2xl border border-border bg-surface shadow-sm p-5">
              <h3 className="font-semibold text-foreground text-sm mb-1">Search Engine Settings</h3>
              <p className="text-xs text-muted mb-6">Control how search engines crawl and index your site.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Search Engine Indexing</p>
                      <p className="text-[11px] text-muted mt-0.5">Allow search engines to index your website.</p>
                    </div>
                    <button type="button" onClick={() => toggleSetting('engineIndexing')} className={`relative h-5 w-9 rounded-full transition-colors ${toggles.engineIndexing ? "bg-primary" : "bg-muted"}`}>
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${toggles.engineIndexing ? "left-4.5" : "left-0.5"}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Enable Sitemap</p>
                      <p className="text-[11px] text-muted mt-0.5">Generate and submit XML sitemap to search engines.</p>
                    </div>
                    <button type="button" onClick={() => toggleSetting('enableSitemap')} className={`relative h-5 w-9 rounded-full transition-colors ${toggles.enableSitemap ? "bg-primary" : "bg-muted"}`}>
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${toggles.enableSitemap ? "left-4.5" : "left-0.5"}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">Robots.txt</p>
                      <p className="text-[11px] text-muted mt-0.5">Manage your robots.txt file</p>
                    </div>
                    <Button variant="outline" className="h-[32px] px-3 text-primary border-primary text-xs flex items-center gap-1.5">
                      <FileEdit size={12} /> Edit Robots.txt
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">Canonical URL</label>
                    <div className="relative flex items-center">
                      <input type="text" defaultValue="https://vayzo.com" className="w-full rounded-md border border-border bg-surface px-3 pr-10 py-2 text-sm focus:border-primary outline-none text-muted" />
                      <Globe size={14} className="absolute right-3 text-muted" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">Sitemap URL</label>
                    <div className="relative flex items-center">
                      <input type="text" defaultValue="https://vayzo.com/sitemap.xml" className="w-full rounded-md border border-border bg-surface px-3 pr-10 py-2 text-sm focus:border-primary outline-none" />
                      <Copy size={14} className="absolute right-3 text-muted cursor-pointer hover:text-primary" />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-[10px] text-muted">Last generated: 12 May 2024, 10:30 AM</p>
                      <Button variant="outline" className="h-[30px] px-3 text-primary border-primary text-[10px] flex items-center gap-1.5">
                        <RefreshCw size={12} /> Regenerate Sitemap
                      </Button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Local SEO Settings & Save */}
            <div className="rounded-2xl border border-border bg-surface shadow-sm p-5 relative">
              <h3 className="font-semibold text-foreground text-sm mb-1">Local SEO Settings</h3>
              <p className="text-xs text-muted mb-6">Improve your local search presence.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                <div>
                  <label className="text-xs font-medium text-foreground mb-2 block">Business Name</label>
                  <input type="text" defaultValue="Vayzo Delivery" className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-2 block">Default Language</label>
                  <Select defaultValue="English (en)" className="h-[38px] text-sm">
                    <option>English (en)</option>
                    <option>Tamil (ta)</option>
                    <option>Hindi (hi)</option>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-2 block">Business Address</label>
                  <input type="text" defaultValue="123, Food Street, T Nagar, Chennai - 600017, Tamil Nadu, India" className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-2 block">Business Phone</label>
                  <input type="text" defaultValue="+91 98765 43210" className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none" />
                </div>
              </div>

              {/* Absolute Buttons to match the design spacing */}
              <div className="absolute right-5 bottom-5">
                <Button className="bg-primary text-white px-6">
                  Save Changes
                </Button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            
            {/* SEO Score */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <h3 className="mb-1 font-semibold text-foreground text-sm">SEO Score</h3>
              <p className="text-[11px] text-muted mb-6">Your site SEO performance overview.</p>
              
              <div className="flex flex-col items-center justify-center mb-8 relative">
                {/* Donut SVG */}
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
                    {/* Background Track (Purple) */}
                    <path
                      className="stroke-primary"
                      strokeWidth="3.5"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Progress (Green - 85%) */}
                    <path
                      className="stroke-success"
                      strokeWidth="3.5"
                      strokeDasharray="85, 100"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-foreground">85</span>
                    <span className="text-[10px] text-muted">/100</span>
                  </div>
                </div>
                
                <div className="absolute -bottom-3 bg-success/10 border border-success/20 text-success text-[10px] font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <Check size={12} /> Good
                </div>
              </div>

              <div className="space-y-3 mt-4">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 text-primary">
                    <Layout size={14} />
                    <span className="text-muted">Meta information</span>
                  </div>
                  <span className="font-semibold text-foreground">90/100</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 text-primary">
                    <Smartphone size={14} />
                    <span className="text-muted">Mobile Friendliness</span>
                  </div>
                  <span className="font-semibold text-foreground">85/100</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 text-primary">
                    <Timer size={14} />
                    <span className="text-muted">Page Speed</span>
                  </div>
                  <span className="font-semibold text-foreground">78/100</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 text-primary">
                    <Share2 size={14} />
                    <span className="text-muted">Social Signals</span>
                  </div>
                  <span className="font-semibold text-foreground">88/100</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 text-primary">
                    <Map size={14} />
                    <span className="text-muted">Sitemap</span>
                  </div>
                  <span className="font-semibold text-foreground">90/100</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-border">
                <a href="#" className="text-primary text-xs font-semibold hover:underline flex items-center gap-1">
                  View Full SEO Report <ArrowRight size={14} />
                </a>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <h3 className="mb-4 font-semibold text-foreground text-sm">Quick Actions</h3>
              
              <div className="space-y-2">
                <button className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-surface-50 group border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                      <Map size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Open Sitemap</p>
                      <p className="text-[11px] text-muted">View your XML sitemap</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted" />
                </button>
                
                <button className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-surface-50 group border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                      <ArrowRightCircle size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Submit to Google</p>
                      <p className="text-[11px] text-muted">Submit site to Google Search Console</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted" />
                </button>

                <button className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-surface-50 group border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                      <BarChart size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Google Analytics</p>
                      <p className="text-[11px] text-muted">View your analytics dashboard</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted" />
                </button>

                <button className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-surface-50 group border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                      <Code size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Schema Generator</p>
                      <p className="text-[11px] text-muted">Generate structured data</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted" />
                </button>
              </div>
            </div>

            {/* SEO Tips */}
            <div className="rounded-2xl border border-primary/20 bg-[#f4f7ff] p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb size={16} className="text-primary" />
                <h4 className="font-semibold text-foreground text-sm">SEO Tips</h4>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-[11px]">
                  <Check size={14} className="text-success shrink-0 mt-0.5" />
                  <span className="text-muted">Keep your meta title under 60 characters.</span>
                </div>
                <div className="flex items-start gap-2 text-[11px]">
                  <Check size={14} className="text-success shrink-0 mt-0.5" />
                  <span className="text-muted">Add primary keyword in meta description.</span>
                </div>
                <div className="flex items-start gap-2 text-[11px]">
                  <Check size={14} className="text-success shrink-0 mt-0.5" />
                  <span className="text-muted">Use high quality OG image for social sharing.</span>
                </div>
                <div className="flex items-start gap-2 text-[11px]">
                  <Check size={14} className="text-success shrink-0 mt-0.5" />
                  <span className="text-muted">Generate and submit sitemap regularly.</span>
                </div>
              </div>

              <div className="mt-5">
                <a href="#" className="text-primary text-[11px] font-semibold hover:underline flex items-center gap-1">
                  Learn more about SEO <ArrowRight size={12} />
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default SEOSettings;
