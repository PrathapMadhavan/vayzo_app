const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../db.json');
const ORIGINAL_BACKUP_PATH = path.join(__dirname, '../db.backup.1788895081114.json');
const BACKUP_PATH = path.join(__dirname, `../db.backup.${Date.now()}.json`);
const REPORT_PATH = path.join(__dirname, '../migration_report.json');
const UNRESOLVED_PATH = path.join(__dirname, '../unresolved_relationships.json');

function normalize(str) {
  return str ? str.toString().trim() : '';
}

function isDeepEqual(obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

function countOccurrences(str, substring) {
  return str.split(substring).length - 1;
}

function runMigration() {
  console.log('Starting VAYZO Phase 2A Migration Correction...');

  const reports = {
    sourceFileUsed: DB_PATH,
    originalPreMigrationBackupVerified: 'NO',
    freshBackupCreated: 'NO',
    sourceCounts: {},
    targetCounts: {},
    deduplicatedRecords: 0,
    preservedCounts: {},
    transformedCounts: {},
    successfulRelationships: { customer: 0, restaurant: 0, partner: 0 },
    unresolvedRelationships: { customer: 0, restaurant: 0, partner: 0 },
    ambiguousRelationships: { customer: 0, restaurant: 0, partner: 0 },
    idUniquenessValidation: [],
    foreignKeyValidationResults: {
      requestFKs: 'PENDING',
      partnerFKs: 'PENDING',
      rideFKs: 'PENDING'
    },
    statusMappingWarnings: [],
    imageSafetyValidation: '',
    warnings: [],
    errors: [],
    dbJsonModified: false
  };

  if (!fs.existsSync(DB_PATH)) {
    console.error('db.json not found!');
    process.exit(1);
  }
  
  const dbDataRaw = fs.readFileSync(DB_PATH, 'utf-8');
  let originalRaw = '';
  if (fs.existsSync(ORIGINAL_BACKUP_PATH)) {
    originalRaw = fs.readFileSync(ORIGINAL_BACKUP_PATH, 'utf-8');
  }

  // Verify that current db.json matches the original backup exactly
  if (originalRaw && isDeepEqual(JSON.parse(dbDataRaw), JSON.parse(originalRaw))) {
    reports.originalPreMigrationBackupVerified = 'YES';
  } else {
    reports.errors.push('CRITICAL: db.json does not match the original pre-migration backup state.');
    console.error('CRITICAL: db.json does not match original backup. Aborting.');
    process.exit(1);
  }

  fs.writeFileSync(BACKUP_PATH, dbDataRaw);
  reports.freshBackupCreated = 'YES';
  console.log(`New backup created at: ${BACKUP_PATH}`);

  let db = JSON.parse(dbDataRaw);
  const unresolved = [];

  Object.keys(db).forEach(key => {
    if (Array.isArray(db[key])) {
      reports.sourceCounts[key] = db[key].length;
      reports.preservedCounts[key] = db[key].length;
    }
  });

  const targetDb = {
    ...db,
    users: db.users || [],
    partners: [],
    partner_documents: [],
    partner_vehicles: [],
    partner_bank_accounts: [],
    restaurants: db.restaurants || [],
    restaurant_categories: db.restaurant_categories || [],
    restaurant_products: db.restaurant_products || [],
    requests: [],
    request_items: db.request_items || [],
    request_pickups: db.request_pickups || [],
    request_status_history: db.request_status_history || [],
    rides: db.rides || [],
    ride_locations: db.ride_locations || [],
    payments: db.payments || [],
    wallets: db.wallets || [],
    wallet_transactions: db.wallet_transactions || [],
    partner_earnings: db.partner_earnings || [],
    partner_payouts: db.partner_payouts || [],
    adminUsers: db.adminUsers || [],
    roles: db.roles || [],
    permissions: db.permissions || [],
  };

  const usersMap = new Map();
  const restaurantsMap = new Map();
  const partnersMap = new Map();

  targetDb.users.forEach(u => {
    if (u.name) {
      const norm = normalize(u.name);
      if (!usersMap.has(norm)) usersMap.set(norm, []);
      usersMap.get(norm).push(u.userId || u.id);
    }
  });

  targetDb.restaurants.forEach(r => {
    if (r.name) {
      const norm = normalize(r.name);
      if (!restaurantsMap.has(norm)) restaurantsMap.set(norm, []);
      restaurantsMap.get(norm).push(r.id);
    }
  });

  const oldPartners = db.deliveryPartners || [];
  const processedPartnerIds = new Map();
  
  oldPartners.forEach(p => {
    const pId = p.partnerId || p.id;
    
    if (processedPartnerIds.has(pId)) {
      const existing = processedPartnerIds.get(pId);
      if (isDeepEqual(existing, p)) {
        reports.deduplicatedRecords++;
        reports.warnings.push(`Skipped exact duplicate delivery partner with ID: ${pId}`);
        return;
      } else {
        reports.warnings.push(`ID Collision for partner ${pId} but objects differ!`);
      }
    }
    processedPartnerIds.set(pId, p);
    
    if (p.name) {
      const norm = normalize(p.name);
      if (!partnersMap.has(norm)) partnersMap.set(norm, []);
      partnersMap.get(norm).push(pId);
    }

    let aStatus = p.status;
    if (p.status === 'Active') aStatus = 'ACTIVE';
    else if (p.status === 'Blocked') aStatus = 'BLOCKED';
    else {
      reports.statusMappingWarnings.push(`Partner ${pId} unmapped accountStatus: ${p.status}`);
    }

    let availStatus = p.onlineStatus;
    if (p.onlineStatus === 'Online') availStatus = 'ONLINE';
    else if (p.onlineStatus === 'Offline') availStatus = 'OFFLINE';
    else if (p.onlineStatus === 'Busy') availStatus = 'BUSY';
    else {
      reports.statusMappingWarnings.push(`Partner ${pId} unmapped onlineStatus: ${p.onlineStatus}`);
    }

    targetDb.partners.push({
      partnerId: pId,
      name: p.name,
      mobileNumber: p.mobileNumber,
      alternateMobile: p.alternateMobile,
      email: p.email,
      gender: p.gender,
      dateOfBirth: p.dateOfBirth,
      address: p.address,
      emergencyContact: p.emergencyContact,
      emergencyMobile: p.emergencyMobile,
      rating: p.rating,
      verificationStatus: p.verificationStatus || 'MISSING_REQUIREMENT',
      accountStatus: aStatus || 'MISSING_REQUIREMENT',
      availabilityStatus: availStatus || 'MISSING_REQUIREMENT',
      partnerTypes: p.partnerTypes || [],
      city: p.city,
      joinedOn: p.joinedOn,
      ordersCompleted: p.ordersCompleted,
      earnings: p.earnings,
      todayEarnings: p.todayEarnings
    });

    if (p.aadhaarNumber || p.panNumber) {
      if (p.aadhaarNumber) targetDb.partner_documents.push({ documentId: `DOC_${pId}_AADHAAR`, partnerId: pId, type: 'AADHAAR', value: p.aadhaarNumber });
      if (p.panNumber) targetDb.partner_documents.push({ documentId: `DOC_${pId}_PAN`, partnerId: pId, type: 'PAN', value: p.panNumber });
    }

    if (p.vehicleType || p.vehicleNumber) {
      targetDb.partner_vehicles.push({
        vehicleId: `VEH_${pId}`,
        partnerId: pId,
        type: p.vehicleType,
        name: p.vehicleName,
        number: p.vehicleNumber,
        rcNumber: p.rcNumber,
        insuranceProvider: p.insuranceProvider,
        insuranceNumber: p.insuranceNumber,
        insuranceValidTill: p.insuranceValidTill
      });
    }

    if (p.bankName || p.accountNumber) {
      targetDb.partner_bank_accounts.push({
        bankAccountId: `BANK_${pId}`,
        partnerId: pId,
        bankName: p.bankName,
        accountNumber: p.accountNumber,
        ifscCode: p.ifscCode,
        accountHolderName: p.accountHolderName
      });
    }
  });

  reports.transformedCounts['deliveryPartners -> partners'] = targetDb.partners.length;

  const oldOrders = db.orders || [];
  const processedOrderIds = new Set();

  oldOrders.forEach(o => {
    const oId = o.orderId || o.id;
    if (processedOrderIds.has(oId)) {
      reports.deduplicatedRecords++;
      reports.warnings.push(`Skipped exact duplicate order with ID: ${oId}`);
      return;
    }
    processedOrderIds.add(oId);

    let rStatus = o.status;
    if (o.status === 'DELIVERED') rStatus = 'COMPLETED';
    else {
      reports.statusMappingWarnings.push(`Order ${oId} unmapped status: ${o.status}`);
    }

    let payStatus = o.paymentStatus;
    if (o.paymentStatus === 'PAID') payStatus = 'SUCCESS';
    else {
      reports.statusMappingWarnings.push(`Order ${oId} unmapped paymentStatus: ${o.paymentStatus}`);
    }

    const req = {
      requestId: oId,
      serviceType: 'FOOD',
      amount: o.amount,
      orderDate: o.orderDate,
      city: o.city,
      status: rStatus || 'MISSING_REQUIREMENT',
      paymentStatus: payStatus || 'MISSING_REQUIREMENT'
    };

    if (o.customerName) {
      const norm = normalize(o.customerName);
      const matches = usersMap.get(norm) || [];
      if (matches.length === 1) {
        req.customerId = matches[0];
        reports.successfulRelationships.customer++;
      } else {
        const issue = matches.length === 0 ? 'MISSING' : 'AMBIGUOUS';
        if (issue === 'AMBIGUOUS') reports.ambiguousRelationships.customer++;
        else reports.unresolvedRelationships.customer++;
        unresolved.push({ recordType: 'order', recordId: req.requestId, relationship: 'customer', sourceValue: o.customerName, issue });
      }
    } else {
      reports.unresolvedRelationships.customer++;
      unresolved.push({ recordType: 'order', recordId: req.requestId, relationship: 'customer', sourceValue: null, issue: 'MISSING' });
    }

    if (o.restaurantName) {
      const norm = normalize(o.restaurantName);
      const matches = restaurantsMap.get(norm) || [];
      if (matches.length === 1) {
        req.restaurantId = matches[0];
        reports.successfulRelationships.restaurant++;
      } else {
        const issue = matches.length === 0 ? 'MISSING' : 'AMBIGUOUS';
        if (issue === 'AMBIGUOUS') reports.ambiguousRelationships.restaurant++;
        else reports.unresolvedRelationships.restaurant++;
        unresolved.push({ recordType: 'order', recordId: req.requestId, relationship: 'restaurant', sourceValue: o.restaurantName, issue });
      }
    } else {
      reports.unresolvedRelationships.restaurant++;
      unresolved.push({ recordType: 'order', recordId: req.requestId, relationship: 'restaurant', sourceValue: null, issue: 'MISSING' });
    }

    if (o.deliveryPartner) {
      const norm = normalize(o.deliveryPartner);
      const matches = partnersMap.get(norm) || [];
      if (matches.length === 1) {
        req.partnerId = matches[0];
        reports.successfulRelationships.partner++;
      } else {
        const issue = matches.length === 0 ? 'MISSING' : 'AMBIGUOUS';
        if (issue === 'AMBIGUOUS') reports.ambiguousRelationships.partner++;
        else reports.unresolvedRelationships.partner++;
        unresolved.push({ recordType: 'order', recordId: req.requestId, relationship: 'partner', sourceValue: o.deliveryPartner, issue });
      }
    } else {
      reports.unresolvedRelationships.partner++;
      unresolved.push({ recordType: 'order', recordId: req.requestId, relationship: 'partner', sourceValue: null, issue: 'MISSING' });
    }

    targetDb.requests.push(req);
  });

  reports.transformedCounts['orders -> requests'] = targetDb.requests.length;

  Object.keys(targetDb).forEach(key => {
    if (Array.isArray(targetDb[key])) {
      reports.targetCounts[key] = targetDb[key].length;
    }
  });

  let isValid = true;

  // Image validation
  const oldDbString = JSON.stringify(db);
  const newDbString = JSON.stringify(targetDb);
  
  const oldBase64 = countOccurrences(oldDbString, 'data:image/');
  const newBase64 = countOccurrences(newDbString, 'data:image/');
  const oldBlob = countOccurrences(oldDbString, 'blob:');
  const newBlob = countOccurrences(newDbString, 'blob:');
  
  if (newBase64 > oldBase64 || newBlob > oldBlob) {
    isValid = false;
    reports.imageSafetyValidation = 'FAILED: Introduced base64 or blob URL data.';
    reports.errors.push(`Image validation failed. Base64 (${oldBase64}->${newBase64}) or Blob (${oldBlob}->${newBlob}) URLs introduced.`);
  } else {
    reports.imageSafetyValidation = `SUCCESS: No base64 or blob URLs introduced.`;
  }

  // FK Validation
  const validUserIds = new Set(targetDb.users.map(u => u.userId || u.id));
  const validRestaurantIds = new Set(targetDb.restaurants.map(r => r.id));
  const validPartnerIds = new Set(targetDb.partners.map(p => p.partnerId || p.id));
  const validRequestIds = new Set(targetDb.requests.map(r => r.requestId || r.id));
  const validRideIds = new Set(targetDb.rides.map(r => r.rideId || r.id));

  let reqFKErrors = [];
  let partnerFKErrors = [];
  let rideFKErrors = [];

  targetDb.requests.forEach(req => {
    if (req.customerId && !validUserIds.has(req.customerId)) reqFKErrors.push(`Request ${req.requestId} invalid customerId ${req.customerId}`);
    if (req.restaurantId && !validRestaurantIds.has(req.restaurantId)) reqFKErrors.push(`Request ${req.requestId} invalid restaurantId ${req.restaurantId}`);
    if (req.partnerId && !validPartnerIds.has(req.partnerId)) reqFKErrors.push(`Request ${req.requestId} invalid partnerId ${req.partnerId}`);
  });

  targetDb.partner_documents.forEach(d => {
    if (d.partnerId && !validPartnerIds.has(d.partnerId)) partnerFKErrors.push(`Document ${d.documentId} invalid partnerId ${d.partnerId}`);
  });
  targetDb.partner_vehicles.forEach(v => {
    if (v.partnerId && !validPartnerIds.has(v.partnerId)) partnerFKErrors.push(`Vehicle ${v.vehicleId} invalid partnerId ${v.partnerId}`);
  });
  targetDb.partner_bank_accounts.forEach(b => {
    if (b.partnerId && !validPartnerIds.has(b.partnerId)) partnerFKErrors.push(`Bank ${b.bankAccountId} invalid partnerId ${b.partnerId}`);
  });

  targetDb.rides.forEach(r => {
    if (r.requestId && !validRequestIds.has(r.requestId)) rideFKErrors.push(`Ride ${r.id} invalid requestId ${r.requestId}`);
  });
  targetDb.ride_locations.forEach(rl => {
    if (rl.rideId && !validRideIds.has(rl.rideId)) rideFKErrors.push(`RideLocation ${rl.id} invalid rideId ${rl.rideId}`);
  });

  if (reqFKErrors.length > 0) {
    isValid = false;
    reports.foreignKeyValidationResults.requestFKs = `FAILED: ${reqFKErrors.length} errors`;
    reports.errors.push(...reqFKErrors);
  } else {
    reports.foreignKeyValidationResults.requestFKs = 'SUCCESS: 0 errors';
  }

  if (partnerFKErrors.length > 0) {
    isValid = false;
    reports.foreignKeyValidationResults.partnerFKs = `FAILED: ${partnerFKErrors.length} errors`;
    reports.errors.push(...partnerFKErrors);
  } else {
    reports.foreignKeyValidationResults.partnerFKs = 'SUCCESS: 0 errors';
  }

  if (rideFKErrors.length > 0) {
    isValid = false;
    reports.foreignKeyValidationResults.rideFKs = `FAILED: ${rideFKErrors.length} errors`;
    reports.errors.push(...rideFKErrors);
  } else {
    reports.foreignKeyValidationResults.rideFKs = 'SUCCESS: 0 errors';
  }

  // ID Uniqueness Validation for ALL Collections
  let uniquenessErrors = [];
  const checkUniqueness = (coll, idField) => {
    if (!targetDb[coll]) return;
    const ids = new Set();
    targetDb[coll].forEach(item => {
      const id = item[idField] || item.id;
      if (id) {
        if (ids.has(id)) {
          isValid = false;
          uniquenessErrors.push(`Duplicate ID found in ${coll}: ${id}`);
        }
        ids.add(id);
      }
    });
  };

  const idMap = {
    users: 'userId',
    partners: 'partnerId',
    partner_documents: 'documentId',
    partner_vehicles: 'vehicleId',
    partner_bank_accounts: 'bankAccountId',
    restaurants: 'id',
    restaurant_categories: 'id',
    restaurant_products: 'id',
    requests: 'requestId',
    request_items: 'id',
    request_pickups: 'id',
    request_status_history: 'id',
    rides: 'id',
    ride_locations: 'id',
    payments: 'id',
    wallets: 'id',
    wallet_transactions: 'id',
    partner_earnings: 'id',
    partner_payouts: 'id',
    adminUsers: 'id',
    roles: 'id',
    permissions: 'id'
  };

  Object.keys(idMap).forEach(coll => checkUniqueness(coll, idMap[coll]));

  if (uniquenessErrors.length > 0) {
    reports.idUniquenessValidation = ['FAILED'].concat(uniquenessErrors);
    reports.errors.push(...uniquenessErrors);
  } else {
    reports.idUniquenessValidation = ['SUCCESS: All IDs in populated collections are unique.'];
  }

  if (isValid) {
    fs.writeFileSync(DB_PATH, JSON.stringify(targetDb, null, 2));
    reports.dbJsonModified = true;
    console.log('Validation SUCCESS. db.json modified.');
  } else {
    console.error('Validation FAILED. DB not modified.');
  }

  fs.writeFileSync(REPORT_PATH, JSON.stringify(reports, null, 2));
  fs.writeFileSync(UNRESOLVED_PATH, JSON.stringify(unresolved, null, 2));
  
  console.log(`Report generated at: ${REPORT_PATH}`);
  console.log(`Unresolved relationships at: ${UNRESOLVED_PATH}`);
}

runMigration();
