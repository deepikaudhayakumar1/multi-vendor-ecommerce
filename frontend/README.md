# Multi-Vendor E-Commerce Marketplace Platform - React Frontend

## Overview
This is the React.js frontend built with Vite and React Router DOM v6 according to the 17-page Software Requirements Specification (SRS) document.

## Tech Stack
- **Framework**: React 18 + Vite
- **Routing**: React Router DOM v6
- **State Management**: Context API (`AuthContext`)
- **HTTP Client**: Axios with JWT interceptor
- **Icons**: Lucide React
- **Port**: `8081`

## Features & Modules Included
1. **`NavBar.jsx`**: Brand title, navigation links (`Home`, `Shop`, `Dashboard`, `Orders`, `Cart`, `My Catalogue`, `Admin Panel`, `Finance Panel`, `Analytics`), role badge, logout clearing localStorage JWT.
2. **`Login.jsx`**: Multi-credential login form with password show/hide toggle. Error message: `"Invalid credentials. Please check your email and password."`
3. **`Register.jsx`**: Multi-step registration form with client-side name regex check (alphabetic+space) and 10-digit phone check. Success message: `"Registration successful! Please verify your email."`
4. **`Dashboard.jsx`**: Role-aware overview with KPI cards, quick actions, and SLA compliance metrics.
5. **`Shop.jsx`**: Product catalogue with search, category filtering, detail modal, and Add to Cart / Wishlist.
6. **`Cart.jsx`**: Cart quantity manager, delivery address selector (up to 5 saved), coupon input, multi-gateway payment selector (UPI, Card, Net Banking, COD, BNPL).
7. **`Orders.jsx`**: Order lifecycle tracking, AWB shipment numbers, SLA status transitions, return requests.
8. **`VendorManagement.jsx`**: Product catalogue listing, new product form with MRP/Price validation (`basePrice <= mrp`), stock tracking, CSV bulk upload tool.
9. **`FinancePanel.jsx`**: Commission reconciliation, weekly vendor payout execution, Section 194O 1% TDS calculation, UTR tracking.
10. **`AdminPanel.jsx`**: Category Manager quality review queue, user account lifecycle management.
11. **`Analytics.jsx`**: GMV charts, conversion funnel, vendor scorecard table, logistics SLA metrics.
12. **`Footer.jsx`**: `"© 2024 Multi-Vendor E-Commerce Marketplace Platform. All rights reserved."`

## How to Run in VS Code
1. Open Visual Studio Code -> **File** -> **Open Folder** -> Select the `frontend` folder.
2. Open the built-in terminal (**Ctrl + `** or **Cmd + `**).
3. Run `npm install` to install all dependencies.
4. Run `npm run dev` to start the Vite development server.
5. Open your browser and navigate to `http://localhost:8081`.
