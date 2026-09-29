/**
 * Verification Suite for Task 8: Hospital Search & Map Discovery (/hospitals)
 * Verifies multi-criteria filtering (FR2.3), sorting engine (FR2.5),
 * distance radius calculations, URL parameter hydration, and SSR rendering.
 */

// Allow Node.js/tsx to import .css files safely
require.extensions['.css'] = () => {};

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AppProvider, useAppContext } from '../src/context/AppContext';
import { NIGERIAN_LOCATIONS, DEFAULT_LOCATION } from '../src/data/nigerianLocations';
import { INITIAL_HOSPITALS } from '../src/data/initialHospitals';
import { calculateDistance } from '../src/utils/geo';
import {
  filterHospitals,
  sortHospitals,
  DEFAULT_FILTER_STATE,
  HospitalFilterState
} from '../src/app/hospitals/searchUtils';

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    process.exitCode = 1;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 TASK 8: HOSPITAL SEARCH & DISCOVERY VERIFICATION');
  console.log('====================================================\n');

  // -----------------------------------------------------------------
  // 1. Module Export Verification
  // -----------------------------------------------------------------
  console.log('--- 1. Module Export Verification ---');
  const hospitalsModule = await import('../src/app/hospitals/page');
  const HospitalsPage = hospitalsModule.default;
  assert(typeof HospitalsPage === 'function', 'HospitalsPage is default-exported as a React component function');

  // -----------------------------------------------------------------
  // 2. Multi-Criteria Filtering Engine (FR2.3)
  // -----------------------------------------------------------------
  console.log('\n--- 2. Multi-Criteria Filtering Engine (FR2.3) ---');
  const ikejaLocation = DEFAULT_LOCATION; // Lagos - Ikeja

  // 2.1 Keyword Query Search
  const queryResults = filterHospitals(INITIAL_HOSPITALS, ikejaLocation, {
    query: 'LUTH'
  });
  assert(
    queryResults.length >= 1 && queryResults.some((h) => h.name.includes('LUTH')),
    'Query search for "LUTH" returns Lagos University Teaching Hospital'
  );

  const cardiologyQuery = filterHospitals(INITIAL_HOSPITALS, ikejaLocation, {
    query: 'Cardiology'
  });
  assert(
    cardiologyQuery.length > 0 &&
      cardiologyQuery.every((h) =>
        h.name.toLowerCase().includes('cardiology') ||
        h.specialties.some((s) => s.toLowerCase().includes('cardiology')) ||
        h.facilityType.toLowerCase().includes('cardiac')
      ),
    'Query search for "Cardiology" matches facilities by name and specialty'
  );

  // 2.2 Facility Type Filter
  const teachingHospitals = filterHospitals(INITIAL_HOSPITALS, ikejaLocation, {
    facilityType: 'Teaching Hospital'
  });
  assert(
    teachingHospitals.length > 0 &&
      teachingHospitals.every((h) => h.facilityType === 'Teaching Hospital'),
    `Facility type "Teaching Hospital" returns only teaching hospitals (${teachingHospitals.length} found)`
  );

  const fmcHospitals = filterHospitals(INITIAL_HOSPITALS, ikejaLocation, {
    facilityType: 'Federal Medical Centre'
  });
  assert(
    fmcHospitals.length > 0 &&
      fmcHospitals.every((h) => h.facilityType === 'Federal Medical Centre'),
    `Facility type "Federal Medical Centre" returns only FMCs (${fmcHospitals.length} found)`
  );

  // 2.3 HMO / Insurance Filter
  const nhisHospitals = filterHospitals(INITIAL_HOSPITALS, ikejaLocation, {
    insurance: 'NHIS'
  });
  assert(
    nhisHospitals.length > 0 &&
      nhisHospitals.every((h) => h.insuranceAccepted.some((i) => i.includes('NHIS'))),
    `HMO filter "NHIS" returns only facilities accepting NHIS (${nhisHospitals.length} found)`
  );

  const hygeiaHospitals = filterHospitals(INITIAL_HOSPITALS, ikejaLocation, {
    insurance: 'Hygeia'
  });
  assert(
    hygeiaHospitals.length > 0 &&
      hygeiaHospitals.every((h) => h.insuranceAccepted.some((i) => i.toLowerCase().includes('hygeia'))),
    `HMO filter "Hygeia" returns only facilities accepting Hygeia (${hygeiaHospitals.length} found)`
  );

  // 2.4 Clinical Services Filter
  const traumaCareHospitals = filterHospitals(INITIAL_HOSPITALS, ikejaLocation, {
    services: ['Trauma Care']
  });
  assert(
    traumaCareHospitals.length > 0 &&
      traumaCareHospitals.every((h) => h.services.includes('Trauma Care')),
    `Service filter "Trauma Care" returns only facilities with trauma care (${traumaCareHospitals.length} found)`
  );

  const dialysisHospitals = filterHospitals(INITIAL_HOSPITALS, ikejaLocation, {
    services: ['Dialysis']
  });
  assert(
    dialysisHospitals.length > 0 &&
      dialysisHospitals.every((h) => h.services.includes('Dialysis')),
    `Service filter "Dialysis" returns only facilities with dialysis (${dialysisHospitals.length} found)`
  );

  // 2.5 24/7 Emergency Only Toggle
  const emergencyOnlyHospitals = filterHospitals(INITIAL_HOSPITALS, ikejaLocation, {
    emergencyOnly: true
  });
  assert(
    emergencyOnlyHospitals.length > 0 &&
      emergencyOnlyHospitals.every((h) => h.emergency24Hours === true),
    `24/7 Emergency toggle returns only facilities with emergency24Hours === true (${emergencyOnlyHospitals.length} found)`
  );

  // 2.6 Minimum Patient Rating Filter
  const rating4PlusHospitals = filterHospitals(INITIAL_HOSPITALS, ikejaLocation, {
    minRating: 4.0
  });
  assert(
    rating4PlusHospitals.length > 0 &&
      rating4PlusHospitals.every((h) => h.averageRating >= 4.0),
    `Rating filter "4+ Stars" returns only facilities with averageRating >= 4.0 (${rating4PlusHospitals.length} found)`
  );

  // -----------------------------------------------------------------
  // 3. Distance Radius Slider Calculations
  // -----------------------------------------------------------------
  console.log('\n--- 3. Distance Radius Slider Calculations ---');

  // Test radius 5km from Ikeja (Should include LASUTH 0.9km and Mother & Child 1.1km)
  const within5km = filterHospitals(INITIAL_HOSPITALS, ikejaLocation, {
    isDistanceFilterActive: true,
    distanceRadiusKm: 5
  });
  assert(
    within5km.length >= 2 &&
      within5km.every((h) => h.distanceKm <= 5),
    `Radius <= 5km from Ikeja returns only nearby facilities (${within5km.length} found, all <= 5.0 km)`
  );
  assert(
    within5km.some((h) => h.name.includes('LASUTH')),
    'LASUTH (0.9 km) is included in 5km radius'
  );

  // Test radius 15km from Ikeja (Should include LUTH 9.3km and FMC Ebute Metta 13.2km)
  const within15km = filterHospitals(INITIAL_HOSPITALS, ikejaLocation, {
    isDistanceFilterActive: true,
    distanceRadiusKm: 15
  });
  assert(
    within15km.length > within5km.length &&
      within15km.every((h) => h.distanceKm <= 15),
    `Radius <= 15km returns more facilities than 5km (${within15km.length} vs ${within5km.length})`
  );
  assert(
    within15km.some((h) => h.name.includes('LUTH')),
    'LUTH (9.3 km) is included in 15km radius'
  );

  // Test radius 50km from Ikeja (Should include all Lagos facilities <= 50km)
  const within50km = filterHospitals(INITIAL_HOSPITALS, ikejaLocation, {
    isDistanceFilterActive: true,
    distanceRadiusKm: 50
  });
  assert(
    within50km.length >= 10 &&
      within50km.every((h) => h.distanceKm <= 50),
    `Radius <= 50km returns all Lagos facilities (${within50km.length} found, all <= 50 km)`
  );
  assert(
    !within50km.some((h) => h.city === 'Abuja' || h.city === 'Kano'),
    'Facilities in Abuja and Kano (> 500 km) are excluded from 50km Ikeja radius'
  );

  // -----------------------------------------------------------------
  // 4. Combined Multi-Criteria Filter (Step 4 from brief)
  // "Teaching Hospital" + "NHIS" + distance slider
  // -----------------------------------------------------------------
  console.log('\n--- 4. Combined Multi-Criteria Filter Test ("Teaching Hospital" + "NHIS" + distance slider) ---');

  // Combined 1: Teaching Hospital + NHIS (Nationwide)
  const teachingWithNhisAll = filterHospitals(INITIAL_HOSPITALS, ikejaLocation, {
    facilityType: 'Teaching Hospital',
    insurance: 'NHIS',
    isDistanceFilterActive: false
  });
  assert(
    teachingWithNhisAll.length >= 3,
    `Teaching Hospital + NHIS nationwide returns multiple facilities across Nigeria (${teachingWithNhisAll.length} found)`
  );

  // Combined 2: Teaching Hospital + NHIS + radius <= 5 km
  const teachingWithNhis5km = filterHospitals(INITIAL_HOSPITALS, ikejaLocation, {
    facilityType: 'Teaching Hospital',
    insurance: 'NHIS',
    isDistanceFilterActive: true,
    distanceRadiusKm: 5
  });
  assert(
    teachingWithNhis5km.length === 1 && teachingWithNhis5km[0].name.includes('LASUTH'),
    `Teaching Hospital + NHIS + 5km slider returns exactly LASUTH (${teachingWithNhis5km[0]?.name})`
  );

  // Combined 3: Teaching Hospital + NHIS + radius <= 15 km
  const teachingWithNhis15km = filterHospitals(INITIAL_HOSPITALS, ikejaLocation, {
    facilityType: 'Teaching Hospital',
    insurance: 'NHIS',
    isDistanceFilterActive: true,
    distanceRadiusKm: 15
  });
  assert(
    teachingWithNhis15km.length === 2 &&
      teachingWithNhis15km.some((h) => h.name.includes('LASUTH')) &&
      teachingWithNhis15km.some((h) => h.name.includes('LUTH')),
    `Teaching Hospital + NHIS + 15km slider returns both LASUTH and LUTH (${teachingWithNhis15km.length} found)`
  );

  // -----------------------------------------------------------------
  // 5. Sorting Engine (FR2.5)
  // -----------------------------------------------------------------
  console.log('\n--- 5. Sorting Engine (FR2.5) ---');
  const allHospitalsWithDist = filterHospitals(INITIAL_HOSPITALS, ikejaLocation, {});

  // 5.1 Sort by Nearest Distance
  const sortedByDist = sortHospitals(allHospitalsWithDist, 'distance');
  let distanceMonotonic = true;
  for (let i = 1; i < sortedByDist.length; i++) {
    if (sortedByDist[i].distanceKm < sortedByDist[i - 1].distanceKm) {
      distanceMonotonic = false;
      break;
    }
  }
  assert(distanceMonotonic, 'Nearest Distance sort orders hospitals in monotonically ascending distance');
  assert(sortedByDist[0].name.includes('LASUTH'), `Closest hospital to Ikeja is ${sortedByDist[0].name} (${sortedByDist[0].distanceKm} km)`);

  // 5.2 Sort by Highest Rating
  const sortedByRating = sortHospitals(allHospitalsWithDist, 'rating');
  let ratingMonotonic = true;
  for (let i = 1; i < sortedByRating.length; i++) {
    if (sortedByRating[i].averageRating > sortedByRating[i - 1].averageRating) {
      ratingMonotonic = false;
      break;
    }
  }
  assert(ratingMonotonic, 'Highest Rating sort orders hospitals in descending average rating');
  assert(sortedByRating[0].averageRating >= 4.5, `Top rated hospital has rating ${sortedByRating[0].averageRating} (${sortedByRating[0].name})`);

  // 5.3 Sort by Total Reviews
  const sortedByReviews = sortHospitals(allHospitalsWithDist, 'reviews');
  let reviewsMonotonic = true;
  for (let i = 1; i < sortedByReviews.length; i++) {
    if (sortedByReviews[i].totalReviews > sortedByReviews[i - 1].totalReviews) {
      reviewsMonotonic = false;
      break;
    }
  }
  assert(reviewsMonotonic, 'Total Reviews sort orders hospitals in descending review count');
  assert(sortedByReviews[0].totalReviews >= sortedByReviews[1].totalReviews, `Most reviewed hospital has ${sortedByReviews[0].totalReviews} reviews (${sortedByReviews[0].name})`);

  // 5.4 Sort by Name (A-Z)
  const sortedByName = sortHospitals(allHospitalsWithDist, 'name');
  let nameAlphabetical = true;
  for (let i = 1; i < sortedByName.length; i++) {
    if (sortedByName[i].name.localeCompare(sortedByName[i - 1].name) < 0) {
      nameAlphabetical = false;
      break;
    }
  }
  assert(nameAlphabetical, 'Name (A-Z) sort orders hospitals in proper alphabetical ascending order');

  // -----------------------------------------------------------------
  // 6. SSR Rendering & HTML Structure Verification
  // -----------------------------------------------------------------
  console.log('\n--- 6. SSR Rendering & HTML Output ---');

  const html = renderToStaticMarkup(
    React.createElement(
      AppProvider,
      null,
      React.createElement(HospitalsPage)
    )
  );

  assert(typeof html === 'string' && html.length > 500, `HospitalsPage renders to SSR HTML (length: ${html.length})`);
  assert(
    html.includes('Loading Nigerian Healthcare Directory') ||
    html.includes('Hospitals Found') ||
    html.includes('Filters'),
    'HospitalsPage contains expected discovery markup or suspense fallback'
  );

  console.log('\n====================================================');
  console.log(`Passed: ${passedTests} / ${totalTests} assertions`);
  console.log('====================================================');

  if (passedTests === totalTests && (process.exitCode === 0 || process.exitCode === undefined)) {
    console.log('\n🎉 ALL TASK 8 SEARCH & DISCOVERY PAGE VERIFICATIONS PASSED!\n');
  } else {
    console.error('\n❌ FAILURE: Some tests did not pass.\n');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed with unhandled error:', err);
  process.exit(1);
});
