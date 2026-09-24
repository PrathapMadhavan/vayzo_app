import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Printer,
  ChevronDown,
  User,
  MapPin,
  Bike,
  CheckCircle,
} from "lucide-react";

import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Select from "../components/ui/Select";
import Table from "../components/ui/Table";
import { getOrderById, updateOrder, updateOrderStatus } from "../api/ordersApi";
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

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const orderData = await getOrderById(orderId);
      setOrder(orderData);
      const partnerId = orderData.assignments?.[0]?.partner_id;
      setSelectedPartner(partnerId || "");

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

  if (loading) {
    return (
      <div className="p-6 text-sm text-muted">Loading order details...</div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6">
        <p className="text-sm text-danger mb-4">
          {error || "Order not found."}
        </p>
        <Button variant="secondary" onClick={() => navigate("/orders")}>
          Back to Orders
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

  return (
    <section className="min-h-full bg-background p-4 sm:p-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-foreground">
              Order #{order.id}
            </h1>
            <Badge
              variant={STATUS_MAP[orderStatus] || "default"}
              className="px-3 py-1 text-xs"
            >
              {toTitleCase(formatStatus(orderStatus))}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-sm font-medium text-muted">
            <span>
              {dateFormatted}, {timeFormatted}
            </span>
            <Badge
              variant="secondary"
              className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-surface border border-border"
            >
              {"Payment Info Unavailable"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="gap-2 bg-surface text-foreground font-semibold"
          >
            <Printer size={16} /> Print Invoice
          </Button>
          <Button
            variant="secondary"
            className="bg-surface text-danger border-danger/20 font-semibold hover:bg-danger/5 hover:border-danger/30"
          >
            Cancel Order
          </Button>
          <Button
            variant="secondary"
            className="bg-surface font-semibold gap-1 px-3"
          >
            More <ChevronDown size={16} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMN 1: Left (Spans 2 columns) */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Customer Details */}
            <Card className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2 font-semibold text-foreground border-b border-border pb-3">
                <User size={18} className="text-muted" /> Customer Details
              </div>
              <div className="flex flex-col gap-1 text-sm text-muted">
                <span className="font-semibold text-foreground text-base mb-1">
                  {order.customer?.name || "Unavailable"}
                </span>
                <span>
                  {order.customer?.phone ||
                    order.customer?.mobile ||
                    "Unavailable"}
                </span>
                <span>{order.customer?.email || "Unavailable"}</span>
              </div>
            </Card>

            {/* Delivery Address */}
            <Card className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2 font-semibold text-foreground border-b border-border pb-3">
                <MapPin size={18} className="text-muted" /> Delivery Address
              </div>
              <div className="flex flex-col gap-3 text-sm text-muted">
                <p className="leading-relaxed">
                  {order.dropoff_address_snapshot ? (
                    <>{order.dropoff_address_snapshot}</>
                  ) : (
                    <span className="italic">Location not available</span>
                  )}
                </p>
                <Button
                  variant="secondary"
                  className="w-fit text-primary border-primary/30 font-semibold bg-primary/5 hover:bg-primary/10"
                  disabled={true} title="Live tracking unavailable"
                >
                  Track Partner (Unavailable)
                </Button>
              </div>
            </Card>
          </div>

          {/* Order Items */}
          <Card className="p-0 flex flex-col overflow-hidden">
            <div className="p-5 border-b border-border font-semibold text-foreground">
              Order Items
            </div>
            <div className="p-0">
              <Table
                headers={["Item", "Price", "Qty", "Total"]}
                currentCount={order.items?.length || 0}
                totalCount={order.items?.length || 0}
                currentPage={1}
                totalPages={1}
                onPageChange={() => {}}
                className="border-0 shadow-none rounded-none border-t-0"
              >
                {order.items?.length > 0 ? (
                  order.items.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-border last:border-0 hover:bg-surface transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md bg-border/50 shrink-0 overflow-hidden flex items-center justify-center text-muted font-bold text-xs">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              item.name?.charAt(0) || "I"
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-foreground truncate">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-muted truncate">
                              {item.variant || "Regular"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right text-muted font-medium">
                        {formatAmount(item.price)}
                      </td>
                      <td className="px-5 py-4 text-center font-semibold text-foreground">
                        {item.quantity}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-foreground">
                        {formatAmount(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted">
                      No items found
                    </td>
                  </tr>
                )}
                {order.items?.length > 0 && (
                  <tr className="bg-surface/50 border-t-2 border-border">
                    <td
                      colSpan={3}
                      className="px-5 py-4 text-right font-bold text-foreground"
                    >
                      Total
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-foreground text-base">
                      {order.total_estimated_amount
                        ? formatAmount(order.total_estimated_amount)
                        : "Unavailable"}
                    </td>
                  </tr>
                )}
              </Table>
            </div>
          </Card>
        </div>

        {/* COLUMN 2: Middle */}
        <div className="flex flex-col gap-6">
          {/* Order Summary */}
          <Card className="p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between font-semibold text-foreground border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Printer size={18} className="text-muted" /> Order Summary
              </div>
            </div>

            <div className="flex flex-col gap-4 text-sm font-medium pt-2">
              <div className="flex justify-between items-center">
                <span className="text-muted">Restaurant</span>
                <span className="text-foreground font-semibold text-right">
                  {order.restaurant?.name || "Unavailable"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Items</span>
                <span className="text-foreground text-right">
                  {order.items?.length || 0} items
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-muted">Item Total</span>
                <span className="text-foreground text-right">
                  {order.total_estimated_amount
                    ? formatAmount(order.total_estimated_amount)
                    : "Unavailable"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Packaging Charges</span>
                <span className="text-foreground text-right">Unavailable</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Delivery Charges</span>
                <span className="text-foreground text-right">Unavailable</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Discount</span>
                <span className="text-foreground text-right">Unavailable</span>
              </div>

              <div className="border-t border-dashed border-border my-2"></div>

              <div className="flex justify-between items-center">
                <span className="text-foreground font-bold text-base">
                  Total Amount
                </span>
                <span className="text-foreground font-bold text-base text-right">
                  {order.total_estimated_amount
                    ? formatAmount(order.total_estimated_amount)
                    : "Unavailable"}
                </span>
              </div>

              <div className="flex justify-between items-center mt-2 p-3 bg-success/5 rounded-lg border border-success/20">
                <span className="text-success font-bold">Paid Amount</span>
                <span className="text-success font-bold text-right">
                  Unavailable
                </span>
              </div>
            </div>
          </Card>

          {/* Assign Delivery Partner */}
          <Card className="p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 font-semibold text-foreground border-b border-border pb-3">
              <Bike size={18} className="text-muted" /> Assign Delivery Partner
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <label className="text-xs font-semibold text-muted">
                Select Delivery Partner <span className="text-danger">*</span>
              </label>

              <div className="flex flex-col gap-2 mt-2 max-h-75 overflow-y-auto custom-scrollbar pr-2">
                {partners.map((dp, i) => (
                  <label
                    key={dp.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedPartner === dp.id ? "border-primary/50 bg-primary/5" : "border-border hover:bg-surface"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary overflow-hidden shrink-0">
                        {dp.profileImage ? (
                          <img
                            src={dp.profileImage}
                            alt={dp.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          dp.name?.charAt(0) || "D"
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-foreground flex items-center gap-1 truncate">
                          {dp.name}
                        </span>
                        <span className="text-xs text-muted truncate">
                          {dp.id}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${dp.status === "Active" ? "text-success" : "text-muted"}`}
                      >
                        {dp.status}
                      </span>
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name="delivery_partner"
                          className="peer sr-only"
                          checked={selectedPartner === dp.id}
                          onChange={() => setSelectedPartner(dp.id)}
                        />
                        <div className={`h-4 w-4 rounded-full transition-all ${selectedPartner === dp.id ? "border-4 border-primary" : "border border-muted"}`}></div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <Button
                className="w-full mt-2 font-bold py-2.5 shadow-md"
                onClick={handleAssignPartner}
                disabled={assignLoading || !selectedPartner}
              >
                {assignLoading ? "Assigning..." : "Assign Partner"}
              </Button>
            </div>
          </Card>

          {/* Order Timeline (Right Sidebar) */}
          <Card className="p-5 flex flex-col gap-4">
            <div className="font-semibold text-foreground border-b border-border pb-3">
              Order Timeline
            </div>

            <div className="relative pl-6 pt-4 pb-2 border-l-2 border-border ml-3 flex flex-col gap-8">
              {order.status_history && order.status_history.length > 0 ? (
                order.status_history.map((sh, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-8.75 top-0.5 h-4 w-4 rounded-full bg-background border-2 border-primary ring-4 ring-background z-10 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    </div>
                    {idx > 0 && (
                      <div className="absolute -left-6.75 -top-11 h-13 w-0.5 bg-primary z-0"></div>
                    )}
                    <h4 className="text-sm font-bold text-foreground">
                      {toTitleCase(formatStatus(sh.status))}
                    </h4>
                    <p className="text-xs text-muted mt-1">
                      {new Date(sh.timestamp).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                      ,{" "}
                      {new Date(sh.timestamp).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {sh.reason && (
                      <p className="text-xs italic text-muted mt-1">
                        {sh.reason}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted">No timeline available</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
