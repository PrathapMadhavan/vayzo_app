import React, { useState } from "react";
import Button from "../../components/ui/button";
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
  ChevronRight
} from "lucide-react";

function NotificationSettings() {
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

  return (
    <>
      <div className="flex-1 space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">Notification Configuration</h2>
          <p className="text-xs text-muted">Manage and configure system notifications.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[2.5fr_1fr] items-start">
          
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
                    <button type="button" onClick={toggleEmailGlobal} className={`relative h-5 w-9 rounded-full transition-colors ${emailConfig.global ? "bg-success" : "bg-muted"}`}>
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${emailConfig.global ? "left-4.5 translate-x-4" : "left-0.5"}`} />
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
                                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${evt.admin ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                              </button>
                            </td>
                            <td className="py-4 text-center">
                              <button type="button" onClick={() => toggleEmailEvent(idx, 'user')} className={`inline-flex relative h-5 w-9 rounded-full transition-colors ${evt.user ? "bg-success" : "bg-muted"}`}>
                                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${evt.user ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                              </button>
                            </td>
                            <td className="py-4 text-center">
                              <button type="button" onClick={() => toggleEmailEvent(idx, 'partner')} className={`inline-flex relative h-5 w-9 rounded-full transition-colors ${evt.partner ? "bg-success" : "bg-muted"}`}>
                                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${evt.partner ? "left-4.5 translate-x-4" : "left-0.5"}`} />
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
                    <button type="button" onClick={togglePushGlobal} className={`relative h-5 w-9 rounded-full transition-colors ${pushConfig.global ? "bg-success" : "bg-muted"}`}>
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${pushConfig.global ? "left-4.5 translate-x-4" : "left-0.5"}`} />
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
                                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${evt.admin ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                              </button>
                            </td>
                            <td className="py-4 text-center">
                              <button type="button" onClick={() => togglePushEvent(idx, 'user')} className={`inline-flex relative h-5 w-9 rounded-full transition-colors ${evt.user ? "bg-success" : "bg-muted"}`}>
                                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${evt.user ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                              </button>
                            </td>
                            <td className="py-4 text-center">
                              <button type="button" onClick={() => togglePushEvent(idx, 'partner')} className={`inline-flex relative h-5 w-9 rounded-full transition-colors ${evt.partner ? "bg-success" : "bg-muted"}`}>
                                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${evt.partner ? "left-4.5 translate-x-4" : "left-0.5"}`} />
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

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            
            {/* Notification Status */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <h3 className="mb-2 font-semibold text-foreground text-sm">Notification Status</h3>
              <p className="text-[11px] text-muted mb-5">Overview of your notification system.</p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs group cursor-pointer hover:bg-surface-50 p-1 -mx-1 rounded transition-colors">
                  <span className="font-medium text-foreground">Email Notifications</span>
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-success/10 px-2 py-0.5 font-medium text-success">Active</span>
                    <ChevronRight size={14} className="text-muted" />
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs group cursor-pointer hover:bg-surface-50 p-1 -mx-1 rounded transition-colors">
                  <span className="font-medium text-foreground">Push Notifications</span>
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-success/10 px-2 py-0.5 font-medium text-success">Active</span>
                    <ChevronRight size={14} className="text-muted" />
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs group cursor-pointer hover:bg-surface-50 p-1 -mx-1 rounded transition-colors">
                  <span className="font-medium text-foreground">SMS Notifications</span>
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-danger/10 px-2 py-0.5 font-medium text-danger">Inactive</span>
                    <ChevronRight size={14} className="text-muted" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <h3 className="mb-4 font-semibold text-foreground text-sm">Quick Links</h3>
              
              <div className="space-y-2">
                <button className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-surface-50 group border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                      <Mail size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Test Email</p>
                      <p className="text-[11px] text-muted">Send a test email notification</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted" />
                </button>
                
                <button className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-surface-50 group border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                      <Bell size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Test Push Notification</p>
                      <p className="text-[11px] text-muted">Send a test push notification</p>
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
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Notification Templates</p>
                      <p className="text-[11px] text-muted">Manage notification templates</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted" />
                </button>

                <button className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-surface-50 group border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                      <List size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Notification Logs</p>
                      <p className="text-[11px] text-muted">View notification history</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted" />
                </button>

                <button className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-surface-50 group border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                      <Settings size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Custom Settings</p>
                      <p className="text-[11px] text-muted">Configure advanced settings</p>
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
                <p>Changes to notification settings will be applied immediately.</p>
                <p>Users and delivery partners will receive notifications based on their preferences.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default NotificationSettings;
