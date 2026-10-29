# Voxy V2 — Backend Gaps & Contract Recommendations

This document tracks backend capabilities identified during the V2 build week, their resolution status, and the corresponding implementation endpoints.

---

### 1. Product Image Storage & Direct File Upload
- **Status:** Open / Roadmap
- **Current Contract (`API.md` T5):** `POST /api/v1/businesses/:id/products` accepts an `imageUrl` string.
- **Gap:** There is no endpoint for uploading raw image files (JPEG, PNG, WebP) to cloud storage (e.g. S3 / Cloudinary / Supabase Storage). The frontend is currently constrained to accepting pre-hosted image URLs.
- **Recommendation:** Provide `POST /api/v1/uploads` or pre-signed URL generation endpoints for direct image uploading.

---

### 2. Business-Level Aggregated Conversations Endpoint
- **Status:** ✅ RESOLVED (`src/app/api/v1/businesses/[id]/conversations/route.ts`)
- **Implementation:** `GET /api/v1/businesses/:id/conversations?status=&limit=&offset=`
- **Description:** Business owners can query paginated conversation streams filtered by conversation status (`active`, `handed_off`, `closed`) without iterating through individual customers.

---

### 3. Order Checkout Link Generation & Customer Payment Webhook
- **Status:** ✅ RESOLVED (`src/app/api/v1/orders/[id]/checkout/route.ts`, `src/lib/services/paystack-service.ts`)
- **Implementation:** `POST /api/v1/orders/:id/checkout`
- **Description:** Validates order eligibility, verifies business ownership or customer context, guards against duplicate payments, and generates authoritative Paystack payment URLs. Webhook signature verification implemented with timing-safe HMAC validation.

---

### 4. Dashboard Metrics & Analytics Summary
- **Status:** ✅ RESOLVED (`src/app/api/v1/businesses/[id]/analytics/route.ts`)
- **Implementation:** `GET /api/v1/businesses/:id/analytics`
- **Description:** Computes aggregated business metrics server-side: total revenue in Kobo, paid order count, pending order count, average order value, total registered customers, and active conversation count.

---

### 5. Multi-User / Merchant Message Role Attribute
- **Status:** ✅ RESOLVED (`src/app/api/v1/conversations/[id]/messages/route.ts`)
- **Implementation:** Supports `role: "agent"` and optional `senderName` attribute.
- **Description:** Human business owner responses during live chat takeover are differentiated from automated AI assistant messages and properly attributed to the merchant.
