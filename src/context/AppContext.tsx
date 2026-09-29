'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Hospital,
  Review,
  ClaimRequest,
  UserFavorite,
  SearchLog,
  NigerianCityLocation,
  EmergencyStatus
} from '@/types';
import { INITIAL_HOSPITALS } from '@/data/initialHospitals';
import { INITIAL_REVIEWS } from '@/data/initialReviews';
import { DEFAULT_LOCATION } from '@/data/nigerianLocations';

export const INITIAL_CLAIMS: ClaimRequest[] = [
  {
    _id: 'claim-1',
    hospitalId: 'hosp-first-cardiology',
    hospitalName: 'First Cardiology Consultants, Ikoyi',
    userId: 'user-rep-2',
    userName: 'Dr. Babatunde Sanusi',
    userEmail: 'sanusi@firstcardiology.ng',
    position: 'Chief Medical Director',
    documentName: 'CAC_Certificate_RC891244.pdf',
    status: 'pending',
    createdAt: '2026-09-18T10:15:00Z'
  },
  {
    _id: 'claim-2',
    hospitalId: 'hosp-lasuth',
    hospitalName: 'Lagos State University Teaching Hospital (LASUTH)',
    userId: 'user-rep-1',
    userName: 'Dr. Adeyemi Adeleke',
    userEmail: 'rep@demo.com',
    position: 'Director of Clinical Services',
    documentName: 'Lagos_MOH_Accreditation_LASUTH.pdf',
    status: 'approved',
    createdAt: '2026-08-20T08:00:00Z',
    reviewedAt: '2026-08-22T14:30:00Z',
    reviewedBy: 'admin@demo.com'
  },
  {
    _id: 'claim-3',
    hospitalId: 'hosp-fmc-ebute-metta',
    hospitalName: 'Federal Medical Centre (FMC), Ebute Metta',
    userId: 'user-unverified',
    userName: 'Kelechi Nwosu',
    userEmail: 'k.nwosu@gmail.com',
    position: 'IT Intern',
    documentName: 'Staff_ID_Expired.jpg',
    status: 'rejected',
    rejectionReason: 'Invalid documentation: CAC certificate or authorized CMD authorization letter required.',
    createdAt: '2026-09-01T11:20:00Z',
    reviewedAt: '2026-09-02T09:10:00Z',
    reviewedBy: 'admin@demo.com'
  }
];

export const INITIAL_FAVORITES: UserFavorite[] = [
  {
    hospitalId: 'hosp-luth',
    note: 'Pediatric emergency contact: Dr. Ade. Recommended for intensive neonatal care.',
    addedAt: '2026-09-15T08:30:00Z'
  },
  {
    hospitalId: 'hosp-evercare',
    note: 'Level I trauma and MRI diagnostics center. Open 24/7.',
    addedAt: '2026-09-20T12:00:00Z'
  }
];

export const INITIAL_SEARCH_HISTORY: SearchLog[] = [
  {
    _id: 'search-1',
    query: 'Cardiology 24/7',
    city: 'Lagos',
    specialty: 'Cardiology',
    timestamp: '2026-09-28T16:20:00Z',
    resultsCount: 4
  },
  {
    _id: 'search-2',
    query: 'Emergency ICU',
    city: 'Ikeja',
    timestamp: '2026-09-29T10:00:00Z',
    resultsCount: 6
  }
];

export interface AppContextType {
  hospitals: Hospital[];
  reviews: Review[];
  claims: ClaimRequest[];
  activeLocation: NigerianCityLocation;
  favorites: UserFavorite[];
  searchHistory: SearchLog[];
  isHydrated: boolean;

  // Mutation methods
  addReview: (review: Omit<Review, '_id' | 'createdAt' | 'helpful' | 'notHelpful'> | Review) => void;
  voteReview: (reviewId: string, type: 'helpful' | 'notHelpful') => void;
  respondToReview: (reviewId: string, response: string) => void;
  deleteReview: (reviewId: string) => void;
  updateHospitalEmergencyStatus: (hospitalId: string, status: EmergencyStatus) => void;
  updateHospitalDetails: (hospitalId: string, updates: Partial<Hospital>) => void;
  addHospital: (hospital: Hospital) => void;
  deleteHospital: (hospitalId: string) => void;
  submitClaim: (claim: Omit<ClaimRequest, '_id' | 'status' | 'createdAt'> | ClaimRequest) => void;
  approveClaim: (claimId: string, reviewedBy?: string) => void;
  rejectClaim: (claimId: string, reason?: string, reviewedBy?: string) => void;
  toggleFavorite: (hospitalId: string) => void;
  isFavorite: (hospitalId: string) => boolean;
  addFavoriteNote: (hospitalId: string, note: string) => void;
  logSearch: (query: string, city?: string, specialty?: string, resultsCount?: number) => void;
  clearSearchHistory: () => void;
  setSimulatedLocation: (location: NigerianCityLocation) => void;
  resetDemoData: () => void;
}

const STORAGE_KEYS = {
  HOSPITALS: 'hl_hospitals',
  REVIEWS: 'hl_reviews',
  CLAIMS: 'hl_claims',
  LOCATION: 'hl_active_location',
  FAVORITES: 'hl_favorites',
  SEARCH_HISTORY: 'hl_search_history'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [hospitals, setHospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [claims, setClaims] = useState<ClaimRequest[]>(INITIAL_CLAIMS);
  const [activeLocation, setActiveLocation] = useState<NigerianCityLocation>(DEFAULT_LOCATION);
  const [favorites, setFavorites] = useState<UserFavorite[]>(INITIAL_FAVORITES);
  const [searchHistory, setSearchHistory] = useState<SearchLog[]>(INITIAL_SEARCH_HISTORY);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage once mounted on client to prevent SSR hydration mismatch
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedHospitals = localStorage.getItem(STORAGE_KEYS.HOSPITALS);
      if (storedHospitals) {
        setHospitals(JSON.parse(storedHospitals));
      }

      const storedReviews = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (storedReviews) {
        setReviews(JSON.parse(storedReviews));
      }

      const storedClaims = localStorage.getItem(STORAGE_KEYS.CLAIMS);
      if (storedClaims) {
        setClaims(JSON.parse(storedClaims));
      }

      const storedLocation = localStorage.getItem(STORAGE_KEYS.LOCATION);
      if (storedLocation) {
        setActiveLocation(JSON.parse(storedLocation));
      }

      const storedFavorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }

      const storedHistory = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
      if (storedHistory) {
        setSearchHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.warn('Error reading application state from localStorage:', error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Synchronize state changes to localStorage after initial hydration
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.HOSPITALS, JSON.stringify(hospitals));
    } catch (e) {
      console.error('Failed to persist hospitals to localStorage:', e);
    }
  }, [hospitals, isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    } catch (e) {
      console.error('Failed to persist reviews to localStorage:', e);
    }
  }, [reviews, isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(claims));
    } catch (e) {
      console.error('Failed to persist claims to localStorage:', e);
    }
  }, [claims, isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(activeLocation));
    } catch (e) {
      console.error('Failed to persist active location to localStorage:', e);
    }
  }, [activeLocation, isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to persist favorites to localStorage:', e);
    }
  }, [favorites, isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(searchHistory));
    } catch (e) {
      console.error('Failed to persist search history to localStorage:', e);
    }
  }, [searchHistory, isHydrated]);

  // Mutation: Add review and recalculate hospital rating
  const addReview = useCallback(
    (reviewInput: Omit<Review, '_id' | 'createdAt' | 'helpful' | 'notHelpful'> | Review) => {
      const newReview: Review = {
        _id:
          '_id' in reviewInput && reviewInput._id
            ? reviewInput._id
            : `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt:
          'createdAt' in reviewInput && reviewInput.createdAt
            ? reviewInput.createdAt
            : new Date().toISOString(),
        helpful:
          'helpful' in reviewInput && typeof reviewInput.helpful === 'number'
            ? reviewInput.helpful
            : 0,
        notHelpful:
          'notHelpful' in reviewInput && typeof reviewInput.notHelpful === 'number'
            ? reviewInput.notHelpful
            : 0,
        ...reviewInput
      };

      setReviews((prevReviews) => {
        const nextReviews = [newReview, ...prevReviews];

        // Recalculate average rating and total review count for the hospital
        setHospitals((prevHospitals) =>
          prevHospitals.map((hosp) => {
            if (hosp._id === newReview.hospitalId) {
              const matchingReviews = nextReviews.filter((r) => r.hospitalId === hosp._id);
              const totalRating = matchingReviews.reduce((sum, r) => sum + r.overallRating, 0);
              const newAverage =
                matchingReviews.length > 0
                  ? Math.round((totalRating / matchingReviews.length) * 10) / 10
                  : newReview.overallRating;

              return {
                ...hosp,
                averageRating: newAverage,
                totalReviews: matchingReviews.length
              };
            }
            return hosp;
          })
        );

        return nextReviews;
      });
    },
    []
  );

  // Mutation: Vote review helpfulness
  const voteReview = useCallback((reviewId: string, type: 'helpful' | 'notHelpful') => {
    setReviews((prevReviews) =>
      prevReviews.map((rev) => {
        if (rev._id === reviewId) {
          return {
            ...rev,
            [type]: rev[type] + 1
          };
        }
        return rev;
      })
    );
  }, []);

  // Mutation: Facility representative official response to a review
  const respondToReview = useCallback((reviewId: string, response: string) => {
    setReviews((prevReviews) =>
      prevReviews.map((rev) => {
        if (rev._id === reviewId) {
          return {
            ...rev,
            response,
            responseDate: new Date().toISOString()
          };
        }
        return rev;
      })
    );
  }, []);

  // Mutation: Delete review and recalculate hospital rating
  const deleteReview = useCallback((reviewId: string) => {
    setReviews((prevReviews) => {
      const target = prevReviews.find((r) => r._id === reviewId);
      const nextReviews = prevReviews.filter((r) => r._id !== reviewId);

      if (target) {
        setHospitals((prevHospitals) =>
          prevHospitals.map((hosp) => {
            if (hosp._id === target.hospitalId) {
              const matchingReviews = nextReviews.filter((r) => r.hospitalId === hosp._id);
              const totalRating = matchingReviews.reduce((sum, r) => sum + r.overallRating, 0);
              const newAverage =
                matchingReviews.length > 0
                  ? Math.round((totalRating / matchingReviews.length) * 10) / 10
                  : 0;

              return {
                ...hosp,
                averageRating: newAverage,
                totalReviews: matchingReviews.length
              };
            }
            return hosp;
          })
        );
      }

      return nextReviews;
    });
  }, []);

  // Mutation: Update hospital emergency capacity status
  const updateHospitalEmergencyStatus = useCallback(
    (hospitalId: string, status: EmergencyStatus) => {
      setHospitals((prevHospitals) =>
        prevHospitals.map((hosp) =>
          hosp._id === hospitalId ? { ...hosp, emergencyStatus: status } : hosp
        )
      );
    },
    []
  );

  // Mutation: Update hospital metadata details
  const updateHospitalDetails = useCallback((hospitalId: string, updates: Partial<Hospital>) => {
    setHospitals((prevHospitals) =>
      prevHospitals.map((hosp) => (hosp._id === hospitalId ? { ...hosp, ...updates } : hosp))
    );
  }, []);

  // Mutation: Add new hospital (admin)
  const addHospital = useCallback((hospital: Hospital) => {
    setHospitals((prevHospitals) => [hospital, ...prevHospitals]);
  }, []);

  // Mutation: Delete hospital (admin)
  const deleteHospital = useCallback((hospitalId: string) => {
    setHospitals((prevHospitals) => prevHospitals.filter((h) => h._id !== hospitalId));
  }, []);

  // Mutation: Submit representative claim request
  const submitClaim = useCallback(
    (claimInput: Omit<ClaimRequest, '_id' | 'status' | 'createdAt'> | ClaimRequest) => {
      const newClaim: ClaimRequest = {
        _id:
          '_id' in claimInput && claimInput._id
            ? claimInput._id
            : `claim-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        status: 'status' in claimInput && claimInput.status ? claimInput.status : 'pending',
        createdAt:
          'createdAt' in claimInput && claimInput.createdAt
            ? claimInput.createdAt
            : new Date().toISOString(),
        ...claimInput
      };
      setClaims((prevClaims) => [newClaim, ...prevClaims]);
    },
    []
  );

  // Mutation: Approve facility claim
  const approveClaim = useCallback((claimId: string, reviewedBy?: string) => {
    let claimedHospitalId: string | null = null;
    let claimantUserId: string | null = null;

    setClaims((prevClaims) =>
      prevClaims.map((claim) => {
        if (claim._id === claimId) {
          claimedHospitalId = claim.hospitalId;
          claimantUserId = claim.userId;
          return {
            ...claim,
            status: 'approved',
            reviewedAt: new Date().toISOString(),
            reviewedBy: reviewedBy || 'admin@demo.com'
          };
        }
        return claim;
      })
    );

    if (claimedHospitalId && claimantUserId) {
      setHospitals((prevHospitals) =>
        prevHospitals.map((hosp) =>
          hosp._id === claimedHospitalId
            ? { ...hosp, verified: true, claimedBy: claimantUserId }
            : hosp
        )
      );
    }
  }, []);

  // Mutation: Reject facility claim
  const rejectClaim = useCallback((claimId: string, reason?: string, reviewedBy?: string) => {
    setClaims((prevClaims) =>
      prevClaims.map((claim) => {
        if (claim._id === claimId) {
          return {
            ...claim,
            status: 'rejected',
            rejectionReason:
              reason || 'Submitted documentation could not be authenticated with official registries.',
            reviewedAt: new Date().toISOString(),
            reviewedBy: reviewedBy || 'admin@demo.com'
          };
        }
        return claim;
      })
    );
  }, []);

  // Mutation: Toggle user favorite facility
  const toggleFavorite = useCallback((hospitalId: string) => {
    setFavorites((prevFavorites) => {
      const exists = prevFavorites.some((f) => f.hospitalId === hospitalId);
      if (exists) {
        return prevFavorites.filter((f) => f.hospitalId !== hospitalId);
      } else {
        return [...prevFavorites, { hospitalId, addedAt: new Date().toISOString() }];
      }
    });
  }, []);

  // Helper: Check if hospital is favorited
  const isFavorite = useCallback(
    (hospitalId: string) => {
      return favorites.some((f) => f.hospitalId === hospitalId);
    },
    [favorites]
  );

  // Mutation: Add or update personal note on favorite
  const addFavoriteNote = useCallback((hospitalId: string, note: string) => {
    setFavorites((prevFavorites) => {
      const exists = prevFavorites.some((f) => f.hospitalId === hospitalId);
      if (exists) {
        return prevFavorites.map((f) => (f.hospitalId === hospitalId ? { ...f, note } : f));
      } else {
        return [...prevFavorites, { hospitalId, note, addedAt: new Date().toISOString() }];
      }
    });
  }, []);

  // Mutation: Log search query to history
  const logSearch = useCallback(
    (query: string, city?: string, specialty?: string, resultsCount?: number) => {
      if (!query || !query.trim()) return;
      const newEntry: SearchLog = {
        _id: `search-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        query: query.trim(),
        city,
        specialty,
        resultsCount,
        timestamp: new Date().toISOString()
      };
      setSearchHistory((prevHistory) => [newEntry, ...prevHistory.slice(0, 49)]);
    },
    []
  );

  // Mutation: Clear search history
  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  // Mutation: Set simulated active location
  const setSimulatedLocation = useCallback((location: NigerianCityLocation) => {
    setActiveLocation(location);
  }, []);

  // Mutation: Reset demo state to default seed data
  const resetDemoData = useCallback(() => {
    setHospitals(INITIAL_HOSPITALS);
    setReviews(INITIAL_REVIEWS);
    setClaims(INITIAL_CLAIMS);
    setActiveLocation(DEFAULT_LOCATION);
    setFavorites(INITIAL_FAVORITES);
    setSearchHistory(INITIAL_SEARCH_HISTORY);

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEYS.HOSPITALS);
        localStorage.removeItem(STORAGE_KEYS.REVIEWS);
        localStorage.removeItem(STORAGE_KEYS.CLAIMS);
        localStorage.removeItem(STORAGE_KEYS.LOCATION);
        localStorage.removeItem(STORAGE_KEYS.FAVORITES);
        localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
      } catch (e) {
        console.error('Failed to clear demo data from localStorage:', e);
      }
    }
  }, []);

  const value = useMemo<AppContextType>(
    () => ({
      hospitals,
      reviews,
      claims,
      activeLocation,
      favorites,
      searchHistory,
      isHydrated,
      addReview,
      voteReview,
      respondToReview,
      deleteReview,
      updateHospitalEmergencyStatus,
      updateHospitalDetails,
      addHospital,
      deleteHospital,
      submitClaim,
      approveClaim,
      rejectClaim,
      toggleFavorite,
      isFavorite,
      addFavoriteNote,
      logSearch,
      clearSearchHistory,
      setSimulatedLocation,
      resetDemoData
    }),
    [
      hospitals,
      reviews,
      claims,
      activeLocation,
      favorites,
      searchHistory,
      isHydrated,
      addReview,
      voteReview,
      respondToReview,
      deleteReview,
      updateHospitalEmergencyStatus,
      updateHospitalDetails,
      addHospital,
      deleteHospital,
      submitClaim,
      approveClaim,
      rejectClaim,
      toggleFavorite,
      isFavorite,
      addFavoriteNote,
      logSearch,
      clearSearchHistory,
      setSimulatedLocation,
      resetDemoData
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const AppContextProvider = AppProvider;

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider or AppContextProvider');
  }
  return context;
}
