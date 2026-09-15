const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');
const BACKUP_PATH = path.join(__dirname, `db.backup_${Date.now()}.json`);

// 1. Create a verified backup
const rawData = fs.readFileSync(DB_PATH, 'utf8');
fs.writeFileSync(BACKUP_PATH, rawData);
console.log(`Backup created at ${BACKUP_PATH}`);

const db = JSON.parse(rawData);

// Collections
const users = db.users || [];
const partners = db.partners || [];
const partner_profiles = db.partner_profiles || [];
const assignments = db.assignments || [];
const request_assignments = db.request_assignments || [];
const ratings_reviews = db.ratings_reviews || db.ratings || db.reviews || [];

// 2. Map existing partner identity into users + partner_profiles
partners.forEach(partner => {
  // Check if a user with this mobile/email already exists
  let user = users.find(u => u.mobileNumber === partner.mobileNumber || u.email === partner.email);
  if (!user) {
    user = {
      id: partner.id,
      name: partner.name,
      email: partner.email,
      mobileNumber: partner.mobileNumber,
      userType: 'Partner',
      role: 'Delivery Partner',
      status: partner.status,
      isVerified: true,
      joinedOn: new Date().toISOString()
    };
    users.push(user);
  }

  // Ensure partner_profile exists
  let profile = partner_profiles.find(p => p.user_id === user.id);
  if (!profile) {
    profile = {
      id: partner.id,
      user_id: user.id,
      partner_code: `VYZ-PRT-${Math.floor(1000 + Math.random() * 9000)}`,
      verification_status: 'VERIFIED',
      online_status: partner.onlineStatus || 'Offline',
      rating_avg: 0,
      rating_count: 0,
      joined_at: user.joinedOn,
      dateOfBirth: partner.dateOfBirth,
      gender: partner.gender,
      alternateMobile: partner.alternateMobile,
      emergencyContact: partner.emergencyContact,
      emergencyMobile: partner.emergencyMobile,
      address: partner.address,
      city: partner.city
    };
    partner_profiles.push(profile);
  }
});

// 3. Map assignments to request_assignments
assignments.forEach(assignment => {
  let reqAssign = request_assignments.find(ra => ra.id === assignment.id);
  if (!reqAssign) {
    reqAssign = {
      id: assignment.id,
      request_id: assignment.request_id,
      partner_id: assignment.partner_id,
      assignment_status: assignment.status || 'unknown',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    request_assignments.push(reqAssign);
  }
});

// 4. Create empty ratings_reviews if doesn't exist
const new_ratings_reviews = ratings_reviews;

// Apply changes
db.users = users;
db.partner_profiles = partner_profiles;
db.request_assignments = request_assignments;
db.ratings_reviews = new_ratings_reviews;

fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

console.log('--- Migration Summary ---');
console.log(`Users: ${users.length}`);
console.log(`Partner Profiles: ${partner_profiles.length}`);
console.log(`Request Assignments: ${request_assignments.length}`);
console.log(`Ratings & Reviews: ${new_ratings_reviews.length}`);
