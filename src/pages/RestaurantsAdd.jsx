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
  MoreVertical,
  Search,
  Check,
  ChevronDown,
  CloudUpload,
} from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import StatusSelect from "../components/ui/StatusSelect";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Badge from "../components/ui/Badge";
import {
  createRestaurant,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
} from "../api/restaurantsApi";
import { validateImage, fileToBase64 } from "../utils/fileUtils";
import { getCategories } from "../api/categoriesApi";
import { getProductsByCategory, getProductById } from "../api/productsApi";

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
  const [deleteModal, setDeleteModal] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [error, setError] = useState("");
  const [menuSearch, setMenuSearch] = useState("");
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [categoryMenuItems, setCategoryMenuItems] = useState([]);

    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [editingVariantIndex, setEditingVariantIndex] = useState(-1);
  const [variantForm, setVariantForm] = useState({ name: "", price: "", image: null });
  const variantFileInputRef = useRef(null);

  const handleVariantImageChange = async (e) => {
    if (e.target.files?.[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        setVariantForm({ ...variantForm, image: base64 });
      } catch(err) {}
    }
  };

  const handleSaveVariant = (e) => {
    e.preventDefault();
    if (!variantForm.name || !variantForm.price) return;
    setEditingMenuItem(prev => {
        const newV = [...(prev.variants || prev.varients || [])];
        if (editingVariantIndex >= 0) {
            newV[editingVariantIndex] = variantForm;
        } else {
            newV.push(variantForm);
        }
        return { ...prev, variants: newV };
    });
    setIsVariantModalOpen(false);
  };
const [isViewModalOpen, setIsViewModalOpen] = useState(false);
const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [viewingMenuItem, setViewingMenuItem] = useState(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categorySearchText, setCategorySearchText] = useState("");
  const categoryDropdownRef = useRef(null);

  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);
  const [menuDropdownSearchText, setMenuDropdownSearchText] = useState("");
  const menuDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      setOpenDropdownId(null);
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(e.target)
      ) {
        setIsCategoryDropdownOpen(false);
      }
      if (
        menuDropdownRef.current &&
        !menuDropdownRef.current.contains(e.target)
      ) {
        setIsMenuDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    const fetchCategoryMenuItems = async () => {
      const selectedCatId =
        editingMenuItem?.categoryId ||
        (editingMenuItem?.category
          ? categories.find((c) => c.name === editingMenuItem.category)?.id
          : null);
      if (!selectedCatId) {
        setCategoryMenuItems([]);
        return;
      }
      try {
        const items = await getProductsByCategory(selectedCatId);
        setCategoryMenuItems(items || []);
      } catch (err) {
        console.error("Failed to load category menu items", err);
      }
    };
    fetchCategoryMenuItems();
  }, [editingMenuItem?.categoryId, editingMenuItem?.category, categories]);

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
            (data.cuisineType ? data.cuisineType.split(", ") : []),
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
          menuItems: (data.menuItems || prev.menuItems).map((item) => {
            if (!item.id) {
              return {
                ...item,
                id: `legacy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              };
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

  const handleChange = (field) => (e) => {
    const val = e.target.value;
    setForm((prev) => {
      const newForm = { ...prev, [field]: val };
      if (field === "name") {
        newForm.slug = val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
      }
      return newForm;
    });
  };

  const handleAddNewItem = () => {
    setIsPromptModalOpen(true);
  };

  const handleSaveMenuItem = () => {
    const hasVariants = (editingMenuItem.variants || []).length > 0;
    if (
      !editingMenuItem.name?.trim() ||
      (!editingMenuItem.price && !hasVariants) ||
      !editingMenuItem.category ||
      !editingMenuItem.foodType
    ) {
      alert("Item Name, Category, Food Type, and either a Base Price or at least one Variant are required.");
      return;
    }
    setForm((prev) => {
      const updatedMenuItems = prev.menuItems ? [...prev.menuItems] : [];
      if (editingMenuItem.isNew) {
        const newItem = { ...editingMenuItem };
        delete newItem.isNew;
        updatedMenuItems.push(newItem);
      } else {
        const index = updatedMenuItems.findIndex(
          (item) => item.id === editingMenuItem.id,
        );
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
    const updatedMenuItems = form.menuItems.filter(
      (item) => item.id !== itemId,
    );

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
          minimumOrder:
            form.minimumOrder !== "" ? Number(form.minimumOrder) : null,
          deliveryCharge:
            form.deliveryCharge !== "" ? Number(form.deliveryCharge) : null,
        };

        // Remove logo and coverImage if they are blob URLs to avoid saving invalid data during delete
        if (payload.logo && payload.logo.startsWith("blob:"))
          payload.logo = null;
        if (payload.coverImage && payload.coverImage.startsWith("blob:"))
          payload.coverImage = null;

        await updateRestaurant(restaurantId, payload);

        // Only update local state if backend succeeds
        setForm((prev) => ({
          ...prev,
          menuItems: updatedMenuItems,
        }));
      } catch (err) {
        alert("Failed to delete menu item from server. Please try again.");
      }
    } else {
      // If adding a new restaurant, just update local state
      setForm((prev) => ({
        ...prev,
        menuItems: updatedMenuItems,
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
    if (!form.menuItems || form.menuItems.length === 0)
      return "At least one menu item is required.";
    return "";
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteRestaurant(restaurantId);
      navigate("/restaurants");
    } catch (err) {
      setError("Unable to delete restaurant.");
      setLoading(false);
    }
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
        minimumOrder:
          form.minimumOrder !== "" ? Number(form.minimumOrder) : null,
        deliveryCharge:
          form.deliveryCharge !== "" ? Number(form.deliveryCharge) : null,
      };

      if (logoPreview && logoPreview.startsWith("blob:")) {
        console.warn(
          "MISSING REQUIREMENT: Image upload endpoint unavailable. Logo preview will not be persisted.",
        );
      } else if (logoPreview) {
        payload.logo = logoPreview;
      } else {
        payload.logo = null;
      }

      if (coverPreview && coverPreview.startsWith("blob:")) {
        console.warn(
          "MISSING REQUIREMENT: Image upload endpoint unavailable. Cover preview will not be persisted.",
        );
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
      {/* Premium Page Header */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-primary to-primary-hover p-8 shadow-lg mb-6 max-w-[1600px] mx-auto">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-white opacity-10 blur-2xl"></div>
        <div className="absolute bottom-0 left-10 -mb-10 h-32 w-32 rounded-full bg-white opacity-10 blur-2xl"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-colors hover:bg-white/30"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {isEditing ? "Edit Restaurant" : "Create New Restaurant"}
              </h2>
              <p className="mt-1 text-sm text-primary-50 text-white/80">
                {isEditing
                  ? "Update your restaurant details"
                  : "Add a fresh restaurant to your Vayzo platform"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isEditing && (
              <button
                type="button"
                onClick={() => setDeleteModal(true)}
                className="hidden sm:flex h-10 px-4 items-center justify-center gap-2 rounded-xl bg-danger/90 text-white backdrop-blur-md transition-colors hover:bg-danger shadow-sm border border-white/10"
              >
                <Trash2 size={16} />
                <span className="text-sm font-medium">Delete Restaurant</span>
              </button>
            )}
            <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-inner shadow-white/20">
              <Store size={32} />
            </div>
          </div>
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 max-w-[1600px] mx-auto"
      >
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {/* Section 1: Basic Information */}
          <div className="rounded-xl border border-border bg-surface shadow-sm p-4 sm:p-8 group hover:border-primary/50 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none"></div>
            <div className="mb-6 flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-foreground">
                Basic Information
              </h2>
              <p className="text-sm text-muted">
                Primary identity and cuisine details.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Input
                id="rst-name"
                label={<RequiredLabel text="Restaurant Name" />}
                value={form.name}
                onChange={handleChange("name")}
                placeholder="ABC Cafe"
              />
              <div className="cursor-not-allowed opacity-80 group/slug" title="Slug cannot be changed directly">
                <div className="pointer-events-none">
                  <Input
                    id="rst-slug"
                    label={<RequiredLabel text="Restaurant Slug" />}
                    value={form.slug}
                    onChange={handleChange("slug")}
                    placeholder="abc-cafe"
                    disabled
                  />
                </div>
                <p className="text-[11px] text-muted mt-1 group-hover/slug:text-primary transition-colors">
                  This will be used in restaurant URL
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  <RequiredLabel text="Cuisine Type" />
                </label>
                <div className="relative flex flex-wrap items-center w-full min-h-11 rounded-lg border border-border bg-surface transition-colors focus-within:ring-1 focus-within:ring-primary p-1.5 gap-1.5">
                  {form.cuisines.map((c) => (
                    <div
                      key={c}
                      className="flex items-center gap-1.5 bg-background border border-border px-2.5 py-1 rounded-md text-xs font-medium text-foreground"
                    >
                      <span>{c}</span>
                      <button
                        type="button"
                        onClick={() => removeCuisine(c)}
                        className="hover:text-danger text-muted transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <div className="relative flex-1 min-w-37.5">
                    <select
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
                      className="w-full text-sm text-foreground bg-transparent border-none focus:outline-none focus:ring-0 appearance-none py-1 pl-2 pr-8 cursor-pointer"
                    >
                      <option value="" disabled className="text-muted">
                        Select Cuisine
                      </option>
                      <option value="South Indian Foods">
                        South Indian Foods
                      </option>
                      <option value="Biryani">Biryani</option>
                      <option value="Tandoori">Tandoori</option>
                      <option value="Pizzas">Pizzas</option>
                      <option value="North Indian">North Indian</option>
                      <option value="Chinese">Chinese</option>
                    </select>
                    <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-muted">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  <RequiredLabel text="Description" />
                </label>
                <textarea
                  className="w-full min-h-25 p-3 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors resize-y"
                  value={form.description}
                  onChange={handleChange("description")}
                  placeholder="Description..."
                ></textarea>
              </div>
            </div>
          </div>

          {/* Section 2: Media & Images */}
          <div className="rounded-xl border border-border bg-surface shadow-sm p-4 sm:p-8 group hover:border-primary/50 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none"></div>
            <div className="mb-6 flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-foreground">
                Media & Images
              </h2>
              <p className="text-sm text-muted">
                Restaurant logo and cover image.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Restaurant Logo
                </label>
                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="border border-dashed border-border rounded-lg w-40 h-40 bg-surface flex items-center justify-center relative overflow-hidden group/logo cursor-pointer"
                >
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
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const base64String = reader.result;
                            setLogoPreview(base64String);
                            setForm((prev) => ({
                              ...prev,
                              logo: base64String,
                            }));
                          };
                          reader.readAsDataURL(file);
                          setError("");
                        } catch (err) {
                          setError(err.message);
                        }
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-surface/50 hidden group-hover/logo:flex items-center justify-center z-10 backdrop-blur-sm transition-all">
                    <div className="px-3 py-1.5 text-sm font-medium rounded-md bg-secondary text-secondary-foreground shadow-sm pointer-events-none">
                      Change Logo
                    </div>
                  </div>
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      className="w-full h-full object-contain bg-surface"
                    />
                  ) : (
                    <div className="text-muted text-sm flex flex-col items-center justify-center w-full h-full">
                      <span className="text-primary font-medium mb-1 text-center px-2">
                        Click to upload logo
                      </span>
                      <span className="text-[10px]">512 x 512 (1:1)</span>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-muted">Recommended size: 512x512px. Max 2MB.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Cover Image
                </label>
                <div
                  onClick={() => coverInputRef.current?.click()}
                  className="border border-dashed border-border rounded-lg w-full h-56 bg-surface flex items-center justify-center relative overflow-hidden group/cover cursor-pointer"
                >
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
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const base64String = reader.result;
                            setCoverPreview(base64String);
                            setForm((prev) => ({
                              ...prev,
                              coverImage: base64String,
                            }));
                          };
                          reader.readAsDataURL(file);
                          setError("");
                        } catch (err) {
                          setError(err.message);
                          console.error(err);
                        }
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-surface/50 hidden group-hover/cover:flex items-center justify-center z-10 backdrop-blur-sm transition-all">
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
                    <div className="text-muted text-sm flex flex-col items-center justify-center w-full h-full">
                      <span className="text-primary font-medium mb-1">
                        Click to upload cover
                      </span>
                      <span className="text-[10px]">1200 x 400 (3:1)</span>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-muted">Recommended size: 1200x400px. Max 2MB.</p>
              </div>
            </div>
          </div>

          {/* Section 3: Contact & Location */}
          <div className="rounded-xl border border-border bg-surface shadow-sm p-4 sm:p-8 group hover:border-primary/50 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none"></div>
            <div className="mb-6 flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-foreground">
                Contact & Location
              </h2>
              <p className="text-sm text-muted">
                Address and communication details.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Input
                id="rst-ownerName"
                label={<RequiredLabel text="Owner Name" />}
                value={form.ownerName}
                onChange={handleChange("ownerName")}
                placeholder="Owner's Name"
              />
              <Input
                id="rst-phone"
                label={<RequiredLabel text="Phone Number" />}
                prefix={<span className="text-muted pl-3.5 pr-2 border-r border-border text-sm font-medium">+91</span>}
                value={form.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setForm(prev => ({ ...prev, phone: val }));
                }}
                placeholder="9876543210"
              />
              <Input
                id="rst-email"
                label="Email (Optional)"
                value={form.email}
                onChange={handleChange("email")}
                placeholder="info@abccafe.com"
                type="email"
              />
              <div className="relative">
                <Input
                  id="rst-city"
                  label={<RequiredLabel text="City" />}
                  value={form.city}
                  onChange={handleChange("city")}
                  placeholder="Chennai"
                />
                <MapPin
                  size={14}
                  className="absolute right-3 bottom-3.25 text-muted"
                />
              </div>
              <div className="relative md:col-span-2">
                <Input
                  id="rst-address"
                  label={<RequiredLabel text="Restaurant Address" />}
                  value={form.address}
                  onChange={handleChange("address")}
                  placeholder="123, Anna Salai..."
                />
                <MapPin
                  size={14}
                  className="absolute right-3 bottom-3.25 text-muted"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Operational Details */}
          <div className="rounded-xl border border-border bg-surface shadow-sm p-4 sm:p-8 group hover:border-primary/50 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none"></div>
            <div className="mb-6 flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-foreground">
                Operational Details
              </h2>
              <p className="text-sm text-muted">
                Timings, order settings and status.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
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
                  className="absolute right-3 bottom-3.25 text-muted"
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
                  className="absolute right-3 bottom-3.25 text-muted"
                />
              </div>
              <Input
                id="rst-delivery-time"
                label={<RequiredLabel text="Delivery Time (e.g. 30-40 mins)" />}
                value={form.deliveryTime}
                onChange={handleChange("deliveryTime")}
                placeholder="30-40 mins"
              />
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

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Status
                </label>
                <div className="relative flex items-center w-full rounded-lg border border-border bg-surface transition-colors focus-within:ring-1 focus-within:ring-primary overflow-hidden">
                  <select
                    value={form.status || "Active"}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="w-full min-w-0 bg-transparent py-2.5 pl-3.5 pr-10 text-sm text-foreground outline-none appearance-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Menu Items */}
        <div
          className={`rounded-xl border border-border bg-surface shadow-sm p-4 sm:p-8 group hover:border-primary/50 transition-colors relative overflow-hidden ${editingMenuItem?.isViewOnly ? "pointer-events-none opacity-90" : ""}`}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none"></div>
          <div className="mb-6 flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-foreground">
              Menu Items
            </h2>
            <p className="text-sm text-muted">
              Add and manage your restaurant menu items.
            </p>
          </div>

          <div className="space-y-6">
            {/* Search Bar Card */}
            <Card className="p-0 border-border bg-surface shadow-sm overflow-hidden rounded-xl">
              <div className="p-3">
                <Input
                  placeholder="Search menu items..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-muted"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  }
                />
              </div>
            </Card>

            {/* Menu Items List */}
            {form.menuItems.length > 0 && (
              <div className="space-y-4 max-h-150 overflow-y-auto pr-1 pb-1">
                {form.menuItems
                  .filter((item) =>
                    item.name.toLowerCase().includes(menuSearch.toLowerCase()),
                  )
                  .map((item) => (
                    <Card 
    key={item.id} 
    className="flex gap-4 p-4 items-center bg-surface border border-border rounded-xl hover:border-primary/30 hover:shadow-sm transition-all group cursor-pointer" 
    onClick={async () => {
      if (item.menuItemId) {
        try {
          const fullProduct = await getProductById(item.menuItemId);
          setViewingMenuItem({ ...item, ...fullProduct });
        } catch(err) {
          console.error(err);
          setViewingMenuItem(item);
        }
      } else {
        setViewingMenuItem(item);
      }
      setIsViewModalOpen(true);
    }}
  >
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-primary/5 border border-primary/10 flex items-center justify-center">
                        {item.image || (item.images && item.images[0]) ? (
                          <img
                            src={item.image || (item.images && item.images[0])}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Utensils size={20} className="text-primary/40" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto_auto] gap-4 items-center">
                        <div className="flex flex-col justify-center">
                          <h4
                            className="text-sm font-bold text-foreground truncate"
                            title={item.name}
                          >
                            {item.name}
                          </h4>
                          <div className="flex flex-col mt-0.5 text-xs text-muted">
                            <span>
                              {item.category ||
                                item.foodType ||
                                "Uncategorized"}
                            </span>
                            <span className="font-semibold text-foreground mt-0.5">
                              ₹{item.price || 0}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-center gap-1.5 px-4 shrink-0">
                          <Badge
                            variant={
                              item.status !== false &&
                              item.status !== "Inactive" &&
                              item.status !== "inactive"
                                ? "success"
                                : "danger"
                            }
                            className="text-[10px] px-2 py-0.5"
                          >
                            {item.status !== false &&
                            item.status !== "Inactive" &&
                            item.status !== "inactive"
                              ? "Active"
                              : "Inactive"}
                          </Badge>
                          <CustomToggle
                            checked={item.status !== false}
                            onChange={(val) => {
                              setForm((prev) => ({
                                ...prev,
                                menuItems: prev.menuItems.map((m) =>
                                  m.id === item.id ? { ...m, status: val } : m,
                                ),
                              }));
                            }}
                          />
                        </div>

                        <div className="relative shrink-0 dropdown-container">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(
                                openDropdownId === item.id ? null : item.id,
                              );
                            }}
                            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${openDropdownId === item.id ? "bg-primary text-white border-primary" : "border-border text-foreground hover:bg-surface-hover hover:border-primary/50 hover:text-primary"}`}
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
              <Plus size={16} />{" "}
              {form.menuItems.length === 0 ? "Add Item" : "Add More Item"}
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
        </div>
        {error && <p className="text-sm text-danger mt-6">{error}</p>}

        <div className="flex justify-end gap-4 mt-8">
          <Button type="submit" className="px-6 bg-primary" disabled={loading}>
            {loading
              ? "Saving..."
              : isEditing
                ? "Save Restaurant"
                : "Add Restaurant"}
          </Button>
          <Button
            variant="secondary"
            type="button"
            className="bg-surface shadow-sm border border-border"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
        </div>
      </form>

            {/* View Item Modal */}
      {viewingMenuItem && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setViewingMenuItem(null);
          }}
          title="Item Details"
          maxWidth="max-w-2xl"
        >
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Col: Image */}
            <div className="w-full md:w-5/12 shrink-0">
               {(viewingMenuItem.image || (viewingMenuItem.images && viewingMenuItem.images[0])) ? (
                 <div className="w-full aspect-square rounded-2xl overflow-hidden border border-border shadow-sm">
                   <img src={viewingMenuItem.image || viewingMenuItem.images[0]} alt={viewingMenuItem.name} className="w-full h-full object-cover" />
                 </div>
               ) : (
                 <div className="w-full aspect-square rounded-2xl overflow-hidden border border-border bg-background flex items-center justify-center shadow-sm">
                   <Utensils size={48} className="text-muted/50" />
                 </div>
               )}
            </div>

            {/* Right Col: Details */}
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{viewingMenuItem.name}</h3>
                <div className="flex items-center gap-2">
                   <span className="text-lg font-bold text-primary">₹{viewingMenuItem.price}</span>
                   <span className="w-1.5 h-1.5 rounded-full bg-border mx-1"></span>
                   <span className={viewingMenuItem.foodType === "Non-Veg" ? "text-danger font-medium" : "text-success font-medium"}>
                     {viewingMenuItem.foodType || "Veg"}
                   </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background rounded-xl p-4 border border-border shadow-sm">
                  <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Status</p>
                  <Badge variant={viewingMenuItem.status !== false && viewingMenuItem.status !== "Inactive" && viewingMenuItem.status !== "inactive" ? "success" : "danger"}>
                    {viewingMenuItem.status !== false && viewingMenuItem.status !== "Inactive" && viewingMenuItem.status !== "inactive" ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="bg-background rounded-xl p-4 border border-border shadow-sm">
                  <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Category</p>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                    {viewingMenuItem.category || "Uncategorized"}
                  </Badge>
                </div>
              </div>

              {(viewingMenuItem.varients || viewingMenuItem.variants) && (viewingMenuItem.varients || viewingMenuItem.variants).length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                    <Lightbulb size={16} className="text-primary"/> 
                    Available Variants
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin pr-2">
                    {(viewingMenuItem.varients || viewingMenuItem.variants).map((v, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background">
                        {v.image ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-border">
                                <img src={v.image} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-lg shrink-0 border border-border bg-surface flex items-center justify-center">
                                <Utensils size={16} className="text-muted/50" />
                            </div>
                        )}
                        <div className="flex-1">
                            <p className="text-sm font-bold text-foreground">{v.name}</p>
                            <p className="text-xs font-bold text-primary">₹{v.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end pt-4 mt-auto border-t border-border">
                <Button onClick={() => {
                  setIsViewModalOpen(false);
                  setTimeout(() => {
                    setEditingMenuItem({ ...viewingMenuItem });
                  }, 100);
                }}>
                  <Pencil size={16} className="mr-2" />
                  Edit Item
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Item Source Prompt Modal */}
      <Modal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        title="Add Menu Item"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">How would you like to add a new menu item?</p>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setIsPromptModalOpen(false);
                setEditingMenuItem({
                  isNew: true,
                  itemMode: 'catalog',
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
              }}
              className="flex-1 p-4 border border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center gap-2 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Search size={20} />
              </div>
              <p className="font-semibold text-sm">Select from Catalog</p>
              <p className="text-xs text-muted">Choose from existing categories and items</p>
            </button>
            <button
              onClick={() => {
                setIsPromptModalOpen(false);
                setEditingMenuItem({
                  isNew: true,
                  itemMode: 'custom',
                  id: `temp-${Date.now()}`,
                  name: "",
                  category: "",
                  categoryId: null,
                  price: "",
                  foodType: "Veg",
                  status: true,
                  image: "",
                  images: [null, null, null, null],
                });
              }}
              className="flex-1 p-4 border border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center gap-2 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Plus size={20} />
              </div>
              <p className="font-semibold text-sm">Create Own Item</p>
              <p className="text-xs text-muted">Add a completely custom item</p>
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit/Add Menu Item Modal */}
 <Modal
 isOpen={!!editingMenuItem}
 onClose={() => setEditingMenuItem(null)}
 title={editingMenuItem?.isNew ? "Add Menu Item" : "Edit Menu Item"}
 >
 {editingMenuItem && (
 <div className={`space-y-4 ${editingMenuItem?.isViewOnly ? 'pointer-events-none opacity-90' : ''}`}>
 <div>
 <label className="text-xs font-medium text-muted mb-1 block">Item Name</label>
 <Input
 value={editingMenuItem.name}
 onChange={(e) => setEditingMenuItem(prev => ({ ...prev, name: e.target.value }))}
 placeholder="Enter item name"
 />
 </div>
 
 <div className="flex gap-4">
 <div className="flex-1" ref={categoryDropdownRef}>
 <label className="text-xs font-medium text-muted mb-1 block">Category</label>
 <div className="relative">
 <button
 type="button"
 onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
 className="w-full flex items-center justify-between bg-surface-hover text-sm text-foreground outline-none border border-border rounded-lg px-3 h-10 hover:border-primary/50 transition-colors"
 >
 <span className={editingMenuItem.category ? "text-foreground" : "text-muted/70"}>
 {editingMenuItem.category || "Select Category"}
 </span>
 <ChevronDown size={16} className={`text-muted transition-transform duration-200 ${isCategoryDropdownOpen ? "rotate-180" : ""}`} />
 </button>

 {isCategoryDropdownOpen && (
 <div className="absolute z-100 top-full mt-2 w-full min-w-60 bg-surface border border-border rounded-xl shadow-lg overflow-hidden flex flex-col">
 <div className="p-2 border-b border-border/50 shrink-0">
 <div className="relative">
 <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" size={14} />
 <input
 type="text"
 placeholder="Search category..."
 value={categorySearchText}
 onChange={(e) => setCategorySearchText(e.target.value)}
 onKeyDown={(e) => {
 if (e.key === "Escape") setIsCategoryDropdownOpen(false);
 }}
 className="w-full pl-8 pr-3 py-1.5 text-sm bg-surface-hover border focus:ring-1 focus:ring-primary /30 rounded-lg outline-none text-foreground transition-colors"
 autoFocus
 />
 </div>
 </div>
 <div className="max-h-60 overflow-y-auto scrollbar-thin p-1">
 {categories
  .filter(c => c.name.toLowerCase().includes(categorySearchText.toLowerCase()) && (restaurant.cuisineType || "").split(",").map(s=>s.trim()).includes(c.name))
  .map(cat => {
 const isSelected = editingMenuItem.categoryId === cat.id || editingMenuItem.category === cat.name;
 return (
 <button
 key={cat.id}
 type="button"
 onClick={() => {
 setEditingMenuItem(prev => ({ 
 ...prev, 
 category: cat.name,
 categoryId: cat.id,
 menuItemId: "" // Reset menu item when category changes
 }));
 setIsCategoryDropdownOpen(false);
 setCategorySearchText("");
 }}
 className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${isSelected ? "bg-primary/10" : "hover:bg-surface-hover"}`}
 >
 <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${isSelected ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>
 {cat.image ? (
 <img src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded-lg" />
 ) : (
 <Utensils size={16} />
 )}
 </div>
 <div className="flex-1 min-w-0">
 <div className={`text-sm truncate ${isSelected ? "font-medium text-primary" : "text-foreground"}`}>
 {cat.name}
 </div>
 <div className="text-xs text-muted">
 {cat.itemCount || 0} menu items
 </div>
 </div>
 {isSelected && (
 <Check size={16} className="text-primary shrink-0" />
 )}
 </button>
 );
 })}
 {categories.filter(c => c.name.toLowerCase().includes(categorySearchText.toLowerCase())).length === 0 && (
 <div className="p-4 text-center text-sm text-muted">
 No categories found
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 </div>

 <div className="w-28 shrink-0">
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
 <label className="text-xs font-medium text-muted mb-1 block">Menu Items</label>
 <div className="relative" ref={menuDropdownRef}>
 <button
 type="button"
 onClick={() => {
 if (editingMenuItem.categoryId || editingMenuItem.category) {
 setIsMenuDropdownOpen(!isMenuDropdownOpen);
 }
 }}
 className={`w-full flex items-center justify-between bg-surface-hover text-sm outline-none border border-border rounded-lg px-3 h-10 hover:border-primary/50 transition-colors ${(!editingMenuItem.categoryId && !editingMenuItem.category) ? "text-muted/50 cursor-not-allowed opacity-70" : "text-foreground"}`}
 disabled={!editingMenuItem.categoryId && !editingMenuItem.category}
 >
 <span className={editingMenuItem.menuItemId ? "text-foreground truncate" : "text-muted/70 truncate"}>
 {editingMenuItem.menuItemId && categoryMenuItems.find(i => i.id === editingMenuItem.menuItemId)
 ? categoryMenuItems.find(i => i.id === editingMenuItem.menuItemId).name 
 : "Select Menu Item"}
 </span>
 <ChevronDown size={16} className={`text-muted transition-transform duration-200 ${isMenuDropdownOpen ? "rotate-180" : ""}`} />
 </button>

 {isMenuDropdownOpen && (
 <div className="absolute z-100 top-full mt-2 w-full min-w-60 bg-surface border border-border rounded-xl shadow-lg overflow-hidden flex flex-col">
 <div className="p-2 border-b border-border/50 shrink-0">
 <div className="relative">
 <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" size={14} />
 <input
 type="text"
 placeholder="Search menu items..."
 value={menuDropdownSearchText}
 onChange={(e) => setMenuDropdownSearchText(e.target.value)}
 onKeyDown={(e) => {
 if (e.key === "Escape") setIsMenuDropdownOpen(false);
 }}
 className="w-full pl-8 pr-3 py-1.5 text-sm bg-surface-hover border focus:ring-1 focus:ring-primary /30 rounded-lg outline-none text-foreground transition-colors"
 autoFocus
 />
 </div>
 </div>
 <div className="max-h-60 overflow-y-auto scrollbar-thin p-1">
 {categoryMenuItems.length === 0 ? (
 <div className="p-4 text-center text-sm text-muted">
 No menu items available for this category
 </div>
 ) : (
 <>
 {categoryMenuItems
 .filter(i => i.name.toLowerCase().includes(menuDropdownSearchText.toLowerCase()))
 .map(item => {
 const isSelected = editingMenuItem.menuItemId === item.id;
 return (
 <button
 key={item.id}
 type="button"
 onClick={() => {
 setEditingMenuItem(prev => ({ 
 ...prev, 
 menuItemId: item.id,
 name: item.name || prev.name,
 price: prev.price, variants: (item.varients || item.variants || []).map(v => ({...v})),
 foodType: item.foodType || prev.foodType,
 image: item.image || prev.image,
 images: item.image ? [item.image, ...(prev.images || []).slice(1)] : prev.images
 }));
 setIsMenuDropdownOpen(false);
 setMenuDropdownSearchText("");
 }}
 className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${isSelected ? "bg-primary/10" : "hover:bg-surface-hover"}`}
 >
 <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${isSelected ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>
 {item.image ? (
 <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
 ) : (
 <Utensils size={16} />
 )}
 </div>
 <div className="flex-1 min-w-0">
 <div className={`text-sm truncate ${isSelected ? "font-medium text-primary" : "text-foreground"}`}>
 {item.name}
 </div>
 </div>
 {isSelected && (
 <Check size={16} className="text-primary shrink-0" />
 )}
 </button>
 );
 })}
 {categoryMenuItems.filter(i => i.name.toLowerCase().includes(menuDropdownSearchText.toLowerCase())).length === 0 && (
 <div className="p-4 text-center text-sm text-muted">
 No matching menu items found
 </div>
 )}
 </>
 )}
 </div>
 </div>
 )}
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
 className="border border-dashed border-primary/20 rounded-lg h-30 bg-primary/5 flex items-center justify-center relative overflow-visible group w-full"
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
    <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-muted block">Item Variants (e.g. Types, Sizes)</label>
        <button
            type="button"
            onClick={() => {
                setVariantForm({ name: "", price: "", image: editingMenuItem.image || "" });
                setEditingVariantIndex(-1);
                setIsVariantModalOpen(true);
            }}
            className="text-[10px] font-bold text-primary flex items-center bg-primary/10 px-2 py-1 rounded-md hover:bg-primary/20 transition-colors"
        >
            <Plus size={12} className="mr-1" /> Add Variant
        </button>
    </div>
    
    <div className="space-y-2">
        {(editingMenuItem.variants || editingMenuItem.varients || []).length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin">
            {(editingMenuItem.variants || editingMenuItem.varients).map((variant, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg border border-border bg-background group hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => {
                        setVariantForm(variant);
                        setEditingVariantIndex(index);
                        setIsVariantModalOpen(true);
                    }}>
                        {variant.image ? (
                            <div className="w-8 h-8 rounded-md overflow-hidden shrink-0 border border-border">
                                <img src={variant.image} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-8 h-8 rounded-md shrink-0 border border-border bg-surface flex items-center justify-center">
                                <Utensils size={12} className="text-muted/50" />
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-bold text-foreground">{variant.name}</p>
                            <p className="text-xs font-semibold text-primary">₹{variant.price}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditingMenuItem(prev => {
                                const newV = [...(prev.variants || prev.varients || [])];
                                newV.splice(index, 1);
                                return { ...prev, variants: newV };
                            });
                        }}
                        className="w-7 h-7 rounded-md bg-danger/10 text-danger flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            ))}
            </div>
        ) : (
            <p className="text-xs text-muted italic mb-2">No variants added. Base price will be used.</p>
        )}
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

 <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
    <button type="button" className="px-5 py-2 rounded-lg border border-border text-primary hover:bg-primary/5 transition-colors font-medium text-sm" onClick={() => setEditingMenuItem(null)}>
      Cancel
    </button>
    {!editingMenuItem?.isViewOnly && (
      <button type="button" className="px-5 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium text-sm" onClick={handleSaveMenuItem}>
        {editingMenuItem.isNew ? "Add Item" : "Update Item"}
      </button>
    )}
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
            Are you sure you want to delete{" "}
            <span className="font-bold text-foreground">
              "{itemToDelete?.name}"
            </span>
            ?
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

      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Restaurant"
      >
        <p className="text-sm text-muted">
          Are you sure you want to delete this restaurant? This action cannot be
          undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setDeleteModal(false)}
          >
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={handleDelete}>
            Yes, Delete
          </Button>
        </div>
      </Modal>
    
      {/* Add/Edit Variant Modal */}
      <Modal
        isOpen={isVariantModalOpen}
        onClose={() => setIsVariantModalOpen(false)}
        title={editingVariantIndex >= 0 ? "Edit Variant" : "Add Variant"}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveVariant} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted mb-1 block">Variant Name</label>
              <Input
                value={variantForm.name}
                onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
                placeholder="e.g. Half, Full"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted mb-1 block">Price (₹)</label>
              <Input
                type="number"
                value={variantForm.price}
                onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted mb-2 block">Variant Image (Optional)</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                className="hidden"
                ref={variantFileInputRef}
                accept="image/*"
                onChange={handleVariantImageChange}
              />
              {variantForm.image ? (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border shadow-sm group">
                  <img
                    src={variantForm.image}
                    alt="Variant preview"
                    className="w-full h-full object-cover"
                  />
                  <div 
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    onClick={() => variantFileInputRef.current?.click()}
                  >
                    <Pencil size={16} className="text-white" />
                  </div>
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 w-6 h-6 bg-danger text-white rounded-full flex items-center justify-center"
                    onClick={() => setVariantForm({ ...variantForm, image: null })}
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div 
                  className="w-20 h-20 rounded-lg border border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-surface-hover hover:border-primary/40 transition-colors"
                  onClick={() => variantFileInputRef.current?.click()}
                >
                  <Plus size={20} className="text-muted mb-1" />
                  <span className="text-[10px] text-muted">Upload</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-border hover:bg-surface-hover text-sm font-medium transition-colors"
              onClick={() => setIsVariantModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 text-sm font-medium transition-colors"
            >
              Save Variant
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}

export default RestaurantsAdd;
