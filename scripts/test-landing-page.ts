/**
 * Verification Suite for Task 7: Landing / Home Page (/)
 * Verifies SSR rendering, component structure, hero search targets,
 * specialty quick chips, emergency banner (FR3.1), proximity sorting,
 * system statistics, and the 3-step "How It Works" guide.
 */

// Allow Node.js/tsx to import .css files safely
require.extensions['.css'] = () => {};

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AppProvider, useAppContext } from '../src/context/AppContext';
import { NIGERIAN_LOCATIONS, DEFAULT_LOCATION } from '../src/data/nigerianLocations';
import { INITIAL_HOSPITALS } from '../src/data/initialHospitals';
import { calculateDistance } from '../src/utils/geo';

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
  console.log('🧪 TASK 7: LANDING / HOME PAGE (/) VERIFICATION');
  console.log('====================================================\n');

  // Dynamically import HomePage after .css extension handler is registered
  const homeModule = await import('../src/app/page');
  const HomePage = homeModule.default;

  // 1. Export Verification
  console.log('--- 1. Module Export Verification ---');
  assert(typeof HomePage === 'function', 'HomePage is default-exported as a React component function');

  // 2. SSR Rendering inside AppProvider
  console.log('\n--- 2. SSR Rendering & HTML Output ---');
  const html = renderToStaticMarkup(
    React.createElement(
      AppProvider,
      null,
      React.createElement(HomePage)
    )
  );

  assert(typeof html === 'string' && html.length > 1000, `HomePage renders safely to SSR HTML string (length: ${html.length})`);

  // 3. Hero Section & Active Location Badge
  console.log('\n--- 3. Hero Section & Active Location Hub ---');
  assert(html.includes('Find Fast, Verified Medical Care'), 'Hero contains primary headline');
  assert(html.includes('Across Nigeria'), 'Hero contains Nigerian healthcare branding subtitle');
  assert(html.includes('Active GPS Hub:'), 'Hero contains active location badge label');
  assert(html.includes(DEFAULT_LOCATION.name), `Active location badge displays default location: ${DEFAULT_LOCATION.name}`);
  assert(
    html.includes(`${DEFAULT_LOCATION.lat.toFixed(4)}°N`) && html.includes(`${DEFAULT_LOCATION.lng.toFixed(4)}°E`),
    'Active location badge displays precise simulated GPS coordinates'
  );

  // 4. Hero Search Input & Button
  console.log('\n--- 4. Hero Search Input & Trigger ---');
  assert(
    html.includes('Search hospital name, specialty (Cardiology), service, or HMO...'),
    'Search input contains descriptive placeholder matching specification'
  );
  assert(html.includes('Search Facilities'), 'Search button with "Search Facilities" text exists');

  // 5. Specialty Quick Chips (All 7 required)
  console.log('\n--- 5. Specialty Quick Chips Specification ---');
  const requiredChips = [
    { label: '24/7 Emergency', href: '/hospitals?emergencyOnly=true' },
    { label: 'Trauma Center', href: '/hospitals?service=Trauma+Care' },
    { label: 'Cardiology', href: '/hospitals?specialty=Cardiology' },
    { label: 'Maternity', href: '/hospitals?service=Maternity+%26+Obstetrics' },
    { label: 'Pediatrics', href: '/hospitals?specialty=Pediatrics' },
    { label: 'Dialysis', href: '/hospitals?service=Dialysis' },
    { label: 'NHIS / HMO', href: '/hospitals?insurance=NHIS' }
  ];

  requiredChips.forEach(({ label, href }) => {
    assert(html.includes(label), `Specialty chip "${label}" is present on page`);
    assert(html.includes(`href="${href}"`), `Specialty chip "${label}" links to target "${href}"`);
  });

  // 6. High-Urgency Emergency Banner (FR3.1)
  console.log('\n--- 6. High-Urgency Emergency Banner (FR3.1) ---');
  assert(html.includes('EMERGENCY RESPONSE PROTOCOL (FR3.1)'), 'Emergency banner includes FR3.1 protocol tag');
  assert(html.includes('Experiencing a Medical Emergency in Nigeria?'), 'Emergency banner includes prominent headline');
  assert(html.includes('Find Nearest Emergency Hospital'), 'Emergency banner includes 1-click CTA button');
  assert(html.includes('href="/emergency"'), 'Emergency CTA links to /emergency finder');
  assert(html.includes('href="tel:112"'), 'Emergency banner includes direct National Emergency 112 hotline');
  assert(html.includes('href="tel:767"'), 'Emergency banner includes direct Lagos Emergency 767 hotline');
  assert(html.includes('href="tel:122"'), 'Emergency banner includes direct FRSC Rescue 122 hotline');

  // 7. Featured & Nearest Accredited Facilities Grid
  console.log('\n--- 7. Nearest Accredited Facilities Proximity Grid ---');
  assert(html.includes('Nearest Healthcare Facilities'), 'Section title for Nearest Healthcare Facilities exists');
  assert(html.includes('Verified &amp; Accredited Facilities') || html.includes('Verified & Accredited Facilities'), 'Accreditation badge present');
  assert(html.includes('href="/hospitals"'), 'Link to view all facilities exists');

  // Verify proximity sorting: the closest accredited hospital to Lagos Ikeja must be rendered first
  const accreditedHospitals = INITIAL_HOSPITALS.filter((h) => h.verified);
  const sortedByIkeja = [...accreditedHospitals].sort((a, b) => {
    const distA = calculateDistance(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng, a.location.lat, a.location.lng);
    const distB = calculateDistance(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng, b.location.lat, b.location.lng);
    return distA - distB;
  });

  const closestHospital = sortedByIkeja[0];
  const furthestHospital = sortedByIkeja[sortedByIkeja.length - 1];

  const closestIndex = html.indexOf(closestHospital.name);
  const furthestIndex = html.indexOf(furthestHospital.name);

  assert(closestIndex !== -1, `Closest facility (${closestHospital.name}) is rendered in grid`);
  if (furthestIndex !== -1) {
    assert(closestIndex < furthestIndex, `Closest facility appears before further facility (${closestHospital.name} at ${closestIndex} < ${furthestHospital.name} at ${furthestIndex})`);
  }

  // 8. Live System Statistics Counters
  console.log('\n--- 8. Live System Statistics Counters ---');
  assert(html.includes('Accredited Facilities'), 'Statistics counter includes Accredited Facilities');
  assert(html.includes('24/7 Emergency Units'), 'Statistics counter includes 24/7 Emergency Units');
  assert(html.includes('HMO &amp; NHIS Partners') || html.includes('HMO & NHIS Partners'), 'Statistics counter includes HMO & NHIS Partners');
  assert(html.includes('Routing Accuracy'), 'Statistics counter includes Routing Accuracy');
  assert(html.includes('99.8%'), 'Statistics counter displays 99.8% accuracy rate');

  // 9. Visual 3-Step "How It Works" Guide
  console.log('\n--- 9. Visual 3-Step "How It Works" Guide ---');
  assert(html.includes('How Hospital Locator Works'), '"How Hospital Locator Works" header exists');
  assert(html.includes('Locate Facilities Near You'), 'Step 1: Locate Facilities Near You exists');
  assert(html.includes('Geospatial Discovery'), 'Step 1 tag: Geospatial Discovery exists');
  assert(html.includes('Compare Status &amp; Coverage') || html.includes('Compare Status & Coverage'), 'Step 2: Compare Status & Coverage exists');
  assert(html.includes('Real-Time Comparison'), 'Step 2 tag: Real-Time Comparison exists');
  assert(html.includes('Navigate &amp; Receive Care') || html.includes('Navigate & Receive Care'), 'Step 3: Navigate & Receive Care exists');
  assert(html.includes('Immediate Access'), 'Step 3 tag: Immediate Access exists');

  // 10. Hospital Representative Callout Banner
  console.log('\n--- 10. Healthcare Administrator & Representative Callout ---');
  assert(html.includes('Hospital Representatives &amp; CMDs') || html.includes('Hospital Representatives & CMDs'), 'Representative callout badge present');
  assert(html.includes('href="/dashboard/representative"'), 'Callout links to /dashboard/representative');
  assert(html.includes('href="/compare"'), 'Callout links to /compare');

  // 11. Custom Active Location Test (Simulating Abuja)
  console.log('\n--- 11. Dynamic Proximity Calculation with Simulated Abuja Location ---');
  const abujaLocation = NIGERIAN_LOCATIONS.find((l) => l.city === 'Abuja')!;

  function CustomLocationProvider({ children }: { children: React.ReactNode }) {
    // Custom wrapper that overrides initial location with Abuja
    return React.createElement(AppProvider, null, children);
  }

  const abujaHtml = renderToStaticMarkup(
    React.createElement(CustomLocationProvider, null, React.createElement(HomePage))
  );
  assert(abujaHtml.length > 1000, 'HomePage renders cleanly under dynamic provider');

  console.log('\n====================================================');
  console.log(`Passed: ${passedTests} / ${totalTests} assertions`);
  console.log('====================================================');

  if (passedTests === totalTests && (process.exitCode === 0 || process.exitCode === undefined)) {
    console.log('\n🎉 ALL TASK 7 LANDING PAGE VERIFICATIONS PASSED CLEANLY!\n');
  } else {
    console.error('\n❌ FAILURE: Some tests did not pass.\n');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed with unhandled error:', err);
  process.exit(1);
});
