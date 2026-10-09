import { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Clock,
  Store,
  Star,
  ShoppingBag,
  Pencil,
  Plus,
  Trash2,
  CloudUpload,
  Search,
  GripVertical,
  MoreVertical,
  Eye,
  Check,
  ChevronDown,
  Lightbulb,
  Utensils,
  Camera,
  ShieldBan,
  MessageSquare,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Avatar from "../components/ui/Avatar";
import ActionMenu from "../components/ui/ActionMenu";

import {
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  updateRestaurantStatus,
} from "../api/restaurantsApi";
import { getCategories } from "../api/categoriesApi";
import { getParentItemsByCategory } from "../api/parentItemsApi";
import { getChildItemsByParentItem } from "../api/childItemsApi";
import { fileToBase64 } from "../utils/fileUtils";

function CustomToggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${checked ? "bg-success" : "bg-border"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-4" : "translate-x-1"
        }`}
      />
    </button>
  );
}

const getValue = (value) => value || "--";
const StatBox = ({ label, value, sub, color = "default", className = "" }) => {
  const colorMap = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    muted: "text-muted",
    white: "text-white",
    default: "text-foreground",
  };
  return (
    <div className={`flex flex-col gap-1 px-3 sm:px-4 ${className} min-w-0`}>
      <p
        className={`text-[11px] sm:text-xs whitespace-nowrap ${color === "white" ? "text-white/70" : "text-muted"}`}
      >
        {label}
      </p>
      <div
        className={`text-sm sm:text-base font-bold ${colorMap[color] || colorMap.default}`}
      >
        {getValue(value)}
      </div>
      {sub && (
        <p
          className={`text-xs ${color === "white" ? "text-white/50" : colorMap[color] || colorMap.muted}`}
        >
          {sub}
        </p>
      )}
    </div>
  );
};

const TABS = ["Menu Items", "Orders", "Offers & Coupons", "Reviews"];

function RestaurantsDetails() {
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    return "http://localhost:3000" + (url.startsWith("/") ? url : "/" + url);
  };

  const { restaurantId } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [imagePreviewModal, setImagePreviewModal] = useState(false);
  const [previewImageSrc, setPreviewImageSrc] = useState(null);
  const [pendingImageFile, setPendingImageFile] = useState(null);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingImageFile(file);
      try {
        const base64 = await fileToBase64(file);
        setPreviewImageSrc(base64);
      } catch (err) {
        console.error("Error reading file:", err);
      }
    }
  };

  const handleCancelImage = () => {
    setPendingImageFile(null);
    setPreviewImageSrc(restaurant.logo);
  };

  const handleSaveImage = async () => {
    if (!pendingImageFile) return;
    try {
      const updatedRestaurant = { ...restaurant, logo: previewImageSrc };
      await updateRestaurantStatus(restaurant.id, newStatus);
      setRestaurant(updatedRestaurant);
      setImagePreviewModal(false);
      setPendingImageFile(null);
    } catch (err) {
      alert("Failed to update image");
    }
  };

  const [messagingModalOpen, setMessagingModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isBlockModalOpen, setBlockModalOpen] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    setIsSendingMessage(true);
    setTimeout(() => {
      alert("Message Sent (Simulated)");
      setIsSendingMessage(false);
      setMessagingModalOpen(false);
      setMessageText("");
    }, 800);
  };

  const handleBlockToggle = async () => {
    if (!restaurant) return;
    const currentStatus = restaurant?.status || "Active";
    const newStatus = currentStatus === "Blocked" ? "Active" : "Blocked";
    setIsBlocking(true);
    try {
      await updateRestaurantStatus(restaurantId, newStatus);
      setRestaurant((prev) => ({ ...prev, status: newStatus }));
      setBlockModalOpen(false);
    } catch (err) {
      alert("Failed to update block status: " + (err.message || err));
    } finally {
      setIsBlocking(false);
    }
  };

  const [activeTab, setActiveTab] = useState("Menu Items");
  const [categoryParentItems, setCategoryParentItems] = useState([]);
  const [parentChildItems, setParentChildItems] = useState([]);

  const [categories, setCategories] = useState([]);
  const [menuSearch, setMenuSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [editingMenuItem, setEditingMenuItem] = useState(null);

  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [editingVariantIndex, setEditingVariantIndex] = useState(-1);
  const [variantForm, setVariantForm] = useState({
    name: "",
    price: "",
    image: null,
  });
  const variantFileInputRef = useRef(null);

  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const handleDragStart = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e, index) => {
    e.preventDefault();
  };
  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === targetIndex) return;
    const draggedItemId = filteredMenuItems[draggedItemIndex].id;
    const targetItemId = filteredMenuItems[targetIndex].id;
    const mainDraggedIndex = restaurant.menuItems.findIndex(
      (i) => i.id === draggedItemId,
    );
    const mainTargetIndex = restaurant.menuItems.findIndex(
      (i) => i.id === targetItemId,
    );
    if (mainDraggedIndex === -1 || mainTargetIndex === -1) return;
    const newItems = [...restaurant.menuItems];
    const [removed] = newItems.splice(mainDraggedIndex, 1);
    newItems.splice(mainTargetIndex, 0, removed);
    const updatedRestaurant = { ...restaurant, menuItems: newItems };
    setRestaurant(updatedRestaurant);
    try {
      await updateRestaurant(restaurant.id, updatedRestaurant);
    } catch (err) {
      console.error(err);
    }
    setDraggedItemIndex(null);
  };

  const handleVariantImageChange = async (e) => {
    if (e.target.files?.[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        setVariantForm({ ...variantForm, image: base64 });
      } catch (err) {}
    }
  };

  const handleSaveVariant = (e) => {
    e.preventDefault();
    if (!variantForm.name || !variantForm.price) return;
    setEditingMenuItem((prev) => {
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
  const [itemToDelete, setItemToDelete] = useState(null);

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categorySearchText, setCategorySearchText] = useState("");
  const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false);
  const [parentSearchText, setParentSearchText] = useState("");
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);
  const [menuDropdownSearchText, setMenuDropdownSearchText] = useState("");

  const categoryDropdownRef = useRef(null);
  const parentDropdownRef = useRef(null);
  const menuDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setIsCategoryDropdownOpen(false);
      }
      if (
        parentDropdownRef.current &&
        !parentDropdownRef.current.contains(event.target)
      ) {
        setIsParentDropdownOpen(false);
      }
      if (
        menuDropdownRef.current &&
        !menuDropdownRef.current.contains(event.target)
      ) {
        setIsMenuDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRestaurantById(restaurantId);

        if (data && data.menuItems) {
          data.menuItems = data.menuItems.map((item) => {
            if (!item.id) {
              return {
                ...item,
                id: `legacy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              };
            }
            return item;
          });
        }

        if (isMounted) setRestaurant(data);
      } catch (err) {
        if (isMounted) setError("Failed to load restaurant details.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchRestaurant();
    return () => {
      isMounted = false;
    };
  }, [restaurantId]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const fetchParentItems = async () => {
      const selectedCatId =
        editingMenuItem?.categoryId ||
        (editingMenuItem?.category
          ? categories.find((c) => c.name === editingMenuItem.category)?.id
          : null);
      if (!selectedCatId || editingMenuItem?.itemMode === "custom") {
        setCategoryParentItems([]);
        return;
      }
      try {
        const items = await getParentItemsByCategory(selectedCatId);
        setCategoryParentItems(items || []);
      } catch (err) {
        console.error("Failed to load category parent items", err);
      }
    };
    fetchParentItems();
  }, [
    editingMenuItem?.categoryId,
    editingMenuItem?.category,
    categories,
    editingMenuItem?.itemMode,
  ]);

  useEffect(() => {
    const fetchChildItems = async () => {
      const parentId = editingMenuItem?.parentItemId;
      if (!parentId || editingMenuItem?.itemMode === "custom") {
        setParentChildItems([]);
        return;
      }
      try {
        const items = await getChildItemsByParentItem(parentId);
        setParentChildItems(items || []);
      } catch (err) {
        console.error("Failed to load child items", err);
      }
    };
    fetchChildItems();
  }, [editingMenuItem?.parentItemId, editingMenuItem?.itemMode]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteRestaurant(restaurantId);
      navigate("/restaurants", { replace: true });
    } catch (err) {
      alert("Failed to delete restaurant.");
      setDeleteLoading(false);
    }
  };

  const handleAddNewItem = () => {
    setIsPromptModalOpen(true);
  };

  const handleSaveMenuItem = async () => {
    const hasVariants = (editingMenuItem.variants || []).length > 0;
    if (
      !editingMenuItem.name?.trim() ||
      (!editingMenuItem.price && !hasVariants) ||
      !editingMenuItem.category ||
      !editingMenuItem.foodType
    ) {
      alert(
        "Item Name, Category, Food Type, and either a Base Price or at least one Variant are required.",
      );
      return;
    }
    try {
      const updatedRestaurant = { ...restaurant };
      updatedRestaurant.menuItems = updatedRestaurant.menuItems || [];
      if (editingMenuItem.isNew) {
        const newItem = { ...editingMenuItem };
        delete newItem.isNew;
        updatedRestaurant.menuItems.push(newItem);
      } else {
        updatedRestaurant.menuItems = updatedRestaurant.menuItems.map((item) =>
          item.id === editingMenuItem.id ? editingMenuItem : item,
        );
      }
      await updateRestaurant(restaurant.id, updatedRestaurant);
      setRestaurant(updatedRestaurant);
      setEditingMenuItem(null);
    } catch (err) {
      alert("Failed to save menu item");
    }
  };

  const handleDeleteMenuItem = async (itemId) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    try {
      const updatedRestaurant = { ...restaurant };
      updatedRestaurant.menuItems = (updatedRestaurant.menuItems || []).filter(
        (item) => item.id !== itemId,
      );
      await updateRestaurant(restaurant.id, updatedRestaurant);
      setRestaurant(updatedRestaurant);
    } catch (err) {
      alert("Failed to delete menu item");
    }
  };

  if (loading) {
    return (
      <section className="min-h-full bg-background p-4 sm:p-6">
        <div className="rounded-xl border border-border bg-surface p-6 text-sm text-muted">
          Loading restaurant details...
        </div>
      </section>
    );
  }

  if (error || !restaurant) {
    return (
      <section className="min-h-full bg-background p-4 sm:p-6">
        <div className="rounded-xl border border-border bg-surface p-6 flex flex-col items-start gap-4">
          <p className="text-sm text-danger">
            {error || "Restaurant not found."}
          </p>
          <Button variant="secondary" onClick={() => navigate("/restaurants")}>
            <ArrowLeft size={16} className="mr-2" /> Back to Restaurants
          </Button>
        </div>

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
                <label className="text-xs font-medium text-muted mb-1 block">
                  Variant Name
                </label>
                <Input
                  value={variantForm.name}
                  onChange={(e) =>
                    setVariantForm({ ...variantForm, name: e.target.value })
                  }
                  placeholder="e.g. Half, Full"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted mb-1 block">
                  Price (₹)
                </label>
                <Input
                  type="number"
                  value={variantForm.price}
                  onChange={(e) =>
                    setVariantForm({ ...variantForm, price: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted mb-2 block">
                Variant Image (Optional)
              </label>
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
                      onClick={() =>
                        setVariantForm({ ...variantForm, image: null })
                      }
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

  const filteredMenuItems = (restaurant.menuItems || []).filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(menuSearch.toLowerCase());

    // Find the category object for the selectedCategory to match by name if categoryId is missing
    const selectedCatObj = categories.find((c) => c.id === selectedCategory);

    const matchesCategory =
      selectedCategory === "All Categories" ||
      item.categoryId === selectedCategory ||
      (selectedCatObj && item.category === selectedCatObj.name);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-full bg-background pb-10">
      {/* Image Preview Modal */}
      <Modal
        isOpen={imagePreviewModal}
        onClose={() => {
          setImagePreviewModal(false);
          handleCancelImage();
        }}
        title="Restaurant Logo"
      >
        <div className="flex justify-center p-4 relative group rounded-xl overflow-hidden min-h-50 bg-muted/10">
          {previewImageSrc ? (
            <img
              src={getImageUrl(previewImageSrc)}
              alt="Preview"
              className="max-w-full max-h-[40vh] rounded-xl object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full min-h-50 gap-2">
              <Camera size={40} className="text-muted/50" />
              <span className="text-muted/80 text-sm">No Logo</span>
            </div>
          )}
          <label className="absolute inset-4 sm:inset-auto sm:w-full sm:h-full max-w-full max-h-[40vh] rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
            <Camera size={32} className="mb-2" />
            <span className="font-medium text-sm">Change Image</span>
          </label>
        </div>
        {pendingImageFile && (
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={handleCancelImage}>
              Cancel
            </Button>
            <Button onClick={handleSaveImage}>Save Changes</Button>
          </div>
        )}
      </Modal>

      {/* ── Top breadcrumb & actions ── */}
      <div className="px-6 pt-5 pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between w-full sm:w-auto">
          <button
            onClick={() => navigate("/restaurants")}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors font-medium"
          >
            <ArrowLeft size={16} /> Back to List
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
          <Button
            variant={restaurant?.status === "Blocked" ? "success" : "danger"}
            size="sm"
            onClick={() => setBlockModalOpen(true)}
            className="flex items-center justify-center gap-1.5 text-xs sm:text-sm shadow-sm hover:shadow-md transition-shadow"
          >
            <ShieldBan size={14} />
            <span className="hidden sm:inline">
              {restaurant?.status === "Blocked"
                ? "Unblock Restaurant"
                : "Block Restaurant"}
            </span>
            <span className="sm:hidden">
              {restaurant?.status === "Blocked" ? "Unblock" : "Block"}
            </span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setMessagingModalOpen(true)}
            className="flex items-center justify-center gap-1.5 text-xs sm:text-sm border-border bg-surface hover:bg-surface-hover text-foreground shadow-sm"
          >
            <MessageSquare size={14} />
            <span className="hidden sm:inline">Send Message</span>
            <span className="sm:hidden">Message</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/restaurants/edit/${restaurant.id}`)}
            className="flex items-center justify-center gap-1.5 text-xs sm:text-sm shadow-sm"
          >
            <Pencil size={14} />
            <span className="hidden sm:inline">Edit Restaurant</span>
            <span className="sm:hidden">Edit</span>
          </Button>
        </div>
      </div>

      {/* ── Profile Header Card ── */}
      <div className="relative mx-4 sm:mx-6 mt-4 rounded-2xl overflow-hidden shadow-lg flex flex-col bg-linear-to-r from-primary to-primary-hover">
        {/* Background Pattern or Cover Image */}
        {restaurant.coverImage ? (
          <>
            <img
              src={getImageUrl(restaurant.coverImage)}
              className="absolute inset-0 w-full h-full object-cover blur-sm opacity-60 pointer-events-none scale-105"
              alt="Cover"
            />
            <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
          </>
        ) : (
          <>
            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white opacity-5 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-10 -mb-10 h-48 w-48 rounded-full bg-white opacity-5 blur-3xl pointer-events-none"></div>
          </>
        )}

        {/* Top row: avatar + identity + stats */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 p-6 sm:p-8 relative z-10">
          {/* Avatar + name */}
          <div className="flex items-center gap-4 shrink-0 lg:w-87.5">
            <div className="relative shrink-0">
              <div
                className="relative z-10 cursor-pointer hover:opacity-80 transition-opacity shrink-0 group/avatar"
                onClick={() => {
                  setPreviewImageSrc(restaurant.logo);
                  setImagePreviewModal(true);
                }}
              >
                <Avatar
                  src={getImageUrl(restaurant.logo)}
                  identifier={restaurant?.name}
                  alt={restaurant?.name}
                  className="h-24 w-24 sm:h-20 sm:w-20 text-3xl sm:text-2xl rounded-full ring-4 ring-white/20 shadow-lg bg-white"
                />
              </div>
              <div
                onClick={() => {
                  if (restaurant.status === "Blocked") return;
                  const newStatus =
                    restaurant.status === "Active" ? "Inactive" : "Active";
                  const updatedRestaurant = {
                    ...restaurant,
                    status: newStatus,
                  };
                  setRestaurant(updatedRestaurant);
                  updateRestaurant(restaurant.id, updatedRestaurant).catch(
                    () => {
                      setRestaurant({ ...restaurant });
                      alert("Failed to update status");
                    },
                  );
                }}
                className={`absolute -bottom-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-white/20 bg-black/20 backdrop-blur-md shadow-sm whitespace-nowrap z-20 ${restaurant.status === "Blocked" ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:bg-black/40 transition-colors"}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${restaurant.status === "Active" ? "bg-success" : restaurant.status === "Blocked" ? "bg-danger" : "bg-warning"}`}
                ></span>
                <span
                  className={`text-[10px] font-medium ${restaurant.status === "Active" ? "text-success" : restaurant.status === "Blocked" ? "text-danger" : "text-warning"}`}
                >
                  {restaurant.status || "Inactive"}
                </span>
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight truncate">
                  {restaurant?.name}
                </h1>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap items-center sm:items-start gap-2 sm:gap-4 mt-1">
                {restaurant?.phone && (
                  <div className="flex items-center gap-1.5 text-[13px] text-white/90 truncate">
                    <Phone size={13} className="shrink-0 text-white/70" />{" "}
                    <span className="truncate">{restaurant.phone}</span>
                  </div>
                )}
                {restaurant?.email && (
                  <div className="flex items-center gap-1.5 text-[13px] text-white/90 truncate">
                    <Mail size={13} className="shrink-0 text-white/70" />{" "}
                    <span className="truncate">{restaurant.email}</span>
                  </div>
                )}
                {restaurant?.cuisineType && (
                  <div className="flex items-center gap-1.5 text-[13px] text-white/90 truncate">
                    <Utensils size={13} className="shrink-0 text-white/70" />{" "}
                    <span className="truncate">{restaurant.cuisineType}</span>
                  </div>
                )}
              </div>

              {restaurant?.description && (
                <div className="mt-4 text-white/80 text-sm max-w-2xl leading-relaxed">
                  {restaurant.description}
                </div>
              )}
            </div>
          </div>

          {/* Vertical divider */}
          <div className="hidden lg:block h-24 w-px bg-white/20 mx-2 shrink-0 relative z-10" />

          {/* Stats row */}
          <div className="flex flex-wrap items-start gap-x-8 gap-y-6 lg:gap-y-8 w-full flex-1 pb-2 lg:pb-0 relative z-10">
            <StatBox
              label="Restaurant ID"
              value={restaurant?.id}
              color="white"
            />
            <StatBox
              label="Total Orders"
              value={restaurant?.totalOrders || "--"}
              color="white"
            />
            <StatBox
              label="Min Order"
              value={
                restaurant?.minimumOrder ? `₹${restaurant.minimumOrder}` : "--"
              }
              color="white"
            />
            <StatBox
              label="Restaurant Time"
              value={
                restaurant?.openingTime && restaurant?.closingTime
                  ? `${restaurant.openingTime} - ${restaurant.closingTime}`
                  : "--"
              }
              color="white"
            />
            <StatBox
              label="Owner"
              value={restaurant?.ownerName || restaurant?.owner || "--"}
              color="white"
            />
            <StatBox
              label="Location"
              value={
                [restaurant?.address, restaurant?.city]
                  .filter(Boolean)
                  .join(", ") || "--"
              }
              color="white"
              className="max-w-xs"
            />
            <StatBox
              label="Menu Items"
              value={(restaurant?.menuItems || []).length}
              color="white"
            />
            <div className="flex flex-col gap-1 px-3 sm:px-4 min-w-0">
              <p className="text-[11px] sm:text-xs whitespace-nowrap text-white/70">
                Rating
              </p>
              <div className="flex items-center gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    className={
                      star <= (restaurant?.rating || 0)
                        ? "fill-warning text-warning"
                        : "fill-white/20 text-white/20"
                    }
                  />
                ))}
                <span className="text-white text-sm font-bold ml-1.5">
                  {restaurant?.rating ? restaurant.rating.toFixed(1) : "0.0"}
                </span>
              </div>
              <p className="text-xs text-white/50">
                {restaurant?.reviewsCount || 0} reviews
              </p>
            </div>
          </div>
        </div>

        {/* Tabs navigation */}
        <div className="flex bg-surface overflow-x-auto [-ms-overflow-style:none] scrollbar-none relative z-10 border-t border-border/10 px-3">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground hover:bg-muted/10"
              }`}
            >
              {tab === "Menu Items" && <Store size={15} />}
              {tab === "Orders" && <ShoppingBag size={15} />}
              {tab === "Offers & Coupons" && <Star size={15} />}
              {tab === "Reviews" && <Check size={15} />}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content Area ── */}
      <div className="p-4 sm:p-6 pt-5">
        {activeTab === "Menu Items" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Menu Items ({(restaurant.menuItems || []).length})
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <div className="w-full sm:w-64">
                  <Input
                    placeholder="Search menu items..."
                    prefix={
                      <div className="pl-3.5 pr-1.5">
                        <Search size={16} className="text-muted" />
                      </div>
                    }
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleAddNewItem}
                  className="shrink-0 gap-1.5 w-full sm:w-auto"
                >
                  <Plus size={16} />
                  Add New Item
                </Button>
              </div>
            </div>

            {(restaurant.menuItems || []).length === 0 ? (
              <div className="text-center py-16 px-4 bg-surface rounded-xl border border-border border-dashed">
                <Store size={40} className="mx-auto text-muted/50 mb-3" />
                <h3 className="text-base font-semibold text-foreground mb-1">
                  No Menu Items
                </h3>
                <p className="text-sm text-muted max-w-sm mx-auto">
                  This restaurant doesn't have any menu items yet. Click "Add
                  New Item" to create one.
                </p>
              </div>
            ) : filteredMenuItems.length === 0 ? (
              <div className="text-center py-16 px-4 bg-surface rounded-xl border border-border border-dashed">
                <Search size={40} className="mx-auto text-muted/50 mb-3" />
                <h3 className="text-base font-semibold text-foreground mb-1">
                  No Results
                </h3>
                <p className="text-sm text-muted max-w-sm mx-auto">
                  No menu items match your search.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredMenuItems.map((item, index) => (
                  <Card
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    className="p-4 flex gap-4 items-center group relative border-border/60 hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={async () => {
                      if (item.menuItemId) {
                        try {
                          const fullProduct = await getProductById(
                            item.menuItemId,
                          );
                          setViewingMenuItem({ ...item, ...fullProduct });
                        } catch (err) {
                          console.error(err);
                          setViewingMenuItem(item);
                        }
                      } else {
                        setViewingMenuItem(item);
                      }
                      setIsViewModalOpen(true);
                    }}
                  >
                    <div className="text-muted/40 cursor-grab hover:text-muted hidden sm:block shrink-0">
                      <GripVertical size={20} />
                    </div>

                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-primary/5 border border-primary/10 flex items-center justify-center">
                      {item.image || (item.images && item.images[0]) ? (
                        <img
                          src={item.image || (item.images && item.images[0])}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Store size={20} className="text-primary/40" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4
                          className="text-sm font-bold text-foreground truncate"
                          title={item.name}
                        >
                          {item.name}
                        </h4>
                        <div
                          className="flex items-center gap-1.5 shrink-0 dropdown-container"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ActionMenu
                            actions={[
                              {
                                label: "View",
                                icon: Eye,
                                onClick: async () => {
                                  if (item.menuItemId) {
                                    try {
                                      const fullProduct = await getProductById(
                                        item.menuItemId,
                                      );
                                      setViewingMenuItem({
                                        ...item,
                                        ...fullProduct,
                                      });
                                    } catch (err) {
                                      console.error(err);
                                      setViewingMenuItem(item);
                                    }
                                  } else {
                                    setViewingMenuItem(item);
                                  }
                                  setIsViewModalOpen(true);
                                },
                              },
                              {
                                label: "Edit",
                                icon: Pencil,
                                onClick: () =>
                                  setEditingMenuItem({
                                    ...item,
                                    itemMode: item.categoryId
                                      ? "catalog"
                                      : "custom",
                                  }),
                              },
                              {
                                label: "Delete",
                                icon: Trash2,
                                danger: true,
                                onClick: () => handleDeleteMenuItem(item.id),
                              },
                            ]}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs">
                        <span className="font-semibold text-primary">
                          {item.category || "Uncategorized"}
                        </span>
                        <span className="text-muted">•</span>
                        <span className="font-bold text-foreground">
                          {item.price
                            ? `₹${item.price}`
                            : (item.variants || item.varients || []).length > 0
                              ? `${(item.variants || item.varients).length} Variants`
                              : "₹0"}
                        </span>
                        <span className="text-muted">•</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${item.foodType === "Non-Veg" ? "bg-danger" : "bg-success"}`}
                          ></span>
                          <span className="font-medium text-muted">
                            {item.foodType || "Veg"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center">
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
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "Orders" && (
          <div className="text-center py-20 px-4 bg-surface rounded-xl border border-border border-dashed">
            <ShoppingBag
              size={48}
              strokeWidth={1.5}
              className="mx-auto text-muted/30 mb-4"
            />
            <h3 className="text-base font-semibold text-foreground mb-1">
              No Orders Available
            </h3>
            <p className="text-sm text-muted max-w-sm mx-auto">
              This restaurant currently has no order history to display.
            </p>
          </div>
        )}

        {activeTab === "Offers & Coupons" && (
          <div className="text-center py-20 px-4 bg-surface rounded-xl border border-border border-dashed">
            <Store
              size={48}
              strokeWidth={1.5}
              className="mx-auto text-muted/30 mb-4"
            />
            <h3 className="text-base font-semibold text-foreground mb-1">
              No Offers Available
            </h3>
            <p className="text-sm text-muted max-w-sm mx-auto">
              There are no active offers or coupons for this restaurant.
            </p>
          </div>
        )}

        {activeTab === "Reviews" && (
          <div className="text-center py-20 px-4 bg-surface rounded-xl border border-border border-dashed">
            <Star
              size={48}
              strokeWidth={1.5}
              className="mx-auto text-muted/30 mb-4"
            />
            <h3 className="text-base font-semibold text-foreground mb-1">
              No Ratings or Complaints Available
            </h3>
            <p className="text-sm text-muted max-w-sm mx-auto">
              This restaurant has not received any reviews or complaints yet.
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Restaurant"
      >
        <p className="text-sm text-muted">
          Are you sure you want to delete{" "}
          <strong className="text-foreground">{restaurant.name}</strong>? This
          action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Modal>

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
              {viewingMenuItem.image ||
              (viewingMenuItem.images && viewingMenuItem.images[0]) ? (
                <div className="w-full aspect-square rounded-2xl overflow-hidden border border-border shadow-sm">
                  <img
                    src={viewingMenuItem.image || viewingMenuItem.images[0]}
                    alt={viewingMenuItem.name}
                    className="w-full h-full object-cover"
                  />
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
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {viewingMenuItem.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">
                    ₹{viewingMenuItem.price}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-border mx-1"></span>
                  <span
                    className={
                      viewingMenuItem.foodType === "Non-Veg"
                        ? "text-danger font-medium"
                        : "text-success font-medium"
                    }
                  >
                    {viewingMenuItem.foodType || "Veg"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background rounded-xl p-4 border border-border shadow-sm">
                  <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
                    Status
                  </p>
                  <Badge
                    variant={
                      viewingMenuItem.status !== false &&
                      viewingMenuItem.status !== "Inactive" &&
                      viewingMenuItem.status !== "inactive"
                        ? "success"
                        : "danger"
                    }
                  >
                    {viewingMenuItem.status !== false &&
                    viewingMenuItem.status !== "Inactive" &&
                    viewingMenuItem.status !== "inactive"
                      ? "Active"
                      : "Inactive"}
                  </Badge>
                </div>
                <div className="bg-background rounded-xl p-4 border border-border shadow-sm">
                  <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
                    Category
                  </p>
                  <Badge
                    variant="outline"
                    className="bg-primary/5 text-primary border-primary/20"
                  >
                    {viewingMenuItem.category || "Uncategorized"}
                  </Badge>
                </div>
              </div>

              {(viewingMenuItem.varients || viewingMenuItem.variants) &&
                (viewingMenuItem.varients || viewingMenuItem.variants).length >
                  0 && (
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                      <Lightbulb size={16} className="text-primary" />
                      Available Variants
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin pr-2">
                      {(
                        viewingMenuItem.varients || viewingMenuItem.variants
                      ).map((v, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background"
                        >
                          {v.image ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-border">
                              <img
                                src={v.image}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg shrink-0 border border-border bg-surface flex items-center justify-center">
                              <Utensils size={16} className="text-muted/50" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-bold text-foreground">
                              {v.name}
                            </p>
                            <p className="text-xs font-bold text-primary">
                              ₹{v.price}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <div className="flex justify-end pt-4 mt-auto border-t border-border">
                <Button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setTimeout(() => {
                      setEditingMenuItem({
                        ...viewingMenuItem,
                        itemMode: viewingMenuItem.categoryId
                          ? "catalog"
                          : "custom",
                      });
                    }, 100);
                  }}
                >
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
          <div className="flex gap-4">
            <button
              onClick={() => {
                setIsPromptModalOpen(false);
                setEditingMenuItem({
                  isNew: true,
                  itemMode: "catalog",
                  id: `temp-${Date.now()}`,
                  name: "",
                  category: "",
                  price: "",
                  foodType: "Veg",
                  status: true,
                  image: "",
                  images: [null, null, null, null],
                  variants: [],
                });
              }}
              className="flex-1 py-4 px-3 flex flex-col items-center gap-2 border border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <Store size={18} />
              </div>
              <span className="text-sm font-semibold text-foreground">
                Select from Catalog
              </span>
            </button>
            <button
              onClick={() => {
                setIsPromptModalOpen(false);
                setEditingMenuItem({
                  isNew: true,
                  itemMode: "custom",
                  id: `temp-${Date.now()}`,
                  name: "",
                  category: "",
                  price: "",
                  foodType: "Veg",
                  status: true,
                  image: "",
                  images: [null, null, null, null],
                  variants: [],
                });
              }}
              className="flex-1 py-4 px-3 flex flex-col items-center gap-2 border border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <Utensils size={18} />
              </div>
              <span className="text-sm font-semibold text-foreground">
                Create Own Item
              </span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit/Add Menu Item Modal */}
      <Modal
        isOpen={!!editingMenuItem}
        onClose={() => setEditingMenuItem(null)}
        title={
          <span className="text-lg font-bold text-foreground">
            {editingMenuItem?.isNew ? "Add Menu Item" : "Edit Menu Item"}
          </span>
        }
      >
        {editingMenuItem && (
          <div
            className={`space-y-4 ${editingMenuItem?.isViewOnly ? "pointer-events-none opacity-90" : ""}`}
          >
            {/* Category */}
            <div className="flex gap-4">
              <div className="flex-1" ref={categoryDropdownRef}>
                <label className="text-xs font-semibold text-muted mb-1.5 block uppercase tracking-wide">
                  Category
                </label>
                {editingMenuItem.itemMode === "custom" ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={editingMenuItem.category || ""}
                      onChange={(e) =>
                        setEditingMenuItem((prev) => ({
                          ...prev,
                          category: e.target.value,
                          categoryId: null,
                        }))
                      }
                      placeholder="Enter custom category"
                      className="w-full bg-surface border border-primary/50 px-3 py-2.5 rounded-lg text-sm outline-none focus:border-primary/20 transition-all "
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                      }
                      className="w-full bg-surface border border-primary/30 px-3 py-2.5 rounded-lg flex items-center justify-between outline-none focus:border-primary/50 transition-all text-sm"
                      disabled={!editingMenuItem.isNew}
                    >
                      <span
                        className={
                          editingMenuItem.category
                            ? "text-foreground font-medium truncate"
                            : "text-muted/70 truncate"
                        }
                      >
                        {editingMenuItem.category || "Select Category"}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-muted transition-transform duration-200 ${isCategoryDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isCategoryDropdownOpen && (
                      <div className="absolute z-[100] top-full mt-1 w-full min-w-60 bg-surface border border-primary/30 rounded-xl shadow-xl overflow-hidden flex flex-col">
                        <div className="p-2 border-b border-border/50 shrink-0">
                          <div className="relative">
                            <Search
                              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
                              size={14}
                            />
                            <input
                              type="text"
                              placeholder="Search category..."
                              value={categorySearchText}
                              onChange={(e) =>
                                setCategorySearchText(e.target.value)
                              }
                              className="w-full pl-8 pr-3 py-1.5 text-sm bg-surface-hover border focus:border-primary/30 rounded-lg outline-none text-foreground transition-colors"
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto scrollbar-thin p-1">
                          {categories
                            .filter(
                              (c) =>
                                c.name
                                  .toLowerCase()
                                  .includes(categorySearchText.toLowerCase()) &&
                                c.type === "Product",
                            )
                            .map((cat) => {
                              const isSelected =
                                editingMenuItem.categoryId === cat.id;
                              return (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => {
                                    setEditingMenuItem((prev) => ({
                                      ...prev,
                                      category: cat.name,
                                      categoryId: cat.id,
                                      parentItemName: "",
                                      parentItemId: null,
                                      menuItemId: "",
                                      name: "",
                                      price: "",
                                      variants: [],
                                    }));
                                    setIsCategoryDropdownOpen(false);
                                    setCategorySearchText("");
                                  }}
                                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${isSelected ? "bg-primary/10" : "hover:bg-surface-hover"}`}
                                >
                                  <div className="flex-1 min-w-0">
                                    <div
                                      className={`text-sm truncate ${isSelected ? "font-semibold text-primary" : "font-medium text-foreground"}`}
                                    >
                                      {cat.name}
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <Check
                                      size={16}
                                      className="text-primary shrink-0"
                                    />
                                  )}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Parent Item */}
            <div className="flex gap-4">
              <div className="flex-1" ref={parentDropdownRef}>
                <label className="text-xs font-semibold text-muted mb-1.5 block uppercase tracking-wide">
                  Parent Item
                </label>
                {editingMenuItem.itemMode === "custom" ? (
                  <input
                    type="text"
                    value={editingMenuItem.parentItemName || ""}
                    onChange={(e) =>
                      setEditingMenuItem((prev) => ({
                        ...prev,
                        parentItemName: e.target.value,
                        parentItemId: null,
                      }))
                    }
                    placeholder="Enter custom parent item"
                    className="w-full bg-surface border border-primary/30 px-3 py-2.5 rounded-lg text-sm outline-none focus:border-primary/50 transition-all "
                  />
                ) : (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setIsParentDropdownOpen(!isParentDropdownOpen)
                      }
                      className="w-full bg-surface border border-primary/30 px-3 py-2.5 rounded-lg flex items-center justify-between outline-none focus:border-primary/50 transition-all   text-sm"
                      disabled={
                        !editingMenuItem.categoryId || !editingMenuItem.isNew
                      }
                    >
                      <span
                        className={
                          editingMenuItem.parentItemName
                            ? "text-foreground font-medium truncate"
                            : "text-muted/70 truncate"
                        }
                      >
                        {editingMenuItem.parentItemName || "Select Parent Item"}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-muted transition-transform duration-200 ${isParentDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isParentDropdownOpen && (
                      <div className="absolute z-[100] top-full mt-1 w-full bg-surface border border-primary/30 rounded-xl shadow-xl overflow-hidden flex flex-col">
                        <div className="p-2 border-b border-border/50 shrink-0">
                          <div className="relative">
                            <Search
                              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
                              size={14}
                            />
                            <input
                              type="text"
                              placeholder="Search parent item..."
                              value={parentSearchText}
                              onChange={(e) =>
                                setParentSearchText(e.target.value)
                              }
                              className="w-full pl-8 pr-3 py-1.5 text-sm bg-surface-hover border focus:border-primary/30 rounded-lg outline-none text-foreground transition-colors"
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto scrollbar-thin p-1">
                          {categoryParentItems
                            .filter((i) =>
                              i.name
                                .toLowerCase()
                                .includes(parentSearchText.toLowerCase()),
                            )
                            .map((item) => {
                              const isSelected =
                                editingMenuItem.parentItemId === item.id;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => {
                                    setEditingMenuItem((prev) => ({
                                      ...prev,
                                      parentItemName: item.name,
                                      parentItemId: item.id,
                                      menuItemId: "",
                                      name: "",
                                      price: "",
                                      variants: [],
                                    }));
                                    setIsParentDropdownOpen(false);
                                    setParentSearchText("");
                                  }}
                                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${isSelected ? "bg-primary/10" : "hover:bg-surface-hover"}`}
                                >
                                  <div className="flex-1 min-w-0">
                                    <div
                                      className={`text-sm truncate ${isSelected ? "font-semibold text-primary" : "font-medium text-foreground"}`}
                                    >
                                      {item.name}
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <Check
                                      size={16}
                                      className="text-primary shrink-0"
                                    />
                                  )}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Child Item (Catalog Only) */}
            {editingMenuItem.itemMode === "catalog" && (
              <div className="flex gap-4">
                <div className="flex-1" ref={menuDropdownRef}>
                  <label className="text-xs font-semibold text-muted mb-1.5 block uppercase tracking-wide">
                    Item
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsMenuDropdownOpen(!isMenuDropdownOpen)}
                      className="w-full bg-surface border border-primary/30 px-3 py-2.5 rounded-lg flex items-center justify-between outline-none focus:border-primary/50 transition-all   text-sm"
                      disabled={
                        !editingMenuItem.parentItemId || !editingMenuItem.isNew
                      }
                    >
                      <span
                        className={
                          editingMenuItem.menuItemId
                            ? "text-foreground font-medium truncate"
                            : "text-muted/70 truncate"
                        }
                      >
                        {editingMenuItem.menuItemId &&
                        parentChildItems.find(
                          (i) => i.id === editingMenuItem.menuItemId,
                        )
                          ? parentChildItems.find(
                              (i) => i.id === editingMenuItem.menuItemId,
                            ).name
                          : "Select Item"}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-muted transition-transform duration-200 ${isMenuDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isMenuDropdownOpen && (
                      <div className="absolute z-[100] top-full mt-1 w-full bg-surface border border-primary/30 rounded-xl shadow-xl overflow-hidden flex flex-col">
                        <div className="p-2 border-b border-border/50 shrink-0">
                          <div className="relative">
                            <Search
                              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
                              size={14}
                            />
                            <input
                              type="text"
                              placeholder="Search item..."
                              value={menuDropdownSearchText}
                              onChange={(e) =>
                                setMenuDropdownSearchText(e.target.value)
                              }
                              className="w-full pl-8 pr-3 py-1.5 text-sm bg-surface-hover border focus:border-primary/30 rounded-lg outline-none text-foreground transition-colors"
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto scrollbar-thin p-1">
                          {parentChildItems
                            .filter((i) =>
                              i.name
                                .toLowerCase()
                                .includes(menuDropdownSearchText.toLowerCase()),
                            )
                            .map((item) => {
                              const isSelected =
                                editingMenuItem.menuItemId === item.id;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => {
                                    setEditingMenuItem((prev) => ({
                                      ...prev,
                                      menuItemId: item.id,
                                      name: item.name || prev.name,
                                      price: prev.price,
                                      variants: (
                                        item.varients ||
                                        item.variants ||
                                        []
                                      ).map((v) => ({ ...v })),
                                      foodType: item.foodType || prev.foodType,
                                      image: item.image || prev.image,
                                      images: item.image
                                        ? [item.image]
                                        : prev.images || [],
                                    }));
                                    setIsMenuDropdownOpen(false);
                                    setMenuDropdownSearchText("");
                                  }}
                                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${isSelected ? "bg-primary/10" : "hover:bg-surface-hover"}`}
                                >
                                  <div className="flex-1 min-w-0">
                                    <div
                                      className={`text-sm truncate ${isSelected ? "font-semibold text-primary" : "font-medium text-foreground"}`}
                                    >
                                      {item.name}
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <Check
                                      size={16}
                                      className="text-primary shrink-0"
                                    />
                                  )}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Item Name & Price */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-semibold text-muted mb-1.5 block uppercase tracking-wide">
                  Item Name
                </label>
                <input
                  type="text"
                  value={editingMenuItem.name || ""}
                  onChange={(e) =>
                    setEditingMenuItem((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter item name"
                  disabled={
                    editingMenuItem.itemMode === "catalog" &&
                    !editingMenuItem.menuItemId
                  }
                  className="w-full bg-surface border border-primary/30 px-3 py-2.5 rounded-lg text-sm outline-none focus:border-primary/50 transition-all   disabled:opacity-50"
                />
              </div>
              <div className="w-32 shrink-0">
                <label className="text-xs font-semibold text-muted mb-1.5 block uppercase tracking-wide">
                  Price (₹)
                </label>
                <input
                  type="number"
                  value={editingMenuItem.price || ""}
                  onChange={(e) =>
                    setEditingMenuItem((prev) => ({
                      ...prev,
                      price: e.target.value,
                    }))
                  }
                  placeholder="0.00"
                  className="w-full bg-surface border border-primary/30 px-3 py-2.5 rounded-lg text-sm outline-none focus:border-primary/50 transition-all  "
                />
              </div>
            </div>

            {/* Single Item Image Full Cover */}
            <div>
              <label className="text-xs font-semibold text-muted mb-1.5 block uppercase tracking-wide">
                Item Image
              </label>
              {editingMenuItem?.image ||
              (editingMenuItem?.images && editingMenuItem.images[0]) ? (
                <div className="w-full h-40 rounded-lg border border-primary/30 bg-surface relative overflow-hidden group">
                  <img
                    src={getImageUrl(
                      editingMenuItem.image || editingMenuItem.images[0],
                    )}
                    alt="Menu Item"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-6 backdrop-blur-[2px]">
                    <label
                      className="flex flex-col items-center gap-1.5 cursor-pointer text-white/90 hover:text-white transition-colors"
                      title="Change Image"
                    >
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 hover:scale-105 transition-transform">
                        <Pencil size={18} />
                      </div>
                      <span className="text-xs font-semibold tracking-wide">
                        Change
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={async (e) => {
                          if (e.target.files?.[0]) {
                            try {
                              const base64 = await fileToBase64(
                                e.target.files[0],
                              );
                              setEditingMenuItem((prev) => ({
                                ...prev,
                                image: base64,
                                images: [base64],
                              }));
                            } catch (err) {
                              console.error(err);
                            }
                          }
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingMenuItem((prev) => ({
                          ...prev,
                          image: null,
                          images: [],
                        }));
                      }}
                      className="flex flex-col items-center gap-1.5 text-danger/90 hover:text-danger transition-colors"
                      title="Remove Image"
                    >
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 hover:scale-105 transition-transform">
                        <Trash2 size={18} />
                      </div>
                      <span className="text-xs font-semibold tracking-wide">
                        Remove
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <label className="w-full h-32 rounded-lg border border-primary/30 bg-surface flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all group">
                  <Camera
                    size={24}
                    className="text-muted group-hover:text-primary transition-colors mb-2"
                  />
                  <span className="text-sm font-medium text-foreground mb-1">
                    Click to upload image
                  </span>
                  <span className="text-xs text-muted">
                    PNG, JPG, up to 2MB
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      if (e.target.files?.[0]) {
                        try {
                          const base64 = await fileToBase64(e.target.files[0]);
                          setEditingMenuItem((prev) => ({
                            ...prev,
                            image: base64,
                            images: [base64],
                          }));
                        } catch (err) {
                          console.error(err);
                        }
                      }
                    }}
                  />
                </label>
              )}
            </div>

            {/* Variants */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-muted block uppercase tracking-wide">
                  Item Variants
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setVariantForm({ name: "", price: "", image: null });
                    setEditingVariantIndex(-1);
                    setIsVariantModalOpen(true);
                  }}
                  className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                >
                  <Plus size={14} />
                  Add Variant
                </button>
              </div>
              <div className="space-y-2">
                {(editingMenuItem.variants || []).length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin">
                    {(editingMenuItem.variants || []).map((variant, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-lg border border-primary/30 bg-background group hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
                        onClick={() => {
                          setEditingVariantIndex(index);
                          setVariantForm(variant);
                          setIsVariantModalOpen(true);
                        }}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {variant.image ? (
                            <img
                              src={getImageUrl(variant.image)}
                              alt={variant.name}
                              className="w-10 h-10 rounded-md object-cover border border-primary/30 shadow-sm"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-surface border border-primary/30 flex items-center justify-center shadow-sm">
                              <Camera size={14} className="text-muted/50" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-semibold text-foreground">
                              {variant.name}
                            </div>
                            <div className="text-xs text-primary font-bold">
                              ₹{variant.price}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingMenuItem((prev) => {
                              const newV = [...(prev.variants || [])];
                              newV.splice(index, 1);
                              return { ...prev, variants: newV };
                            });
                          }}
                          className="w-8 h-8 rounded-full bg-danger/10 text-danger flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-danger hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg border border-dashed border-border bg-surface-hover flex items-center justify-center">
                    <p className="text-xs text-muted/70 font-medium">
                      No variants added. Base price will be used.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Food Type */}
            <div className="pt-2">
              <label className="text-xs font-semibold text-muted mb-2 block uppercase tracking-wide">
                Food Type
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setEditingMenuItem((prev) => ({ ...prev, foodType: "Veg" }))
                  }
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-all ${editingMenuItem.foodType === "Veg" ? "border-success bg-success/10 text-success ring-1 ring-success/30" : "border-primary/30 text-foreground hover:bg-surface"}`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-success"></span>{" "}
                  Veg
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setEditingMenuItem((prev) => ({
                      ...prev,
                      foodType: "Non-Veg",
                    }))
                  }
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-all ${editingMenuItem.foodType === "Non-Veg" ? "border-danger bg-danger/10 text-danger ring-1 ring-danger/30" : "border-primary/30 text-foreground hover:bg-surface"}`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-danger"></span>{" "}
                  Non-Veg
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
              <span className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Status
              </span>
              <CustomToggle
                checked={editingMenuItem.status}
                onChange={(v) =>
                  setEditingMenuItem((prev) => ({ ...prev, status: v }))
                }
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
              <button
                type="button"
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-foreground bg-surface border border-primary/30 hover:bg-surface-hover transition-colors shadow-sm"
                onClick={() => setEditingMenuItem(null)}
              >
                Cancel
              </button>
              {!editingMenuItem?.isViewOnly && (
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
                  onClick={handleSaveMenuItem}
                >
                  {editingMenuItem.isNew ? "Add Item" : "Update Item"}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modals */}
      <Modal
        isOpen={messagingModalOpen}
        onClose={() => setMessagingModalOpen(false)}
        title="Send Message"
      >
        <div
          className={`space-y-4 ${editingMenuItem?.isViewOnly ? "pointer-events-none opacity-90" : ""}`}
        >
          <div className="flex items-center gap-3 p-3 bg-surface-hover rounded-lg border border-border">
            <Avatar
              src={getImageUrl(restaurant?.logo)}
              identifier={restaurant?.name}
              className="h-10 w-10 rounded-full shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {restaurant?.name}
              </p>
              <p className="text-xs text-muted truncate">
                Owner: {restaurant?.ownerName || restaurant?.owner || "--"}
              </p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Message
            </label>
            <textarea
              className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-25"
              placeholder="Type your message here..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="secondary"
              onClick={() => setMessagingModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={isSendingMessage || !messageText.trim()}
            >
              {isSendingMessage ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isBlockModalOpen}
        onClose={() => setBlockModalOpen(false)}
        title={
          restaurant?.status === "Blocked"
            ? "Unblock Restaurant"
            : "Block Restaurant"
        }
      >
        <p className="text-sm text-muted">
          {restaurant?.status === "Blocked"
            ? `Are you sure you want to unblock ${restaurant?.name}? They will regain access to the platform.`
            : `Are you sure you want to block ${restaurant?.name}? They will no longer be able to log in or receive orders.`}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setBlockModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant={restaurant?.status === "Blocked" ? "success" : "danger"}
            onClick={handleBlockToggle}
            disabled={isBlocking}
          >
            {restaurant?.status === "Blocked" ? "Yes, Unblock" : "Yes, Block"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default RestaurantsDetails;
