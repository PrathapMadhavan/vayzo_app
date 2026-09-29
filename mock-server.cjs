const jsonServer = require("json-server");
const multer = require("multer");
const { ulid } = require("ulid");
const fs = require("fs");
const path = require("path");

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "public/uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, ulid() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Utility to get authenticated user ID based on token
function getAuthenticatedUserId(req) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const token = auth.split(" ")[1];
  if (token === "TOKEN_CUSTA") return "UFt__KjoFIQ"; // Deepa's internal ID
  if (token === "TOKEN_CUSTB") return "xwLm2deEz3g"; // Meera's internal ID
  return null;
}

// 1. AUTHENTICATION ENDPOINTS
server.post("/api/v1/auth/send-otp", (req, res) => {
  res.json({
    success: true,
    message: "OTP sent successfully",
    data: { verificationId: "VER123", expiresIn: 120 },
  });
});

server.post("/api/v1/auth/verify-otp", (req, res) => {
  const { mobileNumber } = req.body;
  let token = null;
  let user = null;
  const db = router.db.getState();

  if (mobileNumber === "+919876543213") {
    // Deepa
    token = "TOKEN_CUSTA";
    user = db.users.find((u) => u.id === "UFt__KjoFIQ");
  } else if (mobileNumber === "+919876543215") {
    // Meera
    token = "TOKEN_CUSTB";
    user = db.users.find((u) => u.id === "xwLm2deEz3g");
  } else {
    return res
      .status(401)
      .json({ success: false, message: "Invalid OTP or User" });
  }

  res.json({
    success: true,
    message: "OTP verified successfully",
    data: {
      accessToken: token,
      user: {
        customerId: user.public_id,
        name: user.name,
        mobileNumber: user.mobileNumber,
      },
    },
  });
});

server.post("/api/v1/auth/register", (req, res) => {
  res.json({ success: true, message: "Not required for test flow" });
});

server.post("/api/v1/auth/logout", (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

// 1.5 ADMIN AUTHENTICATION ENDPOINTS
server.post("/api/v1/admin/auth/login", (req, res) => {
  const { email, password } = req.body;
  const db = router.db.getState();

  const admin = db.adminUsers.find((u) => u.email === email);
  if (!admin) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid email or password" });
  }
  if (admin.password !== password) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }
  if (admin.status !== "Active" && admin.status !== "ACTIVE") {
    return res
      .status(403)
      .json({ success: false, message: "Admin account is not active." });
  }

  const token = `vayzo_admin_${Math.random().toString(36).substr(2, 9)}`;

  res.json({
    success: true,
    message: "Login successful",
    data: {
      accessToken: token,
      tokenType: "Bearer",
      user: admin,
    },
  });
});

server.post("/api/v1/admin/auth/send-otp", (req, res) => {
  const { mobileNumber } = req.body;
  const db = router.db.getState();

  const admin = db.adminUsers.find(
    (u) => u.phone === mobileNumber || u.mobileNumber === mobileNumber,
  );
  if (!admin) {
    return res
      .status(404)
      .json({
        success: false,
        message: "Admin account not found. Please check your mobile number.",
      });
  }

  if (admin.status !== "Active" && admin.status !== "ACTIVE") {
    return res
      .status(403)
      .json({ success: false, message: "Admin account is not active." });
  }

  res.json({
    success: true,
    message: "OTP sent successfully",
  });
});

server.post("/api/v1/admin/auth/verify-otp", (req, res) => {
  const { mobileNumber, otp } = req.body;

  if (otp !== "123456") {
    return res
      .status(400)
      .json({ success: false, message: "Invalid OTP. Please try again." });
  }

  const db = router.db.getState();
  const admin = db.adminUsers.find(
    (u) => u.phone === mobileNumber || u.mobileNumber === mobileNumber,
  );

  if (!admin) {
    return res
      .status(404)
      .json({ success: false, message: "Admin account not found." });
  }

  const token = `vayzo_admin_${Math.random().toString(36).substr(2, 9)}`;

  res.json({
    success: true,
    message: "Login successful",
    data: {
      accessToken: token,
      tokenType: "Bearer",
      user: admin,
    },
  });
});

server.post("/api/v1/admin/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  const db = router.db.getState();

  const admin = db.adminUsers.find((u) => u.email === email);
  if (!admin) {
    return res
      .status(404)
      .json({
        success: false,
        message:
          "Email not registered as an Admin. Please check the email address.",
      });
  }

  if (admin.status !== "Active" && admin.status !== "ACTIVE") {
    return res
      .status(403)
      .json({ success: false, message: "Admin account is not active." });
  }

  res.json({
    success: true,
    message: "Reset link sent successfully",
  });
});

// ADMIN AUTH MIDDLEWARE
server.use((req, res, next) => {
  // If request is for an admin endpoint and not auth, require token
  const isAdminEndpoint =
    req.path.startsWith("/adminUsers") ||
    (req.path.startsWith("/api/v1/admin") && !req.path.includes("/auth"));

  if (isAdminEndpoint) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer vayzo_admin_")) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
  }

  next();
});

// 2. PROFILE ENDPOINT
server.get("/api/v1/customer/profile", (req, res) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  const db = router.db.getState();
  const user = db.users.find((u) => u.id === userId);
  const profile = db.customer_profiles.find((p) => p.user_id === userId) || {};

  res.json({
    success: true,
    data: {
      customerId: user.public_id,
      name: user.name,
      email: user.email,
      mobileNumber: user.mobileNumber,
      profileImage: profile.profile_photo,
      dateOfBirth: profile.date_of_birth,
      gender: profile.gender,
    },
  });
});

server.put("/api/v1/customer/profile", (req, res) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  const db = router.db.getState();
  const user = db.users.find((u) => u.id === userId);
  const profile = db.customer_profiles.find((p) => p.user_id === userId) || {};

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
      email: user.email,
    },
  });
});

// OWNERSHIP MIDDLEWARE FOR PROFILE/AUTH IS ALREADY HANDLED

// Explicit endpoints for Requests and Wallets to guarantee filtering
server.get("/api/v1/requests", (req, res) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  const db = router.db.getState();
  const userRequests = db.requests.filter((r) => r.user_id === userId);

  // Embed relationships manually
  const result = userRequests.map((r) => ({
    ...r,
    request_items: db.request_items.filter((i) => i.request_id === r.id),
    assignments: db.assignments.filter((a) => a.request_id === r.id),
  }));

  res.json(result);
});

server.get("/api/v1/requests/:id", (req, res) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  const db = router.db.getState();
  const r = db.requests.find(
    (r) => r.public_id === req.params.id || r.id === req.params.id,
  );
  if (!r || r.user_id !== userId) return res.status(404).json({});

  res.json({
    ...r,
    request_items: db.request_items.filter((i) => i.request_id === r.id),
    assignments: db.assignments.filter((a) => a.request_id === r.id),
  });
});

server.get("/api/v1/wallet", (req, res) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  const db = router.db.getState();
  const wallet = db.wallets.find((w) => w.user_id === userId);
  if (!wallet) return res.status(404).json({});

  // Embed transactions manually
  const transactions = db.wallet_transactions.filter(
    (t) => t.wallet_id === wallet.id,
  );
  res.json({ ...wallet, transactions });
});

server.get("/api/v1/wallet/transactions", (req, res) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  const db = router.db.getState();
  const wallet = db.wallets.find((w) => w.user_id === userId);
  if (!wallet) return res.json([]);

  const transactions = db.wallet_transactions.filter(
    (t) => t.wallet_id === wallet.id,
  );
  res.json(transactions);
});

const { getPartnerAggregatedData } = require("./partner-aggregation.cjs");

server.get("/api/v1/admin/partners/:id", (req, res) => {
  const db = router.db.getState();
  const data = getPartnerAggregatedData(db, req.params.id);
  if (!data)
    return res
      .status(404)
      .json({ success: false, message: "Partner not found" });
  res.json({ success: true, data });
});

server.get("/api/v1/admin/partners/:id/documents", (req, res) => {
  const db = router.db.getState();
  const data = getPartnerAggregatedData(db, req.params.id);
  if (!data)
    return res
      .status(404)
      .json({ success: false, message: "Partner not found" });
  res.json({ success: true, data: data.documents });
});

server.get("/api/v1/admin/partners/:id/activity", (req, res) => {
  const db = router.db.getState();
  const pId = req.params.id;

  const profile = db.partner_profiles
    ? db.partner_profiles.find((p) => p.id === pId || p.partner_code === pId)
    : null;
  const internalId = profile ? profile.id : pId;

  let activities = [];
  const assignments = db.request_assignments
    ? db.request_assignments.filter((a) => a.partner_id === internalId)
    : [];
  const requestIds = assignments.map((a) => a.request_id);

  if (db.request_status_history) {
    const history = db.request_status_history.filter((h) =>
      requestIds.includes(h.request_id),
    );
    activities = history.map((h) => ({
      id: h.id,
      type: "REQUEST_STATUS",
      action: h.status,
      timestamp: h.created_at,
      details: `Request ${h.request_id} changed to ${h.status}`,
    }));
  }

  if (db.partner_earnings) {
    const earnings = db.partner_earnings.filter(
      (e) => e.partner_id === internalId,
    );
    activities.push(
      ...earnings.map((e) => ({
        id: e.id,
        type: "EARNING",
        action: "Earned",
        timestamp: e.earned_at || e.created_at || new Date().toISOString(),
        details: `Earned ₹${e.net_amount}`,
      })),
    );
  }

  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  res.json({ success: true, data: { content: activities } });
});

server.get("/api/v1/admin/partners/:id/reviews", (req, res) => {
  const db = router.db.getState();
  const pId = req.params.id;
  const profile = db.partner_profiles
    ? db.partner_profiles.find((p) => p.id === pId || p.partner_code === pId)
    : null;
  const internalId = profile ? profile.id : pId;

  const reviews = db.ratings_reviews
    ? db.ratings_reviews.filter((r) => r.partner_id === internalId)
    : [];
  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  res.json({
    success: true,
    data: {
      summary: { averageRating: avg, reviewCount: reviews.length },
      reviews,
    },
  });
});
// CUSTOMER PUBLIC_ID ROUTES
server.get("/api/v1/admin/customers/:id", (req, res, next) => {
  const db = router.db.getState();
  const id = req.params.id;
  const user = db.users.find(
    (u) => u.role === "Customer" && (u.public_id === id || u.id === id),
  );
  if (user) res.json(user);
  else next();
});

server.patch("/api/v1/admin/customers/:id", (req, res, next) => {
  if (req.path.endsWith("/status")) return next();
  const db = router.db.getState();
  const id = req.params.id;
  const user = db.users.find(
    (u) => u.role === "Customer" && (u.public_id === id || u.id === id),
  );
  if (user) {
    Object.assign(user, req.body);
    router.db.write();
    res.json(user);
  } else next();
});

server.patch("/api/v1/admin/customers/:id/status", (req, res, next) => {
  const db = router.db.getState();
  const id = req.params.id;
  const user = db.users.find(
    (u) => u.role === "Customer" && (u.public_id === id || u.id === id),
  );
  if (user) {
    user.status = req.body.status;
    router.db.write();
    res.json(user);
  } else next();
});

server.delete("/api/v1/admin/customers/:id", (req, res, next) => {
  const db = router.db.getState();
  const id = req.params.id;
  const user = db.users.find(
    (u) => u.role === "Customer" && (u.public_id === id || u.id === id),
  );
  if (user) {
    db.users = db.users.filter((u) => u.id !== user.id);
    router.db.write();
    res.json({});
  } else next();
});

server.get("/api/v1/admin/customers/:id/requests", (req, res, next) => {
  const db = router.db.getState();
  const id = req.params.id;
  const user = db.users.find(
    (u) => u.role === "Customer" && (u.public_id === id || u.id === id),
  );
  if (user) {
    const requests = db.requests.filter((r) => r.customer_id === user.id);
    res.json(requests);
  } else next();
});

server.get("/api/v1/admin/customers/:id/wallet", (req, res, next) => {
  const db = router.db.getState();
  const id = req.params.id;
  const user = db.users.find(
    (u) => u.role === "Customer" && (u.public_id === id || u.id === id),
  );
  if (user) {
    const wallet = db.wallets.find((w) => w.user_id === user.id);
    if (!wallet)
      return res
        .status(404)
        .json({ success: false, message: "Wallet not found" });
    res.json(wallet);
  } else next();
});

server.get(
  "/api/v1/admin/customers/:id/wallet/transactions",
  (req, res, next) => {
    const db = router.db.getState();
    const id = req.params.id;
    const user = db.users.find(
      (u) => u.role === "Customer" && (u.public_id === id || u.id === id),
    );
    if (user) {
      const wallet = db.wallets.find((w) => w.user_id === user.id);
      if (!wallet) return res.json([]);
      const tx = db.wallet_transactions.filter(
        (t) => t.wallet_id === wallet.id,
      );
      res.json(tx);
    } else next();
  },
);

server.get("/api/v1/admin/customers/:id/complaints", (req, res, next) => {
  const db = router.db.getState();
  const id = req.params.id;
  const user = db.users.find(
    (u) => u.role === "Customer" && (u.public_id === id || u.id === id),
  );
  if (user) {
    const complaints = db.complaints.filter((c) => c.customer_id === user.id);
    res.json(complaints);
  } else next();
});

// GET /api/v1/admin/partners - custom aggregation endpoint
server.get("/api/v1/admin/partners", (req, res) => {
  const db = router.db.getState();
  const users = db.users || [];
  const profiles = db.partner_profiles || [];
  const vehicles = db.partner_vehicles || [];
  const legacyPartners = db.partners || [];

  const partners = [];

  // 1. Process canonical normalized partners
  const canonicalUsers = users.filter((u) => u.role === "Delivery Partner");
  for (const user of canonicalUsers) {
    const profile = profiles.find((p) => p.user_id === user.id);
    const vehicle = profile
      ? vehicles.find((v) => v.partner_id === profile.id)
      : null;

    partners.push({
      id: user.id,
      name: user.name,
      mobileNumber: user.mobileNumber || user.mobile_number || "",
      vehicleType: vehicle ? vehicle.vehicle_type : null,
      vehicleNumber: vehicle ? vehicle.registration_number : null,
      status:
        user.status || (profile ? profile.verification_status : "Pending"),
      onlineStatus: profile ? profile.online_status : "Offline",
      profileImage: user.profileImage || user.profile_image || null,
    });
  }

  // 2. Append legacy partners (HARII)
  for (const lp of legacyPartners) {
    // Only append if it hasn't been merged into canonical (for future-proofing)
    if (!partners.some((p) => p.id === lp.id)) {
      partners.push({
        id: lp.id,
        name: lp.name,
        mobileNumber: lp.mobileNumber || "",
        vehicleType: lp.vehicleType || null,
        vehicleNumber: lp.vehicleNumber || null,
        status: lp.status || "Pending",
        onlineStatus: lp.onlineStatus || "Offline",
        profileImage: lp.profileImage || null,
      });
    }
  }

  res.json(partners);
});

// POST /api/v1/admin/partners - Custom multipart form data handler
server.post(
  "/api/v1/admin/partners",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "aadhaarFile", maxCount: 1 },
    { name: "panFile", maxCount: 1 },
    { name: "rcFile", maxCount: 1 },
    { name: "insuranceFile", maxCount: 1 }
  ]),
  (req, res) => {
    const db = router.db.getState();
    const b = req.body;
    const files = req.files || {};

    // 1. Create canonical user record
    const userId = ulid();
    const newUser = {
      id: userId,
      name: b.name || "",
      email: b.email || "",
      mobileNumber: b.mobileNumber || "",
      role: "Delivery Partner",
      status: b.status || "Active",
      joinedOn: new Date().toISOString().split("T")[0],
    };
    if (files.profileImage && files.profileImage[0]) {
      newUser.profileImage = "/uploads/" + files.profileImage[0].filename;
    }
    db.users = db.users || [];
    db.users.push(newUser);

    // 2. Create partner_profiles record
    const profileId = ulid();
    const newProfile = {
      id: profileId,
      user_id: userId,
      partner_code: "VP-" + userId.slice(-6),
      verification_status: b.status || "Active",
      online_status: b.onlineStatus || "Offline",
      gender: b.gender || null,
      dateOfBirth: b.dateOfBirth || null,
      alternateMobile: b.alternateMobile || null,
      emergencyContact: b.emergencyContact || null,
      emergencyMobile: b.emergencyMobile || null,
      address: b.address || null,
      city: b.city || null,
      rating_avg: 0,
      rating_count: 0,
      joined_at: new Date().toISOString(),
    };
    db.partner_profiles = db.partner_profiles || [];
    db.partner_profiles.push(newProfile);

    // 3. Create partner_vehicles if vehicle data was supplied
    const hasVehicle = b.vehicleType && b.vehicleType !== "Select vehicle type";
    if (hasVehicle) {
      const vehicleId = ulid();
      const newVehicle = {
        id: vehicleId,
        partner_id: profileId,
        vehicle_type: b.vehicleType || null,
        make: "",
        model: b.vehicleName || "",
        registration_number: b.vehicleNumber || null,
      };
      db.partner_vehicles = db.partner_vehicles || [];
      db.partner_vehicles.push(newVehicle);
    }

    // 4. Create partner_bank_accounts if bank data was supplied
    const hasBank = b.bankName && b.bankName !== "Select Bank";
    if (hasBank) {
      const bankId = ulid();
      const newBank = {
        id: bankId,
        partner_id: profileId,
        bank_name: b.bankName || null,
        account_holder_name: b.accountHolderName || null,
        account_number: b.accountNumber || null,
        ifsc_code: b.ifscCode || null,
        is_primary: true,
      };
      db.partner_bank_accounts = db.partner_bank_accounts || [];
      db.partner_bank_accounts.push(newBank);
    }

    // 5. Create document records if aadhaar/pan numbers were supplied
    // 5. Create document records if files/numbers were supplied
    db.partner_documents = db.partner_documents || [];
    
    const addDocument = (type, num, fileField) => {
      const file = files[fileField] ? files[fileField][0] : null;
      if (num || file) {
        db.partner_documents.push({
          id: ulid(),
          partner_id: profileId,
          document_type: type.toLowerCase(),
          type: type.toUpperCase(), // For new frontend mapping
          document_number: num || null,
          url: file ? "/uploads/" + file.filename : null,
          status: "Pending"
        });
      }
    };

    addDocument("AADHAAR", b.aadhaarNumber, "aadhaarFile");
    addDocument("PAN", b.panNumber, "panFile");
    addDocument("RC", b.rcNumber, "rcFile");
    addDocument("INSURANCE", b.insuranceNumber, "insuranceFile");

    router.db.write();

    // Return the same shape as the GET list item
    res.status(201).json({
      success: true,
      data: {
        id: userId,
        name: newUser.name,
        mobileNumber: newUser.mobileNumber,
        email: newUser.email,
        status: newUser.status,
        profileImage: newUser.profileImage || null,
        vehicleType: hasVehicle ? b.vehicleType : null,
        vehicleNumber: hasVehicle ? b.vehicleNumber : null,
        onlineStatus: newProfile.online_status,
      },
    });
  },
);

// PATCH /api/v1/admin/partners/:id - Custom update handler
server.patch(
  "/api/v1/admin/partners/:id",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "aadhaarFile", maxCount: 1 },
    { name: "panFile", maxCount: 1 },
    { name: "rcFile", maxCount: 1 },
    { name: "insuranceFile", maxCount: 1 }
  ]),
  (req, res) => {
    const db = router.db.getState();
    const userId = req.params.id;
    const b = req.body;
    const files = req.files || {};

    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: "Partner not found" });

    // Update User
    if (b.name) user.name = b.name;
    if (b.email !== undefined) user.email = b.email;
    if (b.mobileNumber !== undefined) user.mobileNumber = b.mobileNumber;
    if (b.status) user.status = b.status;
    if (files.profileImage && files.profileImage[0]) {
      user.profileImage = "/uploads/" + files.profileImage[0].filename;
    }

    // Update Profile
    let profile = db.partner_profiles.find(p => p.user_id === userId);
    if (profile) {
      if (b.status) profile.verification_status = b.status;
      if (b.onlineStatus) profile.online_status = b.onlineStatus;
      if (b.gender !== undefined) profile.gender = b.gender;
      if (b.dateOfBirth !== undefined) profile.dateOfBirth = b.dateOfBirth;
      if (b.alternateMobile !== undefined) profile.alternateMobile = b.alternateMobile;
      if (b.emergencyContact !== undefined) profile.emergencyContact = b.emergencyContact;
      if (b.emergencyMobile !== undefined) profile.emergencyMobile = b.emergencyMobile;
      if (b.address !== undefined) profile.address = b.address;
      if (b.city !== undefined) profile.city = b.city;
    } else {
      // Create if missing
      profile = {
        id: ulid(), user_id: userId, partner_code: "VP-" + userId.slice(-6),
        verification_status: b.status || "Active", online_status: b.onlineStatus || "Offline",
        gender: b.gender || null, dateOfBirth: b.dateOfBirth || null, alternateMobile: b.alternateMobile || null,
        emergencyContact: b.emergencyContact || null, emergencyMobile: b.emergencyMobile || null,
        address: b.address || null, city: b.city || null, rating_avg: 0, rating_count: 0, joined_at: new Date().toISOString()
      };
      db.partner_profiles.push(profile);
    }
    const profileId = profile.id;

    // Determine verification_status based on documents logic
    // "documents upload pannalanaa pending la irukanum"
    db.partner_documents = db.partner_documents || [];
    const existingDocs = db.partner_documents.filter(d => d.partner_id === profileId);
    let hasAnyDoc = existingDocs.length > 0;
    
    const addOrUpdateDocument = (type, num, fileField) => {
      const file = files[fileField] ? files[fileField][0] : null;
      let doc = existingDocs.find(d => d.document_type === type.toLowerCase() || d.type === type.toUpperCase());
      if (num || file) hasAnyDoc = true;
      if (doc) {
        if (num) doc.document_number = num;
        if (file) doc.url = "/uploads/" + file.filename;
      } else if (num || file) {
        db.partner_documents.push({
          id: ulid(), partner_id: profileId, document_type: type.toLowerCase(), type: type.toUpperCase(),
          document_number: num || null, url: file ? "/uploads/" + file.filename : null, status: "Pending"
        });
      }
    };
    addOrUpdateDocument("AADHAAR", b.aadhaarNumber, "aadhaarFile");
    addOrUpdateDocument("PAN", b.panNumber, "panFile");
    addOrUpdateDocument("RC", b.rcNumber, "rcFile");
    addOrUpdateDocument("INSURANCE", b.insuranceNumber, "insuranceFile");

    // Override to pending if NO documents exist
    if (!hasAnyDoc) {
      profile.verification_status = "Pending";
      user.status = "Pending";
    }

    // Update Vehicle
    if (b.vehicleType || b.vehicleNumber) {
      let vehicle = db.partner_vehicles.find(v => v.partner_id === profileId);
      if (vehicle) {
        if (b.vehicleType !== undefined) vehicle.vehicle_type = b.vehicleType;
        if (b.vehicleName !== undefined) vehicle.model = b.vehicleName;
        if (b.vehicleNumber !== undefined) vehicle.registration_number = b.vehicleNumber;
      } else {
        db.partner_vehicles.push({
          id: ulid(), partner_id: profileId, vehicle_type: b.vehicleType || null, make: "", model: b.vehicleName || "", registration_number: b.vehicleNumber || null
        });
      }
    }

    // Update Bank
    if (b.bankName || b.accountNumber) {
      let bank = db.partner_bank_accounts.find(bAcc => bAcc.partner_id === profileId);
      if (bank) {
        if (b.bankName !== undefined) bank.bank_name = b.bankName;
        if (b.accountHolderName !== undefined) bank.account_holder_name = b.accountHolderName;
        if (b.accountNumber !== undefined) bank.account_number = b.accountNumber;
        if (b.ifscCode !== undefined) bank.ifsc_code = b.ifscCode;
      } else {
        db.partner_bank_accounts.push({
          id: ulid(), partner_id: profileId, bank_name: b.bankName || null, account_holder_name: b.accountHolderName || null, account_number: b.accountNumber || null, ifsc_code: b.ifscCode || null, is_primary: true
        });
      }
    }

    router.db.write();
    res.json({ success: true, data: user });
  }
);

// DELETE /api/v1/admin/partners/:id - Custom delete handler
server.delete("/api/v1/admin/partners/:id", (req, res) => {
  const db = router.db.getState();
  const userId = req.params.id;

  const userIndex = db.users.findIndex(u => u.id === userId);
  if (userIndex !== -1) db.users.splice(userIndex, 1);

  if (db.partner_profiles) {
    const profile = db.partner_profiles.find(p => p.user_id === userId);
    if (profile) {
      const pId = profile.id;
      db.partner_profiles = db.partner_profiles.filter(p => p.id !== pId);
      if (db.partner_vehicles) db.partner_vehicles = db.partner_vehicles.filter(v => v.partner_id !== pId);
      if (db.partner_bank_accounts) db.partner_bank_accounts = db.partner_bank_accounts.filter(b => b.partner_id !== pId);
      if (db.partner_documents) db.partner_documents = db.partner_documents.filter(d => d.partner_id !== pId);
    }
  }

  router.db.write();
  res.json({ success: true });
});


// POST /api/v1/admin/customers - Custom multipart form data handler
server.post(
  "/api/v1/admin/customers",
  upload.single("profileImage"),
  (req, res) => {
    const db = router.db.getState();

    const newId = ulid();
    const publicId = ulid();

    const newCustomer = {
      id: newId,
      public_id: publicId,
      name: req.body.name || "",
      email: req.body.email || "",
      mobileNumber: req.body.mobileNumber || "",
      role: "Customer",
      status: req.body.status || "Active",
      isVerified:
        req.body.isVerified === "true" || req.body.isVerified === true,
      joinedOn: new Date().toISOString().split("T")[0],
    };

    if (req.file) {
      newCustomer.profileImage = "/uploads/" + req.file.filename;
    }

    // Insert into DB
    db.users = db.users || [];
    db.users.push(newCustomer);
    router.db.write();

    res.status(201).json(newCustomer);
  },
);

// REWRITE RULES for ratings and new admin endpoints
server.use((req, res, next) => {
  const queryIndex = req.url.indexOf('?');
  if (queryIndex !== -1) {
    req._savedQuery = req.url.substring(queryIndex);
    req.url = req.url.substring(0, queryIndex);
  }
  next();
});

server.use(
  jsonServer.rewriter({
    "/api/v1/admin/customers/*": "/users/$1",
    "/api/v1/admin/customers": "/users?role=Customer",
    "/api/v1/admin/requests/*": "/requests/$1",
    "/api/v1/admin/requests": "/requests",
    "/api/v1/admin/finance/payments/*": "/payments/$1",
    "/api/v1/admin/finance/payments": "/payments",
    "/api/v1/admin/finance/wallets/*": "/wallets/$1",
    "/api/v1/admin/finance/wallets": "/wallets",
    "/api/v1/admin/finance/wallet-transactions/*": "/wallet_transactions/$1",
    "/api/v1/admin/finance/wallet-transactions": "/wallet_transactions",
    "/api/v1/admin/finance/partner-earnings/*": "/partner_earnings/$1",
    "/api/v1/admin/finance/partner-earnings": "/partner_earnings",
    "/api/v1/admin/finance/partner-payouts/*": "/partner_payouts/$1",
    "/api/v1/admin/finance/partner-payouts": "/partner_payouts",
    "/api/v1/admin/finance/earnings/*": "/earnings/$1",
    "/api/v1/admin/finance/earnings": "/earnings",
    "/api/v1/admin/admin-users/*": "/adminUsers/$1",
    "/api/v1/admin/admin-users": "/adminUsers",
    "/api/v1/admin/partners/*": "/partners/$1",
    "/api/v1/admin/partners": "/partners",
    "/api/v1/admin/restaurants/*": "/restaurants/$1",
    "/api/v1/admin/restaurants": "/restaurants",
    "/api/v1/admin/support/*": "/complaints/$1",
    "/api/v1/admin/support": "/complaints",
    "/api/v1/admin/dashboard/*": "/dashboard/$1",
    "/api/v1/admin/dashboard": "/dashboard",
    "/api/v1/admin/offers/*": "/offers/$1",
    "/api/v1/admin/offers": "/offers",
    "/api/v1/admin/locations/*": "/locations/$1",
    "/api/v1/admin/locations": "/locations",
    "/api/v1/admin/reports-summary/*": "/reportsSummary/$1",
    "/api/v1/admin/reports-summary": "/reportsSummary",
    "/api/v1/admin/reports/*": "/reports/$1",
    "/api/v1/admin/reports": "/reports",
    "/api/v1/admin/categories/*": "/categories/$1",
    "/api/v1/admin/categories": "/categories",
    "/api/v1/admin/activity-logs/*": "/activityLogs/$1",
    "/api/v1/admin/activity-logs": "/activityLogs",
    "/api/v1/admin/partner-documents/*": "/partner_documents/$1",
    "/api/v1/admin/partner-documents": "/partner_documents",
    "/api/v1/admin/partner-vehicles/*": "/partner_vehicles/$1",
    "/api/v1/admin/partner-vehicles": "/partner_vehicles",
    "/api/v1/admin/partner-bank-accounts/*": "/partner_bank_accounts/$1",
    "/api/v1/admin/partner-bank-accounts": "/partner_bank_accounts",
    "/api/v1/ratings": "/ratings",
    "/api/restaurant_products/*": "/restaurant_products/$1",
    "/api/restaurant_products": "/restaurant_products",
  })
);

server.use((req, res, next) => {
  if (req._savedQuery) {
    if (req.url.includes('?')) {
      req.url += '&' + req._savedQuery.substring(1);
    } else {
      req.url += req._savedQuery;
    }
  }
  next();
});

router.render = (req, res) => {
  let data = res.locals.data;
  if (req.path === "/users" && req.method === "GET" && Array.isArray(data)) {
    data = data.filter((u) => u.role === "Customer");
  }
  res.json(data);
};

// Use default router

server.use(router);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
});
