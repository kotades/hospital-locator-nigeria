/**
 * Test script for Task 6: SSR-Safe Leaflet Map Component & Hospital Card
 * Verifies that:
 * 1. Marker categorization conforms strictly to specifications (Red, Emerald, Blue)
 * 2. HospitalCard renders clean HTML for different emergency statuses and modes (compact & standard)
 * 3. Verified badges, emergency pills, distance/ETA calculations, and action links are present
 * 4. MapLoadingSkeleton renders SSR placeholder cleanly
 * 5. Map SSR safety: dynamically imported without `window is not defined` crash in Node.js
 */

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { INITIAL_HOSPITALS } from '../src/data/initialHospitals';
import { NIGERIAN_LOCATIONS, DEFAULT_LOCATION } from '../src/data/nigerianLocations';
import { HospitalCard } from '../src/components/HospitalCard';
import { MapLoadingSkeleton } from '../src/components/MapLoadingSkeleton';
import { Map, getHospitalMarkerCategory } from '../src/components/Map';
import { AppProvider } from '../src/context/AppContext';
import { calculateDistance, estimateTravelTime, formatDistance, formatTravelTime } from '../src/utils/geo';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 TASK 6 COMPONENT VERIFICATION & SSR TESTING');
  console.log('====================================================\n');

  // Test 1: Marker Category Logic
  console.log('--- 1. Testing Marker Categorization Logic ---');
  const emergencyHosp = INITIAL_HOSPITALS.find((h) => h.emergency24Hours);
  assert(!!emergencyHosp, 'Found hospital with 24/7 Emergency support');
  const emergencyCat = getHospitalMarkerCategory(emergencyHosp!);
  assert(emergencyCat === 'emergency', `24/7 Emergency hospital gets 'emergency' category (Red marker)`);

  const specialistHosp = INITIAL_HOSPITALS.find(
    (h) => !h.emergency24Hours && h.facilityType.toLowerCase().includes('specialist')
  );
  if (specialistHosp) {
    const specCat = getHospitalMarkerCategory(specialistHosp);
    assert(specCat === 'specialist', `Specialist clinic gets 'specialist' category (Emerald marker)`);
  }

  const generalHosp = INITIAL_HOSPITALS.find(
    (h) => !h.emergency24Hours && !h.facilityType.toLowerCase().includes('specialist')
  );
  if (generalHosp) {
    const genCat = getHospitalMarkerCategory(generalHosp);
    assert(genCat === 'general', `General hospital gets 'general' category (Blue marker)`);
  }

  // Test 2: MapLoadingSkeleton SSR Render
  console.log('\n--- 2. Testing MapLoadingSkeleton SSR Render ---');
  const skeletonHtml = renderToStaticMarkup(
    React.createElement(MapLoadingSkeleton, {
      height: 450,
      className: 'test-map-skeleton',
      message: 'Loading test Nigeria map...'
    })
  );
  assert(skeletonHtml.includes('Loading test Nigeria map...'), 'Skeleton contains loading prompt message');
  assert(skeletonHtml.includes('height:450px'), 'Skeleton applies custom height style');
  assert(skeletonHtml.includes('test-map-skeleton'), 'Skeleton applies custom className');
  assert(skeletonHtml.includes('OpenStreetMap'), 'Skeleton displays OpenStreetMap attribution tag');

  // Test 3: Map Component SSR Safety
  console.log('\n--- 3. Testing Map SSR Safety in Node.js (No window object) ---');
  // In Node.js, Leaflet will crash with "window is not defined" if imported synchronously.
  // The Map component must render the SSR skeleton gracefully without crashing.
  const mapHtml = renderToStaticMarkup(
    React.createElement(
      AppProvider,
      null,
      React.createElement(Map, {
        hospitals: INITIAL_HOSPITALS.slice(0, 5),
        activeLocation: DEFAULT_LOCATION,
        height: '600px',
        showEmergencyRadius: true
      })
    )
  );
  assert(typeof mapHtml === 'string' && mapHtml.length > 0, 'Map renders safely during SSR without window error');
  assert(mapHtml.includes('Loading interactive Nigeria hospital map...'), 'Map renders loading skeleton during SSR pre-hydration');
  assert(mapHtml.includes('height:600px'), 'Map skeleton respects height prop');

  // Test 4: HospitalCard Standard Grid Layout
  console.log('\n--- 4. Testing HospitalCard Standard Grid Layout ---');
  const testHospital = INITIAL_HOSPITALS[0]; // LUTH
  const ikejaLocation = NIGERIAN_LOCATIONS[0];

  const cardHtml = renderToStaticMarkup(
    React.createElement(
      AppProvider,
      null,
      React.createElement(HospitalCard, {
        hospital: testHospital,
        activeLocation: ikejaLocation,
        compact: false
      })
    )
  );

  assert(cardHtml.includes(testHospital.name), 'Card renders hospital name');
  assert(cardHtml.includes(testHospital.facilityType), 'Card renders facility type badge');
  assert(cardHtml.includes('Verified Facility'), 'Card renders verified checkmark badge');
  assert(cardHtml.includes('Accepting Patients'), 'Card renders live emergency status pill');
  assert(cardHtml.includes('24/7 Emergency'), 'Card renders 24/7 Emergency indicator badge');

  // Verify distance and travel time calculations
  const expectedDistance = calculateDistance(
    ikejaLocation.lat,
    ikejaLocation.lng,
    testHospital.location.lat,
    testHospital.location.lng
  );
  const expectedTime = estimateTravelTime(expectedDistance);
  const formattedDist = formatDistance(expectedDistance);
  const formattedTime = formatTravelTime(expectedTime);

  assert(cardHtml.includes(formattedDist), `Card contains accurate Haversine distance: ${formattedDist}`);
  assert(cardHtml.includes(formattedTime), `Card contains driving ETA: ${formattedTime}`);

  // Verify action links
  assert(cardHtml.includes(`href="/hospitals/${testHospital._id}"`), 'Card contains View Details link');
  assert(
    cardHtml.includes(`tel:${testHospital.emergencyPhone}`),
    'Card contains one-click emergency call telephone link'
  );

  // Test 5: HospitalCard Compact Mode
  console.log('\n--- 5. Testing HospitalCard Compact Mode ---');
  const compactHtml = renderToStaticMarkup(
    React.createElement(
      AppProvider,
      null,
      React.createElement(HospitalCard, {
        hospital: testHospital,
        activeLocation: ikejaLocation,
        compact: true
      })
    )
  );
  assert(compactHtml.includes(testHospital.name), 'Compact card renders hospital name');
  assert(compactHtml.includes('flex flex-col sm:flex-row'), 'Compact card uses horizontal layout structure');

  // Test 6: HospitalCard with Different Emergency Statuses
  console.log('\n--- 6. Testing HospitalCard Emergency Statuses ---');
  const limitedHospital = {
    ...testHospital,
    _id: 'test-limited',
    emergencyStatus: 'limited' as const
  };
  const criticalHospital = {
    ...testHospital,
    _id: 'test-critical',
    emergencyStatus: 'critical' as const
  };

  const limitedHtml = renderToStaticMarkup(
    React.createElement(AppProvider, null, React.createElement(HospitalCard, { hospital: limitedHospital }))
  );
  assert(limitedHtml.includes('Limited Capacity'), 'Limited capacity hospital displays Limited Capacity pill');

  const criticalHtml = renderToStaticMarkup(
    React.createElement(AppProvider, null, React.createElement(HospitalCard, { hospital: criticalHospital }))
  );
  assert(criticalHtml.includes('Critical Divert'), 'Critical status hospital displays Critical Divert pill');

  console.log('\n====================================================');
  console.log('🎉 ALL TASK 6 COMPONENT TESTS PASSED SUCCESSFULLY!');
  console.log('====================================================');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
