import { useEffect, useState, useRef } from "react";
import { ArrowLeft, Tags, Activity, FileText, Image as ImageIcon, MoreVertical, Edit2, Trash2, Calendar,
  FolderTree,
  Plus,
  X
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import ActionMenu from "../components/ui/ActionMenu";
import { getCategoryById, updateCategory, getCategories } from "../api/categoriesApi";
import { getProductsByCategory, addProduct, updateProduct, deleteProduct } from "../api/productsApi";

function CategoriesDetails() {
 const navigate = useNavigate();
 const { categoryId } = useParams();
 
 const [category, setCategory] = useState(null);
 const [parentCategory, setParentCategory] = useState(null);
 const [childCategories, setChildCategories] = useState([]);
 const [menuItems, setMenuItems] = useState([]);
 const [allCategories, setAllCategories] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");

 // Modal State
 const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
 const [editingMenuId, setEditingMenuId] = useState(null);
 const [menuForm, setMenuForm] = useState({
 name: "",
 status: "Available",
 image: null,
 categoryId: ""
 });
 const [menuSubmitting, setMenuSubmitting] = useState(false);
   const fileInputRef = useRef(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingMenu, setViewingMenu] = useState(null);

  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [editingVariantIndex, setEditingVariantIndex] = useState(-1);
  const [variantForm, setVariantForm] = useState({ name: "", price: "", image: null });
  const variantFileInputRef = useRef(null);

  const handleVariantImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size must be less than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setVariantForm({ ...variantForm, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveVariant = (e) => {
    e.preventDefault();
    if (!variantForm.name || !variantForm.price) return;
    const newV = [...(menuForm.variants || [])];
    if (editingVariantIndex >= 0) {
      newV[editingVariantIndex] = variantForm;
    } else {
      newV.push(variantForm);
    }
    setMenuForm({ ...menuForm, variants: newV });
    setIsVariantModalOpen(false);
  };

  const handleViewMenuClick = (item) => {
    setViewingMenu(item);
    setIsViewModalOpen(true);
  };


 const loadData = async (isMounted = true) => {
 try {
 setLoading(true);
 setError("");
 const [catData, productsData, allCats] = await Promise.all([
 getCategoryById(categoryId),
 getProductsByCategory(categoryId),
 getCategories()
 ]);
 if (isMounted) {
 setCategory(catData);
 setMenuItems(productsData || []);
 if (catData.parentId) {
 setParentCategory(allCats.find(c => c.id === catData.parentId) || null);
 }
 setChildCategories(allCats.filter(c => c.parentId === catData.id));
 setAllCategories(allCats || []);
 }
 } catch {
 if (isMounted) setError("Unable to load category details.");
 } finally {
 if (isMounted) setLoading(false);
 }
 };

 useEffect(() => {
 let isMounted = true;
 loadData(isMounted);
 return () => { isMounted = false; };
 }, [categoryId]);

 const handleImageChange = (e) => {
 const file = e.target.files[0];
 if (file) {
 if (file.size > 2 * 1024 * 1024) {
 alert("Image size must be less than 2MB.");
 return;
 }
 const reader = new FileReader();
 reader.onloadend = () => {
 setMenuForm({ ...menuForm, image: reader.result });
 };
 reader.readAsDataURL(file);
 }
 };

 const handleAddMenu = async (e) => {
 e.preventDefault();
 if (!menuForm.name) return;
 
 setMenuSubmitting(true);
 try {
 const targetCategoryId = menuForm.categoryId || categoryId;

 if (editingMenuId) {
 const currentItem = menuItems.find(m => m.id === editingMenuId);
 const oldCategoryId = currentItem ? currentItem.categoryId : null;

 const updateData = {
  name: menuForm.name,
  status: menuForm.status,
  image: menuForm.image,
  categoryId: targetCategoryId,
  varients: menuForm.variants,
  variants: menuForm.variants,
  };
 await updateProduct(editingMenuId, updateData);

 if (oldCategoryId && oldCategoryId !== targetCategoryId) {
 const oldCat = allCategories.find(c => c.id === oldCategoryId) || category;
 const oldCatCount = Math.max((oldCat.itemCount || 1) - 1, 0);
 await updateCategory(oldCategoryId, { ...oldCat, itemCount: oldCatCount });
 
 const newCat = allCategories.find(c => c.id === targetCategoryId);
 if (newCat) {
 const newCatCount = (newCat.itemCount || 0) + 1;
 await updateCategory(targetCategoryId, { ...newCat, itemCount: newCatCount });
 }
 }
 } else {
 const newMenu = {
  id: `M${Date.now()}`,
  categoryId: targetCategoryId,
  name: menuForm.name,
  status: menuForm.status,
  image: menuForm.image,
  varients: menuForm.variants,
  variants: menuForm.variants,
  createdDate: new Date().toISOString()
  };
 await addProduct(newMenu);
 
 // Update item count on category
 const targetCat = allCategories.find(c => c.id === targetCategoryId) || category;
 const newCount = (targetCat.itemCount || 0) + 1;
 await updateCategory(targetCategoryId, { ...targetCat, itemCount: newCount });
 }
 
 setMenuForm({ name: "", status: "Available", image: null, categoryId: "" });
 setEditingMenuId(null);
 setIsMenuModalOpen(false);
 loadData(); // Refresh data
 } catch (err) {
 alert("Failed to save Item.");
 } finally {
 setMenuSubmitting(false);
 }
 };

 const handleEditMenuClick = (item) => {
    setEditingMenuId(item.id);
    setMenuForm({
      name: item.name || "",
      status: item.status || "Available",
      image: item.image || null,
      categoryId: item.categoryId || categoryId,
      variants: item.varients || item.variants || [],
    });
    setIsMenuModalOpen(true);
  };

 const handleDeleteMenuClick = async (itemId) => {
 if (!window.confirm("Are you sure you want to delete this Item?")) return;
 try {
 await deleteProduct(itemId);
 const newCount = Math.max((category.itemCount || 1) - 1, 0);
 await updateCategory(category.id, { ...category, itemCount: newCount });
 loadData();
 } catch (error) {
 alert("Failed to delete Item.");
 }
 };

 const handleToggleCategoryStatus = async () => {
 if (category.status === "Deleted") return;
 try {
 const newStatus = category.status === "Active" ? "Inactive" : "Active";
 const updatedCategory = { ...category, status: newStatus };
 await updateCategory(category.id, updatedCategory);
 setCategory(updatedCategory);
 } catch (err) {
 alert("Failed to update category status.");
 }
 };

 if (loading) {
 return (
 <section className="min-h-full bg-background p-4 sm:p-6 flex items-center justify-center">
 <div className="animate-pulse flex flex-col items-center">
 <div className="h-12 w-12 rounded-full bg-primary/20 mb-4"></div>
 <p className="text-sm text-muted font-medium">Loading premium details...</p>
 </div>
 </section>
 );
 }

 if (error || !category) {
 return (
 <section className="min-h-full bg-background p-4 sm:p-6">
 <div className="rounded-xl border border-border bg-surface p-6 flex flex-col items-center justify-center h-48">
 <p className="text-sm text-danger mb-4 font-medium">{error || "Category not found."}</p>
 <Button variant="secondary" size="sm" onClick={() => navigate("/categories")}>
 <ArrowLeft size={16} /> Back to Categories
 </Button>
 </div>
 </section>
 );
 }

 const currentStatus = category.status ? category.status.charAt(0).toUpperCase() + category.status.slice(1).toLowerCase() : "Active";

 return (
 <section className="min-h-full bg-background p-4 sm:p-6 pb-20">
 <div className="mx-auto max-w-6xl space-y-6">
 
 {/* Navigation */}
 <div>
 <button 
 onClick={() => navigate("/categories")}
 className="flex items-center gap-2 text-sm font-medium text-muted hover:text-primary transition-colors"
 >
 <ArrowLeft size={16} /> Back to Categories
 </button>
 </div>

 {/* Premium Banner */}
 <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary to-primary-hover p-8 shadow-xl">
 <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"></div>
 <div className="absolute bottom-0 left-20 -mb-10 h-32 w-32 rounded-full bg-white opacity-10 blur-2xl"></div>
 
 <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
 <div className="flex items-center gap-5">
 <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-inner">
                  {category.image ? (
                    <img src={category.image} alt={category.name} className="h-full w-full object-cover rounded-2xl" />
                  ) : (
                    <Tags size={40} />
                  )}
 </div>
 <div className="text-white">
 <div className="flex items-center gap-3 mb-1">
 <h1 className="text-3xl font-extrabold tracking-tight">{category.name}</h1>
 <button 
 onClick={handleToggleCategoryStatus}
 className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-0 cursor-pointer shadow-sm ${currentStatus === "Active" ? "bg-success text-white hover:bg-success/90" : "bg-danger text-white hover:bg-danger/90"}`}
 title="Click to toggle status"
 >
 {currentStatus}
 </button>
 </div>
 <div className="flex items-center gap-4 text-sm font-medium text-white/80">
 <span>ID: {category.categoryId}</span>
 <span className="h-1 w-1 rounded-full bg-white/50"></span>
 <span>Type: {category.type}</span>
 </div>
 </div>
 </div>
 
 <Button
 variant="default"
 onClick={() => navigate(`/categories/edit/${category.id}`)}
 className="bg-white text-primary hover:bg-white/90 shadow-lg"
 >
 <Edit2 size={16} className="mr-2" /> Edit Category
 </Button>
 </div>
 </div>

 <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
 {/* Main Content (Menus) */}
 <div className="flex flex-col gap-6">
 <div className="flex items-center justify-between">
 <h2 className="text-xl font-bold text-foreground">Category Items</h2>
 <Button size="sm" className="shadow-sm shadow-primary/20" onClick={() => {
 setMenuForm({ name: "", status: "Available", image: null, categoryId: categoryId });
 setEditingMenuId(null);
 setIsMenuModalOpen(true);
 }}>
 + Add Item
 </Button>
 </div>
 
 {/* Real Items Grid */}
 {menuItems.length === 0 ? (
 <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
 <div className="rounded-full bg-primary/10 p-4 text-primary mb-4">
 <Tags size={32} />
 </div>
 <h3 className="text-lg font-bold text-foreground mb-1">No items added yet</h3>
 <p className="text-sm text-muted mb-6 max-w-xs">There are currently no Items associated with this category. Add your first item!</p>
 <Button onClick={() => {
 setMenuForm({ name: "", status: "Available", image: null, categoryId: categoryId });
 setEditingMenuId(null);
 setIsMenuModalOpen(true);
 }}>+ Add Item</Button>
 </div>
 ) : (
 <div className="grid gap-4 sm:grid-cols-2">
 {menuItems.map((item) => (
 <div key={item.id} className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/50 cursor-pointer"
                    onClick={() => handleViewMenuClick(item)}>
 <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-background border border-border overflow-hidden">
 {item.image ? (
 <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
 ) : (
 <ImageIcon size={24} className="text-muted/50" />
 )}
 </div>
 <div className="flex-1">
 <h4 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{item.name}</h4>
 <p className="text-xs text-muted font-medium mb-1">{(item.varients || item.variants)?.length || 0} variants</p>
 <Badge variant={item.status === 'Available' ? 'success' : 'danger'} className="text-[10px] px-1.5 py-0 h-4">
 {item.status}
 </Badge>
 </div>
 <ActionMenu 
 actions={[
 { label: "Edit", icon: Edit2, onClick: () => handleEditMenuClick(item) },
 { label: "Delete", icon: Trash2, onClick: (e) => { e.stopPropagation(); handleDeleteMenuClick(item.id); }, danger: true }
 ]} 
 />
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Sidebar Info */}
 <div className="flex flex-col gap-6">
 {/* General Info */}
 <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
 <h3 className="mb-5 text-base font-bold text-foreground">General Info</h3>
 <div className="space-y-4">
 <div className="flex gap-4 items-start">
 <div className="mt-0.5 rounded-full bg-primary/10 p-1.5 text-primary">
 <FileText size={16} />
 </div>
 <div>
 <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Description</p>
 <p className="text-sm font-medium text-foreground leading-relaxed">
 {category.description || "No description provided for this category."}
 </p>
 </div>
 </div>
 
 <div className="flex gap-4 items-start">
 <div className="mt-0.5 rounded-full bg-primary/10 p-1.5 text-primary">
 <Tags size={16} />
 </div>
 <div>
 <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Items Count</p>
 <p className="text-sm font-bold text-foreground">
 {category.itemCount || 0} Items linked
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* System Info */}
 <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
 <h3 className="mb-5 text-base font-bold text-foreground">System Info</h3>
 <div className="space-y-4">
 <div className="flex gap-4 items-start">
 <div className="rounded-full bg-background p-1.5 text-muted border border-border">
 <Calendar size={16} />
 </div>
 <div>
 <p className="text-xs font-semibold text-muted uppercase tracking-wider">Created Date</p>
 <p className="text-sm font-medium text-foreground">
 {category.createdDate ? new Date(category.createdDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "Not specified"}
 </p>
 </div>
 </div>
 <div className="flex gap-4 items-start">
 <div className="rounded-full bg-background p-1.5 text-muted border border-border">
 <FolderTree size={16} />
 </div>
 <div>
 <p className="text-xs font-semibold text-muted uppercase tracking-wider">Parent Category</p>
 <p className="text-sm font-medium text-foreground">
 {parentCategory ? parentCategory.name : category.parentId ? category.parentId : "None (Top-Level)"}
 </p>
 </div>
 </div>
 </div>
 </div>

 
 </div>
 </div>
 </div>

       {/* Add/Edit Item Modal */}
      <Modal
        isOpen={isMenuModalOpen}
        onClose={() => {
          setIsMenuModalOpen(false);
          setEditingMenuId(null);
          setMenuForm({
            name: "",
            status: "Available",
            image: null,
            categoryId: "",
            variants: [],
          });
        }}
        title={editingMenuId ? "Edit Item" : "Add Item"}
      >
        <form onSubmit={handleAddMenu} className="space-y-4">
          <Input
            label="Item Name"
            placeholder="e.g. Classic Burger"
            value={menuForm.name}
            onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Item Image
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            {menuForm.image ? (
              <div className="relative h-32 w-full rounded-xl border border-border overflow-hidden group">
                <img
                  src={menuForm.image}
                  alt="Item preview"
                  className="h-full w-full object-contain bg-background/50"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-4">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => setMenuForm({ ...menuForm, image: null })}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background/50 hover:bg-background transition-colors"
              >
                <ImageIcon className="mb-2 text-muted" size={24} />
                <span className="text-sm font-medium text-muted">
                  Click to upload image
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  SVG, PNG, or JPG (Max 2MB)
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Select
                label="Status"
                options={["Available", "Out of Stock"]}
                value={menuForm.status}
                onChange={(e) =>
                setMenuForm({ ...menuForm, status: e.target.value })
                }
            />
          </div>

          <Select
            label="Category"
            options={allCategories.map((c) => ({ label: c.name, value: c.id }))}
            value={menuForm.categoryId || categoryId}
            onChange={(e) =>
              setMenuForm({ ...menuForm, categoryId: e.target.value })
            }
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-foreground">
                Item Variants (e.g. Types, Sizes)
              </label>
              <Button
                type="button"
                size="sm"
                variant="primary"
                onClick={() => {
                    setVariantForm({ name: "", price: "", image: menuForm.image });
                    setEditingVariantIndex(-1);
                    setIsVariantModalOpen(true);
                }}
              >
                <Plus size={12} className="mr-1" /> Add Variant
              </Button>
            </div>
            {(menuForm.variants || []).length > 0 ? (
              <div className="space-y-3 mb-2">
                {menuForm.variants.map((variant, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => {
                        setVariantForm(variant);
                        setEditingVariantIndex(index);
                        setIsVariantModalOpen(true);
                    }}
                  >
                    {variant.image ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-border bg-surface">
                            <img src={variant.image} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-lg shrink-0 border border-border bg-surface flex items-center justify-center">
                            <ImageIcon size={16} className="text-muted/50" />
                        </div>
                    )}
                    <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">{variant.name}</p>
                        <p className="text-xs font-semibold text-primary">₹{variant.price}</p>
                    </div>
                    <Button
                      type="button"
                      variant="danger"
                      className="px-2 shrink-0 h-8 w-8 p-0 flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newV = [...menuForm.variants];
                        newV.splice(index, 1);
                        setMenuForm({ ...menuForm, variants: newV });
                      }}
                    >
                      <span className="text-white text-sm font-bold">✕</span>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted italic mb-2">No variants added. Base price will be used.</p>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button
              variant="ghost"
              type="button"
              className="mr-3"
              onClick={() => {
                setIsMenuModalOpen(false);
                setEditingMenuId(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={menuSubmitting}>
              {menuSubmitting
                ? "Saving..."
                : editingMenuId
                  ? "Update Item"
                  : "Add Item"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add/Edit Variant Modal */}
      <Modal
        isOpen={isVariantModalOpen}
        onClose={() => setIsVariantModalOpen(false)}
        title={editingVariantIndex >= 0 ? "Edit Variant" : "Add Variant"}
      >
        <form onSubmit={handleSaveVariant} className="space-y-4">
          <Input
            label="Variant Name"
            placeholder="e.g. Rava Idly"
            value={variantForm.name}
            onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
            required
          />
          <Input
            label="Price (₹)"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={variantForm.price}
            onChange={(e) =>
              setVariantForm({ ...variantForm, price: e.target.value })
            }
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Variant Image (Optional)
            </label>
            <input
              type="file"
              ref={variantFileInputRef}
              onChange={handleVariantImageChange}
              accept="image/*"
              className="hidden"
            />
            {variantForm.image ? (
              <div className="relative h-32 w-full rounded-xl border border-border overflow-hidden group">
                <img
                  src={variantForm.image}
                  alt="Variant preview"
                  className="h-full w-full object-contain bg-background/50"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-4">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => variantFileInputRef.current?.click()}
                  >
                    Change
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => setVariantForm({ ...variantForm, image: null })}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => variantFileInputRef.current?.click()}
                className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background/50 hover:bg-background transition-colors"
              >
                <ImageIcon className="mb-2 text-muted" size={24} />
                <span className="text-sm font-medium text-muted">
                  Click to upload image
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  SVG, PNG, or JPG (Max 2MB)
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-border mt-4">
             <Button
              variant="ghost"
              type="button"
              className="mr-3"
              onClick={() => setIsVariantModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Variant</Button>
          </div>
        </form>
      </Modal>

      {/* View Item Modal */}
      {viewingMenu && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setViewingMenu(null);
          }}
          title="Item Details"
          maxWidth="max-w-2xl"
        >
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Col: Image */}
            <div className="w-full md:w-5/12 shrink-0">
               {viewingMenu.image ? (
                 <div className="w-full aspect-square rounded-2xl overflow-hidden border border-border shadow-sm">
                   <img src={viewingMenu.image} alt={viewingMenu.name} className="w-full h-full object-cover" />
                 </div>
               ) : (
                 <div className="w-full aspect-square rounded-2xl overflow-hidden border border-border bg-background flex items-center justify-center shadow-sm">
                   <ImageIcon size={48} className="text-muted/50" />
                 </div>
               )}
            </div>

            {/* Right Col: Details */}
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{viewingMenu.name}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background rounded-xl p-4 border border-border shadow-sm">
                  <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Status</p>
                  <Badge variant={viewingMenu.status === "Available" ? "success" : "secondary"}>
                    {viewingMenu.status}
                  </Badge>
                </div>
                <div className="bg-background rounded-xl p-4 border border-border shadow-sm">
                  <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Category</p>
                  {allCategories.find((c) => c.id === viewingMenu.categoryId) ? (
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                      {allCategories.find((c) => c.id === viewingMenu.categoryId).name}
                    </Badge>
                  ) : (
                    <span className="text-sm font-medium text-foreground">None</span>
                  )}
                </div>
              </div>

              {(viewingMenu.varients || viewingMenu.variants) && (viewingMenu.varients || viewingMenu.variants).length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                    <Tags size={16} className="text-primary"/> 
                    Available Variants
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin pr-2">
                    {(viewingMenu.varients || viewingMenu.variants).map((v, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background">
                        {v.image ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-border">
                                <img src={v.image} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-lg shrink-0 border border-border bg-surface flex items-center justify-center">
                                <ImageIcon size={16} className="text-muted/50" />
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
                  setTimeout(() => handleEditMenuClick(viewingMenu), 100);
                }}>
                  <Edit2 size={16} className="mr-2" />
                  Edit Item
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}

export default CategoriesDetails;
