export const appConfig = {
  success: true,
  message: "App configuration fetched successfully",
  data: {
    appName: "VAYZO",
    latestVersion: "1.0.0",
    minimumVersion: "1.0.0",
    maintenanceMode: false,
    forceUpdate: false,
  },
};

export const authResponses = {
  sendOtp: {
    success: true,
    message: "OTP sent successfully",
    data: {
      verificationId: "VER123456",
      maskedMobile: "******3210",
      expiresIn: 120,
      resendAfter: 30,
    },
  },

  verifyOtp: {
    success: true,
    message: "OTP verified successfully",
    data: {
      isNewUser: false,
      accessToken: "ACCESS_TOKEN",
      refreshToken: "REFRESH_TOKEN",
      expiresIn: 3600,
      user: {
        userId: "USR1001",
        name: "Prathap M",
        mobileNumber: "+919876543210",
        profileImage: null,
      },
    },
  },
};

export const locations = [
  {
    locationId: "LOC001",
    name: "Anna Nagar",
    city: "Madurai",
    state: "Tamil Nadu",
    latitude: 9.9252,
    longitude: 78.1198,
  },
  {
    locationId: "LOC002",
    name: "Melur",
    city: "Madurai",
    state: "Tamil Nadu",
    latitude: 10.032,
    longitude: 78.338,
  },
  {
    locationId: "LOC003",
    name: "T. Nagar",
    city: "Chennai",
    state: "Tamil Nadu",
    latitude: 13.0417,
    longitude: 80.2098,
  },
];

export const homeData = {
  success: true,
  message: "Home data fetched successfully",
  data: {
    user: {
      userId: "USR1001",
      name: "Prathap M",
    },
    currentLocation: {
      locationId: "LOC001",
      address: "Anna Nagar, Madurai",
    },
    services: [
      { serviceId: "FOOD", name: "Food Delivery", icon: "food_icon" },
      { serviceId: "BUY_GET", name: "Buy & Get It", icon: "shopping_icon" },
      { serviceId: "RIDE", name: "Rides", icon: "ride_icon" },
      { serviceId: "BIKE", name: "Bike Booking", icon: "bike_icon" },
      { serviceId: "CAR", name: "Car Booking", icon: "car_icon" },
    ],
    activeRequests: [
      {
        requestId: "REQ1001",
        serviceType: "BUY_GET",
        status: "PARTNER_ASSIGNED",
        estimatedTime: 18,
      },
    ],
  },
};

export const userStats = [
  { label: "Total Users", value: "12.8K", trend: "+12.4%" },
  { label: "Active Today", value: "4.1K", trend: "+8.1%" },
  { label: "Verified", value: "91.2%", trend: "+1.9%" },
  { label: "Blocked", value: "184", trend: "-2.8%" },
];

export const deliveryPartnerStats = [
  { label: "Total Partners", value: "3.2K", trend: "+9.4%" },
  { label: "Online Now", value: "1.4K", trend: "+6.7%" },
  { label: "Verified", value: "84.6%", trend: "+2.3%" },
  { label: "Blocked", value: "96", trend: "-1.5%" },
];

export const orderStats = [
  { label: "Total Orders", value: "18.4K", trend: "+11.8%" },
  { label: "Pending", value: "1.2K", trend: "+4.1%" },
  { label: "Delivered", value: "94.5%", trend: "+2.1%" },
  { label: "Cancelled", value: "236", trend: "-3.2%" },
];

export const transactions = [
  {
    transactionId: "TXN2001",
    userName: "Prathap M",
    type: "CREDIT",
    status: "SUCCESS",
    amount: 250,
    method: "Wallet",
    date: "2026-08-27 11:20",
    description: "Wallet top-up",
    city: "Madurai",
  },
  {
    transactionId: "TXN2002",
    userName: "Priya Nair",
    type: "DEBIT",
    status: "SUCCESS",
    amount: 680,
    method: "UPI",
    date: "2026-08-27 10:45",
    description: "Order payment",
    city: "Chennai",
  },
  {
    transactionId: "TXN2003",
    userName: "Arun Kumar",
    type: "DEBIT",
    status: "PENDING",
    amount: 290,
    method: "Card",
    date: "2026-08-27 09:15",
    description: "Food order",
    city: "Coimbatore",
  },
  {
    transactionId: "TXN2004",
    userName: "Deepa Rani",
    type: "REFUND",
    status: "SUCCESS",
    amount: 360,
    method: "Wallet",
    date: "2026-08-26 18:40",
    description: "Cancelled order refund",
    city: "Trichy",
  },
  {
    transactionId: "TXN2005",
    userName: "Sathish V",
    type: "CREDIT",
    status: "FAILED",
    amount: 540,
    method: "Bank Transfer",
    date: "2026-08-27 12:05",
    description: "Earning payout",
    city: "Madurai",
  },
  {
    transactionId: "TXN2006",
    userName: "Meera Suresh",
    type: "DEBIT",
    status: "SUCCESS",
    amount: 780,
    method: "UPI",
    date: "2026-08-27 08:30",
    description: "Biryani order",
    city: "Salem",
  },
];

export const transactionStats = [
  { label: "Total Volume", value: "₹12.4L", trend: "+8.9%" },
  { label: "Success Rate", value: "96.4%", trend: "+1.8%" },
  { label: "Pending", value: "124", trend: "+3.1%" },
  { label: "Failed", value: "26", trend: "-2.4%" },
];

export const recentRequests = [
  {
    requestId: "REQ1001",
    title: "4 Idly from Murugan Kadai",
    status: "PARTNER_ASSIGNED",
    amount: 160,
    serviceType: "BUY_GET",
  },
  {
    requestId: "REQ1002",
    title: "Pizza combo from Pizza Hub",
    status: "ON_THE_WAY",
    amount: 420,
    serviceType: "FOOD",
  },
  {
    requestId: "REQ1003",
    title: "Ride to Airport",
    status: "COMPLETED",
    amount: 280,
    serviceType: "RIDE",
  },
];

export const walletSummary = {
  success: true,
  data: {
    walletId: "WAL1001",
    balance: 250,
    currency: "INR",
    recentTransactions: [
      {
        transactionId: "TXN1001",
        type: "CREDIT",
        amount: 100,
        description: "Added to wallet",
        date: "2026-08-18T10:30:00",
      },
      {
        transactionId: "TXN1002",
        type: "DEBIT",
        amount: 160,
        description: "Buy & Get request",
        date: "2026-08-17T10:30:00",
      },
    ],
  },
};

export const supportTopics = [
  { topicId: "TOPIC001", title: "How VAYZO Works", icon: "info" },
  { topicId: "TOPIC002", title: "Cancelling a Request", icon: "cancel" },
  { topicId: "TOPIC003", title: "Payment & Refunds", icon: "payment" },
  { topicId: "TOPIC004", title: "Wallet Issues", icon: "wallet" },
];

export const settings = {
  success: true,
  data: {
    pushNotifications: true,
    smsNotifications: true,
    emailNotifications: false,
    darkMode: false,
    language: "en",
  },
};

export const appAbout = {
  success: true,
  data: {
    appName: "VAYZO",
    tagline: "You Ask. We Get It.",
    version: "1.0.0",
    description:
      "VAYZO is your all-in-one solution for Food Delivery, Buy & Get It, Bike Rides and Car Booking.",
    privacyPolicyUrl: "https://example.com/privacy",
    termsUrl: "https://example.com/terms",
    supportEmail: "support@vayzo.com",
  },
};

export const vayzoApiMock = {
  appConfig,
  authResponses,
  locations,
  homeData,
  userStats,
  deliveryPartnerStats,
  orderStats,
  transactions,
  transactionStats,
  recentRequests,
  walletSummary,
  supportTopics,
  settings,
  appAbout,
};

export const mockAdminCredentials = {
  email: "admin@vayzo.com",
  password: "admin123",
};

export const mockAdmin = {
  id: "3HstH5QBEIk",
  userId: "USR1001",
  email: "admin@vayzo.com",
  name: "Pradhap",
  role: "Super Admin",
  profileImage: null,
};

export default vayzoApiMock;

export const generalSettings = {
  platformName: "VAYZO",
  platformTagline: "You Ask. We Get It.",
  supportEmail: "support@vayzo.com",
  supportPhone: "+91 98765 43210",
  timezone: "Asia/Kolkata",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "12h",
  defaultCurrency: "INR",
  currencyPosition: "prefix",
  numberFormat: "1,00,000",
  language: "English",
  contactAddress: "123, Vayzo Towers, Chennai, Tamil Nadu 600001",
  maintenanceMode: false,
  socialLinks: {
    facebook: "https://facebook.com/vayzo",
    instagram: "https://instagram.com/vayzo",
    twitter: "https://twitter.com/vayzo",
  },
};

export const paymentSettings = {
  gateways: {
    razorpay: { enabled: true, key: "rzp_live_xxxxxxxxxxxxxxxx" },
    stripe: { enabled: false, key: "" },
    paypal: { enabled: false, key: "" },
  },
  codEnabled: true,
  walletEnabled: true,
  minOrderAmount: 50,
  maxCodAmount: 2000,
  refundProcessingDays: 5,
};
