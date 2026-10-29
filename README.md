# Voxy 🌍🎙️

> **An AI employee for African businesses.** Not a chatbot that answers questions - an agent that talks to your customers, recommends the right product, takes the order, gets paid, and keeps you informed. In text or in voice, in English, Nigerian Pidgin, Yoruba, Hausa, or Igbo.

> **Built for the OPEN//BUILD 2026 Hackathon (theme: AI belongs to everyone)**, organized by Google Developer Groups on Campus OAU with She Code Africa OAU Chapter and Microsoft Student Ambassadors OAU. Build phase: Oct 25 to 29, 2026. Demo Day: Oct 31, 2026. Team of two: Abraham (Frontend/UX) and Samkiel (AI/Agent/Backend).

A traditional chatbot answers. **Voxy acts.**

---

## 🚀 The Problem

Small businesses in emerging markets struggle to manage customer inquiries, orders, and support during peak hours. Standard AI tools also stumble on local accents, dialects, and code-switching (blending English with Pidgin or a local language) - and even when they answer well, they can't actually *close the sale* or *keep the books straight*.

## 💡 Our Solution

**Voxy** gives a business two connected sides:

- **Customer side** - the AI employee that talks, recommends, sells, confirms orders, and supports payment (over text or voice).
- **Business side** - the dashboard where the owner manages products, prices, policies, orders, customers, payments, and agent settings.

Every claim Voxy makes is grounded in the business's real, approved data. Every financial action is explicitly confirmed before it runs. Every important action is logged. The chat window is just the visible surface of it.

## 🏆 Hackathon Submission

- **Live Demo:** [https://voxyapp.vercel.app](https://voxyapp.vercel.app)
- **The Problem:** African micro and small merchants lose up to 40% of potential orders due to unanswered messages, delayed checkout links, and an inability to operate 24/7 across multiple communication channels. Off-the-shelf chatbots cannot take authoritative orders, often hallucinate discounts, and lack local payments integration.
- **What We Built During the Build Window (Oct 25 to 29, 2026):**
  - **Conversational Storefront & Real-Time Voice Calls:** An omnichannel assistant handling customer conversations via low-latency open models on Groq.
  - **Server-Authoritative Order Drafting:** An order state machine enforcing database prices and integer Kobo accuracy, eliminating model price overrides.
  - **End-to-End Paystack Checkout Flow:** Instant checkout link creation, timing-safe HMAC webhook signature verification, and multi-channel receipt summaries.
  - **Merchant Dashboard & Live Takeover:** Full business overview with aggregated revenue metrics, customer LTV, inventory warning badges, and human merchant takeover.
  - **Multilingual Grounding:** Context-aware handling for English, Nigerian Pidgin, Yoruba, Hausa, and Igbo with voice synthesis.

---

## ✨ Key Features

- **Grounded answers** - Voxy only uses the business's real, approved information. It never invents products, prices, stock, discounts, or policies.
- **Product recommendations** - suggests the right product/service based on the customer's stated needs and budget, without being pushy.
- **Order taking + confirmation** - summarizes items, quantities, and total, then waits for **explicit customer confirmation** before anything financial happens.
- **Payments (Paystack)** - generates a payment request through a trusted provider and verifies payment before confirming to the customer. Voxy never handles raw card details.
- **Voxy Points wallet** - businesses top up a VP balance via Paystack to power agent usage.
- **Multilingual** - English, Nigerian Pidgin, Yoruba, Hausa, and Igbo, with consistent product names, prices, and rules across every language.
- **Voice channel** - customers can call and speak naturally instead of typing (same agent brain, different mouth and ears).
- **Human handoff** - always available for anything unsupported, ambiguous, sensitive, or complex.
- **Business dashboard** - conversations, orders, payments, customers, and AI performance analytics.
- **Action logging & AI observability** - "why did this happen?" always has a real, queryable answer.

---

## 🛠️ Tech Stack

This is a **single Next.js application** (App Router) - the frontend and the API routes live in the same codebase, not a separate server.

**Frontend**
- Next.js 16 (App Router) + React 19
- Tailwind CSS v4 + shadcn/ui
- Zustand (client state) · TanStack Query · Framer Motion
- Recharts (dashboard analytics)

**Backend & Database**
- Next.js Route Handlers (`src/app/api/*`)
- PostgreSQL on **Neon** (`@neondatabase/serverless`, `pg`) · Prisma ORM
- Cookie-based authentication: JWT (`jsonwebtoken` / `jose`) + bcryptjs

**AI Layer**
- Primary Reasoning Model: `openai/gpt-oss-120b` served via Groq Cloud
- Fallback Reasoning Models: `openai/gpt-oss-20b` and `qwen/qwen3.8-27b` served via Groq
- Resilience & Multi-Key Rotator: Dynamic environment key scanning with cooldown tracking (`groqCooldowns`)
- Speech-to-Text (STT): `whisper-large-v3-turbo` via Groq Audio Transcriptions API
- Voice Output (TTS): Google TTS and Microsoft Edge Neural TTS (`msedge-tts`)
- Language & Grounding: Rule-assisted language classification (`franc`) and strict policy prompts

**Payments**
- Paystack API (order checkout, payment verification, webhook signatures, and wallet top-ups)

---

## 🧭 Non-Negotiable Rules

These hold regardless of which part of the app implements a given piece:

1. **Act only on approved business information** - never invent products, prices, stock, discounts, delivery times, or policies.
2. **Confirmation before commitment** - any financially significant action requires explicit customer confirmation before it executes. This is the last thing to cut under time pressure, never the first.
3. **Explicit tool permissions** - sensitive actions (refunds, price changes) are not automatically available to the agent.
4. **One business brain** - text and voice share the same data, order tools, and payment workflow. Voice is a different interface, not a separate implementation.
5. **Payments go through a trusted provider** - Voxy never touches raw payment details and never tells a customer a payment succeeded until the provider confirms it.
6. **Every important agent action is logged.**
7. **Human handoff is always available.**

---

## ⚙️ How It Works (End-to-End)

1. **Onboard** - a business signs up, builds its profile (name, logo, hours, delivery areas, policies) and adds its catalogue (products, prices, variants, images, availability).
2. **Connect** - a customer opens the business's shareable Voxy link (`/business-name`) or calls in.
3. **Understand** - Voxy reads intent (question, recommendation, order, complaint) using only real business data.
4. **Sell** - on a sales moment, Voxy asks one question at a time, recommends based on needs/budget, handles objections, and suggests a relevant add-on.
5. **Confirm** - before anything financial, Voxy summarizes items, quantities, and total, and waits for explicit confirmation.
6. **Pay** - Voxy requests a payment link through Paystack and confirms only once payment is verified.
7. **Close** - the order is marked paid, a receipt is generated, and the dashboard updates so the owner sees the whole thing without reading the raw chat log.

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
DATABASE_URL=postgresql://user:password@ep-cool-sample.us-east-2.aws.neon.tech/voxy_db?sslmode=require

# AI Provider (Groq - primary key and optional rotation keys)
GROQ_API_KEY=gsk_your_primary_groq_key
GROQ_API_KEY2=gsk_backup_key_2
GROQ_API_KEY3=gsk_backup_key_3

# Payments (Paystack)
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key

# Authentication
JWT_SECRET=your_secure_jwt_secret_key

# Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up the database
```bash
pnpm prisma generate
npx prisma migrate dev   # or apply the SQL in ./sql
```

### 4. Run the app
```bash
pnpm dev
```
Visit `http://localhost:3000`.

**Core Scripts:**
- `pnpm dev` - Start the Next.js local development server
- `pnpm test` - Run the 7-suite AI agent and grounding engine tests (S1-S11)
- `pnpm run test:api` - Run the 12-suite API, security, rate-limiting, and state machine tests
- `pnpm run test:e2e` - Execute the full 8-step end-to-end purchase and settlement simulation
- `pnpm build` - Build production bundle
- `pnpm lint` - Run ESLint code checks

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

1. **Possible Price or Delivery Hallucination:** Like all LLMs, the model can occasionally hallucinate custom prices or unauthorized discounts. This is mitigated in Voxy by making pricing strictly server-authoritative (`orderStateMachine.js` & `orderBuilder.js`), where the server recalculates item totals in integer Kobo and discards model price overrides. Negative prompt guardrails also forbid making ungrounded delivery fee promises.
2. **API Rate Limits on Developer Tiers:** Heavy concurrent usage on hosted inference APIs (Groq free/developer tiers) can trigger rate limits. Voxy mitigates this using multi-key rotation (`groqCooldowns`) and fallback to lightweight models (`openai/gpt-oss-20b` and `qwen/qwen3.8-27b`).
3. **Local Language Accuracy and Code-Switching Ambiguity:** Nuanced Nigerian Pidgin, mixed slang, and dialect switches (Yoruba, Igbo, Hausa) can occasionally produce lower classification accuracy. Voxy uses regex rule-assisted matching and negative prompt guardrails to prevent erroneous commitments.
4. **Voice Quality Dependent on TTS Layer:** Voice synthesis quality varies based on the active TTS engine. While neural voices provide fluent English and Hausa, dialect inflections in Yoruba and Igbo depend on available third-party voice providers.
5. **Human Fallback Mandatory for Sensitive Edge Cases:** When encountering unsupported queries or customer frustration, Voxy immediately triggers human takeover (`request_human_handoff`).

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
All automated test suites pass without external live database dependencies by leveraging isolated test harnesses.

---

## 🤝 Acknowledgements and AI Tools

- **OpenAI:** For `gpt-oss` open-weight model architectures and the `whisper-large-v3-turbo` speech recognition model.
- **Qwen Team (Alibaba Cloud):** For the `Qwen3.8-27B` model (Apache 2.0).
- **Groq:** For high-throughput, ultra-low latency LPU inference infrastructure making real-time voice calls feasible.
- **Paystack:** For reliable payment infrastructure and webhooks across African currencies.
- **Neon:** For serverless PostgreSQL database infrastructure.
- **Open Source Community:** For Next.js, React, Tailwind CSS, shadcn/ui, Prisma, Zustand, and Lucide icons.
- **AI Coding Assistants:** AI coding assistants were utilized during the build phase for code generation, architectural review, debugging hydration issues, and technical documentation.

---

## 🔮 What's Next

- Full voice personality polish and expanded regional TTS models
- Additional payment providers across Africa (e.g. Flutterwave, mobile money)
- Automated inventory sync with WhatsApp Business and Instagram DMs
- Advanced CRM analytics and automated customer re-engagement

---

## 📚 Docs

The single source of truth for scope and architecture is the **[Product Requirements Document](public/docs/PRD.md)**. If anything here disagrees with the PRD, the PRD wins.

---

## 👥 Team

OPEN//BUILD 2026 Team:

- **[Abraham](https://github.com/abraham123-dev)** - Frontend / UX
- **[Samkiel](https://github.com/samkiell)** - AI / Agent / Backend

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

*Built with ❤️ for African businesses.*
