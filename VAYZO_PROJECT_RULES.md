# VAYZO PROJECT RULES

This file is the permanent VAYZO architecture and development-rules reference. Future agents must read this file before significant implementation work to prevent architecture drift, invented business rules, incorrect entity relationships, and unsafe data changes.

## SOURCE OF TRUTH

Priority:
1. VAYZO Phase 1 SRS
2. VAYZO Customer API Prototype
3. VAYZO Delivery Partner API Prototype
4. Explicitly approved project architecture decisions
5. Existing implementation only when it does not conflict

Screenshots are visual references only.

If a requirement is not defined:
- mark it as **MISSING REQUIREMENT** or **RECOMMENDED MOCK ARCHITECTURE**
- Never invent business rules silently.

## CORE ARCHITECTURE

**Current mock architecture:**
React UI → `src/api/*` → `apiClient.js` → json-server → `db.json`

**Future architecture:**
React UI → `src/api/*` → Laravel REST API → MySQL / Storage

- React pages/components must NOT directly access `db.json`.
- React pages/components must NOT directly import business mock data.

## DOMAIN SEPARATION

Keep these domains separate:
Customers / Users, Delivery Partners, Restaurants, Admin Users, Requests, Rides, Finance, Support, Notifications, Locations, Settings, Reporting.
- Never merge Customer, Partner, Restaurant, or Admin identities.

## CUSTOMER MODEL

- **Source:** `users` collection. Treat this as the customer/application-user domain.
- **Legacy fields:** Fields like `password`, `userType`, and `isVerified` must NOT be blindly deleted. Retain them temporarily during migration.
- Future architecture must not rely on legacy fields unless explicitly required.
- Authentication follows the documented OTP-based flow.

## PARTNER MODEL

**Target Collections:**
- `partners`
- `partner_documents`
- `partner_vehicles`
- `partner_bank_accounts`

**Partner Types:**
`FOOD_DELIVERY`, `BUY_GET`, `BIKE_RIDE`, `CAR_RIDE`. A partner may support multiple service types.

**States to keep separate:**
- Verification Status
- Account Status
- Availability Status
Do not collapse unrelated states. Ride/availability behaviour must remain compatible with the documented Partner API.

## RESTAURANT MODEL

**Target Collections:**
- `restaurants`
- `restaurant_categories`
- `restaurant_products`

- Use IDs for relationships.
- Existing restaurant fields not explicitly documented may remain during the mock phase (marked as RECOMMENDED MOCK ARCHITECTURE).
- Do not invent a Merchant API and call it confirmed.

## COMMON REQUEST MODEL

VAYZO uses a unified request architecture supporting `FOOD`, `BUY_GET`, `BIKE_RIDE`, `CAR_RIDE`.

**Target Collections:**
- `requests`
- `request_items`
- `request_pickups`
- `request_status_history`

**Core relationships:** `customerId`, `partnerId`, `restaurantId`, `requestId`.
- Never use duplicated display names as primary relationships.
- Existing `orders` data must be migrated safely into `requests`. Never blindly delete them.
- Request terminology must follow the approved SRS/API. Do not invent enums.

## RIDE MODEL

The common request model represents the dispatch request. Ride-specific info is represented through:
`requests` → `rides` → `ride_locations`
- `BIKE_RIDE` and `CAR_RIDE` must be supported. Do not create an unrelated second request system.

## FINANCE MODEL

**Target Collections:**
- `payments`, `wallets`, `wallet_transactions`, `partner_earnings`, `partner_payouts`.
- Do not create a generic standalone transactions database entity unless confirmed.
- Admin Transactions page is an **aggregation/read model** over finance entities.
- Financial relationships must be traceable through IDs.

## ADMIN MODEL

**Target Collections:**
- `adminUsers`, `roles`, `permissions`.
- Admin identity remains separate from Customer identity.

**Auth Flow:**
Login / OTP → Session / Token → Current Admin → Admin Context / State → Header / Profile / Activity Logs.
- **MISSING REQUIREMENT:** No Super Admin API Prototype exists.
- Mock endpoints created for Admin must be labelled **RECOMMENDED MOCK API CONTRACT**.
- Do not invent arbitrary admin restrictions.

## STATUS ARCHITECTURE

Statuses are domain-specific. Keep separate concepts for:
- Customer account
- Partner verification
- Partner account
- Partner availability
- Restaurant
- Request
- Payment
- Wallet transaction
- Partner payout
- Support ticket
- Admin account

Do not use one universal status enum. Use confirmed values, or mark as MISSING REQUIREMENT / RECOMMENDED MOCK ENUM.

## RELATIONSHIP RULES

Prefer relational IDs (`customerId`, `partnerId`, `restaurantId`, `requestId`, etc.).
- Display names are presentation data only. Do not use names as primary relationships.
- Resolve related data from the related entity consistently across modules.

## IMAGE ARCHITECTURE

- **Reuse:** `src/utils/fileUtils.js`
- **Supported formats:** JPG, JPEG, PNG, WebP
- **Max size:** 2 megapixels based on PIXEL COUNT.
- **Target Flow:** File Picker → Frontend Validation → Upload Abstraction → Stored File Reference/URL → Entity Record → Same Image Reused Everywhere.
- Do NOT make base64-in-db.json the permanent image architecture. Mock uploads must be replaceable by Laravel/storage.
- **Image Consistency:** The same entity must use the same persisted image reference everywhere.

## MOCK BACKEND RULES

`json-server` + `db.json` is temporary. `src/api/*` is the abstraction layer.
- Pages/components must not depend on json-server specifics.
- API modules translate frontend pagination/filters into json-server syntax to minimize future React changes.

## DATABASE MIGRATION RULES

Never blindly rebuild or delete `db.json`.
- **Flow:** Backup → Read data → Transform → Create target collections → Map relationships → Validate → Verify → Remove obsolete structures.
- Never randomly assign relationships, silently lose/overwrite records, or silently resolve ambiguous names. Flag unresolved relationships.
- Preserve existing data when safely mappable.

## MOCK DATA RULE

`src/mock/vayzoApiMock.js` is not a permanent business-data source.
- **Migration:** 1. Identify consumers 2. Create equivalent API 3. Update consumers 4. Verify 5. Remove obsolete dependency.
- Do not delete the mock file prematurely.

## API MODULE RULES

Keep responsibilities separated. Use dedicated modules (`authApi.js`, `usersApi.js`, `partnersApi.js`, `requestsApi.js`, `financeApi.js`, etc.) with clear domain responsibility. Avoid unnecessary duplication.

## REUSABLE UI RULES

Prefer existing reusable components (`Input`, `Select`, `Table`, `Card`, `Button`, `Modal`, etc.). Do not duplicate responsibilities. Create new components only when genuinely reusable, unsupported by existing ones, and with clear responsibility.

## TABLE / FILTER RULES

- Desktop filters horizontal when possible, responsive wrapping.
- No page-level horizontal scrolling; internal table scrolling allowed.
- Sticky table headers with solid background and correct z-index.
- 20 records per page by default. Globally sequential serial numbers.
- Explicit controls stop row-click propagation. Destructive actions require confirmation.
- Reset actually resets state.
- **Export Rules:** Export must download actual API-backed data. Do not replace export with `window.print`.

## SETTINGS RULES

Separate:
1. Business/platform config (requires persistent data architecture).
2. UI/browser preferences (may use browser persistence).
3. Security/authentication
4. Integrations
- Do not assume persistence mechanisms without requirements.
- Settings pages must reuse existing UI components.

## NO HARDCODED BUSINESS DATA

Do not hardcode dynamic business data in React components (customers, partners, requests, finance, settings, dynamic stats, persisted images). Static UI labels are allowed.

## AUTH / IDENTITY RULE

One authoritative current-admin identity. Do not maintain competing sources (like `mockAdmin` vs `users` vs `localStorage` fallback). Use a shared application state/context authenticated session.

## IMPLEMENTATION ORDER

1. Architecture/data model
2. Relationships
3. Status/enums
4. Mock API contracts
5. Safe db.json migration
6. API implementation
7. Authentication/admin identity
8. Core domain pages
9. Finance/reporting/settings data architecture
10. Remove direct mock dependencies
11. Image/file handling
12. Reusable UI/component cleanup
13. Export
14. Build/testing
15. Final audit

## AGENT WORKFLOW

1. READ → UNDERSTAND → PLAN → IMPLEMENT → TEST → REPORT
2. Read VAYZO_PROJECT_RULES.md and relevant specs.
3. Inspect current implementation. Identify affected files.
4. Make the smallest safe change. Test the result.
5. Report exactly what changed. Do not make unrelated changes.

## CONFLICT RULE

If existing code conflicts with this file or specs:
- Do NOT silently preserve wrong architecture.
- Stop and report: current behaviour, rule/spec, conflict, proposed resolution. Wait for approval if it materially affects architecture.

## CURRENT KNOWN STATE

- `json-server`/`db.json` used as mock backend.
- Some pages depend on `vayzoApiMock.js`.
- Current orders are food-centric, need migration to common request architecture.
- Current `deliveryPartners` data is flattened, needs normalization.
- Current finance collections are incomplete.
- Current Admin Profile has static/mock dependencies. Settings not fully API-backed.
- Reusable UI and image validation utils exist.
- Build status must be verified with actual `npm run build`.
- **MISSING REQUIREMENT:** Super Admin API Prototype and Restaurant/Merchant API Prototype are not available.

## IMPORTANT SAFETY RULE

Never perform destructive migration without backup, mapping, validation, and verification. Never delete data merely to clean architecture.
