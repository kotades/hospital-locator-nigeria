/**
 * Seed Data Validation Script for Hospital Locator System (Nigeria)
 * Validates domain constraints, Nigerian geospatial coordinate bounds,
 * ERD completeness, and multi-dimensional review integrity.
 */

import { INITIAL_HOSPITALS } from '../src/data/initialHospitals';
import { INITIAL_REVIEWS } from '../src/data/initialReviews';
import { NIGERIAN_LOCATIONS, DEFAULT_LOCATION } from '../src/data/nigerianLocations';
import { EmergencyStatus, TraumaLevel } from '../src/types';

interface ValidationError {
  entity: string;
  id: string;
  field: string;
  message: string;
}

const errors: ValidationError[] = [];

function assert(condition: boolean, entity: string, id: string, field: string, message: string) {
  if (!condition) {
    errors.push({ entity, id, field, message });
  }
}

console.log('--- Starting Seed Data Validation ---');

// 1. Validate Nigerian Preset Locations
console.log(`Checking ${NIGERIAN_LOCATIONS.length} Nigerian geospatial presets...`);
assert(NIGERIAN_LOCATIONS.length >= 6, 'PresetLocations', 'all', 'length', 'Must have at least 6 presets');
assert(Boolean(DEFAULT_LOCATION), 'PresetLocations', 'default', 'DEFAULT_LOCATION', 'Must define DEFAULT_LOCATION');

const requiredLocationIds = [
  'lagos-ikeja',
  'lagos-vi',
  'abuja-central',
  'ibadan-ui',
  'portharcourt-gra',
  'kano-city'
];

requiredLocationIds.forEach((reqId) => {
  const loc = NIGERIAN_LOCATIONS.find((l) => l.id === reqId);
  assert(Boolean(loc), 'PresetLocations', reqId, 'id', `Required preset ${reqId} not found`);
  if (loc) {
    // Nigerian geographical bounding box: Lat 4°N to 14°N, Lng 2.5°E to 15°E
    assert(
      loc.lat >= 4.0 && loc.lat <= 14.0,
      'PresetLocations',
      reqId,
      'lat',
      `Latitude ${loc.lat} outside Nigerian bounds [4.0, 14.0]`
    );
    assert(
      loc.lng >= 2.5 && loc.lng <= 15.0,
      'PresetLocations',
      reqId,
      'lng',
      `Longitude ${loc.lng} outside Nigerian bounds [2.5, 15.0]`
    );
    assert(Boolean(loc.name), 'PresetLocations', reqId, 'name', 'Location name is required');
    assert(Boolean(loc.city), 'PresetLocations', reqId, 'city', 'City is required');
    assert(Boolean(loc.state), 'PresetLocations', reqId, 'state', 'State is required');
  }
});

// 2. Validate Hospitals
console.log(`Checking ${INITIAL_HOSPITALS.length} Nigerian Hospitals...`);
assert(INITIAL_HOSPITALS.length >= 15, 'Hospitals', 'all', 'length', `Expected >= 15 hospitals, found ${INITIAL_HOSPITALS.length}`);

const validEmergencyStatuses: EmergencyStatus[] = ['accepting', 'limited', 'critical'];
const validTraumaLevels: TraumaLevel[] = ['Level I', 'Level II', 'Level III', 'None'];

const requiredHospitalNames = [
  'Lagos University Teaching Hospital (LUTH)',
  'Lagos State University Teaching Hospital (LASUTH)',
  'National Hospital, Abuja',
  'University College Hospital (UCH), Ibadan',
  'Reddington Hospital, Victoria Island',
  'Lagoon Hospitals, Ikoyi',
  'Evercare Hospital, Lekki',
  'First Cardiology Consultants',
  'Federal Medical Centre (FMC), Ebute Metta',
  'University of Port Harcourt Teaching Hospital (UPTH)',
  'Garki Hospital, Abuja',
  'Vedic Lifecare Hospital, Lekki',
  'St. Nicholas Hospital, Lagos Island',
  'Aminu Kano Teaching Hospital (AKTH)',
  'Mother and Child Hospital, Ikeja'
];

requiredHospitalNames.forEach((reqName) => {
  const exists = INITIAL_HOSPITALS.some((h) => h.name.includes(reqName.split(' ')[0]));
  assert(exists, 'Hospitals', reqName, 'name', `Required hospital ${reqName} not found in dataset`);
});

const hospitalIds = new Set<string>();

INITIAL_HOSPITALS.forEach((h) => {
  assert(!hospitalIds.has(h._id), 'Hospital', h._id, '_id', `Duplicate hospital ID ${h._id}`);
  hospitalIds.add(h._id);

  assert(Boolean(h.name), 'Hospital', h._id, 'name', 'Hospital name is required');
  assert(Boolean(h.address), 'Hospital', h._id, 'address', 'Address is required');
  assert(Boolean(h.city), 'Hospital', h._id, 'city', 'City is required');
  assert(Boolean(h.state), 'Hospital', h._id, 'state', 'State is required');

  // Coordinates validation
  assert(Boolean(h.location), 'Hospital', h._id, 'location', 'Location coordinates are required');
  if (h.location) {
    assert(
      h.location.lat >= 4.0 && h.location.lat <= 14.0,
      'Hospital',
      h._id,
      'location.lat',
      `Latitude ${h.location.lat} outside Nigerian bounds [4.0, 14.0]`
    );
    assert(
      h.location.lng >= 2.5 && h.location.lng <= 15.0,
      'Hospital',
      h._id,
      'location.lng',
      `Longitude ${h.location.lng} outside Nigerian bounds [2.5, 15.0]`
    );
  }

  // Emergency & Trauma validation
  assert(typeof h.emergency24Hours === 'boolean', 'Hospital', h._id, 'emergency24Hours', 'emergency24Hours must be boolean');
  assert(
    validEmergencyStatuses.includes(h.emergencyStatus),
    'Hospital',
    h._id,
    'emergencyStatus',
    `Invalid emergencyStatus: ${h.emergencyStatus}`
  );
  assert(
    validTraumaLevels.includes(h.traumaLevel),
    'Hospital',
    h._id,
    'traumaLevel',
    `Invalid traumaLevel: ${h.traumaLevel}`
  );

  // Contacts
  assert(Array.isArray(h.phoneNumbers) && h.phoneNumbers.length > 0, 'Hospital', h._id, 'phoneNumbers', 'Must have >= 1 phone number');
  assert(Boolean(h.emergencyPhone), 'Hospital', h._id, 'emergencyPhone', 'Emergency phone is required');
  assert(Boolean(h.email), 'Hospital', h._id, 'email', 'Email is required');
  assert(Boolean(h.website), 'Hospital', h._id, 'website', 'Website is required');

  // Services, Specialties, HMOs
  assert(Array.isArray(h.services) && h.services.length > 0, 'Hospital', h._id, 'services', 'Must have >= 1 service');
  assert(Array.isArray(h.specialties) && h.specialties.length > 0, 'Hospital', h._id, 'specialties', 'Must have >= 1 specialty');
  assert(Array.isArray(h.insuranceAccepted) && h.insuranceAccepted.length > 0, 'Hospital', h._id, 'insuranceAccepted', 'Must have >= 1 accepted HMO/insurance');
  assert(Array.isArray(h.images) && h.images.length > 0, 'Hospital', h._id, 'images', 'Must have >= 1 image');

  // Accessibility
  assert(Boolean(h.accessibility), 'Hospital', h._id, 'accessibility', 'Accessibility object is required');
  if (h.accessibility) {
    assert(typeof h.accessibility.wheelchair === 'boolean', 'Hospital', h._id, 'accessibility.wheelchair', 'wheelchair must be boolean');
    assert(typeof h.accessibility.parking === 'boolean', 'Hospital', h._id, 'accessibility.parking', 'parking must be boolean');
    assert(typeof h.accessibility.ambulanceBay === 'boolean', 'Hospital', h._id, 'accessibility.ambulanceBay', 'ambulanceBay must be boolean');
  }

  // Ratings
  assert(h.averageRating >= 1.0 && h.averageRating <= 5.0, 'Hospital', h._id, 'averageRating', 'averageRating must be 1.0 to 5.0');
  assert(h.totalReviews >= 0, 'Hospital', h._id, 'totalReviews', 'totalReviews must be >= 0');
});

// 3. Validate Reviews
console.log(`Checking ${INITIAL_REVIEWS.length} Initial Reviews...`);
assert(INITIAL_REVIEWS.length >= 10, 'Reviews', 'all', 'length', `Expected >= 10 reviews, found ${INITIAL_REVIEWS.length}`);

let responseCount = 0;
const reviewIds = new Set<string>();

INITIAL_REVIEWS.forEach((r) => {
  assert(!reviewIds.has(r._id), 'Review', r._id, '_id', `Duplicate review ID ${r._id}`);
  reviewIds.add(r._id);

  assert(hospitalIds.has(r.hospitalId), 'Review', r._id, 'hospitalId', `Referenced hospital ${r.hospitalId} does not exist`);
  assert(Boolean(r.userId), 'Review', r._id, 'userId', 'userId is required');
  assert(Boolean(r.userName), 'Review', r._id, 'userName', 'userName is required');
  assert(Boolean(r.reviewText), 'Review', r._id, 'reviewText', 'reviewText is required');

  // 5 Sub-ratings validation
  const ratings = [
    { name: 'overallRating', value: r.overallRating },
    { name: 'staffRating', value: r.staffRating },
    { name: 'cleanlinessRating', value: r.cleanlinessRating },
    { name: 'waitTimeRating', value: r.waitTimeRating },
    { name: 'careQualityRating', value: r.careQualityRating }
  ];

  ratings.forEach(({ name, value }) => {
    assert(
      typeof value === 'number' && value >= 1 && value <= 5 && Number.isInteger(value),
      'Review',
      r._id,
      name,
      `${name} must be an integer between 1 and 5 (got ${value})`
    );
  });

  assert(typeof r.helpful === 'number' && r.helpful >= 0, 'Review', r._id, 'helpful', 'helpful must be >= 0');
  assert(typeof r.notHelpful === 'number' && r.notHelpful >= 0, 'Review', r._id, 'notHelpful', 'notHelpful must be >= 0');
  assert(Boolean(r.createdAt), 'Review', r._id, 'createdAt', 'createdAt timestamp is required');

  if (r.response) {
    responseCount++;
    assert(Boolean(r.responseDate), 'Review', r._id, 'responseDate', 'responseDate is required when response is provided');
  }
});

assert(responseCount > 0, 'Reviews', 'all', 'response', `Expected at least some reviews to have facility responses (got ${responseCount})`);

// Report Results
console.log('\n--- Validation Summary ---');
console.log(`Nigerian Presets: ${NIGERIAN_LOCATIONS.length} verified.`);
console.log(`Hospitals: ${INITIAL_HOSPITALS.length} verified.`);
console.log(`Reviews: ${INITIAL_REVIEWS.length} verified (${responseCount} with official facility representative responses).`);

if (errors.length > 0) {
  console.error(`\nFAILED: Found ${errors.length} validation errors:`);
  errors.forEach((err) => {
    console.error(`  - [${err.entity} / ${err.id}] ${err.field}: ${err.message}`);
  });
  process.exit(1);
} else {
  console.log('\nSUCCESS: All domain types, geospatial bounds, ERD schemas, and seed records passed validation cleanly!');
  process.exit(0);
}
