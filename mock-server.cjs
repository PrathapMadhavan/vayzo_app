const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();  

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Utility to get authenticated user ID based on token
function getAuthenticatedUserId(req) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const token = auth.split(' ')[1];
  if (token === 'TOKEN_CUSTA') return "UFt__KjoFIQ"; // Deepa's internal ID
  if (token === 'TOKEN_CUSTB') return "xwLm2deEz3g"; // Meera's internal ID
  return null;
}

// 1. AUTHENTICATION ENDPOINTS
server.post('/api/v1/auth/send-otp', (req, res) => {
  res.json({
    success: true,
    message: "OTP sent successfully",
    data: { verificationId: "VER123", expiresIn: 120 }
  });
});

server.post('/api/v1/auth/verify-otp', (req, res) => {
  const { mobileNumber } = req.body;
  let token = null;
  let user = null;
  const db = router.db.getState();
  
  if (mobileNumber === '+919876543213') { // Deepa
    token = 'TOKEN_CUSTA';
    user = db.users.find(u => u.id === 'UFt__KjoFIQ');
  } else if (mobileNumber === '+919876543215') { // Meera
    token = 'TOKEN_CUSTB';
    user = db.users.find(u => u.id === 'xwLm2deEz3g');
  } else {
    return res.status(401).json({ success: false, message: "Invalid OTP or User" });
  }

  res.json({
    success: true,
    message: "OTP verified successfully",
    data: {
      accessToken: token,
      user: {
        customerId: user.public_id,
        name: user.name,
        mobileNumber: user.mobileNumber
      }
    }
  });
});

server.post('/api/v1/auth/register', (req, res) => {
  res.json({ success: true, message: "Not required for test flow" });
});

server.post('/api/v1/auth/logout', (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

// 1.5 ADMIN AUTHENTICATION ENDPOINTS
server.post('/api/v1/admin/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = router.db.getState();
  
  const admin = db.adminUsers.find(u => u.email === email);
  if (!admin) {
    return res.status(404).json({ success: false, message: "Invalid email or password" });
  }
  if (admin.password !== password) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }
  if (admin.status !== "Active" && admin.status !== "ACTIVE") {
    return res.status(403).json({ success: false, message: "Admin account is not active." });
  }

  const token = `vayzo_admin_${Math.random().toString(36).substr(2, 9)}`;

  res.json({
    success: true,
    message: "Login successful",
    data: {
      accessToken: token,
      tokenType: "Bearer",
      user: admin
    }
  });
});

server.post('/api/v1/admin/auth/send-otp', (req, res) => {
  const { mobileNumber } = req.body;
  const db = router.db.getState();
  
  const admin = db.adminUsers.find(u => u.phone === mobileNumber || u.mobileNumber === mobileNumber);
  if (!admin) {
    return res.status(404).json({ success: false, message: "Admin account not found. Please check your mobile number." });
  }
  
  if (admin.status !== "Active" && admin.status !== "ACTIVE") {
    return res.status(403).json({ success: false, message: "Admin account is not active." });
  }

  res.json({
    success: true,
    message: "OTP sent successfully"
  });
});

server.post('/api/v1/admin/auth/verify-otp', (req, res) => {
  const { mobileNumber, otp } = req.body;
  
  if (otp !== '123456') {
    return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });
  }

  const db = router.db.getState();
  const admin = db.adminUsers.find(u => u.phone === mobileNumber || u.mobileNumber === mobileNumber);
  
  if (!admin) {
    return res.status(404).json({ success: false, message: "Admin account not found." });
  }

  const token = `vayzo_admin_${Math.random().toString(36).substr(2, 9)}`;

  res.json({
    success: true,
    message: "Login successful",
    data: {
      accessToken: token,
      tokenType: "Bearer",
      user: admin
    }
  });
});

server.post('/api/v1/admin/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  const db = router.db.getState();
  
  const admin = db.adminUsers.find(u => u.email === email);
  if (!admin) {
    return res.status(404).json({ success: false, message: "Email not registered as an Admin. Please check the email address." });
  }
  
  if (admin.status !== "Active" && admin.status !== "ACTIVE") {
    return res.status(403).json({ success: false, message: "Admin account is not active." });
  }

  res.json({
    success: true,
    message: "Reset link sent successfully"
  });
});

// ADMIN AUTH MIDDLEWARE
server.use((req, res, next) => {
  // If request is for an admin endpoint and not auth, require token
  const isAdminEndpoint = req.path.startsWith('/adminUsers') || (req.path.startsWith('/api/v1/admin') && !req.path.includes('/auth'));
  
  if (isAdminEndpoint) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer vayzo_admin_')) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
  }
  
  next();
});

// 2. PROFILE ENDPOINT
server.get('/api/v1/customer/profile', (req, res) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  const db = router.db.getState();
  const user = db.users.find(u => u.id === userId);
  const profile = db.customer_profiles.find(p => p.user_id === userId) || {};

  res.json({
    success: true,
    data: {
      customerId: user.public_id,
      name: user.name,
      email: user.email,
      mobileNumber: user.mobileNumber,
      profileImage: profile.profile_photo,
      dateOfBirth: profile.date_of_birth,
      gender: profile.gender
    }
  });
});

server.put('/api/v1/customer/profile', (req, res) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  const db = router.db.getState();
  const user = db.users.find(u => u.id === userId);
  const profile = db.customer_profiles.find(p => p.user_id === userId) || {};

  // Mock update
  if (req.body.name) user.name = req.body.name;
  if (req.body.email) user.email = req.body.email;
  
  router.db.write(); // save

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: {
      customerId: user.public_id,
      name: user.name,
      email: user.email
    }
  });
});

// OWNERSHIP MIDDLEWARE FOR PROFILE/AUTH IS ALREADY HANDLED

// Explicit endpoints for Requests and Wallets to guarantee filtering
server.get('/api/v1/requests', (req, res) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  const db = router.db.getState();
  const userRequests = db.requests.filter(r => r.user_id === userId);
  
  // Embed relationships manually
  const result = userRequests.map(r => ({
    ...r,
    request_items: db.request_items.filter(i => i.request_id === r.id),
    assignments: db.assignments.filter(a => a.request_id === r.id)
  }));

  res.json(result);
});

server.get('/api/v1/requests/:id', (req, res) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  const db = router.db.getState();
  const r = db.requests.find(r => r.public_id === req.params.id || r.id === req.params.id);
  if (!r || r.user_id !== userId) return res.status(404).json({});
  
  res.json({
    ...r,
    request_items: db.request_items.filter(i => i.request_id === r.id),
    assignments: db.assignments.filter(a => a.request_id === r.id)
  });
});

server.get('/api/v1/wallet', (req, res) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  const db = router.db.getState();
  const wallet = db.wallets.find(w => w.user_id === userId);
  if (!wallet) return res.status(404).json({});

  // Embed transactions manually
  const transactions = db.wallet_transactions.filter(t => t.wallet_id === wallet.id);
  res.json({ ...wallet, transactions });
});

server.get('/api/v1/wallet/transactions', (req, res) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  const db = router.db.getState();
  const wallet = db.wallets.find(w => w.user_id === userId);
  if (!wallet) return res.json([]);

  const transactions = db.wallet_transactions.filter(t => t.wallet_id === wallet.id);
  res.json(transactions);
});

const { getPartnerAggregatedData } = require('./partner-aggregation.cjs');

server.get('/api/v1/admin/partners/:id', (req, res) => {
  const db = router.db.getState();
  const data = getPartnerAggregatedData(db, req.params.id);
  if (!data) return res.status(404).json({ success: false, message: "Partner not found" });
  res.json({ success: true, data });
});

server.get('/api/v1/admin/partners/:id/documents', (req, res) => {
  const db = router.db.getState();
  const data = getPartnerAggregatedData(db, req.params.id);
  if (!data) return res.status(404).json({ success: false, message: "Partner not found" });
  res.json({ success: true, data: data.documents });
});

server.get('/api/v1/admin/partners/:id/activity', (req, res) => {
  const db = router.db.getState();
  const pId = req.params.id;
  
  const profile = db.partner_profiles ? db.partner_profiles.find(p => p.id === pId || p.partner_code === pId) : null;
  const internalId = profile ? profile.id : pId;
  
  let activities = [];
  const assignments = db.request_assignments ? db.request_assignments.filter(a => a.partner_id === internalId) : [];
  const requestIds = assignments.map(a => a.request_id);
  
  if (db.request_status_history) {
    const history = db.request_status_history.filter(h => requestIds.includes(h.request_id));
    activities = history.map(h => ({
      id: h.id,
      type: 'REQUEST_STATUS',
      action: h.status,
      timestamp: h.created_at,
      details: `Request ${h.request_id} changed to ${h.status}`
    }));
  }
  
  if (db.partner_earnings) {
    const earnings = db.partner_earnings.filter(e => e.partner_id === internalId);
    activities.push(...earnings.map(e => ({
      id: e.id,
      type: 'EARNING',
      action: 'Earned',
      timestamp: e.earned_at || e.created_at || new Date().toISOString(),
      details: `Earned ₹${e.net_amount}`
    })));
  }

  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  res.json({ success: true, data: { content: activities } });
});

server.get('/api/v1/admin/partners/:id/reviews', (req, res) => {
  const db = router.db.getState();
  const pId = req.params.id; 
  const profile = db.partner_profiles ? db.partner_profiles.find(p => p.id === pId || p.partner_code === pId) : null;
  const internalId = profile ? profile.id : pId;
  
  const reviews = db.ratings_reviews ? db.ratings_reviews.filter(r => r.partner_id === internalId) : [];
  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;
  
  res.json({ success: true, data: { summary: { averageRating: avg, reviewCount: reviews.length }, reviews } });
});

// REWRITE RULES for ratings and new admin endpoints
server.use(jsonServer.rewriter({
  '/api/v1/admin/customers/*': '/users/$1',
  '/api/v1/admin/customers': '/users',
  '/api/v1/admin/requests/*': '/requests/$1',
  '/api/v1/admin/requests': '/requests',
  '/api/v1/admin/finance/payments/*': '/payments/$1',
  '/api/v1/admin/finance/payments': '/payments',
  '/api/v1/admin/finance/wallets/*': '/wallets/$1',
  '/api/v1/admin/finance/wallets': '/wallets',
  '/api/v1/admin/finance/wallet-transactions/*': '/wallet_transactions/$1',
  '/api/v1/admin/finance/wallet-transactions': '/wallet_transactions',
  '/api/v1/admin/finance/partner-earnings/*': '/partner_earnings/$1',
  '/api/v1/admin/finance/partner-earnings': '/partner_earnings',
  '/api/v1/admin/finance/partner-payouts/*': '/partner_payouts/$1',
  '/api/v1/admin/finance/partner-payouts': '/partner_payouts',
  '/api/v1/admin/finance/earnings/*': '/earnings/$1',
  '/api/v1/admin/finance/earnings': '/earnings',
  '/api/v1/admin/admin-users/*': '/adminUsers/$1',
  '/api/v1/admin/admin-users': '/adminUsers',
  '/api/v1/admin/partners/*': '/partners/$1',
  '/api/v1/admin/partners': '/partners',
  '/api/v1/admin/restaurants/*': '/restaurants/$1',
  '/api/v1/admin/restaurants': '/restaurants',
  '/api/v1/admin/support/*': '/complaints/$1',
  '/api/v1/admin/support': '/complaints',
  '/api/v1/admin/dashboard/*': '/dashboard/$1',
  '/api/v1/admin/dashboard': '/dashboard',
  '/api/v1/admin/offers/*': '/offers/$1',
  '/api/v1/admin/offers': '/offers',
  '/api/v1/admin/locations/*': '/locations/$1',
  '/api/v1/admin/locations': '/locations',
  '/api/v1/admin/reports-summary/*': '/reportsSummary/$1',
  '/api/v1/admin/reports-summary': '/reportsSummary',
  '/api/v1/admin/reports/*': '/reports/$1',
  '/api/v1/admin/reports': '/reports',
  '/api/v1/admin/categories/*': '/categories/$1',
  '/api/v1/admin/categories': '/categories',
  '/api/v1/admin/activity-logs/*': '/activityLogs/$1',
  '/api/v1/admin/activity-logs': '/activityLogs',
  '/api/v1/admin/partner-documents/*': '/partner_documents/$1',
  '/api/v1/admin/partner-documents': '/partner_documents',
  '/api/v1/admin/partner-vehicles/*': '/partner_vehicles/$1',
  '/api/v1/admin/partner-vehicles': '/partner_vehicles',
  '/api/v1/admin/partner-bank-accounts/*': '/partner_bank_accounts/$1',
  '/api/v1/admin/partner-bank-accounts': '/partner_bank_accounts',
  '/api/v1/ratings': '/ratings'
}));

// Use default router
server.use(router);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
});
