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

const SERVER_PORT = process.env.PORT || 3001;
const SECRET_KEY = 'vayzo-secret-dev'; // simple secret for mock environment
const OTP_CODE = '123456'; // Development OTP

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load db.json via json-server router
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults({ static: __dirname });

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

// GET /api/v1/admin/partners (Aggregated List)
app.get('/api/v1/admin/partners', (req, res) => {
  const db = router.db.getState();
  const users = db.users || [];
  const profiles = db.partner_profiles || [];
  const vehicles = db.partner_vehicles || [];
  const docs = db.partner_documents || [];
  const banks = db.partner_bank_accounts || [];

  // Find users with role "Delivery Partner"
  const partnerUsers = users.filter(u => u.role === 'Delivery Partner');

  const aggregated = partnerUsers.map(user => {
    const profile = profiles.find(p => p.user_id === user.id) || {};
    // Use partner_id for child tables, referencing partner_profiles.id
    const vehicle = vehicles.find(v => v.partner_id === profile.id) || {};
    const bank = banks.find(b => b.partner_id === profile.id) || {};
    
    // docs might have multiple, we map them
    const userDocs = docs.filter(d => d.partner_id === profile.id);
    const aadhaar = userDocs.find(d => d.document_type === 'aadhaar')?.document_number || '';
    const pan = userDocs.find(d => d.document_type === 'pan')?.document_number || '';
    const rc = userDocs.find(d => d.document_type === 'rc')?.document_number || '';

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      mobileNumber: user.mobileNumber || user.phone,
      status: user.status || 'Active',
      role: user.role,
      
      // Profile fields
      dateOfBirth: profile.dateOfBirth,
      gender: profile.gender,
      alternateMobile: profile.alternateMobile,
      emergencyContact: profile.emergencyContact,
      emergencyMobile: profile.emergencyMobile,
      emergencyContactRelation: profile.emergency_contact_relationship || profile.emergencyContactRelation,
      city: profile.city,
      address: profile.address,
      addressLine1: profile.address_line_1,
      addressLine2: profile.address_line_2,
      state: profile.state,
      postalCode: profile.postal_code,
      country: profile.country,
      onlineStatus: profile.online_status || profile.onlineStatus,
      drivingLicenseNumber: profile.driving_license_number,
      drivingLicenseExpiry: profile.driving_license_expiry,
      
      // Vehicle fields
      vehicleType: vehicle.vehicleType,
      vehicleName: vehicle.vehicleName,
      vehicleNumber: vehicle.vehicleNumber,
      insuranceProvider: vehicle.insurance_provider || vehicle.insuranceProvider,
      insuranceNumber: vehicle.insuranceNumber,
      insuranceValidTill: vehicle.insuranceValidTill,
      
      // Document fields
      aadhaarNumber: aadhaar,
      panNumber: pan,
      rcNumber: rc,

      // Bank fields
      bankName: bank.bankName,
      accountNumber: bank.accountNumber,
      ifscCode: bank.ifscCode,
      accountHolderName: bank.accountHolderName,
    };
  });

  return res.json(aggregated);
});

// GET /api/v1/admin/partners/:id (Aggregated Single)
app.get('/api/v1/admin/partners/:id', (req, res) => {
  const db = router.db.getState();
  const user = (db.users || []).find(u => u.id === req.params.id && u.role === 'Delivery Partner');
  
  if (!user) {
    return res.status(404).json({ success: false, message: 'Partner not found' });
  }

  const profile = (db.partner_profiles || []).find(p => p.user_id === user.id) || {};
  const vehicleData = (db.partner_vehicles || []).find(v => v.partner_id === profile.id) || {};
  const bankData = (db.partner_bank_accounts || []).find(b => b.partner_id === profile.id) || {};
  const userDocs = (db.partner_documents || []).filter(d => d.partner_id === profile.id);
  
  const aadhaar = userDocs.find(d => d.document_type === 'aadhaar')?.document_number || '';
  const pan = userDocs.find(d => d.document_type === 'pan')?.document_number || '';
  const rc = userDocs.find(d => d.document_type === 'rc')?.document_number || '';

  // Calculate earnings
  const earningsList = (db.partner_earnings || []).filter(e => e.partner_id === profile.id);
  const totalEarnings = earningsList.reduce((sum, e) => sum + (Number(e.net_amount) || 0), 0);
  
  const now = new Date();
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const thisWeek = earningsList
    .filter(e => {
      const d = new Date(e.earned_at || e.created_at);
      return !isNaN(d) && d >= startOfWeek;
    })
    .reduce((sum, e) => sum + (Number(e.net_amount) || 0), 0);
    
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonth = earningsList
    .filter(e => {
      const d = new Date(e.earned_at || e.created_at);
      return !isNaN(d) && d >= startOfMonth;
    })
    .reduce((sum, e) => sum + (Number(e.net_amount) || 0), 0);
    
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEarnings = earningsList
    .filter(e => {
      const d = new Date(e.earned_at || e.created_at);
      return !isNaN(d) && d >= startOfDay;
    })
    .reduce((sum, e) => sum + (Number(e.net_amount) || 0), 0);

  const payouts = (db.partner_payouts || []).filter(p => p.partner_id === profile.id && p.status !== 'FAILED' && p.status !== 'CANCELLED');
  const totalPayouts = payouts.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // Calculate orders & stats
  // VAYZO uses 'orders' or 'requests'
  const assignments = (db.request_assignments || []).filter(a => a.partner_id === profile.id);
  const assignedOrderIds = [...new Set(assignments.map(a => a.order_id || a.request_id))];
  const allOrders = db.orders || db.requests || [];
  
  const partnerOrders = allOrders.filter(o => assignedOrderIds.includes(o.id));
  const completedOrders = partnerOrders.filter(o => o.status === 'Delivered' || o.status === 'Completed' || o.status === 'COMPLETED' || o.status === 'DELIVERED');
  const cancelledOrders = partnerOrders.filter(o => o.cancelled_by === 'partner' || o.cancelled_by === user.id || o.cancelled_by === profile.id);
  
  const totalOrders = completedOrders.length;
  const completionRate = assignedOrderIds.length > 0 ? Math.round((completedOrders.length / assignedOrderIds.length) * 100) : 0;
  const cancellationRate = assignedOrderIds.length > 0 ? Math.round((cancelledOrders.length / assignedOrderIds.length) * 100) : 0;
  
  // Reviews
  const reviewsList = (db.ratings || db.reviews || []).filter(r => r.partner_id === profile.id || r.entity_id === profile.id);
  const ratingAvg = reviewsList.length > 0 ? (reviewsList.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviewsList.length) : 0;

  // Masking functions
  const mask = (str, showLast = 4) => str ? str.slice(-showLast).padStart(str.length, '*') : null;

  // Build activity to determine lastActivityAt
  const activities = [];
  earningsList.forEach(e => activities.push({ timestamp: e.earned_at || e.created_at }));
  assignments.forEach(a => activities.push({ timestamp: a.assigned_at || a.created_at || a.updated_at }));
  partnerOrders.forEach(o => activities.push({ timestamp: o.updated_at || o.created_at }));
  payouts.forEach(p => activities.push({ timestamp: p.created_at || p.updated_at }));
  
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const lastActivityAt = activities.length > 0 && activities[0].timestamp 
    ? new Date(activities[0].timestamp).toLocaleString() 
    : '--';

  const response = {
    partner: {
      id: user.id,
      partnerId: profile.partner_code || user.id.slice(0,8),
      name: user.name,
      email: user.email,
      mobileNumber: user.mobileNumber || user.phone,
      status: user.status || 'Active',
      role: user.role,
      rating: ratingAvg,
      reviewCount: reviewsList.length,
      joinedAt: profile.joined_at ? new Date(profile.joined_at).toLocaleDateString() : 'N/A',
      location: profile.city || 'N/A',
      totalOrders: totalOrders,
      totalEarnings: totalEarnings,
      todayEarnings: todayEarnings,
      completionRate: completionRate,
      cancellationRate: cancellationRate,
      lastActivityAt: lastActivityAt
    },
    personalDetails: {
      dateOfBirth: profile.dateOfBirth || profile.dob || null,
      gender: profile.gender || null,
      alternativeMobile: profile.alternateMobile || profile.alternativeMobile || null,
      emergencyContact: profile.emergencyContact || profile.emergencyContactName || null,
      emergencyContactRelation: profile.emergency_contact_relationship || profile.emergencyContactRelation || null,
      emergencyMobile: profile.emergencyMobile || profile.emergencyContactNumber || null,
      address: profile.address || null,
      addressLine1: profile.address_line_1 || null,
      addressLine2: profile.address_line_2 || null,
      city: profile.city || null,
      state: profile.state || null,
      postalCode: profile.postal_code || null,
      country: profile.country || null,
      panNumber: mask(pan),
      aadhaarNumber: mask(aadhaar)
    },
    vehicle: {
      vehicleType: vehicleData.vehicleType || null,
      vehicleName: vehicleData.vehicleName || null,
      vehicleNumber: vehicleData.vehicleNumber || null,
      rcNumber: rc || null,
      insuranceProvider: vehicleData.insurance_provider || vehicleData.insuranceProvider || null,
      insuranceNumber: vehicleData.insuranceNumber || null,
      validTill: vehicleData.insuranceValidTill || null
    },
    driving: {
      drivingLicenseNumber: profile.driving_license_number || null,
      drivingLicenseExpiry: profile.driving_license_expiry || null
    },
    earnings: {
      totalEarnings: totalEarnings,
      thisWeek: thisWeek,
      thisMonth: thisMonth,
      totalPayouts: totalPayouts
    },
    bankAccount: {
      bankName: bankData.bankName || null,
      accountNumberMasked: mask(bankData.accountNumber),
      ifscCode: bankData.ifscCode || null,
      accountHolderName: bankData.accountHolderName || null
    },
    documents: ['aadhaar', 'driving_license', 'pan', 'profile_photo', 'rc', 'insurance'].map(type => {
      const existingDoc = userDocs.find(d => d.document_type === type);
      if (existingDoc) {
        return {
          document_type: existingDoc.document_type,
          verification_status: existingDoc.verification_status || 'Pending',
          document_number: existingDoc.document_number,
          expires_at: existingDoc.expires_at || null,
          file_path: existingDoc.file_path || null
        };
      }
      return {
        document_type: type,
        verification_status: 'Pending',
        document_number: null,
        expires_at: null,
        file_path: null
      };
    })
  };

  return res.json(response);
});

// GET /api/v1/admin/partners/:id/activity
app.get('/api/v1/admin/partners/:id/activity', (req, res) => {
  const db = router.db.getState();
  const user = (db.users || []).find(u => u.id === req.params.id && u.role === 'Delivery Partner');
  if (!user) return res.status(404).json({ success: false, message: 'Partner not found' });
  const profile = (db.partner_profiles || []).find(p => p.user_id === user.id) || {};
  
  const activities = [];
  
  // Earnings
  const earningsList = (db.partner_earnings || []).filter(e => e.partner_id === profile.id);
  earningsList.forEach(e => {
    activities.push({
      type: 'EARNING',
      details: `Earned ₹${e.net_amount || e.amount} for order`,
      timestamp: e.earned_at || e.created_at || new Date().toISOString()
    });
  });
  
  // Assignments
  const assignments = (db.request_assignments || []).filter(a => a.partner_id === profile.id);
  assignments.forEach(a => {
    activities.push({
      type: 'ASSIGNMENT',
      details: `Assignment ${a.assignment_status || 'created'} for order ${a.order_id || a.request_id}`,
      timestamp: a.updated_at || a.assigned_at || a.created_at || new Date().toISOString()
    });
  });

  // Requests
  const assignedOrderIds = [...new Set(assignments.map(a => a.order_id || a.request_id))];
  const allOrders = db.orders || db.requests || [];
  const partnerOrders = allOrders.filter(o => assignedOrderIds.includes(o.id));
  partnerOrders.forEach(o => {
     activities.push({
      type: 'REQUEST',
      details: `Request ${o.id} status is now ${o.status}`,
      timestamp: o.updated_at || o.created_at || new Date().toISOString()
     });
  });

  // Payouts
  const payouts = (db.partner_payouts || []).filter(p => p.partner_id === profile.id);
  payouts.forEach(p => {
    activities.push({
      type: 'PAYOUT',
      details: `Payout of ₹${p.amount} is ${p.status || 'Processed'}`,
      timestamp: p.processed_at || p.created_at || new Date().toISOString()
    });
  });

  // Sort descending
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Remove duplicate timestamps with same details
  const uniqueActivities = [];
  const seen = new Set();
  for (const act of activities) {
    const key = `${act.details}-${act.timestamp}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueActivities.push(act);
    }
  }

  return res.json({ content: uniqueActivities });
});

// GET /api/v1/admin/partners/:id/reviews
app.get('/api/v1/admin/partners/:id/reviews', (req, res) => {
  const db = router.db.getState();
  const user = (db.users || []).find(u => u.id === req.params.id && u.role === 'Delivery Partner');
  if (!user) return res.status(404).json({ success: false, message: 'Partner not found' });
  const profile = (db.partner_profiles || []).find(p => p.user_id === user.id) || {};
  
  const reviews = (db.ratings || db.reviews || []).filter(r => r.partner_id === profile.id || r.entity_id === profile.id);
  return res.json({ reviews, summary: { total: reviews.length } });
});

// POST /api/v1/admin/partners (Normalized Create)
app.post('/api/v1/admin/partners', upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'aadhaarFile', maxCount: 1 },
  { name: 'drivingLicenseFile', maxCount: 1 },
  { name: 'panFile', maxCount: 1 },
  { name: 'rcFile', maxCount: 1 },
  { name: 'insuranceFile', maxCount: 1 }
]), (req, res) => {
  const data = req.body;
  const files = req.files || {};
  const db = router.db;
  
  const userId = ulid();
  const profileId = ulid();
  
  // 1. users
  const newUser = {
    id: userId,
    name: data.name,
    email: data.email,
    mobileNumber: data.mobileNumber,
    phone: data.mobileNumber,
    role: 'Delivery Partner',
    status: data.status || 'Active',
    profileImage: files.profileImage ? `/uploads/${files.profileImage[0].filename}` : null
  };
  db.get('users').push(newUser).write();
  
  // 2. partner_profiles
  const newProfile = {
    id: profileId,
    user_id: userId,
    dateOfBirth: data.dateOfBirth,
    gender: data.gender,
    alternateMobile: data.alternateMobile,
    emergencyContact: data.emergencyContact,
    emergency_contact_relationship: data.emergencyContactRelation,
    emergencyMobile: data.emergencyMobile,
    city: data.city,
    address: data.address, 
    address_line_1: data.addressLine1,
    address_line_2: data.addressLine2,
    state: data.state,
    postal_code: data.postalCode,
    country: data.country,
    driving_license_number: data.drivingLicenseNumber,
    driving_license_expiry: data.drivingLicenseExpiry,
    online_status: data.onlineStatus || 'Offline',
    joined_at: new Date().toISOString()
  };
  db.get('partner_profiles').push(newProfile).write();

  // 3. partner_vehicles
  if (data.vehicleType || data.vehicleNumber) {
    const newVehicle = {
      id: ulid(),
      partner_id: profileId,
      vehicleType: data.vehicleType,
      vehicleName: data.vehicleName,
      vehicleNumber: data.vehicleNumber,
      insurance_provider: data.insuranceProvider,
      insuranceNumber: data.insuranceNumber,
      insuranceValidTill: data.insuranceValidTill
    };
    db.get('partner_vehicles').push(newVehicle).write();
  }

  // 4. partner_documents
  const saveDoc = (docType, docNumber, fileField) => {
    if (docNumber || (files[fileField] && files[fileField][0])) {
      db.get('partner_documents').push({
        id: ulid(), 
        partner_id: profileId, 
        document_type: docType, 
        document_number: docNumber || null,
        file_path: files[fileField] ? `/uploads/${files[fileField][0].filename}` : null,
        original_filename: files[fileField] ? files[fileField][0].originalname : null,
        mime_type: files[fileField] ? files[fileField][0].mimetype : null,
        uploaded_at: files[fileField] ? new Date().toISOString() : null
      }).write();
    }
  };

  saveDoc('aadhaar', data.aadhaarNumber, 'aadhaarFile');
  saveDoc('pan', data.panNumber, 'panFile');
  saveDoc('rc', data.rcNumber, 'rcFile');
  saveDoc('driving_license', data.drivingLicenseNumber, 'drivingLicenseFile');
  saveDoc('insurance', data.insuranceNumber, 'insuranceFile');

  // 5. partner_bank_accounts
  if (data.accountNumber || data.bankName) {
    const newBank = {
      id: ulid(),
      partner_id: profileId,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      ifscCode: data.ifscCode,
      accountHolderName: data.accountHolderName
    };
    db.get('partner_bank_accounts').push(newBank).write();
  }

  // Return the created partner mimicking the GET response
  return res.status(201).json({ id: userId, ...data });
});

// PATCH /api/v1/admin/partners/:id
app.patch('/api/v1/admin/partners/:id', upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'aadhaarFile', maxCount: 1 },
  { name: 'drivingLicenseFile', maxCount: 1 },
  { name: 'panFile', maxCount: 1 },
  { name: 'rcFile', maxCount: 1 },
  { name: 'insuranceFile', maxCount: 1 }
]), (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const files = req.files || {};
  const db = router.db;

  const user = db.get('users').find({ id }).value();
  if (!user) return res.status(404).json({ error: 'Partner not found' });

  const profile = db.get('partner_profiles').find({ user_id: id }).value();
  if (!profile) return res.status(404).json({ error: 'Profile not found' });
  const profileId = profile.id;

  // 1. users
  const userUpdates = {};
  if (data.name !== undefined) userUpdates.name = data.name;
  if (data.email !== undefined) userUpdates.email = data.email;
  if (data.mobileNumber !== undefined) {
    userUpdates.mobileNumber = data.mobileNumber;
    userUpdates.phone = data.mobileNumber;
  }
  if (data.status !== undefined) userUpdates.status = data.status;
  if (files.profileImage) {
    userUpdates.profileImage = `/uploads/${files.profileImage[0].filename}`;
  }
  if (Object.keys(userUpdates).length > 0) {
    db.get('users').find({ id }).assign(userUpdates).write();
  }

  // 2. partner_profiles
  const profileUpdates = {};
  if (data.dateOfBirth !== undefined) profileUpdates.dateOfBirth = data.dateOfBirth;
  if (data.gender !== undefined) profileUpdates.gender = data.gender;
  if (data.alternateMobile !== undefined) profileUpdates.alternateMobile = data.alternateMobile;
  if (data.emergencyContact !== undefined) profileUpdates.emergencyContact = data.emergencyContact;
  if (data.emergencyContactRelation !== undefined) profileUpdates.emergency_contact_relationship = data.emergencyContactRelation;
  if (data.emergencyMobile !== undefined) profileUpdates.emergencyMobile = data.emergencyMobile;
  if (data.city !== undefined) profileUpdates.city = data.city;
  if (data.address !== undefined) profileUpdates.address = data.address;
  if (data.addressLine1 !== undefined) profileUpdates.address_line_1 = data.addressLine1;
  if (data.addressLine2 !== undefined) profileUpdates.address_line_2 = data.addressLine2;
  if (data.state !== undefined) profileUpdates.state = data.state;
  if (data.postalCode !== undefined) profileUpdates.postal_code = data.postalCode;
  if (data.country !== undefined) profileUpdates.country = data.country;
  if (data.drivingLicenseNumber !== undefined) profileUpdates.driving_license_number = data.drivingLicenseNumber;
  if (data.drivingLicenseExpiry !== undefined) profileUpdates.driving_license_expiry = data.drivingLicenseExpiry;
  if (data.onlineStatus !== undefined) profileUpdates.online_status = data.onlineStatus;

  if (Object.keys(profileUpdates).length > 0) {
    db.get('partner_profiles').find({ user_id: id }).assign(profileUpdates).write();
  }

  // 3. partner_vehicles
  let vehicle = db.get('partner_vehicles').find({ partner_id: profileId }).value();
  if (vehicle) {
    const vUpdates = {};
    if (data.vehicleType !== undefined) vUpdates.vehicleType = data.vehicleType;
    if (data.vehicleName !== undefined) vUpdates.vehicleName = data.vehicleName;
    if (data.vehicleNumber !== undefined) vUpdates.vehicleNumber = data.vehicleNumber;
    if (data.insuranceProvider !== undefined) vUpdates.insurance_provider = data.insuranceProvider;
    if (data.insuranceNumber !== undefined) vUpdates.insuranceNumber = data.insuranceNumber;
    if (data.insuranceValidTill !== undefined) vUpdates.insuranceValidTill = data.insuranceValidTill;
    if (Object.keys(vUpdates).length > 0) {
      db.get('partner_vehicles').find({ partner_id: profileId }).assign(vUpdates).write();
    }
  } else if (data.vehicleType || data.vehicleNumber) {
    db.get('partner_vehicles').push({
      id: ulid(),
      partner_id: profileId,
      vehicleType: data.vehicleType,
      vehicleName: data.vehicleName,
      vehicleNumber: data.vehicleNumber,
      insurance_provider: data.insuranceProvider,
      insuranceNumber: data.insuranceNumber,
      insuranceValidTill: data.insuranceValidTill
    }).write();
  }

  // 4. partner_documents
  const updateDoc = (docType, docNumber, fileField) => {
    let doc = db.get('partner_documents').find({ partner_id: profileId, document_type: docType }).value();
    const hasNewFile = files[fileField] && files[fileField][0];
    if (doc) {
      const dUpdates = {};
      if (docNumber !== undefined) dUpdates.document_number = docNumber;
      if (hasNewFile) {
        dUpdates.file_path = `/uploads/${files[fileField][0].filename}`;
        dUpdates.original_filename = files[fileField][0].originalname;
        dUpdates.mime_type = files[fileField][0].mimetype;
        dUpdates.uploaded_at = new Date().toISOString();
      }
      if (Object.keys(dUpdates).length > 0) {
        db.get('partner_documents').find({ partner_id: profileId, document_type: docType }).assign(dUpdates).write();
      }
    } else if (docNumber || hasNewFile) {
      db.get('partner_documents').push({
        id: ulid(), 
        partner_id: profileId, 
        document_type: docType, 
        document_number: docNumber || null,
        file_path: hasNewFile ? `/uploads/${files[fileField][0].filename}` : null,
        original_filename: hasNewFile ? files[fileField][0].originalname : null,
        mime_type: hasNewFile ? files[fileField][0].mimetype : null,
        uploaded_at: hasNewFile ? new Date().toISOString() : null
      }).write();
    }
  };

  updateDoc('aadhaar', data.aadhaarNumber, 'aadhaarFile');
  updateDoc('pan', data.panNumber, 'panFile');
  updateDoc('rc', data.rcNumber, 'rcFile');
  updateDoc('driving_license', data.drivingLicenseNumber, 'drivingLicenseFile');
  updateDoc('insurance', data.insuranceNumber, 'insuranceFile');

  // 5. partner_bank_accounts
  let bank = db.get('partner_bank_accounts').find({ partner_id: profileId }).value();
  if (bank) {
    const bUpdates = {};
    if (data.bankName !== undefined) bUpdates.bankName = data.bankName;
    if (data.accountNumber !== undefined) bUpdates.accountNumber = data.accountNumber;
    if (data.ifscCode !== undefined) bUpdates.ifscCode = data.ifscCode;
    if (data.accountHolderName !== undefined) bUpdates.accountHolderName = data.accountHolderName;
    if (Object.keys(bUpdates).length > 0) {
      db.get('partner_bank_accounts').find({ partner_id: profileId }).assign(bUpdates).write();
    }
  } else if (data.accountNumber || data.bankName) {
    db.get('partner_bank_accounts').push({
      id: ulid(),
      partner_id: profileId,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      ifscCode: data.ifscCode,
      accountHolderName: data.accountHolderName
    }).write();
  }

  return res.json({ id, ...data, success: true });
});
// GET /api/v1/admin/customers (Aggregated List)
app.get('/api/v1/admin/customers', (req, res) => {
  console.log("HIT CUSTOMERS GET ENDPOINT");
  const db = router.db.getState();
  const users = db.users || [];
  const profiles = db.customer_profiles || [];

  const customerUsers = users.filter(u => u.role === 'Customer');

  const aggregated = customerUsers.map(user => {
    const profile = profiles.find(p => p.user_id === user.id) || {};
    return {
      id: user.public_id,
      public_id: user.public_id,
      userId: user.public_id, // For UI compatibility
      name: user.name,
      email: user.email,
      mobileNumber: user.mobileNumber || user.phone,
      status: user.status || 'ACTIVE',
      isVerified: user.isVerified || false,
      joinedOn: user.joinedOn || user.created_at || profile.created_at,
      profileImage: user.profileImage,
      role: user.role
    };
  });

  return res.json(aggregated);
});

// GET /api/v1/admin/customers/:publicId (Single)
app.get('/api/v1/admin/customers/:publicId', (req, res) => {
  const db = router.db.getState();
  const user = (db.users || []).find(u => u.public_id === req.params.publicId && u.role === 'Customer');
  if (!user) return res.status(404).json({ success: false, message: 'Customer not found' });
  const profile = (db.customer_profiles || []).find(p => p.user_id === user.id) || {};
  
  return res.json({
    id: user.public_id,
    public_id: user.public_id,
    userId: user.public_id,
    name: user.name,
    email: user.email,
    mobileNumber: user.mobileNumber || user.phone,
    status: user.status || 'ACTIVE',
    isVerified: user.isVerified || false,
    joinedOn: user.joinedOn || user.created_at || profile.created_at,
    profileImage: user.profileImage,
    role: user.role
  });
});

// POST /api/v1/admin/customers
app.post('/api/v1/admin/customers', upload.fields([
  { name: 'profileImage', maxCount: 1 }
]), (req, res) => {
  const data = req.body;
  const files = req.files || {};
  const db = router.db;
  
  const userId = ulid(); // internal ID
  const publicId = ulid(); // API-facing ID
  const profileId = ulid();
  
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
    profileImage: files.profileImage ? `/uploads/${files.profileImage[0].filename}` : null
  };
  
  if (!db.get('users').value()) {
    db.set('users', []).write();
  }
  db.get('users').push(newUser).write();
  
  const newProfile = {
    id: profileId,
    user_id: userId,
    created_at: new Date().toISOString()
  };
  
  if (!db.get('customer_profiles').value()) {
    db.set('customer_profiles', []).write();
  }
  db.get('customer_profiles').push(newProfile).write();

  const newWallet = {
    id: ulid(),
    public_id: ulid(),
    user_id: userId,
    balance: 0,
    created_at: new Date().toISOString()
  };
  
  if (!db.get('wallets').value()) {
    db.set('wallets', []).write();
  }
  db.get('wallets').push(newWallet).write();

  return res.status(201).json({ ...newUser, id: publicId, userId: publicId });
});

// PATCH /api/v1/admin/customers/:publicId
app.patch('/api/v1/admin/customers/:publicId', upload.fields([
  { name: 'profileImage', maxCount: 1 }
]), (req, res) => {
  const { publicId } = req.params;
  const data = req.body;
  const files = req.files || {};
  const db = router.db;

  const user = db.get('users').find({ public_id: publicId }).value();
  if (!user || user.role !== 'Customer') return res.status(404).json({ error: 'Customer not found' });

  const userUpdates = {};
  if (data.name !== undefined) userUpdates.name = data.name;
  if (data.email !== undefined) userUpdates.email = data.email;
  if (data.mobileNumber !== undefined) {
    userUpdates.mobileNumber = data.mobileNumber;
  }
  if (data.status !== undefined) userUpdates.status = data.status;
  if (data.isVerified !== undefined) userUpdates.isVerified = data.isVerified === 'true' || data.isVerified === true;
  if (files.profileImage) {
    userUpdates.profileImage = `/uploads/${files.profileImage[0].filename}`;
  }

  if (Object.keys(userUpdates).length > 0) {
    db.get('users').find({ public_id: publicId }).assign(userUpdates).write();
  }

  return res.json({ id: publicId, userId: publicId, ...user, ...userUpdates, success: true });
});

// PATCH /api/v1/admin/customers/:publicId/status
app.patch('/api/v1/admin/customers/:publicId/status', (req, res) => {
  const { publicId } = req.params;
  const { status } = req.body;
  const db = router.db;

  const user = db.get('users').find({ public_id: publicId }).value();
  if (!user || user.role !== 'Customer') return res.status(404).json({ error: 'Customer not found' });

  db.get('users').find({ public_id: publicId }).assign({ status }).write();
  return res.json({ success: true, status });
});

// GET /api/v1/admin/customers/:publicId/requests
app.get('/api/v1/admin/customers/:publicId/requests', (req, res) => {
  const db = router.db.getState();
  const user = (db.users || []).find(u => u.public_id === req.params.publicId);
  if (!user) return res.json([]);
  
  const userRequests = (db.requests || []).filter(r => r.user_id === user.id);
  return res.json(userRequests);
});

// GET /api/v1/admin/customers/:publicId/wallet
app.get('/api/v1/admin/customers/:publicId/wallet', (req, res) => {
  const db = router.db.getState();
  const user = (db.users || []).find(u => u.public_id === req.params.publicId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  
  const wallet = (db.wallets || []).find(w => w.user_id === user.id);
  return res.json(wallet || null);
});

// GET /api/v1/admin/customers/:publicId/wallet/transactions
app.get('/api/v1/admin/customers/:publicId/wallet/transactions', (req, res) => {
  const db = router.db.getState();
  const user = (db.users || []).find(u => u.public_id === req.params.publicId);
  if (!user) return res.json([]);
  
  const wallet = (db.wallets || []).find(w => w.user_id === user.id);
  if (!wallet) return res.json([]);
  
  const txns = (db.wallet_transactions || []).filter(t => t.wallet_id === wallet.id);
  return res.json(txns);
});

// GET /api/v1/admin/customers/:publicId/complaints
app.get('/api/v1/admin/customers/:publicId/complaints', (req, res) => {
  // Empty since we lack a real foreign key for complaints currently
  return res.json([]);
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
