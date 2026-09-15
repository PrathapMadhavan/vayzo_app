import React, { useState } from "react";
import Input from "../../components/ui/input";
import Button from "../../components/ui/button";
import { paymentSettings } from "../../mock/vayzoApiMock";
import { Eye, Edit, GripVertical, CheckCircle2, Circle, ArrowRight, Smartphone, Building2, Banknote, HelpCircle, Receipt, RefreshCcw, HandCoins } from "lucide-react";

function PaymentSettings() {
  const [activeTab, setActiveTab] = useState("Payment Gateways");
  
  const [gateways, setGateways] = useState({
    razorpay: { enabled: true, keyId: "rzp_test_***************", keySecret: "***************" },
    stripe: { enabled: false, pubKey: "pk_test_***************", secKey: "sk_test_***************" },
    paypal: { enabled: false, clientId: "***************", secret: "***************" },
    cod: { enabled: true },
    razorpayUpi: { enabled: true }
  });

  const [methods, setMethods] = useState([
    { id: "upi", label: "UPI", enabled: true, icon: <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-4" /> },
    { id: "card", label: "Credit / Debit Card", enabled: true, icon: <Banknote size={16} className="text-primary" /> },
    { id: "netbanking", label: "Net Banking", enabled: true, icon: <Building2 size={16} className="text-primary" /> },
    { id: "wallet", label: "Wallet", enabled: true, icon: <Smartphone size={16} className="text-success" /> },
    { id: "cod", label: "Cash on Delivery", enabled: true, icon: <Banknote size={16} className="text-success" /> }
  ]);

  const toggleGateway = (id) => {
    setGateways(prev => ({
      ...prev,
      [id]: { ...prev[id], enabled: !prev[id].enabled }
    }));
  };

  const toggleMethod = (index) => {
    const newMethods = [...methods];
    newMethods[index].enabled = !newMethods[index].enabled;
    setMethods(newMethods);
  };

  const tabs = ["Payment Gateways", "UPI Settings", "Wallet Settings", "Refund Settings", "Other Settings"];

  return (
    <section>
      {/* Header (Already handled by App layout, but we'll include Tabs here) */}
      <div className="mb-6 border-b border-border">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2.5fr_1fr] items-start">
        
        {/* LEFT COLUMN: Payment Gateways Settings */}
        <div className="space-y-6">
          
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-foreground">Payment Gateways</h2>
            <p className="text-xs text-muted">Manage and configure your payment gateways.</p>
          </div>

          <div className="space-y-4">
            
            {/* Razorpay */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-32 shrink-0 items-center justify-center rounded-lg border border-border bg-white shadow-sm p-2">
                    {/* Placeholder for Razorpay Logo */}
                    <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" className="h-full object-contain opacity-80" />
                  </div>
                  <div className="space-y-4 pt-1">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-foreground">Razorpay</h3>
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${gateways.razorpay.enabled ? "bg-success/10 text-success" : "bg-muted/10 text-muted"}`}>
                          {gateways.razorpay.enabled ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-1">Accept Card, UPI, Netbanking, Wallet & EMI payments</p>
                    </div>

                    <div className="flex gap-6">
                      <div>
                        <label className="text-[10px] font-medium text-muted">Key ID</label>
                        <div className="mt-1 flex items-center rounded-lg border border-border bg-surface px-3 py-1.5 w-48">
                          <span className="text-xs">{gateways.razorpay.keyId}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-muted">Key Secret</label>
                        <div className="mt-1 flex items-center rounded-lg border border-border bg-surface px-3 py-1.5 w-48 justify-between">
                          <span className="text-xs">{gateways.razorpay.keySecret}</span>
                          <Eye size={12} className="text-muted cursor-pointer hover:text-foreground" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-6 justify-between h-full">
                  <button type="button" onClick={() => toggleGateway("razorpay")} className={`relative h-5 w-9 rounded-full transition-colors ${gateways.razorpay.enabled ? "bg-success" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${gateways.razorpay.enabled ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                  </button>
                  <Button type="button" variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary-light">
                    Edit Settings
                  </Button>
                </div>
              </div>
            </div>

            {/* Stripe */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm opacity-80">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-32 shrink-0 items-center justify-center rounded-lg border border-border bg-white shadow-sm p-2">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-full object-contain" />
                  </div>
                  <div className="space-y-4 pt-1">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-foreground">Stripe</h3>
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${gateways.stripe.enabled ? "bg-success/10 text-success" : "bg-muted/10 text-muted"}`}>
                          {gateways.stripe.enabled ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-1">Accept international card payments</p>
                    </div>

                    <div className="flex gap-6">
                      <div>
                        <label className="text-[10px] font-medium text-muted">Publishable Key</label>
                        <div className="mt-1 flex items-center rounded-lg border border-border bg-surface px-3 py-1.5 w-48">
                          <span className="text-xs">{gateways.stripe.pubKey}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-muted">Secret Key</label>
                        <div className="mt-1 flex items-center rounded-lg border border-border bg-surface px-3 py-1.5 w-48 justify-between">
                          <span className="text-xs">{gateways.stripe.secKey}</span>
                          <Eye size={12} className="text-muted cursor-pointer hover:text-foreground" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-6 justify-between h-full">
                  <button type="button" onClick={() => toggleGateway("stripe")} className={`relative h-5 w-9 rounded-full transition-colors ${gateways.stripe.enabled ? "bg-success" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${gateways.stripe.enabled ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                  </button>
                  <Button type="button" variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary-light">
                    Edit Settings
                  </Button>
                </div>
              </div>
            </div>

            {/* PayPal */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm opacity-80">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-32 shrink-0 items-center justify-center rounded-lg border border-border bg-white shadow-sm p-2">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-8 object-contain" />
                  </div>
                  <div className="space-y-4 pt-1">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-foreground">PayPal</h3>
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${gateways.paypal.enabled ? "bg-success/10 text-success" : "bg-muted/10 text-muted"}`}>
                          {gateways.paypal.enabled ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-1">Accept payments using PayPal</p>
                    </div>

                    <div className="flex gap-6">
                      <div>
                        <label className="text-[10px] font-medium text-muted">Client ID</label>
                        <div className="mt-1 flex items-center rounded-lg border border-border bg-surface px-3 py-1.5 w-48">
                          <span className="text-xs">{gateways.paypal.clientId}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-muted">Secret</label>
                        <div className="mt-1 flex items-center rounded-lg border border-border bg-surface px-3 py-1.5 w-48 justify-between">
                          <span className="text-xs">{gateways.paypal.secret}</span>
                          <Eye size={12} className="text-muted cursor-pointer hover:text-foreground" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-6 justify-between h-full">
                  <button type="button" onClick={() => toggleGateway("paypal")} className={`relative h-5 w-9 rounded-full transition-colors ${gateways.paypal.enabled ? "bg-success" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${gateways.paypal.enabled ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                  </button>
                  <Button type="button" variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary-light">
                    Edit Settings
                  </Button>
                </div>
              </div>
            </div>

            {/* Cash on Delivery */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                    <HandCoins size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">Cash on Delivery</h3>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${gateways.cod.enabled ? "bg-success/10 text-success" : "bg-muted/10 text-muted"}`}>
                        {gateways.cod.enabled ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">Allow customers to pay in cash on delivery</p>
                  </div>
                </div>
                <button type="button" onClick={() => toggleGateway("cod")} className={`relative h-5 w-9 rounded-full transition-colors ${gateways.cod.enabled ? "bg-success" : "bg-muted"}`}>
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${gateways.cod.enabled ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                </button>
              </div>
            </div>

            {/* Razorpay UPI (QR) */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg border border-border bg-white shadow-sm">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">Razorpay UPI (QR)</h3>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${gateways.razorpayUpi.enabled ? "bg-success/10 text-success" : "bg-muted/10 text-muted"}`}>
                        {gateways.razorpayUpi.enabled ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">Accept payments via UPI QR Code</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <button type="button" onClick={() => toggleGateway("razorpayUpi")} className={`relative h-5 w-9 rounded-full transition-colors ${gateways.razorpayUpi.enabled ? "bg-success" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${gateways.razorpayUpi.enabled ? "left-4.5 translate-x-4" : "left-0.5"}`} />
                  </button>
                  <Button type="button" variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary-light">
                    Edit Settings
                  </Button>
                </div>
              </div>
            </div>

          </div>

          {/* Payment Methods (Customer App) */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm mt-6">
            <h3 className="font-semibold text-foreground mb-1">Payment Methods (Customer App)</h3>
            <p className="text-xs text-muted mb-5">Select and sort payment methods to display in customer app.</p>
            
            <div className="flex flex-wrap gap-4">
              {methods.map((method, index) => (
                <div key={method.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-2.5 shadow-sm hover:border-primary/50 cursor-grab active:cursor-grabbing transition-colors">
                  <div className="flex items-center gap-2">
                    {method.icon}
                    <span className="text-sm font-medium">{method.label}</span>
                  </div>
                  <div 
                    onClick={() => toggleMethod(index)}
                    className="ml-2 flex h-5 w-5 cursor-pointer items-center justify-center rounded border border-border bg-surface"
                  >
                    {method.enabled && <CheckCircle2 size={16} className="text-primary bg-white rounded-full" />}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted">
                <GripVertical size={14} />
                <span>Drag and drop to reorder</span>
              </div>
              <Button type="button" size="sm" className="bg-primary text-white px-6">
                Save Changes
              </Button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          {/* Payment Overview */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <h3 className="mb-5 font-semibold text-foreground">Payment Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-foreground">Total Transactions (Today)</span>
                <span className="font-semibold">₹1,25,430.00</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-foreground">Successful Payments</span>
                <span className="font-semibold text-success">₹1,18,560.00</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-foreground">Failed Payments</span>
                <span className="font-semibold text-destructive">₹6,870.00</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-foreground">Refunds (Today)</span>
                <span className="font-semibold">₹2,450.00</span>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-border">
              <a href="#" className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                View Transactions <ArrowRight size={14} />
              </a>
            </div>
          </div>

          {/* Gateway Status */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <h3 className="mb-5 font-semibold text-foreground">Gateway Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-foreground">Razorpay</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-success"><Circle fill="currentColor" size={6} /> Active</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-foreground">Stripe</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted"><Circle fill="currentColor" size={6} /> Inactive</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-foreground">PayPal</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted"><Circle fill="currentColor" size={6} /> Inactive</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-foreground">COD</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-success"><Circle fill="currentColor" size={6} /> Active</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-foreground">Razorpay UPI (QR)</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-success"><Circle fill="currentColor" size={6} /> Active</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-foreground">Quick Links</h3>
            <div className="space-y-1 text-sm">
              <a href="#" className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-primary-light">
                <div className="flex items-center gap-3 text-primary">
                  <div className="bg-primary-light/30 p-1.5 rounded"><RefreshCcw size={16} /></div>
                  <div>
                    <span className="block font-medium">Test Payment</span>
                    <span className="block text-[10px] text-muted">Test all payment gateways</span>
                  </div>
                </div>
                <ArrowRight size={14} className="text-muted" />
              </a>
              <a href="#" className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-primary-light">
                <div className="flex items-center gap-3 text-primary">
                  <div className="bg-primary-light/30 p-1.5 rounded"><Receipt size={16} /></div>
                  <div>
                    <span className="block font-medium">View Transactions</span>
                    <span className="block text-[10px] text-muted">View all payment transactions</span>
                  </div>
                </div>
                <ArrowRight size={14} className="text-muted" />
              </a>
              <a href="#" className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-primary-light">
                <div className="flex items-center gap-3 text-primary">
                  <div className="bg-primary-light/30 p-1.5 rounded"><RefreshCcw size={16} /></div>
                  <div>
                    <span className="block font-medium">Refund Requests</span>
                    <span className="block text-[10px] text-muted">View refund requests</span>
                  </div>
                </div>
                <ArrowRight size={14} className="text-muted" />
              </a>
              <a href="#" className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-primary-light">
                <div className="flex items-center gap-3 text-primary">
                  <div className="bg-primary-light/30 p-1.5 rounded"><Banknote size={16} /></div>
                  <div>
                    <span className="block font-medium">Payouts</span>
                    <span className="block text-[10px] text-muted">Manage partner payouts</span>
                  </div>
                </div>
                <ArrowRight size={14} className="text-muted" />
              </a>
            </div>
          </div>

          {/* Note Box */}
          <div className="rounded-xl bg-primary-light/10 p-4 border border-primary/20">
            <div className="flex items-start gap-3">
              <HelpCircle size={18} className="text-primary mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-foreground">Note</h4>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  Don't forget to save changes after updating any payment settings.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default PaymentSettings;
