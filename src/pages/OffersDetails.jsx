import { useEffect, useState } from "react";
import { ArrowLeft, Tag, Calendar, Users, Activity, ShoppingBag } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import { getOfferById, deleteOffer } from "../api/offersApi";
import Modal from "../components/ui/Modal";

const statusBadgeMap = {
  ACTIVE: "success",
  SCHEDULED: "warning",
  EXPIRED: "danger",
};

const COLOR_MAP = {
  success: "text-success bg-success/10",
  info: "text-info bg-info/10",
  warning: "text-warning bg-warning/10",
  danger: "text-danger bg-danger/10",
  primary: "text-primary bg-primary/10",
  muted: "text-muted bg-muted/10"
};

const ICON_MAP = {
  Percentage: Tag,
  Flat: Tag,
  "Free Delivery": Tag
};

export default function OffersDetails() {
  const { offerId } = useParams();
  const navigate = useNavigate();
  
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        setLoading(true);
        const data = await getOfferById(offerId);
        setOffer(data);
      } catch (err) {
        setError("Unable to load offer details.");
      } finally {
        setLoading(false);
      }
    };
    if (offerId) fetchOffer();
  }, [offerId]);

  const handleDelete = async () => {
    try {
      await deleteOffer(offerId);
      navigate("/offers");
    } catch (err) {
      alert("Failed to delete offer.");
    }
  };

  const formatDt = (dt) => {
    if (!dt) return "";
    const d = new Date(dt);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-muted">
        Loading offer details...
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 text-danger">
          <Tag size={48} />
        </div>
        <h2 className="mb-2 text-xl font-bold text-foreground">Error</h2>
        <p className="text-sm text-danger">{error || "Offer not found."}</p>
        <Button variant="secondary" className="mt-6" onClick={() => navigate("/offers")}>
          Back to Offers
        </Button>
      </div>
    );
  }

  const Icon = ICON_MAP[offer.type] || Tag;
  const bgAndColor = COLOR_MAP[offer.color] || COLOR_MAP.primary;

  return (
    <section className="min-h-full bg-background p-4 sm:p-6 flex flex-col gap-6 pb-20">
      
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/offers")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted hover:bg-background hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              Offer Details
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted mt-1">
              <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => navigate("/offers")}>Offers</span>
              <span>/</span>
              <span className="font-medium text-foreground">{offer.name}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="gap-2 shrink-0 shadow-sm bg-surface" onClick={() => navigate(`/offers/edit/${offer.id}`)}>
            Edit Offer
          </Button>
          <Button variant="danger" className="gap-2 shrink-0 shadow-sm bg-danger text-danger border-transparent hover:bg-danger/50 hover:text-white" onClick={() => setDeleteModalOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_350px]">
        {/* Left Column: Offer Information */}
        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-8 pb-6 border-b border-border">
              <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${bgAndColor}`}>
                <Icon size={28} strokeWidth={2.5}/>
              </div>
              <div className="flex-1 flex flex-col pt-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-foreground uppercase tracking-wide">{offer.name}</h2>
                  <Badge variant={statusBadgeMap[offer.status] || "default"} className="px-2.5 py-0.5 rounded-full text-xs uppercase tracking-wider font-bold">
                    {offer.status}
                  </Badge>
                </div>
                <span className="text-sm font-medium text-muted">{offer.title} • {offer.type}</span>
              </div>
            </div>

            <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Offer Configuration</h3>
            <div className="grid sm:grid-cols-2 gap-y-6 gap-x-8 mb-8 pb-6 border-b border-border">
              <div>
                <p className="text-xs font-semibold text-muted mb-1">Discount Details</p>
                <p className="text-sm font-medium text-foreground">{offer.discountText}</p>
                <p className="text-xs text-muted mt-0.5">{offer.discountDetail}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted mb-1">Applicable Platform</p>
                <p className="text-sm font-medium text-foreground">{offer.platform || "All Platforms"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted mb-1">Validity Period</p>
                <p className="text-sm font-medium text-foreground">{formatDt(offer.validFrom)} — {formatDt(offer.validTo)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted mb-1">Target Audience</p>
                <p className="text-sm font-medium text-foreground">{offer.audience || "All Users"}</p>
              </div>
            </div>

            <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Additional Information</h3>
            <div>
              <p className="text-sm text-foreground leading-relaxed">
                {offer.description || "No specific description provided for this offer."}
              </p>
            </div>
          </Card>
        </div>

        {/* Right Column: Analytics & Quick Stats */}
        <div className="flex flex-col gap-6">
          <StatCard
            variant="horizontal"
            title="Total Uses"
            value={offer.usageLimit?.toLocaleString() || 0}
            icon={Activity}
            colorClass="text-primary"
            bgClass="bg-primary/10"
            className="shadow-sm"
          />
          <StatCard
            variant="horizontal"
            title="Max Allowed Uses"
            value={offer.usageMax?.toLocaleString() || "Unlimited"}
            icon={Users}
            colorClass="text-info"
            bgClass="bg-info/10"
            className="shadow-sm"
          />
          <StatCard
            variant="horizontal"
            title="Revenue Generated"
            value="₹45,230"
            icon={ShoppingBag}
            colorClass="text-success"
            bgClass="bg-success/10"
            className="shadow-sm"
            trend="+12.4%"
          />
        </div>
      </div>

      <Modal 
        isOpen={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)} 
        title="Delete Offer"
      >
        <p className="text-sm text-muted">Are you sure you want to delete <strong>{offer.name}</strong>? This action cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
          <Button className="bg-danger hover:bg-danger/90 text-white border-0" onClick={handleDelete}>Delete Offer</Button>
        </div>
      </Modal>

    </section>
  );
}
