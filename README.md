# Voxy 🌍🎙️

> **An AI employee for African businesses.** Not a chatbot that answers questions — an agent that talks to your customers, recommends the right product, takes the order, gets paid, and keeps you informed. In text or in voice, in English, Nigerian Pidgin, Yoruba, Hausa, or Igbo.

A traditional chatbot answers. **Voxy acts.**

---

## 🚀 The Problem

Small businesses in emerging markets struggle to manage customer inquiries, orders, and support during peak hours. Standard AI tools also stumble on local accents, dialects, and code-switching (blending English with Pidgin or a local language) — and even when they answer well, they can't actually *close the sale* or *keep the books straight*.

## 💡 Our Solution

**Voxy** gives a business two connected sides:

- **Customer side** — the AI employee that talks, recommends, sells, confirms orders, and supports payment (over text or voice).
- **Business side** — the dashboard where the owner manages products, prices, policies, orders, customers, payments, and agent settings.

Every claim Voxy makes is grounded in the business's real, approved data. Every financial action is explicitly confirmed before it runs. Every important action is logged. The chat window is just the visible surface of it.

## ✨ Key Features

- **Grounded answers** — Voxy only uses the business's real, approved information. It never invents products, prices, stock, discounts, or policies.
- **Product recommendations** — suggests the right product/service based on the customer's stated needs and budget, without being pushy.
- **Order taking + confirmation** — summarizes items, quantities, and total, then waits for **explicit customer confirmation** before anything financial happens.
- **Payments (Paystack)** — generates a payment request through a trusted provider and verifies payment before confirming to the customer. Voxy never handles raw card details.
- **Voxy Points wallet** — businesses top up a VP balance via Paystack to power agent usage.
- **Multilingual** — English, Nigerian Pidgin, Yoruba, Hausa, and Igbo, with consistent product names, prices, and rules across every language.
- **Voice channel** — customers can call and speak naturally instead of typing (same agent brain, different mouth and ears).
- **Human handoff** — always available for anything unsupported, ambiguous, sensitive, or complex.
- **Business dashboard** — conversations, orders, payments, customers, and AI performance analytics.
- **Action logging & AI observability** — "why did this happen?" always has a real, queryable answer.

---

## 🛠️ Tech Stack

This is a **single Next.js application** (App Router) — the frontend and the API routes live in the same codebase, not a separate server.

**Frontend**
- Next.js 16 (App Router) + React 19
- Tailwind CSS v4 + shadcn/ui
- Zustand (state) · TanStack Query · Framer Motion
- Recharts (dashboard analytics)

**Backend & Database**
- Next.js Route Handlers (`src/app/api/*`)
- PostgreSQL on **Neon** (`@neondatabase/serverless`, `pg`) · Prisma ORM
- Cookie-based auth: JWT (`jsonwebtoken` / `jose`) + bcrypt

**AI Layer**
- Resilient provider layer: **Cencori** (primary) with **Groq** and **Google Gemini** fallbacks, a circuit breaker, and security scanning
- Language detection (`franc`) for multilingual routing
- Voice/TTS: YarnGPT is the target TTS layer (per the PRD); current voice endpoints use Google / Edge TTS

**Payments**
- Paystack (order payments + Voxy Points wallet top-ups)

> **Open items (from the PRD):** the final reasoning model and the long-term storage provider are not locked yet. Whoever locks them should update this section and the PRD.

---

## 🧭 Non-Negotiable Rules

These hold regardless of which part of the app implements a given piece:

1. **Act only on approved business information** — never invent products, prices, stock, discounts, delivery times, or policies.
2. **Confirmation before commitment** — any financially significant action requires explicit customer confirmation before it executes. This is the last thing to cut under time pressure, never the first.
3. **Explicit tool permissions** — sensitive actions (refunds, price changes) are not automatically available to the agent.
4. **One business brain** — text and voice share the same data, order tools, and payment workflow. Voice is a different interface, not a separate implementation.
5. **Payments go through a trusted provider** — Voxy never touches raw payment details and never tells a customer a payment succeeded until the provider confirms it.
6. **Every important agent action is logged.**
7. **Human handoff is always available.**

---

## ⚙️ How It Works (End-to-End)

1. **Onboard** — a business signs up, builds its profile (name, logo, hours, delivery areas, policies) and adds its catalogue (products, prices, variants, images, availability).
2. **Connect** — a customer opens the business's shareable Voxy link (`/business-name`) or calls in.
3. **Understand** — Voxy reads intent (question, recommendation, order, complaint) using only real business data.
4. **Sell** — on a sales moment, Voxy asks one question at a time, recommends based on needs/budget, handles objections, and suggests a relevant add-on.
5. **Confirm** — before anything financial, Voxy summarizes items, quantities, and total, and waits for explicit confirmation.
6. **Pay** — Voxy requests a payment link through Paystack and confirms only once payment is verified.
7. **Close** — the order is marked paid, a receipt is generated, and the dashboard updates so the owner sees the whole thing without reading the raw chat log.

---

## 💻 Getting Started (Local Development)

### Prerequisites
- Node.js v18+ (Node 20+ recommended)
- A PostgreSQL database (Neon recommended)
- pnpm (or npm / yarn)

### 1. Clone and install
```bash
git clone https://github.com/samkiell/voxy.git
cd voxy
pnpm install
```

### 2. Configure environment
Copy the example env file and fill in your values:
```bash
cp .env.example .env.local
```
```env
# Database (Neon / Postgres)
DATABASE_URL=postgresql://user:password@host:5432/voxy_db

# AI providers (Cencori primary, Groq + Gemini fallbacks)
CENCORI_API_KEY=your_cencori_key
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key

# Payments
PAYSTACK_SECRET_KEY=your_paystack_secret_key

# Auth
JWT_SECRET=your_jwt_secret
```
> The exact set of required keys depends on which providers you enable. See `.env.example` for the baseline.

### 3. Set up the database
```bash
npx prisma generate
npx prisma migrate dev   # or apply the SQL in ./sql
```

### 4. Run the app
```bash
pnpm dev
```
Visit `http://localhost:3000`.

**Core Scripts:**
- `pnpm dev` — Start the Next.js local development server
- `pnpm test` — Run the 7-suite AI agent and grounding engine tests (S1–S11)
- `pnpm run test:api` — Run the 12-suite API, security, rate-limiting, and state machine tests
- `pnpm run test:e2e` — Execute the full 8-step end-to-end purchase and settlement simulation
- `pnpm build` — Build production bundle
- `pnpm lint` — Run ESLint code checks

---

## 📦 Project Structure

```
voxy/
├── src/
│   ├── app/            # Next.js App Router (pages + /api route handlers)
│   ├── components/     # UI components (shadcn/ui based)
│   ├── lib/            # AI providers, auth, db, services, integrations
│   ├── store/          # Zustand stores
│   ├── hooks/          # React hooks
│   └── languages/      # Multilingual support
├── prisma/             # Prisma schema
├── sql/                # SQL setup/migrations
├── scripts/            # Utility scripts
├── tests/              # Tests
└── public/docs/        # PRD and project docs
```

---

## ⚠️ Known Limitations

1. **Server-Side Price Authority Required:** Like all Large Language Models, the conversational agent can occasionally hallucinate pricing or unauthorized discounts. To guarantee financial integrity, pricing calculations are strictly server-authoritative (`orderStateMachine.js` & `orderBuilder.js`) — the server recalculates item totals in integer Kobo and overrides any price assertions from the model.
2. **Third-Party API Rate Limits on Developer Tiers:** Running on hosted inference APIs (e.g. Groq free tier) introduces tokens-per-minute (TPM) limits during peak concurrency. Voxy mitigates this using multi-key rotation (`groqCooldowns`) and fallback to lightweight models (`gpt-oss-20b`).
3. **Deep Local Slang & Pidgin Variations:** While the model accurately processes standard Nigerian Pidgin, localized slang and colloquial dialect switches can occasionally produce ambiguous intents. Voxy pairs the LLM with deterministic regex rules and negative prompt guardrails (`promptBuilder.js`) to prevent false commitments.
4. **No Automated Delivery Routing / Dynamic Courier Pricing:** The agent only checks if an address matches the business's approved delivery zones. It does not calculate live dynamic distance-based bike courier fees. Delivery fees must be pre-configured as fixed store policies.
5. **Human Fallback Mandatory for Edge Cases:** When encountering unsupported queries or customer frustration, Voxy halts automated commitments and initiates human takeover (`request_human_handoff`).

---

## 🧪 Testing & Verification Instructions

To reproduce and verify the system behavior locally:

```bash
# 1. Run the AI agent grounding, tool calling, and sales behavior test suite
pnpm test

# 2. Run the backend API validation, security, and state machine test suite
pnpm run test:api

# 3. Run the end-to-end purchase simulation (cart -> draft -> confirmed -> checkout -> webhook -> paid -> receipt)
pnpm run test:e2e
```
All 19 automated test suites pass without external live database dependencies by leveraging isolated test harnesses.

---
## 🔮 What's Next

- Full voice personality + multilingual polish (YarnGPT TTS layer)
- Additional payment providers beyond the MVP's single provider
- Automated inventory sync, advanced CRM, and follow-up campaigns
- Deeper analytics and delivery integrations

---

## 📚 Docs

The single source of truth for scope and architecture is the **[Product Requirements Document](public/docs/PRD.md)**. If anything here disagrees with the PRD, the PRD wins.

---

## 👥 Team

Two parallel streams: 

- **[Abraham](https://github.com/abraham123-dev)** — Frontend / UX
- **[Samkiel](https://github.com/samkiell)** — AI / Agent / Backend



---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

*Built with ❤️ for African businesses.*
