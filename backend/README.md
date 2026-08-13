# Multi-Vendor E-Commerce Marketplace Platform - Spring Boot Backend

## Overview
This is the Spring Boot 3.x backend for the Multi-Vendor E-Commerce Marketplace Platform built according to the 17-page Software Requirements Specification (SRS) document.

## Tech Stack & Specifications
- **Java**: 17+
- **Framework**: Spring Boot 3.2.3, Spring Security, Spring Data JPA
- **Database**: H2 In-Memory Database (console available at `/h2-console`)
- **Authentication**: JWT (HS256) with role-based access claims
- **Port**: `8080`

## Custom Exceptions (`com.examly.springapp.exception`)
- `InvalidNameException` (HTTP 400 - Thrown when name contains digits or special chars)
- `InvalidPhoneException` (HTTP 400 - Thrown when phone is not exactly 10 digits)
- `DuplicateProductException` (HTTP 409 - Thrown when product name exists for vendor)
- `UnauthorisedAccessException` (HTTP 403 - Thrown on invalid credentials or permission breach)
- `ResourceNotFoundException` (HTTP 404 - Thrown when entity is missing)

## How to Run in IntelliJ IDEA
1. Open IntelliJ IDEA -> **File** -> **Open** -> Select the `backend` folder.
2. Ensure Project SDK is set to **Java 17** or higher (**File** -> **Project Structure**).
3. Wait for Maven dependencies to import.
4. Locate `com.examly.springapp.SpringAppApplication` in `src/main/java`.
5. Right-click and select **Run 'SpringAppApplication'**.
6. Backend will start at `http://localhost:8080`.

## Pre-loaded Test Credentials
| Role | Email | Password |
|---|---|---|
| Admin | `admin@marketplace.com` | `Admin@123` |
| Vendor | `vendor@techhub.com` | `Vendor@123` |
| Customer | `customer@gmail.com` | `Customer@123` |
| Category Manager | `catmanager@marketplace.com` | `Staff@123` |
| Finance Officer | `finance@marketplace.com` | `Staff@123` |
