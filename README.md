# 🏥 Hospital Locator Nigeria

A modern, full-stack geospatial web application for finding, comparing, and reviewing accredited hospitals across Nigeria. Built as an academic project (CSC) demonstrating real-world system analysis & design, geospatial indexing, and responsive web design.

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Hospital Search** | Multi-criteria filtering by specialty, city, facility type, HMO, trauma level |
| 🗺️ **Interactive Map** | Leaflet-powered geospatial map with custom SVG markers and 10km emergency radius circles |
| 🚨 **Emergency Finder** | 1-tap discovery of 24/7 ER hospitals within 10km with trauma level badges and direct calling |
| ⚖️ **Comparison Matrix** | Side-by-side comparison of 2–3 hospitals across 20+ clinical and logistical attributes |
| ⭐ **Patient Reviews** | 5-dimension rating breakdown (staff, cleanliness, wait time, care quality, overall experience) |
| 🏢 **Representative Portal** | Facility reps can manage hospital profiles, toggle live emergency status, and reply to reviews |
| 🛡️ **Admin Dashboard** | Facility claim approval queue, comprehensive hospital catalog with CSV/JSON export |
| 📱 **Mobile-First Responsive** | End-to-end fluid responsive layout optimized for mobile screens and touch devices |
| 📍 **Smart Nigerian Geolocation** | Browser GPS support plus 8 Nigerian city presets with Delta State (Asaba) as the primary hub |

## 🗂️ Pages

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Hero geospatial search, emergency banner, specialty grid, featured hospitals |
| `/about` | About Platform | Mission, methodology, technology stack, data sources, and academic context |
| `/hospitals` | Search & Discovery | Split list/map view with responsive toggle, multi-parameter filters, URL query state |
| `/hospitals/[id]` | Hospital Profile | Photo gallery, verified accreditation badge, reviews, direct emergency dialing |
| `/emergency` | Emergency Finder | Nearest 24/7 trauma hospitals within 10km, national hotlines (112 / 767 / 122) |
| `/compare` | Comparison Matrix | Side-by-side clinical comparison table with swipe support for mobile |
| `/login` | Sign In | NextAuth credential authentication + one-click quick logins |
| `/register` | Register | Account registration for patients and facility representatives |
| `/forgot-password` | Password Reset | Password recovery with active expiration simulation |
| `/dashboard/patient` | Patient Dashboard | Saved facilities with personal notes, visit reviews, search history |
| `/dashboard/representative` | Facility Portal | Real-time ER capacity toggle, facility profile editor, review replies |
| `/dashboard/admin` | Admin Panel | Facility claim approval queue, hospital catalog management, CSV/JSON export |

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **Styling**: Tailwind CSS with custom medical theme (`hospital-blue`, `emergency-red`, `health-emerald`)
- **Authentication**: NextAuth.js with Credentials Provider and role-augmented JWT sessions
- **Geospatial Mapping**: Leaflet.js + react-leaflet with custom SVG medical markers
- **Icons**: Lucide React
- **Data Engine**: Haversine distance and urban travel-time estimation

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔑 Quick Login Credentials

| Role | Email | Password |
|---|---|---|
| Patient | `patient@hospital.ng` | `password123` |
| Facility Rep | `rep@hospital.ng` | `password123` |
| Admin | `admin@hospital.ng` | `password123` |

## 🇳🇬 Nigerian Healthcare Context

- **Default Location**: Asaba, Delta State (`6.1936°N, 6.7355°E`)
- **Apex Facility**: Federal Medical Centre (FMC), Asaba (Level I Trauma, 24/7 ER)
- **Delta State Facilities**: FMC Asaba, DELSUTH Oghara, Central Hospital Warri, Eku Baptist Hospital, St. Columba's Ogwashi-Uku
- **National Emergency Lines**: 112 (National Emergency), 767 (Federal Fire Service), 122 (FRSC Traffic Rescue)
- **Major HMOs Indexed**: NHIS/NHIA, Hygeia HMO, Reliance HMO, AXA Mansard, Avon HMO, Leadway Health

## 📄 License

CSC Final Year Project — Developed by Sanni Inuoluwadunsimi © 2026
