import { apiRequest } from "./apiClient";

export async function getTransactions() {
  // Transactions are an aggregation of multiple verified financial domains
  try {
    const [payments, walletTransactions, partnerEarnings, partnerPayouts] = await Promise.all([
      apiRequest("/api/v1/admin/finance/payments").catch((err) => {
        console.error("Source failure: /payments", err);
        return [];
      }),
      apiRequest("/api/v1/admin/finance/wallet-transactions").catch((err) => {
        console.error("Source failure: /wallet_transactions", err);
        return [];
      }),
      apiRequest("/api/v1/admin/finance/partner-earnings").catch((err) => {
        console.error("Source failure: /partner_earnings", err);
        return [];
      }),
      apiRequest("/api/v1/admin/finance/partner-payouts").catch((err) => {
        console.error("Source failure: /partner_payouts", err);
        return [];
      })
    ]);

    // Normalize each financial source into a deterministic model without fabricating data
    const normalize = (list, sourceIdField, sourceType, nameField, defaultDesc) => {
      if (!Array.isArray(list)) return [];
      return list.map((item) => {
        const id = item[sourceIdField] || item.id || item.transactionId;
        if (!id) {
          return null;
        }

        const rawAmount =
          typeof item.amount !== "undefined" && item.amount !== null
            ? item.amount
            : typeof item.net_amount !== "undefined" && item.net_amount !== null
            ? item.net_amount
            : 0;

        const rawStatus = item.status || item.payment_status || "SUCCESS";
        const normalizedStatus = String(rawStatus).toUpperCase();

        const rawDate =
          item.paymentDate ||
          item.date ||
          item.createdAt ||
          item.created_at ||
          item.earned_at ||
          null;

        const userName =
          item[nameField] ||
          item.customerName ||
          item.partnerName ||
          item.userName ||
          (item.customer && item.customer.name) ||
          null;

        const method =
          item.paymentMethod ||
          item.payment_method ||
          item.method ||
          item.payoutMethod ||
          item.payout_method ||
          "N/A";

        const relatedOrder =
          item.requestId ||
          item.request_id ||
          item.orderId ||
          null;

        return {
          transactionId: id,
          userName,
          type: item.type || sourceType,
          status: normalizedStatus,
          amount: Number(rawAmount) || 0,
          method,
          description: item.description || defaultDesc,
          city: item.city || "Chennai",
          date: rawDate,
          relatedOrder,
          rawDetails: item
        };
      }).filter(Boolean);
    };

    const aggregated = [
      ...normalize(payments, "paymentId", "PAYMENT", "customerName", "Order Payment"),
      ...normalize(walletTransactions, "transactionId", "WALLET_TRANSACTION", "userName", "Wallet Transaction"),
      ...normalize(partnerEarnings, "earningId", "PARTNER_EARNING", "partnerName", "Partner Earning"),
      ...normalize(partnerPayouts, "payoutId", "PARTNER_PAYOUT", "partnerName", "Partner Payout")
    ];

    // Sort newest-first by date
    return aggregated.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  } catch (err) {
    console.error("Failed to aggregate transactions", err);
    throw err;
  }
}

export async function getTransactionById(transactionId) {
  const all = await getTransactions();
  return all.find((t) => t.transactionId === transactionId) || null;
}
