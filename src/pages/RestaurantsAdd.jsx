import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Plus,
  MapPin,
  Clock,
  Lightbulb,
  Trash2,
  Pencil,
  X,
  CloudUpload,
} from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import StatusSelect from "../components/ui/StatusSelect";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import {
  createRestaurant,
  getRestaurantById,
  updateRestaurant,
} from "../api/restaurantsApi";
import { fileToBase64 } from "../utils/fileUtils";
import { RESTAURANT_CUISINES } from "./Restaurants";
import { getCategories } from "../api/categoriesApi";

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

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [error, setError] = useState("");
  const [menuSearch, setMenuSearch] = useState("");
  const [editingMenuItem, setEditingMenuItem] = useState(null);

  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchAllCategories();
  }, []);

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
          menuItems: (data.menuItems || prev.menuItems).map(item => {
            if (!item.id) {
              return { ...item, id: `legacy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
            }
            return item;
          }),
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

  const handleMenuItemChange = (id, field, value) => {
    setForm((prev) => ({
      ...prev,
      menuItems: prev.menuItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const removeMenuItem = (id) => {
    setForm((prev) => ({
      ...prev,
      menuItems: prev.menuItems.filter((item) => item.id !== id),
    }));
  };

  const addMenuItem = () => {
    const newItemId = `temp-${Date.now()}`;
    setForm((prev) => ({
      ...prev,
      menuItems: [
        ...prev.menuItems,
        {
          id: newItemId,
          name: "",
          category: "",
          price: "",
          image: "",
          status: true,
        },
      ],
    }));
  };

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
      const cleanMenuItems = form.menuItems.map((item) => {
        const cleaned = { ...item };
        delete cleaned.isEditing;
        return cleaned;
      });

      const payload = {
        ...form,
        cuisineType: form.cuisines.join(", "),
        id: isEditing ? restaurantId : undefined,
        minimumOrder: Number(form.minimumOrder) || 0,
        deliveryCharge: Number(form.deliveryCharge) || 0,
        logo: logoPreview || undefined,
        coverImage: coverPreview || undefined,
        menuItems: cleanMenuItems,
      };
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
        className="grid grid-cols-1 xl:grid-cols-[1fr_minmax(320px,400px)] gap-6 items-start"
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
                    <div 
                      onClick={() => logoInputRef.current?.click()}
                      className="border border-dashed border-border rounded-lg h-[120px] flex-1 bg-background flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-surface transition-colors relative overflow-hidden group">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        ref={logoInputRef}
                        onChange={async (e) => {
                          if (e.target.files?.[0]) {
                            try {
                              const base64 = await fileToBase64(e.target.files[0]);
                              setLogoPreview(base64);
                            } catch (err) {
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
                        PNG, JPG or WEBP (Max 2MB)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-foreground">
                    <RequiredLabel text="Cover Image" />
                  </label>
                  <div 
                    onClick={() => coverInputRef.current?.click()}
                    className="border border-dashed border-border rounded-lg h-[160px] bg-background flex items-center justify-center relative overflow-hidden group cursor-pointer block w-full">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      ref={coverInputRef}
                      onChange={async (e) => {
                        if (e.target.files?.[0]) {
                          try {
                            const base64 = await fileToBase64(e.target.files[0]);
                            setCoverPreview(base64);
                          } catch (err) {
                            console.error(err);
                          }
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-surface/50 hidden group-hover:flex items-center justify-center z-10 backdrop-blur-sm transition-all">
                      <div className="px-3 py-1.5 text-sm font-medium rounded-md bg-secondary text-secondary-foreground shadow-sm pointer-events-none">
                        Change Image
                      </div>
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
                  </div>
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
              {loading ? "Saving..." : (isEditing ? "Save Restaurant" : "Add Restaurant")}
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
            <div className="border-b border-border flex items-center justify-between pr-4">
              <div className="flex border-b-[2px] border-primary w-fit px-4 py-3">
                <span className="text-xs font-semibold text-primary">
                  Menu Items ({form.menuItems.length})
                </span>
              </div>
            </div>

            <div className="p-4 border-b border-border">
              <Input
                placeholder="Search menu items..."
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
              />
            </div>

            <div className="p-4 space-y-4">
              {form.menuItems
                .filter(item => !menuSearch || (item.name || "").toLowerCase().includes(menuSearch.toLowerCase()))
                .map((item, i) => (
                <div
                  key={item.id}
                  className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 bg-background border border-border rounded-xl shadow-sm"
                >
                  <div className="w-12 h-12 rounded-lg bg-surface-hover shrink-0 overflow-hidden border border-border/50">
                    <img
                      src={item.image || `https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=100&h=100&sig=${item.id}`}
                      alt="food"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="font-bold text-sm text-foreground mb-0.5 truncate">
                      {item.name || "Unnamed Item"}
                    </h4>
                    <p className="text-xs text-muted mb-1 truncate">
                      {item.category || "No Category"}
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      ₹{item.price || "0"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-auto justify-end border-l border-border pl-3">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[9px] font-medium text-success">Active</span>
                      <CustomToggle
                        checked={item.status}
                        onChange={(v) => handleMenuItemChange(item.id, "status", v)}
                      />
                    </div>
                    <div className="flex items-center gap-1.5 ml-1">
                      <button
                        type="button"
                        onClick={() => setEditingMenuItem({ ...item })}
                        className="w-8 h-8 rounded border border-border bg-surface flex items-center justify-center hover:bg-surface-hover text-muted transition-colors shrink-0"
                        title="Edit Item"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeMenuItem(item.id)}
                        className="w-8 h-8 rounded border border-danger/30 bg-danger/10 text-danger flex items-center justify-center hover:bg-danger hover:text-white transition-colors shrink-0"
                        title="Delete Item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 pt-0">
              <Button
                type="button"
                variant={form.menuItems.length === 0 ? "primary" : "ghost"}
                className={`w-full ${
                  form.menuItems.length === 0
                    ? "py-2"
                    : "border border-dashed border-primary/30 text-primary hover:bg-primary/5 bg-primary/5"
                }`}
                onClick={addMenuItem}
              >
                <Plus size={16} className="mr-2" /> 
                {form.menuItems.length === 0 ? "Add New Item" : "Add More Items"}
              </Button>
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
      <Modal
        isOpen={!!editingMenuItem}
        onClose={() => setEditingMenuItem(null)}
        title="Edit Menu Item"
      >
        {editingMenuItem && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted mb-1 block">Item Name</label>
              <Input
                value={editingMenuItem.name}
                onChange={(e) => setEditingMenuItem(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter item name"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted mb-1 block">Category</label>
                <select
                  className="w-full bg-surface-hover text-sm text-foreground outline-none border border-border rounded-lg px-3 h-10"
                  value={editingMenuItem.category}
                  onChange={(e) => setEditingMenuItem(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="" disabled>Select Category</option>
                  {categories
                    .filter(cat => cat.type === "Food")
                    .map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted mb-1 block">Price (₹)</label>
                <Input
                  type="number"
                  value={editingMenuItem.price}
                  onChange={(e) => setEditingMenuItem(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted mb-2 block">Menu Item Image</label>
              <div>
                {[0].map((index) => {
                  const currentImages = editingMenuItem.images || (editingMenuItem.image ? [editingMenuItem.image] : []);
                  const img = currentImages[index];
                  return (
                    <div
                      key={index}
                      className="border border-dashed border-primary/20 rounded-lg h-[120px] bg-primary/5 flex items-center justify-center relative overflow-visible group w-full"
                    >
                      {img ? (
                        <>
                          <div className="w-full h-full rounded-lg overflow-hidden relative">
                            <img
                              src={img}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingMenuItem((prev) => {
                                const newImages = [...(prev.images || (prev.image ? [prev.image] : []))];
                                newImages[index] = null;
                                return { ...prev, images: newImages, image: newImages.find(Boolean) || "" };
                              });
                            }}
                            className="absolute -top-3 -right-3 w-8 h-8 bg-white text-danger rounded-full flex items-center justify-center shadow-md z-20 transition-all border border-border/10"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      ) : (
                        <div 
                          onClick={() => document.getElementById(`menuItemImgUpload-${index}`)?.click()}
                          className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors rounded-lg"
                        >
                          <CloudUpload size={24} className="text-primary mb-1.5" />
                          <p className="text-xs font-semibold text-primary">Click to upload</p>
                          <p className="text-[10px] text-muted/70 mt-0.5">PNG, JPG or WEBP</p>
                          <input
                            id={`menuItemImgUpload-${index}`}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={async (e) => {
                              if (e.target.files?.[0]) {
                                try {
                                  const base64 = await fileToBase64(e.target.files[0]);
                                  setEditingMenuItem((prev) => {
                                    const newImages = [...(prev.images || (prev.image ? [prev.image] : []))];
                                    newImages[index] = base64;
                                    return { ...prev, images: newImages, image: newImages.find(Boolean) || "" };
                                  });
                                } catch (err) {
                                  console.error(err);
                                }
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <label className="text-xs font-medium text-muted mb-2 block">Food Type</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditingMenuItem(prev => ({ ...prev, foodType: 'Veg' }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${editingMenuItem.foodType === 'Veg' ? 'border-success bg-success/10 text-success' : 'border-border text-foreground hover:bg-surface'}`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-success"></span>
                  Veg
                </button>
                <button
                  type="button"
                  onClick={() => setEditingMenuItem(prev => ({ ...prev, foodType: 'Non-Veg' }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${editingMenuItem.foodType === 'Non-Veg' ? 'border-danger bg-danger/10 text-danger' : 'border-border text-foreground hover:bg-surface'}`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-danger"></span>
                  Non-Veg
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-medium text-foreground">Status</span>
              <CustomToggle
                checked={editingMenuItem.status}
                onChange={(v) => setEditingMenuItem(prev => ({ ...prev, status: v }))}
              />
            </div>

            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setEditingMenuItem(null)}>
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="primary" 
                className="flex-1"
                onClick={() => {
                  setForm(prev => ({
                    ...prev,
                    menuItems: prev.menuItems.map(item => 
                      item.id === editingMenuItem.id ? editingMenuItem : item
                    )
                  }));
                  setEditingMenuItem(null);
                }}
              >
                Update Item
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}

export default RestaurantsAdd;
