# Smart Inventory & Order Management System

A robust, full-stack Next.js web application engineered to seamlessly handle stock control, real-time inventory deduction, detailed order management workflows, and preemptive restock tracking. 

## Features Implemented

1. **Secure Authentication**
   * Pre-configured **Demo Account** (1-click login) and standard Email/Password authentication routes.
   * Secure dashboard redirection and session protection.

2. **Product & Category Management**
   * Dynamically create ad-hoc categories during product creation (e.g., Electronics, Grocery).
   * Specify explicit Product constraints: Initial Stock, Pricing, and critical **Minimum Stock Thresholds**.
   * Real-time automated status tracking (Active / Out of Stock).

3. **Advanced Order Workflow**
   * Multi-item order payloads with automatically calculated subtotals and grand totals.
   * Complete Order Lifecycle Management allowing Status Updates (`CONFIRMED`, `SHIPPED`, `DELIVERED`).
   * Intelligent **Cancellation Engine**: Canceling an order automatically frees reserved components, reinstating exact inventory units back into circulation.

4. **Deep-Level Stock Handling Rules**
   * **Atomic Database Transactions:** Employs Prisma `$transaction` blocks ensuring no race conditions during checkout.
   * Hard inventory checks against frontend payloads preventing malicious attempts to over-draft stock balances.
   * Auto-toggling of parent product statuses to `OUT_OF_STOCK` instantly upon hitting exactly `0` stock.

5. **Automated Restock Queue**
   * When an order pushes a product below its `minStockThreshold`, it triggers a background process instantly enqueuing the item into the Restock Queue.
   * Calculates immediate Priority level (`HIGH` or `MEDIUM`) based on stock urgency.
   * UI natively sorts the queue highlighting the most depleted stocks first.
   * Quick-Action Approve routines instantly mutate main inventory levels upon arrival of new stock.

6. **Order Conflict Detection**
   * Enforces single-product deduplication logic prohibiting duplicate instances within the same order form.
   * Completely locks out modifications related to currently `INACTIVE` catalog assets.

7. **Rich Analytics Dashboard**
   * Live Key Performance Indicators (KPIs): Total Orders, Pending Orders, Depleted Stocks, Revenue.
   * Dedicated Product Breakdown explicit summary lists isolating low-stock urgency alerts directly to admin viewpoints.

8. **Comprehensive Audit Logs**
   * Logs tracking real-world events (`CREATE_ORDER`, `CANCEL_ORDER`, `UPDATE_ORDER_STATUS`, `CREATE_PRODUCT`).
   * Provides immediate traceability regarding critical application commands and user activity times.

## Tech Stack
* **Frontend:** Next.js 15 (App Router), React, Tailwind CSS (Modern v4 Shadcn Theme), Lucide Icons, SWR for caching, Recharts.
* **Backend:** Next.js Route Handlers.
* **Database:** PostgreSQL.
* **ORM:** Prisma Client.
* **Validation:** Zod & React Hook Form.

---

## Local Installation / Setup Guide

### 1. Prerequisites
Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/en/) (v18 or higher)
* `npm` or `yarn`

### 2. Clone the Repository
```bash
git clone <your-repository-url>
cd smart-inventory-system
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup Environment Variables
Create a `.env` file in the root directory. Configure your PostgreSQL Database URL (You can obtain one locally via Docker or a free cloud provider like Neon/Supabase).

```env
DATABASE_URL="postgresql://user:password@hostname/dbname?sslmode=require"
JWT_SECRET="your-super-strong-secret-key"
```

### 5. Initialize the Database
Push the Prisma schemas to your Database to scaffold the tables.
```bash
npx prisma generate
npx prisma db push
```

*(Optional)* If you have a seed script inside `/prisma/seed.ts`, you can run `npm run db:seed`.

### 6. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser. 

---

## Production Deployment (Vercel)
Deploying this Next.js app to Vercel is seamless:
1. Update `package.json` build step to `"build": "prisma generate && prisma db push && next build"`.
2. Push your code to GitHub.
3. Import the project within Vercel.
4. Input your `DATABASE_URL` and `JWT_SECRET` in the Environment Variables tab.
5. Click **Deploy**.
