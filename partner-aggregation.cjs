// Partner Aggregation logic for mock server
function getPartnerAggregatedData(db, partnerId) {
  let profile = null;
  
  if (db.partner_profiles) {
    profile = db.partner_profiles.find(p => p.id === partnerId || p.partner_code === partnerId);
    if (!profile && db.users) {
      const user = db.users.find(u => u.id === partnerId && u.role === 'Delivery Partner');
      if (user) {
        profile = db.partner_profiles.find(p => p.user_id === user.id);
      }
    }
  }

  // Fallback to legacy partners collection if profile not found
  let legacyPartner = null;
  if (!profile) {
    legacyPartner = (db.partners || []).find(p => p.id === partnerId);
    if (!legacyPartner) return null;
  }
  
  const pId = profile ? profile.id : legacyPartner.id;
  const userId = profile ? profile.user_id : null;
  let user = userId ? (db.users || []).find(u => u.id === userId) : legacyPartner;
  
  if (!user && profile) {
    // If we have a profile but no user, it might be a legacy partner where the profile points to a partner in the legacy partners collection instead of users.
    legacyPartner = (db.partners || []).find(p => p.id === userId);
    user = legacyPartner;
  }
  
  if (!user && !legacyPartner) return null;

  // Earnings
  const earnings = db.partner_earnings ? db.partner_earnings.filter(e => e.partner_id === pId) : [];
  const totalEarnings = earnings.reduce((sum, e) => sum + (e.net_amount || 0), 0);
  const today = new Date().toISOString().split('T')[0];
  const todayEarnings = earnings.filter(e => e.earned_at && e.earned_at.startsWith(today)).reduce((sum, e) => sum + (e.net_amount || 0), 0);
  
  // Payouts
  const payouts = db.partner_payouts ? db.partner_payouts.filter(p => p.partner_id === pId) : [];
  const totalPayouts = payouts.reduce((sum, p) => sum + (p.amount || 0), 0);
  
  // Assignments & Orders
  const assignments = db.request_assignments ? db.request_assignments.filter(a => a.partner_id === pId) : [];
  const distinctRequests = new Set(assignments.map(a => a.request_id));
  const totalOrders = distinctRequests.size;
  
  const requests = db.requests || [];
  let completedCount = 0;
  let partnerCancelledCount = 0;
  
  distinctRequests.forEach(reqId => {
    const r = requests.find(req => req.id === reqId);
    if (r) {
      if (r.status === 'completed') completedCount++;
      if (r.status === 'cancelled' && r.cancelled_by === 'partner') partnerCancelledCount++;
    }
  });
  
  const completionRate = totalOrders > 0 ? ((completedCount / totalOrders) * 100).toFixed(1) : 0;
  const cancellationRate = totalOrders > 0 ? ((partnerCancelledCount / totalOrders) * 100).toFixed(1) : 0;

  // Vehicle
  const vehicle = db.partner_vehicles ? db.partner_vehicles.find(v => v.partner_id === pId) : null;
  
  // Bank Account
  const bankAccount = db.partner_bank_accounts ? db.partner_bank_accounts.find(b => b.partner_id === pId && b.is_primary) : null;
  let maskedAccount = null;
  if (bankAccount && bankAccount.account_number) {
    maskedAccount = bankAccount.account_number.slice(-4).padStart(bankAccount.account_number.length, '*');
  }

  // Documents
  const documents = db.partner_documents ? db.partner_documents.filter(d => d.partner_id === pId) : [];
  const rcDoc = documents.find(d => d.document_type === 'rc');
  const insDoc = documents.find(d => d.document_type === 'insurance');
  const panDoc = documents.find(d => d.document_type === 'pan');
  const aadhaarDoc = documents.find(d => d.document_type === 'aadhaar' || d.document_type === 'id_proof');

  return {
    partner: {
      partnerId: profile ? profile.partner_code : (legacyPartner ? legacyPartner.id : pId),
      name: user.name,
      status: user.status || (profile ? profile.verification_status : legacyPartner.status),
      onlineStatus: (profile ? profile.online_status : null) || user.onlineStatus || (legacyPartner ? legacyPartner.onlineStatus : 'Offline'),
      profileImage: user.profileImage || user.profile_image || (legacyPartner ? legacyPartner.profileImage : null),
      mobileNumber: user.mobileNumber,
      email: user.email,
      joinedAt: user.joinedOn || (profile ? profile.joined_at : ''),
      location: profile ? profile.city : (legacyPartner ? legacyPartner.city : ''),
      rating: profile ? profile.rating_avg : 0,
      reviewCount: profile ? profile.rating_count : 0,
      totalOrders,
      totalEarnings,
      todayEarnings,
      completionRate: Number(completionRate),
      cancellationRate: Number(cancellationRate),
      lastActivityAt: '' // to be populated if needed
    },
    personalDetails: {
      dateOfBirth: profile ? profile.dateOfBirth : (legacyPartner ? legacyPartner.dateOfBirth : null),
      gender: profile ? profile.gender : (legacyPartner ? legacyPartner.gender : null),
      alternativeMobile: profile ? profile.alternateMobile : (legacyPartner ? legacyPartner.alternateMobile : null),
      emergencyContact: profile ? profile.emergencyContact : (legacyPartner ? legacyPartner.emergencyContact : null),
      emergencyMobile: profile ? profile.emergencyMobile : (legacyPartner ? legacyPartner.emergencyMobile : null),
      address: profile ? profile.address : (legacyPartner ? legacyPartner.address : null),
      panNumber: panDoc ? panDoc.document_number : (legacyPartner ? legacyPartner.panNumber : null),
      aadhaarNumber: aadhaarDoc ? aadhaarDoc.document_number : (legacyPartner ? legacyPartner.aadhaarNumber : null)
    },
    vehicle: {
      vehicleType: vehicle ? vehicle.vehicle_type : (legacyPartner ? legacyPartner.vehicleType : null),
      vehicleName: vehicle ? `${vehicle.make} ${vehicle.model}` : (legacyPartner ? legacyPartner.vehicleName : null),
      vehicleNumber: vehicle ? vehicle.registration_number : (legacyPartner ? legacyPartner.vehicleNumber : null),
      rcNumber: rcDoc ? rcDoc.document_number : (legacyPartner ? legacyPartner.rcNumber : null),
      insuranceProvider: vehicle?.insuranceProvider || vehicle?.insurance_provider || (legacyPartner ? legacyPartner.insuranceProvider : null),
      insuranceNumber: (insDoc ? insDoc.document_number : null) || vehicle?.insuranceNumber || vehicle?.insurance_number || (legacyPartner ? legacyPartner.insuranceNumber : null),
      validTill: (insDoc ? insDoc.expires_at : null) || vehicle?.insuranceValidTill || vehicle?.validTill || vehicle?.valid_till || (legacyPartner ? legacyPartner.insuranceValidTill : null)
    },
    earnings: {
      totalEarnings,
      thisWeek: 0, // Mock
      thisMonth: 0, // Mock
      totalPayouts
    },
    documents: documents,
    bankAccount: {
      bankName: bankAccount ? bankAccount.bank_name : (legacyPartner ? legacyPartner.bankName : null),
      accountNumber: bankAccount ? bankAccount.account_number : (legacyPartner ? legacyPartner.accountNumber : null),
      accountNumberMasked: maskedAccount || (legacyPartner ? legacyPartner.accountNumber.slice(-4).padStart(legacyPartner.accountNumber.length, '*') : null),
      ifscCode: bankAccount ? bankAccount.ifsc_code : (legacyPartner ? legacyPartner.ifscCode : null),
      accountHolderName: bankAccount ? bankAccount.account_holder_name : (legacyPartner ? legacyPartner.accountHolderName : null)
    }
  };
}

module.exports = { getPartnerAggregatedData };
