# Smart Canteen Pre-Order & Queue Management System
## System Architecture & Technical Project Structure

This document outlines the architectural blueprints, folder structure, module responsibilities, and implementation locations of key features (queue management, AI forecasting, and duplicate prevention).

---

## 1. High-Level System Architecture

```
[ Customer Mobile / Web PWA ]    [ Kitchen Counter KDS ]    [ Manager Laptop ]
           │                                │                       │
           ▼                                ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Client Reactive Application Shell                     │
│                (React 19 + TypeScript + Vite + Tailwind CSS)                │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Service & Algorithmic Engines                         │
│  ├── storageService.ts   : Authoritative Store, Atomic Stock & Idempotency  │
│  ├── queueEngine.ts      : Dynamic ETA Math & Smart Priority Scoring        │
│  ├── paymentService.ts   : Provider Abstraction (Wallets, Cards, Cash)      │
│  ├── aiService.ts        : Demand Forecasting & Gemini 2.5 Operational Brief│
│  └── soundService.ts     : Web Audio API Synthetic Chimes & Alerts          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Deployable Backend Server (/server)                      │
│     Express REST API + Socket.IO + Zod Validations + Prisma ORM Schema      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Important Folders & Files Breakdown

### `/src` (Frontend Client)
- **`src/types/index.ts`**
  - Defines shared domain models: `MenuItem`, `Order`, `OrderItem`, `User`, `PickupSlot`, `OrderLimitsConfig`, `ActivityLog`, `SalesAnalytics`, `DemandPrediction`.
- **`src/data/seedData.ts`**
  - Seed dataset: 25+ realistic Pakistani/university canteen food items with PKR pricing across 6 categories, active initial queue orders (`C-020` to `C-025`), 15-minute pickup slots, and accounts for all 4 roles.
- **`src/services/`**
  - **`storageService.ts`**: The central transactional repository. Implements atomic stock decrements, idempotency key checks, duplicate collection prevention shields, delay detection timers, and cross-component broadcast events.
  - **`queueEngine.ts`**: Implements the **Dynamic ETA Formula** (parallelism stations, queue backlog factor, food prep duration) and **Smart Queue Priority Scoring**.
  - **`paymentService.ts`**: Payment provider abstraction supporting Cash on Pickup, Easypaisa, JazzCash, and Credit/Debit card with Luhn algorithm validation and simulated OTP verification.
  - **`aiService.ts`**: Houses machine forecasting for food demand, pre-rush preparation suggestions, waste mitigation, and executive natural-language summaries powered by the `@google/genai` Gemini SDK.
  - **`soundService.ts`**: Web Audio API sound synthesizer for kitchen bells, order placed notes, order ready chimes, and duplicate alerts.
- **`src/components/common/`**
  - `Header.tsx`: Responsive navigation, role indicators, unread notifications bell, cart button.
  - `DemoModeBar.tsx`: Instant hackathon role switcher (`Customer`, `Kitchen Staff`, `Manager`, `Admin`), plus Rush-Hour burst trigger and queue advancement.
  - `Toast.tsx` & `NotificationsModal.tsx`: Real-time feedback and notification logs.
- **`src/components/customer/`**
  - `MenuCatalog.tsx`: Category filter chips, instant search, price slider, "Recommended for You" AI carousel, low stock badges (`Only X Left`), item customizer modal.
  - `CartDrawer.tsx`: Tray drawer with 15-minute pickup slot selector, payment method forms, idempotency lock, and confetti celebration.
  - `OrderTrackingView.tsx`: Live digital token display (`C-021`), dynamic ready countdown, QR code token, animated stepper (`Placed` → `Accepted` → `Preparing` → `Ready` → `Completed`), and cancellation modal with stock rollback.
  - `OrderHistoryView.tsx`: Past receipts with 1-click reorder that automatically skips sold-out items.
  - `CustomerProfile.tsx`: User profile, verification cooldown, and credential security.
- **`src/components/kitchen/`**
  - `KitchenDisplay.tsx`: High-contrast dark charcoal KDS with big token cards, status badges (`[DELAYED]`, `[QUICK]`, `[SCHEDULED]`), elapsed timers, and station progression buttons.
  - `TokenCollectionScanner.tsx`: Counter verification tool that **strictly prevents duplicate food dispensing** with timestamped audit alerts.
  - `QuickStockToggleModal.tsx`: One-tap live stock toggle to mark items Sold Out or Available.
- **`src/components/manager/`**
  - `ManagerDashboard.tsx`: Live KPI counters, peak hour bar graphs, category distribution, payment methods pie breakdown, cancellation reasons, and CSV export.
  - `SmartInsightsSection.tsx`: AI demand forecasting and kitchen preparation guidance.
  - `MenuEditor.tsx`: Add/edit prices, stock limits, and preparation times.
  - `PickupSlotsEditor.tsx`: 15-minute capacity limiter (Open/Filling/Full).
- **`src/components/admin/`**
  - `AdminUserManagement.tsx`: Role assignment and account activation/suspension.
  - `SystemActivityLogs.tsx`: Immutable audit logs with timestamped trace of every token action.

### `/server` (Full-Stack Backend API)
- **`server/index.ts`**: Express application with CORS, JSON parsing, and route mounts.
- **`server/routes/auth.ts`**: Registration, login, and email verification.
- **`server/routes/menu.ts`**: Menu CRUD and availability endpoints.
- **`server/routes/orders.ts`**: Idempotent order placement and cancellation with stock rollback.
- **`server/routes/queue.ts`**: Queue priority sorting, ETA calculator, and duplicate collection prevention.
- **`server/routes/analytics.ts`**: Operational metrics and KPI endpoints.
- **`server/services/emailService.ts`**: Transactional email notification triggers.
- **`server/prisma/schema.prisma`**: Relational database schema with models, relations, and unique indexes for PostgreSQL.

---

## 3. Where Core Logic is Implemented

| Core Capability | Implementation File | Key Details |
|---|---|---|
| **Dynamic ETA Formula** | `src/services/queueEngine.ts` | Calculates prep time using max item time, parallel station factor, and active orders backlog. |
| **Smart Queue Priority** | `src/services/queueEngine.ts` | Computes priority score based on wait time, scheduled proximity, delay flags, and quick items. |
| **Duplicate Collection Shield** | `src/services/storageService.ts` & `src/components/kitchen/TokenCollectionScanner.tsx` | Strictly prevents double dispensing; alerts with exact timestamp and staff name. |
| **Atomic Stock Locking** | `src/services/storageService.ts` | Checks stock, decrements inventory, updates `Limited`/`Sold Out` status, and generates token sequentially. |
| **Idempotency Protection** | `src/services/storageService.ts` & `src/components/customer/CartDrawer.tsx` | Prevents duplicate order submissions on double-clicks or retries. |
| **AI Demand & Gemini Summary** | `src/services/aiService.ts` & `src/components/manager/SmartInsightsSection.tsx` | Machine demand models, rush prep forecasts, and Gemini 2.5 executive summaries. |
| **Payment Abstraction** | `src/services/paymentService.ts` | Handles Easypaisa/JazzCash OTPs, Card Luhn verification, and Cash on Pickup. |
