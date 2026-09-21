import React, { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import { getNotificationSettings, saveNotificationSettings } from "../../api/settingsApi";
import { 
  User, 
  ShoppingBag, 
  ClipboardList, 
  Bike, 
  CreditCard, 
  XCircle,
  MessageSquare,
  BadgePercent,
  Megaphone,
  Bell,
  Mail,
  FileText,
  List,
  Settings,
  Info,
  ChevronRight,
  Save
} from "lucide-react";

function NotificationSettings() {
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");
  
  const [emailConfig, setEmailConfig] = useState({
    global: true,
    events: [
      { id: "reg", title: "New User Registration", desc: "When a new user registers", icon: User, color: "text-purple-500", bg: "bg-purple-500/10", admin: true, user: true, partner: false },
      { id: "order", title: "New Order Placed", desc: "When a new order is placed", icon: ShoppingBag, color: "text-green-500", bg: "bg-green-500/10", admin: true, user: true, partner: true },
      { id: "status", title: "Order Status Update", desc: "When order status is updated", icon: ClipboardList, color: "text-orange-500", bg: "bg-orange-500/10", admin: true, user: true, partner: true },
      { id: "delivery", title: "New Delivery Assignment", desc: "When a delivery is assigned", icon: Bike, color: "text-blue-500", bg: "bg-blue-500/10", admin: true, user: false, partner: true },
      { id: "payment", title: "Payment Received", desc: "When a payment is received", icon: CreditCard, color: "text-pink-500", bg: "bg-pink-500/10", admin: true, user: true, partner: false },
      { id: "cancel", title: "Order Cancelled", desc: "When an order is cancelled", icon: XCircle, color: "text-yellow-500", bg: "bg-yellow-500/10", admin: true, user: true, partner: true },
      { id: "complaint", title: "New Complaint", desc: "When a new complaint is submitted", icon: MessageSquare, color: "text-teal-500", bg: "bg-teal-500/10", admin: true, user: true, partner: false },
    ]
  });

  const [pushConfig, setPushConfig] = useState({
    global: true,
    events: [
      { id: "offers", title: "Special Offers & Discounts", desc: "Notify about special offers and discounts", icon: BadgePercent, color: "text-rose-500", bg: "bg-rose-500/10", admin: true, user: true, partner: true },
      { id: "promo", title: "Promotions & Marketing", desc: "Notify about promotions and marketing", icon: Megaphone, color: "text-pink-500", bg: "bg-pink-500/10", admin: true, user: true, partner: false },
      { id: "sys", title: "System Announcements", desc: "Important system announcements", icon: Bell, color: "text-teal-500", bg: "bg-teal-500/10", admin: true, user: true, partner: true },
    ]
  });

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getNotificationSettings();
        if (isMounted && data) {
          setEmailConfig(p => ({ ...p, global: data.emailNotifications ?? true }));
          setPushConfig(p => ({ ...p, global: data.pushNotifications ?? false }));
        }
      } catch (err) {
        console.error("Failed to load notification settings", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const handleSave = async () => {
    try {
      await saveNotificationSettings({
        emailNotifications: emailConfig.global,
        pushNotifications: pushConfig.global,
      });
      setSaveMessage("Notification settings saved successfully.");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save notification settings.");
    }
  };

  const toggleEmailGlobal = () => setEmailConfig(p => ({ ...p, global: !p.global }));
  const togglePushGlobal = () => setPushConfig(p => ({ ...p, global: !p.global }));

  const toggleEmailEvent = (index, field) => {
    const newEvents = [...emailConfig.events];
    newEvents[index][field] = !newEvents[index][field];
    setEmailConfig(p => ({ ...p, events: newEvents }));
  };

  const togglePushEvent = (index, field) => {
    const newEvents = [...pushConfig.events];
    newEvents[index][field] = !newEvents[index][field];
    setPushConfig(p => ({ ...p, events: newEvents }));
  };

  if (loading) return <div className="p-6 text-muted">Loading settings...</div>;

  return (
    <>
      <div className="flex-1 space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex justify-between items-center w-full">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Notification Configuration</h2>
              <p className="text-xs text-muted">Manage and configure system notifications.</p>
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
            
            {/* Main Configuration Card */}
            <div className="rounded-2xl border border-border bg-surface shadow-sm">
              
              {/* Email Notifications Section */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-semibold text-foreground">Email Notifications</h3>
                    <p className="text-[11px] text-muted mt-0.5">Receive email notifications for important events.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-foreground">Enable All Email Notifications</span>
                    <button type="button" onClick={toggleEmailGlobal} className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${emailConfig.global ? "bg-success" : "bg-muted"}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${emailConfig.global ? "translate-x-[18px]" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[600px]">
                    <thead>
                      <tr className="border-b border-border pb-2 text-xs font-semibold text-foreground">
                        <th className="pb-3 w-1/2">Notification Type</th>
                        <th className="pb-3 text-center">Admin</th>
                        <th className="pb-3 text-center">Users</th>
                        <th className="pb-3 text-center">Delivery Partners</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {emailConfig.events.map((evt, idx) => {
                        const Icon = evt.icon;
                        return (
                          <tr key={evt.id}>
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${evt.bg} ${evt.color}`}>
                                  <Icon size={18} />
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground text-[13px]">{evt.title}</p>
                                  <p className="text-[11px] text-muted">{evt.desc}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-center">
                              <button type="button" onClick={() => toggleEmailEvent(idx, 'admin')} className={`inline-flex relative h-5 w-9 rounded-full transition-colors ${evt.admin ? "bg-success" : "bg-muted"}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${evt.admin ? "translate-x-[18px]" : "translate-x-0.5"}`} />
                              </button>
                            </td>
                            <td className="py-4 text-center">
                              <button type="button" onClick={() => toggleEmailEvent(idx, 'user')} className={`inline-flex relative h-5 w-9 rounded-full transition-colors ${evt.user ? "bg-success" : "bg-muted"}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${evt.user ? "translate-x-[18px]" : "translate-x-0.5"}`} />
                              </button>
                            </td>
                            <td className="py-4 text-center">
                              <button type="button" onClick={() => toggleEmailEvent(idx, 'partner')} className={`inline-flex relative h-5 w-9 rounded-full transition-colors ${evt.partner ? "bg-success" : "bg-muted"}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${evt.partner ? "translate-x-[18px]" : "translate-x-0.5"}`} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Push Notifications Section */}
              <div className="p-6 border-t border-border">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-semibold text-foreground">Push Notifications</h3>
                    <p className="text-[11px] text-muted mt-0.5">Receive push notifications on your device.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-foreground">Enable All Push Notifications</span>
                    <button type="button" onClick={togglePushGlobal} className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${pushConfig.global ? "bg-success" : "bg-muted"}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${pushConfig.global ? "translate-x-[18px]" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[600px]">
                    <thead>
                      <tr className="border-b border-border pb-2 text-xs font-semibold text-foreground">
                        <th className="pb-3 w-1/2">Notification Type</th>
                        <th className="pb-3 text-center">Admin</th>
                        <th className="pb-3 text-center">Users</th>
                        <th className="pb-3 text-center">Delivery Partners</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {pushConfig.events.map((evt, idx) => {
                        const Icon = evt.icon;
                        return (
                          <tr key={evt.id}>
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${evt.bg} ${evt.color}`}>
                                  <Icon size={18} />
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground text-[13px]">{evt.title}</p>
                                  <p className="text-[11px] text-muted">{evt.desc}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-center">
                              <button type="button" onClick={() => togglePushEvent(idx, 'admin')} className={`inline-flex relative h-5 w-9 rounded-full transition-colors ${evt.admin ? "bg-success" : "bg-muted"}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${evt.admin ? "translate-x-[18px]" : "translate-x-0.5"}`} />
                              </button>
                            </td>
                            <td className="py-4 text-center">
                              <button type="button" onClick={() => togglePushEvent(idx, 'user')} className={`inline-flex relative h-5 w-9 rounded-full transition-colors ${evt.user ? "bg-success" : "bg-muted"}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${evt.user ? "translate-x-[18px]" : "translate-x-0.5"}`} />
                              </button>
                            </td>
                            <td className="py-4 text-center">
                              <button type="button" onClick={() => togglePushEvent(idx, 'partner')} className={`inline-flex relative h-5 w-9 rounded-full transition-colors ${evt.partner ? "bg-success" : "bg-muted"}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${evt.partner ? "translate-x-[18px]" : "translate-x-0.5"}`} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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
        </div>
      </div>`r`n      </>
  );
}

export default NotificationSettings;
