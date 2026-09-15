import { useState } from "react";
import { ArrowLeft, CloudUpload, Eye, EyeOff, ShieldCheck, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";

const types = ["Select user type", "Customer", "Business", "Delivery Partner", "Merchant"];
const roles = ["Select role", "User", "Manager", "Admin"];

function AddUser() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", mobile: "", type: types[0], role: roles[0], password: "", confirm: "" });
  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  const field = (id, label, key, type = "text", placeholder = "") => <Input id={id} label={label} type={type} value={form[key]} onChange={update(key)} placeholder={placeholder} required />;
  return <section className="min-h-full bg-background p-4 sm:p-6"><div className="space-y-4">
    <header className="flex items-center gap-3 border-b border-border pb-4"><button type="button" onClick={() => navigate("/users")} className="text-muted hover:text-primary" aria-label="Back to users"><ArrowLeft size={18} /></button><div><p className="text-xs text-muted">Dashboard &gt; Users &gt; Add User</p><h1 className="mt-1 text-2xl font-semibold text-foreground">Add User</h1></div></header>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,2.2fr)_minmax(260px,0.8fr)]"><form onSubmit={(event) => { event.preventDefault(); navigate("/users"); }} className="rounded-xl border border-border bg-surface shadow-sm"><div className="border-b border-border p-4"><h2 className="flex items-center gap-2 text-sm font-semibold text-foreground"><UserRound size={16} className="text-primary" />User Information</h2><div className="mt-4 grid gap-4 md:grid-cols-2">{field("full-name", "Full Name", "name", "text", "Enter full name")}{field("email", "Email Address", "email", "email", "Enter email address")}{field("mobile", "Mobile Number", "mobile", "tel", "Enter mobile number")}<Select id="user-type" label="User Type" value={form.type} onChange={update("type")} required>{types.map((item) => <option key={item}>{item}</option>)}</Select><Select id="user-role" label="Role" value={form.role} onChange={update("role")} required>{roles.map((item) => <option key={item}>{item}</option>)}</Select><div><label className="mb-1.5 block text-sm font-medium text-foreground">Status</label><Badge variant="success" className="h-10 px-4">Active</Badge></div></div></div><div className="p-4"><h2 className="text-sm font-semibold text-foreground">Password</h2><div className="mt-4 grid gap-4 md:grid-cols-2"><div className="relative">{field("password", "Password", "password", showPassword ? "text" : "password", "Enter password")}<button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-muted" aria-label="Toggle password">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div><div className="relative">{field("confirm-password", "Confirm Password", "confirm", showConfirm ? "text" : "password", "Confirm password")}<button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-9 text-muted" aria-label="Toggle confirm password">{showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div></div><div className="flex justify-end gap-3 border-t border-border p-4"><Button variant="secondary" type="button" onClick={() => navigate("/users")}>Cancel</Button><Button type="submit">Create User</Button></div></form>
      <aside className="space-y-4"><div className="rounded-xl border border-border bg-surface p-4 shadow-sm"><h2 className="text-sm font-semibold text-foreground">Profile Image</h2><div className="mt-3 flex h-36 flex-col items-center justify-center rounded-lg border border-dashed border-primary/40 bg-primary-light text-center"><CloudUpload size={24} className="text-primary" /><p className="mt-2 text-xs font-medium text-foreground">Upload Image</p><p className="text-[10px] text-muted">JPG, PNG or WEBP (Max 2MB)</p></div></div><div className="rounded-xl border border-border bg-surface p-4 shadow-sm"><h2 className="text-sm font-semibold text-foreground">User Type & Role Guide</h2>{[["Customer", "Normal users who place orders and use services."], ["Delivery Partner", "Delivery partners who accept and deliver orders."], ["Admin", "System administrators who access the admin panel."]].map(([title, text]) => <div key={title} className="mt-3 rounded-lg bg-background p-3"><p className="flex items-center gap-2 text-xs font-semibold text-foreground"><ShieldCheck size={14} className="text-primary" />{title}</p><p className="mt-1 text-[10px] text-muted">{text}</p></div>)}</div></aside></div>
  </div></section>;
}

export default AddUser;
