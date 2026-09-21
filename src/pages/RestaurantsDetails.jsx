import { useEffect, useState } from "react";
import { 
  ArrowLeft, MapPin, Phone, Mail, Clock, Store, Star, ShoppingBag, 
  Pencil, Plus, Trash2, CloudUpload, Search, GripVertical 
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";

import { getRestaurantById, updateRestaurant, deleteRestaurant, updateRestaurantStatus } from "../api/restaurantsApi";
import { getCategories } from "../api/categoriesApi";
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

const TABS = ["Menu Items", "Orders", "Offers & Coupons", "Reviews"];

function RestaurantsDetails() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [activeTab, setActiveTab] = useState("Menu Items");

  const [categories, setCategories] = useState([]);
  const [menuSearch, setMenuSearch] = useState("");
  const [editingMenuItem, setEditingMenuItem] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRestaurantById(restaurantId);
        
        if (data && data.menuItems) {
          data.menuItems = data.menuItems.map(item => {
            if (!item.id) {
              return { ...item, id: `legacy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
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
    return () => { isMounted = false; };
  }, [restaurantId]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCats();
  }, []);

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
    setEditingMenuItem({
      isNew: true,
      id: `temp-${Date.now()}`,
      name: "",
      category: "",
      price: "",
      foodType: "Veg",
      status: true,
      image: "",
      images: [null, null, null, null],
    });
  };

  const handleSaveMenuItem = async () => {
    try {
      const updatedRestaurant = { ...restaurant };
      updatedRestaurant.menuItems = updatedRestaurant.menuItems || [];
      if (editingMenuItem.isNew) {
        const newItem = { ...editingMenuItem };
        delete newItem.isNew;
        updatedRestaurant.menuItems.push(newItem);
      } else {
        updatedRestaurant.menuItems = updatedRestaurant.menuItems.map(item => 
          item.id === editingMenuItem.id ? editingMenuItem : item
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
      updatedRestaurant.menuItems = (updatedRestaurant.menuItems || []).filter(item => item.id !== itemId);
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
          <p className="text-sm text-danger">{error || "Restaurant not found."}</p>
          <Button variant="secondary" onClick={() => navigate("/restaurants")}>
            <ArrowLeft size={16} className="mr-2" /> Back to Restaurants
          </Button>
        </div>
      </section>
    );
  }

  const filteredMenuItems = (restaurant.menuItems || []).filter(item => 
    item.name.toLowerCase().includes(menuSearch.toLowerCase())
  );

  return (
    <section className="min-h-full bg-background relative">
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm p-4 sm:p-6 pb-0 mb-6">
        <div className="max-w-7xl mx-auto space-y-4">
          
          {/* Header Profile Card */}
          <div className="flex flex-col lg:flex-row gap-6 items-start justify-between bg-surface p-5 rounded-xl border border-border">
            <div className="flex flex-col sm:flex-row gap-6 items-start w-full">
              <div className="h-28 w-28 shrink-0 rounded-2xl bg-primary/10 text-primary flex items-center justify-center overflow-hidden border border-border/50 shadow-sm">
                {restaurant.logo ? (
                  <img src={restaurant.logo} alt={restaurant.name} className="w-full h-full object-cover" />
                ) : (
                  <Store size={40} strokeWidth={1.5} />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">{restaurant.name}</h1>
                  <div className="flex flex-col items-center gap-1.5 shrink-0 ml-2 relative">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${restaurant.status === "Active" ? 'text-success bg-success/10' : 'text-muted bg-surface-hover'}`}>
                      {restaurant.status === "Active" ? 'Active' : 'Inactive'}
                    </span>
                    <CustomToggle 
                      checked={restaurant.status === "Active"} 
                      onChange={async (val) => {
                        const newStatus = val ? "Active" : "Inactive";
                        setRestaurant(prev => ({ ...prev, status: newStatus }));
                        setStatusError("");
                        try {
                          const updatedRestaurant = { ...restaurant, status: newStatus };
                          await updateRestaurant(restaurant.id, updatedRestaurant);
                        } catch (err) {
                          setRestaurant(prev => ({ ...prev, status: val ? "Inactive" : "Active" }));
                          setStatusError("Unable to update restaurant status. Please try again.");
                        }
                      }}
                    />
                    {statusError && (
                      <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-danger text-[10px] whitespace-nowrap bg-surface px-2 py-1 rounded shadow-sm border border-danger/20 z-10">
                        {statusError}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted mb-2 truncate">{restaurant.cuisineType}</p>
                <div className="flex items-center gap-1.5 font-semibold text-sm">
                  <Star size={14} className="text-warning fill-warning" /> 
                  {restaurant.rating?.toFixed(1) || "New"} <span className="text-muted font-normal text-xs ml-1">({restaurant.reviewsCount || 0} reviews)</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 lg:ml-auto w-full lg:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-border">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-muted shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-medium text-muted uppercase mb-0.5">Address</p>
                    <p className="text-sm text-foreground max-w-[200px] leading-snug">{restaurant.address || "-"}</p>
                    <p className="text-sm text-foreground">{restaurant.city || ""}</p>
                  </div>
                </div>
                
                <div className="w-px bg-border hidden sm:block h-10 self-center"></div>

                <div className="flex items-start gap-3">
                  <Phone size={16} className="text-muted shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-medium text-muted uppercase mb-0.5">Phone</p>
                    <p className="text-sm text-foreground">{restaurant.phone || "-"}</p>
                  </div>
                </div>

                <div className="w-px bg-border hidden sm:block h-10 self-center"></div>

                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-muted shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-medium text-muted uppercase mb-0.5">Email</p>
                    <p className="text-sm text-foreground">{restaurant.email || "-"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 w-full lg:w-auto mt-4 lg:mt-0 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/restaurants/edit/${restaurant.id}`)}
                className="gap-2 border border-primary text-primary hover:bg-primary/5 rounded-full px-5 py-2 w-full sm:w-auto font-semibold"
              >
                <Pencil size={14} strokeWidth={2.5} />
                Edit Restaurant
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto gap-2 px-1">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeTab === tab 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted hover:text-foreground hover:border-border/50"
                }`}
              >
                {tab === "Menu Items" && <Store size={16} />}
                {tab === "Orders" && <ShoppingBag size={16} />}
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 pt-0 space-y-6">

        {activeTab === "Menu Items" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Menu Items ({(restaurant.menuItems || []).length})</h2>
                <p className="text-sm text-muted mt-1">Manage your restaurant's menu items. Add, edit or remove items as needed.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <Input 
                    placeholder="Search menu items..." 
                    className="pl-9 w-full"
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddNewItem} className="shrink-0 gap-1.5 w-full sm:w-auto">
                  <Plus size={16} />
                  Add New Item
                </Button>
              </div>
            </div>

            {(restaurant.menuItems || []).length === 0 ? (
              <div className="text-center py-16 px-4 bg-surface rounded-xl border border-border border-dashed">
                <Store size={40} className="mx-auto text-muted/50 mb-3" />
                <h3 className="text-base font-semibold text-foreground mb-1">No Menu Items</h3>
                <p className="text-sm text-muted max-w-sm mx-auto">
                  This restaurant doesn't have any menu items yet. Click "Add New Item" to create one.
                </p>
              </div>
            ) : filteredMenuItems.length === 0 ? (
              <div className="text-center py-16 px-4 bg-surface rounded-xl border border-border border-dashed">
                <Search size={40} className="mx-auto text-muted/50 mb-3" />
                <h3 className="text-base font-semibold text-foreground mb-1">No Results</h3>
                <p className="text-sm text-muted max-w-sm mx-auto">
                  No menu items match your search.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredMenuItems.map(item => (
                  <Card key={item.id} className="p-4 flex gap-4 items-center group relative border-border/60 hover:border-primary/30 transition-colors">
                    <div className="text-muted/40 cursor-grab active:cursor-grabbing hover:text-muted hidden sm:block shrink-0">
                      <GripVertical size={20} />
                    </div>
                    
                    <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-primary/5 flex items-center justify-center">
                      {(item.image || (item.images && item.images[0])) ? (
                        <img src={item.image || (item.images && item.images[0])} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Store size={24} className="text-primary/40" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-bold text-foreground truncate" title={item.name}>{item.name}</h4>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button 
                            type="button"
                            onClick={() => setEditingMenuItem({ ...item })}
                            className="w-7 h-7 rounded border border-border bg-surface flex items-center justify-center hover:bg-surface-hover text-muted hover:text-foreground transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleDeleteMenuItem(item.id)}
                            className="w-7 h-7 rounded border border-danger/20 bg-danger/5 flex items-center justify-center hover:bg-danger hover:text-white text-danger transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs">
                        <span className="font-semibold text-primary">{item.category || "Uncategorized"}</span>
                        <span className="text-muted">•</span>
                        <span className="font-bold text-foreground">₹{item.price || 0}</span>
                        <span className="text-muted">•</span>
                        <div className="flex items-center gap-1.5">
                           <span className={`w-2 h-2 rounded-full ${item.foodType === 'Non-Veg' ? 'bg-danger' : 'bg-success'}`}></span>
                           <span className="font-medium text-muted">{item.foodType || "Veg"}</span>
                        </div>
                      </div>
                      
                      <div className="mt-2.5 flex items-center">
                         <Badge variant={item.status ? "success" : "secondary"} className="text-[10px] px-2 py-0.5">
                           {item.status ? "Active" : "Inactive"}
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
            <ShoppingBag size={48} strokeWidth={1.5} className="mx-auto text-muted/30 mb-4" />
            <h3 className="text-base font-semibold text-foreground mb-1">No Orders Available</h3>
            <p className="text-sm text-muted max-w-sm mx-auto">
              This restaurant currently has no order history to display.
            </p>
          </div>
        )}

        {activeTab === "Offers & Coupons" && (
          <div className="text-center py-20 px-4 bg-surface rounded-xl border border-border border-dashed">
            <Store size={48} strokeWidth={1.5} className="mx-auto text-muted/30 mb-4" />
            <h3 className="text-base font-semibold text-foreground mb-1">No Offers Available</h3>
            <p className="text-sm text-muted max-w-sm mx-auto">
              There are no active offers or coupons for this restaurant.
            </p>
          </div>
        )}

        {activeTab === "Reviews" && (
          <div className="text-center py-20 px-4 bg-surface rounded-xl border border-border border-dashed">
            <Star size={48} strokeWidth={1.5} className="mx-auto text-muted/30 mb-4" />
            <h3 className="text-base font-semibold text-foreground mb-1">No Ratings or Complaints Available</h3>
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
          Are you sure you want to delete <strong className="text-foreground">{restaurant.name}</strong>? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
          <Button 
            className="bg-danger hover:bg-danger/90 text-white" 
            onClick={handleDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Modal>

      {/* Edit/Add Menu Item Modal */}
      <Modal
        isOpen={!!editingMenuItem}
        onClose={() => setEditingMenuItem(null)}
        title={editingMenuItem?.isNew ? "Add Menu Item" : "Edit Menu Item"}
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
                onClick={handleSaveMenuItem}
              >
                {editingMenuItem.isNew ? "Add Item" : "Update Item"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}

export default RestaurantsDetails;
