import React, { useState } from "react";
import Button from "../../components/ui/button";
import Select from "../../components/ui/Select";
import { 
  MessageSquare,
  Mail,
  Clock,
  Gauge,
  RefreshCw,
  FileText,
  Link as LinkIcon,
  Eye,
  Mailbox,
  BarChart2,
  XCircle,
  Info,
  ChevronRight
} from "lucide-react";

function SMSSettings() {
  const [toggles, setToggles] = useState({
    deliveryReport: true,
    enableSms: true,
    retryFailed: true,
    unicode: true,
    urlShorten: false,
  });

  const toggleSetting = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <div className="flex-1 space-y-6">
        
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">SMS Settings</h2>
          <p className="text-xs text-muted">Configure global SMS preferences.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[2.5fr_1fr] items-start">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            
            {/* Gateway Config */}
            <div className="rounded-2xl border border-border bg-surface shadow-sm">
              <div className="p-5 border-b border-border">
                <h3 className="font-semibold text-foreground text-sm">SMS Gateway Configuration</h3>
                <p className="text-xs text-muted mt-1">Configure your SMS gateway to send text messages from the platform.</p>
              </div>
              
              <div className="p-5 space-y-6">
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                    <MessageSquare size={16} />
                  </div>
                  <span className="font-semibold text-sm">Gateway Details</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">SMS Gateway</label>
                    <Select defaultValue="Twilio" className="h-[38px] text-sm">
                      <option>Twilio</option>
                      <option>MessageBird</option>
                      <option>Nexmo</option>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">SMS Sender ID (Optional)</label>
                    <input type="text" defaultValue="VAYZO" className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">Account SID</label>
                    <input type="text" defaultValue="AC7b8f2d9c6e8a5b4f3e2d1c0b9a8f7e" className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">Status Callback URL (Optional)</label>
                    <input type="text" defaultValue="https://admin.vayzo.com/sms/callback" className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">Auth Token</label>
                    <div className="relative">
                      <input type="password" defaultValue="************************" className="w-full rounded-md border border-border bg-surface pl-3 pr-10 py-2 text-sm focus:border-primary outline-none" />
                      <Eye size={16} className="absolute right-3 top-2.5 text-muted cursor-pointer hover:text-foreground" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-6">
                    <div>
                      <p className="text-sm font-medium text-foreground">Delivery Report</p>
                      <p className="text-[11px] text-muted">Receive delivery status for sent SMS</p>
                    </div>
                    <button type="button" onClick={() => toggleSetting('deliveryReport')} className={`relative h-5 w-9 rounded-full transition-colors ${toggles.deliveryReport ? "bg-success" : "bg-muted"}`}>
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${toggles.deliveryReport ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                    </button>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">From Phone Number</label>
                    <input type="text" defaultValue="+1 202 555 0147" className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">Test Recipient Number</label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-border rounded-md px-2 h-[38px] bg-surface w-24">
                        <span className="text-sm mr-1">🇮🇳</span>
                        <span className="text-sm">+91</span>
                        <ChevronRight size={14} className="text-muted ml-1 rotate-90" />
                      </div>
                      <input type="text" defaultValue="98765 43210" className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none" />
                      <Button variant="outline" className="h-[38px] px-4 text-xs">Send Test SMS</Button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* SMS Preferences */}
            <div className="rounded-2xl border border-border bg-surface shadow-sm p-5">
              <h3 className="font-semibold text-foreground text-sm mb-1">SMS Settings</h3>
              <p className="text-xs text-muted mb-6">Configure global SMS preferences.</p>
              
              <div className="space-y-6">
                
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="bg-success/10 text-success p-2 rounded-lg"><Mail size={18} /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Enable SMS Service</p>
                      <p className="text-[11px] text-muted mt-0.5">Turn on to allow system to send SMS.</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => toggleSetting('enableSms')} className={`relative h-5 w-9 rounded-full transition-colors ${toggles.enableSms ? "bg-primary" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${toggles.enableSms ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 text-blue-500 p-2 rounded-lg"><Clock size={18} /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">SMS Sending Time</p>
                      <p className="text-[11px] text-muted mt-0.5">Set allowed time for sending SMS.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select defaultValue="08:00 AM" className="h-[38px] text-xs w-28">
                      <option>08:00 AM</option>
                      <option>09:00 AM</option>
                    </Select>
                    <span className="text-xs text-muted">To</span>
                    <Select defaultValue="09:00 PM" className="h-[38px] text-xs w-28">
                      <option>08:00 PM</option>
                      <option>09:00 PM</option>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-500/10 text-purple-500 p-2 rounded-lg"><Gauge size={18} /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">SMS Sending Speed</p>
                      <p className="text-[11px] text-muted mt-0.5">Set the delay between each SMS.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select defaultValue="Normal (Recommended)" className="h-[38px] text-xs w-48">
                      <option>Normal (Recommended)</option>
                      <option>Fast</option>
                      <option>Custom</option>
                    </Select>
                    <input type="text" defaultValue="2" className="w-16 h-[38px] rounded-md border border-border bg-surface px-3 text-sm focus:border-primary outline-none text-center" />
                    <span className="text-xs text-muted">Seconds</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-500/10 text-orange-500 p-2 rounded-lg"><RefreshCw size={18} /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Retry Failed SMS</p>
                      <p className="text-[11px] text-muted mt-0.5">Automatically retry failed SMS.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <button type="button" onClick={() => toggleSetting('retryFailed')} className={`relative h-5 w-9 rounded-full transition-colors ${toggles.retryFailed ? "bg-primary" : "bg-muted"}`}>
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${toggles.retryFailed ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                    </button>
                    {toggles.retryFailed && (
                      <div>
                        <span className="text-[10px] text-muted font-medium block mb-1">Max Retry Attempts</span>
                        <Select defaultValue="3 Attempts" className="h-[32px] text-xs w-32">
                          <option>1 Attempt</option>
                          <option>2 Attempts</option>
                          <option>3 Attempts</option>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="bg-pink-500/10 text-pink-500 p-2 rounded-lg"><FileText size={18} /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Unicode Support</p>
                      <p className="text-[11px] text-muted mt-0.5">Send SMS in unicode format.</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => toggleSetting('unicode')} className={`relative h-5 w-9 rounded-full transition-colors ${toggles.unicode ? "bg-primary" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${toggles.unicode ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-teal-500/10 text-teal-500 p-2 rounded-lg"><LinkIcon size={18} /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">URL Shortening</p>
                      <p className="text-[11px] text-muted mt-0.5">Automatically shorten long URLs.</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => toggleSetting('urlShorten')} className={`relative h-5 w-9 rounded-full transition-colors ${toggles.urlShorten ? "bg-primary" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${toggles.urlShorten ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                  </button>
                </div>

              </div>
              
              <div className="flex justify-end pt-6 mt-2">
                <Button type="button" className="bg-primary text-white px-6">
                  Save Changes
                </Button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            
            {/* SMS Service Status */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <h3 className="mb-2 font-semibold text-foreground text-sm">SMS Service Status</h3>
              <p className="text-[11px] text-muted mb-5">Overview of your SMS service.</p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-foreground">SMS Service</span>
                  <span className="rounded bg-success/10 px-2 py-0.5 font-medium text-success">Active</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-foreground">Balance</span>
                  <span className="font-medium text-foreground">1,245 SMS</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-foreground">Last Updated</span>
                  <span className="text-muted font-medium">2 mins ago</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-foreground">Failed SMS</span>
                  <span className="text-muted font-medium">0</span>
                </div>
              </div>
            </div>

            {/* SMS Usage */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <h3 className="mb-2 font-semibold text-foreground text-sm">SMS Usage (This Month)</h3>
              <p className="text-[11px] text-muted mb-6">Track your SMS usage and statistics.</p>
              
              <div className="flex items-center gap-6">
                <div className="relative h-28 w-28 shrink-0">
                  <svg viewBox="0 0 36 36" className="h-full w-full">
                    {/* Background */}
                    <path
                      className="stroke-muted/20"
                      strokeWidth="4"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Primary (94%) */}
                    <path
                      className="stroke-primary"
                      strokeWidth="4"
                      strokeDasharray="94, 100"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Pink (3%) */}
                    <path
                      className="stroke-pink-500"
                      strokeWidth="4"
                      strokeDasharray="3, 100"
                      strokeDashoffset="-94"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Yellow (3%) */}
                    <path
                      className="stroke-yellow-500"
                      strokeWidth="4"
                      strokeDasharray="3, 100"
                      strokeDashoffset="-97"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[13px] font-bold text-foreground">12,540</span>
                    <span className="text-[9px] text-muted font-medium">SMS Sent</span>
                  </div>
                </div>
                
                <div className="flex-1 space-y-2.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-primary" /> <span className="font-semibold text-foreground">Successful</span></div>
                    <span className="text-muted">11,860 (94%)</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-pink-500" /> <span className="font-semibold text-foreground">Failed</span></div>
                    <span className="text-muted">420 (3%)</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-yellow-500" /> <span className="font-semibold text-foreground">Pending</span></div>
                    <span className="text-muted">260 (2%)</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-border">
                    <div className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-muted" /> <span className="font-semibold text-foreground">Total</span></div>
                    <span className="font-semibold text-foreground">12,540</span>
                  </div>
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
                      <Mailbox size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">SMS Templates</p>
                      <p className="text-[11px] text-muted">Manage SMS templates</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted" />
                </button>
                
                <button className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-surface-50 group border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                      <FileText size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">SMS Logs</p>
                      <p className="text-[11px] text-muted">View SMS activity logs</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted" />
                </button>

                <button className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-surface-50 group border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                      <BarChart2 size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">SMS Reports</p>
                      <p className="text-[11px] text-muted">View detailed SMS reports</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted" />
                </button>

                <button className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-surface-50 group border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                      <XCircle size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Blocked Numbers</p>
                      <p className="text-[11px] text-muted">Manage blocked numbers</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted" />
                </button>
              </div>
            </div>

            {/* Note Card */}
            <div className="rounded-xl border border-primary/20 bg-[#f4f7ff] p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Info size={16} className="text-primary" />
                <h4 className="font-semibold text-foreground text-sm">Note</h4>
              </div>
              <div className="space-y-3 text-[11px] text-muted leading-relaxed">
                <p>Ensure your SMS gateway balance is sufficient to avoid delivery failures.</p>
                <p>Delivery reports may not be available for all SMS gateways.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default SMSSettings;
