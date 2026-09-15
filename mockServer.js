// mockServer.js
// Small handcrafted mock auth layer wrapping json-server
// Provides OTP‑first login and Bearer token validation for Admin APIs

import jsonServer from 'json-server';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_PORT = process.env.PORT || 3000;
const SECRET_KEY = 'vayzo-secret-dev'; // simple secret for mock environment
const OTP_CODE = '123456'; // Development OTP
const IS_VERCEL = Boolean(process.env.VERCEL);

function resolveDbFile() {
  const source = path.join(__dirname, 'db.json');
  if (!IS_VERCEL) return source;
  const dest = path.join(os.tmpdir(), 'vayzo-db.json');
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(source, dest);
  }
  return dest;
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load db.json via json-server router (writable copy on Vercel)
const router = jsonServer.router(resolveDbFile());
const middlewares = jsonServer.defaults(
  IS_VERCEL ? { logger: false } : { static: __dirname },
);

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
  // frontend authApi.js sends { email, password } for login
  const mobileNumber = req.body.mobileNumber || req.body.email;
  const otp = req.body.otp || req.body.password;
  
  if (!mobileNumber || !otp) {
    return res.status(400).json({ success: false, message: 'mobileNumber (or email) and otp (or password) are required' });
  }
  const admin = findAdminByMobile(mobileNumber) || findAdminByEmail(mobileNumber);
  if (!admin) {
    return res.status(404).json({ success: false, message: 'Admin not found. Ensure you are using the correct credentials.' });
  }
  
  // Verify OTP or Password
  const isValidOtp = otp === OTP_CODE;
  const isValidPassword = admin.password && otp === admin.password;
  
  if (!isValidOtp && !isValidPassword) {
    return res.status(401).json({ success: false, message: 'Invalid OTP or password' });
  }
  
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

// json-server's rewriter matches req.url including the query string, so
// Vercel rewrites like /api?p=/api/v1/admin/dashboard never hit a rule.
app.use((req, _res, next) => {
  const parsed = new URL(req.url, "http://localhost");
  parsed.searchParams.delete("p");
  parsed.searchParams.delete("orig");
  req._qs = parsed.searchParams.toString();
  req.url = parsed.pathname;
  next();
});

// Add the rewriter to support existing API paths
app.use(jsonServer.rewriter({
  '/api/v1/admin/customers/*': '/users/$1',
  '/api/v1/admin/customers': '/users',
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
  '/api/v1/admin/users/*': '/users/$1',
  '/api/v1/admin/users': '/users',
  '/api/v1/ratings': '/ratings',
  '/api/settings/*': '/settings/$1',
  '/api/settings': '/settings',
  '/api/deliveryPartners': '/deliveryPartners',
}));

app.use((req, _res, next) => {
  if (req._qs) req.url += `?${req._qs}`;
  next();
});

app.use(router);

if (!IS_VERCEL) {
  app.listen(SERVER_PORT, () => {
    console.log(`Mock server listening on port ${SERVER_PORT}`);
  });
}

export default app;
