# Design Specification: Hospital Locator System (Nigeria) - Frontend Demo

**Date**: 2026-09-29  
**Status**: Approved by User  
**Topic**: Comprehensive End-to-End Frontend Demo for Hospital Locator System (CSC Project Chapter 3)

---

## 1. Executive Summary & Objective

The **Hospital Locator System** is a modern, responsive web application designed to solve the critical challenges of discovering, evaluating, and navigating to healthcare facilities in Nigeria. This specification details the complete frontend demo implementation covering all user journeys, functional requirements (FR1 to FR6), actors (Guest, Patient, Facility Representative, Administrator), interactive Leaflet maps, emergency response tools, NextAuth authentication, and analytics.

The demo will run on **Next.js (App Router)** with **TypeScript**, **Tailwind CSS**, **NextAuth.js**, and **Leaflet**, featuring a persistent client-side state engine pre-seeded with realistic Nigerian medical facilities across Lagos, Abuja, Ibadan, Port Harcourt, Enugu, and Kano. It also includes an interactive **Demo Switcher Bar** for frictionless evaluation and defense demonstrations.

---

## 2. System Architecture & Tech Stack

### 2.1 Core Technologies
* **Framework**: Next.js 15+ (App Router)
* **Language**: TypeScript (strict mode)
* **Styling**: Tailwind CSS with custom medical theme (Emergency Red, Healthcare Emerald/Teal, Clinical Slate)
* **Icons**: `lucide-react`
* **Authentication**: **NextAuth.js** (`next-auth`) with Credentials Provider, JWT session strategy, custom session callbacks exposing `role`, and Next.js middleware for route protection
* **Backend Architecture**: **Nest.js** architecture for service layer and REST API design (structured modules, controllers, DTOs, and services) instead of Express.js
* **Maps**: Leaflet + `react-leaflet` with dynamic client-only loading (`ssr: false`) to eliminate hydration mismatches, custom SVG pins, marker clusters, and radius overlays
* **State Management**: React Context (`AppContext`) with `localStorage` persistence and fallback seed data
* **Deployment**: Vercel (CLI) + GitHub (public repository: `hospital-locator-nigeria`)

### 2.2 System Roles & Actors
1. **Guest User**: Unauthenticated visitor. Can perform proximity searches, text queries, multi-criteria filtering, view facility profiles, access emergency finder, and compare hospitals.
2. **Authenticated Patient (`Amina Bello` - `patient@demo.com`)**: Can submit 5-dimension ratings & reviews, save favorites with personal notes, view and clear search/browsing history, and update profile settings.
3. **Facility Representative (`Dr. Emeka Okafor` - `rep@demo.com`)**: Linked to *Lagos University Teaching Hospital (LUTH)*. Can claim facility profiles, upload verification documents, manage hospital metadata, toggle live emergency department status (*Accepting Patients* / *Limited Capacity* / *Critical Capacity*), reply to reviews, and review facility analytics.
4. **System Administrator (`Admin Dunsimi` - `admin@demo.com`)**: Can manage hospital directory (CRUD), review and approve facility claims, moderate flagged reviews, manage user accounts, and export database tables (CSV/JSON).

### 2.3 NextAuth Authentication Engine
* **Endpoint**: `/api/auth/[...nextauth]/route.ts`
* **Session Strategy**: JWT with extended session type containing:
  * `id`: user ID
  * `email`: user email
  * `name`: full name
  * `role`: `'patient' | 'representative' | 'admin'`
  * `hospitalId`: (for representative) linked facility ID
  * `phoneNumber`: user contact
* **Quick Login Support**: Credentials provider validates demo credentials or newly registered users from `localStorage`/seed state.
* **Role-Based Redirection & Protection**:
  * `/dashboard/patient` requires `role: 'patient'`
  * `/dashboard/representative` requires `role: 'representative'`
  * `/dashboard/admin` requires `role: 'admin'`
  * Unauthenticated users attempting to access dashboard routes are redirected to `/login?callbackUrl=...`

### 2.4 Demo State Engine (`AppContext`)
* **Hospitals Collection**: Full schemas matching Chapter 3 ERD (`_id`, `name`, `address`, `location` [GeoJSON [lng, lat]], `phoneNumbers`, `email`, `website`, `facilityType`, `services`, `specialties`, `operatingHours`, `emergency24Hours`, `emergencyStatus`, `traumaLevel`, `insuranceAccepted`, `images`, `averageRating`, `totalReviews`, `verified`, `claimedBy`, `accessibility`).
* **Reviews Collection**: User reviews with sub-ratings (`overallRating`, `staffRating`, `cleanlinessRating`, `waitTimeRating`, `careQualityRating`, `reviewText`, `helpful`, `notHelpful`, `response`, `responseDate`, `createdAt`).
* **Claims Collection**: Pending and approved facility claims with document proofs.
* **Favorites & Search History**: Stored per user.
* **Simulated Geolocation Selector**: Quick dropdown allowing anyone anywhere to switch simulated coordinates between:
  * Lagos - Ikeja (Capital / Mainland)
  * Lagos - Victoria Island (Affluent / Island Hub)
  * Abuja - Central Business District (Federal Capital)
  * Ibadan - Ring Road / UI Area (Southwest Academic/Medical Hub)
  * Port Harcourt - Old GRA (South-South Hub)
  * Browser Live GPS (if enabled)

---

## 3. End-to-End Page Specifications

### Page 1: Landing / Home Page (`/`)
* **Hero Search Module**: Unified search bar with real-time suggestions, specialty quick-chips, and simulated location indicator.
* **Emergency Banner (FR3.1)**: High-contrast red pulsing emergency alert card with 1-click CTA directly launching the 10km Emergency Finder.
* **Accredited Facilities Carousel / Grid**: Top-rated verified hospitals with real-time distance calculations and emergency capacity tags.
* **Live System Metrics**: Counters for Verified Facilities, 24/7 Trauma Centers, Insurances Supported, and Patient Reviews.
* **"How It Works" Flow**: 3-step illustrative sequence (Locate Nearby $\rightarrow$ Compare Facilities & HMOs $\rightarrow$ Receive Emergency or Routine Care).

### Page 2: Hospital Search & Map Discovery (`/hospitals`)
* **Interactive Split Layout**: Leaflet Map on one side (with custom colored markers for emergency vs general facilities) and list of hospitals on the other, with a smooth mobile toggle between Map and List view.
* **Multi-Criteria Filter Sidebar (FR2.3)**:
  * Facility Type: Teaching Hospital, Federal Medical Centre, State General Hospital, Specialist Clinic, Primary Healthcare Centre.
  * Services Offered: Emergency Care, ICU, Trauma Care, Surgical Procedures, Dialysis, Maternity & Obstetrics, Radiology/CT/MRI.
  * Insurance Providers: NHIS (National Health Insurance), Hygeia HMO, Reliance HMO, AXA Mansard, Avon HMO, Leadway Health.
  * 24/7 Emergency Toggle.
  * Star Rating: 1★ to 5★ filter.
  * Distance Slider: 1 km to 50 km radius from selected location.
* **Sorting Engine (FR2.5)**: By Distance (Nearest), Average Rating, Review Count, or Name (A-Z).
* **Hospital Result Card**: Photo thumbnail, verified badge, distance in km, estimated travel time, primary contact button, emergency status tag, and favorite bookmark button.

### Page 3: Hospital Detail Profile (`/hospitals/[id]`)
* **Facility Header**: Photo gallery, official name, address, verified checkmark, trauma level indicator, and live Emergency Status banner (*Accepting Patients*, *Limited Capacity*, or *Critical Capacity*).
* **Emergency & Quick Contact Toolbar**: One-click phone calling for ER desk, ambulance contact, official email, website link, and external Google Maps turn-by-turn directions link.
* **Tabbed Profile Content**:
  1. *Overview & Hours*: Detailed operational schedules for outpatient, inpatient, and 24/7 emergency care.
  2. *Services & Specialties*: Full medical specialties catalog with descriptive tags.
  3. *Insurance & HMO Plans*: Detailed list of accepted national and private healthcare insurers.
  4. *Accessibility & Infrastructure*: Wheelchair ramps, dedicated ambulance bays, parking availability, diagnostic lab on-site.
  5. *Location & Map*: Embedded Leaflet map with exact coordinate pin and nearby landmarks.
* **Multi-Dimensional Reviews & Ratings (FR4.1 & FR4.3)**:
  * Rating breakdown: Overall Experience, Staff Professionalism, Facility Cleanliness, Wait Times, and Quality of Care.
  * Review cards with helpfulness voting (+1 / -1) and official Hospital Representative response thread.
  * "Write a Review" interactive modal: 5-star sub-category sliders, visit date selector, review text input, and validation.

### Page 4: Emergency Finder (`/emergency`)
* **Emergency Screen Mode**: High-urgency, clear interface designed for critical situations.
* **10km Radius Proximity Query (FR3.1)**: Automatically queries facilities with active 24/7 emergency departments within 10km of user coordinates, sorted strictly by distance.
* **Trauma Center Prioritization (FR3.4)**: Level I, Level II, and Level III trauma center badges with capability tags.
* **Live Emergency Department Status (FR3.2)**: Color-coded real-time status indicators.
* **Direct Emergency Hotline Integration (FR3.3)**: Instant 1-tap calling for Hospital ER and National Emergency lines (112, 767, FRSC 122).
* **Route & ETA Display**: Distance and estimated transit time preview.

### Page 5: Hospital Comparison Matrix (`/compare`)
* **Side-by-Side Facility Matrix (3.6.2)**: Compare up to 3 facilities side-by-side:
  * Proximity & ETA
  * Facility Type & Trauma Accreditation
  * 24/7 Emergency Availability & Live Status
  * Services & ICU / Bed capacities
  * Accepted HMOs / NHIS
  * Rating breakdown (Overall, Staff, Cleanliness, Care)
  * Direct action buttons (Call, View Details, Directions)

### Page 6: Authentication & Account Recovery (`/login`, `/register`, `/forgot-password`)
* **Login (`/login`)**: Integrated with NextAuth `signIn('credentials')`. Includes 1-click "Quick Demo Login" buttons for Patient, Representative, and Administrator accounts.
* **Registration (`/register`)**: Full name, email, phone number, password, and account role selection (*Patient* vs *Hospital Representative*). Automatically signs in upon successful creation.
* **Password Reset (`/forgot-password`)**: Form with simulated 15-minute verification code input and expiration countdown (FR1.3).

### Page 7: Patient Dashboard (`/dashboard/patient`)
* **Profile Management (FR1.4)**: Edit contact details, preferred HMO, primary language, and notification settings.
* **Favorite Facilities (FR4.5)**: Bookmarked hospitals with user-added personal notes (e.g. "Primary pediatrician", "Emergency contact preferred") and 1-click directions.
* **My Submitted Reviews (FR4.2)**: History of submitted reviews with 30-day edit/delete controls.
* **Search & Browsing History (FR4.6)**: Log of recent search queries and viewed facilities with 1-click "Clear History" button.
* **Account Deletion (FR1.5)**: Account deletion flow confirming anonymization of historical reviews.

### Page 8: Facility Representative Portal (`/dashboard/representative`)
* **Claim Facility & Document Upload (FR6.1)**: Representative claim form with document upload simulation (CAC registration, Ministry of Health license) and live status badge (*Pending Approval* / *Verified*).
* **Facility Information Management (FR6.2)**: Edit hospital address, phone numbers, operating hours, services list, and accepted HMOs.
* **Live Emergency Status Switcher**: Toggle real-time department status (*Accepting Patients*, *Limited Capacity*, *Critical Capacity*) with immediate site-wide reflection.
* **Review Response Management (FR6.3)**: Public response interface to reply directly to patient reviews.
* **Facility Analytics (FR6.4)**: Interactive charts for Profile Views, Search Appearances, Emergency Hotline Calls, and Patient Rating Trends.

### Page 9: System Administrator Portal (`/dashboard/admin`)
* **Analytics Dashboard (FR5.4)**: Real-time visual metrics for total searches, popular locations (Lagos, Abuja, etc.), most searched specialties, user growth, and facility distribution.
* **Facility Management (FR5.1)**: Full CRUD table to view all hospitals, edit records, toggle active/inactive status, and create new hospitals with latitude/longitude.
* **Facility Claim Approvals Queue**: List of pending representative claims with submitted verification documents, with 1-click "Approve" or "Reject" actions.
* **User Management (FR5.2)**: User directory with role changes and account deactivation controls.
* **Content Moderation (FR5.3)**: Flagged review queue with approve, dismiss, and delete moderation actions.
* **Data Export Utility (FR5.5)**: 1-click export of hospital database, user accounts, and search logs to downloadable CSV and JSON files.

---

## 4. UI Components & Layout Architecture

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts      # NextAuth handler with credentials & JWT
│   ├── layout.tsx                # Root layout with NextAuth SessionProvider, AppContext, Navbar, Footer, DemoBar
│   ├── page.tsx                  # Page 1: Landing / Home
│   ├── hospitals/
│   │   ├── page.tsx              # Page 2: Search & Map Discovery
│   │   └── [id]/page.tsx         # Page 3: Hospital Detail Profile
│   ├── emergency/page.tsx        # Page 4: Emergency Finder (10km)
│   ├── compare/page.tsx          # Page 5: Hospital Comparison Matrix
│   ├── login/page.tsx            # Page 6a: Login (NextAuth)
│   ├── register/page.tsx         # Page 6b: Registration
│   ├── forgot-password/page.tsx  # Page 6c: Password Reset
│   └── dashboard/
│       ├── patient/page.tsx      # Page 7: Patient Dashboard
│       ├── representative/page.tsx # Page 8: Facility Representative Portal
│       └── admin/page.tsx        # Page 9: System Administrator Portal
├── components/
│   ├── Navbar.tsx                # Global navigation bar with role indicator, auth buttons, and emergency CTA
│   ├── Footer.tsx                # Global footer with quick links and emergency numbers
│   ├── DemoRoleBar.tsx           # Floating role switcher & simulated Nigerian city selector
│   ├── Map.tsx                   # SSR-safe Leaflet map with dynamic import
│   ├── HospitalCard.tsx          # Standard hospital card with metrics & badges
│   ├── ReviewModal.tsx           # Multi-dimensional rating & review submission modal
│   ├── ClaimFacilityModal.tsx    # Document upload & facility claim modal
│   └── ExportDataModal.tsx       # CSV/JSON data exporter modal
├── context/
│   ├── AppContext.tsx            # Global state: hospitals, reviews, users, claims, active location
│   └── AuthSessionProvider.tsx   # NextAuth SessionProvider wrapper
├── data/
│   ├── initialHospitals.ts       # Realistic Nigerian hospital seed dataset (Lagos, Abuja, Ibadan, etc.)
│   ├── initialReviews.ts         # Sample multi-dimensional patient reviews with rep responses
│   └── nigerianLocations.ts      # Coordinate presets for simulated location switcher
└── types/
    └── index.ts                  # Comprehensive TypeScript interfaces matching ERD
```

---

## 5. Verification & Deployment Pipeline

1. **Local Build & Typecheck**:
   * Run `npx next build` to guarantee zero TypeScript or Next.js build errors.
2. **End-to-End User Flow Verification**:
   * Test NextAuth login & session switching with `useSession()`.
   * Test Proximity Search & Emergency 10km filter with simulated location toggles.
   * Test Review submission & rating updates.
   * Test Facility Rep emergency status updates & review responses.
   * Test Admin claim approvals, facility CRUD, review moderation, and data export.
3. **Git & GitHub Integration**:
   * Initialize git repository in workspace.
   * Create public repository `hospital-locator-nigeria` via `gh repo create` or git remote.
   * Push all commits to GitHub `main` branch.
4. **Vercel CLI Deployment**:
   * Deploy project via `vercel deploy --prod` using Vercel CLI.
   * Verify production live URL and provide it to the user.
