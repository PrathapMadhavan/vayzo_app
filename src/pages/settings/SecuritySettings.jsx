import React, { useState } from "react";
import Button from "../../components/ui/button";
import Select from "../../components/ui/Select";
import { 
  ShieldCheck,
  Monitor,
  Key,
  Shield,
  Mail,
  Clock,
  Lock,
  MapPin,
  RefreshCw,
  Edit2,
  Check,
  Smartphone,
  ArrowRight,
  CheckCircle
} from "lucide-react";

function SecuritySettings() {
  const [toggles, setToggles] = useState({
    twoFactor: true,
    loginNotification: true,
    forceHttps: true,
    recaptcha: true,
  });

  const toggleSetting = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <div className="flex-1 space-y-6 pb-10">
        
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">Security Settings</h2>
          <p className="text-xs text-muted">Manage and monitor your platform security to keep your data and users safe.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[2.5fr_1fr] items-start">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            
            {/* Security Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-border bg-surface p-4 text-center shadow-sm flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-success/10 text-success flex items-center justify-center mb-3">
                  <Lock size={18} />
                </div>
                <h4 className="font-semibold text-foreground text-sm mb-1">Two Factor Auth</h4>
                <span className="text-xs font-semibold text-success mb-1">Enabled</span>
                <p className="text-[10px] text-muted">Protects admin accounts</p>
              </div>
              
              <div className="rounded-xl border border-border bg-surface p-4 text-center shadow-sm flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
                  <Monitor size={18} />
                </div>
                <h4 className="font-semibold text-foreground text-sm mb-1">Login Sessions</h4>
                <span className="text-xs font-semibold text-success mb-1">3 Active</span>
                <p className="text-[10px] text-muted">Manage active sessions</p>
              </div>

              <div className="rounded-xl border border-border bg-surface p-4 text-center shadow-sm flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mb-3">
                  <Key size={18} />
                </div>
                <h4 className="font-semibold text-foreground text-sm mb-1">Password Policy</h4>
                <span className="text-xs font-semibold text-orange-500 mb-1">Strong</span>
                <p className="text-[10px] text-muted">Enforced for all users</p>
              </div>

              <div className="rounded-xl border border-border bg-surface p-4 text-center shadow-sm flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <ShieldCheck size={18} />
                </div>
                <h4 className="font-semibold text-foreground text-sm mb-1">Last Security Scan</h4>
                <span className="text-xs font-semibold text-success mb-1">2 days ago</span>
                <p className="text-[10px] text-muted">No threats found</p>
              </div>
            </div>

            {/* Authentication & Access */}
            <div className="rounded-2xl border border-border bg-surface shadow-sm p-5">
              <h3 className="font-semibold text-foreground text-sm mb-6">Authentication & Access</h3>
              
              <div className="space-y-6">
                
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary p-2 rounded-lg"><Shield size={18} /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Two Factor Authentication (2FA)</p>
                      <p className="text-[11px] text-muted mt-0.5">Require 2FA for all admin users to add an extra layer of security.</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => toggleSetting('twoFactor')} className={`relative h-5 w-9 rounded-full transition-colors ${toggles.twoFactor ? "bg-primary" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${toggles.twoFactor ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary p-2 rounded-lg"><Mail size={18} /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Login Notification</p>
                      <p className="text-[11px] text-muted mt-0.5">Get notified via email on new login to your account.</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => toggleSetting('loginNotification')} className={`relative h-5 w-9 rounded-full transition-colors ${toggles.loginNotification ? "bg-primary" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${toggles.loginNotification ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary p-2 rounded-lg"><Clock size={18} /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Session Timeout</p>
                      <p className="text-[11px] text-muted mt-0.5">Automatically log out inactive users after a period of time.</p>
                    </div>
                  </div>
                  <Select defaultValue="30 Minutes" className="h-[38px] text-sm w-40">
                    <option>15 Minutes</option>
                    <option>30 Minutes</option>
                    <option>1 Hour</option>
                  </Select>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary p-2 rounded-lg"><Lock size={18} /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Maximum Login Attempts</p>
                      <p className="text-[11px] text-muted mt-0.5">Lock account after multiple failed login attempts.</p>
                    </div>
                  </div>
                  <Select defaultValue="5 Attempts" className="h-[38px] text-sm w-40">
                    <option>3 Attempts</option>
                    <option>5 Attempts</option>
                    <option>10 Attempts</option>
                  </Select>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary p-2 rounded-lg"><MapPin size={18} /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">IP Whitelist</p>
                      <p className="text-[11px] text-muted mt-0.5">Allow login access only from specific IP addresses.</p>
                    </div>
                  </div>
                  <Button variant="outline" className="h-[38px] text-primary border-primary hover:bg-primary-light">Manage IPs</Button>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary p-2 rounded-lg"><Clock size={18} /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Account Lockout Duration</p>
                      <p className="text-[11px] text-muted mt-0.5">Locked accounts will be automatically unlocked after this duration.</p>
                    </div>
                  </div>
                  <Select defaultValue="30 Minutes" className="h-[38px] text-sm w-40">
                    <option>15 Minutes</option>
                    <option>30 Minutes</option>
                    <option>1 Hour</option>
                  </Select>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary p-2 rounded-lg"><ShieldCheck size={18} /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Force HTTPS</p>
                      <p className="text-[11px] text-muted mt-0.5">Redirect all requests to secure HTTPS connection.</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => toggleSetting('forceHttps')} className={`relative h-5 w-9 rounded-full transition-colors ${toggles.forceHttps ? "bg-primary" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${toggles.forceHttps ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary p-2 rounded-lg"><RefreshCw size={18} /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">ReCAPTCHA</p>
                      <p className="text-[11px] text-muted mt-0.5">Enable Google reCAPTCHA on login page.</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => toggleSetting('recaptcha')} className={`relative h-5 w-9 rounded-full transition-colors ${toggles.recaptcha ? "bg-primary" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${toggles.recaptcha ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                  </button>
                </div>

              </div>
            </div>

            {/* Password Policy & Save */}
            <div className="rounded-2xl border border-border bg-surface shadow-sm p-5 relative">
              <h3 className="font-semibold text-foreground text-sm mb-1">Password Policy</h3>
              <p className="text-[11px] text-muted mb-5">Configure password requirements for all users.</p>
              
              <div className="flex flex-wrap items-center gap-2 max-w-3xl mb-10">
                <div className="flex items-center gap-2 bg-success/5 border border-success/10 rounded-md py-1.5 px-3">
                  <Check size={14} className="text-success" />
                  <div>
                    <p className="text-[10px] font-medium text-foreground">Minimum Length</p>
                    <p className="text-[9px] text-muted">8 Characters</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-success/5 border border-success/10 rounded-md py-1.5 px-3">
                  <Check size={14} className="text-success" />
                  <div>
                    <p className="text-[10px] font-medium text-foreground">Uppercase Letters</p>
                    <p className="text-[9px] text-muted">Required</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-success/5 border border-success/10 rounded-md py-1.5 px-3">
                  <Check size={14} className="text-success" />
                  <div>
                    <p className="text-[10px] font-medium text-foreground">Lowercase Letters</p>
                    <p className="text-[9px] text-muted">Required</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-success/5 border border-success/10 rounded-md py-1.5 px-3">
                  <Check size={14} className="text-success" />
                  <div>
                    <p className="text-[10px] font-medium text-foreground">Numbers</p>
                    <p className="text-[9px] text-muted">Required</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-success/5 border border-success/10 rounded-md py-1.5 px-3">
                  <Check size={14} className="text-success" />
                  <div>
                    <p className="text-[10px] font-medium text-foreground">Special Characters</p>
                    <p className="text-[9px] text-muted">Required</p>
                  </div>
                </div>
              </div>

              {/* Absolute Buttons to match the design spacing */}
              <div className="absolute right-5 bottom-[70px]">
                <Button className="bg-primary text-white flex items-center gap-2">
                  <Edit2 size={14} /> Edit Policy
                </Button>
              </div>

              <div className="absolute right-5 bottom-5">
                <Button className="bg-primary text-white flex items-center gap-2">
                  <Check size={16} /> Save Changes
                </Button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            
            {/* Security Status Gauge */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <h3 className="mb-1 font-semibold text-foreground text-sm">Security Status</h3>
              <p className="text-[11px] text-muted mb-6">Overall security strength of your platform.</p>
              
              <div className="flex flex-col items-center justify-center mb-6 relative">
                {/* Gauge SVG */}
                <svg viewBox="0 0 100 55" className="w-48 h-auto overflow-visible">
                  {/* Track */}
                  <path 
                    d="M 10 50 A 40 40 0 0 1 90 50" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                    className="text-muted/20"
                  />
                  {/* Progress (Strong -> Green) */}
                  <path 
                    d="M 10 50 A 40 40 0 0 1 90 50" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                    strokeDasharray="125.6"
                    strokeDashoffset="25.12" // 80% filled
                    className="text-success"
                  />
                </svg>
                
                <div className="absolute bottom-2 flex flex-col items-center">
                  <div className="h-6 w-6 rounded-full border border-success text-success flex items-center justify-center mb-1">
                    <ShieldCheck size={14} />
                  </div>
                  <h4 className="font-bold text-foreground text-lg leading-tight">Strong</h4>
                  <p className="text-[9px] text-muted">Your platform is secure</p>
                </div>
              </div>

              <div className="space-y-2 mt-2 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle size={14} className="text-success shrink-0" />
                  <span className="text-muted">No critical vulnerabilities</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle size={14} className="text-success shrink-0" />
                  <span className="text-muted">All security systems are active</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle size={14} className="text-success shrink-0" />
                  <span className="text-muted">Regular security scan enabled</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle size={14} className="text-success shrink-0" />
                  <span className="text-muted">Platform is up to date</span>
                </div>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <h3 className="mb-1 font-semibold text-foreground text-sm">Active Sessions</h3>
              <p className="text-[11px] text-muted mb-5">Manage all active login sessions.</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Monitor size={16} className="text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">Windows • Chrome</p>
                      <p className="text-[10px] text-muted">Chennai, India</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block border border-primary text-primary text-[9px] font-semibold px-2 py-0.5 rounded-full mb-1">Current Session</span>
                    <p className="text-[9px] text-muted">Just now</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Smartphone size={16} className="text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">Android • Chrome</p>
                      <p className="text-[10px] text-muted">Bangalore, India</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-[9px] text-muted">2 hours ago</p>
                    <button className="border border-danger text-danger text-[10px] font-medium px-2 py-0.5 rounded hover:bg-danger/5 transition-colors">Terminate</button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Monitor size={16} className="text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">Windows • Edge</p>
                      <p className="text-[10px] text-muted">Mumbai, India</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-[9px] text-muted">1 day ago</p>
                    <button className="border border-danger text-danger text-[10px] font-medium px-2 py-0.5 rounded hover:bg-danger/5 transition-colors">Terminate</button>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <a href="#" className="text-primary text-xs font-semibold hover:underline flex items-center gap-1">
                  View All Sessions <ArrowRight size={14} />
                </a>
              </div>
            </div>

            {/* Security Logs (Recent) */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <h3 className="mb-1 font-semibold text-foreground text-sm">Security Logs (Recent)</h3>
              <p className="text-[11px] text-muted mb-5">View recent security related activities.</p>
              
              <div className="space-y-4">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-success mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">Successful login</p>
                      <p className="text-[10px] text-muted">admin@vayzo.com</p>
                    </div>
                  </div>
                  <p className="text-[9px] text-muted">Just now</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">Password changed</p>
                      <p className="text-[10px] text-muted">admin@vayzo.com</p>
                    </div>
                  </div>
                  <p className="text-[9px] text-muted">2 days ago</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-danger mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">Failed login attempt</p>
                      <p className="text-[10px] text-muted">admin@vayzo.com</p>
                    </div>
                  </div>
                  <p className="text-[9px] text-muted">3 days ago</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">Login from new device</p>
                      <p className="text-[10px] text-muted">admin@vayzo.com</p>
                    </div>
                  </div>
                  <p className="text-[9px] text-muted">5 days ago</p>
                </div>

              </div>

              <div className="mt-5">
                <a href="#" className="text-primary text-xs font-semibold hover:underline flex items-center gap-1">
                  View All Logs <ArrowRight size={14} />
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default SecuritySettings;
