#  Smart Inventory & Order Management System

A modern full-stack web application to manage **inventory, products, customer orders, and fulfillment workflows** with real-time stock validation, conflict detection, and intelligent restocking.

Built with scalability and real-world business logic in mind, this system ensures **data consistency, transactional safety, and operational efficiency**.

---

##  Live Demo
- 🌐 Frontend: *(Add your deployed URL)*
- 🔗 API: *(If applicable)*

---

##  Features

###  Authentication
- Email & Password based authentication  
- Secure login & session handling  
- Demo login for quick access  

---

###  Product & Category Management
- Create and manage categories  
- Add and manage products with:
  - Name, category, price  
  - Stock quantity  
  - Minimum stock threshold  
- Automatic product status:
  - Active  
  - Out of Stock  

---

###  Order Management
- Create, update, cancel orders  
- Multi-product order support  
- Auto-calculated pricing  
- Order lifecycle:
  - Pending → Confirmed → Shipped → Delivered / Cancelled  

---

###  Smart Inventory Handling
- Automatic stock deduction on order placement  
- Prevent overselling with strict validation  
- Real-time stock availability warnings  
- Auto-update product status when stock reaches zero  

---

###  Restock Queue System
- Auto-detect low stock items  
- Priority-based restock queue:
  - High / Medium / Low  
- Manual restocking support  
- Automatic removal after restock  

---

###  Conflict Detection
- Prevent duplicate products in an order  
- Block ordering inactive/unavailable products  
- Clear validation messages for users  

---

###  Dashboard & Insights
- Orders overview (daily stats)  
- Revenue tracking  
- Low stock alerts  
- Product availability summary  

---

###  Activity Log
- Tracks recent system activities:
  - Order creation/updates  
  - Stock updates  
  - Restock events  
  - Status changes  

---

###  Bonus Features
- Search & filtering  
- Pagination  
- Basic analytics (charts)  
- Role-based access (Admin / Manager)  

---

##  Tech Stack

### Frontend
- Next.js (App Router)  
- TypeScript  
- Tailwind CSS  
- ShadCN UI  

### Backend
- Next.js API Routes / Server Actions  

### Database
- PostgreSQL  
- Prisma ORM  

### State Management
- Redux Toolkit / RTK Query *(optional)*  

### Deployment
- Vercel (Frontend + Backend)  
- Neon / Supabase (Database)  

---

##  System Design Highlights

- **Transactional Integrity**
  - Uses Prisma transactions for safe order creation and stock updates  

- **Conflict Prevention**
  - Backend validation to prevent invalid operations  

- **Scalable Architecture**
  - Service-based structure for business logic separation  

- **Real-time Feedback**
  - Immediate validation messages for better UX  

---
