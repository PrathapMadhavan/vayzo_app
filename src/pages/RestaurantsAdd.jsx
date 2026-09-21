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
  GripVertical,
  Store,
  Utensils,
  MoreVertical
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
import { validateImage } from "../utils/fileUtils";
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
  const [categoriesError, setCategoriesError] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [error, setError] = useState("");
  const [menuSearch, setMenuSearch] = useState("");
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        setCategoriesError(false);
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setCategoriesError(true);
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

  const handleAddNewItem = () => {
    setEditingMenuItem({
      isNew: true,
      id: `temp-${Date.now()}`,
      name: "",
      category: "",
      categoryId: "",
      price: "",
      foodType: "Veg",
      status: true,
      image: "",
      images: [null, null, null, null],
    });
  };

  const handleSaveMenuItem = () => {
    if (!editingMenuItem.name.trim() || !editingMenuItem.price || !editingMenuItem.category || !editingMenuItem.foodType) {
      alert("Item Name, Price, Category, and Food Type are required.");
      return;
    }
    setForm(prev => {
      const updatedMenuItems = prev.menuItems ? [...prev.menuItems] : [];
      if (editingMenuItem.isNew) {
        const newItem = { ...editingMenuItem };
        delete newItem.isNew;
        updatedMenuItems.push(newItem);
      } else {
        const index = updatedMenuItems.findIndex(item => item.id === editingMenuItem.id);
        if (index !== -1) {
          updatedMenuItems[index] = editingMenuItem;
        }
      }
      return { ...prev, menuItems: updatedMenuItems };
    });
    setEditingMenuItem(null);
  };

  const confirmDeleteMenuItem = async () => {
    if (!itemToDelete) return;
    
    const itemId = itemToDelete.id;
    const updatedMenuItems = form.menuItems.filter(item => item.id !== itemId);

    // Persist to backend immediately if editing an existing restaurant
    if (isEditing && restaurantId) {
      try {
        const cleanMenuItems = updatedMenuItems.map((item) => {
          const cleaned = { ...item };
          delete cleaned.isEditing;
          return cleaned;
        });

        const payload = {
          ...form,
          menuItems: cleanMenuItems,
          cuisineType: form.cuisines.join(", "),
          minimumOrder: form.minimumOrder !== "" ? Number(form.minimumOrder) : null,
          deliveryCharge: form.deliveryCharge !== "" ? Number(form.deliveryCharge) : null,
        };
        
        // Remove logo and coverImage if they are blob URLs to avoid saving invalid data during delete
        if (payload.logo && payload.logo.startsWith("blob:")) payload.logo = null;
        if (payload.coverImage && payload.coverImage.startsWith("blob:")) payload.coverImage = null;

        await updateRestaurant(restaurantId, payload);
        
        // Only update local state if backend succeeds
        setForm(prev => ({
          ...prev,
          menuItems: updatedMenuItems
        }));
      } catch (err) {
        alert("Failed to delete menu item from server. Please try again.");
      }
    } else {
      // If adding a new restaurant, just update local state
      setForm(prev => ({
        ...prev,
        menuItems: updatedMenuItems
      }));
    }
    
    setItemToDelete(null);
  };
  const removeCuisine = (c) => {
    setForm((prev) => ({
      ...prev,
      cuisines: prev.cuisines.filter((item) => item !== c),
    }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Restaurant name is required.";
    if (!form.address?.trim()) return "Restaurant address is required.";
    if (!form.menuItems || form.menuItems.length === 0) return "At least one menu item is required.";
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
        menuItems: cleanMenuItems,
        cuisineType: form.cuisines.join(", "),
        id: isEditing ? restaurantId : undefined,
        minimumOrder: form.minimumOrder !== "" ? Number(form.minimumOrder) : null,
        deliveryCharge: form.deliveryCharge !== "" ? Number(form.deliveryCharge) : null,
      };

      if (logoPreview && logoPreview.startsWith("blob:")) {
        console.warn("MISSING REQUIREMENT: Image upload endpoint unavailable. Logo preview will not be persisted.");
      } else if (logoPreview) {
        payload.logo = logoPreview;
      } else {
        payload.logo = null;
      }
      
      if (coverPreview && coverPreview.startsWith("blob:")) {
        console.warn("MISSING REQUIREMENT: Image upload endpoint unavailable. Cover preview will not be persisted.");
      } else if (coverPreview) {
        payload.coverImage = coverPreview;
      } else {
        payload.coverImage = null;
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
                      {categoriesLoading && <option disabled>Loading...</option>}
                      {categoriesError && !categoriesLoading && <option disabled>Error loading</option>}
                      {!categoriesLoading && !categoriesError && categories
                        .filter(cat => cat.status === "Active" || cat.status === "active")
                        .map((cat) => {
                        const isSelected = form.cuisines.includes(cat.name);
                        return (
                          <option
                            key={cat.id}
                            value={cat.name}
                            disabled={isSelected}
                            className={isSelected ? "text-muted/50" : "text-foreground bg-surface"}
                          >
                            {cat.name}
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
                    Restaurant Logo
                  </label>
                  <div className="flex gap-4">
                    <div className="w-[120px] h-[120px] rounded-lg border border-border bg-surface flex items-center justify-center overflow-hidden shrink-0">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          className="w-full h-full object-contain bg-surface"
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
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-foreground">
                    Cover Image
                  </label>
                  <div 
                    onClick={() => coverInputRef.current?.click()}
                    className="border border-dashed border-border rounded-lg h-[160px] bg-background flex items-center justify-center relative overflow-hidden group cursor-pointer block w-full">
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
        <div className="space-y-4">
          {/* Header Card */}
          <div className="p-4 flex items-center justify-between rounded-xl bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-primary bg-primary/20">
                <Utensils size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Menu Items</h2>
                <p className="text-xs text-muted mt-0.5">Add and manage your restaurant menu items</p>
              </div>
            </div>
          </div>

          {/* Search Bar Card */}
          <Card className="p-0 border-border bg-surface shadow-sm overflow-hidden rounded-xl">
            <div className="p-3">
              <Input
                placeholder="Search menu items..."
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>}
              />
            </div>
          </Card>

          {/* Menu Items List */}
          {form.menuItems.length > 0 && (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 pb-1">
              {form.menuItems
                .filter(item => item.name.toLowerCase().includes(menuSearch.toLowerCase()))
                .map((item) => (
                  <Card key={item.id} className="flex gap-4 p-4 items-center bg-surface border border-border rounded-xl hover:border-primary/30 hover:shadow-sm transition-all group">
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-primary/5 border border-primary/10 flex items-center justify-center">
                      {(item.image || (item.images && item.images[0])) ? (
                        <img src={item.image || (item.images && item.images[0])} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Utensils size={20} className="text-primary/40" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto_auto] gap-4 items-center">
                      <div className="flex flex-col justify-center">
                        <h4 className="text-sm font-bold text-foreground truncate" title={item.name}>{item.name}</h4>
                        <div className="flex flex-col mt-0.5 text-xs text-muted">
                          <span>{item.category || item.foodType || "Uncategorized"}</span>
                          <span className="font-semibold text-foreground mt-0.5">₹{item.price || 0}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center gap-1.5 px-4 shrink-0">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.status !== false ? 'text-success bg-success/10' : 'text-muted bg-surface-hover'}`}>
                          {item.status !== false ? 'Active' : 'Inactive'}
                        </span>
                        <CustomToggle 
                          checked={item.status !== false} 
                          onChange={(val) => {
                            setForm(prev => ({
                              ...prev,
                              menuItems: prev.menuItems.map(m => m.id === item.id ? { ...m, status: val } : m)
                            }));
                          }}
                        />
                      </div>

                      <div className="relative shrink-0 dropdown-container">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === item.id ? null : item.id);
                          }}
                          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${openDropdownId === item.id ? 'bg-primary text-white border-primary' : 'border-border text-foreground hover:bg-surface-hover hover:border-primary/50 hover:text-primary'}`}
                        >
                          <MoreVertical size={16} />
                        </button>
                        
                        {openDropdownId === item.id && (
                          <div 
                            className="absolute right-0 top-full mt-1 z-50 w-32 rounded-lg border border-border bg-surface p-1 shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMenuItem({ ...item });
                                setOpenDropdownId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-primary-light hover:text-primary transition-colors"
                            >
                              <Pencil size={14} /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setItemToDelete(item);
                                setOpenDropdownId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
              ))}
            </div>
          )}

          <button 
            type="button" 
            className="w-full font-bold rounded-xl py-4 text-sm transition-colors text-primary flex items-center justify-center gap-2 bg-primary/10 border border-primary/20 hover:bg-primary/20"
            onClick={handleAddNewItem}
          >
            <Plus size={16} /> {form.menuItems.length === 0 ? "Add Item" : "Add More Item"}
          </button>

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

      {/* Edit/Add Menu Item Modal */}
      <Modal
        isOpen={!!editingMenuItem}
        onClose={() => setEditingMenuItem(null)}
        title={editingMenuItem?.isNew ? "Add Menu Item" : "Edit Menu Item"}
      >
        {editingMenuItem && (
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Item Name</label>
              <Input
                value={editingMenuItem.name}
                onChange={(e) => setEditingMenuItem(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter item name"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Price (₹)</label>
                <Input
                  type="number"
                  value={editingMenuItem.price}
                  onChange={(e) => setEditingMenuItem(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Category</label>
              <div className="relative flex items-center w-full rounded-lg border border-border bg-surface transition-colors focus-within:border-primary overflow-hidden">
                <select
                  value={editingMenuItem.categoryId || editingMenuItem.category || ""}
                  onChange={(e) => {
                    const selectedCat = categories.find(c => c.id === e.target.value);
                    setEditingMenuItem(prev => ({ 
                      ...prev, 
                      categoryId: e.target.value,
                      category: selectedCat ? selectedCat.name : e.target.value
                    }));
                  }}
                  className="w-full bg-transparent py-2.5 pl-3.5 pr-10 text-sm text-foreground outline-none appearance-none cursor-pointer"
                  disabled={categoriesLoading || categoriesError}
                >
                  {categoriesLoading && <option className="bg-surface text-foreground" value="" disabled>Loading categories...</option>}
                  {categoriesError && !categoriesLoading && <option className="bg-surface text-foreground" value="" disabled>Unable to load categories</option>}
                  {!categoriesLoading && !categoriesError && categories.filter(c => c.status === "Active" || c.status === "active").length === 0 && (
                    <option className="bg-surface text-foreground" value="" disabled>No active categories available</option>
                  )}
                  {!categoriesLoading && !categoriesError && categories.filter(c => c.status === "Active" || c.status === "active").length > 0 && (
                    <option className="bg-surface text-foreground" value="" disabled>Select Category</option>
                  )}
                  
                  {!categoriesLoading && !categoriesError && categories
                    .filter(cat => cat.status === "Active" || cat.status === "active")
                    .map(cat => (
                    <option className="bg-surface text-foreground" key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                  
                  {/* Graceful fallback for deleted/inactive categories */}
                  {(editingMenuItem.categoryId || editingMenuItem.category) && !categories.some(c => c.id === (editingMenuItem.categoryId || editingMenuItem.category) && (c.status === "Active" || c.status === "active")) && (
                    <option className="bg-surface text-foreground" value={editingMenuItem.categoryId || editingMenuItem.category} disabled>
                      {editingMenuItem.category || "Inactive Category"} (Inactive)
                    </option>
                  )}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Food Image</label>
              <div className="border border-dashed border-primary/20 bg-primary/5 rounded-xl p-4 flex items-center justify-between relative">
                <label className="flex-1 flex flex-col items-center justify-center text-center cursor-pointer hover:opacity-80 transition-opacity">
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/png, image/jpeg, image/webp"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setEditingMenuItem(prev => ({ ...prev, image: event.target.result }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-primary mb-2 bg-primary/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  </div>
                  <p className="text-sm font-bold text-primary">Click to upload</p>
                  <p className="text-xs text-muted">or drag and drop</p>
                  <p className="text-[10px] text-muted/70 mt-1">PNG, JPG or WEBP (Max 2MB)</p>
                </label>
                
                {/* Image Preview Area */}
                {(editingMenuItem.image || (editingMenuItem.images && editingMenuItem.images[0])) && (
                  <div className="flex items-center gap-3 pl-4 border-l border-primary/10 ml-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-border/50 shadow-sm">
                      <img src={editingMenuItem.image || editingMenuItem.images[0]} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setEditingMenuItem(prev => ({ ...prev, image: "", images: [] }))}
                      className="w-8 h-8 rounded-lg border border-danger/20 flex items-center justify-center text-danger hover:bg-danger/5 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Food Type</label>
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setEditingMenuItem(prev => ({ ...prev, foodType: "Veg" }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${editingMenuItem.foodType === "Veg" || !editingMenuItem.foodType ? 'border-success/20 bg-success/10 text-success' : 'border-border bg-surface text-muted'}`}
                >
                  <div className={`w-2 h-2 rounded-full ${editingMenuItem.foodType === "Veg" || !editingMenuItem.foodType ? 'bg-success' : 'bg-muted'}`}></div>
                  Veg
                </button>
                <button 
                  type="button"
                  onClick={() => setEditingMenuItem(prev => ({ ...prev, foodType: "Non-Veg" }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${editingMenuItem.foodType === "Non-Veg" ? 'border-danger/20 bg-danger/10 text-danger' : 'border-border bg-surface text-muted'}`}
                >
                  <div className={`w-2 h-2 rounded-full ${editingMenuItem.foodType === "Non-Veg" ? 'bg-danger' : 'bg-muted'}`}></div>
                  Non-Veg
                </button>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-border">
              <button 
                type="button"
                className="px-5 py-2.5 rounded-lg border border-border bg-surface text-foreground font-medium hover:bg-background transition-colors"
                onClick={() => setEditingMenuItem(null)}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                onClick={handleSaveMenuItem}
              >
                {editingMenuItem.isNew ? "Add Item" : "Update Item"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        title="Delete Menu Item?"
      >
        <div className="py-4">
          <p className="text-sm text-foreground">
            Are you sure you want to delete <span className="font-bold text-foreground">"{itemToDelete?.name}"</span>?
          </p>
          <div className="mt-8 flex justify-end gap-3">
            <button 
              type="button"
              className="px-5 py-2.5 rounded-lg border border-border bg-surface text-foreground font-medium hover:bg-background transition-colors"
              onClick={() => setItemToDelete(null)}
            >
              Cancel
            </button>
            <button 
              type="button"
              className="px-5 py-2.5 rounded-lg bg-danger text-white font-medium hover:bg-danger/90 transition-colors"
              onClick={confirmDeleteMenuItem}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

export default RestaurantsAdd;
