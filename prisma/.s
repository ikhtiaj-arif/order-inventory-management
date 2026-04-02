// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}

enum UserRole {
  ADMIN
  MANAGER
  USER
}

enum ProductStatus {
  ACTIVE
  INACTIVE
  OUT_OF_STOCK
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
}

enum RestockPriority {
  HIGH
  MEDIUM
  LOW
}

enum EntityType {
  PRODUCT
  ORDER
  RESTOCK
}

// User model for authentication
model User {
  id        String     @id @default(cuid())
  email     String     @unique
  name      String?
  password  String? // hashed password for email/password auth
  role      UserRole   @default(USER)
  image     String?
  
  // Relations
  accounts  Account[]
  sessions  Session[]
  categories Category[]
  products  Product[]
  orders    Order[]
  restockQueue RestockQueue[]
  activityLogs ActivityLog[]
  
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

// NextAuth models
model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?  @db.Text
  access_token       String?  @db.Text
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?  @db.Text
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// Domain models
model Category {
  id        String   @id @default(cuid())
  name      String
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  products  Product[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([userId, name])
}

model Product {
  id                  String   @id @default(cuid())
  name                String
  categoryId          String
  category            Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  price               Decimal  @db.Decimal(10, 2)
  stock               Int      @default(0)
  minStockThreshold   Int      @default(10)
  status              ProductStatus @default(ACTIVE)
  userId              String
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Relations
  orderItems          OrderItem[]
  restockQueue        RestockQueue?
  
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  // Indexes for performance
  @@index([userId, status])
  @@index([categoryId])
  @@index([userId, name])
}

model Order {
  id            String   @id @default(cuid())
  orderNumber   String   @unique
  customerName  String
  totalPrice    Decimal  @db.Decimal(10, 2)
  status        OrderStatus @default(PENDING)
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Relations
  items         OrderItem[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Indexes for performance
  @@index([userId, status])
  @@index([userId, createdAt])
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  unitPrice Decimal @db.Decimal(10, 2)
  subtotal  Decimal @db.Decimal(10, 2)
  
  createdAt DateTime @default(now())
  
  @@index([orderId])
  @@index([productId])
}

model RestockQueue {
  id            String   @id @default(cuid())
  productId     String   @unique
  product       Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  currentStock  Int
  priority      RestockPriority @default(MEDIUM)
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([userId, priority])
  @@index([userId, currentStock])
}

model ActivityLog {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  action      String   // e.g., "ORDER_CREATED", "STOCK_UPDATED", "PRODUCT_ADDED"
  entityType  EntityType
  entityId    String   // ID of the entity being acted upon
  details     Json?    // Additional data about the action
  timestamp   DateTime @default(now())
  
  @@index([userId, timestamp(sort: Desc)])
  @@index([entityType])
}
