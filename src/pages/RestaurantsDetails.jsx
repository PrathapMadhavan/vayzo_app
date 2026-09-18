import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Phone, Mail, Clock, Store, Star, ShoppingBag, Pencil } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";

import { getRestaurantById, deleteRestaurant } from "../api/restaurantsApi";

function RestaurantsDetails() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRestaurantById(restaurantId);
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

  return (
    <section className="min-h-full bg-background p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation */}
        <div>
          <button
            onClick={() => navigate("/restaurants")}
            className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Restaurants
          </button>
        </div>

        {/* Header Profile Card */}
        <div className="flex flex-col xl:flex-row gap-6">
          <Card className="flex-1 p-6 flex flex-col sm:flex-row gap-6 items-start">
            <div className="h-24 w-24 shrink-0 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Store size={40} strokeWidth={1.5} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground truncate">{restaurant.name}</h1>
                  <p className="text-sm text-muted mt-1 truncate">{restaurant.cuisineType}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant={restaurant.status === "Active" ? "success" : "danger"}>
                      {restaurant.status}
                    </Badge>
                    <Badge variant="secondary" className="gap-1 font-semibold">
                      <Star size={12} className="text-warning fill-warning" /> 
                      {restaurant.rating?.toFixed(1) || "New"}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => navigate(`/restaurants/edit/${restaurant.id}`)}
                    className="gap-1.5"
                  >
                    <Pencil size={14} />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="danger" 
                    className="gap-1.5 bg-danger text-danger border-transparent hover:bg-danger/50 hover:text-white"
                    onClick={() => setDeleteModalOpen(true)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Quick Stats */}
          <div className="xl:w-[300px] shrink-0 grid grid-cols-2 xl:grid-cols-1 gap-4">
             <Card className="p-5 flex flex-col justify-center">
                <div className="flex items-center gap-3 text-muted mb-2">
                  <ShoppingBag size={18} />
                  <span className="text-sm font-medium">Total Orders</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{(restaurant.totalOrders || 0).toLocaleString('en-IN')}</p>
             </Card>
             <Card className="p-5 flex flex-col justify-center">
                <div className="flex items-center gap-3 text-muted mb-2">
                  <Store size={18} />
                  <span className="text-sm font-medium">Joined On</span>
                </div>
                <p className="text-lg font-bold text-foreground">{restaurant.joinedOn || "-"}</p>
             </Card>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-base font-bold text-foreground mb-5 border-b border-border pb-3">
              Contact Information
            </h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="mt-0.5 text-muted shrink-0"><MapPin size={18} /></div>
                <div>
                  <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Address</p>
                  <p className="text-sm text-foreground">{restaurant.address || "-"}</p>
                  <p className="text-sm text-foreground mt-0.5">{restaurant.city || "-"}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-0.5 text-muted shrink-0"><Phone size={18} /></div>
                <div>
                  <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Phone</p>
                  <p className="text-sm text-foreground">{restaurant.phone || "-"}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-0.5 text-muted shrink-0"><Mail size={18} /></div>
                <div>
                  <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Email</p>
                  <p className="text-sm text-foreground">{restaurant.email || "-"}</p>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-base font-bold text-foreground mb-5 border-b border-border pb-3">
              Operational Details
            </h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="mt-0.5 text-muted shrink-0"><Clock size={18} /></div>
                <div>
                  <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Timing</p>
                  <p className="text-sm text-foreground">
                    {restaurant.openingTime || "-"} to {restaurant.closingTime || "-"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Delivery Time</p>
                  <p className="text-sm text-foreground font-medium">{restaurant.deliveryTime || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Owner Name</p>
                  <p className="text-sm text-foreground font-medium">{restaurant.ownerName || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Minimum Order</p>
                  <p className="text-sm text-foreground font-medium">₹{restaurant.minimumOrder || 0}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Delivery Charge</p>
                  <p className="text-sm text-foreground font-medium">₹{restaurant.deliveryCharge || 0}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

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
    </section>
  );
}

export default RestaurantsDetails;
