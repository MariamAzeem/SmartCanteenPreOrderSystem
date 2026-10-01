# Smart Canteen Pre-Order & Queue Management System

A production-quality, responsive web application engineered for universities, colleges, corporate offices, and hospitals to eliminate peak lunch rush lines, kitchen confusion, and counter congestion.

---

## 🌟 The Core Problem Solved
During short 30–45 minute lunch breaks:
1. Students and employees crowd counters to order, then wait again while food cooks.
2. Kitchen staff face chaotic ticket spikes without knowing which order arrived first or has a tight pickup window.
3. Food items sell out unpredictably without customers being notified beforehand.
4. Managers lack real-time visibility into peak rush hours, wait bottlenecks, and kitchen delays.

**Smart Canteen solves this end-to-end:**
> **Browse Menu → Pre-Order & Customize → Choose 15-Min Slot → Generate Digital Token → Smart Priority Queue → Kitchen Cooks → Live Status & Ready Alert → Scan & Collect Food (Duplicate Protected) → Sales Analytics Updated**

---

## 👥 Demo Accounts (4 Role-Based Access Tiers)

Sign in using these pre-seeded accounts (role is authenticated strictly from database credentials, never from a UI switcher):

| Role | Name | Email | Password | Dedicated Route & Portal |
|---|---|---|---|---|
| **Customer (Student / Employee)** | Ali Khan | `student@canteen.edu` | `canteen123` | `/customer` — Sticky top search, Menu cards with prep time, Cart drawer, 15-min pickup scheduling, Live order tracking ("2 orders ahead"), 1-click Reorder, Cancel order |
| **Kitchen Staff** | Chef Bilal Ahmad | `kitchen@canteen.edu` | `canteen123` | `/kitchen` — Dark mode KDS, Queue lanes & order queue positions, 1-tap state progression, Counter token scanner, Quick stock toggle |
| **Canteen Manager** | Rashid Mehmood | `manager@canteen.edu` | `canteen123` | `/manager` — Live KPIs, Peak hour sales charts, Menu & stock editor, 15-min pickup slots generator, Staff account provisioning |
| **Administrator** | Saira Tariq | `admin@canteen.edu` | `canteen123` | `/admin` — User RBAC control (activate/suspend), System audit & activity logs (including stock restoration details), Database reset |

*Note: Customers can self-register with email verification. Staff, manager, and admin accounts can only be provisioned by manager or administrator.*

---

## 🚀 Key Feature Highlights

### 1. Customer Pre-Order & Digital Token Experience
- **25+ Canteen Food Items**: Across Burgers, Fries & Sides, Sandwiches & Rolls, Rice & Desi, Drinks, and Desserts & Breakfast, priced in PKR (Rs.).
- **Live Stock Awareness**: Real-time badges for *Available*, *Limited* ("Only 4 Left!"), and *Sold Out*.
- **Personalized Cooking Instructions**: e.g., "Extra spicy, no mayo, pack separately".
- **15-Minute Pickup Scheduling**: Visual capacity indicator (`Open`, `Filling`, `Full`) to throttle peak rush volume.
- **Payment Method Provider Abstraction**:
  - Cash on Pickup (default, payment pending until collected)
  - Easypaisa (with registered mobile & simulated OTP verification)
  - JazzCash (with registered mobile & simulated OTP verification)
  - Credit/Debit Card (with cardholder, brand detection Visa/Mastercard/PayPak, and Luhn checksum validation)
- **Duplicate Order Shield**: Client-side idempotency keys with atomic database locking prevent accidental duplicate charges.
- **Live Order Tracking**: Digital token card (e.g. `C-021`), dynamic ready countdown, QR code token, and animated progress stepper (`Placed` → `Accepted` → `Preparing` → `Ready` → `Completed`).
- **Cancellation Rule**: Orders can be edited or cancelled before cooking begins; stock is automatically restored.
- **1-Tap Reorder**: Automatically skips sold-out items with friendly notification.

### 2. Kitchen Display System (KDS) & Counter Verification
- **High-Contrast Dark Charcoal Mode (`#25282D`)**: Designed for busy kitchen tablets and screens with large touch targets.
- **Smart Queue Priority Engine**: Computes priority scores based on elapsed time, delay status, scheduled pickup time, and quick orders.
- **Visual Alert Badges**: `[DELAYED]`, `[QUICK]`, `[WAITING LONG]`, and `[SCHEDULED]`.
- **One-Tap Status Progression**: `Accept Order` → `Start Preparing (Station #1)` → `Mark Ready for Counter`.
- **Duplicate Collection Prevention Shield**: Counter scanner verifies tokens and **strictly prohibits duplicate food handovers**, alerting staff with the exact prior collection timestamp and staff name.
- **Instant Stock Toggle**: Chefs can tap any food item to mark it *Sold Out* on the fly.

### 3. Manager Analytics & AI Operational Insights
- **Live KPI Counters**: Total orders today (186), Preparing (12), Ready (6), Completed (153), Cancelled (15), Total Sales (Rs. 54,200+), Avg Prep Time (11 mins).
- **Interactive Visual Reports**:
  - Peak Ordering Hours & Distribution Bar Chart (identifying 1:00 PM - 1:45 PM peak).
  - Food Category Revenue Breakdown.
  - Payment Method Distribution (65% Mobile Wallets).
  - Pre-Order Cancellation Reasons Breakdown.
  - Top 5 Best Sellers vs Least Ordered Items.
- **Smart AI Insights (Powered by Gemini 2.5 & Statistical Models)**:
  - Food Demand Prediction per item with confidence ratings.
  - Pre-Rush Batch Preparation Guidance (e.g. "Prepare 36 Zinger patties before 12:45 PM").
  - Food Waste Risk Detection and actionable mitigation.
  - Natural Language Operational Executive Briefing.
- **Menu & Stock Editor**: Live modification of item prices, stock levels, prep durations, and categories.
- **15-Minute Slot Capacity Throttle**: Customize max orders per slot and kitchen station count.

### 4. Admin Security & Audit Trail
- **User Role-Based Access Control (RBAC)**: Assign roles and toggle `Active` / `Suspended` status.
- **Immutable System Activity Logs**: Searchable audit log tracking every action (`ORDER_PLACED`, `ORDER_READY`, `ORDER_COLLECTED`, `DELAY_ESCALATION`).

---

## 🎬 Scene-by-Scene Demo Video Script (Hackathon Presentation)

**Total Duration: 2 Minutes 30 Seconds**

### Scene 1: The Problem & Solution Hook (0:00 - 0:25)
- **Visual**: Show the Hero banner on the Customer Menu.
- **Narration**: *"At university breaks, hundreds of students rush to the canteen at the exact same minute. Long queues, confusion over who ordered first, and items selling out cause immense frustration. Today, we present Smart Canteen: an intelligent pre-ordering, digital token queue, and dynamic kitchen coordination system."*

### Scene 2: Customer Pre-Order & Scheduling (0:25 - 0:55)
- **Visual**:
  1. Filter by "Burgers", select "Zinger Crunch Burger" and click `+ ADD`.
  2. Enter special instruction: *"Extra spicy, please"*.
  3. Open Cart Tray.
  4. Select **15-Minute Pickup Slot** (e.g., `1:00 PM - 1:15 PM`). Point out how full slots are disabled.
  5. Select **Easypaisa**, enter mobile number and sandbox OTP `1234`.
  6. Click **Confirm Pre-Order**. Watch the confetti explosion and sound chime!
- **Narration**: *"A student browses the menu, adds items, selects a dedicated 15-minute pickup window, chooses Easypaisa, and submits with full idempotency protection. Instantly, digital token C-026 is generated."*

### Scene 3: Live Order Tracking & Token Generation (0:55 - 1:15)
- **Visual**: Show the Live Order Track screen. Highlight the large token number, QR code, dynamic ready countdown ("Ready in ~10 mins"), and animated progress stepper.
- **Narration**: *"The student receives their digital token and QR code with a live countdown, so they only walk to the counter when food is actually ready."*

### Scene 4: Kitchen Display System (KDS) & Real-Time Flow (1:15 - 1:40)
- **Visual**:
  1. Click **Kitchen Staff** in the Demo Mode Bar.
  2. Point out the dark charcoal theme, large touch buttons, and alert badges (`[DELAYED]`, `[QUICK]`).
  3. Tap **Start Preparing** on Token C-026.
  4. Tap **Mark Ready for Counter**. Hear the chime!
- **Narration**: *"Kitchen staff see orders prioritized by our smart queue engine. With one tap, Chef Bilal starts cooking, then marks the tray Ready. The student is notified in real time."*

### Scene 5: Counter Pickup & Duplicate Prevention Shield (1:40 - 2:05)
- **Visual**:
  1. Click **Counter Pickup Scanner**.
  2. Type token `C-020` (already collected) and click **Verify**.
  3. Show the bright red **PREVENTED DUPLICATE FOOD DISPENSING** warning with collection timestamp.
  4. Now enter `C-026` and click **Confirm Food Handover & Complete Order**.
- **Narration**: *"At the counter, staff verify the token. Notice our duplicate protection: if a student attempts to collect the same meal twice, the system immediately flags it with the exact timestamp. When verified, the order completes safely."*

### Scene 6: Manager Dashboard & Smart AI Insights (2:05 - 2:30)
- **Visual**:
  1. Switch to **Manager** role.
  2. Showcase live KPI cards, peak hour hourly bar chart (1:00 PM peak), and payment method pie chart.
  3. Switch to **Smart AI Insights**: Show Demand Predictions, Pre-Rush Batch Guidance, and the Gemini executive summary.
- **Narration**: *"The manager dashboard provides complete operational visibility: live sales, cancellation analytics, and AI demand forecasting that advises the kitchen exactly how many portions to prep before the rush bell rings. Smart Canteen turns chaotic rush hours into an organized, high-efficiency experience."*

---

## 🛠️ Local Development & Execution

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build
```

---

## 📦 Deployment Instructions

- **Frontend (Vercel / Netlify / Cloud Run)**:
  - Build command: `npm run build`
  - Output directory: `dist`
- **Backend (Render / Railway / Supabase)**:
  - Build command: `npm install && npx prisma generate`
  - Start command: `node server/index.ts`
  - Connect PostgreSQL with `DATABASE_URL` in environment variables.

---

## ✅ Hackathon Requirements Verification Matrix

| Requirement | Implementation File | Status |
|---|---|---|
| **Digital Menu with 25+ Items & Categories** | `src/data/seedData.ts`, `src/components/customer/MenuCatalog.tsx` | Complete |
| **Real-Time Stock & Availability Limits** | `src/services/storageService.ts`, `src/components/kitchen/QuickStockToggleModal.tsx` | Complete |
| **15-Min Pickup Scheduling & Capacity** | `src/components/customer/CartDrawer.tsx`, `src/components/manager/PickupSlotsEditor.tsx` | Complete |
| **Payment Abstraction (Wallets, Cards, Cash)** | `src/services/paymentService.ts`, `src/components/customer/CartDrawer.tsx` | Complete |
| **Idempotency & Duplicate Order Prevention** | `src/services/storageService.ts` | Complete |
| **Digital Token & QR Generation** | `src/components/customer/OrderTrackingView.tsx` | Complete |
| **Dynamic ETA Calculation Engine** | `src/services/queueEngine.ts` | Complete |
| **Smart Kitchen Queue & Priority Sorting** | `src/services/queueEngine.ts`, `src/components/kitchen/KitchenDisplay.tsx` | Complete |
| **Duplicate Token Collection Prevention** | `src/components/kitchen/TokenCollectionScanner.tsx` | Complete |
| **Order Cancellation & Stock Restoration** | `src/components/customer/OrderTrackingView.tsx`, `src/services/storageService.ts` | Complete |
| **1-Click Reorder Skipping Sold-Out Items** | `src/components/customer/OrderHistoryView.tsx` | Complete |
| **Email Verification & Account Management** | `src/components/customer/CustomerProfile.tsx`, `server/routes/auth.ts` | Complete |
| **Live KPI Dashboard & Visual Charts** | `src/components/manager/ManagerDashboard.tsx` | Complete |
| **Smart AI Forecasting & Gemini Insights** | `src/services/aiService.ts`, `src/components/manager/SmartInsightsSection.tsx` | Complete |
| **System Audit Logs & RBAC Admin** | `src/components/admin/SystemActivityLogs.tsx`, `src/components/admin/AdminUserManagement.tsx` | Complete |
| **Hackathon Demo Mode Bar & Rush Sim** | `src/components/common/DemoModeBar.tsx` | Complete |
| **Full Express Backend & Prisma Schema** | `server/index.ts`, `server/prisma/schema.prisma`, `server/routes/*` | Complete |
