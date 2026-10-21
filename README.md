# LuxeCart – E-Commerce Registration & Login Authentication Service

A complete, production-grade **Authentication & User Management Service** built for an E-Commerce platform using **React.js**, **JavaScript (ES6+)**, and **Vite**, designed with a **Minimalist Glassmorphism** user interface.

---

## 📌 Project Overview & Scope

Authentication is one of the most critical components of any software application, as it ensures that only authorized users can access the system securely. This service allows new customers to create an account, securely log in using **Email or Mobile Number**, manage their passwords, and safely access protected e-commerce resources.

### Included Functional Scope:
1. **User Registration** (with strict multi-rule validation & SHA-256 encryption)
2. **User Login** (dual identifier: Email OR Mobile + Password verification)
3. **Logout** (session invalidation & token purge)
4. **Forgot Password** (OTP generation & verification flow)
5. **Reset Password** (post-OTP password reset with session invalidation)
6. **Change Password** (authenticated user current-password verification & update)
7. **JWT Authentication** (HS256 compliant access token generation & inspection)
8. **Session Management** (active session tracking & route protection)

---

## 🛡️ Validation & Security Rules

| Field | Rules & Specifications |
|---|---|
| **Full Name** | • Required<br>• Minimum 3 characters<br>• Maximum 100 characters |
| **Email Address** | • Required<br>• Valid RFC 5322 email syntax (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)<br>• Must be globally unique in database |
| **Mobile Number** | • Required<br>• Exactly 10 numeric digits (`/^[0-9]{10}$/`)<br>• Must be globally unique in database |
| **Password** | • Minimum 8 characters<br>• At least 1 Uppercase letter (`[A-Z]`)<br>• At least 1 Lowercase letter (`[a-z]`)<br>• At least 1 Numeric digit (`[0-9]`)<br>• At least 1 Special character (`[!@#$%^&*...]`) |
| **Confirm Password** | • Required<br>• Must match Password exactly |
| **Password Encryption** | • Standard **SHA-256** cryptographic hash via Web Crypto API with salt before database persistence |
| **JWT Access Token** | • Standard `header.payload.signature` format (`HS256`, 1-hour expiration, includes `sub`, `email`, `mobile`, `role`) |

---

## 🏗️ 7-Stage Software Development Life Cycle (SDLC)

### 1. Planning Phase
- **Purpose**: Design a secure, end-to-end authentication micro-service for an online e-commerce marketplace.
- **Deliverables**: Functional specification, user flow wireframes, security policy definitions.

### 2. Requirement Analysis Phase
- **Functional Requirements (FR)**:
  - FR-01: User Registration with unique email and mobile checks.
  - FR-02: User Login via Email OR Mobile Number.
  - FR-03: JWT Access Token generation upon successful credential check.
  - FR-04: OTP-driven Forgot Password workflow.
  - FR-05: Reset Password with session purge.
  - FR-06: Change Password for authenticated sessions.
  - FR-07: Real-time visual password security checklist.
- **Non-Functional Requirements (NFR)**:
  - Sub-second UI response time using Vite.
  - Glassmorphic UI with `backdrop-filter: blur(24px)` and responsive layout.

### 3. System Design Phase
```
+--------------------------------------------------------------------------+
|                            Browser Client                                |
|                                                                          |
|   +-----------------------+              +---------------------------+   |
|   |   React Router DOM    |<------------>|    AuthContext Manager    |   |
|   +-----------------------+              +---------------------------+   |
|               |                                       |                  |
|       [Route Dispatcher]                     [Web Crypto SHA-256]        |
|               |                              [JWT Generator HS256]       |
|               |                                       |                  |
|       +-------+-------+                               v                  |
|       |               |                 +----------------------------+   |
|       v               v                 | Window localStorage DB     |   |
|  Public Routes   Protected Routes       |  • luxecart_users_db       |   |
|  • /register     • / (Dashboard)        |  • luxecart_active_session |   |
|  • /login        • /change-password     |  • luxecart_jwt_token      |   |
|  • /forgot-pass                         |  • luxecart_password_otp   |   |
|  • /reset-pass                          +----------------------------+   |
+--------------------------------------------------------------------------+
```

### 4. Development & Implementation Phase
- **Tech Stack**: React 18, React Router DOM 6, Vite 5, JavaScript (ES6+), CSS3.
- **Modular Directory**:
  - `src/utils/crypto.js`: Web Crypto API SHA-256 hashing, JWT builder & decoder, OTP generator.
  - `src/context/AuthContext.jsx`: State provider handling user database, active JWT sessions, and recovery flows.
  - `src/components/`: Reusable components (`Navbar`, `ProtectedRoute`, `PasswordField`).
  - `src/pages/`: `Register`, `Login`, `ForgotPassword`, `ResetPassword`, `ChangePassword`, `Home`, `NotFound`.

### 5. Testing Phase (Test Verification Matrix)
| Test ID | Scenario | Input | Expected Output | Status |
|---|---|---|---|---|
| TC-01 | Short name | "Al" | Error: Minimum 3 characters required | PASSED |
| TC-02 | Invalid mobile | "98765" | Error: Must contain exactly 10 digits | PASSED |
| TC-03 | Weak password | "pass123" | Error: Fails 5-point security checklist | PASSED |
| TC-04 | Strong password | "Password123!" | Passes all 5 criteria checkmarks | PASSED |
| TC-05 | Duplicate email | Existing email | Error: Account already exists | PASSED |
| TC-06 | Duplicate mobile | Existing mobile | Error: Mobile number already exists | PASSED |
| TC-07 | Mobile Login | 9876543210 + Pass | Validates and issues JWT Token | PASSED |
| TC-08 | Email Login | sivi@luxecart.com + Pass | Validates and issues JWT Token | PASSED |
| TC-09 | Forgot Password | Request OTP | 6-digit OTP generated & verified | PASSED |
| TC-10 | Reset Password | Enter new password | Updates DB with SHA-256 hash | PASSED |
| TC-11 | Change Password | Verify current + new | Updates password for active user | PASSED |
| TC-12 | Route Guard | Unauthenticated visit `/` | Redirects to `/login` | PASSED |

### 6. Deployment Phase
- Build output created via `npm run build` (`dist/` folder).
- Static assets deployable to Vercel, Netlify, or AWS S3 + CloudFront.

### 7. Maintenance & Security Phase
- Client SHA-256 hashing with application salt.
- In production, deploy behind HTTPS with an Express/FastAPI backend, HttpOnly cookies, and salted `bcrypt` hashes.

---

## 🔑 Pre-Seeded Evaluation Account

Test all features instantly with the pre-seeded account:
- **Email**: `sivi@luxecart.com`
- **Mobile**: `9876543210`
- **Password**: `Password123!` *(Includes Uppercase, Lowercase, Number, and Special character)*
- **Auto-Fill Buttons**: One-click auto-fill for both Email Login and Mobile Login are provided directly on the Login page.

---

## 🚀 How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Run the Vite development server
npm run dev
```
Open **`http://localhost:3000`** in your browser.
