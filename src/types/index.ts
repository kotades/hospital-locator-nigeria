/**
 * Hospital Locator System (Nigeria) - Domain Type Definitions
 * Based on Chapter 3 System Analysis & Design ERD Specifications
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface NigerianCityLocation {
  id: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  description?: string;
}

export type FacilityType =
  | 'Teaching Hospital'
  | 'Federal Medical Centre'
  | 'State General Hospital'
  | 'Specialist Clinic'
  | 'Primary Healthcare Centre'
  | 'Private Specialist'
  | 'General Hospital'
  | 'Specialist Cardiac Care'
  | 'Maternity Center'
  | (string & {});

export type EmergencyStatus = 'accepting' | 'limited' | 'critical';

export type TraumaLevel = 'Level I' | 'Level II' | 'Level III' | 'None';

export interface AccessibilityFeatures {
  wheelchair: boolean;
  parking: boolean;
  ambulanceBay: boolean;
}

export interface Hospital {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  location: Coordinates;
  phoneNumbers: string[];
  emergencyPhone: string;
  email: string;
  website: string;
  facilityType: FacilityType;
  services: string[];
  specialties: string[];
  operatingHours: string;
  emergency24Hours: boolean;
  emergencyStatus: EmergencyStatus;
  traumaLevel: TraumaLevel;
  insuranceAccepted: string[];
  images: string[];
  averageRating: number;
  totalReviews: number;
  verified: boolean;
  claimedBy: string | null;
  accessibility: AccessibilityFeatures;
}

export interface Review {
  _id: string;
  hospitalId: string;
  userId: string;
  userName: string;
  overallRating: number;
  staffRating: number;
  cleanlinessRating: number;
  waitTimeRating: number;
  careQualityRating: number;
  reviewText: string;
  helpful: number;
  notHelpful: number;
  response?: string;
  responseDate?: string;
  createdAt: string;
  visitDate?: string;
}

export type UserRole = 'patient' | 'representative' | 'admin';

export interface UserFavorite {
  hospitalId: string;
  note?: string;
  addedAt?: string;
}

export interface SearchLog {
  _id?: string;
  query: string;
  city?: string;
  specialty?: string;
  timestamp: string;
  resultsCount?: number;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  phoneNumber: string;
  role: UserRole;
  hospitalId?: string;
  favorites: UserFavorite[];
  searchHistory: SearchLog[];
  primaryLanguage?: string;
  preferredHmo?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
}

export interface FacilityRepresentative {
  _id: string;
  userId: string;
  hospitalId: string;
  position: string;
  verified: boolean;
  verificationDate?: string;
  documentsSubmitted?: string[];
}

export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export interface ClaimRequest {
  _id: string;
  hospitalId: string;
  hospitalName: string;
  userId: string;
  userName: string;
  userEmail: string;
  position: string;
  documentName: string;
  status: ClaimStatus;
  createdAt: string;
  documentUrl?: string;
  rejectionReason?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface HospitalFilterOptions {
  query?: string;
  facilityType?: string;
  service?: string;
  specialty?: string;
  insurance?: string;
  emergencyOnly?: boolean;
  traumaLevel?: TraumaLevel;
  minRating?: number;
  maxDistanceKm?: number;
  city?: string;
  state?: string;
  sortBy?: 'distance' | 'rating' | 'reviews' | 'name';
}
