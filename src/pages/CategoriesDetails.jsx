import { useEffect, useState, useRef } from "react";
import { ArrowLeft, Tags, Activity, FileText, Image as ImageIcon, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import { getCategoryById, updateCategory } from "../api/categoriesApi";
import { getProductsByCategory, addProduct } from "../api/productsApi";

function CategoriesDetails() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
 
  const [category, setCategory] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [menuForm, setMenuForm] = useState({
    name: "",
    price: "",
    status: "Available",
    image: null
  });
  const [menuSubmitting, setMenuSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const loadData = async (isMounted = true) => {
    try {
      setLoading(true);
      setError("");
      const [catData, productsData] = await Promise.all([
        getCategoryById(categoryId),
        getProductsByCategory(categoryId)
      ]);
      if (isMounted) {
        setCategory(catData);
        setMenuItems(productsData || []);
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
    if (!menuForm.name || !menuForm.price) return;
    
    setMenuSubmitting(true);
    try {
      const newMenu = {
        id: `M${Date.now()}`,
        categoryId: categoryId,
        name: menuForm.name,
        price: parseFloat(menuForm.price),
        status: menuForm.status,
        image: menuForm.image,
        createdDate: new Date().toISOString()
      };
      await addProduct(newMenu);
      
      // Update item count on category
      const newCount = (category.itemCount || 0) + 1;
      await updateCategory(category.id, { ...category, itemCount: newCount });
      
      setMenuForm({ name: "", price: "", status: "Available", image: null });
      setIsMenuModalOpen(false);
      loadData(); // Refresh data
    } catch (err) {
      alert("Failed to add menu item.");
    } finally {
      setMenuSubmitting(false);
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
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-hover p-8 shadow-xl">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"></div>
          <div className="absolute bottom-0 left-20 -mb-10 h-32 w-32 rounded-full bg-white opacity-10 blur-2xl"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-inner">
                <Tags size={40} />
              </div>
              <div className="text-white">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-extrabold tracking-tight">{category.name}</h1>
                  <button 
                    onClick={handleToggleCategoryStatus}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-white/20 text-white border-0 backdrop-blur-md hover:bg-white/30 cursor-pointer shadow-sm"
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
              <h2 className="text-xl font-bold text-foreground">Category Menus</h2>
              <Button size="sm" className="shadow-sm shadow-primary/20" onClick={() => setIsMenuModalOpen(true)}>
                + Add Menu Item
              </Button>
            </div>
            
            {/* Real Menu Items Grid */}
            {menuItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
                <div className="rounded-full bg-primary/10 p-4 text-primary mb-4">
                  <Tags size={32} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">No menus added yet</h3>
                <p className="text-sm text-muted mb-6 max-w-xs">There are currently no menu items associated with this category. Add your first item!</p>
                <Button onClick={() => setIsMenuModalOpen(true)}>+ Add Menu Item</Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {menuItems.map((item) => (
                  <div key={item.id} className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/50">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-background border border-border overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon size={24} className="text-muted/50" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{item.name}</h4>
                      <p className="text-xs text-muted font-medium mb-1">${Number(item.price).toFixed(2)}</p>
                      <Badge variant={item.status === 'Available' ? 'success' : 'danger'} className="text-[10px] px-1.5 py-0 h-4">
                        {item.status}
                      </Badge>
                    </div>
                    <button className="h-8 w-8 rounded-full hover:bg-background flex items-center justify-center text-muted transition-colors">
                      <MoreVertical size={16} />
                    </button>
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
                <div className="flex gap-3">
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
                
                <div className="flex gap-3">
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
                <div className="flex gap-3 items-center">
                  <div className="rounded-full bg-background p-1.5 text-muted border border-border">
                    <Activity size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider">Created Date</p>
                    <p className="text-sm font-medium text-foreground">
                      {category.createdDate ? new Date(category.createdDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "Not specified"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="rounded-full bg-background p-1.5 text-muted border border-border">
                    <Activity size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider">Parent Category</p>
                    <p className="text-sm font-medium text-foreground">
                      {category.parentId ? category.parentId : "None (Top-Level)"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Menu Item Modal */}
      <Modal isOpen={isMenuModalOpen} onClose={() => setIsMenuModalOpen(false)} title="Add Menu Item">
        <form onSubmit={handleAddMenu} className="space-y-4">
          <Input 
            label="Menu Name" 
            placeholder="e.g. Classic Burger" 
            value={menuForm.name} 
            onChange={(e) => setMenuForm({...menuForm, name: e.target.value})} 
            required 
          />
          <Input 
            label="Price ($)" 
            type="number" 
            step="0.01" 
            placeholder="0.00" 
            value={menuForm.price} 
            onChange={(e) => setMenuForm({...menuForm, price: e.target.value})} 
            required 
          />
          <Select 
            label="Status" 
            options={["Available", "Out of Stock"]} 
            value={menuForm.status} 
            onChange={(e) => setMenuForm({...menuForm, status: e.target.value})} 
          />
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Menu Image</label>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
            
            {menuForm.image ? (
               <div className="relative h-32 w-full rounded-xl border border-border overflow-hidden group">
                 <img src={menuForm.image} alt="Preview" className="h-full w-full object-cover" />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <Button type="button" size="sm" variant="danger" onClick={() => setMenuForm({...menuForm, image: null})}>Remove</Button>
                 </div>
               </div>
            ) : (
               <div onClick={() => fileInputRef.current?.click()} className="h-32 w-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface cursor-pointer hover:border-primary transition-colors">
                 <ImageIcon size={24} className="text-muted mb-2" />
                 <span className="text-sm text-foreground font-medium">Upload Image</span>
               </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsMenuModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={menuSubmitting}>{menuSubmitting ? "Saving..." : "Save Menu"}</Button>
          </div>
        </form>
      </Modal>

    </section>
  );
}

export default CategoriesDetails;
