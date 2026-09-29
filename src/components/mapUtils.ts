import { Hospital } from '@/types';

export type HospitalMarkerCategory = 'emergency' | 'specialist' | 'general';

/**
 * Categorizes a hospital for visual marker identification:
 * - Red ('emergency') for 24/7 Emergency hospitals
 * - Emerald ('specialist') for Specialist clinics
 * - Blue ('general') for General / Teaching hospitals
 */
export function getHospitalMarkerCategory(hospital: Hospital): HospitalMarkerCategory {
  if (hospital.emergency24Hours) {
    return 'emergency';
  }
  const type = (hospital.facilityType || '').toLowerCase();
  if (
    type.includes('specialist') ||
    type.includes('cardiac') ||
    type.includes('clinic') ||
    type.includes('maternity')
  ) {
    return 'specialist';
  }
  return 'general';
}

export const MARKER_COLORS = {
  emergency: {
    bg: '#dc2626',
    border: '#991b1b',
    glow: 'rgba(220, 38, 38, 0.45)',
    label: '24/7 Emergency Hospitals'
  },
  specialist: {
    bg: '#059669',
    border: '#065f46',
    glow: 'rgba(5, 150, 105, 0.45)',
    label: 'Specialist Clinics'
  },
  general: {
    bg: '#0284c7',
    border: '#075985',
    glow: 'rgba(2, 132, 199, 0.45)',
    label: 'General / Teaching Hospitals'
  }
} as const;
