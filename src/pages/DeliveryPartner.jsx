import {
 Ban,
 Bike,
 CalendarDays,
 Check,
 Eye,
 FileText,
 Mail,
 MapPin,
 MessageSquare,
 Pencil,
 Phone,
 Star,
 Wallet,
 ArrowLeft,
 Search,
 User,
 Building,
 ChevronRight,
 TrendingUp,
 Package,
 Trash2,
 Camera,
 ShieldBan
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";

import { getDeliveryPartnerById, updateDeliveryPartner, deleteDeliveryPartner } from "../api/deliveryPartnersApi";
import { createActivityLog } from "../api/activityLogsApi";
import Modal from "../components/ui/Modal";
import Avatar from "../components/ui/Avatar";

const getValue = (value) => value || "--";

const InfoRow = ({ label, value }) => (
 <div className="flex flex-col sm:flex-row sm:items-start py-3 border-b border-border/40 last:border-0 gap-1 sm:gap-4">
 <span className="text-sm sm:text-[15px] text-foreground font-medium sm:min-w-37.5 shrink-0">{label}</span>
 <span className="text-[13px] sm:text-sm text-muted wrap-break-word flex-1">{getValue(value)}</span>
 </div>
);

const StatBox = ({ label, value, sub, color = 'default', className = "" }) => {
 const colorMap = {
 primary: 'text-primary',
 success: 'text-success',
 warning: 'text-warning',
 danger: 'text-danger',
 muted: 'text-muted',
 white: 'text-white',
 default: 'text-foreground'
 };
 return (
 <div className={`flex flex-col gap-1 px-3 sm:px-4 ${className} min-w-0`}>
 <p className={`text-[11px] sm:text-xs whitespace-nowrap ${color === 'white' ? 'text-white/70' : 'text-muted'}`}>{label}</p>
 <div className={`text-sm sm:text-base font-bold truncate ${colorMap[color] || colorMap.default}`}>{getValue(value)}</div>
 {sub && <p className={`text-xs ${color === 'white' ? 'text-white/50' : (colorMap[color] || colorMap.muted)}`}>{sub}</p>}
 </div>
 );
};

const EmptyState = ({ message, icon: Icon = FileText }) => (
 <div className="flex flex-col items-center justify-center p-8 text-center bg-background/50 rounded-xl border border-dashed border-border/50">
 <Icon size={24} className="text-muted/50 mb-2" />
 <p className="text-sm text-muted">{message}</p>
 </div>
);

export default function DeliveryPartner() {
 
 const { id } = useParams();
 const navigate = useNavigate();

 const [partnerData, setPartnerData] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 
 const [activeTab, setActiveTab] = useState('overview');
 
 const [messagingModalOpen, setMessagingModalOpen] = useState(false);
 const [messageText, setMessageText] = useState("");
 const [isSendingMessage, setIsSendingMessage] = useState(false);
 
 const [isBlockModalOpen, setBlockModalOpen] = useState(false);
 const [isBlocking, setIsBlocking] = useState(false);
 
 const [isDocumentModalOpen, setDocumentModalOpen] = useState(false);
 const [selectedDocumentUrl, setSelectedDocumentUrl] = useState(null);
 const [selectedDocumentName, setSelectedDocumentName] = useState("");
 const [imagePreviewModal, setImagePreviewModal] = useState(false);

 const handleImageChange = (e) => {
 const file = e.target.files?.[0];
 if (file) {
 const url = URL.createObjectURL(file);
 setPartnerData((prev) => ({ ...prev, profileImage: url, image: url }));
 }
 };

 const handleSendMessage = async () => {
 setIsSendingMessage(true);
 setTimeout(() => {
 alert("Message Sent (Simulated)");
 setIsSendingMessage(false);
 setMessagingModalOpen(false);
 setMessageText("");
 }, 800);
 };

 const handleDelete = async () => {
 if (window.confirm("Are you sure you want to delete this delivery partner? This action cannot be undone.")) {
 try {
 await deleteDeliveryPartner(id);
 navigate('/delivery');
 } catch (err) {
 alert("Failed to delete delivery partner");
 }
 }
 };

 const handleStatusToggle = async () => {
 if (!partnerData) return;
 const newStatus = partnerData.status === "Active" ? "Inactive" : "Active";
 try {
 await updateDeliveryPartner(id, { status: newStatus });
 setPartnerData({ ...partnerData, status: newStatus });
 } catch (err) {
 console.error("Failed to update status", err);
 }
 };

 const handleBlockToggle = async () => {
 if (!partnerData) return;
 const newStatus = partnerData.status === "Blocked" ? "Active" : "Blocked";
 setIsBlocking(true);
 try {
 await updateDeliveryPartner(id, { status: newStatus });
 setPartnerData({ ...partnerData, status: newStatus });
 setBlockModalOpen(false);
 } catch (err) {
 console.error("Failed to update block status", err);
 } finally {
 setIsBlocking(false);
 }
 };

 const handleOnlineStatusToggle = async () => {
 if (!partnerData) return;
 const newOnlineStatus = partner?.onlineStatus?.toLowerCase() === 'online' ? "Offline" : "Online";
 try {
 await updateDeliveryPartner(id, { onlineStatus: newOnlineStatus });
 setPartnerData({
 ...partnerData,
 partner: {
 ...partnerData.partner,
 onlineStatus: newOnlineStatus
 }
 });
 } catch (err) {
 console.error("Failed to update online status", err);
 }
 };

 

 const viewDocument = (name, url) => {

 if (!url) {
 alert("Document not uploaded yet.");
 return;
 }
 setSelectedDocumentName(name);
 setSelectedDocumentUrl(url);
 setDocumentModalOpen(true);
 };

 const loadPartner = async () => {
 try {
 setLoading(true);
 setError(null);
 const data = await getDeliveryPartnerById(id);
 setPartnerData(data);
 } catch (err) {
 setError(err.message || "Failed to load delivery partner");
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 if (id) {
 loadPartner();
 }
 }, [id]);

 if (loading) {
 return (
 <section className="flex min-h-full items-center justify-center bg-background p-6">
 <div className="flex flex-col items-center gap-3">
 <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
 <p className="text-sm text-muted">Loading partner details...</p>
 </div>
 </section>
 );
 }

 if (error || !partnerData) {
 return (
 <section className="flex min-h-full items-center justify-center bg-background p-6">
 <div className="rounded-xl border border-border bg-surface p-6 text-center shadow-sm">
 <h1 className="text-lg font-semibold text-foreground">
 Delivery Partner Not Found
 </h1>
 <p className="mt-2 text-sm text-muted">
 {error || "The requested delivery partner could not be found."}
 </p>
 <Button className="mt-4" onClick={() => navigate("/delivery")}>Back to List</Button>
 </div>
 </section>
 );
 }

 const partner = {
 ...partnerData?.partner,
 id: id, // use route param as partner ID for display
 // Flatten personalDetails
 panNumber: partnerData?.personalDetails?.panNumber,
 aadhaarNumber: partnerData?.personalDetails?.aadhaarNumber,
 // Flatten vehicle
 vehicleType: partnerData?.vehicle?.vehicleType,
 vehicleName: partnerData?.vehicle?.vehicleName,
 vehicleNumber: partnerData?.vehicle?.vehicleNumber,
 rcNumber: partnerData?.vehicle?.rcNumber,
 insuranceProvider: partnerData?.vehicle?.insuranceProvider,
 insuranceNumber: partnerData?.vehicle?.insuranceNumber,
 insuranceValidTill: partnerData?.vehicle?.validTill,
 // Flatten bankAccount
 bankName: partnerData?.bankAccount?.bankName,
 accountNumber: partnerData?.bankAccount?.accountNumberMasked,
 ifscCode: partnerData?.bankAccount?.ifscCode,
 accountHolderName: partnerData?.bankAccount?.accountHolderName,
 // Flatten documents (for document URLs)
 ...(Array.isArray(partnerData?.documents) ? partnerData.documents.reduce((acc, doc) => {
 if (doc.type === 'AADHAAR') acc.aadhaarDocumentUrl = doc.url;
 if (doc.type === 'PAN') acc.panDocumentUrl = doc.url;
 if (doc.type === 'RC') acc.rcDocumentUrl = doc.url;
 if (doc.type === 'INSURANCE') acc.insuranceDocumentUrl = doc.url;
 return acc;
 }, {}) : {}),
 };
 const { activity } = partnerData;


 const isOnline = partner?.onlineStatus?.toLowerCase() === 'online';

 const tabs = [
 { id: 'overview', label: 'Overview' },
 { id: 'documents', label: 'Documents' },
 { id: 'earnings', label: 'Earnings' },
 { id: 'trips', label: 'Trips' },
 { id: 'payouts', label: 'Payouts' },
 { id: 'complaints', label: 'Ratings & Complaints' },
 { id: 'activity', label: 'Activity Logs' },
 ];







 return (
 <div className="min-h-full bg-background pb-10">
 {/* ── Top breadcrumb & actions ── */}
 <div className="px-6 pt-5 pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 {/* Breadcrumb */}
 <div className="flex items-center justify-between w-full sm:w-auto">
 <button onClick={() => navigate('/delivery')} className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors font-medium">
 <ArrowLeft size={16} /> Back to List
 </button>
 </div>

 {/* Action buttons */}
 <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
 <Button variant={partner?.status === "Blocked" ? "success" : "danger"} size="sm" onClick={() => setBlockModalOpen(true)} className="flex items-center justify-center gap-1.5 text-xs sm:text-sm shadow-sm hover:shadow-md transition-shadow">
 <ShieldBan size={14} /> 
 <span className="hidden sm:inline">{partner?.status === "Blocked" ? "Unblock Partner" : "Block Partner"}</span>
 <span className="sm:hidden">{partner?.status === "Blocked" ? "Unblock" : "Block"}</span>
 </Button>

 <Button variant="secondary" size="sm" onClick={() => setMessagingModalOpen(true)} className="flex items-center justify-center gap-1.5 text-xs sm:text-sm border-border bg-surface hover:bg-surface-hover text-foreground shadow-sm">
 <MessageSquare size={14} /> 
 <span className="hidden sm:inline">Send Message</span>
 <span className="sm:hidden">Message</span>
 </Button>
 
 <Button variant="primary" size="sm" onClick={() => navigate(`/delivery/edit/${id}`)} className="flex items-center justify-center gap-1.5 text-xs sm:text-sm shadow-sm">
 <Pencil size={14} /> 
 <span className="hidden sm:inline">Edit Partner</span>
 <span className="sm:hidden">Edit</span>
 </Button>
 </div>
 </div>

 {/* ── Profile Header Card ── */}
 <div className="relative mx-4 sm:mx-6 mt-4 rounded-2xl overflow-hidden shadow-lg flex flex-col bg-linear-to-r from-primary to-primary-hover">
 <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white opacity-5 blur-3xl pointer-events-none"></div>
 <div className="absolute bottom-0 left-10 -mb-10 h-48 w-48 rounded-full bg-white opacity-5 blur-3xl pointer-events-none"></div>
 {/* Top row: avatar + identity + stats */}
 <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 p-6 sm:p-8 relative z-10">
 {/* Avatar + name */}
 <div className="flex items-center gap-4 shrink-0 lg:w-87.5">
 <div className="relative shrink-0">
 <div 
 className="relative z-10 cursor-pointer hover:opacity-80 transition-opacity shrink-0 group/avatar"
 onClick={() => setImagePreviewModal(true)}
 >
 <Avatar
 src={partner?.profileImage}
 identifier={partner?.name}
 alt={partner?.name}
 className="h-24 w-24 sm:h-20 sm:w-20 text-3xl sm:text-2xl rounded-full ring-4 ring-white/20 shadow-lg"
 />
 </div>
 <div 
 onClick={handleOnlineStatusToggle}
 className="absolute -bottom-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-white/20 bg-black/20 backdrop-blur-md shadow-sm whitespace-nowrap z-20 cursor-pointer hover:opacity-80 transition-opacity"
 >
 <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-success' : 'bg-danger'}`}></span>
 <span className={`text-[10px] font-medium ${isOnline ? 'text-success' : 'text-danger'}`}>{isOnline ? 'Online' : 'Offline'}</span>
 </div>
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2 flex-wrap mb-1">
 <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight truncate">{partner?.name}</h1>
 <Badge
 onClick={handleStatusToggle}
 className={`h-5 px-1.5 text-[10px] text-white border-0 shadow-none backdrop-blur-sm cursor-pointer hover:opacity-80 transition-opacity ${
 partner?.status === "Active" ? "bg-success" : "bg-muted/40"
 }`}
 >
 {partner?.status || '--'}
 </Badge>
 </div>

 <div className="flex flex-col gap-1 mt-1">





 {partner?.mobileNumber && (
 <div className="flex items-center gap-1.5 text-[13px] text-white/70 truncate">
 <Phone size={13} className="shrink-0" /> <span className="truncate">{partner.mobileNumber}</span>
 </div>
 )}
 {partner?.email && (
 <div className="flex items-center gap-1.5 text-[13px] text-white/70 truncate">
 <Mail size={13} className="shrink-0" /> <span className="truncate">{partner.email}</span>
 </div>
 )}
 
 
 </div>
 </div>
 </div>

 {/* Vertical divider */}
 <div className="hidden lg:block h-24 w-px bg-white/20 mx-2 shrink-0 relative z-10" />

 {/* Stats row */}
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-4 gap-x-4 gap-y-6 lg:gap-y-8 w-full flex-1 pb-2 lg:pb-0 relative z-10">
 <StatBox label="Partner ID" value={partner?.id} color="white" />
 <StatBox label="Vehicle" value={partner?.vehicleType || '--'} color="white" />
 </div>
 </div>

 {/* Tabs navigation */}
 <div className="flex bg-surface overflow-x-auto [-ms-overflow-style:none] scrollbar-none relative z-10 border-t border-border/10 px-3">
 {tabs.map(tab => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`px-4 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
 activeTab === tab.id
 ? 'border-primary text-primary'
 : 'border-transparent text-muted hover:text-foreground hover:bg-muted/10'
 }`}
 >
 {tab.label}
 </button>
 ))}
 </div>
 </div>

 {/* ── Tab Content Area ── */}
 <div className="p-6 pt-5">
 
 {/* ─ Overview Tab ─ */}
 {activeTab === 'overview' && (
 <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
 {/* Personal Info */}
 <div className="bg-surface border border-border rounded-2xl overflow-hidden group hover:border-primary/50 transition-colors relative">
 <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none"></div>
 <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50 bg-background/50">
 <User size={17} className="text-primary" />
 <h3 className="font-semibold text-foreground">Personal Information</h3>
 </div>
 <div className="p-5">
 <InfoRow label="Full Name" value={partner?.name} />
 <InfoRow label="Date of Birth" value={partner?.dateOfBirth} />
 <InfoRow label="Gender" value={partner?.gender} />
 <InfoRow label="Alternate Mobile" value={partner?.alternateMobile} />
 <InfoRow label="Emergency Contact" value={partner?.emergencyContact} />

 <InfoRow label="Emergency Contact Number" value={partner?.emergencyMobile} />
 <InfoRow label="Aadhaar Number" value={partner?.aadhaarNumber} />
 <InfoRow label="PAN Number" value={partner?.panNumber} />
 </div>
 </div>

 {/* Vehicle Info */}
 <div className="bg-surface border border-border rounded-2xl overflow-hidden group hover:border-primary/50 transition-colors relative">
 <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none"></div>
 <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50 bg-background/50">
 <Bike size={17} className="text-primary" />
 <h3 className="font-semibold text-foreground">Vehicle Information</h3>
 </div>
 <div className="p-5">
 <InfoRow label="Vehicle Type" value={partner?.vehicleType} />
 <InfoRow label="Vehicle Name" value={partner?.vehicleName} />
 <InfoRow label="Vehicle Number" value={partner?.vehicleNumber} />
 <InfoRow label="RC Number" value={partner?.rcNumber} />
 <InfoRow label="Insurance Provider" value={partner?.insuranceProvider} />
 <InfoRow label="Insurance Number" value={partner?.insuranceNumber} />
 <InfoRow label="Insurance Valid Till" value={partner?.insuranceValidTill} />
 </div>
 </div>

 {/* Bank Info */}
 <div className="bg-surface border border-border rounded-2xl overflow-hidden group hover:border-primary/50 transition-colors relative lg:col-span-2 xl:col-span-1">
 <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none"></div>
 <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50 bg-background/50">
 <Building size={17} className="text-primary" />
 <h3 className="font-semibold text-foreground">Bank Information</h3>
 </div>
 <div className="p-5">
 <InfoRow label="Bank Name" value={partner?.bankName} />
 <InfoRow label="Account Number" value={partner?.accountNumber} />
 <InfoRow label="IFSC Code" value={partner?.ifscCode} />
 <InfoRow label="Account Holder Name" value={partner?.accountHolderName} />
 </div>
 </div>
 </div>
 )}

 {/* ─ Documents Tab ─ */}
 {activeTab === 'documents' && (
 <div className="bg-surface border border-border rounded-2xl overflow-hidden group hover:border-primary/50 transition-colors relative">
 <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none"></div>
 <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50 bg-background/50">
 <FileText size={17} className="text-primary" />
 <h3 className="font-semibold text-foreground">Uploaded Documents</h3>
 </div>
 <div className="p-5 flex flex-col gap-3">
 {partner?.aadhaarDocumentUrl && (
 <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-surface hover:bg-surface-hover transition-colors">
 <div className="flex items-center gap-3">
 <FileText size={18} className="text-primary" />
 <h4 className="font-semibold text-sm text-foreground">Aadhaar</h4>
 </div>
 <Button variant="secondary" size="sm" onClick={() => viewDocument('Aadhaar', partner.aadhaarDocumentUrl)}>View</Button>
 </div>
 )}
 {partner?.panDocumentUrl && (
 <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-surface hover:bg-surface-hover transition-colors">
 <div className="flex items-center gap-3">
 <FileText size={18} className="text-primary" />
 <h4 className="font-semibold text-sm text-foreground">PAN</h4>
 </div>
 <Button variant="secondary" size="sm" onClick={() => viewDocument('PAN', partner.panDocumentUrl)}>View</Button>
 </div>
 )}
 {partner?.rcDocumentUrl && (
 <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-surface hover:bg-surface-hover transition-colors">
 <div className="flex items-center gap-3">
 <FileText size={18} className="text-primary" />
 <h4 className="font-semibold text-sm text-foreground">RC Document</h4>
 </div>
 <Button variant="secondary" size="sm" onClick={() => viewDocument('RC Document', partner.rcDocumentUrl)}>View</Button>
 </div>
 )}
 {partner?.insuranceDocumentUrl && (
 <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-surface hover:bg-surface-hover transition-colors">
 <div className="flex items-center gap-3">
 <FileText size={18} className="text-primary" />
 <h4 className="font-semibold text-sm text-foreground">Insurance</h4>
 </div>
 <Button variant="secondary" size="sm" onClick={() => viewDocument('Insurance', partner.insuranceDocumentUrl)}>View</Button>
 </div>
 )}
 {(!partner?.aadhaarDocumentUrl && !partner?.panDocumentUrl && !partner?.rcDocumentUrl && !partner?.insuranceDocumentUrl) && (
 <EmptyState message="No documents available." />
 )}
 </div>
 </div>
 )}

 {/* ─ Earnings Tab ─ */}
 {activeTab === 'earnings' && (
 <div className="bg-surface border border-border rounded-2xl overflow-hidden group hover:border-primary/50 transition-colors relative">
 <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none"></div>
 <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50 bg-background/50">
 <Wallet size={17} className="text-primary" />
 <h3 className="font-semibold text-foreground">Earnings Summary</h3>
 </div>
 <div className="p-5">
 <EmptyState message="Earnings information unavailable." />





















 </div>
 </div>
 )}

 {/* ─ Payouts Tab ─ */}
 {activeTab === 'payouts' && (
 <div className="bg-surface border border-border rounded-2xl overflow-hidden group hover:border-primary/50 transition-colors relative">
 <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none"></div>
 <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50 bg-background/50">
 <Wallet size={17} className="text-primary" />
 <h3 className="font-semibold text-foreground">Payout History</h3>
 </div>
 <div className="p-5">
 <EmptyState message="Payout information unavailable." />






















 </div>
 </div>
 )}

 {/* ─ Orders Tab ─ */}
 {activeTab === 'orders' && (
 <div className="bg-surface border border-border rounded-2xl overflow-hidden group hover:border-primary/50 transition-colors relative">
 <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none"></div>
 <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50 bg-background/50">
 <Package size={17} className="text-primary" />
 <h3 className="font-semibold text-foreground">Recent Orders</h3>
 </div>
 <div className="p-5">
 <EmptyState message="Recent orders data will appear here." icon={Package} />
 </div>
 </div>
 )}

 {/* ─ Trips Tab ─ */}
 {activeTab === 'trips' && (
 <div className="bg-surface border border-border rounded-2xl overflow-hidden group hover:border-primary/50 transition-colors relative">
 <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none"></div>
 <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50 bg-background/50">
 <Bike size={17} className="text-primary" />
 <h3 className="font-semibold text-foreground">Trip History</h3>
 </div>
 <div className="p-5">
 <EmptyState message="No trips found for this partner." icon={Bike} />
 </div>
 </div>
 )}

 {/* ─ Ratings & Complaints Tab ─ */}
 {activeTab === 'complaints' && (
 <div className="bg-surface border border-border rounded-2xl overflow-hidden group hover:border-primary/50 transition-colors relative">
 <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none"></div>
 <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50 bg-background/50">
 <Star size={17} className="text-primary" />
 <h3 className="font-semibold text-foreground">Ratings & Complaints</h3>
 </div>
 <div className="p-5">
 <EmptyState message="No ratings or complaints available." icon={Star} />
 </div>
 </div>
 )}

 {/* ─ Activity Logs Tab ─ */}
 {activeTab === 'activity' && (
 <div className="bg-surface border border-border rounded-2xl overflow-hidden group hover:border-primary/50 transition-colors relative">
 <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none"></div>
 <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50 bg-background/50">
 <CalendarDays size={17} className="text-primary" />
 <h3 className="font-semibold text-foreground">Activity Logs</h3>
 </div>
 <div className="p-5">
 {activity && activity.length > 0 ? (
 <div className="space-y-4">
 {activity.map((act, idx) => (
 <div key={idx} className="flex gap-4 p-4 rounded-xl hover:bg-muted/5 transition-colors border border-border/50 bg-background/50 shadow-sm">
 <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${act.type === 'EARNING' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
 {act.type === 'EARNING' ? <Wallet size={16} /> : <FileText size={16} />}
 </div>
 <div className="flex-1 min-w-0">
 <p className="font-medium text-foreground text-sm">{act.details || act.action}</p>
 <p className="text-xs text-muted mt-1">
 {new Date(act.timestamp).toLocaleString()}
 </p>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <EmptyState message="No recent activity found." />
 )}
 </div>
 </div>
 )}

 </div>

 {/* ── Modals ── */}
 <Modal isOpen={messagingModalOpen} onClose={() => setMessagingModalOpen(false)} title="Send Message">
 <div className="space-y-4">
 <div className="flex items-center gap-3 p-3 bg-surface-hover rounded-lg border border-border">
 <Avatar src={partner?.profileImage} identifier={partner?.name} className="h-10 w-10 rounded-full shrink-0" />
 <div className="min-w-0">
 <p className="font-medium text-foreground text-sm truncate">{partner?.name}</p>
 <p className="text-xs text-muted break-all">{partner?.id} • {partner?.mobileNumber || partner?.email}</p>
 </div>
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-1.5">Message</label>
 <textarea
 className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-25"
 placeholder="e.g. Please ensure you carry your delivery bag for all future orders."
 value={messageText}
 onChange={(e) => setMessageText(e.target.value)}
 />
 </div>
 <div className="flex justify-end gap-3 mt-4">
 <Button variant="secondary" onClick={() => setMessagingModalOpen(false)}>Cancel</Button>
 <Button onClick={handleSendMessage} disabled={isSendingMessage || !messageText.trim()}>
 {isSendingMessage ? "Sending..." : "Send Message"}
 </Button>
 </div>
 </div>
 </Modal>

 

 <Modal isOpen={isDocumentModalOpen} onClose={() => setDocumentModalOpen(false)} title={`View ${selectedDocumentName}`}>
 <div className="flex flex-col items-center justify-center min-h-50 p-4">
 {!selectedDocumentUrl ? (
 <div className="text-center">
 <FileText size={40} className="mx-auto text-muted mb-3 opacity-50" />
 <p className="text-muted font-medium">No document available</p>
 <p className="text-xs text-muted/70 mt-1">This partner hasn't uploaded their {selectedDocumentName} yet.</p>
 </div>
 ) : selectedDocumentUrl.toLowerCase().endsWith('.pdf') ? (
 <iframe src={selectedDocumentUrl} className="w-full h-100 rounded border border-border" title={selectedDocumentName} />
 ) : (
 <img src={selectedDocumentUrl} alt={selectedDocumentName} className="max-w-full max-h-100 rounded object-contain" />
 )}
 </div>
 <div className="flex justify-end mt-4">
 <Button variant="secondary" onClick={() => setDocumentModalOpen(false)}>Close</Button>
 </div>
 </Modal>

 {/* ─ Block Partner Modal ─ */}
 <Modal
 isOpen={isBlockModalOpen}
 onClose={() => setBlockModalOpen(false)}
 title={partner?.status === "Blocked" ? "Unblock Partner" : "Block Partner"}
 >
 <p className="text-sm text-muted">
 {partner?.status === "Blocked" 
 ? `Are you sure you want to unblock ${partner?.name}? They will regain access to the delivery app.`
 : `Are you sure you want to block ${partner?.name}? They will no longer be able to log in or receive orders.`}
 </p>
 <div className="mt-6 flex justify-end gap-3">
 <Button variant="secondary" onClick={() => setBlockModalOpen(false)}>
 Cancel
 </Button>
 <Button
 variant={partner?.status === "Blocked" ? "success" : "danger"}
 onClick={handleBlockToggle}
 disabled={isBlocking}
 >
 {partner?.status === "Blocked" ? "Yes, Unblock" : "Yes, Block"}
 </Button>
 </div>
 </Modal>

 {/* ─ Image Preview Modal ─ */}
 <Modal
 isOpen={imagePreviewModal}
 onClose={() => setImagePreviewModal(false)}
 title="Profile Image"
 >
 <div className="flex justify-center p-4 relative group rounded-xl overflow-hidden min-h-50 bg-muted/10">
 {partnerData?.profileImage || partnerData?.image ? (
 <img
 src={partnerData?.profileImage || partnerData?.image}
 alt={partnerData?.name}
 className="max-w-full max-h-[70vh] rounded-xl object-contain"
 />
 ) : (
 <div className="flex flex-col items-center justify-center w-full min-h-50 gap-2">
 <Camera size={40} className="text-muted/50" />
 <span className="text-muted/80 text-sm">No Profile Image</span>
 </div>
 )}
 <label className="absolute inset-4 sm:inset-auto sm:w-full sm:h-full max-w-full max-h-[70vh] rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
 <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
 <Camera size={32} className="mb-2" />
 <span className="font-medium text-sm">Change Image</span>
 </label>
 </div>
 </Modal>
 </div>
 );
}
