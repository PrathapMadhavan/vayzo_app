import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
 Printer,
 ChevronDown,
 User,
 MapPin,
 Bike,
 CheckCircle,
 Clock,
 Store,
 Phone,
 CreditCard,
 FileText,
 ArrowLeft
} from "lucide-react";

import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Select from "../components/ui/Select";
import Table from "../components/ui/Table";
import { getOrderById, updateOrder, updateOrderStatus } from "../api/ordersApi";
import { getRestaurantById } from "../api/restaurantsApi";
import {
 getDeliveryPartners,
} from "../api/deliveryPartnersApi";

const STATUS_MAP = {
 requested: "warning",
 searching_partner: "info",
 partner_assigned: "info",
 accepted: "info",
 going_to_pickup: "info",
 arrived_pickup: "info",
 purchasing: "warning",
 picked_up: "info",
 going_to_customer: "info",
 arrived_customer: "info",
 delivered: "success",
 completed: "success",
 cancelled: "danger",
 failed: "danger",
};

const formatStatus = (status = "") => status.replaceAll("_", " ");

const toTitleCase = (str) => {
 if (!str) return "";
 return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const formatAmount = (amount) =>
 new Intl.NumberFormat("en-IN", {
 style: "currency",
 currency: "INR",
 }).format(Number(amount || 0));

export default function OrderDetails() {
 const navigate = useNavigate();
 const { orderId } = useParams();

 const [order, setOrder] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
 const [partners, setPartners] = useState([]);
 const [selectedPartner, setSelectedPartner] = useState("");
 const [assignLoading, setAssignLoading] = useState(false);
 const [restaurantDetails, setRestaurantDetails] = useState(null);

 const fetchOrder = useCallback(async () => {
 try {
 setLoading(true);
 setError("");

 const orderData = await getOrderById(orderId);
 
 // Map assignments to assignment
 if (orderData.assignments && orderData.assignments.length > 0) {
 orderData.assignment = orderData.assignments[0];
 }
 
 setOrder(orderData);
 const partnerId = orderData.assignment?.partner_id;
 setSelectedPartner(partnerId || "");

 if (orderData.restaurant_id) {
 try {
 const rest = await getRestaurantById(orderData.restaurant_id);
 setRestaurantDetails(rest);
 } catch (e) {
 console.error("Failed to load restaurant details", e);
 }
 }

 try {
 const partnersData = await getDeliveryPartners();
 setPartners(partnersData);
 } catch (err) {
 console.error("Failed to load partners", err);
 }
 } catch (err) {
 setError(err.message || "Something went wrong");
 } finally {
 setLoading(false);
 }
 }, [orderId]);

 useEffect(() => {
 fetchOrder();
 }, [fetchOrder]);

 const handleAssignPartner = async () => {
 if (!selectedPartner) return;
 try {
 setAssignLoading(true);
 if (
 order.status === "requested" ||
 !order.status ||
 order.status === "PENDING"
 ) {
 await updateOrderStatus(order.id, {
 status: "searching_partner",
 });
 }
 await updateOrderStatus(order.id, {
 partner_id: selectedPartner,
 status: "partner_assigned",
 });
 setOrder((prev) => ({
 ...prev,
 assignment: {
 partner_id: selectedPartner,
 assignment_status: "active",
 },
 status: "partner_assigned",
 }));
 alert("Partner assigned successfully!");
 } catch (err) {
 alert("Failed to assign partner");
 } finally {
 setAssignLoading(false);
 }
 };

 const handleCancelOrder = async () => {
 if (!window.confirm("Are you sure you want to cancel this order?")) return;
 try {
 await updateOrderStatus(order.id, { status: "cancelled" });
 setOrder(prev => ({ ...prev, status: "cancelled" }));
 alert("Order cancelled successfully!");
 } catch (err) {
 alert("Failed to cancel order");
 }
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center min-h-125">
 <div className="flex flex-col items-center gap-3">
 <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
 <p className="text-sm text-muted font-medium">Loading order details...</p>
 </div>
 </div>
 );
 }

 if (error || !order) {
 return (
 <div className="flex flex-col items-center justify-center min-h-125 p-6 text-center">
 <div className="bg-danger/10 text-danger p-4 rounded-full mb-4">
 <CheckCircle size={32} />
 </div>
 <h2 className="text-xl font-bold text-foreground mb-2">Order Not Found</h2>
 <p className="text-sm text-muted mb-6 max-w-sm">
 {error || "We couldn't locate the order details. It may have been deleted or doesn't exist."}
 </p>
 <Button variant="primary" onClick={() => navigate("/orders")}>
 Return to Orders
 </Button>
 </div>
 );
 }

 const orderStatus = order.status || "PENDING";
 const dateFormatted = order.created_at
 ? new Date(order.created_at).toLocaleDateString("en-GB", {
 day: "2-digit",
 month: "short",
 year: "numeric",
 })
 : "Unavailable";
 const timeFormatted = order.created_at
 ? new Date(order.created_at).toLocaleTimeString("en-US", {
 hour: "2-digit",
 minute: "2-digit",
 })
 : "Unavailable";

 const getTimelineColor = (status) => {
 const s = status?.toLowerCase() || '';
 if (['requested', 'pending'].includes(s)) return 'bg-info ring-info/30';
 if (['restaurant_accepted', 'preparing'].includes(s)) return 'bg-warning ring-warning/30';
 if (['food_ready'].includes(s)) return 'bg-orange-500 ring-orange-500/30';
 if (['searching_partner', 'partner_assigned'].includes(s)) return 'bg-purple-500 ring-purple-500/30';
 if (['out_for_delivery', 'picked_up'].includes(s)) return 'bg-blue-500 ring-blue-500/30';
 if (['delivered', 'completed'].includes(s)) return 'bg-success ring-success/30';
 if (['cancelled', 'rejected'].includes(s)) return 'bg-danger ring-danger/30';
 return 'bg-primary ring-primary/30';
 };

 return (
 <>
 <section className="min-h-full bg-background/50 pb-20 print:hidden">
 {/* Top breadcrumb & actions */}
 <div className="px-6 pt-5 pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 {/* Breadcrumb */}
 <div className="flex items-center justify-between w-full sm:w-auto">
 <button onClick={() => navigate('/orders')} className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors font-medium">
 <ArrowLeft size={16} /> Back to Orders
 </button>
 </div>

 {/* Action buttons */}
 <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
 <Button
 variant="outline"
 size="sm"
 className="flex items-center justify-center gap-1.5 text-xs sm:text-sm bg-surface font-semibold shadow-sm"
 onClick={() => window.print()}
 >
 <Printer size={14} /> 
 <span className="hidden sm:inline">Print Invoice</span>
 <span className="sm:hidden">Print</span>
 </Button>
 <Button
 variant="danger"
 size="sm"
 className="flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md transition-shadow"
 onClick={handleCancelOrder}
 disabled={["cancelled", "completed", "delivered", "failed"].includes(order?.status?.toLowerCase())}
 >
 <span className="hidden sm:inline">Cancel Order</span>
 <span className="sm:hidden">Cancel</span>
 </Button>
 </div>
 </div>

 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
 {/* Header Section */}
 <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8 bg-surface p-6 rounded-2xl shadow-sm border border-border">
 <div className="flex flex-col gap-2 w-full">
 <div className="flex items-center justify-between w-full flex-wrap gap-4">
 <div className="flex items-center gap-3 flex-wrap">
 <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
 Order #{order.id}
 </h1>
 <Badge
 variant={STATUS_MAP[orderStatus] || "default"}
 className="px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider"
 >
 {toTitleCase(formatStatus(orderStatus))}
 </Badge>
 </div>
 </div>
 <div className="flex items-center gap-4 text-sm font-medium text-muted mt-1">
 <span className="flex items-center gap-1.5"><Clock size={16} className="text-primary/70" /> {dateFormatted}, {timeFormatted}</span>
 <span className="hidden sm:inline text-border">|</span>
 <span className="flex items-center gap-1.5"><CreditCard size={16} className="text-primary/70" /> Cash on Delivery</span>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-6 lg:gap-8">
 {/* Main Content Column */}
 <div className="flex flex-col gap-6 lg:gap-8">
 
 {/* Info Cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* Customer Info */}
 <div 
 className="bg-surface rounded-2xl p-6 shadow-sm border border-border flex flex-col h-full relative overflow-hidden group hover:border-primary/50 transition-colors cursor-pointer"
 onClick={() => order.customer_id && navigate(`/customers/${order.customer_id}`)}
 >
 <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
 <div className="flex items-center gap-3 mb-5 relative z-10">
 <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
 <User size={18} />
 </div>
 <h3 className="font-bold text-foreground text-base">Customer Details</h3>
 </div>
 <div className="flex flex-col gap-3 relative z-10">
 <p className="font-bold text-foreground text-base">{order.customer?.name || "Unavailable"}</p>
 <div className="flex items-center gap-2 text-sm text-muted font-medium">
 <Phone size={16} className="text-muted/70" /> {order.customer?.phone || order.customer?.mobileNumber || order.customer?.mobile || "Unavailable"}
 </div>
 <div className="flex items-start gap-2 text-sm text-muted font-medium mt-1">
 <MapPin size={16} className="text-muted/70 shrink-0 mt-0.5" /> 
 <span className="leading-relaxed">
 {order.dropoff_address_snapshot || <span className="italic">Location not available</span>}
 </span>
 </div>
 </div>
 </div>

 {/* Restaurant Info */}
 <div 
 className="bg-surface rounded-2xl p-6 shadow-sm border border-border flex flex-col h-full relative overflow-hidden group hover:border-primary/50 transition-colors cursor-pointer"
 onClick={() => order.restaurant_id && navigate(`/restaurants/${order.restaurant_id}`)}
 >
 <div className="absolute top-0 right-0 w-24 h-24 bg-warning/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
 <div className="flex items-center gap-3 mb-5 relative z-10">
 <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
 <Store size={18} />
 </div>
 <h3 className="font-bold text-foreground text-base">Restaurant Details</h3>
 </div>
 <div className="flex flex-col gap-3 relative z-10">
 <p className="font-bold text-foreground text-base">{restaurantDetails?.name || order.restaurant?.name || "Unavailable"}</p>
 <div className="flex flex-col gap-1 mt-1">
 <div className="flex items-center gap-2 text-sm text-muted font-medium">
 <Phone size={16} className="text-muted/70" /> {restaurantDetails?.phone || restaurantDetails?.mobileNumber || "Unavailable"}
 </div>
 <div className="flex items-start gap-2 text-sm text-muted font-medium">
 <MapPin size={16} className="text-muted/70 shrink-0 mt-0.5" /> 
 <span className="leading-relaxed">
 {restaurantDetails?.address || order.pickup_address_snapshot || <span className="italic">Location not available</span>}
 </span>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Order Items */}
 <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
 <div className="p-6 border-b border-border bg-background/30 flex items-center gap-3">
 <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center text-info">
 <FileText size={16} />
 </div>
 <h3 className="font-bold text-foreground text-base">Order Items</h3>
 </div>
 
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-surface text-muted text-xs uppercase tracking-wider font-bold border-b border-border">
 <th className="p-4 pl-6 font-semibold">Item Details</th>
 <th className="p-4 font-semibold text-right">Price</th>
 <th className="p-4 font-semibold text-center">Qty</th>
 <th className="p-4 pr-6 font-semibold text-right">Total</th>
 </tr>
 </thead>
 <tbody>
 {order.items?.length > 0 ? (
 order.items.map((item, idx) => (
 <tr key={idx} className="border-b border-border/50 hover:bg-background/50 transition-colors">
 <td className="p-4 pl-6">
 <div className="flex items-center gap-4">
 <div className="h-12 w-12 rounded-xl bg-background border border-border overflow-hidden flex items-center justify-center shrink-0">
 {item.image ? (
 <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
 ) : (
 <span className="text-muted font-bold">{item.name?.charAt(0)}</span>
 )}
 </div>
 <div className="flex flex-col">
 <span className="font-bold text-foreground">{item.name}</span>
 <span className="text-xs text-muted font-medium mt-0.5">{item.variant || "Regular"}</span>
 </div>
 </div>
 </td>
 <td className="p-4 text-right text-muted font-semibold">{formatAmount(item.price)}</td>
 <td className="p-4 text-center">
 <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-background border border-border font-bold text-foreground">
 {item.quantity}
 </span>
 </td>
 <td className="p-4 pr-6 text-right font-bold text-foreground">{formatAmount(item.price * item.quantity)}</td>
 </tr>
 ))
 ) : (
 <tr>
 <td colSpan={4} className="p-8 text-center text-muted font-medium">No items found</td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 
 <div className="p-6 bg-background/30 flex justify-end">
 <div className="w-full sm:w-1/2 lg:w-1/3 flex flex-col gap-3 text-sm font-medium">
 <div className="flex justify-between text-muted">
 <span>Subtotal</span>
 <span className="text-foreground">{formatAmount(order.total_estimated_amount)}</span>
 </div>
 <div className="flex justify-between text-muted">
 <span>Delivery Fee</span>
 <span className="text-foreground">₹0.00</span>
 </div>
 <div className="flex justify-between text-muted">
 <span>Taxes</span>
 <span className="text-foreground">₹0.00</span>
 </div>
 <div className="h-px bg-border my-1"></div>
 <div className="flex justify-between items-center">
 <span className="font-bold text-foreground text-sm">Total</span>
 <span className="font-black text-primary text-lg">{formatAmount(order.total_estimated_amount || order.total_amount)}</span>
 </div>
 </div>
 </div>
 </div>

 </div>

 {/* Sidebar Column */}
 <div className="flex flex-col gap-6 lg:gap-8">
 
 {/* Delivery Partner Assignment */}
 <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden flex flex-col">
 <div className="p-5 border-b border-border flex items-center gap-3">
 <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
 <Bike size={16} />
 </div>
 <h3 className="font-bold text-foreground text-base">Delivery Partner</h3>
 </div>
 
 {order.assignment?.partner_id || ["completed", "delivered", "cancelled"].includes(order.status?.toLowerCase()) ? (
 <div className="p-5">
 {order.assignment?.partner_id ? (
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
 {partners.find(p => p.id === order.assignment.partner_id)?.name?.charAt(0) || "P"}
 </div>
 <div>
 <p className="font-bold text-foreground">{partners.find(p => p.id === order.assignment.partner_id)?.name || order.assignment.partner_id}</p>
 <p className="text-xs text-muted font-medium mt-0.5">Assigned Partner</p>
 </div>
 </div>
 ) : (
 <p className="text-sm text-muted">No partner assigned.</p>
 )}
 </div>
 ) : (
 <div className="p-5 flex flex-col gap-4">
 <p className="text-xs font-bold text-muted uppercase tracking-wider">Select Partner to Assign</p>
 <div className="flex flex-col gap-3 max-h-75 overflow-y-auto pr-2 custom-scrollbar">
 {partners.map((dp) => (
 <label
 key={dp.id}
 className={`relative flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
 selectedPartner === dp.id 
 ? "border-primary bg-primary/5 shadow-sm" 
 : "border-border hover:border-primary/40 hover:bg-background"
 }`}
 >
 <input
 type="radio"
 name="partner_select"
 className="sr-only"
 checked={selectedPartner === dp.id}
 onChange={() => setSelectedPartner(dp.id)}
 />
 <div className="flex items-center gap-3 flex-1 min-w-0">
 <div className="w-10 h-10 rounded-full bg-background border border-border overflow-hidden shrink-0">
 {dp.profileImage ? (
 <img src={dp.profileImage} alt="" className="w-full h-full object-cover" />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-muted font-bold text-sm bg-muted/10">{dp.name?.charAt(0)}</div>
 )}
 </div>
 <div className="flex flex-col min-w-0">
 <span className="font-bold text-foreground text-sm truncate">{dp.name}</span>
 <span className="text-[10px] font-semibold text-muted uppercase tracking-wide flex items-center gap-1.5 mt-0.5">
 <span className={`w-1.5 h-1.5 rounded-full ${dp.status === 'Active' ? 'bg-success' : 'bg-warning'}`}></span>
 {dp.status}
 </span>
 </div>
 </div>
 <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 transition-colors ${
 selectedPartner === dp.id ? "border-primary" : "border-muted/30"
 }`}>
 {selectedPartner === dp.id && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
 </div>
 </label>
 ))}
 </div>
 <Button
 className="w-full mt-2 py-3 rounded-xl font-bold text-sm shadow-md transition-transform active:scale-[0.98]"
 onClick={handleAssignPartner}
 disabled={assignLoading || !selectedPartner}
 >
 {assignLoading ? "Assigning..." : "Assign Selected Partner"}
 </Button>
 </div>
 )}
 </div>

 {/* Order Timeline */}
 <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
 <div className="p-5 border-b border-border flex items-center gap-3">
 <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success">
 <Clock size={16} />
 </div>
 <h3 className="font-bold text-foreground text-base">Order Timeline</h3>
 </div>
 
 <div className="p-6">
 <div className="relative pl-6 flex flex-col gap-6">
 {/* Vertical Line */}
 <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-linear-to-b from-info via-primary to-success rounded-full opacity-50"></div>
 
 {order.status_history && order.status_history.length > 0 ? (
 order.status_history.map((sh, idx) => (
 <div key={idx} className="relative z-10">
 <div className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-[3px] border-surface ring-2 ${getTimelineColor(sh.status)}`}></div>
 <div className="bg-background border border-border rounded-xl p-3 shadow-sm ml-2">
 <h4 className="text-sm font-bold text-foreground">
 {toTitleCase(formatStatus(sh.status))}
 </h4>
 <p className="text-[11px] font-medium text-muted mt-1 flex items-center gap-1.5">
 <Clock size={12} />
 {new Date(sh.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })},{" "}
 {new Date(sh.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
 </p>
 {sh.reason && (
 <p className="text-xs font-medium text-warning bg-warning/10 p-2 rounded-lg mt-2 inline-block">
 {sh.reason}
 </p>
 )}
 </div>
 </div>
 ))
 ) : (
 <p className="text-sm text-muted font-medium text-center py-4 relative z-10 bg-surface">No timeline events recorded yet.</p>
 )}
 </div>
 </div>
 </div>

 </div>
 </div>
 </div>
 </section>

 {/* Hidden Print Invoice Section */}
 <div className="hidden print:block bg-white text-black font-sans p-8 m-0! min-h-screen">
 <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-6">
 <div>
 <h1 className="text-4xl font-black uppercase mb-1">INVOICE</h1>
 <p className="text-sm font-semibold">Order ID: {order.id}</p>
 <p className="text-sm">Date: {dateFormatted} {timeFormatted}</p>
 </div>
 <div className="text-right">
 <h2 className="text-2xl font-bold">{order.restaurant?.name || "Vayzo Restaurant"}</h2>
 <p className="text-sm max-w-62.5 ml-auto mt-1 leading-relaxed">
 {order.restaurant?.address || "Restaurant Address"}
 </p>
 </div>
 </div>
 
 <div className="grid grid-cols-2 gap-12 mb-8">
 <div>
 <h3 className="font-bold border-b border-gray-300 pb-2 mb-3 uppercase text-xs text-gray-500 tracking-wider">Bill To</h3>
 <p className="font-bold text-lg">{order.customer?.name}</p>
 <p className="text-sm mt-1">{order.customer?.phone || order.customer?.mobileNumber}</p>
 <p className="text-sm mt-1 leading-relaxed">{order.dropoff_address_snapshot}</p>
 </div>
 <div>
 <h3 className="font-bold border-b border-gray-300 pb-2 mb-3 uppercase text-xs text-gray-500 tracking-wider">Delivery Details</h3>
 <p className="text-sm"><span className="font-bold">Partner:</span> {order.assignment?.partner_id ? partners.find(p => p.id === order.assignment.partner_id)?.name || order.assignment.partner_id : "Unassigned"}</p>
 <p className="text-sm mt-1"><span className="font-bold">Status:</span> {order.status?.toUpperCase()}</p>
 </div>
 </div>

 <table className="w-full text-left mb-8 border-collapse">
 <thead>
 <tr className="border-b-2 border-black">
 <th className="py-3 font-bold text-sm uppercase tracking-wide">Item Description</th>
 <th className="py-3 font-bold text-sm text-center uppercase tracking-wide">Qty</th>
 <th className="py-3 font-bold text-sm text-right uppercase tracking-wide">Price</th>
 <th className="py-3 font-bold text-sm text-right uppercase tracking-wide">Total</th>
 </tr>
 </thead>
 <tbody>
 {order.items?.map((item, idx) => (
 <tr key={idx} className="border-b border-gray-200">
 <td className="py-4">
 <p className="font-bold text-base">{item.name}</p>
 {item.variant && <p className="text-xs text-gray-500 mt-0.5">{item.variant}</p>}
 </td>
 <td className="py-4 text-center text-sm font-medium">{item.quantity}</td>
 <td className="py-4 text-right text-sm">{formatAmount(item.price)}</td>
 <td className="py-4 text-right text-sm font-bold">{formatAmount(item.price * item.quantity)}</td>
 </tr>
 ))}
 </tbody>
 </table>

 <div className="flex justify-end">
 <div className="w-72">
 <div className="flex justify-between py-2 border-b border-gray-200">
 <span className="text-sm text-gray-600">Subtotal</span>
 <span className="font-semibold text-sm">{formatAmount(order.total_estimated_amount)}</span>
 </div>
 <div className="flex justify-between py-2 border-b border-gray-200">
 <span className="text-sm text-gray-600">Delivery Fee</span>
 <span className="font-semibold text-sm">₹0.00</span>
 </div>
 <div className="flex justify-between py-2 border-b-2 border-black">
 <span className="text-sm text-gray-600">Taxes</span>
 <span className="font-semibold text-sm">₹0.00</span>
 </div>
 <div className="flex justify-between py-4">
 <span className="font-black text-lg">TOTAL</span>
 <span className="font-black text-xl">{formatAmount(order.total_estimated_amount || order.total_amount)}</span>
 </div>
 </div>
 </div>
 
 <div className="mt-20 text-center text-gray-500 text-sm border-t border-gray-200 pt-6">
 <p className="font-semibold">Thank you for ordering with Vayzo!</p>
 <p className="mt-1 text-xs">For any queries, please contact support@vayzo.com</p>
 </div>
 </div>
 </>
);
}
