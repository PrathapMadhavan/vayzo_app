import React, { useState } from "react";
import Button from "../../components/ui/button";
import Select from "../../components/ui/Select";
import { 
  Eye, 
  Mail, 
  FileText, 
  AlertCircle, 
  XCircle, 
  CheckCircle, 
  Lightbulb,
  ChevronRight
} from "lucide-react";

function EmailSettings() {
  const [toggles, setToggles] = useState({
    enableSending: true,
    htmlEmail: true,
    setAsDefault: true,
    emailLogging: true,
  });

  const toggleSetting = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <div className="flex-1 space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">Email Settings</h2>
          <p className="text-xs text-muted">Configure global email preferences.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[2.5fr_1fr] items-start">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            
            {/* SMTP Configuration */}
            <div className="rounded-2xl border border-border bg-surface shadow-sm p-5">
              <h3 className="font-semibold text-foreground text-sm mb-1">SMTP Configuration</h3>
              <p className="text-xs text-muted mb-6">Configure your SMTP email settings to send emails from the platform.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-medium text-foreground mb-2 block">Mail Driver</label>
                  <Select defaultValue="SMTP" className="h-[38px] text-sm">
                    <option>SMTP</option>
                    <option>SendGrid</option>
                    <option>Mailgun</option>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-2 block">Encryption</label>
                  <Select defaultValue="TLS" className="h-[38px] text-sm">
                    <option>TLS</option>
                    <option>SSL</option>
                    <option>None</option>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-2 block">Host</label>
                  <input type="text" defaultValue="smtp.mailtrap.io" className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-2 block">From Name</label>
                  <input type="text" defaultValue="VAYZO" className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-2 block">Port</label>
                  <input type="text" defaultValue="587" className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-2 block">From Email</label>
                  <input type="text" defaultValue="no-reply@vayzo.com" className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-2 block">Username</label>
                  <input type="text" defaultValue="vayzo@mailtrap.io" className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-2 block">Password</label>
                  <div className="relative">
                    <input type="password" defaultValue="************************" className="w-full rounded-md border border-border bg-surface pl-3 pr-10 py-2 text-sm focus:border-primary outline-none" />
                    <Eye size={16} className="absolute right-3 top-2.5 text-muted cursor-pointer hover:text-foreground" />
                  </div>
                </div>
              </div>
            </div>

            {/* Email Settings */}
            <div className="rounded-2xl border border-border bg-surface shadow-sm p-5">
              <h3 className="font-semibold text-foreground text-sm mb-1">Email Settings</h3>
              <p className="text-xs text-muted mb-6">Configure global email preferences.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Enable Email Sending</p>
                    <p className="text-[11px] text-muted mt-0.5">Turn on to allow system to send emails.</p>
                  </div>
                  <button type="button" onClick={() => toggleSetting('enableSending')} className={`relative h-5 w-9 rounded-full transition-colors ${toggles.enableSending ? "bg-primary" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${toggles.enableSending ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                  </button>
                </div>

                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Set as Default</p>
                    <p className="text-[11px] text-muted mt-0.5">Use this configuration as the default.</p>
                  </div>
                  <button type="button" onClick={() => toggleSetting('setAsDefault')} className={`relative h-5 w-9 rounded-full transition-colors ${toggles.setAsDefault ? "bg-primary" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${toggles.setAsDefault ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                  </button>
                </div>

                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Enable HTML Email</p>
                    <p className="text-[11px] text-muted mt-0.5">Send emails in HTML format.</p>
                  </div>
                  <button type="button" onClick={() => toggleSetting('htmlEmail')} className={`relative h-5 w-9 rounded-full transition-colors ${toggles.htmlEmail ? "bg-primary" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${toggles.htmlEmail ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                  </button>
                </div>

                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Email Logging</p>
                    <p className="text-[11px] text-muted mt-0.5">Log all email activities for debugging.</p>
                  </div>
                  <button type="button" onClick={() => toggleSetting('emailLogging')} className={`relative h-5 w-9 rounded-full transition-colors ${toggles.emailLogging ? "bg-primary" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${toggles.emailLogging ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Email Test */}
            <div className="rounded-2xl border border-border bg-surface shadow-sm p-5 relative">
              <h3 className="font-semibold text-foreground text-sm mb-1">Email Test</h3>
              <p className="text-xs text-muted mb-6">Send a test email to verify your email configuration is working correctly.</p>
              
              <div className="flex items-end gap-4 max-w-lg">
                <div className="flex-1">
                  <label className="text-[11px] font-medium text-muted mb-2 block">Test Email Address</label>
                  <input type="text" placeholder="Enter email address" className="w-full rounded-md border border-border bg-surface px-3 h-[38px] text-sm focus:border-primary outline-none placeholder:text-muted/60" />
                </div>
                <Button variant="outline" className="h-[38px] px-6 text-primary border-primary hover:bg-primary-light">Send Test Email</Button>
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
            
            {/* Email Settings Status */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <h3 className="mb-2 font-semibold text-foreground text-sm">Email Settings Status</h3>
              <p className="text-[11px] text-muted mb-5">Overview of your email delivery system.</p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-foreground">Email Service</span>
                  <span className="rounded bg-success/10 px-2 py-0.5 font-medium text-success">Active</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-foreground">Last Test Email</span>
                  <span className="text-muted font-medium">2 mins ago</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-foreground">Email Queue</span>
                  <span className="text-foreground font-medium">0</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-foreground">Failed Emails</span>
                  <span className="text-foreground font-medium">0</span>
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
                      <Mail size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Email Templates</p>
                      <p className="text-[11px] text-muted">Manage email templates</p>
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
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Email Log</p>
                      <p className="text-[11px] text-muted">View email activity logs</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted" />
                </button>

                <button className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-surface-50 group border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                      <AlertCircle size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Queue Failed Emails</p>
                      <p className="text-[11px] text-muted">View and retry failed emails</p>
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
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Email Blacklist</p>
                      <p className="text-[11px] text-muted">Manage email blacklist</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted" />
                </button>

                <button className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-surface-50 group border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                      <CheckCircle size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Email Whitelist</p>
                      <p className="text-[11px] text-muted">Manage email whitelist</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted" />
                </button>
              </div>
            </div>

            {/* Tips Card */}
            <div className="rounded-xl border border-primary/20 bg-[#f4f7ff] p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={16} className="text-primary" />
                <h4 className="font-semibold text-foreground text-sm">Tips</h4>
              </div>
              <div className="space-y-4 text-[11px] text-muted leading-relaxed">
                <p>Ensure your SMTP credentials are correct for smooth email delivery.</p>
                <p>We recommend using dedicated email services for production.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default EmailSettings;
