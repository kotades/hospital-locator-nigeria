# 🏥 Hospital Locator Nigeria

A full-stack web application for finding, comparing, and reviewing hospitals across Nigeria. Built as an academic project (CSC) demonstrating real-world system analysis & design principles.

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Hospital Search** | Multi-criteria filtering by specialty, city, facility type, HMO, trauma level |
| 🗺️ **Interactive Map** | Leaflet-powered map with custom SVG markers, 10km radius circles |
| 🚨 **Emergency Finder** | 1-tap list of 24/7 ER hospitals within 10km with trauma level badges |
| ⚖️ **Comparison Matrix** | Side-by-side comparison of 2–3 hospitals across 20+ data points |
| ⭐ **Patient Reviews** | 5-dimension ratings (staff, cleanliness, wait time, care quality, overall) |
| 🏢 **Rep Portal** | Facility representatives can manage profiles, toggle ER status, reply to reviews |
| 🛡️ **Admin Dashboard** | Claim approval queue, analytics, CSV/JSON export, content moderation |
| 📍 **Smart Location** | Browser GPS + 6 Nigerian city presets (Lagos Ikeja/VI, Abuja, Ibadan, PH, Kano) |

## 🗂️ Pages

| Route | Page |
|---|---|
| `/` | Landing — hero search, emergency banner, specialty grid, featured hospitals |
| `/hospitals` | Search & Discovery — split map/list, filters, sorting, URL state |
| `/hospitals/[id]` | Hospital Detail Profile — photos, services, reviews, rating breakdown |
| `/emergency` | Emergency 10km Finder — trauma levels, ER status, direct call buttons |
| `/compare` | Hospital Comparison Matrix — side-by-side 20+ attribute table |
| `/login` | Login — NextAuth credentials + 1-click demo role buttons |
| `/register` | Registration — patient or rep role, password strength meter |
| `/forgot-password` | Password Reset — 15-minute countdown simulation |
| `/dashboard/patient` | Patient Dashboard — favourites, reviews, search history, settings |
| `/dashboard/representative` | Rep Portal — ER status toggle, detail editor, review responses, analytics |
| `/dashboard/admin` | Admin Panel — hospital CRUD, claims queue, user management, data export |

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **Styling**: Tailwind CSS with custom medical palette (`hospital-blue`, `emergency-red`, `health-emerald`)
- **Auth**: NextAuth.js with Credentials Provider + role-based JWT sessions
- **Maps**: Leaflet + react-leaflet (SSR-safe dynamic import)
- **Icons**: Lucide React
- **Data**: 18 real Nigerian hospitals with accurate coordinates, 20 reviews

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Copy environment file (already configured for demo)
cp .env.local.example .env.local  # or use the existing .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Patient | `patient@demo.com` | `password123` |
| Facility Rep | `rep@demo.com` | `password123` |
| Admin | `admin@demo.com` | `password123` |

> 💡 Or use the **Demo Role Bar** at the bottom of every page for instant 1-click switching.

## 📋 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # login, register, forgot-password
│   ├── dashboard/          # patient, representative, admin portals
│   ├── emergency/          # 10km ER finder
│   ├── compare/            # hospital comparison matrix
│   ├── hospitals/          # search & discovery + [id] detail
│   └── api/auth/           # NextAuth API route
├── components/             # Reusable UI components
│   ├── Map.tsx             # SSR-safe Leaflet wrapper
│   ├── HospitalCard.tsx    # Hospital listing card
│   ├── ReviewModal.tsx     # ARIA-compliant review dialog
│   ├── Navbar.tsx          # Responsive navigation
│   ├── Footer.tsx          # Emergency contacts footer
│   └── DemoRoleBar.tsx     # Floating demo switcher
├── context/
│   └── AppContext.tsx      # Global state (hospitals, reviews, claims, favorites)
├── data/
│   ├── initialHospitals.ts # 18 Nigerian hospitals with real coordinates
│   ├── initialReviews.ts   # 20 reviews with representative responses
│   └── nigerianLocations.ts # 6 city presets
├── types/
│   └── index.ts            # All domain types (Hospital, Review, ClaimRequest, ...)
├── utils/
│   └── geo.ts              # Haversine distance, travel time estimation
└── lib/
    └── auth.ts             # NextAuth configuration
```

## 🇳🇬 Nigerian Context

- **National Emergency**: 112
- **Federal Fire Service**: 767
- **NEMA Disaster Relief**: 122
- **18 hospitals** spanning Lagos, Abuja, Ibadan, Port Harcourt, and Kano
- HMO coverage: NHIS, Hygeia, Reliance HMO, AXA Mansard, Avon HMO, Leadway Health

## 📄 License

Academic project — All Rights Reserved © 2026
