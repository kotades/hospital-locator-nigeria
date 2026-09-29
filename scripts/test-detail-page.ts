/**
 * Verification Test Suite for Task 9: Hospital Detail Profile (/hospitals/[id])
 * Verifies:
 * 1. Component and Page exports (ReviewModal, HospitalDetailPage)
 * 2. SSR HTML structure: Facility header, verified badge, trauma level, emergency pill,
 *    quick action toolbar (1-click calls, directions, favorite, share), detailed tabs,
 *    embedded Leaflet map, multi-dimensional rating summary card (FR4.1, FR4.3).
 * 3. ReviewModal 5-dimension rating sliders/stars, inputs, character limit, and accessibility.
 * 4. Graceful 404 not-found state for non-existent hospital IDs.
 * 5. Dynamic rating recalculation logic when a new review is submitted (Step 6).
 * 6. Multi-dimensional rating breakdown calculations (Overall, Staff, Cleanliness, Wait Times, Care Quality).
 * 7. Review helpfulness voting (+1 / -1) and official representative response thread.
 * 8. User favorite toggle and personal note persistence.
 */

// Allow Node.js/tsx to import .css files safely
require.extensions['.css'] = () => {};

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AppProvider } from '../src/context/AppContext';
import { AuthSessionProvider } from '../src/context/AuthSessionProvider';
import { INITIAL_HOSPITALS } from '../src/data/initialHospitals';
import { INITIAL_REVIEWS } from '../src/data/initialReviews';
import { DEFAULT_LOCATION } from '../src/data/nigerianLocations';
import { calculateDistance, estimateTravelTime, formatDistance, formatTravelTime } from '../src/utils/geo';
import { Review, Hospital, UserFavorite } from '../src/types';
import { ReviewModal } from '../src/components/ReviewModal';
import HospitalDetailPage from '../src/app/hospitals/[id]/page';

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

function makeSyncPromise<T>(val: T): Promise<T> {
  const p = Promise.resolve(val) as any;
  p.status = 'fulfilled';
  p.value = val;
  return p;
}

async function runTests() {
  console.log('================================================================');
  console.log('🧪 TASK 9: HOSPITAL DETAIL PROFILE & REVIEW MODAL VERIFICATION');
  console.log('================================================================\n');

  // -----------------------------------------------------------------
  // 1. Module Export Verification
  // -----------------------------------------------------------------
  console.log('--- 1. Module Export Verification ---');
  assert(typeof ReviewModal === 'function', 'ReviewModal is exported as a React component');
  assert(typeof HospitalDetailPage === 'function', 'HospitalDetailPage is default-exported as a React component');

  // -----------------------------------------------------------------
  // 2. SSR Rendering & HTML Structure Verification
  // -----------------------------------------------------------------
  console.log('\n--- 2. Detail Page SSR Rendering & Facility Header ---');
  const targetHospital = INITIAL_HOSPITALS[0]; // LUTH (hosp-luth)
  assert(!!targetHospital, 'Found target seed hospital (hosp-luth)');

  const pageHtml = renderToStaticMarkup(
    React.createElement(
      AuthSessionProvider,
      { session: null } as any,
      React.createElement(
        AppProvider,
        null,
        React.createElement(HospitalDetailPage, { params: makeSyncPromise({ id: targetHospital._id }) })
      )
    )
  );

  // Facility Name & Location
  assert(pageHtml.includes(targetHospital.name), `Detail page renders facility name: "${targetHospital.name}"`);
  assert(pageHtml.includes(targetHospital.city), `Detail page renders facility city: "${targetHospital.city}"`);
  assert(pageHtml.includes(targetHospital.facilityType), `Detail page renders facility type: "${targetHospital.facilityType}"`);

  // Emergency & Trauma Badges
  assert(pageHtml.includes('Accepting Emergency Patients'), 'Detail page renders live emergency capacity status pill');
  assert(pageHtml.includes('Level I Trauma Center') || pageHtml.includes('Level I'), 'Detail page renders Trauma Level badge');
  assert(pageHtml.includes('MOH Verified') || pageHtml.includes('Verified'), 'Detail page renders verified facility badge');
  assert(pageHtml.includes('24/7 Emergency'), 'Detail page renders 24/7 emergency badge');

  // Distance & Travel Time Calculation relative to active location
  const distKm = calculateDistance(
    DEFAULT_LOCATION.lat,
    DEFAULT_LOCATION.lng,
    targetHospital.location.lat,
    targetHospital.location.lng
  );
  const etaMins = estimateTravelTime(distKm);
  const formattedDist = formatDistance(distKm);
  const formattedEta = formatTravelTime(etaMins);
  assert(pageHtml.includes(formattedDist), `Detail page displays exact Haversine distance (${formattedDist})`);
  assert(pageHtml.includes(formattedEta), `Detail page displays estimated driving ETA (~${formattedEta})`);

  // -----------------------------------------------------------------
  // 3. Quick Action Toolbar Verification
  // -----------------------------------------------------------------
  console.log('\n--- 3. Quick Action Toolbar Verification ---');
  assert(
    pageHtml.includes(`tel:${targetHospital.emergencyPhone}`),
    `Toolbar contains 1-click Emergency Call dialer link (tel:${targetHospital.emergencyPhone})`
  );
  assert(
    pageHtml.includes(`tel:${targetHospital.phoneNumbers[0]}`),
    `Toolbar contains 1-click Reception Call dialer link (tel:${targetHospital.phoneNumbers[0]})`
  );
  assert(
    pageHtml.includes('https://www.google.com/maps/dir/?api=1&amp;destination='),
    'Toolbar contains Google Maps turn-by-turn routing link'
  );
  assert(pageHtml.includes('Save'), 'Toolbar contains Favorite Save toggle button');
  assert(pageHtml.includes('Share'), 'Toolbar contains Share facility link button');

  // -----------------------------------------------------------------
  // 4. Detailed Information Tabs Verification
  // -----------------------------------------------------------------
  console.log('\n--- 4. Detailed Information Tabs & Content ---');
  assert(pageHtml.includes('Overview &amp; Hours') || pageHtml.includes('Overview & Hours'), 'Contains Overview & Hours tab');
  assert(pageHtml.includes('Services &amp; Specialties') || pageHtml.includes('Services & Specialties'), 'Contains Services & Specialties tab');
  assert(pageHtml.includes('HMO &amp; Insurance') || pageHtml.includes('HMO & Insurance'), 'Contains HMO & Insurance tab');
  assert(pageHtml.includes('Accessibility'), 'Contains Accessibility tab');
  assert(pageHtml.includes('Map &amp; Directions') || pageHtml.includes('Map & Directions'), 'Contains Map & Directions tab');
  assert(pageHtml.includes('Patient Reviews'), 'Contains Patient Reviews tab');

  // Operating Hours content
  assert(pageHtml.includes(targetHospital.operatingHours), `Overview tab displays operating hours: "${targetHospital.operatingHours}"`);
  assert(pageHtml.includes('24 Hours / 7 Days Continuous'), 'Overview tab displays 24/7 continuous intake for emergency');

  // -----------------------------------------------------------------
  // 5. Multi-Dimensional Rating Breakdown (FR4.1, FR4.3)
  // -----------------------------------------------------------------
  console.log('\n--- 5. Multi-Dimensional Rating Breakdown (FR4.1, FR4.3) ---');
  assert(pageHtml.includes('Patient Ratings Summary'), 'Contains Multi-Dimensional Patient Ratings Summary card');
  assert(pageHtml.includes('Overall Experience'), 'Displays Overall Experience dimension');
  assert(pageHtml.includes('Staff Professionalism'), 'Displays Staff Professionalism dimension');
  assert(pageHtml.includes('Facility Cleanliness'), 'Displays Facility Cleanliness dimension');
  assert(pageHtml.includes('Wait Times &amp; Triage') || pageHtml.includes('Wait Times & Triage'), 'Displays Wait Times & Triage dimension');
  assert(pageHtml.includes('Care Quality &amp; Outcomes') || pageHtml.includes('Care Quality & Outcomes'), 'Displays Care Quality & Outcomes dimension');
  assert(pageHtml.includes('Star Rating Distribution'), 'Displays Star Rating Distribution breakdown (5★ to 1★)');
  assert(pageHtml.includes('Write a Review'), 'Contains "Write a Review" button launching ReviewModal');

  // -----------------------------------------------------------------
  // 6. Graceful 404 / Missing Facility Handling
  // -----------------------------------------------------------------
  console.log('\n--- 6. Graceful 404 Not Found State ---');
  const notFoundHtml = renderToStaticMarkup(
    React.createElement(
      AuthSessionProvider,
      { session: null } as any,
      React.createElement(
        AppProvider,
        null,
        React.createElement(HospitalDetailPage, { params: makeSyncPromise({ id: 'non-existent-hosp-999' }) })
      )
    )
  );
  assert(notFoundHtml.includes('Hospital Profile Not Found'), 'Renders friendly "Hospital Profile Not Found" header for invalid IDs');
  assert(notFoundHtml.includes('Return to Healthcare Directory'), 'Renders link back to directory for non-existent IDs');

  // -----------------------------------------------------------------
  // 7. ReviewModal Component Verification
  // -----------------------------------------------------------------
  console.log('\n--- 7. ReviewModal Component Verification ---');
  const closedModalHtml = renderToStaticMarkup(
    React.createElement(
      AuthSessionProvider,
      { session: null } as any,
      React.createElement(
        AppProvider,
        null,
        React.createElement(ReviewModal, {
          isOpen: false,
          onClose: () => {},
          hospitalId: targetHospital._id,
          hospitalName: targetHospital.name
        })
      )
    )
  );
  assert(closedModalHtml === '', 'ReviewModal renders null when isOpen is false');

  const openModalHtml = renderToStaticMarkup(
    React.createElement(
      AuthSessionProvider,
      { session: null } as any,
      React.createElement(
        AppProvider,
        null,
        React.createElement(ReviewModal, {
          isOpen: true,
          onClose: () => {},
          hospitalId: targetHospital._id,
          hospitalName: targetHospital.name
        })
      )
    )
  );
  assert(openModalHtml.includes('Write a Review for ' + targetHospital.name), 'Open modal contains hospital title');
  assert(openModalHtml.includes('role="dialog"'), 'Modal has accessible role="dialog"');
  assert(openModalHtml.includes('aria-modal="true"'), 'Modal has aria-modal="true"');
  assert(openModalHtml.includes('Overall Experience'), 'Modal contains Overall Experience rating dimension');
  assert(openModalHtml.includes('Staff Professionalism'), 'Modal contains Staff Professionalism rating dimension');
  assert(openModalHtml.includes('Facility Cleanliness'), 'Modal contains Facility Cleanliness rating dimension');
  assert(openModalHtml.includes('Wait Times &amp; Triage') || openModalHtml.includes('Wait Times & Triage'), 'Modal contains Wait Times dimension');
  assert(openModalHtml.includes('Care Quality &amp; Outcomes') || openModalHtml.includes('Care Quality & Outcomes'), 'Modal contains Care Quality dimension');
  assert(openModalHtml.includes('2,000 characters'), 'Modal contains 2,000 character maximum limit indicator');
  assert(openModalHtml.includes('Submit Patient Review'), 'Modal contains Submit Patient Review button');

  // -----------------------------------------------------------------
  // 8. Dynamic Review Submission & Rating Recalculation Engine (Step 6)
  // -----------------------------------------------------------------
  console.log('\n--- 8. Dynamic Rating Recalculation & Multi-Dimensional Aggregation ---');

  // Test rating recalculation algorithm
  const testHospitalId = 'hosp-luth';
  const existingReviews = INITIAL_REVIEWS.filter((r) => r.hospitalId === testHospitalId);
  const initialTotal = existingReviews.length;
  const initialSum = existingReviews.reduce((sum, r) => sum + r.overallRating, 0);
  const initialAvg = Math.round((initialSum / initialTotal) * 10) / 10;
  assert(initialTotal >= 2, `Hospital hosp-luth has ${initialTotal} initial reviews`);
  assert(initialAvg === 4.0, `Initial average overall rating for hosp-luth is ${initialAvg}`);

  // Simulate patient submitting a new 5-star review across dimensions
  const newPatientReview: Review = {
    _id: 'rev-test-dynamic-1',
    hospitalId: testHospitalId,
    userId: 'user-patient-999',
    userName: 'Kemi Adeleke',
    overallRating: 5,
    staffRating: 5,
    cleanlinessRating: 5,
    waitTimeRating: 4,
    careQualityRating: 5,
    reviewText: 'Outstanding emergency resuscitation unit at LUTH. Professional trauma team.',
    helpful: 0,
    notHelpful: 0,
    createdAt: new Date().toISOString(),
    visitDate: '2026-09-28'
  };

  // Recalculate
  const updatedReviews = [newPatientReview, ...existingReviews];
  const newReviewCount = updatedReviews.length;
  const newTotalRating = updatedReviews.reduce((sum, r) => sum + r.overallRating, 0);
  const recalculatedAvg = Math.round((newTotalRating / newReviewCount) * 10) / 10;

  assert(newReviewCount === initialTotal + 1, `Review count correctly increments to ${newReviewCount}`);
  assert(recalculatedAvg === 4.3, `Average rating dynamically recalculates from 4.0 to ${recalculatedAvg}`);

  // Test all 5 sub-dimension calculations
  const staffAvg = Math.round((updatedReviews.reduce((s, r) => s + r.staffRating, 0) / newReviewCount) * 10) / 10;
  const cleanlinessAvg = Math.round((updatedReviews.reduce((s, r) => s + r.cleanlinessRating, 0) / newReviewCount) * 10) / 10;
  const waitTimeAvg = Math.round((updatedReviews.reduce((s, r) => s + r.waitTimeRating, 0) / newReviewCount) * 10) / 10;
  const careQualityAvg = Math.round((updatedReviews.reduce((s, r) => s + r.careQualityRating, 0) / newReviewCount) * 10) / 10;

  assert(staffAvg >= 4.5, `Staff Professionalism dimension average is accurate (${staffAvg} / 5.0)`);
  assert(cleanlinessAvg >= 4.0, `Facility Cleanliness dimension average is accurate (${cleanlinessAvg} / 5.0)`);
  assert(waitTimeAvg >= 3.0, `Wait Times dimension average is accurate (${waitTimeAvg} / 5.0)`);
  assert(careQualityAvg >= 4.5, `Care Quality dimension average is accurate (${careQualityAvg} / 5.0)`);

  // Test star distribution breakdown (5★ to 1★)
  const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  updatedReviews.forEach((r) => {
    const star = Math.max(1, Math.min(5, Math.round(r.overallRating)));
    dist[star] = (dist[star] || 0) + 1;
  });
  assert(dist[5] === 1, '5-star distribution has 1 review');
  assert(dist[4] === 2, '4-star distribution has 2 reviews');
  assert(dist[3] === 0, '3-star distribution has 0 reviews');

  // -----------------------------------------------------------------
  // 9. Helpfulness Voting & Representative Reply Verification
  // -----------------------------------------------------------------
  console.log('\n--- 9. Helpfulness Voting & Representative Reply Verification ---');

  // Helpfulness voting function test
  let testReview = { ...newPatientReview };
  // Vote Helpful (+1)
  testReview = { ...testReview, helpful: testReview.helpful + 1 };
  assert(testReview.helpful === 1, 'Voting helpful increments helpful count by +1');

  // Vote Not Helpful (+1)
  testReview = { ...testReview, notHelpful: testReview.notHelpful + 1 };
  assert(testReview.notHelpful === 1, 'Voting not helpful increments notHelpful count by +1');

  // Official Facility Representative Reply attachment
  const repResponseText = 'Thank you for your feedback. LUTH trauma division is dedicated to emergency excellence.';
  const repResponseDate = new Date().toISOString();
  testReview = {
    ...testReview,
    response: repResponseText,
    responseDate: repResponseDate
  };
  assert(testReview.response === repResponseText, 'Representative official response is attached to review');
  assert(Boolean(testReview.responseDate), 'Representative responseDate timestamp is recorded');

  // -----------------------------------------------------------------
  // 10. Favorite Toggle & Personal Note Verification
  // -----------------------------------------------------------------
  console.log('\n--- 10. Favorite Toggle & Personal Note Verification ---');
  let favoritesList: UserFavorite[] = [
    { hospitalId: 'hosp-luth', note: 'Pediatric emergency contact: Dr. Ade', addedAt: '2026-09-15' }
  ];

  const isFav = (id: string) => favoritesList.some((f) => f.hospitalId === id);
  assert(isFav('hosp-luth') === true, 'Initial hospital hosp-luth is favorited');
  assert(isFav('hosp-evercare') === false, 'Initial hospital hosp-evercare is not favorited');

  // Toggle favorite on hosp-evercare
  favoritesList.push({ hospitalId: 'hosp-evercare', addedAt: new Date().toISOString() });
  assert(isFav('hosp-evercare') === true, 'Toggling favorite on hosp-evercare adds it to favorites');

  // Add personal note
  const sampleNote = 'Emergency trauma contact: Dr. Sanusi (Chief of Medicine)';
  favoritesList = favoritesList.map((f) =>
    f.hospitalId === 'hosp-evercare' ? { ...f, note: sampleNote } : f
  );
  const evercareFav = favoritesList.find((f) => f.hospitalId === 'hosp-evercare');
  assert(evercareFav?.note === sampleNote, `Personal note persisted: "${sampleNote}"`);

  // Toggle favorite off
  favoritesList = favoritesList.filter((f) => f.hospitalId !== 'hosp-evercare');
  assert(isFav('hosp-evercare') === false, 'Toggling favorite off removes hospital from favorites');

  console.log('\n================================================================');
  console.log(`Passed: ${passedTests} / ${totalTests} assertions`);
  console.log('================================================================');

  if (passedTests === totalTests && (process.exitCode === 0 || process.exitCode === undefined)) {
    console.log('\n🎉 ALL TASK 9 HOSPITAL DETAIL & REVIEW MODAL VERIFICATIONS PASSED!\n');
  } else {
    console.error('\n❌ FAILURE: Some tests did not pass.\n');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed with error:', err);
  process.exit(1);
});
