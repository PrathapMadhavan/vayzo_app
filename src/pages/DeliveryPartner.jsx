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
  Search
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";

import { getDeliveryPartnerById } from "../api/deliveryPartnersApi";

const getValue = (value) => value || "--";

const InfoRows = ({ items }) => (
  <div className="space-y-3 text-xs">
    {items.map(([label, value]) => (
      <div key={label} className="flex gap-3">
        <span className="w-[140px] shrink-0 text-muted">{label}</span>
        <span className="min-w-0 truncate font-medium text-foreground">
          {getValue(value)}
        </span>
      </div>
    ))}
  </div>
);

const DetailCard = ({ title, icon: Icon, children, headerRight }) => (
  <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 shadow-sm h-full flex flex-col">
    <h3 className="mb-4 flex items-center justify-between gap-2 text-sm font-semibold text-foreground pb-3 border-b border-border">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-primary" />
        {title}
      </div>
      {headerRight && <div>{headerRight}</div>}
    </h3>
    <div className="flex-1">
      {children}
    </div>
  </div>
);

const EmptyState = ({ message }) => (
  <div className="flex h-full flex-col items-center justify-center py-8 text-center">
    <FileText size={24} className="mb-2 text-muted/50" />
    <p className="text-sm text-muted">{message || "No information available."}</p>
  </div>
);

function DeliveryPartner() {
  const { partnerId } = useParams();
  const navigate = useNavigate();

  const [partnerData, setPartnerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPartner();
  }, [partnerId]);

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

  if (loading) {
    return (
      <section className="flex min-h-full items-center justify-center bg-background p-6">
        <p className="text-muted">Loading partner details...</p>
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

  const stats = [
    ["Partner ID", partner?.partnerId, <Search size={14} key="search" />],
    ["Vehicle", vehicle?.vehicleType, <Bike size={14} key="bike" />],
    ["Total Orders", partner?.totalOrders, <FileText size={14} key="file" />],
    ["Completion Rate", `${partner?.completionRate || 0}%`, <Check size={14} key="check" />],
    ["Cancellation Rate", `${partner?.cancellationRate || 0}%`, <Ban size={14} key="ban" />],
    ["Total Earnings", partner?.totalEarnings ? `₹${partner.totalEarnings.toLocaleString()}` : null, <Wallet size={14} key="wallet1" />],
    ["Today's Earnings", partner?.todayEarnings ? `₹${partner.todayEarnings.toLocaleString()}` : null, <Wallet size={14} key="wallet2" />],
    ["Last Activity", partner?.lastActivityAt, <CalendarDays size={14} key="cal" />],
  ];

  const personalInfo = personalDetails ? [
    ["Date of Birth", personalDetails.dateOfBirth],
    ["Gender", personalDetails.gender],
    ["Alternative Mobile", personalDetails.alternativeMobile],
    ["Emergency Contact Name", personalDetails.emergencyContact],
    ["Emergency Contact Number", personalDetails.emergencyMobile],
    ["Address", personalDetails.address],
    ["PAN Number", personalDetails.panNumber],
    ["Aadhaar Number", personalDetails.aadhaarNumber],
  ] : [];

  const vehicleInfo = vehicle ? [
    ["Vehicle Type", vehicle.vehicleType],
    ["Vehicle Name", vehicle.vehicleName],
    ["Vehicle Number", vehicle.vehicleNumber],
    ["RC Number", vehicle.rcNumber],
    ["Insurance Provider", vehicle.insuranceProvider],
    ["Insurance Number", vehicle.insuranceNumber],
    ["Insurance Valid Till", vehicle.validTill],
  ] : [];

  const bankInfo = bankAccount ? [
    ["Bank Name", bankAccount.bankName],
    ["Account Number", bankAccount.accountNumberMasked],
    ["IFSC Code", bankAccount.ifscCode],
    ["Account Holder Name", bankAccount.accountHolderName],
  ] : [];

  const earningsSummary = [
    { label: "Total Earnings", value: earnings?.totalEarnings ? `₹${earnings.totalEarnings.toLocaleString()}` : "₹0", color: "text-success", icon: "₹", bg: "bg-success/10" },
    { label: "This Week", value: earnings?.thisWeek ? `₹${earnings.thisWeek.toLocaleString()}` : "₹0", color: "text-primary", icon: "📅", bg: "bg-primary/10" },
    { label: "This Month", value: earnings?.thisMonth ? `₹${earnings.thisMonth.toLocaleString()}` : "₹0", color: "text-indigo-500", icon: "$", bg: "bg-indigo-500/10" },
    { label: "Total Payouts", value: earnings?.totalPayouts ? `₹${earnings.totalPayouts.toLocaleString()}` : "₹0", color: "text-amber-500", icon: "→", bg: "bg-amber-500/10" },
  ];

  return (
    <section className="min-h-full bg-background p-4 sm:p-6">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/delivery")}
          >
            <ArrowLeft size={16} />
            <span className="ml-2 font-medium">Back to List</span>
          </Button>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              className="border-border bg-surface hover:bg-surface-hover text-foreground shadow-sm"
            >
              <MessageSquare size={16} />
              <span className="ml-2 font-medium">Message</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="border-danger/20 bg-danger/5 hover:bg-danger/10 text-danger shadow-sm"
            >
              <Ban size={16} />
              <span className="ml-2 font-medium">Block</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/delivery/edit/${partnerId}`)}
            >
              <Pencil size={16} />
              <span className="ml-2 font-medium">Edit</span>
            </Button>
          </div>
        </div>

        {/* HEADER / SUMMARY */}
        <div className="grid gap-6 rounded-xl border border-border bg-surface p-5 sm:p-6 shadow-sm lg:grid-cols-[minmax(320px,1.2fr)_2fr]">
          <div className="flex items-start gap-5">
            <div className="flex flex-col items-center gap-3">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary overflow-hidden border-2 border-primary/20">
                 <img src={`https://ui-avatars.com/api/?name=${partner?.name || 'P'}&background=random&color=fff&size=200`} alt={partner?.name} className="h-full w-full object-cover" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-semibold text-foreground">
                  {getValue(partner?.name)}
                </h2>
                <Badge variant={partner?.status === "ACTIVE" || partner?.status === "Active" || partner?.status === "VERIFIED" ? "success" : "danger"} className="h-6 px-2">
                  {getValue(partner?.status)}
                </Badge>
              </div>

              <p className="mt-1.5 flex items-center gap-1 text-sm text-foreground font-medium">
                <Star size={15} className="text-amber-500" fill="currentColor" />
                {Number(partner?.rating || 0).toFixed(1)}
                <span className="text-muted font-normal text-xs ml-1">({partner?.reviewCount || 0} Reviews)</span>
              </p>

              <div className="mt-4 space-y-2.5 text-xs text-muted">
                <p className="flex items-center gap-2.5">
                  <Phone size={14} className="text-foreground/70"/>
                  {getValue(partner?.mobileNumber)}
                </p>
                <p className="flex items-center gap-2.5 truncate">
                  <Mail size={14} className="text-foreground/70"/>
                  {getValue(partner?.email)}
                </p>
                <p className="flex items-center gap-2.5">
                  <CalendarDays size={14} className="text-foreground/70"/>
                  Joined on {getValue(partner?.joinedAt)}
                </p>
                <p className="flex items-center gap-2.5">
                  <MapPin size={14} className="text-foreground/70 shrink-0"/>
                  <span className="truncate">{getValue(partner?.location)}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-5 text-xs sm:grid-cols-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            {stats.map(([label, value, icon]) => (
              <div key={label} className="min-w-0 flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0">
                  {icon}
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-muted text-[11px] mb-1 truncate">{label}</p>
                  <p className="font-semibold text-foreground text-[13px] leading-snug break-words">
                    {getValue(value)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          
          {/* Section 1: Personal Details */}
          <DetailCard title="Personal Details" icon={FileText}>
            {personalDetails && Object.keys(personalDetails).length > 0 ? (
              <InfoRows items={personalInfo} />
            ) : (
              <EmptyState message="No personal information available." />
            )}
          </DetailCard>

          {/* Section 2: Vehicle Details */}
          <DetailCard title="Vehicle Details" icon={Bike}>
            {vehicle && Object.keys(vehicle).length > 0 ? (
              <InfoRows items={vehicleInfo} />
            ) : (
              <EmptyState message="No vehicle information available." />
            )}
          </DetailCard>

          {/* Section 3: Earnings */}
          <DetailCard title="Earnings & Payouts" icon={Wallet}>
            {earnings ? (
              <div className="grid grid-cols-2 gap-4 mt-2">
                {earningsSummary.map((item, idx) => (
                  <div key={idx} className={`rounded-xl ${item.bg} p-4 border border-border/50`}>
                    <div className="flex justify-between items-start mb-2">
                        <div className={`h-8 w-8 rounded-full bg-background flex items-center justify-center ${item.color} shadow-sm font-semibold text-sm`}>
                          {item.icon}
                        </div>
                    </div>
                    <p className="text-[11px] text-muted font-medium mb-1">{item.label}</p>
                    <p className="text-lg font-bold text-foreground">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No earnings information available." />
            )}
          </DetailCard>

          {/* Section 5: Bank Details */}
          <DetailCard title="Bank Details" icon={Wallet}>
            {bankAccount && Object.keys(bankAccount).length > 0 ? (
              <InfoRows items={bankInfo} />
            ) : (
              <EmptyState message="No bank account information available." />
            )}
          </DetailCard>

          {/* Section 4: Documents */}
          <div className="md:col-span-2">
            <DetailCard title="Documents" icon={FileText}>
              {documents && documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.map((doc, idx) => (
                    <div key={idx} className="flex flex-col p-4 rounded-xl border border-border/50 bg-background/50">
                      <div className="flex items-center gap-3 mb-3">
                        <FileText size={18} className="text-primary/70 shrink-0" />
                        <span className="flex-1 font-medium text-foreground text-sm uppercase">
                          {doc.document_type?.replace(/_/g, ' ')}
                        </span>
                        <Badge variant={doc.verification_status === "VERIFIED" ? "success" : "warning"} className="h-5 px-1.5 text-[10px]">
                          {doc.verification_status || 'Pending'}
                        </Badge>
                      </div>
                      <div className="text-xs space-y-1 mt-auto">
                        <p className="text-muted flex justify-between">Number: <span className="text-foreground font-medium">{doc.document_number ? doc.document_number.slice(-4).padStart(doc.document_number.length, '*') : '--'}</span></p>
                        <p className="text-muted flex justify-between">Expires: <span className="text-foreground font-medium">{doc.expires_at || '--'}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="No documents available." />
              )}
            </DetailCard>
          </div>

          {/* Recent Activity */}
          <div className="md:col-span-2">
            <DetailCard title="Recent Activity" icon={CalendarDays}>
              {activity && activity.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 mt-2">
                  {activity.map((act, idx) => (
                    <div key={idx} className="flex gap-4 p-3 rounded-lg hover:bg-surface-hover transition-colors border border-transparent hover:border-border/50">
                      <div className={`mt-0.5 shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${act.type === 'EARNING' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                        {act.type === 'EARNING' ? <Wallet size={14} /> : <FileText size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{act.details || act.action}</p>
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
            </DetailCard>
          </div>

        </div>
      </div>
    </section>
  );
}

export default DeliveryPartner;
