const fs = require('fs');

const dbPath = './db.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Initialize required tables if they don't exist
const requiredTables = [
  'customer_profiles',
  'addresses',
  'requests',
  'request_items',
  'request_status_history',
  'assignments',
  'wallets',
  'wallet_transactions'
];

requiredTables.forEach(t => {
  if (!db[t]) db[t] = [];
});

// Setup Customers
const custA = db.users.find(u => u.name === 'Deepa Rani') || db.users[1];
const custB = db.users.find(u => u.name === 'Meera Suresh') || db.users[2];

custA.public_id = "01ARZ3NDEKTSV4RRFFQ69GCUSTA";
custB.public_id = "01ARZ3NDEKTSV4RRFFQ69GCUSTB";

// Profiles
if (!db.customer_profiles.find(p => p.user_id === custA.id)) {
  db.customer_profiles.push({
    id: "CP_A",
    user_id: custA.id,
    date_of_birth: "1990-05-15",
    gender: "Female",
    profile_photo: "https://example.com/deepa.jpg"
  });
}

if (!db.customer_profiles.find(p => p.user_id === custB.id)) {
  db.customer_profiles.push({
    id: "CP_B",
    user_id: custB.id,
    date_of_birth: "1988-10-22",
    gender: "Female",
    profile_photo: "https://example.com/meera.jpg"
  });
}

// Addresses
if (!db.addresses.find(a => a.user_id === custA.id)) {
  db.addresses.push({
    id: "ADDR_A",
    public_id: "01ARZ3NDEKTSV4RRFFQ69GADDRA",
    user_id: custA.id,
    label: "Home",
    address_line1: "12 Trichy Road",
    city: "Trichy",
    latitude: 10.7905,
    longitude: 78.7047,
    is_default: true
  });
}

// Setup a Partner
const partner = db.partners && db.partners.length > 0 ? db.partners[0] : { id: "DVP12565", name: "Murugan K" };

// Requests & Orders
if (!db.requests.find(r => r.user_id === custA.id)) {
  db.requests.push({
    id: "REQ_A",
    public_id: "01ARZ3NDEKTSV4RRFFQ69GREQA",
    user_id: custA.id,
    service_type: "BUY_GET",
    status: "ON_THE_WAY",
    amount: 150,
    created_at: new Date().toISOString()
  });
  
  db.request_items.push({
    id: "RITEM_A",
    request_id: "REQ_A",
    name: "Milk 1L",
    quantity: 2,
    amount: 50
  });

  db.assignments.push({
    id: "ASSN_A",
    request_id: "REQ_A",
    partner_id: partner.id
  });
}

if (!db.requests.find(r => r.user_id === custB.id)) {
  db.requests.push({
    id: "REQ_B",
    public_id: "01ARZ3NDEKTSV4RRFFQ69GREQB",
    user_id: custB.id,
    service_type: "FOOD",
    status: "COMPLETED",
    amount: 250,
    created_at: new Date().toISOString()
  });
}

// Wallets
if (!db.wallets.find(w => w.user_id === custA.id)) {
  db.wallets.push({
    id: "WAL_A",
    public_id: "01ARZ3NDEKTSV4RRFFQ69GWALA",
    user_id: custA.id,
    balance: 500
  });

  db.wallet_transactions.push({
    id: "WTXN_A1",
    wallet_id: "WAL_A",
    type: "CREDIT",
    amount: 1000,
    status: "SUCCESS",
    created_at: new Date().toISOString()
  });
  db.wallet_transactions.push({
    id: "WTXN_A2",
    wallet_id: "WAL_A",
    type: "DEBIT",
    amount: 500,
    status: "SUCCESS",
    created_at: new Date().toISOString()
  });
}

if (!db.wallets.find(w => w.user_id === custB.id)) {
  db.wallets.push({
    id: "WAL_B",
    public_id: "01ARZ3NDEKTSV4RRFFQ69GWALB",
    user_id: custB.id,
    balance: 120
  });
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('Database seeded for Customer A and B successfully.');
