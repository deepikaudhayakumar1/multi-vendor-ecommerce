# Multi-Vendor E-Commerce Marketplace Platform

Complete industrial-ready full-stack implementation based on the 17-page Software Requirements Specification (SRS) document.

## Project Structure
- **`/backend`**: Spring Boot 3.x REST API project configured for **IntelliJ IDEA** (Port `8080`).
- **`/frontend`**: React + Vite SPA project configured for **VS Code** (Port `8081`).
- **`multivendor-marketplace.zip`**: Compressed archive containing both frontend and backend projects ready for distribution.

---

## SRS Functional Requirements Matrix & Module Coverage

| Module / Req ID | Specification Description | Backend Status | Frontend Status |
|---|---|---|---|
| **FR1 - FR3** | Auth, User Registration, Roles, RBAC, JWT, Password Policy | Implemented (`com.examly.springapp.service.AuthService`) | Implemented (`Login.jsx`, `Register.jsx`, `AuthContext.jsx`) |
| **FR4** | Vendor Onboarding, GSTIN, Product Catalogue, Category Queue | Implemented (`ProductService.java`, `Product.java`) | Implemented (`VendorManagement.jsx`, `AdminPanel.jsx`) |
| **FR5** | Customer Shopping, Search, Cart, Wishlist, Checkout, Payment Options | Implemented (`OrderService.java`, `PaymentController.java`) | Implemented (`Shop.jsx`, `Cart.jsx`, `Home.jsx`) |
| **FR6** | Order Lifecycle, SLA (2h confirm, 48h dispatch), AWB Tracking | Implemented (`OrderService.java`, `OrderItem.java`) | Implemented (`Orders.jsx`) |
| **FR7** | Payment Gateway, Split Settlement, Sec 194O 1% TDS, Weekly Payout | Implemented (`PayoutService.java`, `VendorPayout.java`) | Implemented (`FinancePanel.jsx`) |
| **FR8 / FR17**| Marketplace Analytics, GMV, Conversion Funnel, Vendor Scorecards | Implemented (`AnalyticsService.java`) | Implemented (`Analytics.jsx`, `Dashboard.jsx`) |
| **FR9** | Return, Refund & Dispute Resolution Workflow | Implemented (`OrderService.returnOrder`) | Implemented (`Orders.jsx`) |
| **FR14 / App E**| Custom Exception Package (`com.examly.springapp.exception`) | Implemented (`InvalidNameException`, `InvalidPhoneException`, etc.) | Validated & Managed via `GlobalExceptionHandler` |

---

## Validation & Business Rules Enforced

1. **Name Field Validation**: Alphabetic & spaces only (`"Name must not contain special characters or numbers"` / `InvalidNameException`).
2. **Phone Field Validation**: Exactly 10 digits (`"Phone Number must be exactly 10 digits long"` / `InvalidPhoneException`).
3. **Login Error Message**: `"Invalid credentials. Please check your email and password."`
4. **Registration Success Message**: `"Registration successful! Please verify your email."`
5. **Product Price Validation**: Selling price positive and <= MRP (`"Selling price must be a positive number not exceeding MRP"`).
6. **Stock Validation**: Stock quantity >= 0 (`"Stock quantity cannot be negative"`).
7. **JWT Config**: HS256 algorithm with role-based expiry (8h users, 12h staff, 24h admin).

---

## How to Launch the Full Industrial Project

### 1. Launching Backend in IntelliJ IDEA
1. Open **IntelliJ IDEA** -> Open Folder `multivendor-marketplace/backend`.
2. Ensure Java 17 SDK is selected.
3. Run `SpringAppApplication.java` from `com.examly.springapp`.
4. Backend starts on `http://localhost:8080`.

### 2. Launching Frontend in VS Code
1. Open **VS Code** -> Open Folder `multivendor-marketplace/frontend`.
2. Open terminal and run `npm install`.
3. Run `npm run dev`.
4. Frontend starts on `http://localhost:8081`.

### 3. Test Credentials
- **Admin**: `admin@marketplace.com` / `Admin@123`
- **Vendor**: `vendor@techhub.com` / `Vendor@123`
- **Customer**: `customer@gmail.com` / `Customer@123`
- **Category Manager**: `catmanager@marketplace.com` / `Staff@123`
- **Finance Officer**: `finance@marketplace.com` / `Staff@123`
