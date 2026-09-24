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
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IS_VERCEL = Boolean(process.env.VERCEL);

function resolveDbFile() {
  const source = path.join(__dirname, 'db.json');
  if (!IS_VERCEL) return source;
  // Include source mtime in the filename so each deploy gets a fresh LowDB file
  // instead of reusing a stale /tmp copy from a previous build.
  const stamp = Math.floor(fs.statSync(source).mtimeMs);
  const dest = path.join(os.tmpdir(), `vayzo-db-${stamp}.json`);
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(source, dest);
  }
  return dest;
}

// Ensure upload directories exist
const uploadDir = IS_VERCEL
  ? path.join(os.tmpdir(), 'vayzo-uploads')
  : path.join(__dirname, 'public', 'uploads');
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
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB limit
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'profileImage') {
      if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type for profileImage. Only JPG, PNG, and WebP are allowed.'));
      }
    } else if (['aadhaarFile', 'panFile', 'rcFile', 'insuranceFile'].includes(file.fieldname)) {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type for ${file.fieldname}. Only PDF is allowed.`));
      }
    } else {
      cb(new Error(`Unexpected field ${file.fieldname}`));
    }
  }
});

const uploadPartnerFiles = (req, res, next) => {
  const uploadHandler = upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'aadhaarFile', maxCount: 1 },
    { name: 'panFile', maxCount: 1 },
    { name: 'rcFile', maxCount: 1 },
    { name: 'insuranceFile', maxCount: 1 }
  ]);
  uploadHandler(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

const uploadProfileImage = (req, res, next) => {
  const uploadHandler = upload.fields([{ name: 'profileImage', maxCount: 1 }]);
  uploadHandler(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

const SERVER_PORT = process.env.PORT || 3000;
const SECRET_KEY = 'vayzo-secret-dev'; // simple secret for mock environment
const OTP_CODE = '123456'; // Development OTP

const app = express();
app.use(cors());

const middlewares = jsonServer.defaults(
  IS_VERCEL 
    ? { logger: false, bodyParser: false } 
    : { static: __dirname, bodyParser: false }
);
app.use(middlewares);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Explicitly serve uploads statically on backend port
app.use('/uploads', express.static(uploadDir));

// Fix for json-server stream consumed error
app.use((req, res, next) => {
  if (req.body) {
    req._body = true;
  }
  next();
});

// Load db.json via json-server router (writable copy on Vercel)
const router = jsonServer.router(resolveDbFile());

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

  // Prefer adminUsers — users can reuse the same email with a non-admin role.
  let admin = adminUsers.find(u => u.email === email);
  if (!admin) {
    admin = users.find(u => u.email === email && u.role === 'Admin');
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
app.use((req, res, next) => {
  const pathName = (req.url || "").split("?")[0];
  if (!pathName.startsWith("/api/v1/admin")) return next();
  if (pathName.startsWith("/api/v1/admin/auth/")) return next();

  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Missing or invalid Authorization header" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, SECRET_KEY);
    if (payload.role !== "Admin") {
      return res.status(403).json({ success: false, message: "Forbidden: Admin role required" });
    }
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
});

const sanitizeRestaurant = (r) => {
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    ownerName: r.ownerName,
    phone: r.phone,
    email: r.email,
    address: r.address,
    city: r.city,
    status: r.status,
    cuisines: r.cuisines,
    description: r.description,
    deliveryTime: r.deliveryTime,
    minimumOrder: r.minimumOrder,
    deliveryCharge: r.deliveryCharge,
    openingTime: r.openingTime,
    closingTime: r.closingTime,
    cuisineType: r.cuisineType,
    logo: r.logo,
    coverImage: r.coverImage
  };
};

app.get('/api/v1/admin/restaurants', (req, res) => {
  const db = router.db;
  const list = db.get('restaurants').value() || [];
  return res.json(list.map(sanitizeRestaurant));
});

app.get('/api/v1/admin/restaurants/:id', (req, res) => {
  const db = router.db;
  const { id } = req.params;
  const restaurant = db.get('restaurants').find({ id }).value();
  if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
  return res.json(sanitizeRestaurant(restaurant));
});

app.post('/api/v1/admin/restaurants', (req, res) => {
  try {
    const db = router.db;
    const { name, ownerName, phone, email, address, city, status } = req.body;
    
    if (!name || !ownerName || !phone || !email || !address || !city || !status) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const existingEmail = db.get('restaurants').find({ email }).value();
    if (existingEmail) return res.status(400).json({ success: false, message: 'Email already exists' });
    
    const existingPhone = db.get('restaurants').find({ phone }).value();
    if (existingPhone) return res.status(400).json({ success: false, message: 'Phone already exists' });

    const newRestaurant = sanitizeRestaurant({
      ...req.body,
      id: ulid(),
    });

    db.get('restaurants').push(newRestaurant).write();
    return res.status(201).json(newRestaurant);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create restaurant' });
  }
});

app.patch('/api/v1/admin/restaurants/:id', (req, res) => {
  try {
    const db = router.db;
    const { id } = req.params;
    
    const exists = db.get('restaurants').find({ id }).value();
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    if (req.body.id && req.body.id !== id) {
      return res.status(400).json({ success: false, message: 'Cannot change id' });
    }

    const updates = { ...req.body };
    delete updates.id;
    delete updates.menuItems;
    delete updates.rating;
    delete updates.totalOrders;
    delete updates.reviewsCount;
    delete updates.restaurantId;
    delete updates.restaurant;

    db.get('restaurants').find({ id }).assign(updates).write();
    
    const updated = db.get('restaurants').find({ id }).value();
    return res.status(200).json(sanitizeRestaurant(updated));
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update restaurant' });
  }
});

function findCustomerUser(dbState, publicId) {
  return (dbState.users || []).find(
    (u) => u.role === 'Customer' && (u.public_id === publicId || u.id === publicId)
  );
}

function serializeCustomer(user, profile = {}) {
  return {
    id: user.public_id || user.id,
    public_id: user.public_id || user.id,
    userId: user.public_id || user.id,
    name: user.name,
    email: user.email,
    mobileNumber: user.mobileNumber || user.phone,
    status: user.status || 'ACTIVE',
    isVerified: user.isVerified || false,
    joinedOn: user.joinedOn || user.created_at || profile.created_at,
    profileImage: user.profileImage,
    role: user.role,
  };
}

// Customers use public_id in the UI; json-server only looks up by internal id.
app.get('/api/v1/admin/customers', (req, res) => {
  const db = router.db.getState();
  const profiles = db.customer_profiles || [];
  const aggregated = (db.users || [])
    .filter((u) => u.role === 'Customer')
    .map((user) => {
      const profile = profiles.find((p) => p.user_id === user.id) || {};
      return serializeCustomer(user, profile);
    });
  return res.json(aggregated);
});

app.get('/api/v1/admin/customers/:publicId', (req, res) => {
  const db = router.db.getState();
  const user = findCustomerUser(db, req.params.publicId);
  if (!user) return res.status(404).json({ success: false, message: 'Customer not found' });
  const profile = (db.customer_profiles || []).find((p) => p.user_id === user.id) || {};
  return res.json(serializeCustomer(user, profile));
});

app.post('/api/v1/admin/customers', uploadProfileImage, (req, res) => {
  const data = req.body || {};
  const files = req.files || {};
  const db = router.db;

  if (!data || Object.keys(data).length === 0) {
    return res.status(400).json({ success: false, message: 'Empty payload' });
  }
  if (!data.name || !data.email || !data.mobileNumber) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  if (data.role && data.role !== 'Customer') {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }

  const users = db.get('users').value() || [];
  if (users.some(u => u.email === data.email)) {
    return res.status(400).json({ success: false, message: 'Email already exists' });
  }
  if (users.some(u => u.mobileNumber === data.mobileNumber)) {
    return res.status(400).json({ success: false, message: 'Mobile number already exists' });
  }
  const userId = ulid();
  const publicId = ulid();

  const newUser = {
    id: userId,
    public_id: publicId,
    name: data.name,
    email: data.email,
    mobileNumber: data.mobileNumber,
    role: 'Customer',
    status: data.status || 'Active',
    isVerified: data.isVerified === 'true' || data.isVerified === true,
    joinedOn: new Date().toISOString().split('T')[0],
    profileImage: files.profileImage ? `/uploads/${files.profileImage[0].filename}` : null,
  };

  if (!db.get('users').value()) db.set('users', []).write();
  db.get('users').push(newUser).write();

  if (!db.get('customer_profiles').value()) db.set('customer_profiles', []).write();
  db.get('customer_profiles').push({
    id: ulid(),
    user_id: userId,
    created_at: new Date().toISOString(),
  }).write();

  if (!db.get('wallets').value()) db.set('wallets', []).write();
  db.get('wallets').push({
    id: ulid(),
    public_id: ulid(),
    user_id: userId,
    balance: 0,
    created_at: new Date().toISOString(),
  }).write();

  return res.status(201).json({ ...newUser, id: publicId, userId: publicId });
});

app.patch('/api/v1/admin/customers/:publicId', uploadProfileImage, (req, res) => {
  const { publicId } = req.params;
  const data = req.body || {};
  const files = req.files || {};
  const db = router.db;
  const user = db.get('users').find({ public_id: publicId }).value()
    || db.get('users').find({ id: publicId }).value();
  if (!user || user.role !== 'Customer') {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }

  if ((!data || Object.keys(data).length === 0) && Object.keys(files).length === 0) {
    return res.status(400).json({ success: false, message: 'Empty payload' });
  }
  if (data.role && data.role !== 'Customer') {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }

  const users = db.get('users').value() || [];
  if (data.email && users.some(u => u.email === data.email && u.id !== user.id)) {
    return res.status(400).json({ success: false, message: 'Email already exists' });
  }
  if (data.mobileNumber && users.some(u => u.mobileNumber === data.mobileNumber && u.id !== user.id)) {
    return res.status(400).json({ success: false, message: 'Mobile number already exists' });
  }

  const userUpdates = {};
  if (data.name !== undefined) userUpdates.name = data.name;
  if (data.email !== undefined) userUpdates.email = data.email;
  if (data.mobileNumber !== undefined) userUpdates.mobileNumber = data.mobileNumber;
  if (data.status !== undefined) userUpdates.status = data.status;
  if (data.isVerified !== undefined) {
    userUpdates.isVerified = data.isVerified === 'true' || data.isVerified === true;
  }
  if (files.profileImage) {
    req._oldImageToCleanup = user.profileImage;
    userUpdates.profileImage = `/uploads/${files.profileImage[0].filename}`;
  }

  if (Object.keys(userUpdates).length > 0) {
    db.get('users').find({ id: user.id }).assign(userUpdates).write();
  }

  // Safely cleanup old image
  if (req._oldImageToCleanup && req._oldImageToCleanup.startsWith('/uploads/')) {
    const oldPath = req._oldImageToCleanup.replace('/uploads/', '');
    const fullPath = path.join(uploadDir, oldPath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (e) {
        console.error('Failed to delete old image', e);
      }
    }
  }

  const updated = db.get('users').find({ id: user.id }).value();
  return res.json(serializeCustomer(updated));
});

app.patch('/api/v1/admin/customers/:publicId/status', (req, res) => {
  const { publicId } = req.params;
  const { status } = req.body || {};
  const db = router.db;
  const user = db.get('users').find({ public_id: publicId }).value()
    || db.get('users').find({ id: publicId }).value();
  if (!user || user.role !== 'Customer') {
    return res.status(404).json({ error: 'Customer not found' });
  }
  db.get('users').find({ id: user.id }).assign({ status }).write();
  return res.json({ success: true, status });
});

app.delete('/api/v1/admin/customers/:publicId', (req, res) => {
  const { publicId } = req.params;
  const db = router.db;
  const user = db.get('users').find({ public_id: publicId }).value()
    || db.get('users').find({ id: publicId }).value();
  if (!user || user.role !== 'Customer') {
    return res.status(404).json({ error: 'Customer not found' });
  }
  db.get('users').remove({ id: user.id }).write();
  db.get('customer_profiles').remove({ user_id: user.id }).write();
  return res.status(200).json({ success: true });
});

app.get('/api/v1/admin/customers/:publicId/requests', (req, res) => {
  const db = router.db.getState();
  const user = findCustomerUser(db, req.params.publicId);
  if (!user) return res.json([]);
  const userRequests = (db.requests || db.orders || []).filter((r) => r.user_id === user.id);
  return res.json(userRequests);
});

app.get('/api/v1/admin/customers/:publicId/wallet', (req, res) => {
  const db = router.db.getState();
  const user = findCustomerUser(db, req.params.publicId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const wallet = (db.wallets || []).find((w) => w.user_id === user.id);
  return res.json(wallet || null);
});

app.get('/api/v1/admin/customers/:publicId/wallet/transactions', (req, res) => {
  const db = router.db.getState();
  const user = findCustomerUser(db, req.params.publicId);
  if (!user) return res.json([]);
  const wallet = (db.wallets || []).find((w) => w.user_id === user.id);
  if (!wallet) return res.json([]);
  const txns = (db.wallet_transactions || []).filter((t) => t.wallet_id === wallet.id);
  return res.json(txns);
});

app.get('/api/v1/admin/customers/:publicId/complaints', (_req, res) => {
  return res.json([]);
});

function maskSensitive(str, showLast = 4) {
  if (!str) return null;
  const s = String(str);
  return s.slice(-showLast).padStart(s.length, '*');
}

// Legacy partner endpoints removed

// Partner nested routes must beat the partners/* rewriter (json-server 404s otherwise).
app.get('/api/v1/admin/partners/:id/activity', (req, res) => {
  const db = router.db.getState();
  const id = req.params.id;
  const profile =
    (db.partner_profiles || []).find((p) => p.id === id || p.user_id === id) ||
    {};
  const partner = (db.partners || []).find((p) => p.id === id);
  const user = (db.users || []).find(
    (u) => (u.id === id || u.public_id === id) && u.role === 'Delivery Partner'
  );

  if (!partner && !profile.id && !user) {
    return res.json({ content: [], data: { content: [] } });
  }

  const profileId = profile.id || partner?.id || user?.id;
  const activities = [];

  (db.partner_earnings || [])
    .filter((e) => e.partner_id === profileId)
    .forEach((e) => {
      activities.push({
        type: 'EARNING',
        details: `Earned ₹${e.net_amount || e.amount} for order`,
        timestamp: e.earned_at || e.created_at || new Date().toISOString(),
      });
    });

  const assignments = (db.request_assignments || []).filter((a) => a.partner_id === profileId);
  assignments.forEach((a) => {
    activities.push({
      type: 'ASSIGNMENT',
      details: `Assignment ${a.assignment_status || 'created'} for order ${a.order_id || a.request_id}`,
      timestamp: a.updated_at || a.assigned_at || a.created_at || new Date().toISOString(),
    });
  });

  (db.partner_payouts || [])
    .filter((p) => p.partner_id === profileId)
    .forEach((p) => {
      activities.push({
        type: 'PAYOUT',
        details: `Payout of ₹${p.amount} is ${p.status || 'Processed'}`,
        timestamp: p.processed_at || p.created_at || new Date().toISOString(),
      });
    });

  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return res.json({ content: activities, data: { content: activities } });
});

app.get('/api/v1/admin/partners/:id/reviews', (req, res) => {
  const db = router.db.getState();
  const id = req.params.id;
  const profile =
    (db.partner_profiles || []).find((p) => p.id === id || p.user_id === id) ||
    {};
  const profileId = profile.id || id;
  const reviews = (db.ratings_reviews || db.ratings || db.reviews || []).filter(
    (r) => r.partner_id === profileId || r.entity_id === profileId
  );
  const summary = { total: reviews.length };
  return res.json({ reviews, summary, data: { reviews, summary } });
});

// json-server rewriter matches the full req.url including query strings.
// Strip Vercel rewrite helpers first so routes like /api?p=/api/v1/... resolve.
app.use((req, _res, next) => {
  const parsed = new URL(req.url, 'http://localhost');
  parsed.searchParams.delete('p');
  parsed.searchParams.delete('orig');
  req._qs = parsed.searchParams.toString();
  req.url = parsed.pathname;
  next();
});



// --- BEGIN REQUESTS API IMPLEMENTATION ---
const ALLOWED_SERVICES = ['FOOD', 'BUY_GET', 'BIKE_RIDE', 'CAR_RIDE'];
const ALLOWED_STATUSES = [
  'requested', 'searching_partner', 'partner_assigned', 'accepted',
  'going_to_pickup', 'arrived_pickup', 'purchasing', 'picked_up',
  'going_to_customer', 'arrived_customer', 'delivered', 'completed',
  'cancelled', 'failed'
];
const PATCH_WHITELIST = ['text_instruction', 'voice_note_url', 'dropoff_address_snapshot', 'pickup_address_snapshot'];

function getNextStatuses(currentStatus, serviceType) {
  const allTransitions = {
    'requested': ['searching_partner', 'cancelled'],
    'searching_partner': ['partner_assigned', 'cancelled', 'failed'],
    'partner_assigned': ['accepted', 'going_to_pickup', 'cancelled'],
    'accepted': ['going_to_pickup', 'cancelled'],
    'going_to_pickup': ['arrived_pickup', 'cancelled'],
    'arrived_pickup': ['purchasing', 'picked_up', 'cancelled'],
    'purchasing': ['picked_up', 'cancelled'],
    'picked_up': ['going_to_customer', 'completed', 'cancelled'],
    'going_to_customer': ['arrived_customer'],
    'arrived_customer': ['delivered', 'completed'],
    'delivered': ['completed'],
    'completed': [],
    'cancelled': [],
    'failed': []
  };
  
  let valid = allTransitions[currentStatus] || [];
  if (serviceType === 'FOOD') {
    valid = valid.filter(v => !['purchasing'].includes(v));
  } else if (serviceType === 'BUY_GET') {
    // BUY_GET allows purchasing
  } else if (['BIKE_RIDE', 'CAR_RIDE'].includes(serviceType)) {
    valid = valid.filter(v => !['purchasing', 'delivered'].includes(v));
  }
  return valid;
}

app.get('/api/v1/admin/requests', (req, res) => {
  const db = router.db.getState();
  let results = db.requests || [];
  if (req.query.service_type) results = results.filter(r => r.service_type === req.query.service_type);
  if (req.query.status) results = results.filter(r => r.status === req.query.status);
  if (req.query.customer_id) results = results.filter(r => r.customer_id === req.query.customer_id);
  if (req.query.restaurant_id) results = results.filter(r => r.restaurant_id === req.query.restaurant_id);
  
  const enriched = results.map(r => {
    const customer = (db.users || []).find(u => u.id === r.customer_id);
    const restaurant = (db.restaurants || []).find(rst => rst.id === r.restaurant_id);
    const assignment = (db.request_assignments || []).find(a => a.request_id === r.id && ['active', 'partner_assigned', 'unknown'].includes(a.assignment_status));
    return {
      ...r,
      customer: customer ? { id: customer.id, name: customer.name } : null,
      restaurant: restaurant ? { id: restaurant.id, name: restaurant.name } : null,
      assignment: assignment || null
    };
  });
  return res.json({ success: true, data: enriched });
});

app.get('/api/v1/admin/requests/:id', (req, res) => {
  const db = router.db.getState();
  const request = (db.requests || []).find(r => r.id === req.params.id);
  if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
  
  const customer = (db.users || []).find(u => u.id === request.customer_id);
  const restaurant = (db.restaurants || []).find(rst => rst.id === request.restaurant_id);
  const items = (db.request_items || []).filter(i => i.request_id === request.id);
  const pickups = (db.request_pickups || []).filter(p => p.request_id === request.id);
  const ride = (db.rides || []).find(r => r.request_id === request.id);
  const assignments = (db.request_assignments || []).filter(a => a.request_id === request.id);
  const status_history = (db.request_status_history || []).filter(s => s.request_id === request.id);
  
  return res.json({
    success: true,
    data: {
      ...request,
      customer: customer || null,
      restaurant: restaurant || null,
      items, pickups, ride: ride || null, assignments, status_history
    }
  });
});

app.post('/api/v1/admin/requests', (req, res) => {
  const db = router.db;
  const dbState = db.getState();
  const { customer_id, service_type, restaurant_id, items, ride_details, text_instruction, pickups } = req.body;
  
  if (!ALLOWED_SERVICES.includes(service_type)) {
    return res.status(400).json({ success: false, message: 'Invalid service_type' });
  }
  if (!customer_id || !(dbState.users || []).find(u => u.id === customer_id && u.role === 'Customer')) {
    return res.status(400).json({ success: false, message: 'Invalid customer_id' });
  }
  
  if (service_type === 'FOOD') {
    if (!restaurant_id || !(dbState.restaurants || []).find(r => r.id === restaurant_id)) {
      return res.status(400).json({ success: false, message: 'Invalid restaurant_id for FOOD' });
    }
    if (!items || !Array.isArray(items) || !items.length) {
      return res.status(400).json({ success: false, message: 'FOOD request requires items array' });
    }
  } else if (service_type === 'BUY_GET') {
    if (!text_instruction && (!items || !items.length)) {
      return res.status(400).json({ success: false, message: 'BUY_GET requires items or text_instruction' });
    }
    if (pickups && !Array.isArray(pickups)) {
      return res.status(400).json({ success: false, message: 'pickups must be an array' });
    }
  } else if (['BIKE_RIDE', 'CAR_RIDE'].includes(service_type)) {
    if (!ride_details || typeof ride_details !== 'object') {
      return res.status(400).json({ success: false, message: 'Rides require ride_details object' });
    }
    if (items && items.length) {
      return res.status(400).json({ success: false, message: 'Rides cannot have items' });
    }
  }
  
  const requestId = ulid();
  const newRequest = {
    ...req.body,
    id: requestId,
    status: 'requested',
    restaurant_id: service_type === 'FOOD' ? restaurant_id : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const dbStateBackup = JSON.parse(JSON.stringify(dbState));
  
  try {
    if (!db.has('requests').value()) db.set('requests', []).write();
    db.get('requests').push(newRequest).write();
    
    if (items && items.length && ['FOOD', 'BUY_GET'].includes(service_type)) {
      if (!db.has('request_items').value()) db.set('request_items', []).write();
      items.forEach(item => {
        db.get('request_items').push({ ...item, id: ulid(), request_id: requestId }).write();
      });
    }
    if (pickups && pickups.length && service_type === 'BUY_GET') {
      if (!db.has('request_pickups').value()) db.set('request_pickups', []).write();
      pickups.forEach(p => {
        db.get('request_pickups').push({ ...p, id: ulid(), request_id: requestId }).write();
      });
    }
    if (ride_details && ['BIKE_RIDE', 'CAR_RIDE'].includes(service_type)) {
      if (!db.has('rides').value()) db.set('rides', []).write();
      db.get('rides').push({ ...ride_details, id: ulid(), request_id: requestId }).write();
    }
    
    if (!db.has('request_status_history').value()) db.set('request_status_history', []).write();
    db.get('request_status_history').push({
      id: ulid(),
      request_id: requestId,
      status: 'requested',
      changed_by: req.user ? req.user.id : 'system',
      timestamp: new Date().toISOString()
    }).write();
    
    return res.status(201).json({ success: true, data: newRequest });
  } catch (err) {
    db.setState(dbStateBackup);
    db.write();
    return res.status(500).json({ success: false, message: 'Failed to create request atomically', error: err.message });
  }
});

app.patch('/api/v1/admin/requests/:id', (req, res) => {
  const db = router.db;
  const request = db.get('requests').find({ id: req.params.id }).value();
  if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
  
  const updates = { updated_at: new Date().toISOString() };
  for (const key of Object.keys(req.body)) {
    if (PATCH_WHITELIST.includes(key)) {
      updates[key] = req.body[key];
    }
  }
  if (Object.keys(updates).length === 1) {
    return res.status(400).json({ success: false, message: 'No valid fields provided to patch' });
  }
  
  db.get('requests').find({ id: request.id }).assign(updates).write();
  return res.json({ success: true, data: db.get('requests').find({ id: request.id }).value() });
});

app.patch('/api/v1/admin/requests/:id/status', (req, res) => {
  const { status, reason, partner_id } = req.body;
  const db = router.db;
  const dbState = db.getState();
  const request = db.get('requests').find({ id: req.params.id }).value();
  
  if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
  if (!ALLOWED_STATUSES.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
  
  const validNext = getNextStatuses(request.status, request.service_type);
  if (!validNext.includes(status)) {
    return res.status(400).json({ success: false, message: `Invalid transition from ${request.status} to ${status} for ${request.service_type}` });
  }
  
  const dbStateBackup = JSON.parse(JSON.stringify(dbState));
  
  try {
    if (status === 'partner_assigned') {
      if (!partner_id) throw new Error('partner_assigned requires a valid partner_id');
      const pPartner = (dbState.partners || []).find(p => p.id === partner_id);
      if (!pPartner) throw new Error('Invalid partner_id (not found in partners)');
      
      if (!db.has('request_assignments').value()) db.set('request_assignments', []).write();
      db.get('request_assignments').push({
        id: ulid(),
        request_id: request.id,
        partner_id,
        assignment_status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).write();
    }
    
    db.get('requests').find({ id: request.id }).assign({ status, updated_at: new Date().toISOString() }).write();
    
    if (!db.has('request_status_history').value()) db.set('request_status_history', []).write();
    db.get('request_status_history').push({
      id: ulid(),
      request_id: request.id,
      status,
      reason: reason || null,
      changed_by: req.user ? req.user.id : 'system',
      timestamp: new Date().toISOString()
    }).write();
    
    if (status === 'completed') {
      const assignment = (db.getState().request_assignments || []).find(a => a.request_id === request.id && ['active', 'partner_assigned'].includes(a.assignment_status));
      if (assignment) {
        if (!db.has('partner_earnings').value()) db.set('partner_earnings', []).write();
        const existingEarning = db.get('partner_earnings').find({ request_id: request.id }).value();
        if (!existingEarning) {
          db.get('partner_earnings').push({
            id: ulid(),
            request_id: request.id,
            partner_id: assignment.partner_id,
            amount: request.delivery_fee || 0,
            status: 'PENDING',
            created_at: new Date().toISOString()
          }).write();
        }
      }
    }
    
    return res.json({ success: true, message: 'Status updated', data: db.get('requests').find({ id: request.id }).value() });
  } catch (err) {
    db.setState(dbStateBackup);
    db.write();
    return res.status(400).json({ success: false, message: err.message });
  }
});
// --- END REQUESTS API IMPLEMENTATION ---

// --- START DELIVERY PARTNERS API IMPLEMENTATION ---
function mapCanonicalPartner(user, db) {
  const pProfile = db.get('partner_profiles').find({ user_id: user.id }).value() || {};
  const pVehicle = db.get('partner_vehicles').find({ partner_id: user.id }).value() || {};
  const pBank = db.get('partner_bank_accounts').find({ partner_id: user.id }).value() || {};
  const pDocs = db.get('partner_documents').filter({ partner_id: user.id }).value() || [];

  const getDoc = (type) => {
    const doc = pDocs.find(d => d.document_type === type);
    return doc ? doc.file_url : null;
  };

  return {
    id: user.id,
    name: user.name || "",
    email: user.email || "",
    mobileNumber: user.mobileNumber || "",
    status: user.status || "Active",
    profileImage: user.profileImage || null,
    partner_code: pProfile.partner_code || null,
    onlineStatus: pProfile.online_status || "Online",
    verification_status: pProfile.verification_status || "Pending",
    dateOfBirth: pProfile.dateOfBirth || "",
    gender: pProfile.gender || "Male",
    alternateMobile: pProfile.alternateMobile || "",
    emergencyContact: pProfile.emergencyContact || "",
    emergencyMobile: pProfile.emergencyMobile || "",
    address: pProfile.address || "",
    city: pProfile.city || "",
    aadhaarNumber: pProfile.aadhaarNumber || "",
    panNumber: pProfile.panNumber || "",
    vehicleType: pVehicle.vehicleType || "",
    vehicleName: pVehicle.vehicleName || "",
    vehicleNumber: pVehicle.vehicleNumber || "",
    rcNumber: pVehicle.rcNumber || "",
    insuranceProvider: pVehicle.insuranceProvider || "",
    insuranceNumber: pVehicle.insuranceNumber || "",
    insuranceValidTill: pVehicle.insuranceValidTill || "",
    bankName: pBank.bankName || "",
    accountNumber: pBank.accountNumber || "",
    ifscCode: pBank.ifscCode || "",
    accountHolderName: pBank.accountHolderName || "",
    aadhaarDocumentUrl: getDoc('AADHAAR'),
    panDocumentUrl: getDoc('PAN'),
    rcDocumentUrl: getDoc('RC'),
    insuranceDocumentUrl: getDoc('INSURANCE'),
  };
}

app.get('/api/v1/admin/partners', (req, res) => {
  const db = router.db;
  const users = db.get('users').filter({ role: 'Delivery Partner' }).value() || [];
  const partners = users.map(user => mapCanonicalPartner(user, db));
  // Return flat array to match generic json-server list expectations
  res.json(partners);
});

app.get('/api/v1/admin/partners/:id', (req, res) => {
  const db = router.db;
  const user = db.get('users').find({ id: req.params.id, role: 'Delivery Partner' }).value();
  if (!user) return res.status(404).json({ success: false, message: 'Partner not found' });
  res.json(mapCanonicalPartner(user, db));
});

app.post('/api/v1/admin/partners', uploadPartnerFiles, (req, res) => {
  const db = router.db;
  const data = req.body;
  
  if (!data.email) return res.status(400).json({ success: false, message: 'Email required' });
  if (!data.mobileNumber) return res.status(400).json({ success: false, message: 'Mobile required' });
  if (!data.name) return res.status(400).json({ success: false, message: 'Name required' });
  
  const existingEmail = db.get('users').find({ email: data.email }).value();
  if (existingEmail) return res.status(400).json({ success: false, message: 'Email already exists' });
  const existingMobile = db.get('users').find({ mobileNumber: data.mobileNumber }).value();
  if (existingMobile) return res.status(400).json({ success: false, message: 'Mobile already exists' });

  const userId = ulid();
  let profileImageUrl = null;
  if (req.files && req.files.profileImage) {
    profileImageUrl = '/uploads/' + req.files.profileImage[0].filename;
  }
  
  const newUser = {
    id: userId,
    name: data.name,
    email: data.email,
    mobileNumber: data.mobileNumber,
    role: 'Delivery Partner',
    status: data.status || 'Active',
    profileImage: profileImageUrl,
    created_at: new Date().toISOString()
  };
  
  const newProfile = {
    id: ulid(),
    user_id: userId,
    partner_code: 'DP-' + Date.now().toString().slice(-6),
    online_status: data.onlineStatus || 'Online',
    verification_status: 'Pending',
    dateOfBirth: data.dateOfBirth,
    gender: data.gender,
    alternateMobile: data.alternateMobile,
    emergencyContact: data.emergencyContact,
    emergencyMobile: data.emergencyMobile,
    address: data.address,
    city: data.city,
    aadhaarNumber: data.aadhaarNumber,
    panNumber: data.panNumber,
  };
  
  const newVehicle = {
    id: ulid(),
    partner_id: userId,
    vehicleType: data.vehicleType,
    vehicleName: data.vehicleName,
    vehicleNumber: data.vehicleNumber,
    rcNumber: data.rcNumber,
    insuranceProvider: data.insuranceProvider,
    insuranceNumber: data.insuranceNumber,
    insuranceValidTill: data.insuranceValidTill,
  };
  
  const newBank = {
    id: ulid(),
    partner_id: userId,
    bankName: data.bankName,
    accountHolderName: data.accountHolderName,
    accountNumber: data.accountNumber,
    ifscCode: data.ifscCode,
  };
  
  db.get('users').push(newUser).write();
  
  if (!db.has('partner_profiles').value()) db.set('partner_profiles', []).write();
  db.get('partner_profiles').push(newProfile).write();
  
  if (!db.has('partner_vehicles').value()) db.set('partner_vehicles', []).write();
  db.get('partner_vehicles').push(newVehicle).write();
  
  if (!db.has('partner_bank_accounts').value()) db.set('partner_bank_accounts', []).write();
  db.get('partner_bank_accounts').push(newBank).write();
  
  if (!db.has('partner_documents').value()) db.set('partner_documents', []).write();
  const docsColl = db.get('partner_documents');
  const handleDoc = (fieldName, type) => {
    if (req.files && req.files[fieldName]) {
      docsColl.push({
        id: ulid(),
        partner_id: userId,
        document_type: type,
        file_url: '/uploads/' + req.files[fieldName][0].filename
      }).write();
    }
  };
  handleDoc('aadhaarFile', 'AADHAAR');
  handleDoc('panFile', 'PAN');
  handleDoc('rcFile', 'RC');
  handleDoc('insuranceFile', 'INSURANCE');

  res.status(201).json({ success: true, data: mapCanonicalPartner(newUser, db) });
});

app.patch('/api/v1/admin/partners/:id', uploadPartnerFiles, (req, res) => {
  const db = router.db;
  const userId = req.params.id;
  const user = db.get('users').find({ id: userId, role: 'Delivery Partner' }).value();
  
  if (!user) return res.status(404).json({ success: false, message: 'Partner not found' });
  const data = req.body;
  
  if (data.email) {
    const existingEmail = db.get('users').find({ email: data.email }).value();
    if (existingEmail && existingEmail.id !== userId) return res.status(400).json({ success: false, message: 'Email already exists' });
  }
  if (data.mobileNumber) {
    const existingMobile = db.get('users').find({ mobileNumber: data.mobileNumber }).value();
    if (existingMobile && existingMobile.id !== userId) return res.status(400).json({ success: false, message: 'Mobile already exists' });
  }

  const userUpdates = {};
  if (data.name !== undefined) userUpdates.name = data.name;
  if (data.email !== undefined) userUpdates.email = data.email;
  if (data.mobileNumber !== undefined) userUpdates.mobileNumber = data.mobileNumber;
  if (data.status !== undefined) userUpdates.status = data.status;
  
  if (req.files && req.files.profileImage) {
    if (user.profileImage) {
      const oldPath = path.join(uploadDir, path.basename(user.profileImage));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    userUpdates.profileImage = '/uploads/' + req.files.profileImage[0].filename;
  }
  if (Object.keys(userUpdates).length > 0) {
    db.get('users').find({ id: userId }).assign(userUpdates).write();
  }

  const profileFields = ['dateOfBirth', 'gender', 'alternateMobile', 'emergencyContact', 'emergencyMobile', 'address', 'city', 'aadhaarNumber', 'panNumber'];
  const profile = db.get('partner_profiles').find({ user_id: userId }).value();
  
  if (profile) {
    const profileUpdates = {};
    profileFields.forEach(f => {
      if (data[f] !== undefined) profileUpdates[f] = data[f];
    });
    if (data.onlineStatus !== undefined) profileUpdates.online_status = data.onlineStatus;
    
    if (Object.keys(profileUpdates).length > 0) {
      db.get('partner_profiles').find({ user_id: userId }).assign(profileUpdates).write();
    }
  } else {
    const newProfile = {
      id: ulid(),
      user_id: userId,
      partner_code: 'DP-' + Date.now().toString().slice(-6),
      online_status: data.onlineStatus || 'Online',
      verification_status: 'Pending'
    };
    profileFields.forEach(f => { if (data[f] !== undefined) newProfile[f] = data[f]; });
    if (!db.has('partner_profiles').value()) db.set('partner_profiles', []).write();
    db.get('partner_profiles').push(newProfile).write();
  }

  const vehicleFields = ['vehicleType', 'vehicleName', 'vehicleNumber', 'rcNumber', 'insuranceProvider', 'insuranceNumber', 'insuranceValidTill'];
  const vehicle = db.get('partner_vehicles').find({ partner_id: userId }).value();
  if (vehicle) {
    const vUpdates = {};
    vehicleFields.forEach(f => { if (data[f] !== undefined) vUpdates[f] = data[f]; });
    if (Object.keys(vUpdates).length > 0) db.get('partner_vehicles').find({ partner_id: userId }).assign(vUpdates).write();
  } else {
    const newV = { id: ulid(), partner_id: userId };
    vehicleFields.forEach(f => { if (data[f] !== undefined) newV[f] = data[f]; });
    if (!db.has('partner_vehicles').value()) db.set('partner_vehicles', []).write();
    db.get('partner_vehicles').push(newV).write();
  }
  
  const bankFields = ['bankName', 'accountHolderName', 'accountNumber', 'ifscCode'];
  const bank = db.get('partner_bank_accounts').find({ partner_id: userId }).value();
  if (bank) {
    const bUpdates = {};
    bankFields.forEach(f => { if (data[f] !== undefined) bUpdates[f] = data[f]; });
    if (Object.keys(bUpdates).length > 0) db.get('partner_bank_accounts').find({ partner_id: userId }).assign(bUpdates).write();
  } else {
    const newB = { id: ulid(), partner_id: userId };
    bankFields.forEach(f => { if (data[f] !== undefined) newB[f] = data[f]; });
    if (!db.has('partner_bank_accounts').value()) db.set('partner_bank_accounts', []).write();
    db.get('partner_bank_accounts').push(newB).write();
  }
  
  if (!db.has('partner_documents').value()) db.set('partner_documents', []).write();
  const docsPatchColl = db.get('partner_documents');
  const handlePatchDoc = (fieldName, type) => {
    if (req.files && req.files[fieldName]) {
      const existingDoc = docsPatchColl.find({ partner_id: userId, document_type: type }).value();
      if (existingDoc) {
        if (existingDoc.file_url) {
          const oldPath = path.join(uploadDir, path.basename(existingDoc.file_url));
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        docsPatchColl.find({ id: existingDoc.id }).assign({ file_url: '/uploads/' + req.files[fieldName][0].filename }).write();
      } else {
        docsPatchColl.push({
          id: ulid(),
          partner_id: userId,
          document_type: type,
          file_url: '/uploads/' + req.files[fieldName][0].filename
        }).write();
      }
    }
  };
  handlePatchDoc('aadhaarFile', 'AADHAAR');
  handlePatchDoc('panFile', 'PAN');
  handlePatchDoc('rcFile', 'RC');
  handlePatchDoc('insuranceFile', 'INSURANCE');

  const updatedUser = db.get('users').find({ id: userId }).value();
  res.json({ success: true, data: mapCanonicalPartner(updatedUser, db) });
});
// --- END DELIVERY PARTNERS API IMPLEMENTATION ---

// Add the rewriter to support existing API paths
app.use(jsonServer.rewriter({
  '/api/v1/admin/requests/*': '/orders/$1',
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
  '/api/v1/ratings': '/ratings_reviews',
  '/api/settings/*': '/settings/$1',
  '/api/settings': '/settings',
  '/api/deliveryPartners': '/deliveryPartners',
  '/api/restaurant_products/*': '/restaurant_products/$1',
  '/api/restaurant_products': '/restaurant_products',
  '/restaurant_products/*': '/restaurant_products/$1',
  '/restaurant_products': '/restaurant_products',
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
