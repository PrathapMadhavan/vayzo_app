import React, { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import { getSMSSettings, saveSMSSettings } from "../../api/settingsApi";
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
  ChevronRight,
  Save
} from "lucide-react";

function SMSSettings() {
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");
  
  const [provider, setProvider] = useState("Twilio");
  const [apiKey, setApiKey] = useState("");

  const [toggles, setToggles] = useState({
    deliveryReport: true,
    enableSms: true,
    retryFailed: true,
    unicode: true,
    urlShorten: false,
  });

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getSMSSettings();
        if (isMounted && data) {
          setProvider(data.provider || "Twilio");
          setApiKey(data.apiKey || "");
        }
      } catch (err) {
        console.error("Failed to load SMS settings", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const handleSave = async () => {
    try {
      await saveSMSSettings({
        provider,
        apiKey,
      });
      setSaveMessage("SMS settings saved successfully.");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save SMS settings.");
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
              <h2 className="text-lg font-semibold text-foreground">SMS Settings</h2>
              <p className="text-xs text-muted">Configure global SMS preferences.</p>
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
                    <Select value={provider} onChange={(e) => setProvider(e.target.value)} className="h-[38px] text-sm">
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
                    <label className="text-xs font-medium text-foreground mb-2 block">Auth Token (API Key)</label>
                    <div className="relative">
                      <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="w-full rounded-md border border-border bg-surface pl-3 pr-10 py-2 text-sm focus:border-primary outline-none" />
                      <Eye size={16} className="absolute right-3 top-2.5 text-muted cursor-pointer hover:text-foreground" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-6">
                    <div>
                      <p className="text-sm font-medium text-foreground">Delivery Report</p>
                      <p className="text-[11px] text-muted">Receive delivery status for sent SMS</p>
                    </div>
                    <button type="button" onClick={() => toggleSetting('deliveryReport')} className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${toggles.deliveryReport ? "bg-success" : "bg-muted"}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${toggles.deliveryReport ? "translate-x-[18px]" : "translate-x-0.5"}`} />
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
                  <button type="button" onClick={() => toggleSetting('enableSms')} className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${toggles.enableSms ? "bg-primary" : "bg-muted"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${toggles.enableSms ? "translate-x-[18px]" : "translate-x-0.5"}`} />
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
                    <button type="button" onClick={() => toggleSetting('retryFailed')} className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${toggles.retryFailed ? "bg-primary" : "bg-muted"}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${toggles.retryFailed ? "translate-x-[18px]" : "translate-x-0.5"}`} />
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
                  <button type="button" onClick={() => toggleSetting('unicode')} className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${toggles.unicode ? "bg-primary" : "bg-muted"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${toggles.unicode ? "translate-x-[18px]" : "translate-x-0.5"}`} />
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
                  <button type="button" onClick={() => toggleSetting('urlShorten')} className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${toggles.urlShorten ? "bg-primary" : "bg-muted"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${toggles.urlShorten ? "translate-x-[18px]" : "translate-x-0.5"}`} />
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

          </div>
        </div>
      </div>`r`n      </>
  );
}

export default SMSSettings;
