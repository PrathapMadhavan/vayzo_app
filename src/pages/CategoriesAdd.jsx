import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ShieldCheck, Search, Check, ChevronDown } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import StatusSelect from "../components/ui/StatusSelect";
import { createCategory, getCategoryById, updateCategory, getCategories } from "../api/categoriesApi";
import { getProductsByCategory } from "../api/productsApi";

const types = [
 "Select type",
 "Product",
 "Service",
 "Food",
];

const statusOptions = ["Active", "Inactive"];

function RequiredLabel({ text }) {
 return (
 <span className="flex items-center gap-1">
 {text}
 <span className="text-danger text-sm">*</span>
 </span>
 );
}

function CategoriesAdd() {
 const navigate = useNavigate();
 const { categoryId } = useParams();
 const [searchParams] = useSearchParams();
 const queryParentId = searchParams.get("parent") || searchParams.get("parentId") || "Food Delivery";
 
 const isEditing = !!categoryId;
 
 const [form, setForm] = useState({
 name: "",
 categoryId: "",
 type: "Product",
 status: statusOptions[0],
 description: "",
 parentId: queryParentId,
 scope: "Global",
 image: null,
 });
 
 const [parents, setParents] = useState([
 { id: "Food Delivery", name: "Food Delivery" },
 { id: "Buy & Get It", name: "Buy & Get It" },
 { id: "Bike Ride", name: "Bike Ride" },
 { id: "Car Booking", name: "Car Booking" },
 ]);
 const [allCategories, setAllCategories] = useState([]);
 const [dbId, setDbId] = useState(null);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");
 const [childCategories, setChildCategories] = useState([]);
 const [menuItems, setMenuItems] = useState([]);
 const fileInputRef = useRef(null);

 const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false);
 const [parentDropdownSearchText, setParentDropdownSearchText] = useState("");
 const parentDropdownRef = useRef(null);

 useEffect(() => {
 function handleClickOutside(event) {
 if (parentDropdownRef.current && !parentDropdownRef.current.contains(event.target)) {
 setIsParentDropdownOpen(false);
 }
 }
 document.addEventListener("mousedown", handleClickOutside);
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 const handleImageChange = (e) => {
 const file = e.target.files[0];
 if (file) {
 if (file.size > 2 * 1024 * 1024) {
 setError("Image size must be less than 2MB.");
 return;
 }
 const reader = new FileReader();
 reader.onloadend = () => {
 setForm({ ...form, image: reader.result });
 };
 reader.readAsDataURL(file);
 }
 };

 useEffect(() => {
 loadParents();
 if (isEditing) {
 loadCategoryData();
 }
 }, [categoryId]);

 const loadParents = async () => {
 // Parents are now hardcoded modules
 try {
 const allCats = await getCategories();
 setAllCategories(allCats);
 } catch (err) {
 console.error("Failed to load parents", err);
 }
 };

 const loadCategoryData = async () => {
 try {
 setLoading(true);
 const data = await getCategoryById(categoryId);
 if (data) {
 setDbId(data.id);
 const toTitleCase = (str) => {
 if (!str) return "";
 return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
 };

 setForm({
 name: data.name || "",
 categoryId: data.categoryId || "",
 type: data.type || "Product",
 status: data.status ? toTitleCase(data.status) : statusOptions[0],
 description: data.description || "",
 parentId: data.parentId || "Food Delivery",
 scope: data.scope || "Global",
    image: data.image || null,
 });

 // Load related data
 const allCats = await getCategories();
 setChildCategories(allCats.filter(c => c.parentId === data.id));
 
 try {
 const products = await getProductsByCategory(categoryId);
 setMenuItems(products || []);
 } catch (e) {
 console.error("Failed to load products", e);
 }
 }
 } catch (err) {
 setError("Unable to load category details.");
 } finally {
 setLoading(false);
 }
 };

 const update = (key) => (event) => {
 setForm({ ...form, [key]: event.target.value });
 };

 const field = (id, label, key, type = "text", placeholder) => (
 <Input
 id={id}
 label={<RequiredLabel text={label} />}
 type={type}
 placeholder={placeholder}
 value={form[key]}
 onChange={update(key)}
 required
 />
 );

 const handleSubmit = async (event) => {
 event.preventDefault();

 if (!form.name.trim()) {
 setError("Category Name is required.");
 return;
 }

 try {
 setLoading(true);
 setError("");

 let finalId = form.categoryId;
 if (!isEditing) {
 let isUnique = false;
 while (!isUnique) {
 finalId = `CAT${Math.floor(1000 + Math.random() * 9000)}`;
 const existing = allCategories.find(c => c.id === finalId || c.categoryId === finalId);
 if (!existing) isUnique = true;
 }
 }
 
 const payload = {
 name: form.name.trim(),
 categoryId: finalId,
 type: form.type,
 status: form.status,
 description: form.description,
 scope: form.scope,
 parentId: form.parentId === "null" ? "" : form.parentId,
      image: form.image
 };

 if (isEditing) {
 await updateCategory(dbId, payload);
 navigate("/categories");
 } else {
 payload.id = finalId;
 payload.itemCount = 0;
 payload.createdDate = new Date().toISOString().split("T")[0];
 
 const response = await createCategory(payload);
 if (response) {
 navigate("/categories");
 } else {
 setError("Failed to create category via API");
 }
 }
 } catch (err) {
 setError(err.message || "Unable to save category.");
 } finally {
 setLoading(false);
 }
 };

 return (
 <section className="min-h-full bg-background p-4 sm:p-6 pb-20">
 <div className="mx-auto max-w-5xl space-y-6">
 
 {/* Premium Page Header */}
 <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-primary to-primary-hover p-8 shadow-lg">
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
 {isEditing ? "Edit Category" : "Create New Category"}
 </h2>
 <p className="mt-1 text-sm text-primary-50 text-white/80">
 {isEditing ? "Update your category details" : "Add a fresh category to your Vayzo catalogue"}
 </p>
 </div>
 </div>
 <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-inner shadow-white/20">
 <ShieldCheck size={32} />
 </div>
 </div>
 </div>

 <form onSubmit={handleSubmit} className="flex flex-col gap-6">


 {/* Classification & Image */}
 <div className="grid gap-6 md:grid-cols-2">
 <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm flex flex-col h-full">
 <h3 className="mb-6 text-lg font-semibold text-foreground">Classification</h3>
 <div className="flex flex-col gap-6 flex-1">
 <div className="w-full flex flex-col gap-1.5">
 <label className="text-sm font-medium text-foreground">Parent Category</label>
 <div className="relative" ref={parentDropdownRef}>
 <button
 type="button"
 onClick={() => setIsParentDropdownOpen(!isParentDropdownOpen)}
 className="w-full flex items-center justify-between bg-surface border border-border rounded-xl px-3 h-11 text-sm text-foreground hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
 >
 <span className={form.parentId ? "text-foreground truncate" : "text-muted truncate"}>
 {form.parentId 
 ? parents.find(p => p.id === form.parentId)?.name || form.parentId
 : "Select Parent Module"}
 </span>
 <ChevronDown size={16} className={`text-muted transition-transform duration-200 ${isParentDropdownOpen ? "rotate-180" : ""}`} />
 </button>

 {isParentDropdownOpen && (
 <div className="absolute z-100 top-full mt-2 w-full bg-surface border border-border rounded-xl shadow-lg overflow-hidden flex flex-col max-h-72">
 
 <div className="overflow-y-auto scrollbar-thin p-1">
 
 {parents
 .map(p => {
 const isSelected = form.parentId === p.id;
 return (
 <button
 key={p.id}
 type="button"
 onClick={() => {
 update("parentId")({ target: { value: p.id } });
 setIsParentDropdownOpen(false);
 }}
 className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors ${isSelected ? "bg-primary/10 text-primary font-medium" : "hover:bg-surface-hover text-foreground"}`}
 >
 <span className="text-sm truncate">{p.name}</span>
 {isSelected && <Check size={16} className="shrink-0" />}
 </button>
 );
 })}
 </div>
 </div>
 )}
 </div>
 </div>
 
 <StatusSelect
 id="category-type"
 label={<RequiredLabel text="Type" />}
 value={form.type}
 options={["Product", "Service", "Food"]}
 onChange={update("type")}
 required
 />
 
 <StatusSelect
 id="category-scope"
 label={<RequiredLabel text="Scope" />}
 value={form.scope}
 options={["Global", "Restaurant Specific"]}
 onChange={update("scope")}
 required
 />
 
 <StatusSelect
 id="category-status"
 label={<RequiredLabel text="Status" />}
 value={form.status}
 options={statusOptions}
 onChange={update("status")}
 required
 />
 </div>
 </div>

 {/* Image Upload UI */}
 <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm flex flex-col h-full">
 <h3 className="mb-6 text-lg font-semibold text-foreground">Category Image</h3>
 
 <input 
 type="file" 
 ref={fileInputRef} 
 onChange={handleImageChange} 
 accept="image/png, image/jpeg, image/svg+xml" 
 className="hidden" 
 />
 
 <div className="flex-1 flex flex-col items-center justify-center">
 {form.image ? (
 <div className="relative flex h-full w-full min-h-50 flex-col items-center justify-center rounded-xl border border-border bg-background overflow-hidden group">
 <img src={form.image} alt="Preview" className="h-full w-full object-cover" />
 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
 <button 
 type="button" 
 onClick={() => setForm({...form, image: null})} 
 className="px-4 py-2 bg-danger text-white rounded-lg text-sm font-medium hover:bg-danger-hover transition-colors shadow-lg"
 >
 Remove Image
 </button>
 </div>
 </div>
 ) : (
 <div 
 onClick={() => fileInputRef.current?.click()}
 className="group relative flex h-full min-h-50 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background transition-colors hover:border-primary hover:bg-primary/5"
 >
 <div className="rounded-full bg-primary/10 p-3 text-primary transition-transform group-hover:scale-110">
 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
 </div>
 <span className="mt-3 text-sm font-medium text-foreground">Click to upload</span>
 <span className="mt-1 text-xs text-muted">SVG, PNG, or JPG (max. 800x400px)</span>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* General Info Card */}
 <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
 <h3 className="mb-6 text-lg font-semibold text-foreground">General Information</h3>
 <div className="grid gap-6">
 
 <div className="grid gap-6 sm:grid-cols-2">
 {field("category-name", "Category Name", "name", "text", "e.g. Fresh Produce")}
 
 {/* Auto-generated Slug (UI addition) */}
 <div className="w-full flex flex-col gap-1.5">
 <label className="text-sm font-medium text-foreground">Category Slug</label>
 <div className="flex items-center px-3 h-10 bg-background border border-border rounded-lg text-sm text-muted">
 {form.name ? form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : "auto-generated"}
 </div>
 </div>
 </div>

 <div className="w-full flex flex-col gap-1.5">
 <label className="text-sm font-medium text-foreground">Description</label>
 <textarea
 id="category-description"
 placeholder="Briefly describe this category..."
 value={form.description}
 onChange={update("description")}
 className="w-full min-h-25 p-3 bg-surface border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-500 transition-all resize-y"
 />
 </div>
 </div>
 </div>

 {/* Error Message */}
 {error && (
 <div className="rounded-xl border border-danger/30 bg-danger/5 p-4 text-center text-sm font-medium text-danger shadow-sm">
 {error}
 </div>
 )}

 {/* Read-Only Related Data (only shown on Edit) */}
 {isEditing && (
 <div className="grid gap-6">

 <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
 <h3 className="mb-4 text-base font-semibold text-foreground">Category Items</h3>
 {menuItems.length > 0 ? (
 <ul className="space-y-2">
 {menuItems.map(item => (
 <li key={item.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background">
 <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
 {item.image ? <img src={item.image} alt="" className="h-full w-full object-cover rounded-lg" /> : <ShieldCheck size={14} />}
 </div>
 <div className="flex flex-col">
 <span className="text-sm font-medium text-foreground">{item.name}</span>
 <span className="text-xs text-muted">${Number(item.price).toFixed(2)}</span>
 </div>
 <Badge variant={item.status === 'Available' ? 'success' : 'danger'} className="ml-auto text-[10px] px-1.5 py-0 h-4">
 {item.status}
 </Badge>
 </li>
 ))}
 </ul>
 ) : (
 <p className="text-sm text-muted italic">No menu items linked to this category.</p>
 )}
 </div>
 </div>
 )}
{/* Action Buttons */}
 <div className="flex items-center justify-end gap-3 pt-2 pb-4">
 <Button
 type="button"
 variant="ghost"
 onClick={() => navigate("/categories")}
 className="px-8 h-11"
 disabled={loading}
 >
 Cancel
 </Button>
 <Button type="submit" variant="primary" className="gap-2 shadow-sm px-8 h-11" disabled={loading}>
 {loading ? "Saving..." : isEditing ? "Save Changes" : "Save Category"}
 </Button>
 </div>

 </form>

  </div>

 </section>
 );
}

export default CategoriesAdd;
