import { apiRequest } from "./apiClient";

export async function getTransactions() {
  // Transactions are an aggregation of multiple financial domains
  try {
    const [payments, walletTransactions, partnerEarnings, partnerPayouts] = await Promise.all([
      apiRequest("/api/v1/admin/finance/payments").catch((err) => { console.error("Source failure: /payments", err); return []; }),
      apiRequest("/api/v1/admin/finance/wallet-transactions").catch((err) => { console.error("Source failure: /wallet_transactions", err); return []; }),
      apiRequest("/api/v1/admin/finance/partner-earnings").catch((err) => { console.error("Source failure: /partner_earnings", err); return []; }),
      apiRequest("/api/v1/admin/finance/partner-payouts").catch((err) => { console.error("Source failure: /partner_payouts", err); return []; })
    ]);

    // Normalize each source into a deterministic model without fabricating data.
    // transactionId, userName, type, status, amount, method, description, city, date
    
    const normalize = (list, sourceIdField, sourceType, nameField, defaultDesc) => {
      return list.map(item => {
        const id = item[sourceIdField] || item.id;
        if (!id) {
          console.warn(`MISSING REQUIREMENT: Record missing valid ID in ${sourceType}`);
          return null;
        }
        return {
          transactionId: id,
          userName: item[nameField] || null,
          type: item.type || sourceType,
          status: item.status || null,
          amount: typeof item.amount !== 'undefined' && item.amount !== null ? Number(item.amount) : null,
          method: item.paymentMethod || item.method || item.payoutMethod || null,
          description: item.description || null,
          city: item.city || null,
          date: item.paymentDate || item.date || item.createdAt || null
        };
      }).filter(Boolean);
    };

    const aggregated = [
      ...normalize(payments, 'paymentId', 'PAYMENT', 'customerName', 'Order Payment'),
      ...normalize(walletTransactions, 'transactionId', 'WALLET_TRANSACTION', 'userName', 'Wallet Transaction'),
      ...normalize(partnerEarnings, 'earningId', 'PARTNER_EARNING', 'partnerName', 'Partner Earning'),
      ...normalize(partnerPayouts, 'payoutId', 'PARTNER_PAYOUT', 'partnerName', 'Partner Payout')
    ];

    // Sort by date descending if dates exist
    return aggregated.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  } catch (err) {
    console.error("Failed to aggregate transactions", err);
    return [];
  }
}
