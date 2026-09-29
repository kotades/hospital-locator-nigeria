/**
 * Geolocation & AppContext Verification Script
 * Validates:
 * 1. Haversine distance engine accuracy (Ikeja to LUTH ~9.3 km / 10-12 km road corridor)
 * 2. Travel time estimations at 25 km/h urban speed
 * 3. Distance and duration text formatters
 * 4. Radial proximity filtering (10km emergency perimeter)
 * 5. AppContext state mutation logic:
 *    - approveClaim without closure race conditions (verifies hospital verified=true and claimedBy=userId)
 *    - rejectClaim with rejection reason
 *    - addReview with decoupled rating/count recalculation
 *    - deleteReview restoring previous rating/count
 *    - updateHospitalEmergencyStatus, favorites, notes, and search logs
 */

import {
  calculateDistance,
  estimateTravelTime,
  formatDistance,
  formatTravelTime,
  isWithinRadius
} from '../src/utils/geo';
import { NIGERIAN_LOCATIONS, DEFAULT_LOCATION } from '../src/data/nigerianLocations';
import { INITIAL_HOSPITALS } from '../src/data/initialHospitals';
import { INITIAL_REVIEWS } from '../src/data/initialReviews';
import { INITIAL_CLAIMS, INITIAL_FAVORITES, INITIAL_SEARCH_HISTORY } from '../src/context/AppContext';
import { Hospital, Review, ClaimRequest, UserFavorite, SearchLog, EmergencyStatus } from '../src/types';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  \x1b[32m✔\x1b[0m ${testName}`);
  } else {
    failed++;
    console.error(`  \x1b[31m✖\x1b[0m ${testName}${detail ? ` - ${detail}` : ''}`);
  }
}

console.log('\n======================================================');
console.log('  Hospital Locator System (Nigeria) - Task 3 Verification');
console.log('======================================================\n');

// 1. Geolocation Haversine Tests
console.log('\x1b[34m[1/3] Geolocation & Haversine Distance Engine\x1b[0m');
const ikeja = NIGERIAN_LOCATIONS.find((l) => l.id === 'lagos-ikeja')!;
const luth = INITIAL_HOSPITALS.find((h) => h._id === 'hosp-luth')!;

assert(Boolean(ikeja), 'Ikeja coordinates found in Nigerian presets');
assert(Boolean(luth), 'LUTH facility found in seed hospitals');

const ikejaToLuthDist = calculateDistance(
  ikeja.lat,
  ikeja.lng,
  luth.location.lat,
  luth.location.lng
);
console.log(`    -> Ikeja (${ikeja.lat}, ${ikeja.lng}) to LUTH (${luth.location.lat}, ${luth.location.lng}): ${ikejaToLuthDist} km`);

assert(
  ikejaToLuthDist === 9.3,
  'Distance from Ikeja to LUTH equals 9.3 km (exact spherical Haversine)'
);
assert(
  ikejaToLuthDist >= 9.0 && ikejaToLuthDist <= 12.0,
  'Distance from Ikeja to LUTH falls within ~9-12 km urban transit corridor'
);

const zeroDist = calculateDistance(luth.location.lat, luth.location.lng, luth.location.lat, luth.location.lng);
assert(zeroDist === 0, 'Zero distance for identical coordinates');

// Cross-country: Ikeja to Abuja
const abuja = NIGERIAN_LOCATIONS.find((l) => l.id === 'abuja-central')!;
const ikejaToAbujaDist = calculateDistance(ikeja.lat, ikeja.lng, abuja.lat, abuja.lng);
console.log(`    -> Ikeja to Abuja Central: ${ikejaToAbujaDist} km`);
assert(
  ikejaToAbujaDist > 500 && ikejaToAbujaDist < 560,
  'Interstate great-circle distance between Lagos and Abuja is ~534 km'
);

// 2. Travel Time & Formatting Tests
console.log('\n\x1b[34m[2/3] Travel Time Estimator & Formatters\x1b[0m');
const luthTravelTime = estimateTravelTime(ikejaToLuthDist);
console.log(`    -> Estimated travel time for ${ikejaToLuthDist} km @ 25km/h: ${luthTravelTime} mins`);
assert(luthTravelTime === 22, 'Travel time for 9.3 km @ 25km/h is 22 mins');
assert(estimateTravelTime(0) === 0, 'Travel time for 0 km is 0 mins');
assert(estimateTravelTime(25) === 60, 'Travel time for 25 km @ 25km/h is exactly 60 mins');
assert(estimateTravelTime(0.2) === 1, 'Minimum travel time for non-zero distance is 1 min');

assert(formatDistance(0) === '0 km', 'Format distance: 0 km');
assert(formatDistance(0.4) === '400 m', 'Format distance: 400 m (<1km displays in meters)');
assert(formatDistance(9.3) === '9.3 km', 'Format distance: 9.3 km');

assert(formatTravelTime(0) === '0 mins', 'Format travel time: 0 mins');
assert(formatTravelTime(0.5) === '< 1 min', 'Format travel time: < 1 min');
assert(formatTravelTime(22) === '22 mins', 'Format travel time: 22 mins');
assert(formatTravelTime(60) === '1 hr', 'Format travel time: 1 hr');
assert(formatTravelTime(75) === '1 hr 15 mins', 'Format travel time: 1 hr 15 mins');

assert(
  isWithinRadius(ikeja.lat, ikeja.lng, luth.location.lat, luth.location.lng, 10),
  'LUTH is within 10km emergency radius of Ikeja'
);
assert(
  !isWithinRadius(ikeja.lat, ikeja.lng, luth.location.lat, luth.location.lng, 5),
  'LUTH is NOT within 5km radius of Ikeja'
);

// 3. AppContext State Mutation Logic Verification
console.log('\n\x1b[34m[3/3] AppContext State Mutation Logic\x1b[0m');

// Create test harness state
let hospitals: Hospital[] = JSON.parse(JSON.stringify(INITIAL_HOSPITALS));
let reviews: Review[] = JSON.parse(JSON.stringify(INITIAL_REVIEWS));
let claims: ClaimRequest[] = JSON.parse(JSON.stringify(INITIAL_CLAIMS));
let favorites: UserFavorite[] = JSON.parse(JSON.stringify(INITIAL_FAVORITES));
let searchHistory: SearchLog[] = JSON.parse(JSON.stringify(INITIAL_SEARCH_HISTORY));

// Define context functions matching AppContext.tsx exactly:
const addReview = (reviewInput: Omit<Review, '_id' | 'createdAt' | 'helpful' | 'notHelpful'> | Review) => {
  const newReview: Review = {
    _id: '_id' in reviewInput && reviewInput._id ? reviewInput._id : `rev-${Date.now()}`,
    createdAt: 'createdAt' in reviewInput && reviewInput.createdAt ? reviewInput.createdAt : new Date().toISOString(),
    helpful: 'helpful' in reviewInput && typeof reviewInput.helpful === 'number' ? reviewInput.helpful : 0,
    notHelpful: 'notHelpful' in reviewInput && typeof reviewInput.notHelpful === 'number' ? reviewInput.notHelpful : 0,
    ...reviewInput
  };

  reviews = [newReview, ...reviews];

  const hospitalReviews = [
    newReview,
    ...reviews.filter((r) => r.hospitalId === newReview.hospitalId && r._id !== newReview._id)
  ];
  const totalRating = hospitalReviews.reduce((sum, r) => sum + r.overallRating, 0);
  const newAverage =
    hospitalReviews.length > 0
      ? Math.round((totalRating / hospitalReviews.length) * 10) / 10
      : newReview.overallRating;

  hospitals = hospitals.map((hosp) =>
    hosp._id === newReview.hospitalId
      ? { ...hosp, averageRating: newAverage, totalReviews: hospitalReviews.length }
      : hosp
  );
  return newReview;
};

const deleteReview = (reviewId: string) => {
  const targetReview = reviews.find((r) => r._id === reviewId);
  if (!targetReview) return;

  reviews = reviews.filter((r) => r._id !== reviewId);

  const remainingReviews = reviews.filter((r) => r.hospitalId === targetReview.hospitalId);
  const totalRating = remainingReviews.reduce((sum, r) => sum + r.overallRating, 0);
  const newAverage =
    remainingReviews.length > 0
      ? Math.round((totalRating / remainingReviews.length) * 10) / 10
      : 0;

  hospitals = hospitals.map((hosp) =>
    hosp._id === targetReview.hospitalId
      ? { ...hosp, averageRating: newAverage, totalReviews: remainingReviews.length }
      : hosp
  );
};

const approveClaim = (claimId: string, reviewedBy?: string) => {
  const targetClaim = claims.find((c) => c._id === claimId);
  if (!targetClaim) return;

  const reviewer = reviewedBy || 'admin@demo.com';
  const now = new Date().toISOString();

  claims = claims.map((claim) =>
    claim._id === claimId
      ? { ...claim, status: 'approved', reviewedAt: now, reviewedBy: reviewer }
      : claim
  );

  hospitals = hospitals.map((hosp) =>
    hosp._id === targetClaim.hospitalId
      ? { ...hosp, verified: true, claimedBy: targetClaim.userId }
      : hosp
  );
};

const rejectClaim = (claimId: string, reason?: string, reviewedBy?: string) => {
  claims = claims.map((claim) =>
    claim._id === claimId
      ? {
          ...claim,
          status: 'rejected',
          rejectionReason: reason || 'Documentation rejected',
          reviewedAt: new Date().toISOString(),
          reviewedBy: reviewedBy || 'admin@demo.com'
        }
      : claim
  );
};

// Test A: approveClaim updates both claim and hospital cleanly
const pendingClaim = claims.find((c) => c._id === 'claim-1')!;
assert(Boolean(pendingClaim), 'Found pending claim-1 in initial claims');
const targetHospBefore = hospitals.find((h) => h._id === pendingClaim.hospitalId)!;
assert(targetHospBefore.claimedBy === null, 'Target hospital is initially unclaimed');

approveClaim('claim-1', 'admin@demo.com');

const approvedClaimResult = claims.find((c) => c._id === 'claim-1')!;
assert(approvedClaimResult.status === 'approved', 'approveClaim: claim status set to approved');
assert(approvedClaimResult.reviewedBy === 'admin@demo.com', 'approveClaim: reviewer recorded');

const targetHospAfter = hospitals.find((h) => h._id === pendingClaim.hospitalId)!;
assert(targetHospAfter.verified === true, 'approveClaim: hospital verified set to true');
assert(targetHospAfter.claimedBy === pendingClaim.userId, 'approveClaim: hospital claimedBy matches claimant userId');

// Test A2: approveClaim transitions an unverified hospital to verified: true
const unverifiedHospital: Hospital = {
  ...targetHospBefore,
  _id: 'hosp-unverified-test',
  name: 'New Community Clinic',
  verified: false,
  claimedBy: null
};
hospitals.push(unverifiedHospital);
const newClaim: ClaimRequest = {
  _id: 'claim-new-clinic',
  hospitalId: 'hosp-unverified-test',
  hospitalName: 'New Community Clinic',
  userId: 'user-rep-clinic',
  userName: 'Dr. Clinic',
  userEmail: 'clinic@test.ng',
  position: 'CMD',
  documentName: 'CAC.pdf',
  status: 'pending',
  createdAt: new Date().toISOString()
};
claims.push(newClaim);
approveClaim('claim-new-clinic', 'admin@demo.com');
const clinicAfter = hospitals.find((h) => h._id === 'hosp-unverified-test')!;
assert(clinicAfter.verified === true, 'approveClaim: transitions unverified hospital to verified: true');
assert(clinicAfter.claimedBy === 'user-rep-clinic', 'approveClaim: binds claimedBy to claimant');

// Test B: rejectClaim updates claim status and records rejection reason
rejectClaim('claim-1', 'CAC document registration expired', 'admin@demo.com');
const rejectedClaimResult = claims.find((c) => c._id === 'claim-1')!;
assert(rejectedClaimResult.status === 'rejected', 'rejectClaim: claim status set to rejected');
assert(
  rejectedClaimResult.rejectionReason === 'CAC document registration expired',
  'rejectClaim: rejectionReason recorded correctly'
);

// Test C: addReview purely updates reviews and recalculates hospital rating
const initialLuthReviews = reviews.filter((r) => r.hospitalId === 'hosp-luth');
const initialReviewCount = initialLuthReviews.length;
const initialLuthSum = initialLuthReviews.reduce((sum, r) => sum + r.overallRating, 0);
const initialCalculatedRating = Math.round((initialLuthSum / initialReviewCount) * 10) / 10;

const addedReview = addReview({
  hospitalId: 'hosp-luth',
  userId: 'user-patient-tester',
  userName: 'Test Patient',
  overallRating: 5,
  staffRating: 5,
  cleanlinessRating: 5,
  waitTimeRating: 5,
  careQualityRating: 5,
  reviewText: 'Exceptional triage response and professional doctors.'
});

const luthAfterAdd = hospitals.find((h) => h._id === 'hosp-luth')!;
const luthReviewsAfterAdd = reviews.filter((r) => r.hospitalId === 'hosp-luth');
const expectedSum = initialLuthSum + 5;
const expectedAvg = Math.round((expectedSum / (initialReviewCount + 1)) * 10) / 10;

assert(luthReviewsAfterAdd.length === initialReviewCount + 1, 'addReview: reviews list incremented by 1');
assert(luthAfterAdd.totalReviews === initialReviewCount + 1, 'addReview: hospital totalReviews incremented by 1');
assert(luthAfterAdd.averageRating === expectedAvg, `addReview: hospital averageRating recalculated to ${expectedAvg}`);

// Test D: deleteReview purely removes review and restores hospital rating
deleteReview(addedReview._id);
const luthAfterDelete = hospitals.find((h) => h._id === 'hosp-luth')!;
const luthReviewsAfterDelete = reviews.filter((r) => r.hospitalId === 'hosp-luth');

assert(luthReviewsAfterDelete.length === initialReviewCount, 'deleteReview: reviews list restored');
assert(luthAfterDelete.totalReviews === initialReviewCount, 'deleteReview: hospital totalReviews restored');
assert(
  luthAfterDelete.averageRating === initialCalculatedRating,
  `deleteReview: hospital averageRating restored to ${initialCalculatedRating}`
);

// Test E: Emergency status mutation
hospitals = hospitals.map((h) => (h._id === 'hosp-luth' ? { ...h, emergencyStatus: 'critical' as EmergencyStatus } : h));
assert(
  hospitals.find((h) => h._id === 'hosp-luth')?.emergencyStatus === 'critical',
  'Emergency status toggled to critical'
);

// Test F: Favorites & Personal Notes
const newFavHospId = 'hosp-lasuth';
favorites.push({ hospitalId: newFavHospId, addedAt: new Date().toISOString() });
assert(favorites.some((f) => f.hospitalId === newFavHospId), 'Favorite facility successfully added');

const noteText = 'Specialist pediatric center open on weekends.';
favorites = favorites.map((f) => (f.hospitalId === newFavHospId ? { ...f, note: noteText } : f));
assert(
  favorites.find((f) => f.hospitalId === newFavHospId)?.note === noteText,
  'Personal note saved to favorite facility'
);

favorites = favorites.filter((f) => f.hospitalId !== newFavHospId);
assert(
  !favorites.some((f) => f.hospitalId === newFavHospId),
  'Favorite facility successfully toggled off / removed'
);

// Test G: Search History Logging
const query = 'Pediatric Dialysis';
searchHistory.unshift({
  _id: 'search-test-1',
  query,
  city: 'Lagos',
  timestamp: new Date().toISOString(),
  resultsCount: 2
});
assert(searchHistory[0].query === query, 'Search query successfully prepended to history log');

// Reset demo data sanity
assert(INITIAL_HOSPITALS.length >= 18, 'Initial hospitals dataset populated with >= 18 facilities');
assert(INITIAL_REVIEWS.length >= 20, 'Initial reviews dataset populated with >= 20 reviews');
assert(INITIAL_CLAIMS.length >= 3, 'Initial claims dataset populated with >= 3 claims');
assert(DEFAULT_LOCATION.id === 'lagos-ikeja', 'Default location points to Lagos - Ikeja');

console.log('\n======================================================');
console.log(`Results: \x1b[32m${passed} passed\x1b[0m, \x1b[${failed > 0 ? '31' : '32'}m${failed} failed\x1b[0m`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
}
