import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  GripVertical,
  Plus,
  MapPin,
  Clock,
  Lightbulb,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import StatusSelect from "../components/ui/StatusSelect";
import Card from "../components/ui/Card";
import {
  createRestaurant,
  getRestaurantById,
  updateRestaurant,
} from "../api/restaurantsApi";
import { validateImage } from "../utils/fileUtils";
import { RESTAURANT_CUISINES } from "./Restaurants";

function RequiredLabel({ text }) {
  return (
    <span className="flex items-center gap-1">
      {text}
      <span className="text-danger text-sm">*</span>
    </span>
  );
}

function CustomToggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${checked ? "bg-success" : "bg-border"}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-1"}`}
      />
    </button>
  );
}

function RestaurantsAdd() {
  const navigate = useNavigate();
  const { restaurantId } = useParams();
  const isEditing = !!restaurantId;

  const logoInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    cuisines: [],
    description: "",
    ownerName: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    status: "Active",
    deliveryTime: "",
    minimumOrder: "",
    deliveryCharge: "",
    openingTime: "",
    closingTime: "",
    menuItems: [],
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditing) return;
    const fetchRestaurant = async () => {
      try {
        setFetchLoading(true);
        const data = await getRestaurantById(restaurantId);
        setForm((prev) => ({
          ...prev,
          name: data.name || "",
          slug: data.slug || data.name?.toLowerCase().replace(/ /g, "-") || "",
          cuisines:
            data.cuisines ||
            (data.cuisineType
              ? data.cuisineType.split(", ")
              : []),
          description: data.description || "",
          ownerName: data.ownerName || "",
          address: data.address || "",
          city: data.city || "",
          phone: data.phone || "",
          email: data.email || "",
          status: data.status || "Active",
          deliveryTime: data.deliveryTime || "",
          minimumOrder: data.minimumOrder ?? "",
          deliveryCharge: data.deliveryCharge ?? "",
          openingTime: data.openingTime || "",
          closingTime: data.closingTime || "",
          menuItems: data.menuItems || prev.menuItems,
        }));
        if (data.logo) setLogoPreview(data.logo);
        if (data.coverImage) setCoverPreview(data.coverImage);
      } catch {
        setError("Failed to load restaurant details.");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchRestaurant();
  }, [restaurantId, isEditing]);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));



  const removeCuisine = (c) => {
    setForm((prev) => ({
      ...prev,
      cuisines: prev.cuisines.filter((item) => item !== c),
    }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Restaurant name is required.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        cuisineType: form.cuisines.join(", "),
        id: isEditing ? restaurantId : undefined,
        minimumOrder: form.minimumOrder !== "" ? Number(form.minimumOrder) : null,
        deliveryCharge: form.deliveryCharge !== "" ? Number(form.deliveryCharge) : null,
      };

      if (logoPreview && logoPreview.startsWith("blob:")) {
        console.warn("MISSING REQUIREMENT: Image upload endpoint unavailable. Logo preview will not be persisted.");
      } else if (logoPreview) {
        payload.logo = logoPreview;
      }
      
      if (coverPreview && coverPreview.startsWith("blob:")) {
        console.warn("MISSING REQUIREMENT: Image upload endpoint unavailable. Cover preview will not be persisted.");
      } else if (coverPreview) {
        payload.coverImage = coverPreview;
      }
      if (isEditing) {
        await updateRestaurant(restaurantId, { ...payload, id: restaurantId });
      } else {
        await createRestaurant(payload);
      }
      navigate("/restaurants");
    } catch {
      setError("Failed to save restaurant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <section className="min-h-full bg-background p-4 sm:p-6">
        <div className="rounded-xl border border-border bg-surface p-6 text-sm text-muted">
          Loading...
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-full bg-background p-4 sm:p-6 lg:p-8">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6 items-start"
      >
        {/* Left Column */}
        <div className="space-y-6">
          {/* Restaurant Information */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-foreground mb-5">
              Restaurant Information
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input
                  id="rst-name"
                  label={<RequiredLabel text="Restaurant Name" />}
                  value={form.name}
                  onChange={handleChange("name")}
                  placeholder="ABC Cafe"
                />

                <div>
                  <Input
                    id="rst-slug"
                    label={<RequiredLabel text="Restaurant Slug" />}
                    value={form.slug}
                    onChange={handleChange("slug")}
                    placeholder="abc-cafe"
                  />
                  <p className="text-[11px] text-muted mt-1">
                    This will be used in restaurant URL
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    <RequiredLabel text="Cuisine Type" />
                  </label>
                  <div className="min-h-[40px] p-1.5 border border-border rounded-lg bg-background flex flex-wrap gap-2 items-center">
                    {form.cuisines.map((c) => (
                      <div
                        key={c}
                        className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-medium"
                      >
                        {c}
                        <button
                          type="button"
                          onClick={() => removeCuisine(c)}
                          className="hover:text-danger"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <select
                      className="bg-transparent border-none outline-none text-sm flex-1 min-w-[100px] text-muted appearance-none cursor-pointer"
                      value=""
                      onChange={(e) => {
                        if (
                          e.target.value &&
                          !form.cuisines.includes(e.target.value)
                        ) {
                          setForm((prev) => ({
                            ...prev,
                            cuisines: [...prev.cuisines, e.target.value],
                          }));
                        }
                      }}
                    >
                      <option value="" disabled>
                        Select Cuisine
                      </option>
                      {RESTAURANT_CUISINES.map((c) => {
                        const isSelected = form.cuisines.includes(c);
                        return (
                          <option
                            key={c}
                            value={c}
                            disabled={isSelected}
                            className={isSelected ? "text-muted/50" : ""}
                          >
                            {c}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    <RequiredLabel text="Description" />
                  </label>
                  <textarea
                    className="w-full min-h-[80px] p-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                    value={form.description}
                    onChange={handleChange("description")}
                    placeholder="Description..."
                  ></textarea>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-foreground">
                    <RequiredLabel text="Restaurant Logo" />
                  </label>
                  <div className="flex gap-4">
                    <div className="w-[120px] h-[120px] rounded-lg border border-border bg-surface flex items-center justify-center overflow-hidden shrink-0">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          className="w-full h-full object-contain bg-white"
                        />
                      ) : (
                        <span className="text-xs text-muted">No Logo</span>
                      )}
                    </div>
                    <label className="border border-dashed border-border rounded-lg h-[120px] flex-1 bg-background flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-surface transition-colors relative overflow-hidden group">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                        ref={logoInputRef}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              await validateImage(file);
                              const objectUrl = URL.createObjectURL(file);
                              // Note: we need a real upload endpoint to persist this properly.
                              setLogoPreview(objectUrl);
                              setForm((prev) => ({ ...prev, logo: objectUrl }));
                              setError("");
                            } catch (err) {
                              setError(err.message);
                              console.error(err);
                            }
                          }
                        }}
                      />
                      <p className="text-sm font-medium text-primary">
                        Click to upload
                      </p>
                      <p className="text-xs text-muted mt-1">
                        or drag and drop
                      </p>
                      <p className="text-[10px] text-muted mt-0.5">
                        PNG, JPG or WEBP (Max 2MP)
                      </p>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-foreground">
                    <RequiredLabel text="Cover Image" />
                  </label>
                  <label className="border border-dashed border-border rounded-lg h-[160px] bg-background flex items-center justify-center relative overflow-hidden group cursor-pointer block w-full">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/png, image/jpeg, image/webp"
                      ref={coverInputRef}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            await validateImage(file);
                            const objectUrl = URL.createObjectURL(file);
                            // Note: we need a real upload endpoint to persist this properly.
                            setCoverPreview(objectUrl);
                            setForm((prev) => ({ ...prev, coverImage: objectUrl }));
                            setError("");
                          } catch (err) {
                            setError(err.message);
                            console.error(err);
                          }
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-surface/50 hidden group-hover:flex items-center justify-center z-10 backdrop-blur-sm transition-all">
                      <Button
                        size="sm"
                        variant="secondary"
                        type="button"
                        className="pointer-events-none"
                      >
                        Change Image
                      </Button>
                    </div>
                    {coverPreview ? (
                      <img
                        src={coverPreview}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-muted text-sm flex items-center justify-center w-full h-full">
                        Click to select cover image
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {/* Restaurant Details */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-foreground mb-5">
              Restaurant Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <Input
                id="rst-phone"
                label={<RequiredLabel text="Phone Number" />}
                value={form.phone}
                onChange={handleChange("phone")}
                placeholder="+91 98765 43210"
              />

              <div className="relative">
                <Input
                  id="rst-address"
                  label={<RequiredLabel text="Restaurant Address" />}
                  value={form.address}
                  onChange={handleChange("address")}
                  placeholder="123, Anna Salai..."
                />
                <MapPin
                  size={14}
                  className="absolute right-3 bottom-[13px] text-muted"
                />
              </div>

              <Input
                id="rst-email"
                label="Email (Optional)"
                value={form.email}
                onChange={handleChange("email")}
                placeholder="info@abccafe.com"
                type="email"
              />

              <Input
                id="rst-delivery-time"
                label={<RequiredLabel text="Delivery Time (e.g. 30-40 mins)" />}
                value={form.deliveryTime}
                onChange={handleChange("deliveryTime")}
                placeholder="30-40 mins"
              />

              <div className="relative">
                <Input
                  id="rst-opening"
                  label={<RequiredLabel text="Opening Time" />}
                  value={form.openingTime}
                  onChange={handleChange("openingTime")}
                  placeholder="08:00 AM"
                />
                <Clock
                  size={14}
                  className="absolute right-3 bottom-[13px] text-muted"
                />
              </div>

              <div className="relative">
                <Input
                  id="rst-closing"
                  label={<RequiredLabel text="Closing Time" />}
                  value={form.closingTime}
                  onChange={handleChange("closingTime")}
                  placeholder="11:00 PM"
                />
                <Clock
                  size={14}
                  className="absolute right-3 bottom-[13px] text-muted"
                />
              </div>

              <Input
                id="rst-min-order"
                label="Minimum Order Amount (₹)"
                value={form.minimumOrder}
                onChange={handleChange("minimumOrder")}
                placeholder="120"
                type="number"
              />
              <Input
                id="rst-delivery-charge"
                label="Delivery Charge (₹)"
                value={form.deliveryCharge}
                onChange={handleChange("deliveryCharge")}
                placeholder="25"
                type="number"
              />
            </div>
          </Card>

          {/* Status */}
          <div className="flex items-center justify-between border-b border-border pb-6 pt-2">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Status</h2>
              <p className="text-xs text-muted mt-1">
                You can change the status of restaurant anytime from restaurant
                list.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  className="w-4 h-4 text-primary bg-background border-border focus:ring-primary focus:ring-offset-background"
                  checked={form.status === "Active"}
                  onChange={() => setForm((p) => ({ ...p, status: "Active" }))}
                />
                <span className="text-sm font-medium text-foreground">
                  Active
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  className="w-4 h-4 text-primary bg-background border-border focus:ring-primary focus:ring-offset-background"
                  checked={form.status === "Inactive"}
                  onChange={() =>
                    setForm((p) => ({ ...p, status: "Inactive" }))
                  }
                />
                <span className="text-sm font-medium text-foreground">
                  Inactive
                </span>
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex gap-3 pb-8">
            <Button
              type="submit"
              className="px-6 bg-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Restaurant"}
            </Button>
            <Button
              variant="secondary"
              type="button"
              className="bg-surface shadow-sm border border-border"
              onClick={() => navigate("/restaurants")}
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* Right Column: Menu Items */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-foreground">
              Menu Items
            </h2>
          </div>

          <Card className="p-0 overflow-hidden border-border bg-surface/50">
            <div className="border-b border-border">
              <div className="flex border-b-[2px] border-primary w-fit px-4 py-3">
                <span className="text-xs font-bold text-primary">
                  Menu Items ({form.menuItems.length})
                </span>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="p-6 text-center text-sm text-muted">
                <p className="font-semibold text-warning">MISSING REQUIREMENT: Restaurant category API unavailable.</p>
                <p className="mt-2">Products must be managed via the independent Products domain API rather than nested inside Restaurant payload.</p>
              </div>
            </div>
          </Card>

          <div className="rounded-xl bg-success/10 border border-success/20 p-4 flex items-start gap-3">
            <Lightbulb size={18} className="text-success shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-success">Tips</h4>
              <p className="text-xs text-success/80 mt-1 leading-relaxed">
                You can add menu items now or add later from the restaurant
                detail page.
              </p>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}

export default RestaurantsAdd;
