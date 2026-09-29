# Hospital Locator System (Nigeria) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, end-to-end interactive Next.js frontend demo application for the Hospital Locator System (Nigeria) based on Chapter 3 System Analysis & Design, covering all 9 core pages, NextAuth authentication, Leaflet mapping, emergency workflows, multi-actor portals, and deploy to Vercel and GitHub.

**Architecture:** Next.js 15+ (App Router) with TypeScript, Tailwind CSS, NextAuth.js, and Leaflet. Client state is managed via an `AppContext` backed by `localStorage` pre-seeded with realistic Nigerian hospitals, reviews, and users. A floating Demo Role Bar enables 1-click switching between Guest, Patient, Facility Representative, and Administrator personas alongside a Nigerian city coordinate simulator for proximity testing. Backend service architecture patterns follow NestJS modular conventions.

**Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, NextAuth.js, Leaflet, React-Leaflet, Lucide React, Git, GitHub CLI (`gh`), Vercel CLI (`vercel`).

**Spec:** [`docs/superpowers/specs/2026-09-29-hospital-locator-frontend-design.md`](file:///home/sanniinuoluwadunsimi/Documents/Sanni%20Workspace/Hospital%20Locator/docs/superpowers/specs/2026-09-29-hospital-locator-frontend-design.md)

## Global Constraints

- Framework: Next.js 15+ (App Router) with strict TypeScript
- Styling: Tailwind CSS with medical theme (Emergency Red, Clinical Slate, Health Emerald)
- Icons: `lucide-react`
- Authentication: NextAuth.js credentials provider with JWT session strategy and role claims (`patient`, `representative`, `admin`)
- Maps: Leaflet with dynamic client-side loading (`ssr: false`) to avoid hydration errors
- Persistent State: `localStorage` with initial seed data and full CRUD capability
- Deployments: Public GitHub repository `hospital-locator-nigeria` and live Vercel production deployment

---

### Task 1: Next.js Project Scaffolding & Dependencies Setup

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `src/app/globals.css`
- Create: `.gitignore`
- Create: `.env.local`

**Interfaces:**
- Produces: Working Next.js 15 App Router project environment with Tailwind CSS, NextAuth, Lucide React, and Leaflet dependencies installed.

- [ ] **Step 1: Create package.json and project configuration**
  Create `package.json` with scripts (`dev`, `build`, `start`, `lint`) and dependencies (`next`, `react`, `react-dom`, `next-auth`, `leaflet`, `react-leaflet`, `@types/leaflet`, `lucide-react`, `tailwindcss`, `postcss`, `autoprefixer`, `typescript`, `@types/node`, `@types/react`, `@types/react-dom`).

- [ ] **Step 2: Create Next.js, TypeScript, Tailwind, and PostCSS configurations**
  Configure `next.config.ts` (with image domains, unoptimized image fallback if needed), `tsconfig.json` (with `@/*` path alias), `tailwind.config.ts` (custom medical color palette: `hospital-blue`, `emergency-red`, `health-emerald`), and `postcss.config.mjs`.

- [ ] **Step 3: Setup global CSS with Tailwind directives and Leaflet stylesheet**
  Create `src/app/globals.css` with `@tailwind base;`, `@tailwind components;`, `@tailwind utilities;`, and Leaflet CSS styles.

- [ ] **Step 4: Create .env.local and .gitignore**
  Configure `NEXTAUTH_SECRET=hospital_locator_secret_key_2026_demo` and `NEXTAUTH_URL=http://localhost:3000` in `.env.local`. Create standard `.gitignore` (ignoring `node_modules`, `.next`, `.env*.local`).

- [ ] **Step 5: Install dependencies and verify build compilation**
  Run `npm install` and verify dependencies resolve cleanly.

- [ ] **Step 6: Commit**
  ```bash
  git add package.json tsconfig.json next.config.ts tailwind.config.ts postcss.config.mjs src/app/globals.css .gitignore .env.local package-lock.json
  git commit -m "chore: scaffold Next.js project with Tailwind CSS, NextAuth, and Leaflet"
  ```

---

### Task 2: Types, Seed Dataset & Nigerian Geospatial Data

**Files:**
- Create: `src/types/index.ts`
- Create: `src/data/nigerianLocations.ts`
- Create: `src/data/initialHospitals.ts`
- Create: `src/data/initialReviews.ts`
- Test: `scripts/validate-data.ts` or `src/data/initialHospitals.test.ts`

**Interfaces:**
- Produces: `Hospital`, `Review`, `User`, `FacilityRepresentative`, `ClaimRequest`, `SearchLog`, `NigerianCityLocation` types.
- Produces: Initial seed data arrays `INITIAL_HOSPITALS`, `INITIAL_REVIEWS`, `NIGERIAN_LOCATIONS`.

- [ ] **Step 1: Define TypeScript interfaces in `src/types/index.ts`**
  Model all entities specified in Chapter 3 ERD:
  - `Hospital`: `_id`, `name`, `address`, `city`, `state`, `location` `{ lat: number; lng: number }`, `phoneNumbers`, `emergencyPhone`, `email`, `website`, `facilityType`, `services`, `specialties`, `operatingHours`, `emergency24Hours`, `emergencyStatus`, `traumaLevel`, `insuranceAccepted`, `images`, `averageRating`, `totalReviews`, `verified`, `claimedBy`, `accessibility` `{ wheelchair: boolean; parking: boolean; ambulanceBay: boolean }`.
  - `Review`: `_id`, `hospitalId`, `userId`, `userName`, `overallRating`, `staffRating`, `cleanlinessRating`, `waitTimeRating`, `careQualityRating`, `reviewText`, `helpful`, `notHelpful`, `response?`, `responseDate?`, `createdAt`.
  - `User`: `_id`, `email`, `name`, `phoneNumber`, `role`, `favorites`, `searchHistory`.
  - `ClaimRequest`: `_id`, `hospitalId`, `hospitalName`, `userId`, `userName`, `userEmail`, `position`, `documentName`, `status`, `createdAt`.

- [ ] **Step 2: Create preset Nigerian locations in `src/data/nigerianLocations.ts`**
  Define presets for:
  - Lagos - Ikeja: `lat: 6.6018, lng: 3.3515`
  - Lagos - Victoria Island: `lat: 6.4281, lng: 3.4219`
  - Abuja - Central Area: `lat: 9.0579, lng: 7.4951`
  - Ibadan - UI / Ring Road: `lat: 7.3775, lng: 3.9470`
  - Port Harcourt - Old GRA: `lat: 4.8156, lng: 7.0498`
  - Kano - City Center: `lat: 12.0022, lng: 8.5920`

- [ ] **Step 3: Create realistic Nigerian hospital seed dataset in `src/data/initialHospitals.ts`**
  Populate 15+ comprehensive facilities across Nigeria:
  - Lagos University Teaching Hospital (LUTH), Idi-Araba (Teaching Hospital, Level I Trauma, 24/7 ER)
  - Lagos State University Teaching Hospital (LASUTH), Ikeja (Teaching Hospital, Level I Trauma, 24/7 ER)
  - National Hospital, Abuja (Federal Medical Centre / Apex Hospital, Level I Trauma, 24/7 ER)
  - University College Hospital (UCH), Ibadan (Premier Teaching Hospital, Level I Trauma, 24/7 ER)
  - Reddington Hospital, Victoria Island (Private Specialist, Level II Trauma, 24/7 ER)
  - Lagoon Hospitals, Ikoyi (Specialist Clinic & Surgical Center, Level II Trauma, 24/7 ER)
  - Evercare Hospital, Lekki (Tertiary Care, Level I Trauma, 24/7 ER)
  - First Cardiology Consultants, Ikoyi (Specialist Cardiac Care, 24/7 ER)
  - Federal Medical Centre (FMC), Ebute Metta (Federal General, 24/7 ER)
  - University of Port Harcourt Teaching Hospital (UPTH), Port Harcourt (Teaching Hospital, Level I Trauma, 24/7 ER)
  - Garki Hospital, Abuja (General Hospital, Level II Trauma, 24/7 ER)
  - Vedic Lifecare Hospital, Lekki (Specialist Clinic, 24/7 ER)
  - St. Nicholas Hospital, Lagos Island (Specialist Nephrology & General, Level II Trauma, 24/7 ER)
  - Aminu Kano Teaching Hospital (AKTH), Kano (Teaching Hospital, Level I Trauma, 24/7 ER)
  - Mother and Child Hospital, Ikeja (State General / Maternity Center)

- [ ] **Step 4: Create seed reviews in `src/data/initialReviews.ts`**
  Add realistic patient reviews with multi-dimensional ratings and hospital representative responses.

- [ ] **Step 5: Run data validation check**
  Run a quick node script to verify data attributes and coordinates validity.

- [ ] **Step 6: Commit**
  ```bash
  git add src/types/ src/data/
  git commit -m "feat: add domain types, Nigerian location coordinates, and realistic hospital seed data"
  ```

---

### Task 3: Global Context (`AppContext`), LocalStorage Persistence & Haversine Distance Engine

**Files:**
- Create: `src/utils/geo.ts`
- Create: `src/context/AppContext.tsx`
- Test: `src/utils/geo.test.ts`

**Interfaces:**
- Consumes: `Hospital`, `Review`, `ClaimRequest`, `INITIAL_HOSPITALS`, `INITIAL_REVIEWS`, `NIGERIAN_LOCATIONS`.
- Produces: `useAppContext()` hook with state: `hospitals`, `reviews`, `claims`, `activeLocation`, `favorites`, `searchHistory`, and mutation methods (`addReview`, `voteReview`, `updateHospitalEmergencyStatus`, `updateHospitalDetails`, `submitClaim`, `approveClaim`, `rejectClaim`, `toggleFavorite`, `addFavoriteNote`, `logSearch`, `clearSearchHistory`, `setSimulatedLocation`, `resetDemoData`).
- Produces: `calculateDistance(lat1, lng1, lat2, lng2): number` (returns distance in km) and `estimateTravelTime(distanceKm): number` (minutes).

- [ ] **Step 1: Implement Haversine distance and travel time calculation in `src/utils/geo.ts`**
  Implement exact spherical trigonometry distance in kilometers, formatted to 1 decimal place, plus estimated driving time based on average urban speed (25 km/h).

- [ ] **Step 2: Implement `src/context/AppContext.tsx`**
  Create React Context with `localStorage` hydration and state synchronizers. Support live mutations with persistent local storage. Provide demo reset method.

- [ ] **Step 3: Test distance calculation and state mutation methods**
  Verify distance calculation from Ikeja to LUTH is approximately ~10-12 km.

- [ ] **Step 4: Commit**
  ```bash
  git add src/utils/geo.ts src/context/AppContext.tsx
  git commit -m "feat: add geolocation distance engine and persistent AppContext"
  ```

---

### Task 4: NextAuth.js Configuration & Role-Based Session Provider

**Files:**
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/lib/auth.ts`
- Create: `src/context/AuthSessionProvider.tsx`
- Create: `src/types/next-auth.d.ts`

**Interfaces:**
- Consumes: NextAuth credentials, User roles (`patient`, `representative`, `admin`).
- Produces: Working NextAuth `/api/auth/*` endpoints, typed session with `user.role`, `user.hospitalId`, and `AuthSessionProvider`.

- [ ] **Step 1: Extend NextAuth types in `src/types/next-auth.d.ts`**
  Augment `Session` and `User` with `role: 'patient' | 'representative' | 'admin'`, `id: string`, `phoneNumber?: string`, and `hospitalId?: string`.

- [ ] **Step 2: Configure NextAuth options in `src/lib/auth.ts`**
  Implement CredentialsProvider with demo accounts:
  - Patient: `patient@demo.com` / `password123`
  - Representative: `rep@demo.com` / `password123` (linked to LUTH `hosp-1`)
  - Admin: `admin@demo.com` / `password123`
  Configure JWT callbacks to transfer `id`, `role`, and `hospitalId` into token and session.

- [ ] **Step 3: Create NextAuth route handler in `src/app/api/auth/[...nextauth]/route.ts`**
  Export GET and POST handlers using NextAuth with the auth options.

- [ ] **Step 4: Create `src/context/AuthSessionProvider.tsx`**
  Implement client SessionProvider wrapper.

- [ ] **Step 5: Verify auth routes compile without type errors**
  Test with TypeScript compiler.

- [ ] **Step 6: Commit**
  ```bash
  git add src/lib/auth.ts src/app/api/auth/ src/context/AuthSessionProvider.tsx src/types/next-auth.d.ts
  git commit -m "feat: setup NextAuth credentials provider and typed session roles"
  ```

---

### Task 5: Global Layout, Navbar, Footer, and Floating Demo Role Bar

**Files:**
- Create: `src/components/Navbar.tsx`
- Create: `src/components/Footer.tsx`
- Create: `src/components/DemoRoleBar.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `useSession()`, `useAppContext()`, NextAuth `signIn`, `signOut`.
- Produces: Unified application shell with navigation, role switcher, emergency hotlines, and location indicator.

- [ ] **Step 1: Build `src/components/Navbar.tsx`**
  Include Logo with medical cross icon, Links (Hospitals, Emergency Finder, Compare, About), prominent Emergency 24/7 CTA pill button, active Role badge, user profile menu with Sign Out, or Sign In / Register buttons.

- [ ] **Step 2: Build `src/components/Footer.tsx`**
  Add emergency dispatch numbers (112, 767, FRSC 122), directory links, MOH accreditation disclaimer, and CSC Final Year Project attribution.

- [ ] **Step 3: Build `src/components/DemoRoleBar.tsx`**
  Floating bottom dock allowing:
  - 1-click persona switch: Guest | Patient (Amina) | Facility Rep (Dr. Okafor) | Admin (Admin Dunsimi)
  - Simulated Nigerian city dropdown (Lagos Ikeja, Lagos VI, Abuja, Ibadan, Port Harcourt, Kano)
  - Quick Reset Demo Data button
  - Current simulated coordinates display

- [ ] **Step 4: Assemble `src/app/layout.tsx`**
  Wrap `AuthSessionProvider`, `AppContextProvider`, `Navbar`, children, `Footer`, and `DemoRoleBar`.

- [ ] **Step 5: Verify layout renders and persona switching works**
  Test in browser/dev server.

- [ ] **Step 6: Commit**
  ```bash
  git add src/components/Navbar.tsx src/components/Footer.tsx src/components/DemoRoleBar.tsx src/app/layout.tsx
  git commit -m "feat: implement global layout, responsive navbar, footer, and floating demo switcher"
  ```

---

### Task 6: SSR-Safe Leaflet Map Component & Hospital Card

**Files:**
- Create: `src/components/Map.tsx`
- Create: `src/components/HospitalCard.tsx`

**Interfaces:**
- Consumes: `Hospital`, `NigerianCityLocation`, `calculateDistance()`, `estimateTravelTime()`.
- Produces: `<Map />` client component with dynamic SSR import, `<HospitalCard />` reusable list/grid card.

- [ ] **Step 1: Build `src/components/Map.tsx`**
  Dynamic Leaflet component using OpenStreetMap tiles:
  - Center on active location with blue user circle
  - Color-coded custom SVG markers: Red for 24/7 Emergency hospitals, Green for Specialist Clinics, Blue for General Hospitals
  - Marker popups with hospital thumbnail, name, emergency status badge, distance, and "View Details" button
  - Optional 10km radius circle visualization for emergency mode

- [ ] **Step 2: Build `src/components/HospitalCard.tsx`**
  Card featuring:
  - Facility image with verified badge
  - Emergency status pill (*Accepting Patients* in green, *Limited* in amber, *Critical* in red)
  - Distance in km & driving ETA in minutes
  - Specialties pills, address, phone number
  - Actions: Call, Favorite (heart toggle with notes tooltip), View Details link

- [ ] **Step 3: Verify Map loads without hydration errors**
  Confirm Leaflet icons and tile layers render cleanly.

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/Map.tsx src/components/HospitalCard.tsx
  git commit -m "feat: build SSR-safe Leaflet map component and interactive hospital card"
  ```

---

### Task 7: Page 1 - Landing / Home Page (`/`)

**Files:**
- Create: `src/app/page.tsx`

**Interfaces:**
- Consumes: `useAppContext()`, `<HospitalCard />`.
- Produces: Landing page with hero search, emergency banner, specialty chips, accredited hospital cards, stats, and how-it-works.

- [ ] **Step 1: Implement Hero Search & Quick Filters in `src/app/page.tsx`**
  Interactive search input with live keyword matching and quick redirect to `/hospitals?q=...`.
  Specialty chips for *Emergency 24/7*, *Trauma Center*, *Cardiology*, *Maternity*, *Pediatrics*, *Dialysis*, *NHIS / HMO*.

- [ ] **Step 2: Implement High-Urgency Emergency Banner (FR3.1)**
  Prominent red pulsing card with 1-click CTA launching `/emergency` for nearest emergency hospitals.

- [ ] **Step 3: Implement Featured Accredited Hospitals Showcase**
  Display top-rated verified facilities calculated relative to user's simulated location.

- [ ] **Step 4: Implement Statistics Counter & How It Works Walkthrough**
  Visual counter for 15+ Verified Facilities, 24/7 ER coverage, 99.8% accurate routing, and 3-step guide.

- [ ] **Step 5: Verify home page interactions and responsive design**
  Test search redirection, emergency button click, and mobile layout.

- [ ] **Step 6: Commit**
  ```bash
  git add src/app/page.tsx
  git commit -m "feat: implement comprehensive landing page with hero search and emergency CTA"
  ```

---

### Task 8: Page 2 - Hospital Search & Map Discovery (`/hospitals`)

**Files:**
- Create: `src/app/hospitals/page.tsx`

**Interfaces:**
- Consumes: `useAppContext()`, `<Map />`, `<HospitalCard />`.
- Produces: Search & Discovery page with split list/map view, comprehensive filter sidebar, and sorting engine.

- [ ] **Step 1: Implement Search & Filter state in `src/app/hospitals/page.tsx`**
  Filters:
  - Search query (name, specialty, address)
  - Facility type (Teaching Hospital, Federal Medical Centre, State General, Specialist, Primary Healthcare)
  - Services (Emergency, ICU, Trauma, Dialysis, Surgical, Maternity)
  - HMO / Insurance (NHIS, Hygeia, Reliance, AXA Mansard, Avon, Leadway)
  - 24/7 Emergency only toggle
  - Rating filter (4+ stars, 3+ stars)
  - Distance radius slider (1 km to 50 km)

- [ ] **Step 2: Implement Sorting Engine (FR2.5)**
  Sort by: Nearest Distance, Highest Rating, Total Reviews, Name (A-Z).

- [ ] **Step 3: Implement Responsive Split Layout with Map/List Toggle**
  Side-by-side on desktop (filters + list on left, sticky map on right); tabbed toggle on mobile.

- [ ] **Step 4: Verify search queries and multi-criteria filters update results dynamically**
  Test filtering by "Teaching Hospital" + "NHIS" + distance slider.

- [ ] **Step 5: Commit**
  ```bash
  git add src/app/hospitals/page.tsx
  git commit -m "feat: implement search and discovery page with interactive map and multi-criteria filters"
  ```

---

### Task 9: Page 3 - Hospital Detail Profile (`/hospitals/[id]`)

**Files:**
- Create: `src/app/hospitals/[id]/page.tsx`
- Create: `src/components/ReviewModal.tsx`

**Interfaces:**
- Consumes: `useAppContext()`, `useSession()`, `ReviewModal`.
- Produces: Full facility profile page with multi-dimensional ratings, reviews feed, rep replies, and review modal.

- [ ] **Step 1: Build facility header and emergency action bar**
  Show facility image gallery, verified checkmark, trauma level, live emergency status pill, 1-click phone dialer, ambulance hotline, and Google Maps turn-by-turn routing button.

- [ ] **Step 2: Build detailed information tabs**
  Overview & operating hours (outpatient vs 24/7 emergency), medical specialties, accepted HMOs, accessibility infrastructure (ramps, parking, ambulance bays), and embedded Leaflet pin.

- [ ] **Step 3: Build multi-dimensional ratings breakdown (FR4.1)**
  Display aggregated ratings for: Overall, Staff Professionalism, Facility Cleanliness, Wait Times, Care Quality.

- [ ] **Step 4: Build reviews feed with helpfulness voting & rep responses**
  Render patient reviews, +1/-1 helpfulness voting buttons, and official facility representative replies.

- [ ] **Step 5: Implement `src/components/ReviewModal.tsx`**
  Modal with 5-star sub-category sliders, visit date input, review text field, and submission to `addReview()`.

- [ ] **Step 6: Verify review submission and dynamic rating recalculation**
  Submit a 5-star review and check that the hospital's average rating updates live.

- [ ] **Step 7: Commit**
  ```bash
  git add src/app/hospitals/[id]/page.tsx src/components/ReviewModal.tsx
  git commit -m "feat: implement hospital detail profile with multi-dimensional ratings and review modal"
  ```

---

### Task 10: Page 4 - Emergency 10km Finder (`/emergency`)

**Files:**
- Create: `src/app/emergency/page.tsx`

**Interfaces:**
- Consumes: `useAppContext()`, `<Map />`.
- Produces: High-urgency emergency view filtering hospitals with 24/7 ER within 10km, sorted by distance.

- [ ] **Step 1: Implement Emergency 10km Proximity Engine (FR3.1)**
  Filter active facilities having `emergency24Hours: true` and distance $\le 10$ km from current simulated coordinates, sorted strictly by nearest distance.

- [ ] **Step 2: Build Emergency Action Cards (FR3.2, FR3.3, FR3.4)**
  Display:
  - Trauma Level indicator (Level I, Level II, Level III)
  - Live Capacity status badge (*Accepting Patients*, *Limited*, *Critical*)
  - One-click phone button to call hospital ER immediately
  - 1-click Navigation button opening route directions with driving ETA
  - National emergency hotline quick-call cards (112, 767, FRSC 122)

- [ ] **Step 3: Integrate 10km Radius Leaflet Map**
  Embed Leaflet map highlighting user location with a red pulsing 10km radius circle overlay and markers.

- [ ] **Step 4: Verify emergency finder works across different simulated cities**
  Switch from Ikeja to Victoria Island and Abuja; verify nearest facilities update correctly.

- [ ] **Step 5: Commit**
  ```bash
  git add src/app/emergency/page.tsx
  git commit -m "feat: implement emergency 10km finder with trauma levels and direct hotlines"
  ```

---

### Task 11: Page 5 - Hospital Comparison Matrix (`/compare`)

**Files:**
- Create: `src/app/compare/page.tsx`

**Interfaces:**
- Consumes: `useAppContext()`.
- Produces: Side-by-side comparison matrix for up to 3 selected hospitals.

- [ ] **Step 1: Implement hospital selector dropdowns**
  Allow selecting 2 or 3 hospitals to compare side-by-side, with default pre-selection (e.g., LUTH vs LASUTH vs Reddington).

- [ ] **Step 2: Build multi-attribute comparison matrix**
  Rows: Proximity & Travel ETA, Facility Type, Trauma Center Level, 24/7 Emergency Readiness & Live Status, Key Services & ICU, Accepted HMOs/Insurances, 5-Dimension Rating scores, and Direct Actions.

- [ ] **Step 3: Verify comparison matrix updates when changing selected facilities**
  Test adding and swapping facilities.

- [ ] **Step 4: Commit**
  ```bash
  git add src/app/compare/page.tsx
  git commit -m "feat: implement hospital comparison matrix with side-by-side evaluation"
  ```

---

### Task 12: Page 6 - Authentication Pages (`/login`, `/register`, `/forgot-password`)

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/app/register/page.tsx`
- Create: `src/app/forgot-password/page.tsx`

**Interfaces:**
- Consumes: NextAuth `signIn()`, Next.js `useRouter()`.
- Produces: Dedicated auth pages with 1-click quick-login demo helper buttons and password recovery simulation.

- [ ] **Step 1: Implement `src/app/login/page.tsx`**
  Email/password credentials form calling `signIn('credentials')`.
  Add 1-click Quick Login chips:
  - "Login as Patient (Amina Bello)"
  - "Login as Hospital Rep (Dr. Okafor - LUTH)"
  - "Login as System Admin (Admin Dunsimi)"

- [ ] **Step 2: Implement `src/app/register/page.tsx`**
  Registration form with full name, email, phone number, password, and role selector (*Patient* vs *Hospital Representative*). Automatically signs in upon submission.

- [ ] **Step 3: Implement `src/app/forgot-password/page.tsx`**
  Password reset form with simulated 15-minute verification code input and timer countdown (FR1.3).

- [ ] **Step 4: Verify login, registration, and logout flows**
  Verify session establishes properly and user is redirected to role-appropriate page.

- [ ] **Step 5: Commit**
  ```bash
  git add src/app/login/page.tsx src/app/register/page.tsx src/app/forgot-password/page.tsx
  git commit -m "feat: implement login with NextAuth quick-login buttons, registration, and password recovery"
  ```

---

### Task 13: Page 7 - Patient Dashboard (`/dashboard/patient`)

**Files:**
- Create: `src/app/dashboard/patient/page.tsx`

**Interfaces:**
- Consumes: `useSession()`, `useAppContext()`.
- Produces: Patient personal portal for profile management, saved favorites with personal notes, reviews history, and search logs.

- [ ] **Step 1: Build profile management tab (FR1.4)**
  View and update full name, phone number, primary language, preferred HMO, and notification preferences.

- [ ] **Step 2: Build Favorite Facilities tab (FR4.5)**
  List favorited hospitals with custom personal notes ("Pediatrician Dr. Ade works here") and 1-click directions.

- [ ] **Step 3: Build My Reviews tab (FR4.2)**
  Display user's submitted reviews with options to edit text/ratings or delete within 30 days.

- [ ] **Step 4: Build Search & Browsing History tab (FR4.6)**
  List recently searched terms and visited hospital profiles, with 1-click "Clear All History" button.

- [ ] **Step 5: Implement Account Deletion dialog (FR1.5)**
  Account deletion confirmation explaining review anonymization.

- [ ] **Step 6: Verify patient dashboard operations**
  Test editing a personal note on a favorite hospital and clearing search history.

- [ ] **Step 7: Commit**
  ```bash
  git add src/app/dashboard/patient/page.tsx
  git commit -m "feat: implement patient dashboard with favorites, notes, reviews, and search history"
  ```

---

### Task 14: Page 8 - Facility Representative Portal (`/dashboard/representative`)

**Files:**
- Create: `src/app/dashboard/representative/page.tsx`
- Create: `src/components/ClaimFacilityModal.tsx`

**Interfaces:**
- Consumes: `useSession()`, `useAppContext()`.
- Produces: Representative portal with live emergency status toggle, claim workflow, facility metadata editor, review replies, and analytics.

- [ ] **Step 1: Implement Facility Claim & Verification Workflow (FR6.1)**
  If hospital is unclaimed, show claim submission form with simulated CAC registration & MOH affiliation document upload. Display verification status pill (*Pending Approval* vs *Approved / Verified*).

- [ ] **Step 2: Implement Live Emergency Capacity Toggle (FR3.2)**
  Prominent selector to toggle status (*Accepting Patients* / *Limited Capacity* / *Critical Capacity*) with immediate site-wide update.

- [ ] **Step 3: Implement Facility Metadata Editor (FR6.2)**
  Form to update emergency phone, operating hours, services list, and accepted HMOs.

- [ ] **Step 4: Implement Review Management & Official Response (FR6.3)**
  View patient reviews and submit official, verified facility responses.

- [ ] **Step 5: Implement Facility Analytics Dashboard (FR6.4)**
  Visual KPI cards: Monthly Profile Views, Emergency Call Clicks, Search Impressions, and Average Rating breakdown.

- [ ] **Step 6: Verify representative actions propagate site-wide**
  Toggle emergency status to "Critical Capacity" and confirm that public hospital card and emergency finder show "Critical Capacity".

- [ ] **Step 7: Commit**
  ```bash
  git add src/app/dashboard/representative/page.tsx src/components/ClaimFacilityModal.tsx
  git commit -m "feat: implement facility representative portal with emergency capacity toggle and analytics"
  ```

---

### Task 15: Page 9 - System Administrator Portal (`/dashboard/admin`)

**Files:**
- Create: `src/app/dashboard/admin/page.tsx`
- Create: `src/components/ExportDataModal.tsx`

**Interfaces:**
- Consumes: `useSession()`, `useAppContext()`.
- Produces: Admin portal with system analytics, hospital CRUD, claim approvals, review moderation, user management, and data export.

- [ ] **Step 1: Build System Analytics Overview (FR5.4)**
  Visual analytics: Total searches performed, top searched cities (Lagos, Abuja, etc.), most queried specialties, facility distribution by type.

- [ ] **Step 2: Build Facility Management CRUD Table (FR5.1)**
  Table of all hospitals with search and filter. Modal to Add New Hospital (name, type, coordinates, phone, emergency availability). Actions to edit or toggle active status.

- [ ] **Step 3: Build Facility Claim Approvals Queue (FR6.1)**
  Queue of pending representative claims with submitted document proofs. 1-click buttons to "Approve & Verify" or "Reject".

- [ ] **Step 4: Build User Management Table (FR5.2)**
  Table of registered users, roles, and status with deactivation toggles.

- [ ] **Step 5: Build Content Moderation Queue (FR5.3)**
  Flagged reviews list with actions to dismiss flag or delete inappropriate review.

- [ ] **Step 6: Build `src/components/ExportDataModal.tsx` (FR5.5)**
  Utility to export Hospitals, Users, or Search Logs as downloadable CSV or JSON files.

- [ ] **Step 7: Verify admin approvals and data export**
  Approve a claim and export hospital dataset to CSV.

- [ ] **Step 8: Commit**
  ```bash
  git add src/app/dashboard/admin/page.tsx src/components/ExportDataModal.tsx
  git commit -m "feat: implement administrator portal with analytics, claim approvals, and data export"
  ```

---

### Task 16: Verification, GitHub Repository Creation & Vercel CLI Deployment

**Files:**
- Create: `README.md`
- Verify: Full project build

**Interfaces:**
- Consumes: All completed tasks.
- Produces: Clean production build, public GitHub repository `hospital-locator-nigeria`, live production Vercel deployment URL.

- [ ] **Step 1: Write comprehensive README.md**
  Document project overview, Chapter 3 architecture, user personas & demo credentials, key features, local setup, and deployment info.

- [ ] **Step 2: Run production build verification**
  Run `npx next build` to guarantee zero TypeScript or Next.js build errors.

- [ ] **Step 3: Create GitHub repository and push commits**
  Use `gh repo create hospital-locator-nigeria --public --source=. --remote=origin --push`.

- [ ] **Step 4: Deploy to Vercel via CLI**
  Run `vercel deploy --prod --yes` using Vercel CLI.

- [ ] **Step 5: Document verification results and live production URL**
  Create `walkthrough.md` with complete verification details and live URL.

- [ ] **Step 6: Commit**
  ```bash
  git add README.md
  git commit -m "docs: add comprehensive README with demo guides and deployment documentation"
  ```
