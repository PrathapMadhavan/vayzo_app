import { useState, useEffect } from "react";
import { ArrowLeft, Tag } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import { createOffer, getOfferById, updateOffer } from "../api/offersApi";

export default function OffersAdd() {
  const navigate = useNavigate();
  const { offerId } = useParams();
  const isEditing = !!offerId;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    title: "",
    type: "Select offer type",
    discountValue: "",
    discountType: "% Percentage",
    minOrderValue: "",
    maxDiscount: "",
    validFrom: "",
    validTo: "",
    noExpiry: false,
    appliesTo: "All Restaurants",
    users: "All Users",
    usageLimit: "",
    unlimitedUsage: false,
    description: "",
    status: "ACTIVE"
  });

  const [dbId, setDbId] = useState(null);

  useEffect(() => {
    if (!isEditing) return;
    const loadOffer = async () => {
      try {
        setLoading(true);
        const data = await getOfferById(offerId);
        setDbId(data.id);
        
        let discountVal = "";
        let discountType = "% Percentage";
        if (data.discountText) {
          const num = data.discountText.replace(/[^0-9]/g, "");
          discountVal = num;
          discountType = data.discountText.includes("%") ? "% Percentage" : "₹ Flat";
        }
        
        let minOrder = "";
        let maxDisc = "";
        if (data.discountDetail) {
          const matches = data.discountDetail.match(/\d+/g);
          if (matches && matches.length >= 2) {
            maxDisc = matches[0];
            minOrder = matches[1];
          } else if (matches && matches.length === 1) {
            minOrder = matches[0];
          }
        }
        
        setForm(prev => ({
          ...prev,
          name: data.name || "",
          title: data.title || "",
          type: data.type === "Discount" ? "Percentage" : (data.type || "Select offer type"),
          discountValue: discountVal,
          discountType: discountType,
          minOrderValue: minOrder,
          maxDiscount: maxDisc,
          validFrom: data.validFrom || "",
          validTo: data.validTo === "2099-12-31" ? "" : (data.validTo || ""),
          noExpiry: data.validTo === "2099-12-31",
          usageLimit: data.usageMax === 99999 ? "" : (data.usageLimit || ""),
          unlimitedUsage: data.usageMax === 99999,
          description: data.description || "",
          status: data.status || "ACTIVE"
        }));
      } catch (err) {
        setError("Unable to load offer details.");
      } finally {
        setLoading(false);
      }
    };
    loadOffer();
  }, [offerId, isEditing]);

  const update = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.type === "Select offer type") {
      alert("Please select a valid type.");
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        name: form.name,
        title: form.title,
        type: form.type === "Percentage" ? "Discount" : form.type, // Map UI type to DB type if needed, but let's just use what they chose
        discountText: `${form.discountValue}${form.discountType.includes("%") ? "%" : "₹"} OFF`,
        discountDetail: `Up to ₹${form.maxDiscount} on orders above ₹${form.minOrderValue}`,
        usageLimit: Number(form.usageLimit) || 0,
        usageMax: form.unlimitedUsage ? 99999 : Number(form.usageLimit) || 1,
        validFrom: form.validFrom,
        validTo: form.noExpiry ? "2099-12-31" : form.validTo,
        status: form.status,
        color: "primary",
        platform: "App" // Default mock
      };

      if (isEditing) {
        await updateOffer(dbId, payload);
      } else {
        await createOffer(payload);
      }
      navigate("/offers");
    } catch (err) {
      setError("Unable to create offer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-full bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,2.2fr)_minmax(300px,0.8fr)] items-start">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col rounded-xl border border-border bg-surface shadow-sm"
          >
            <div className="border-b border-border p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/offers")}
                  className="mr-1 rounded-md p-1 hover:bg-background transition-colors text-muted hover:text-foreground"
                >
                  <ArrowLeft size={18} />
                </button>
                {isEditing ? "Edit Offer" : "Create New Offer"}
              </h2>

              <div className="mt-8 grid gap-8 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Offer Name <span className="text-danger">*</span></label>
                  <Input placeholder="Enter offer name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Offer Code <span className="text-danger">*</span></label>
                  <div className="flex gap-2">
                    <Input placeholder="Enter code (e.g. SAVE20)" className="flex-1" value={form.title} onChange={(e) => update("title", e.target.value)} required />
                    <Button type="button" variant="secondary" className="px-4 shrink-0 font-semibold border-primary/20 text-primary bg-primary/5">Check</Button>
                  </div>
                  <span className="text-[10px] text-muted ml-1">Customers will use this code at checkout</span>
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Offer Type <span className="text-danger">*</span></label>
                  <Select 
                    options={["Select offer type", "Percentage", "Flat Discount", "Free Delivery"]} 
                    value={form.type} 
                    onChange={(e) => update("type", e.target.value)} 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Discount Value <span className="text-danger">*</span></label>
                  <Input placeholder="0" type="number" value={form.discountValue} onChange={(e) => update("discountValue", e.target.value)} required />
                </div>

                <div className="flex flex-col gap-1.5 justify-end">
                  <Select 
                    options={["% Percentage", "₹ Flat"]} 
                    value={form.discountType} 
                    onChange={(e) => update("discountType", e.target.value)} 
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground text-xs truncate">Minimum Order Value (₹)</label>
                  <Input placeholder="0" type="number" value={form.minOrderValue} onChange={(e) => update("minOrderValue", e.target.value)} />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground text-xs truncate">Maximum Discount (₹)</label>
                  <Input placeholder="0" type="number" value={form.maxDiscount} onChange={(e) => update("maxDiscount", e.target.value)} />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Validity <span className="text-danger">*</span></label>
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <Input placeholder="Start Date" type="date" className="flex-1 w-full" value={form.validFrom} onChange={(e) => update("validFrom", e.target.value)} required={!form.noExpiry} />
                    <span className="text-muted hidden sm:inline">→</span>
                    <Input placeholder="End Date" type="date" className="flex-1 w-full" value={form.validTo} onChange={(e) => update("validTo", e.target.value)} disabled={form.noExpiry} required={!form.noExpiry} />
                  </div>
                  <label className="flex items-center gap-2 mt-1">
                    <input type="checkbox" checked={form.noExpiry} onChange={(e) => update("noExpiry", e.target.checked)} className="rounded border-muted text-primary focus:ring-primary h-4 w-4" />
                    <span className="text-sm text-muted">No Expiry</span>
                  </label>
                </div>
                
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Usage Limit</label>
                  <div className="flex items-center gap-4">
                    <Input placeholder="0" type="number" className="w-32" value={form.usageLimit} onChange={(e) => update("usageLimit", e.target.value)} disabled={form.unlimitedUsage} />
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={form.unlimitedUsage} onChange={(e) => update("unlimitedUsage", e.target.checked)} className="rounded border-muted text-primary focus:ring-primary h-4 w-4" />
                      <span className="text-sm text-muted">Unlimited</span>
                    </label>
                  </div>
                </div>

              </div>

              <div className="mt-8">
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Description (Optional)
                </label>
                <textarea
                  className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  rows={4}
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Enter a brief description..."
                />
              </div>
              
              <div className="flex flex-col gap-2 mt-6">
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <div className="flex gap-6 mt-1 mb-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="status" checked={form.status === "ACTIVE"} onChange={() => update("status", "ACTIVE")} className="text-primary focus:ring-primary h-4 w-4" />
                      <span className="text-sm font-bold text-foreground">Active Now</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="status" checked={form.status === "SCHEDULED"} onChange={() => update("status", "SCHEDULED")} className="text-primary focus:ring-primary h-4 w-4" />
                      <span className="text-sm text-muted">Schedule</span>
                    </label>
                  </div>
              </div>

              {error && (
                <div className="mt-6 rounded-xl border border-danger/30 bg-danger/5 p-4 text-center text-sm font-medium text-danger">
                  {error}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end gap-3 p-6 sm:p-8 bg-background/50 rounded-b-xl">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/offers")}
                className="px-6"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" className="px-8" disabled={loading}>
                {loading ? "Saving..." : isEditing ? "Save Changes" : "Create Offer"}
              </Button>
            </div>
          </form>

          {/* Right Side Panel */}
          <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm flex flex-col items-center text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Tag size={32} />
              </div>
              <h3 className="mb-1 font-semibold text-foreground">
                {isEditing ? "Edit Offer" : "New Offer Setup"}
              </h3>
              <p className="text-sm text-muted mb-4">
                Configure discounts and promotional offers. Ensure conditions are set correctly to maximize engagement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
