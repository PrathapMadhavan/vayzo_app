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
const upload = multer({ storage: storage });

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

app.post('/api/v1/admin/customers', upload.fields([{ name: 'profileImage', maxCount: 1 }]), (req, res) => {
  const data = req.body || {};
  const files = req.files || {};
  const db = router.db;
  const userId = ulid();
  const publicId = ulid();

  const newUser = {
    id: userId,
    public_id: publicId,
    name: data.name,
    email: data.email,
    mobileNumber: data.mobileNumber,
    role: 'Customer',
    status: data.status || 'ACTIVE',
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

app.patch('/api/v1/admin/customers/:publicId', upload.fields([{ name: 'profileImage', maxCount: 1 }]), (req, res) => {
  const { publicId } = req.params;
  const data = req.body || {};
  const files = req.files || {};
  const db = router.db;
  const user = db.get('users').find({ public_id: publicId }).value()
    || db.get('users').find({ id: publicId }).value();
  if (!user || user.role !== 'Customer') {
    return res.status(404).json({ error: 'Customer not found' });
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
    userUpdates.profileImage = `/uploads/${files.profileImage[0].filename}`;
  }

  if (Object.keys(userUpdates).length > 0) {
    db.get('users').find({ id: user.id }).assign(userUpdates).write();
  }

  const updated = db.get('users').find({ id: user.id }).value();
  return res.json({ ...serializeCustomer(updated), success: true });
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

function collectPartnerBundle(db, id) {
  const flatPartner = (db.partners || []).find((p) => p.id === id);
  const profile =
    (db.partner_profiles || []).find((p) => p.id === id || p.user_id === id) ||
    {};
  const user =
    (db.users || []).find(
      (u) =>
        u.role === 'Delivery Partner' &&
        (u.id === id || u.public_id === id || u.id === profile.user_id)
    ) || null;

  const profileId = profile.id || flatPartner?.id || user?.id || id;
  const vehicleData =
    (db.partner_vehicles || []).find((v) => v.partner_id === profileId) || {};
  const bankData =
    (db.partner_bank_accounts || []).find((b) => b.partner_id === profileId) || {};
  const userDocs = (db.partner_documents || []).filter((d) => d.partner_id === profileId);
  const aadhaar =
    userDocs.find((d) => d.document_type === 'aadhaar')?.document_number ||
    flatPartner?.aadhaarNumber ||
    '';
  const pan =
    userDocs.find((d) => d.document_type === 'pan')?.document_number ||
    flatPartner?.panNumber ||
    '';
  const rc =
    userDocs.find((d) => d.document_type === 'rc')?.document_number ||
    flatPartner?.rcNumber ||
    '';

  if (!flatPartner && !profile.id && !user) return null;

  const name = flatPartner?.name || user?.name || null;
  const email = flatPartner?.email || user?.email || null;
  const mobileNumber =
    flatPartner?.mobileNumber || user?.mobileNumber || user?.phone || null;
  const status = flatPartner?.status || user?.status || 'Active';
  const onlineStatus =
    flatPartner?.onlineStatus || profile.online_status || profile.onlineStatus || 'Offline';
  const partnerId = flatPartner?.id || user?.id || profileId;

  const earningsList = (db.partner_earnings || []).filter((e) => e.partner_id === profileId);
  const totalEarnings = earningsList.reduce((sum, e) => sum + (Number(e.net_amount) || 0), 0);
  const now = new Date();
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sumSince = (from) =>
    earningsList
      .filter((e) => {
        const d = new Date(e.earned_at || e.created_at);
        return !isNaN(d) && d >= from;
      })
      .reduce((sum, e) => sum + (Number(e.net_amount) || 0), 0);
  const thisWeek = sumSince(startOfWeek);
  const thisMonth = sumSince(startOfMonth);
  const todayEarnings = sumSince(startOfDay);
  const payouts = (db.partner_payouts || []).filter(
    (p) => p.partner_id === profileId && p.status !== 'FAILED' && p.status !== 'CANCELLED'
  );
  const totalPayouts = payouts.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const assignments = (db.request_assignments || []).filter((a) => a.partner_id === profileId);
  const assignedOrderIds = [...new Set(assignments.map((a) => a.order_id || a.request_id))];
  const allOrders = db.orders || db.requests || [];
  const partnerOrders = allOrders.filter((o) => assignedOrderIds.includes(o.id));
  const completedOrders = partnerOrders.filter((o) =>
    ['Delivered', 'Completed', 'COMPLETED', 'DELIVERED'].includes(o.status)
  );
  const cancelledOrders = partnerOrders.filter(
    (o) => o.cancelled_by === 'partner' || o.cancelled_by === partnerId || o.cancelled_by === profileId
  );
  const completionRate =
    assignedOrderIds.length > 0
      ? Math.round((completedOrders.length / assignedOrderIds.length) * 100)
      : 0;
  const cancellationRate =
    assignedOrderIds.length > 0
      ? Math.round((cancelledOrders.length / assignedOrderIds.length) * 100)
      : 0;

  const reviewsList = (db.ratings_reviews || db.ratings || db.reviews || []).filter(
    (r) => r.partner_id === profileId || r.entity_id === profileId
  );
  const ratingAvg =
    reviewsList.length > 0
      ? reviewsList.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviewsList.length
      : Number(profile.rating_avg) || 0;

  const joinedRaw = profile.joined_at || flatPartner?.joinedOn || user?.created_at || user?.joinedOn;
  let joinedAt = 'N/A';
  if (joinedRaw) {
    const d = new Date(joinedRaw);
    joinedAt = !isNaN(d)
      ? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : String(joinedRaw);
  }

  return {
    partner: {
      id: partnerId,
      partnerId,
      name,
      email,
      mobileNumber,
      status,
      onlineStatus,
      role: 'Delivery Partner',
      rating: ratingAvg,
      reviewCount: reviewsList.length || profile.rating_count || 0,
      joinedAt,
      joinedOn: joinedAt,
      location: flatPartner?.city || profile.city || 'N/A',
      totalOrders: completedOrders.length,
      totalEarnings,
      todayEarnings,
      completionRate,
      cancellationRate,
      lastActivityAt: '--',
      profileImage: user?.profileImage || flatPartner?.profileImage || null,
    },
    personalDetails: {
      name,
      dateOfBirth: flatPartner?.dateOfBirth || profile.dateOfBirth || profile.dob || null,
      gender: flatPartner?.gender || profile.gender || null,
      alternativeMobile:
        flatPartner?.alternateMobile || profile.alternateMobile || profile.alternativeMobile || null,
      emergencyContact:
        flatPartner?.emergencyContact || profile.emergencyContact || profile.emergencyContactName || null,
      emergencyContactRelation:
        profile.emergency_contact_relationship || profile.emergencyContactRelation || null,
      emergencyMobile:
        flatPartner?.emergencyMobile || profile.emergencyMobile || profile.emergencyContactNumber || null,
      address: flatPartner?.address || profile.address || null,
      addressLine1: profile.address_line_1 || null,
      addressLine2: profile.address_line_2 || null,
      city: flatPartner?.city || profile.city || null,
      state: profile.state || null,
      postalCode: profile.postal_code || null,
      country: profile.country || null,
      panNumber: maskSensitive(pan),
      aadhaarNumber: maskSensitive(aadhaar),
    },
    vehicle: {
      vehicleType: flatPartner?.vehicleType || vehicleData.vehicleType || null,
      vehicleName: flatPartner?.vehicleName || vehicleData.vehicleName || null,
      vehicleNumber: flatPartner?.vehicleNumber || vehicleData.vehicleNumber || null,
      rcNumber: rc || null,
      insuranceProvider:
        flatPartner?.insuranceProvider ||
        vehicleData.insurance_provider ||
        vehicleData.insuranceProvider ||
        null,
      insuranceNumber: flatPartner?.insuranceNumber || vehicleData.insuranceNumber || null,
      validTill: flatPartner?.insuranceValidTill || vehicleData.insuranceValidTill || null,
    },
    driving: {
      drivingLicenseNumber: profile.driving_license_number || null,
      drivingLicenseExpiry: profile.driving_license_expiry || null,
    },
    earnings: {
      totalEarnings,
      thisWeek,
      thisMonth,
      totalPayouts,
    },
    bankAccount: {
      bankName: flatPartner?.bankName || bankData.bankName || null,
      accountNumberMasked: maskSensitive(
        flatPartner?.accountNumber || bankData.accountNumber
      ),
      accountNumber: flatPartner?.accountNumber || bankData.accountNumber || null,
      ifscCode: flatPartner?.ifscCode || bankData.ifscCode || null,
      accountHolderName: flatPartner?.accountHolderName || bankData.accountHolderName || null,
    },
    documents: ['aadhaar', 'driving_license', 'pan', 'profile_photo', 'rc', 'insurance'].map(
      (type) => {
        const existingDoc = userDocs.find((d) => d.document_type === type);
        if (existingDoc) {
          return {
            document_type: existingDoc.document_type,
            verification_status: existingDoc.verification_status || 'Pending',
            document_number: existingDoc.document_number,
            expires_at: existingDoc.expires_at || null,
            file_path: existingDoc.file_path || null,
          };
        }
        return {
          document_type: type,
          verification_status: 'Pending',
          document_number: null,
          expires_at: null,
          file_path: null,
        };
      }
    ),
  };
}

// List must expose partnerId — the UI navigates with that field.
app.get('/api/v1/admin/partners', (_req, res) => {
  const db = router.db.getState();
  const fromPartners = (db.partners || []).map((p) => {
    const bundle = collectPartnerBundle(db, p.id);
    const partner = bundle?.partner || {};
    return {
      ...p,
      id: p.id,
      partnerId: p.id,
      todayEarnings:
        partner.todayEarnings !== undefined
          ? `₹${Number(partner.todayEarnings).toLocaleString()}`
          : '₹0',
      joinedOn: partner.joinedOn || partner.joinedAt || p.joinedOn || '',
      onlineStatus: partner.onlineStatus || p.onlineStatus || 'Offline',
    };
  });

  const partnerIds = new Set(fromPartners.map((p) => p.id));
  const fromUsers = (db.users || [])
    .filter((u) => u.role === 'Delivery Partner' && !partnerIds.has(u.id))
    .map((u) => {
      const bundle = collectPartnerBundle(db, u.id);
      const partner = bundle?.partner || {};
      return {
        id: u.id,
        partnerId: u.id,
        name: u.name,
        email: u.email,
        mobileNumber: u.mobileNumber || u.phone,
        status: u.status || 'Active',
        role: u.role,
        vehicleType: bundle?.vehicle?.vehicleType || null,
        vehicleName: bundle?.vehicle?.vehicleName || null,
        vehicleNumber: bundle?.vehicle?.vehicleNumber || null,
        onlineStatus: partner.onlineStatus || 'Offline',
        city: partner.location || null,
        joinedOn: partner.joinedOn || '',
        todayEarnings:
          partner.todayEarnings !== undefined
            ? `₹${Number(partner.todayEarnings).toLocaleString()}`
            : '₹0',
        profileImage: u.profileImage || null,
      };
    });

  return res.json([...fromPartners, ...fromUsers]);
});

// Detail view expects nested { partner, personalDetails, vehicle, earnings, ... }.
app.get('/api/v1/admin/partners/:id', (req, res) => {
  const db = router.db.getState();
  const bundle = collectPartnerBundle(db, req.params.id);
  if (!bundle) {
    return res.status(404).json({ success: false, message: 'Partner not found' });
  }
  return res.json(bundle);
});

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
