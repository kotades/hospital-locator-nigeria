import { Hospital } from '@/types';

export const INITIAL_HOSPITALS: Hospital[] = [
  {
    _id: 'hosp-fmc-asaba',
    name: 'Federal Medical Centre (FMC), Asaba',
    address: 'Nnebisi Road, GRA, Asaba',
    city: 'Asaba',
    state: 'Delta',
    location: { lat: 6.1978, lng: 6.7354 },
    phoneNumbers: ['+234 56 281 1111', '+234 803 456 7890'],
    emergencyPhone: '+234 803 456 7891',
    email: 'info@fmcasaba.gov.ng',
    website: 'https://fmcasaba.gov.ng',
    facilityType: 'Federal Medical Centre',
    services: ['Emergency Care', 'ICU', 'Trauma Care', 'Surgical Procedures', 'Maternity & Obstetrics', 'Radiology/CT/MRI', 'Dialysis', 'Pediatrics', 'Oncology'],
    specialties: ['General Surgery', 'Obstetrics & Gynecology', 'Internal Medicine', 'Pediatrics', 'Ophthalmology', 'ENT', 'Orthopedics'],
    operatingHours: 'Mon - Sun: 24 Hours',
    emergency24Hours: true,
    emergencyStatus: 'accepting',
    traumaLevel: 'Level I',
    insuranceAccepted: ['NHIS', 'Hygeia HMO', 'Reliance HMO', 'AXA Mansard', 'Leadway Health'],
    images: [
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.1,
    totalReviews: 87,
    verified: true,
    claimedBy: null,
    accessibility: { wheelchair: true, parking: true, ambulanceBay: true }
  },
  {
    _id: 'hosp-delsuth',
    name: 'Delta State University Teaching Hospital (DELSUTH)',
    address: 'Oghara, Ethiope West LGA',
    city: 'Oghara',
    state: 'Delta',
    location: { lat: 5.7400, lng: 5.8200 },
    phoneNumbers: ['+234 54 261 0001', '+234 803 234 5678'],
    emergencyPhone: '+234 803 234 5679',
    email: 'info@delsuth.edu.ng',
    website: 'https://delsuth.edu.ng',
    facilityType: 'Teaching Hospital',
    services: ['Emergency Care', 'ICU', 'Surgical Procedures', 'Maternity & Obstetrics', 'Pediatrics', 'Radiology/CT/MRI', 'Trauma Care', 'Burns Unit'],
    specialties: ['General Surgery', 'Internal Medicine', 'Obstetrics & Gynecology', 'Pediatrics', 'Psychiatry', 'Dermatology', 'Orthopedics'],
    operatingHours: 'Mon - Sun: 24 Hours',
    emergency24Hours: true,
    emergencyStatus: 'accepting',
    traumaLevel: 'Level II',
    insuranceAccepted: ['NHIS', 'Avon HMO', 'Reliance HMO', 'Leadway Health'],
    images: [
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 3.9,
    totalReviews: 64,
    verified: true,
    claimedBy: null,
    accessibility: { wheelchair: true, parking: true, ambulanceBay: true }
  },
  {
    _id: 'hosp-central-warri',
    name: 'Central Hospital, Warri',
    address: 'Hospital Road, Warri',
    city: 'Warri',
    state: 'Delta',
    location: { lat: 5.5248, lng: 5.7460 },
    phoneNumbers: ['+234 53 254 0500', '+234 802 111 2233'],
    emergencyPhone: '+234 802 111 2234',
    email: 'centralhospital@deltastate.gov.ng',
    website: 'https://deltastate.gov.ng/moh/central-hospital-warri',
    facilityType: 'State General Hospital',
    services: ['Emergency Care', 'Maternity & Obstetrics', 'Surgical Procedures', 'ICU', 'Pediatrics', 'Outpatient Clinics', 'Laboratory Services'],
    specialties: ['General Surgery', 'Internal Medicine', 'Obstetrics & Gynecology', 'Pediatrics', 'Ophthalmology'],
    operatingHours: 'Mon - Sun: 24 Hours',
    emergency24Hours: true,
    emergencyStatus: 'limited',
    traumaLevel: 'Level II',
    insuranceAccepted: ['NHIS', 'Avon HMO', 'Reliance HMO'],
    images: [
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 3.5,
    totalReviews: 45,
    verified: true,
    claimedBy: null,
    accessibility: { wheelchair: false, parking: true, ambulanceBay: true }
  },
  {
    _id: 'hosp-eku',
    name: 'Eku Hospital',
    address: 'Eku Town, Ethiope East LGA',
    city: 'Eku',
    state: 'Delta',
    location: { lat: 5.7013, lng: 5.9840 },
    phoneNumbers: ['+234 54 262 0001'],
    emergencyPhone: '+234 802 333 4444',
    email: 'ekuhospital@deltastate.gov.ng',
    website: '',
    facilityType: 'General Hospital',
    services: ['Outpatient Clinics', 'Maternity & Obstetrics', 'Surgical Procedures', 'Laboratory Services'],
    specialties: ['General Medicine', 'Obstetrics & Gynecology', 'Pediatrics'],
    operatingHours: 'Mon - Fri: 8am - 5pm | Sat: 8am - 2pm',
    emergency24Hours: false,
    emergencyStatus: 'accepting',
    traumaLevel: 'None',
    insuranceAccepted: ['NHIS'],
    images: [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 3.7,
    totalReviews: 28,
    verified: false,
    claimedBy: null,
    accessibility: { wheelchair: false, parking: true, ambulanceBay: false }
  },
  {
    _id: 'hosp-st-columbas',
    name: "St. Columba's Hospital, Ogwashi-Uku",
    address: 'Ogwashi-Uku, Aniocha South LGA',
    city: 'Ogwashi-Uku',
    state: 'Delta',
    location: { lat: 6.2050, lng: 6.6200 },
    phoneNumbers: ['+234 56 270 0010', '+234 803 567 8901'],
    emergencyPhone: '+234 803 567 8902',
    email: 'stcolumbas@anglican.ng',
    website: '',
    facilityType: 'General Hospital',
    services: ['Emergency Care', 'Maternity & Obstetrics', 'Surgical Procedures', 'Pediatrics', 'Laboratory Services', 'Pharmacy'],
    specialties: ['General Surgery', 'Obstetrics & Gynecology', 'Pediatrics', 'Internal Medicine'],
    operatingHours: 'Mon - Sun: 24 Hours',
    emergency24Hours: true,
    emergencyStatus: 'accepting',
    traumaLevel: 'Level III',
    insuranceAccepted: ['NHIS', 'Avon HMO'],
    images: [
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.2,
    totalReviews: 33,
    verified: true,
    claimedBy: null,
    accessibility: { wheelchair: false, parking: true, ambulanceBay: true }
  },
  {
    _id: 'hosp-luth',
    name: 'Lagos University Teaching Hospital (LUTH)',
    address: 'Ishaga Road, Idi-Araba, Surulere',
    city: 'Lagos',
    state: 'Lagos',
    location: {
      lat: 6.5186,
      lng: 3.3553
    },
    phoneNumbers: ['+234 1 234 5600', '+234 803 300 1122'],
    emergencyPhone: '+234 802 312 4567',
    email: 'info@luth.gov.ng',
    website: 'https://luth.gov.ng',
    facilityType: 'Teaching Hospital',
    services: [
      'Emergency Care',
      'ICU',
      'Trauma Care',
      'Surgical Procedures',
      'Dialysis',
      'Maternity & Obstetrics',
      'Radiology/CT/MRI',
      'Oncology',
      'Pediatrics'
    ],
    specialties: [
      'Cardiology',
      'Nephrology',
      'Obstetrics & Gynecology',
      'Oncology',
      'Orthopedics',
      'Pediatrics',
      'Neurosurgery'
    ],
    operatingHours: 'Mon - Sun: 24 Hours',
    emergency24Hours: true,
    emergencyStatus: 'accepting',
    traumaLevel: 'Level I',
    insuranceAccepted: [
      'NHIS',
      'Hygeia HMO',
      'Reliance HMO',
      'AXA Mansard',
      'Avon HMO',
      'Leadway Health'
    ],
    images: [
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.4,
    totalReviews: 128,
    verified: true,
    claimedBy: null,
    accessibility: {
      wheelchair: true,
      parking: true,
      ambulanceBay: true
    }
  },
  {
    _id: 'hosp-lasuth',
    name: 'Lagos State University Teaching Hospital (LASUTH)',
    address: '1-5 Oba Akinjobi Way, GRA, Ikeja',
    city: 'Ikeja',
    state: 'Lagos',
    location: {
      lat: 6.5947,
      lng: 3.3486
    },
    phoneNumbers: ['+234 1 280 5000', '+234 802 222 3456'],
    emergencyPhone: '+234 805 555 7890',
    email: 'contact@lasuth.org.ng',
    website: 'https://lasuth.org.ng',
    facilityType: 'Teaching Hospital',
    services: [
      'Emergency Care',
      'ICU',
      'Trauma Care',
      'Surgical Procedures',
      'Dialysis',
      'Maternity & Obstetrics',
      'Radiology/CT/MRI',
      'Burn Unit'
    ],
    specialties: [
      'Cardiothoracic Surgery',
      'Traumatology',
      'Neurology',
      'Internal Medicine',
      'Ophthalmology',
      'Pediatrics'
    ],
    operatingHours: 'Mon - Sun: 24 Hours',
    emergency24Hours: true,
    emergencyStatus: 'accepting',
    traumaLevel: 'Level I',
    insuranceAccepted: [
      'NHIS',
      'Hygeia HMO',
      'Reliance HMO',
      'AXA Mansard',
      'Total Health Trust',
      'Avon HMO'
    ],
    images: [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.6,
    totalReviews: 95,
    verified: true,
    claimedBy: 'user-rep-1',
    accessibility: {
      wheelchair: true,
      parking: true,
      ambulanceBay: true
    }
  },
  {
    _id: 'hosp-national-abuja',
    name: 'National Hospital, Abuja',
    address: 'Plot 132 Central Business District (Phase II), Garki',
    city: 'Abuja',
    state: 'Federal Capital Territory',
    location: {
      lat: 9.0436,
      lng: 7.4697
    },
    phoneNumbers: ['+234 9 461 5000', '+234 9 461 5100'],
    emergencyPhone: '+234 803 900 8800',
    email: 'enquiries@nationalhospital.gov.ng',
    website: 'https://nationalhospital.gov.ng',
    facilityType: 'Federal Medical Centre',
    services: [
      'Emergency Care',
      'ICU',
      'Trauma Care',
      'Surgical Procedures',
      'Dialysis',
      'Radiology/CT/MRI',
      'Oncology',
      'Neonatal ICU'
    ],
    specialties: [
      'Oncology & Radiotherapy',
      'Neurosurgery',
      'Cardiology',
      'Orthopedics',
      'Plastic Surgery',
      'Pediatrics'
    ],
    operatingHours: 'Mon - Sun: 24 Hours',
    emergency24Hours: true,
    emergencyStatus: 'accepting',
    traumaLevel: 'Level I',
    insuranceAccepted: [
      'NHIS',
      'Reliance HMO',
      'AXA Mansard',
      'Avon HMO',
      'Leadway Health',
      'Clearline HMO'
    ],
    images: [
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.5,
    totalReviews: 142,
    verified: true,
    claimedBy: null,
    accessibility: {
      wheelchair: true,
      parking: true,
      ambulanceBay: true
    }
  },
  {
    _id: 'hosp-uch-ibadan',
    name: 'University College Hospital (UCH), Ibadan',
    address: 'Queen Elizabeth II Road, Mokola / Agodi',
    city: 'Ibadan',
    state: 'Oyo',
    location: {
      lat: 7.4042,
      lng: 3.9034
    },
    phoneNumbers: ['+234 2 241 0088', '+234 2 241 1200'],
    emergencyPhone: '+234 803 333 4455',
    email: 'info@uch-ibadan.org.ng',
    website: 'https://uch-ibadan.org.ng',
    facilityType: 'Teaching Hospital',
    services: [
      'Emergency Care',
      'ICU',
      'Trauma Care',
      'Surgical Procedures',
      'Dialysis',
      'Maternity & Obstetrics',
      'Radiology/CT/MRI',
      'Nuclear Medicine'
    ],
    specialties: [
      'Cardiology',
      'Nuclear Medicine',
      'Neurology',
      'General Surgery',
      'Pathology',
      'Dentistry',
      'Psychiatry'
    ],
    operatingHours: 'Mon - Sun: 24 Hours',
    emergency24Hours: true,
    emergencyStatus: 'accepting',
    traumaLevel: 'Level I',
    insuranceAccepted: [
      'NHIS',
      'Hygeia HMO',
      'AXA Mansard',
      'Leadway Health',
      'Avon HMO'
    ],
    images: [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.7,
    totalReviews: 210,
    verified: true,
    claimedBy: null,
    accessibility: {
      wheelchair: true,
      parking: true,
      ambulanceBay: true
    }
  },
  {
    _id: 'hosp-reddington-vi',
    name: 'Reddington Hospital, Victoria Island',
    address: '12 Idowu Martins Street, Victoria Island',
    city: 'Victoria Island',
    state: 'Lagos',
    location: {
      lat: 6.4309,
      lng: 3.4215
    },
    phoneNumbers: ['+234 1 271 5340', '+234 1 271 5341'],
    emergencyPhone: '+234 803 403 9999',
    email: 'info@reddingtonhospital.com',
    website: 'https://reddingtonhospital.com',
    facilityType: 'Private Specialist',
    services: [
      'Emergency Care',
      'ICU',
      'Trauma Care',
      'Surgical Procedures',
      'Cardiac Catheterization',
      'Radiology/CT/MRI',
      'Dialysis'
    ],
    specialties: [
      'Interventional Cardiology',
      'Critical Care',
      'Endoscopy',
      'Minimally Invasive Surgery',
      'Orthopedics'
    ],
    operatingHours: 'Mon - Sun: 24 Hours',
    emergency24Hours: true,
    emergencyStatus: 'accepting',
    traumaLevel: 'Level II',
    insuranceAccepted: [
      'Hygeia HMO',
      'AXA Mansard',
      'Reliance HMO',
      'Avon HMO',
      'Leadway Health',
      'Total Health Trust'
    ],
    images: [
      'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.8,
    totalReviews: 86,
    verified: true,
    claimedBy: null,
    accessibility: {
      wheelchair: true,
      parking: true,
      ambulanceBay: true
    }
  },
  {
    _id: 'hosp-lagoon-ikoyi',
    name: 'Lagoon Hospitals, Ikoyi',
    address: '17B Bourdillon Road, Ikoyi',
    city: 'Ikoyi',
    state: 'Lagos',
    location: {
      lat: 6.4528,
      lng: 3.4431
    },
    phoneNumbers: ['+234 1 461 4000', '+234 708 060 9000'],
    emergencyPhone: '+234 808 633 4455',
    email: 'lagoonikoyi@lagoonhospitals.com',
    website: 'https://lagoonhospitals.com',
    facilityType: 'Specialist Clinic',
    services: [
      'Emergency Care',
      'ICU',
      'Surgical Procedures',
      'Maternity & Obstetrics',
      'Radiology/CT/MRI',
      'Pediatrics'
    ],
    specialties: [
      'General Surgery',
      'Orthopedic Surgery',
      'Cardiology',
      'Obstetrics & Gynecology',
      'Pediatrics'
    ],
    operatingHours: 'Mon - Sun: 24 Hours',
    emergency24Hours: true,
    emergencyStatus: 'accepting',
    traumaLevel: 'Level II',
    insuranceAccepted: [
      'Hygeia HMO',
      'AXA Mansard',
      'Reliance HMO',
      'Avon HMO',
      'Leadway Health',
      'Total Health Trust'
    ],
    images: [
      'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.6,
    totalReviews: 74,
    verified: true,
    claimedBy: null,
    accessibility: {
      wheelchair: true,
      parking: true,
      ambulanceBay: true
    }
  },
  {
    _id: 'hosp-evercare-lekki',
    name: 'Evercare Hospital, Lekki',
    address: '1 Bisola Durosinmi Etti Drive, Lekki Phase 1',
    city: 'Lekki',
    state: 'Lagos',
    location: {
      lat: 6.4428,
      lng: 3.4735
    },
    phoneNumbers: ['+234 1 888 8800', '+234 1 888 8801'],
    emergencyPhone: '+234 815 099 9111',
    email: 'info@evercare.ng',
    website: 'https://evercare.ng',
    facilityType: 'Teaching Hospital',
    services: [
      'Emergency Care',
      'ICU',
      'Trauma Care',
      'Surgical Procedures',
      'Dialysis',
      'Maternity & Obstetrics',
      'Radiology/CT/MRI',
      'Cardiac Catheterization'
    ],
    specialties: [
      'Cardiology',
      'Oncology',
      'Orthopedics',
      'Neurosurgery',
      'Pediatrics',
      'Critical Care Medicine'
    ],
    operatingHours: 'Mon - Sun: 24 Hours',
    emergency24Hours: true,
    emergencyStatus: 'accepting',
    traumaLevel: 'Level I',
    insuranceAccepted: [
      'Hygeia HMO',
      'AXA Mansard',
      'Reliance HMO',
      'Avon HMO',
      'Leadway Health',
      'Total Health Trust'
    ],
    images: [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.9,
    totalReviews: 112,
    verified: true,
    claimedBy: null,
    accessibility: {
      wheelchair: true,
      parking: true,
      ambulanceBay: true
    }
  },
  {
    _id: 'hosp-first-cardiology',
    name: 'First Cardiology Consultants',
    address: '20A Thompson Avenue, Ikoyi',
    city: 'Ikoyi',
    state: 'Lagos',
    location: {
      lat: 6.4501,
      lng: 3.4384
    },
    phoneNumbers: ['+234 1 291 4050', '+234 809 999 2273'],
    emergencyPhone: '+234 803 711 2000',
    email: 'care@firstcardiology.org',
    website: 'https://firstcardiology.org',
    facilityType: 'Specialist Cardiac Care',
    services: [
      'Emergency Care',
      'ICU',
      'Cardiac Catheterization',
      'Surgical Procedures',
      'Radiology/CT/MRI'
    ],
    specialties: [
      'Cardiovascular Disease',
      'Interventional Cardiology',
      'Electrophysiology',
      'Pulmonology',
      'Critical Care'
    ],
    operatingHours: 'Mon - Sun: 24 Hours',
    emergency24Hours: true,
    emergencyStatus: 'limited',
    traumaLevel: 'Level II',
    insuranceAccepted: [
      'AXA Mansard',
      'Hygeia HMO',
      'Avon HMO',
      'Leadway Health',
      'Reliance HMO'
    ],
    images: [
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.7,
    totalReviews: 53,
    verified: true,
    claimedBy: null,
    accessibility: {
      wheelchair: true,
      parking: true,
      ambulanceBay: true
    }
  },
  {
    _id: 'hosp-fmc-ebute-metta',
    name: 'Federal Medical Centre (FMC), Ebute Metta',
    address: 'Railway Compound, Ebute Metta',
    city: 'Ebute Metta',
    state: 'Lagos',
    location: {
      lat: 6.4867,
      lng: 3.3789
    },
    phoneNumbers: ['+234 1 774 8122', '+234 803 720 1819'],
    emergencyPhone: '+234 818 200 4545',
    email: 'enquiries@fmcebutemetta.gov.ng',
    website: 'https://fmcebutemetta.gov.ng',
    facilityType: 'Federal Medical Centre',
    services: [
      'Emergency Care',
      'ICU',
      'Trauma Care',
      'Surgical Procedures',
      'Dialysis',
      'Maternity & Obstetrics',
      'Radiology/CT/MRI'
    ],
    specialties: [
      'General Surgery',
      'Internal Medicine',
      'Family Medicine',
      'Obstetrics & Gynecology',
      'Ophthalmology'
    ],
    operatingHours: 'Mon - Sun: 24 Hours',
    emergency24Hours: true,
    emergencyStatus: 'accepting',
    traumaLevel: 'Level II',
    insuranceAccepted: [
      'NHIS',
      'Hygeia HMO',
      'Reliance HMO',
      'Clearline HMO',
      'Total Health Trust'
    ],
    images: [
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.3,
    totalReviews: 68,
    verified: true,
    claimedBy: null,
    accessibility: {
      wheelchair: true,
      parking: true,
      ambulanceBay: true
    }
  },
  {
    _id: 'hosp-upth-ph',
    name: 'University of Port Harcourt Teaching Hospital (UPTH)',
    address: 'East-West Road, Alakahia',
    city: 'Port Harcourt',
    state: 'Rivers',
    location: {
      lat: 4.9012,
      lng: 6.9248
    },
    phoneNumbers: ['+234 84 890 000', '+234 803 310 9876'],
    emergencyPhone: '+234 805 777 6611',
    email: 'info@upthng.org',
    website: 'https://upthng.org',
    facilityType: 'Teaching Hospital',
    services: [
      'Emergency Care',
      'ICU',
      'Trauma Care',
      'Surgical Procedures',
      'Dialysis',
      'Maternity & Obstetrics',
      'Radiology/CT/MRI'
    ],
    specialties: [
      'Trauma Surgery',
      'Pediatrics',
      'Obstetrics & Gynecology',
      'Cardiology',
      'Hematology',
      'Community Medicine'
    ],
    operatingHours: 'Mon - Sun: 24 Hours',
    emergency24Hours: true,
    emergencyStatus: 'accepting',
    traumaLevel: 'Level I',
    insuranceAccepted: [
      'NHIS',
      'Hygeia HMO',
      'AXA Mansard',
      'Reliance HMO',
      'Avon HMO'
    ],
    images: [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.2,
    totalReviews: 79,
    verified: true,
    claimedBy: null,
    accessibility: {
      wheelchair: true,
      parking: true,
      ambulanceBay: true
    }
  },
  {
    _id: 'hosp-garki-abuja',
    name: 'Garki Hospital, Abuja',
    address: 'Tafawa Balewa Way, Area 8, Garki',
    city: 'Abuja',
    state: 'Federal Capital Territory',
    location: {
      lat: 9.0322,
      lng: 7.4877
    },
    phoneNumbers: ['+234 9 291 0055', '+234 809 300 0055'],
    emergencyPhone: '+234 803 600 7820',
    email: 'helpdesk@garkihospital.com',
    website: 'https://garkihospital.com',
    facilityType: 'General Hospital',
    services: [
      'Emergency Care',
      'ICU',
      'Trauma Care',
      'Surgical Procedures',
      'Dialysis',
      'Maternity & Obstetrics',
      'Radiology/CT/MRI',
      'In-Vitro Fertilization (IVF)'
    ],
    specialties: [
      'Obstetrics & Gynecology',
      'Nephrology',
      'Fertility',
      'General Surgery',
      'Pediatrics',
      'Family Medicine'
    ],
    operatingHours: 'Mon - Sun: 24 Hours',
    emergency24Hours: true,
    emergencyStatus: 'accepting',
    traumaLevel: 'Level II',
    insuranceAccepted: [
      'NHIS',
      'Hygeia HMO',
      'Reliance HMO',
      'AXA Mansard',
      'Avon HMO',
      'Leadway Health'
    ],
    images: [
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.5,
    totalReviews: 88,
    verified: true,
    claimedBy: null,
    accessibility: {
      wheelchair: true,
      parking: true,
      ambulanceBay: true
    }
  },
  {
    _id: 'hosp-vedic-lekki',
    name: 'Vedic Lifecare Hospital, Lekki',
    address: 'Plot 6, Block 111, Olabanji Olajide Crescent, Lekki Phase 1',
    city: 'Lekki',
    state: 'Lagos',
    location: {
      lat: 6.447,
      lng: 3.477
    },
    phoneNumbers: ['+234 1 454 4404', '+234 809 045 4404'],
    emergencyPhone: '+234 812 000 8334',
    email: 'info@vediclifecare.com',
    website: 'https://vediclifecare.com',
    facilityType: 'Specialist Clinic',
    services: [
      'Emergency Care',
      'ICU',
      'Surgical Procedures',
      'Radiology/CT/MRI',
      'Dialysis',
      'Executive Health Screening'
    ],
    specialties: [
      'Orthopedics & Joint Replacement',
      'Urology',
      'Internal Medicine',
      'Cardiology',
      'Bariatric Surgery'
    ],
    operatingHours: 'Mon - Sun: 24 Hours',
    emergency24Hours: true,
    emergencyStatus: 'accepting',
    traumaLevel: 'Level III',
    insuranceAccepted: [
      'Hygeia HMO',
      'Reliance HMO',
      'AXA Mansard',
      'Avon HMO',
      'Leadway Health'
    ],
    images: [
      'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.6,
    totalReviews: 47,
    verified: true,
    claimedBy: null,
    accessibility: {
      wheelchair: true,
      parking: true,
      ambulanceBay: true
    }
  },
  {
    _id: 'hosp-st-nicholas',
    name: 'St. Nicholas Hospital, Lagos Island',
    address: '57 Campbell Street, Lagos Island',
    city: 'Lagos Island',
    state: 'Lagos',
    location: {
      lat: 6.4533,
      lng: 3.3934
    },
    phoneNumbers: ['+234 1 877 7770', '+234 1 263 1733'],
    emergencyPhone: '+234 803 525 1290',
    email: 'info@saintnicholashospital.com',
    website: 'https://saintnicholashospital.com',
    facilityType: 'Private Specialist',
    services: [
      'Emergency Care',
      'ICU',
      'Trauma Care',
      'Surgical Procedures',
      'Dialysis',
      'Renal Transplant',
      'Radiology/CT/MRI'
    ],
    specialties: [
      'Nephrology & Renal Transplant',
      'Cardiology',
      'Urology',
      'General Surgery',
      'Critical Care'
    ],
    operatingHours: 'Mon - Sun: 24 Hours',
    emergency24Hours: true,
    emergencyStatus: 'accepting',
    traumaLevel: 'Level II',
    insuranceAccepted: [
      'Hygeia HMO',
      'AXA Mansard',
      'Reliance HMO',
      'Avon HMO',
      'Leadway Health',
      'Total Health Trust'
    ],
    images: [
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.7,
    totalReviews: 92,
    verified: true,
    claimedBy: null,
    accessibility: {
      wheelchair: true,
      parking: true,
      ambulanceBay: true
    }
  },
  {
    _id: 'hosp-akth-kano',
    name: 'Aminu Kano Teaching Hospital (AKTH)',
    address: 'Zaria Road, Tarauni',
    city: 'Kano',
    state: 'Kano',
    location: {
      lat: 11.9644,
      lng: 8.5369
    },
    phoneNumbers: ['+234 64 669 822', '+234 803 700 4567'],
    emergencyPhone: '+234 802 911 3400',
    email: 'enquiries@akth.org.ng',
    website: 'https://akth.org.ng',
    facilityType: 'Teaching Hospital',
    services: [
      'Emergency Care',
      'ICU',
      'Trauma Care',
      'Surgical Procedures',
      'Dialysis',
      'Maternity & Obstetrics',
      'Radiology/CT/MRI',
      'Renal Center'
    ],
    specialties: [
      'Renal Transplant',
      'Cardiology',
      'Pediatrics',
      'Obstetrics & Gynecology',
      'General Surgery',
      'Infectious Diseases'
    ],
    operatingHours: 'Mon - Sun: 24 Hours',
    emergency24Hours: true,
    emergencyStatus: 'critical',
    traumaLevel: 'Level I',
    insuranceAccepted: [
      'NHIS',
      'Hygeia HMO',
      'Reliance HMO',
      'AXA Mansard',
      'Clearline HMO'
    ],
    images: [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.3,
    totalReviews: 105,
    verified: true,
    claimedBy: null,
    accessibility: {
      wheelchair: true,
      parking: true,
      ambulanceBay: true
    }
  },
  {
    _id: 'hosp-mch-ikeja',
    name: 'Mother and Child Hospital, Ikeja',
    address: 'LASUTH Annex, College Road, Ikeja',
    city: 'Ikeja',
    state: 'Lagos',
    location: {
      lat: 6.6025,
      lng: 3.342
    },
    phoneNumbers: ['+234 1 291 8080', '+234 802 345 6789'],
    emergencyPhone: '+234 803 112 0000',
    email: 'mch.ikeja@lagosstate.gov.ng',
    website: 'https://health.lagosstate.gov.ng',
    facilityType: 'Maternity Center',
    services: [
      'Emergency Care',
      'Maternity & Obstetrics',
      'Neonatal ICU',
      'Pediatrics',
      'Surgical Procedures',
      'Immunization'
    ],
    specialties: [
      'Obstetrics & Gynecology',
      'Neonatology',
      'Pediatric Surgery',
      'Reproductive Health'
    ],
    operatingHours: 'Mon - Sun: 24 Hours',
    emergency24Hours: true,
    emergencyStatus: 'limited',
    traumaLevel: 'Level III',
    insuranceAccepted: [
      'NHIS',
      'LASHMA (Ilera Eko)',
      'Hygeia HMO',
      'Reliance HMO',
      'Avon HMO'
    ],
    images: [
      'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.4,
    totalReviews: 58,
    verified: true,
    claimedBy: null,
    accessibility: {
      wheelchair: true,
      parking: true,
      ambulanceBay: true
    }
  },
  {
    _id: 'hosp-cedarcrest-abuja',
    name: 'Cedarcrest Hospitals, Abuja',
    address: 'Plot 1245 Sam Mbakwe Avenue, Apo District',
    city: 'Abuja',
    state: 'Federal Capital Territory',
    location: {
      lat: 9.0062,
      lng: 7.4938
    },
    phoneNumbers: ['+234 9 314 1148', '+234 809 396 0000'],
    emergencyPhone: '+234 809 396 1111',
    email: 'info@cedarcresthospitals.com',
    website: 'https://cedarcresthospitals.com',
    facilityType: 'Private Specialist',
    services: [
      'Emergency Care',
      'ICU',
      'Trauma Care',
      'Surgical Procedures',
      'Radiology/CT/MRI',
      'Orthopedic Surgery'
    ],
    specialties: [
      'Orthopedics & Joint Replacement',
      'Traumatology',
      'Neurosurgery',
      'Spine Surgery',
      'Cardiology'
    ],
    operatingHours: 'Mon - Sun: 24 Hours',
    emergency24Hours: true,
    emergencyStatus: 'accepting',
    traumaLevel: 'Level II',
    insuranceAccepted: [
      'Hygeia HMO',
      'AXA Mansard',
      'Reliance HMO',
      'Avon HMO',
      'Leadway Health'
    ],
    images: [
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.7,
    totalReviews: 64,
    verified: true,
    claimedBy: null,
    accessibility: {
      wheelchair: true,
      parking: true,
      ambulanceBay: true
    }
  },
  {
    _id: 'hosp-rsuth-ph',
    name: 'Rivers State University Teaching Hospital (RSUTH / BMSH)',
    address: '5-8 Harley Street, Old GRA',
    city: 'Port Harcourt',
    state: 'Rivers',
    location: {
      lat: 4.7924,
      lng: 7.0125
    },
    phoneNumbers: ['+234 84 233 444', '+234 803 711 0022'],
    emergencyPhone: '+234 802 888 7766',
    email: 'contact@rsuth.ng',
    website: 'https://rsuth.ng',
    facilityType: 'Teaching Hospital',
    services: [
      'Emergency Care',
      'ICU',
      'Trauma Care',
      'Surgical Procedures',
      'Maternity & Obstetrics',
      'Radiology/CT/MRI',
      'Dialysis'
    ],
    specialties: [
      'General Surgery',
      'Internal Medicine',
      'Pediatrics',
      'Obstetrics & Gynecology',
      'Radiology'
    ],
    operatingHours: 'Mon - Sun: 24 Hours',
    emergency24Hours: true,
    emergencyStatus: 'accepting',
    traumaLevel: 'Level II',
    insuranceAccepted: [
      'NHIS',
      'Rivers Contributory Health',
      'Hygeia HMO',
      'Reliance HMO',
      'AXA Mansard'
    ],
    images: [
      'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.3,
    totalReviews: 51,
    verified: true,
    claimedBy: null,
    accessibility: {
      wheelchair: true,
      parking: true,
      ambulanceBay: true
    }
  },
  {
    _id: 'hosp-adeoyo-ibadan',
    name: 'Adeoyo Maternity Teaching Hospital, Ibadan',
    address: 'Yemetu Road, Oje / Total Garden',
    city: 'Ibadan',
    state: 'Oyo',
    location: {
      lat: 7.3985,
      lng: 3.912
    },
    phoneNumbers: ['+234 2 241 3300', '+234 803 540 2211'],
    emergencyPhone: '+234 802 334 5500',
    email: 'info@adeoyo.oyo.gov.ng',
    website: 'https://health.oyostate.gov.ng',
    facilityType: 'State General Hospital',
    services: [
      'Emergency Care',
      'Maternity & Obstetrics',
      'Neonatal Care',
      'Surgical Procedures',
      'Pediatrics'
    ],
    specialties: [
      'Obstetrics & Gynecology',
      'Neonatal Medicine',
      'Family Health',
      'Pediatrics'
    ],
    operatingHours: 'Mon - Sun: 24 Hours',
    emergency24Hours: true,
    emergencyStatus: 'accepting',
    traumaLevel: 'Level III',
    insuranceAccepted: [
      'NHIS',
      'OYSHIA (Oyo State Health Scheme)',
      'Hygeia HMO',
      'Reliance HMO'
    ],
    images: [
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.1,
    totalReviews: 39,
    verified: true,
    claimedBy: null,
    accessibility: {
      wheelchair: true,
      parking: true,
      ambulanceBay: true
    }
  }
];
