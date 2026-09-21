// mockServer.js
// Small handcrafted mock auth layer wrapping json-server
// Provides OTP‑first login and Bearer token validation for Admin APIs

import jsonServer from 'json-server';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import { ulid } from 'ulid';
import multer from 'multer';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${ulid()}${ext}`);
  }
});
const upload = multer({ storage: storage });

const SERVER_PORT = process.env.PORT || 3000;
const SECRET_KEY = 'vayzo-secret-dev'; // simple secret for mock environment
const OTP_CODE = '123456'; // Development OTP

const app = express();
app.use(cors());

const middlewares = jsonServer.defaults({ static: __dirname, bodyParser: false });
app.use(middlewares);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Fix for json-server stream consumed error
app.use((req, res, next) => {
  if (req.body) {
    req._body = true;
  }
  next();
});

// Load db.json via json-server router
const router = jsonServer.router(path.join(__dirname, 'db.json'));


// Helper to find Admin user by mobile number
function findAdminByMobile(mobile) {
  const users = router.db.get('users').value() || [];
  const adminUsers = router.db.get('adminUsers').value() || [];
  
  const normalized = mobile.replace(/\D/g, '').slice(-10); // get last 10 digits
  if (!normalized) return null;
  
  let admin = users.find(u => {
    if (!u.mobileNumber || u.role !== 'Admin') return false;
    return String(u.mobileNumber).replace(/\D/g, '').slice(-10) === normalized;
  });
  
  if (!admin) {
    admin = adminUsers.find(u => {
      if (!u.mobileNumber && !u.phone) return false;
      const dbMobile = String(u.mobileNumber || u.phone).replace(/\D/g, '').slice(-10);
      return dbMobile === normalized;
    });
  }
  return admin;
}

// Helper to find Admin user by email
function findAdminByEmail(email) {
  const users = router.db.get('users').value() || [];
  const adminUsers = router.db.get('adminUsers').value() || [];
  
  let admin = users.find(u => u.email === email && u.role === 'Admin');
  if (!admin) {
    admin = adminUsers.find(u => u.email === email);
  }
  return admin;
}

// POST /api/v1/admin/auth/send-otp
app.post('/api/v1/admin/auth/send-otp', (req, res) => {
  const mobileNumber = req.body.mobileNumber || req.body.email;
  if (!mobileNumber) {
    return res.status(400).json({ success: false, message: 'Mobile number is required' });
  }
  const admin = findAdminByMobile(mobileNumber) || findAdminByEmail(mobileNumber);
  if (!admin) {
    return res.status(404).json({ success: false, message: 'Admin not found' });
  }
  return res.json({ success: true, message: 'OTP sent', data: { otp: OTP_CODE } });
});

// POST /api/v1/admin/auth/login
app.post('/api/v1/admin/auth/login', (req, res) => {
  // Add robust logging for debugging what the frontend actually sends
  console.log('\n--- LOGIN ATTEMPT ---');
  console.log('Request Body:', req.body);
  
  // frontend authApi.js sends { email, password } for login
  const rawEmail = req.body.mobileNumber || req.body.email;
  const rawOtp = req.body.otp || req.body.password;
  console.log('Parsed Email:', rawEmail);
  console.log('Parsed Password:', rawOtp);
  
  const mobileNumber = String(rawEmail || "").trim();
  const otp = String(rawOtp || "").trim();
  
  if (!mobileNumber || !otp) {
    console.log('Failed: Missing credentials');
    return res.status(400).json({ success: false, message: 'email and password are required' });
  }
  let admin = findAdminByMobile(mobileNumber) || findAdminByEmail(mobileNumber);

  // Return 401 Unauthorized for ANY credential failure to avoid 404 Not Found errors
  if (!admin) {
    console.log('Failed: Admin not found');
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  
  // Verify OTP or Password
  const isValidOtp = otp === OTP_CODE;
  const isValidPassword = admin.password && otp === admin.password;
  
  if (!isValidOtp && !isValidPassword) {
    console.log('Failed: Invalid password/OTP');
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  
  console.log('Success: Admin authenticated');
  
  // Generate JWT containing minimal admin info
  const tokenPayload = { id: admin.id, role: 'Admin', name: admin.name, email: admin.email, mobileNumber: admin.mobileNumber || admin.phone };
  const accessToken = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: '1h' });
  const response = {
    success: true,
    message: 'Login successful',
    data: {
      accessToken,
      tokenType: 'Bearer',
      user: tokenPayload
    }
  };
  return res.json(response);
});

// Alias for verify-otp (used by the frontend)
app.post('/api/v1/admin/auth/verify-otp', (req, res) => {
  const { mobileNumber, otp } = req.body;
  if (!mobileNumber || !otp) {
    return res.status(400).json({ success: false, message: 'mobileNumber and otp are required' });
  }
  const admin = findAdminByMobile(mobileNumber) || findAdminByEmail(mobileNumber);
  if (!admin) {
    return res.status(404).json({ success: false, message: 'Admin not found' });
  }
  if (otp !== OTP_CODE && (!admin.password || otp !== admin.password)) {
    return res.status(401).json({ success: false, message: 'Invalid OTP' });
  }
  const tokenPayload = { id: admin.id, role: 'Admin', name: admin.name, email: admin.email, mobileNumber: admin.mobileNumber || admin.phone };
  const accessToken = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: '1h' });
  const response = {
    success: true,
    message: 'Login successful',
    data: {
      accessToken,
      tokenType: 'Bearer',
      user: tokenPayload
    }
  };
  return res.json(response);
});

// POST /api/v1/admin/auth/forgot-password
app.post('/api/v1/admin/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'email is required' });
  }
  const admin = findAdminByEmail(email);
  if (!admin) {
    return res.status(404).json({ success: false, message: 'Admin not found' });
  }
  return res.json({ success: true, message: 'Password reset link sent successfully' });
});

// Bearer token middleware for protected Admin routes (excluding /auth)
app.use('/api/v1/admin', (req, res, next) => {
  if (req.path.startsWith('/auth/')) return next(); // skip auth endpoints
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, SECRET_KEY);
    // Extra validation: ensure the user is an admin
    if (payload.role !== 'Admin') {
       return res.status(403).json({ success: false, message: 'Forbidden: Admin role required' });
    }
    req.user = payload; // attach for downstream if needed
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

app.use(middlewares);

// Explicitly handle POST /api/v1/admin/restaurants to guarantee creation works with large payloads
app.post('/api/v1/admin/restaurants', (req, res) => {
  try {
    const db = router.db;
    const newRestaurant = { ...req.body, id: 'RST' + Date.now() };
    db.get('restaurants').push(newRestaurant).write();
    return res.status(201).json(newRestaurant);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create restaurant' });
  }
});

// Explicitly handle PUT /api/v1/admin/restaurants/:id to bypass json-server double-read stream error
app.put('/api/v1/admin/restaurants/:id', (req, res) => {
  try {
    const db = router.db;
    const { id } = req.params;
    
    // Check if restaurant exists
    const exists = db.get('restaurants').find({ id }).value();
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Merge the body payload into the existing restaurant and save to DB
    db.get('restaurants').find({ id }).assign(req.body).write();
    
    const updated = db.get('restaurants').find({ id }).value();
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update restaurant' });
  }
});

// Add the rewriter to support existing API paths
app.use(jsonServer.rewriter({
  '/api/v1/admin/requests/*': '/orders/$1', // Note: original used requests, but db has orders. Or if db has requests? Let's check db keys again. 
  '/api/v1/admin/requests': '/orders', 
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
  // Deprecated direct flattening mappings:
  // '/api/v1/admin/partners/*': '/partners/$1',
  // '/api/v1/admin/partners': '/partners',
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
  '/api/v1/admin/users/*': '/users/$1',
  '/api/v1/admin/users': '/users',
  '/api/v1/ratings': '/ratings'
}));

app.use(router);

app.listen(SERVER_PORT, () => {
  console.log(`Mock server listening on port ${SERVER_PORT}`);
});
