import { Hospital, NigerianCityLocation } from '@/types';
import { calculateDistance } from '@/utils/geo';

export type SortOption = 'distance' | 'rating' | 'reviews' | 'name';

export interface HospitalFilterState {
  query: string;
  state: string; // 'Delta' by default, or 'all', or specific state
  facilityType: string; // 'all' or specific type
  services: string[]; // selected services
  insurance: string; // 'all' or specific insurance
  specialty: string; // 'all' or specific specialty
  emergencyOnly: boolean; // 24/7 emergency only
  minRating: number; // 0, 3, 4, 4.5
  distanceRadiusKm: number; // 1 to 50
  isDistanceFilterActive: boolean; // whether radius cutoff is applied
  sortBy: SortOption;
}

export const DEFAULT_FILTER_STATE: HospitalFilterState = {
  query: '',
  state: 'Delta', // Delta State is the primary focal center
  facilityType: 'all',
  services: [],
  insurance: 'all',
  specialty: 'all',
  emergencyOnly: false,
  minRating: 0,
  distanceRadiusKm: 50,
  isDistanceFilterActive: false,
  sortBy: 'distance'
};

export const STATE_OPTIONS = [
  { label: 'Delta State (Primary Focus)', value: 'Delta' },
  { label: 'All Nigeria (Nationwide)', value: 'all' },
  { label: 'Lagos State', value: 'Lagos' },
  { label: 'Abuja (Federal Capital Territory)', value: 'Federal Capital Territory' },
  { label: 'Oyo State (Ibadan)', value: 'Oyo' },
  { label: 'Rivers State (Port Harcourt)', value: 'Rivers' },
  { label: 'Kano State', value: 'Kano' },
  { label: 'Edo State (Benin)', value: 'Edo' },
  { label: 'Enugu State', value: 'Enugu' }
];

export const FACILITY_TYPE_OPTIONS = [
  { label: 'All Types', value: 'all' },
  { label: 'Teaching Hospital', value: 'Teaching Hospital' },
  { label: 'Federal Medical Centre', value: 'Federal Medical Centre' },
  { label: 'State General Hospital', value: 'State General' },
  { label: 'Specialist Clinic', value: 'Specialist Clinic' },
  { label: 'Private Specialist', value: 'Private Specialist' },
  { label: 'Primary Healthcare Centre', value: 'Primary Healthcare Centre' }
];

export const SERVICE_OPTIONS = [
  'Emergency Care',
  'ICU',
  'Trauma Care',
  'Surgical Procedures',
  'Dialysis',
  'Maternity & Obstetrics',
  'Pediatrics',
  'Radiology/CT/MRI'
];

export const INSURANCE_OPTIONS = [
  { label: 'All Insurance / HMOs', value: 'all' },
  { label: 'DSCHC (Delta State Contributory Health)', value: 'DSCHC' },
  { label: 'NHIS (National Health)', value: 'NHIS' },
  { label: 'Hygeia HMO', value: 'Hygeia' },
  { label: 'Reliance HMO', value: 'Reliance' },
  { label: 'AXA Mansard', value: 'AXA Mansard' },
  { label: 'Avon HMO', value: 'Avon' },
  { label: 'Leadway Health', value: 'Leadway' }
];

export const SPECIALTY_OPTIONS = [
  { label: 'All Specialties', value: 'all' },
  { label: 'Cardiology', value: 'Cardiology' },
  { label: 'Pediatrics', value: 'Pediatrics' },
  { label: 'Nephrology (Kidney)', value: 'Nephrology' },
  { label: 'Obstetrics & Gynecology', value: 'Obstetrics & Gynecology' },
  { label: 'Oncology (Cancer)', value: 'Oncology' },
  { label: 'Orthopedics (Bone)', value: 'Orthopedics' },
  { label: 'Neurology & Neurosurgery', value: 'Neurology' }
];

export const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Nearest Distance', value: 'distance' },
  { label: 'Highest Rating', value: 'rating' },
  { label: 'Total Reviews', value: 'reviews' },
  { label: 'Name (A - Z)', value: 'name' }
];

export interface HospitalWithDistance extends Hospital {
  distanceKm: number;
}

/**
 * Filter hospitals according to multi-criteria specification (FR2.3)
 */
export function filterHospitals(
  hospitals: Hospital[],
  activeLocation: NigerianCityLocation,
  filters: Partial<HospitalFilterState>
): HospitalWithDistance[] {
  const query = filters.query?.trim().toLowerCase() || '';
  const facilityType = filters.facilityType || 'all';
  const services = filters.services || [];
  const insurance = filters.insurance || 'all';
  const specialty = filters.specialty || 'all';
  const emergencyOnly = filters.emergencyOnly ?? false;
  const minRating = filters.minRating ?? 0;
  const isDistanceFilterActive = filters.isDistanceFilterActive ?? false;
  const distanceRadiusKm = filters.distanceRadiusKm ?? 50;

  return hospitals
    .map((hospital) => {
      const distanceKm = calculateDistance(
        activeLocation.lat,
        activeLocation.lng,
        hospital.location.lat,
        hospital.location.lng
      );
      return { ...hospital, distanceKm };
    })
    .filter((hospital) => {
      // 1. Text Query Search (name, address, city, state, facilityType, services, specialties, insurance)
      if (query) {
        const nameMatch = hospital.name.toLowerCase().includes(query);
        const addressMatch = hospital.address.toLowerCase().includes(query);
        const cityMatch = hospital.city.toLowerCase().includes(query);
        const stateMatch = hospital.state.toLowerCase().includes(query);
        const typeMatch = hospital.facilityType.toLowerCase().includes(query);
        const specialtyMatch = hospital.specialties?.some((s) =>
          s.toLowerCase().includes(query)
        );
        const serviceMatch = hospital.services?.some((s) =>
          s.toLowerCase().includes(query)
        );
        const insuranceMatch = hospital.insuranceAccepted?.some((i) =>
          i.toLowerCase().includes(query)
        );

        if (
          !nameMatch &&
          !addressMatch &&
          !cityMatch &&
          !stateMatch &&
          !typeMatch &&
          !specialtyMatch &&
          !serviceMatch &&
          !insuranceMatch
        ) {
          return false;
        }
      }

      // State Filter (Delta State by default)
      const stateFilter = filters.state || 'all';
      if (stateFilter !== 'all') {
        if (hospital.state.toLowerCase() !== stateFilter.toLowerCase()) {
          return false;
        }
      }

      // 2. Facility Type Filter
      if (facilityType !== 'all') {
        const ftQuery = facilityType.toLowerCase();
        const hospType = hospital.facilityType.toLowerCase();
        if (ftQuery === 'state general') {
          if (!hospType.includes('state general') && !hospType.includes('general hospital')) {
            return false;
          }
        } else if (ftQuery === 'specialist clinic') {
          if (!hospType.includes('specialist') && !hospType.includes('clinic')) {
            return false;
          }
        } else if (!hospType.includes(ftQuery)) {
          return false;
        }
      }

      // 3. Services Filter (must contain all selected services)
      if (services.length > 0) {
        const hospServices = hospital.services || [];
        const hasAllServices = services.every((service) =>
          hospServices.some((hs) => hs.toLowerCase().includes(service.toLowerCase()))
        );
        if (!hasAllServices) return false;
      }

      // 4. Insurance / HMO Filter
      if (insurance !== 'all') {
        const insQuery = insurance.toLowerCase();
        const hasInsurance = hospital.insuranceAccepted?.some((hmo) =>
          hmo.toLowerCase().includes(insQuery)
        );
        if (!hasInsurance) return false;
      }

      // 5. Medical Specialty Filter
      if (specialty !== 'all') {
        const specQuery = specialty.toLowerCase();
        const hasSpecialty = hospital.specialties?.some((sp) =>
          sp.toLowerCase().includes(specQuery)
        );
        if (!hasSpecialty) return false;
      }

      // 6. 24/7 Emergency Only Toggle
      if (emergencyOnly && !hospital.emergency24Hours) {
        return false;
      }

      // 7. Minimum Rating Filter
      if (minRating > 0 && hospital.averageRating < minRating) {
        return false;
      }

      // 8. Distance Radius Filter
      if (isDistanceFilterActive && hospital.distanceKm > distanceRadiusKm) {
        return false;
      }

      return true;
    });
}

/**
 * Sort hospitals according to sorting engine specification (FR2.5)
 */
export function sortHospitals(
  hospitals: HospitalWithDistance[],
  sortBy: SortOption
): HospitalWithDistance[] {
  const sorted = [...hospitals];

  switch (sortBy) {
    case 'distance':
      return sorted.sort((a, b) => a.distanceKm - b.distanceKm);

    case 'rating':
      return sorted.sort((a, b) => {
        if (b.averageRating !== a.averageRating) {
          return b.averageRating - a.averageRating;
        }
        return b.totalReviews - a.totalReviews; // tie-breaker
      });

    case 'reviews':
      return sorted.sort((a, b) => {
        if (b.totalReviews !== a.totalReviews) {
          return b.totalReviews - a.totalReviews;
        }
        return b.averageRating - a.averageRating;
      });

    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));

    default:
      return sorted;
  }
}
