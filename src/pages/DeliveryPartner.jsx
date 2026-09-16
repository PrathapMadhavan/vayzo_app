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
  Package
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";

import { getDeliveryPartnerById, updateDeliveryPartner, getDeliveryPartnerLocation } from "../api/deliveryPartnersApi";
import { createActivityLog } from "../api/activityLogsApi";
import Modal from "../components/ui/Modal";
import Avatar from "../components/ui/Avatar";

const getValue = (value) => value || "--";

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-start py-3 border-b border-border/40 last:border-0 gap-1 sm:gap-4">
    <span className="text-[13px] sm:text-sm text-muted sm:min-w-[150px] shrink-0">{label}</span>
    <span className="text-sm sm:text-[15px] text-foreground font-medium break-words">{getValue(value)}</span>
  </div>
);

const StatBox = ({ label, value, sub, color = 'default', className = "" }) => {
  const colorMap = {
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    danger:  'text-danger',
    muted:   'text-muted',
    default: 'text-foreground'
  };
  return (
    <div className={`flex flex-col gap-1 px-3 sm:px-4 ${className} min-w-0`}>
      <p className="text-[11px] sm:text-xs text-muted whitespace-nowrap">{label}</p>
      <div className={`text-sm sm:text-base font-bold truncate ${colorMap[color] || colorMap.default}`}>{getValue(value)}</div>
      {sub && <p className={`text-xs ${colorMap[color] || colorMap.muted}`}>{sub}</p>}
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
  const { partnerId } = useParams();
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

  const handleSendMessage = async () => {
    setIsSendingMessage(true);
    setTimeout(() => {
      alert("Message Sent (Simulated)");
      setIsSendingMessage(false);
      setMessagingModalOpen(false);
      setMessageText("");
    }, 800);
  };

  const handleBlockPartner = async () => {
    setIsBlocking(true);
    try {
      await updateDeliveryPartner(partnerId, { status: "Blocked" });
      setPartnerData(prev => ({ ...prev, partner: { ...prev.partner, status: "Blocked" } }));
      setBlockModalOpen(false);
    } catch (err) {
      alert("Failed to block partner");
    } finally {
      setIsBlocking(false);
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
      const data = await getDeliveryPartnerById(partnerId);
      setPartnerData(data);
    } catch (err) {
      setError(err.message || "Failed to load delivery partner");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (partnerId) {
      loadPartner();
    }
  }, [partnerId]);

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

  const { partner, personalDetails, vehicle, earnings, bankAccount, documents, activity } = partnerData;

  const isBlocked = partner?.status === 'Blocked' || partner?.status === 'BLOCKED';
  const isOnline = partner?.onlineStatus === 'Online';

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'documents', label: 'Documents' },
    { id: 'earnings', label: 'Earnings' },
    { id: 'trips', label: 'Trips' },
    { id: 'payouts', label: 'Payouts' },
    { id: 'complaints', label: 'Ratings & Complaints' },
    { id: 'activity', label: 'Activity Logs' },
  ];

  const dummyPayouts = [
    { id: 'PO-12093', date: '15 Sep 2026', amount: 3450, status: 'Completed', method: 'Bank Transfer' },
    { id: 'PO-12042', date: '08 Sep 2026', amount: 4100, status: 'Completed', method: 'Bank Transfer' },
    { id: 'PO-11985', date: '01 Sep 2026', amount: 3800, status: 'Completed', method: 'Bank Transfer' },
  ];

  return (
    <div className="min-h-full bg-background pb-10">
      {/* ── Top breadcrumb & actions ── */}
      <div className="px-6 pt-5 pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between w-full sm:w-auto">
          <button onClick={() => navigate('/delivery')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-hover text-foreground transition-colors font-medium shadow-sm">
            <ArrowLeft size={15} /> Back to List
          </button>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button variant="secondary" size="sm" onClick={() => setMessagingModalOpen(true)} className="flex items-center justify-center gap-1.5 text-xs sm:text-sm border-border bg-surface hover:bg-surface-hover text-foreground shadow-sm">
            <MessageSquare size={14} /> 
            <span className="hidden sm:inline">Send Message</span>
            <span className="sm:hidden">Message</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setBlockModalOpen(true)}
            disabled={isBlocked}
            variant="danger"
            className="flex items-center justify-center gap-1.5 text-xs sm:text-sm shadow-sm"
          >
            <Ban size={14} /> 
            <span className="hidden sm:inline">Block Partner</span>
            <span className="sm:hidden">Block</span>
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate(`/delivery/edit/${partnerId}`)} className="flex items-center justify-center gap-1.5 text-xs sm:text-sm shadow-sm">
            <Pencil size={14} /> 
            <span className="hidden sm:inline">Edit Partner</span>
            <span className="sm:hidden">Edit</span>
          </Button>
        </div>
      </div>

      {/* ── Profile Header Card ── */}
      <div className="mx-6 mt-4 bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Top row: avatar + identity + stats */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 px-6 py-5">
          {/* Avatar + name */}
          <div className="flex items-center gap-4 shrink-0 lg:w-[350px]">
            <div className="relative shrink-0">
              <Avatar
                src={partner?.profileImage}
                identifier={partner?.name}
                alt={partner?.name}
                className="h-20 w-20 text-2xl rounded-full ring-2 ring-primary/20 bg-primary/10 text-primary font-bold"
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-border bg-background shadow-sm whitespace-nowrap">
                <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-success' : 'bg-danger'}`}></span>
                <span className={`text-[10px] font-medium ${isOnline ? 'text-success' : 'text-danger'}`}>{isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl font-bold text-foreground truncate">{partner?.name}</h1>
                <Badge variant={isBlocked ? 'danger' : 'success'} className="h-5 px-1.5 text-[10px]">
                  {isBlocked ? 'Blocked' : partner?.status || 'Active'}
                </Badge>
              </div>

              <div className="flex flex-col gap-1 mt-1">
                <div className="flex items-center gap-1.5 text-[13px] text-muted">
                  <Star size={13} className="text-amber-500 fill-amber-500 shrink-0" /> 
                  <span className="font-semibold text-foreground">{Number(partner?.rating || 0).toFixed(1)}</span> 
                  <span>({partner?.reviewCount || 0} Reviews)</span>
                </div>
                {partner?.mobileNumber && (
                  <div className="flex items-center gap-1.5 text-[13px] text-muted truncate">
                    <Phone size={13} className="shrink-0" /> <span className="truncate">{partner.mobileNumber}</span>
                  </div>
                )}
                {partner?.email && (
                  <div className="flex items-center gap-1.5 text-[13px] text-muted truncate">
                    <Mail size={13} className="shrink-0" /> <span className="truncate">{partner.email}</span>
                  </div>
                )}
                {partner?.joinedAt && (
                  <div className="flex items-center gap-1.5 text-[13px] text-muted truncate">
                    <CalendarDays size={13} className="shrink-0" /> <span className="truncate">Joined on {partner.joinedAt}</span>
                  </div>
                )}
                {partner?.location && (
                  <div className="flex items-center gap-1.5 text-[13px] text-muted truncate">
                    <MapPin size={13} className="shrink-0" /> <span className="truncate">{partner.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vertical divider */}
          <div className="hidden lg:block h-24 w-px bg-border/60 mx-2 shrink-0" />

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-4 gap-x-4 gap-y-6 lg:gap-y-8 w-full flex-1 pb-2 lg:pb-0">
            <StatBox label="Partner ID"        value={partner?.partnerId} />
            <StatBox label="Vehicle"           value={vehicle?.vehicleType || 'Bike'} />
            <StatBox label="Total Orders"      value={partner?.totalOrders || 0} />
            <StatBox label="Completion Rate"   value={partner?.completionRate !== undefined ? `${partner.completionRate}%` : '--'} />
            <StatBox label="Cancellation Rate" value={partner?.cancellationRate !== undefined ? `${partner.cancellationRate}%` : '--'} />
            <StatBox label="Total Earnings"    value={partner?.totalEarnings !== undefined ? `₹${Number(partner.totalEarnings).toLocaleString()}` : '--'} color="success" />
            <StatBox label="Today's Earnings"  value={partner?.todayEarnings !== undefined ? `₹${Number(partner.todayEarnings).toLocaleString()}` : '--'} color="primary" />
            <StatBox label="Last Order"        value={partner?.lastActivityAt || '--'} />
          </div>
        </div>

        {/* Tabs navigation */}
        <div className="flex items-center gap-2 px-3 border-t border-border overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50 bg-background/50">
                <User size={17} className="text-primary" />
                <h3 className="font-semibold text-foreground">Personal Information</h3>
              </div>
              <div className="p-5">
                <InfoRow label="Full Name"      value={personalDetails?.name || partner?.name} />
                <InfoRow label="Date of Birth"  value={personalDetails?.dateOfBirth} />
                <InfoRow label="Gender"         value={personalDetails?.gender} />
                <InfoRow label="Alternate Mobile"     value={personalDetails?.alternativeMobile} />
                <InfoRow label="Emergency Contact" value={personalDetails?.emergencyContact} />
                <InfoRow label="Emergency Relationship"  value={personalDetails?.emergencyContactRelation} />
                <InfoRow label="Emergency Contact Number"  value={personalDetails?.emergencyMobile} />
                <InfoRow label="Aadhaar Number"    value={personalDetails?.aadhaarNumber} />
                <InfoRow label="PAN Number"    value={personalDetails?.panNumber} />
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50 bg-background/50">
                <Bike size={17} className="text-primary" />
                <h3 className="font-semibold text-foreground">Vehicle Information</h3>
              </div>
              <div className="p-5">
                <InfoRow label="Vehicle Type"   value={vehicle?.vehicleType} />
                <InfoRow label="Vehicle Name"   value={vehicle?.vehicleName} />
                <InfoRow label="Vehicle Number" value={vehicle?.vehicleNumber} />
                <InfoRow label="RC Number"      value={vehicle?.rcNumber} />
                <InfoRow label="Insurance Provider" value={vehicle?.insuranceProvider} />
                <InfoRow label="Insurance Number"  value={vehicle?.insuranceNumber} />
                <InfoRow label="Insurance Valid Till"  value={vehicle?.validTill} />
              </div>
            </div>

            {/* Bank Info */}
            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm lg:col-span-2 xl:col-span-1">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50 bg-background/50">
                <Building size={17} className="text-primary" />
                <h3 className="font-semibold text-foreground">Bank Information</h3>
              </div>
              <div className="p-5">
                <InfoRow label="Bank Name"      value={bankAccount?.bankName} />
                <InfoRow label="Account Number" value={bankAccount?.accountNumberMasked || bankAccount?.accountNumber} />
                <InfoRow label="IFSC Code"      value={bankAccount?.ifscCode} />
                <InfoRow label="Account Holder Name" value={bankAccount?.accountHolderName} />
              </div>
            </div>
          </div>
        )}

        {/* ─ Documents Tab ─ */}
        {activeTab === 'documents' && (
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50 bg-background/50">
              <FileText size={17} className="text-primary" />
              <h3 className="font-semibold text-foreground">Uploaded Documents</h3>
            </div>
            <div className="p-5">
              {documents && documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {documents.map((doc, idx) => (
                    <div key={idx} className="flex flex-col p-5 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/5 transition-colors group cursor-pointer shadow-sm" onClick={() => viewDocument(doc.document_type?.replace(/_/g, ' '), doc.document_url)}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText size={18} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm uppercase truncate">
                            {doc.document_type?.replace(/_/g, ' ')}
                          </p>
                          <Badge variant={doc.verification_status === "VERIFIED" || doc.verification_status === "Verified" ? "success" : "warning"} className="h-5 px-1.5 text-[10px] mt-1">
                            {doc.verification_status || 'Pending'}
                          </Badge>
                        </div>
                        <Eye size={18} className="text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-xs space-y-1.5 mt-auto pt-3 border-t border-border/30">
                        <p className="text-muted flex justify-between">Doc Number: <span className="text-foreground font-medium">{doc.document_number ? doc.document_number.slice(-4).padStart(doc.document_number.length, '*') : '--'}</span></p>
                        <p className="text-muted flex justify-between">Expires: <span className="text-foreground font-medium">{doc.expires_at || '--'}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="No documents available." />
              )}
            </div>
          </div>
        )}

        {/* ─ Earnings Tab ─ */}
        {activeTab === 'earnings' && (
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50 bg-background/50">
              <Wallet size={17} className="text-primary" />
              <h3 className="font-semibold text-foreground">Earnings Summary</h3>
            </div>
            <div className="p-5">
              {earnings ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="bg-success/10 border border-success/20 rounded-xl p-5 shadow-sm">
                    <p className="text-xs text-success font-medium mb-1">Total Earnings</p>
                    <p className="text-2xl font-bold text-foreground">₹{earnings.totalEarnings ? earnings.totalEarnings.toLocaleString() : '0'}</p>
                  </div>
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 shadow-sm">
                    <p className="text-xs text-primary font-medium mb-1">This Week</p>
                    <p className="text-2xl font-bold text-foreground">₹{earnings.thisWeek ? earnings.thisWeek.toLocaleString() : '0'}</p>
                  </div>
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5 shadow-sm">
                    <p className="text-xs text-indigo-500 font-medium mb-1">This Month</p>
                    <p className="text-2xl font-bold text-foreground">₹{earnings.thisMonth ? earnings.thisMonth.toLocaleString() : '0'}</p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 shadow-sm">
                    <p className="text-xs text-amber-500 font-medium mb-1">Total Payouts</p>
                    <p className="text-2xl font-bold text-foreground">₹{earnings.totalPayouts ? earnings.totalPayouts.toLocaleString() : '0'}</p>
                  </div>
                </div>
              ) : (
                <EmptyState message="No earnings information available." />
              )}
            </div>
          </div>
        )}

        {/* ─ Payouts Tab ─ */}
        {activeTab === 'payouts' && (
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50 bg-background/50">
              <Wallet size={17} className="text-primary" />
              <h3 className="font-semibold text-foreground">Payout History</h3>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                {dummyPayouts.map(payout => (
                  <div key={payout.id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/5 transition-colors shadow-sm bg-background/50">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center shrink-0 text-success">
                        <TrendingUp size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{payout.id}</p>
                        <p className="text-xs text-muted flex items-center gap-2 mt-0.5">
                          <span>{payout.date}</span>
                          <span>•</span>
                          <span>{payout.method}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-success">+₹{payout.amount.toLocaleString()}</p>
                      <Badge variant="success" className="h-5 px-1.5 text-[10px] mt-1">{payout.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─ Orders Tab ─ */}
        {activeTab === 'orders' && (
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
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
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
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
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
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
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
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
              <p className="text-xs text-muted break-all">{partner?.partnerId} • {partner?.mobileNumber || partner?.email}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Message</label>
            <textarea
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px]"
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

      <Modal isOpen={isBlockModalOpen} onClose={() => setBlockModalOpen(false)} title="Block Partner">
        <p className="text-sm text-muted">Are you sure you want to block {partner?.name}? They will no longer be able to accept orders.</p>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setBlockModalOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleBlockPartner} disabled={isBlocking}>
            {isBlocking ? "Blocking..." : "Confirm Block"}
          </Button>
        </div>
      </Modal>

      <Modal isOpen={isDocumentModalOpen} onClose={() => setDocumentModalOpen(false)} title={`View ${selectedDocumentName}`}>
        <div className="flex flex-col items-center justify-center min-h-[200px] p-4">
          {!selectedDocumentUrl ? (
            <div className="text-center">
              <FileText size={40} className="mx-auto text-muted mb-3 opacity-50" />
              <p className="text-muted font-medium">No document available</p>
              <p className="text-xs text-muted/70 mt-1">This partner hasn't uploaded their {selectedDocumentName} yet.</p>
            </div>
          ) : selectedDocumentUrl.toLowerCase().endsWith('.pdf') ? (
            <iframe src={selectedDocumentUrl} className="w-full h-[400px] rounded border border-border" title={selectedDocumentName} />
          ) : (
            <img src={selectedDocumentUrl} alt={selectedDocumentName} className="max-w-full max-h-[400px] rounded object-contain" />
          )}
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="secondary" onClick={() => setDocumentModalOpen(false)}>Close</Button>
        </div>
      </Modal>
    </div>
  );
}
