# Eshop - Multi-Vendor E-Commerce Platform

A production-grade, microservices-based multi-vendor e-commerce platform built with modern web technologies. The system supports three user roles — **Customers**, **Sellers**, and **Admins** — each with dedicated frontends and full lifecycle management for products, orders, payments, and reviews.

---

## Table of Contents

- [System Architecture](#system-architecture)
- [Architecture Diagram](#architecture-diagram)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Microservices Overview](#microservices-overview)
- [Frontend Applications](#frontend-applications)
- [Shared Packages](#shared-packages)
- [Database Schema](#database-schema)
- [Kafka Event-Driven Communication](#kafka-event-driven-communication)
- [API Endpoints](#api-endpoints)
- [20% Platform Service Fee Model](#20-platform-service-fee-model)
- [Authentication & Authorization](#authentication--authorization)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [License](#license)

---

## System Architecture

The platform follows a **microservices architecture** pattern with an **API Gateway** for centralized routing, **Apache Kafka** for asynchronous inter-service communication, **MongoDB** as the shared database via Prisma ORM, and **Redis** for caching.

```
                         ┌─────────────────────────────────────────────┐
                         │              CLIENT APPLICATIONS            │
                         │                                             │
                         │  ┌───────────┐ ┌───────────┐ ┌───────────┐ │
                         │  │  User UI  │ │ Seller UI │ │ Admin UI  │ │
                         │  │  :3000    │ │  :3001    │ │  :3002    │ │
                         │  │ (Next.js) │ │ (Next.js) │ │ (Next.js) │ │
                         │  └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ │
                         └────────┼─────────────┼─────────────┼────────┘
                                  │             │             │
                                  └──────┬──────┘─────────────┘
                                         │
                                         ▼
                              ┌─────────────────────┐
                              │    API GATEWAY       │
                              │      :8080           │
                              │  (Express + Proxy)   │
                              │  Rate Limiting, CORS │
                              └──────────┬───────────┘
                                         │
               ┌─────────────┬───────────┼───────────┬─────────────┐
               │             │           │           │             │
               ▼             ▼           ▼           ▼             ▼
        ┌────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
        │   Auth     │ │ Product  │ │  Order   │ │ Payment  │ │  Review  │
        │  Service   │ │ Service  │ │ Service  │ │ Service  │ │ Service  │
        │   :6001    │ │  :6002   │ │  :6003   │ │  :6004   │ │  :6005   │
        │ (Express)  │ │(Express) │ │(Express) │ │(Express) │ │(Express) │
        └─────┬──────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
              │              │            │            │             │
              │              │            ▼            ▼             │
              │              │     ┌────────────────────────┐       │
              │              │     │    Apache Kafka        │       │
              │              │◄────│  (Event Bus / Broker)  │──────►│
              │              │     │  order.*, payment.*,   │       │
              │              │     │  review.*, product.*   │       │
              │              │     └────────────────────────┘       │
              │              │            │            │             │
              ▼              ▼            ▼            ▼             ▼
        ┌──────────────────────────────────────────────────────────────┐
        │                        MongoDB                               │
        │              (Shared Database via Prisma ORM)                │
        │  Users, Sellers, Admins, Products, Orders, Payments, Reviews │
        └──────────────────────────────────────────────────────────────┘
              │                                           │
              ▼                                           ▼
        ┌──────────────┐                          ┌──────────────┐
        │    Redis     │                          │    Stripe    │
        │  (Caching)   │                          │  (Payments)  │
        └──────────────┘                          └──────────────┘
```

---

## Architecture Diagram

### Request Flow

```
User Browser ──► User UI (Next.js :3000) ──► API Gateway (:8080) ──► Microservice
                                                   │
                                          ┌────────┼────────┐
                                          │        │        │
                                     /api/*   /product-api  /order-api
                                       │         │            │
                                  Auth Service  Product    Order
                                    (:6001)    Service    Service
                                              (:6002)    (:6003)
```

### Kafka Event Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                        EVENT-DRIVEN FLOWS                           │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ORDER PLACEMENT FLOW:                                               │
│  User places order                                                   │
│    └─► Order Service publishes [order.placed]                        │
│         └─► Payment Service consumes ─► awaits Stripe webhook        │
│                                                                      │
│  PAYMENT SUCCESS FLOW:                                               │
│  Stripe webhook: payment_intent.succeeded                            │
│    └─► Payment Service publishes [payment.succeeded]                 │
│         └─► Order Service consumes ─► updates order to "confirmed"   │
│                                                                      │
│  ORDER CANCELLATION FLOW:                                            │
│  Admin/system cancels order                                          │
│    └─► Order Service publishes [order.cancelled]                     │
│         ├─► Payment Service consumes ─► processes Stripe refund      │
│         │    └─► publishes [payment.refunded]                        │
│         └─► Product Service consumes ─► restores product stock       │
│                                                                      │
│  DELIVERY FLOW:                                                      │
│  Seller marks all items delivered                                    │
│    └─► Order Service publishes [order.delivered]                     │
│         └─► Review Service enables review submission for this order  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Fee Structure Diagram

```
┌─────────────────────────────────────────────────────┐
│                  ORDER TOTAL: $120                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Product Subtotal ────────────────── $100.00         │
│    ├─► Seller Earnings (80%) ─────── $80.00          │
│    └─► Platform Fee (20%) ────────── $20.00          │
│                                                      │
│  Service Fee (20% of subtotal) ───── $20.00          │
│    └─► Goes to Platform ──────────── $20.00          │
│                                                      │
│  ════════════════════════════════════════             │
│  Total charged to customer ────────── $120.00        │
│  Total to seller ─────────────────── $80.00  (80%)   │
│  Total platform revenue ──────────── $40.00  (20%)   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend

| Technology                     | Purpose                              |
| ------------------------------ | ------------------------------------ |
| **Node.js**                    | Runtime environment                  |
| **Express.js** 4.21            | Web framework for microservices      |
| **Prisma** 6.19                | ORM for MongoDB                      |
| **MongoDB**                    | NoSQL database (shared)              |
| **Apache Kafka** (KafkaJS 2.2) | Event-driven inter-service messaging |
| **Redis** (Upstash)            | Caching layer                        |
| **Stripe** 20.3                | Payment processing                   |
| **JWT** (jsonwebtoken 9.0)     | Authentication tokens                |
| **bcryptjs** 3.0               | Password hashing                     |
| **Nodemailer** 7.0             | Email notifications (Gmail SMTP)     |
| **express-http-proxy**         | API Gateway proxying                 |
| **express-rate-limit**         | Rate limiting                        |
| **Swagger**                    | API documentation                    |

### Frontend

| Technology                     | Purpose                      |
| ------------------------------ | ---------------------------- |
| **Next.js** 16                 | React framework (App Router) |
| **React** 19                   | UI library                   |
| **TypeScript** 5.9             | Type safety                  |
| **Tailwind CSS** 3.4           | Utility-first styling        |
| **shadcn/ui** (Radix UI + CVA) | Component library            |
| **TanStack React Query** 5.90  | Server state management      |
| **Jotai** 2.17                 | Client state management      |
| **Axios** 1.13                 | HTTP client                  |
| **Lucide React**               | Icon library                 |

### DevOps & Tooling

| Technology         | Purpose                             |
| ------------------ | ----------------------------------- |
| **Nx** 22.4        | Monorepo management                 |
| **Docker Compose** | Containerized Kafka (KRaft mode)    |
| **Webpack** 5.98   | Module bundling (backend)           |
| **SWC**            | Fast TypeScript/JavaScript compiler |
| **Jest** 30        | Testing framework                   |
| **Prettier** 3.8   | Code formatting                     |

---

## Project Structure

```
eshop/
├── apps/
│   ├── api-gateway/              # API Gateway (port 8080)
│   │   └── src/main.ts           # Proxy routing, rate limiting, CORS
│   │
│   ├── auth-service/             # Authentication Service (port 6001)
│   │   └── src/
│   │       ├── controller/       # Login, register, token refresh, admin auth
│   │       ├── routes/           # API routes
│   │       ├── utils/            # Cookie helpers, email templates, admin seeding
│   │       └── swagger.js        # API documentation generator
│   │
│   ├── product-service/          # Product Service (port 6002)
│   │   └── src/
│   │       ├── controller/       # Product CRUD, reviews, search
│   │       ├── routes/           # Product & review API routes
│   │       └── utils/            # Kafka producer & consumer
│   │
│   ├── order-service/            # Order Service (port 6003)
│   │   └── src/
│   │       ├── controller/       # Order placement, status mgmt, revenue
│   │       ├── routes/           # User/Seller/Admin order routes
│   │       └── utils/            # Kafka producer & consumer, order number gen
│   │
│   ├── payment-service/          # Payment Service (port 6004)
│   │   └── src/
│   │       ├── controller/       # Stripe intents, webhooks, refunds
│   │       ├── routes/           # Payment & webhook routes
│   │       └── utils/            # Kafka producer & consumer
│   │
│   ├── review-service/           # Review Service (port 6005)
│   │   └── src/
│   │       ├── controller/       # Order reviews, seller reviews
│   │       ├── routes/           # Review API routes
│   │       └── utils/            # Kafka producer
│   │
│   ├── user-ui/                  # Customer Frontend (port 3000)
│   │   └── src/
│   │       ├── app/(routes)/     # Pages: products, cart, checkout, orders
│   │       ├── components/       # shadcn/ui + product components
│   │       ├── hooks/            # React Query hooks
│   │       ├── store/            # Jotai atoms (cart state)
│   │       └── shared/           # Header, footer, layout widgets
│   │
│   ├── seller-ui/                # Seller Dashboard (port 3001)
│   │   └── src/
│   │       ├── app/(routes)/     # Pages: dashboard, products, orders, revenue
│   │       ├── components/       # shadcn/ui + product management components
│   │       ├── hooks/            # React Query hooks (products, orders, seller)
│   │       └── app/shared/       # Sidebar navigation
│   │
│   └── admin-ui/                 # Admin Dashboard (port 3002)
│       └── src/
│           ├── app/(routes)/     # Pages: dashboard, sellers, products,
│           │                     #         customers, orders, revenue, reviews
│           ├── components/       # shadcn/ui + dashboard components
│           ├── hooks/            # React Query hooks (all admin endpoints)
│           └── types/            # TypeScript interfaces
│
├── packages/
│   ├── error-handler/            # Shared error classes & middleware
│   │   ├── index.ts              # AppError, NotFoundError, ValidationError, etc.
│   │   └── error-middleware.ts   # Express error handling middleware
│   │
│   ├── middleware/               # Shared auth middleware
│   │   ├── isAuthenticated.ts    # JWT verification + role-based lookup
│   │   └── autherizeRoles.ts     # isUser, isSeller, isAdmin guards
│   │
│   └── libs/
│       ├── prisma/index.ts       # Shared Prisma client singleton
│       ├── redis/index.ts        # Shared Redis client (Upstash TLS)
│       └── kafka/index.ts        # Kafka client, producer/consumer factories,
│                                 # topic constants (ORDER, PAYMENT, REVIEW, PRODUCT)
│
├── prisma/
│   └── schema.prisma             # MongoDB schema (all models)
│
├── docker-compose.yml            # Kafka container (Confluent, KRaft mode)
├── nx.json                       # Nx workspace configuration
├── package.json                  # Root dependencies & scripts
├── tsconfig.base.json            # Shared TypeScript configuration
└── .env                          # Environment variables
```

---

## Microservices Overview

### 1. API Gateway (Port 8080)

Central entry point for all client requests. Routes traffic to backend microservices via HTTP proxy.

| Route Pattern    | Target Service          |
| ---------------- | ----------------------- |
| `/api/*`         | Auth Service (:6001)    |
| `/product-api/*` | Product Service (:6002) |
| `/order-api/*`   | Order Service (:6003)   |
| `/payment-api/*` | Payment Service (:6004) |
| `/review-api/*`  | Review Service (:6005)  |

**Features:** CORS (origins 3000, 3001, 3002), rate limiting, request logging (Morgan)

### 2. Auth Service (Port 6001)

Handles user, seller, and admin authentication with JWT tokens stored in HTTP-only cookies.

| Feature             | Description                                   |
| ------------------- | --------------------------------------------- |
| User Registration   | Email/password signup with email verification |
| Seller Registration | Create seller account with shop details       |
| Admin Login         | Seeded admin account with super-admin role    |
| JWT Tokens          | Access (15min) + Refresh (7d) tokens          |
| Token Refresh       | Automatic refresh with cookie rotation        |
| Password Reset      | Email-based reset flow via Nodemailer         |

### 3. Product Service (Port 6002)

Manages the product catalog, inventory, and product reviews.

| Feature            | Description                                 |
| ------------------ | ------------------------------------------- |
| Product CRUD       | Create, update, delete products (seller)    |
| Image Management   | Multiple product images with URLs           |
| Search & Filter    | By category, price range, tags, keyword     |
| Stock Management   | Inventory tracking, auto-decrement on order |
| Product Reviews    | Star ratings + comments (customers)         |
| Rating Aggregation | Auto-calculated average ratings             |
| Kafka Consumer     | Restores stock on order cancellation/refund |

### 4. Order Service (Port 6003)

Manages the complete order lifecycle with 20% platform service fee.

| Feature         | Description                                            |
| --------------- | ------------------------------------------------------ |
| Order Placement | Cart-to-order with stock validation                    |
| Order Number    | Auto-generated `ORD-YYYYMMDD-XXXX` format              |
| Fee Calculation | 20% service fee, per-item seller/platform split        |
| Status Tracking | pending - confirmed - processing - shipped - delivered |
| Seller Orders   | Filtered view of items belonging to seller             |
| Admin Dashboard | Revenue stats, order management, analytics             |
| Kafka Consumer  | Listens for payment.succeeded/refunded events          |

### 5. Payment Service (Port 6004)

Handles Stripe payment processing with webhook integration.

| Feature           | Description                                       |
| ----------------- | ------------------------------------------------- |
| PaymentIntent     | Creates Stripe payment intents for orders         |
| Webhook Handler   | Processes payment_intent.succeeded/failed         |
| Seller Transfers  | Transfers 80% to seller Stripe connected accounts |
| Refund Processing | Admin-initiated refunds via Stripe                |
| Kafka Consumer    | Auto-refunds on order cancellation                |

### 6. Review Service (Port 6005)

Manages order-based seller reviews and admin review moderation.

| Feature              | Description                                 |
| -------------------- | ------------------------------------------- |
| Order Reviews        | Customers review sellers after delivery     |
| Seller Ratings       | Aggregated ratings per seller               |
| Admin Moderation     | View all reviews, delete inappropriate ones |
| Duplicate Prevention | One review per user per order               |

---

## Frontend Applications

### User UI (Port 3000) - Customer Storefront

| Page               | Description                                                      |
| ------------------ | ---------------------------------------------------------------- |
| **Home**           | Featured products, categories                                    |
| **Products**       | Product listing with search, filters, pagination                 |
| **Product Detail** | Image gallery, reviews, add to cart with qty selector            |
| **Cart**           | View/edit cart items, quantity controls, order summary with fees |
| **Checkout**       | Shipping address form, order summary, place order                |
| **Orders**         | Order history with status badges                                 |
| **Order Detail**   | Status timeline, shipping/payment info, item details             |
| **Login/Register** | User authentication                                              |

**State Management:**

- Cart stored in localStorage via Jotai `atomWithStorage`
- Cart badge in header shows real-time count
- React Query for server state (products, orders)

### Seller UI (Port 3001) - Seller Dashboard

| Page          | Description                                                                            |
| ------------- | -------------------------------------------------------------------------------------- |
| **Dashboard** | Stats cards (sales, earnings, items sold), recent orders, quick actions                |
| **Products**  | Product list, create/edit/delete with image upload                                     |
| **Orders**    | Order items table with status progression (pending - processing - shipped - delivered) |
| **Revenue**   | Earnings breakdown (80/20 split), sales chart, items sold                              |

### Admin UI (Port 3002) - Admin Dashboard

| Page             | Description                                             |
| ---------------- | ------------------------------------------------------- |
| **Dashboard**    | Platform-wide stats, recent orders                      |
| **Sellers**      | Manage all sellers and their shops                      |
| **Products**     | View/manage all products across sellers                 |
| **Customers**    | View all registered users                               |
| **Orders**       | All orders with status filters, confirm/cancel actions  |
| **Order Detail** | Full order info with customer, shipping, payment, items |
| **Revenue**      | Platform revenue dashboard with period filters, charts  |
| **Reviews**      | Moderate product and order reviews                      |

---

## Shared Packages

### Error Handler (`packages/error-handler/`)

Centralized error classes used across all microservices:

| Error Class         | HTTP Status | Usage                          |
| ------------------- | ----------- | ------------------------------ |
| `ValidationError`   | 400         | Invalid input data             |
| `UnauthorizedError` | 401         | Missing/invalid authentication |
| `ForbiddenError`    | 403         | Insufficient permissions       |
| `NotFoundError`     | 404         | Resource not found             |
| `RateLimitError`    | 429         | Too many requests              |
| `AppError`          | 500         | General server error           |
| `DatabaseError`     | 500         | Database operation failure     |

### Middleware (`packages/middleware/`)

| Middleware        | Description                                                                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `isAuthenticated` | Verifies JWT from cookies (`accessToken`, `sellerAccessToken`, or `adminAccessToken`), looks up account in DB, attaches to `req.user`/`req.seller`/`req.admin` |
| `isUser`          | Ensures `req.role === 'user'`                                                                                                                                  |
| `isSeller`        | Ensures `req.role === 'seller'`                                                                                                                                |
| `isAdmin`         | Ensures `req.role === 'admin'`                                                                                                                                 |

### Libs (`packages/libs/`)

| Library  | Description                                                       |
| -------- | ----------------------------------------------------------------- |
| `prisma` | Shared PrismaClient singleton for MongoDB access                  |
| `redis`  | Redis client with Upstash TLS support and retry logic             |
| `kafka`  | Kafka client factory, producer/consumer creators, topic constants |

---

## Database Schema

Built with **Prisma ORM** targeting **MongoDB**. All models use ObjectId as primary keys.

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    User      │     │   Sellers    │     │    Admin     │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id           │     │ id           │     │ id           │
│ email        │     │ email        │     │ email        │
│ name         │     │ name         │     │ name         │
│ password     │     │ phone_number │     │ password     │
│ avatar       │     │ country      │     │ role         │
│ following[]  │     │ password     │     │ createdAt    │
│ orders[]     │     │ stripeId     │     │ updatedAt    │
│ payments[]   │     │ shop?        │     └──────────────┘
│ reviews[]    │     │ products[]   │
└──────┬───────┘     └──────┬───────┘
       │                    │
       │              ┌─────┴──────┐
       │              ▼            ▼
       │      ┌──────────────┐ ┌──────────────┐
       │      │    Shop      │ │   Product    │
       │      ├──────────────┤ ├──────────────┤
       │      │ name         │ │ name         │
       │      │ bio          │ │ description  │
       │      │ category     │ │ price        │
       │      │ address      │ │ discountPrice│
       │      │ openingHours │ │ category     │
       │      │ website      │ │ tags[]       │
       │      │ socialLinks  │ │ stock        │
       │      └──────────────┘ │ ratings      │
       │                       │ sold_out     │
       │                       │ images[]     │
       │                       │ reviews[]    │
       │                       │ orderItems[] │
       │                       └──────┬───────┘
       │                              │
       ▼                              ▼
┌──────────────┐              ┌──────────────┐
│    Order     │◄─────────────│  OrderItem   │
├──────────────┤              ├──────────────┤
│ orderNumber  │              │ productName  │
│ userId       │              │ price        │
│ subtotal     │              │ quantity     │
│ serviceFee   │              │ sellerAmount │  ← 80% of (price * qty)
│ total        │              │ platformFee  │  ← 20% of (price * qty)
│ status       │              │ sellerId     │
│ shippingAddr │              │ status       │
│ paymentId    │              └──────────────┘
│ items[]      │
└──────┬───────┘
       │
       ▼
┌──────────────┐              ┌──────────────┐
│   Payment    │              │ OrderReview  │
├──────────────┤              ├──────────────┤
│ stripePayId  │              │ userId       │
│ userId       │              │ orderId      │
│ amount       │              │ sellerId     │
│ currency     │              │ rating       │
│ status       │              │ comment      │
│ orders[]     │              └──────────────┘
└──────────────┘
```

### Model Relationships

- **User** has many Orders, Payments, OrderReviews, ProductReviews
- **Seller** has one Shop, has many Products
- **Product** has many ProductImages, ProductReviews, OrderItems
- **Order** has many OrderItems, belongs to User, optional Payment
- **OrderItem** belongs to Order, Product; tracks seller/platform fee split
- **Payment** belongs to User, linked to Orders via Stripe

---

## Kafka Event-Driven Communication

### Topics

| Topic               | Publisher       | Consumer(s)                                                    |
| ------------------- | --------------- | -------------------------------------------------------------- |
| `order.placed`      | Order Service   | Payment Service                                                |
| `order.confirmed`   | Order Service   | —                                                              |
| `order.shipped`     | Order Service   | —                                                              |
| `order.delivered`   | Order Service   | Review Service (enables reviews)                               |
| `order.cancelled`   | Order Service   | Payment Service (auto-refund), Product Service (restore stock) |
| `order.refunded`    | Order Service   | Product Service (restore stock)                                |
| `payment.created`   | Payment Service | —                                                              |
| `payment.succeeded` | Payment Service | Order Service (confirm order)                                  |
| `payment.failed`    | Payment Service | —                                                              |
| `payment.refunded`  | Payment Service | Order Service (mark refunded)                                  |
| `product.created`   | Product Service | —                                                              |
| `product.updated`   | Product Service | —                                                              |
| `product.deleted`   | Product Service | —                                                              |
| `review.created`    | Review Service  | —                                                              |
| `review.deleted`    | Review Service  | —                                                              |

### Consumer Groups

| Consumer Group          | Service         | Subscribed Topics                       |
| ----------------------- | --------------- | --------------------------------------- |
| `order-service-group`   | Order Service   | `payment.succeeded`, `payment.refunded` |
| `payment-service-group` | Payment Service | `order.cancelled`                       |
| `product-service-group` | Product Service | `order.cancelled`, `order.refunded`     |

---

## API Endpoints

### Auth Service (`/api`)

| Method | Endpoint                 | Auth   | Description        |
| ------ | ------------------------ | ------ | ------------------ |
| POST   | `/api/user-registration` | Public | Register new user  |
| POST   | `/api/login-user`        | Public | User login         |
| POST   | `/api/login-seller`      | Public | Seller login       |
| POST   | `/api/login-admin`       | Public | Admin login        |
| GET    | `/api/logged-in-user`    | User   | Get current user   |
| GET    | `/api/logged-in-seller`  | Seller | Get current seller |
| GET    | `/api/logged-in-admin`   | Admin  | Get current admin  |
| POST   | `/api/refresh-tocken`    | Public | Refresh JWT tokens |
| POST   | `/api/logout-user`       | User   | Logout user        |
| POST   | `/api/logout-seller`     | Seller | Logout seller      |
| POST   | `/api/logout-admin`      | Admin  | Logout admin       |

### Product Service (`/product-api`)

| Method | Endpoint                            | Auth   | Description                              |
| ------ | ----------------------------------- | ------ | ---------------------------------------- |
| GET    | `/product-api/products`             | Public | List products (search, filter, paginate) |
| GET    | `/product-api/products/:id`         | Public | Get product detail                       |
| POST   | `/product-api/products`             | Seller | Create product                           |
| PUT    | `/product-api/products/:id`         | Seller | Update product                           |
| DELETE | `/product-api/products/:id`         | Seller | Delete product                           |
| GET    | `/product-api/seller/products`      | Seller | Get seller's products                    |
| POST   | `/product-api/products/:id/reviews` | User   | Add product review                       |

### Order Service (`/order-api`)

| Method | Endpoint                                            | Auth   | Description                |
| ------ | --------------------------------------------------- | ------ | -------------------------- |
| POST   | `/order-api/orders`                                 | User   | Place order                |
| GET    | `/order-api/orders`                                 | User   | Get user's orders          |
| GET    | `/order-api/orders/:id`                             | User   | Get order detail           |
| GET    | `/order-api/seller/orders`                          | Seller | Get seller's order items   |
| PUT    | `/order-api/seller/orders/:id/items/:itemId/status` | Seller | Update item status         |
| GET    | `/order-api/seller/revenue`                         | Seller | Get seller revenue stats   |
| GET    | `/order-api/admin/orders`                           | Admin  | List all orders            |
| GET    | `/order-api/admin/orders/:id`                       | Admin  | Get any order detail       |
| PUT    | `/order-api/admin/orders/:id/status`                | Admin  | Update order status        |
| GET    | `/order-api/admin/revenue`                          | Admin  | Platform revenue dashboard |
| GET    | `/order-api/admin/stats`                            | Admin  | Dashboard aggregate stats  |

### Payment Service (`/payment-api`)

| Method | Endpoint                               | Auth            | Description                 |
| ------ | -------------------------------------- | --------------- | --------------------------- |
| POST   | `/payment-api/create-payment-intent`   | User            | Create Stripe PaymentIntent |
| POST   | `/payment-api/webhook`                 | Public (Stripe) | Stripe webhook handler      |
| GET    | `/payment-api/payments/:id`            | User            | Get payment status          |
| GET    | `/payment-api/admin/payments`          | Admin           | List all payments           |
| POST   | `/payment-api/admin/refund/:paymentId` | Admin           | Process refund              |

### Review Service (`/review-api`)

| Method | Endpoint                               | Auth   | Description             |
| ------ | -------------------------------------- | ------ | ----------------------- |
| POST   | `/review-api/orders/:orderId/review`   | User   | Submit order review     |
| GET    | `/review-api/orders/:orderId/review`   | User   | Get user's order review |
| GET    | `/review-api/seller/:sellerId/reviews` | Public | Get seller reviews      |
| GET    | `/review-api/admin/reviews`            | Admin  | List all reviews        |
| DELETE | `/review-api/admin/reviews/:id`        | Admin  | Delete review           |

---

## 20% Platform Service Fee Model

Every order includes a **20% platform service fee** calculated as follows:

```
For each order item:
  itemTotal    = price x quantity
  sellerAmount = itemTotal x 0.80    (seller keeps 80%)
  platformFee  = itemTotal x 0.20    (platform keeps 20%)

For the order:
  subtotal   = sum of all item totals
  serviceFee = subtotal x 0.20
  total      = subtotal + serviceFee  (charged to customer)
```

**Example:** Customer buys 2 items at $50 each:

- Subtotal: $100.00
- Service Fee (20%): $20.00
- **Total charged: $120.00**
- Seller receives: $80.00 (via Stripe Transfer)
- Platform keeps: $40.00

---

## Authentication & Authorization

The system uses **JWT-based authentication** with HTTP-only cookies for security.

### Token Strategy

| Token          | Cookie Name          | Expiry | Purpose            |
| -------------- | -------------------- | ------ | ------------------ |
| User Access    | `accessToken`        | 15 min | API authentication |
| User Refresh   | `refreshToken`       | 7 days | Token renewal      |
| Seller Access  | `sellerAccessToken`  | 15 min | Seller API auth    |
| Seller Refresh | `sellerRefreshToken` | 7 days | Token renewal      |
| Admin Access   | `adminAccessToken`   | 15 min | Admin API auth     |
| Admin Refresh  | `adminRefreshToken`  | 7 days | Token renewal      |

### JWT Payload

```json
{
  "id": "user/seller/admin MongoDB ObjectId",
  "role": "user | seller | admin"
}
```

### Auth Flow

```
1. Login ─► Server validates credentials
2. Server signs Access + Refresh JWTs
3. Tokens set as HTTP-only cookies
4. Client sends cookies automatically with requests
5. On 401 ─► Client calls /refresh-tocken ─► gets new tokens
6. On refresh failure ─► Redirect to login
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Docker** & Docker Compose (for Kafka)
- **MongoDB** instance (local or Atlas)
- **Stripe** account (for payments, test mode works)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd eshop
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root (see [Environment Variables](#environment-variables) section below).

### 4. Set Up the Database

```bash
npx prisma generate
npx prisma db push
```

### 5. Start Kafka (Docker)

```bash
docker-compose up -d
```

This starts a single-node Kafka broker in KRaft mode on port `9092`.

### 6. Start All Services

```bash
# Start all services and UIs simultaneously
npm run dev
```

Or start individually:

```bash
# Start specific UI
npm run user-ui      # Customer frontend on :3000
npm run seller-ui    # Seller dashboard on :3001
```

### 7. Access the Applications

| Application     | URL                   |
| --------------- | --------------------- |
| User UI         | http://localhost:3000 |
| Seller UI       | http://localhost:3001 |
| Admin UI        | http://localhost:3002 |
| API Gateway     | http://localhost:8080 |
| Auth Service    | http://localhost:6001 |
| Product Service | http://localhost:6002 |
| Order Service   | http://localhost:6003 |
| Payment Service | http://localhost:6004 |
| Review Service  | http://localhost:6005 |

### 8. Default Admin Credentials

The admin account is auto-seeded on auth-service startup:

```
Email:    admin@eshop.com
Password: admin123
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/eshop?retryWrites=true&w=majority"

# Redis
REDIS_HOST="<redis-host>"
REDIS_PORT=6379
REDIS_PASSWORD="<redis-password>"
REDIS_URL="rediss://default:<password>@<host>:<port>"
UPSTASH_REDIS_REST_URL="https://<your-upstash-url>"
UPSTASH_REDIS_REST_TOKEN="<your-upstash-token>"

# Kafka
KAFKA_CLIENT_ID="eshop"
KAFKA_BROKERS="localhost:9092"

# JWT Secrets
ACCESS_TOKEN_SECRET="<your-access-secret>"
REFRESH_TOKEN_SECRET="<your-refresh-secret>"

# Service Ports
PRODUCT_SERVICE_PORT=6002
ORDER_SERVICE_PORT=6003
PAYMENT_SERVICE_PORT=6004
REVIEW_SERVICE_PORT=6005

# Email (Gmail SMTP)
SMTP_HOST="smtp.google.com"
SMTP_PORT=465
SMTP_SERVICE="gmail"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-specific-password"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Admin Seed
ADMIN_SEED_EMAIL="admin@eshop.com"
ADMIN_SEED_PASSWORD="admin123"
```

For the frontend apps, create `.env.local` files:

**User UI & Seller UI** (`apps/user-ui/.env.local` and `apps/seller-ui/.env.local`):

```env
NEXT_PUBLIC_API_URL="http://localhost:8080"
NEXT_PUBLIC_API_BASE_URL="http://localhost:8080/api"
```

**Admin UI** (`apps/admin-ui/.env.local`):

```env
NEXT_PUBLIC_API_URL="http://localhost:8080"
NEXT_PUBLIC_API_BASE_URL="http://localhost:8080/api"
```

---

## Available Scripts

| Script         | Command                | Description                            |
| -------------- | ---------------------- | -------------------------------------- |
| `dev`          | `npm run dev`          | Start all services and UIs             |
| `user-ui`      | `npm run user-ui`      | Start only customer frontend           |
| `seller-ui`    | `npm run seller-ui`    | Start only seller frontend             |
| `auth-doc`     | `npm run auth-doc`     | Generate Swagger docs for auth service |
| `format`       | `npm run format`       | Format all files with Prettier         |
| `format:check` | `npm run format:check` | Check formatting                       |

### Nx Commands

```bash
# Build a specific app
npx nx build auth-service

# Run tests
npx nx test auth-service

# Serve a specific app
npx nx serve order-service

# View dependency graph
npx nx graph
```

---

## Deployment

### Docker Compose (Development)

The included `docker-compose.yml` runs Kafka in KRaft mode:

```yaml
services:
  kafka:
    image: confluentinc/cp-kafka:7.5.0
    container_name: eshop-kafka
    ports:
      - '9092:9092'
    environment:
      CLUSTER_ID: 'eshop-kafka-cluster-001'
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: 'true'
      KAFKA_LOG_RETENTION_HOURS: 168
```

### Production Considerations

- **Database:** Use MongoDB Atlas with proper replica set
- **Kafka:** Use managed Kafka (Confluent Cloud, AWS MSK)
- **Redis:** Use managed Redis (Upstash, AWS ElastiCache)
- **Stripe:** Switch from test keys to live keys
- **JWT Secrets:** Use strong, unique secrets via environment variables
- **CORS:** Restrict origins to actual domain names
- **HTTPS:** Enable TLS/SSL for all services
- **Containers:** Dockerize each microservice independently
- **Orchestration:** Use Kubernetes or Docker Swarm for container management

---

## License

This project is licensed under the **MIT License**.
