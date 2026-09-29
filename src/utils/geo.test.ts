import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDistance,
  estimateTravelTime,
  formatDistance,
  formatTravelTime,
  isWithinRadius
} from './geo';
import { NIGERIAN_LOCATIONS } from '../data/nigerianLocations';
import { INITIAL_HOSPITALS } from '../data/initialHospitals';

describe('Geolocation & Haversine Distance Engine', () => {
  const ikejaLocation = NIGERIAN_LOCATIONS.find((l) => l.id === 'lagos-ikeja')!;
  const luthHospital = INITIAL_HOSPITALS.find((h) => h._id === 'hosp-luth')!;

  it('calculates distance between Ikeja and LUTH (~9.3 km, within ~9-12 km range)', () => {
    assert.ok(ikejaLocation, 'Ikeja location should be defined in presets');
    assert.ok(luthHospital, 'LUTH hospital should be defined in seed data');

    const distance = calculateDistance(
      ikejaLocation.lat,
      ikejaLocation.lng,
      luthHospital.location.lat,
      luthHospital.location.lng
    );

    // Exact Haversine formula yields 9.3 km rounded to 1 decimal place
    assert.strictEqual(distance, 9.3);
    assert.ok(distance >= 9.0 && distance <= 12.0, 'Distance should be in the 9-12 km proximity envelope');
  });

  it('returns 0 for identical origin and destination coordinates', () => {
    const distance = calculateDistance(6.5186, 3.3553, 6.5186, 3.3553);
    assert.strictEqual(distance, 0);
  });

  it('computes accurate long-distance interstate measurement (Lagos Ikeja to Abuja Central)', () => {
    const abuja = NIGERIAN_LOCATIONS.find((l) => l.id === 'abuja-central')!;
    assert.ok(abuja, 'Abuja location should exist');

    const distance = calculateDistance(
      ikejaLocation.lat,
      ikejaLocation.lng,
      abuja.lat,
      abuja.lng
    );

    // Great circle distance between Ikeja and Central Abuja is approx 534 km
    assert.ok(distance >= 520 && distance <= 550, `Distance ${distance} km should be in [520, 550]`);
  });

  it('estimates urban driving travel time at 25 km/h realistically', () => {
    assert.strictEqual(estimateTravelTime(0), 0);
    // 9.3 km / 25 km/h * 60 = 22.32 mins -> 22 mins
    assert.strictEqual(estimateTravelTime(9.3), 22);
    // 25 km / 25 km/h * 60 = 60 mins
    assert.strictEqual(estimateTravelTime(25), 60);
    // 12.5 km / 25 km/h * 60 = 30 mins
    assert.strictEqual(estimateTravelTime(12.5), 30);
    // Very short non-zero distance should round up to at least 1 min
    assert.strictEqual(estimateTravelTime(0.2), 1);
  });

  it('allows custom average speed for emergency ambulance or expressways', () => {
    // 50 km at 50 km/h = 60 mins
    assert.strictEqual(estimateTravelTime(50, 50), 60);
    // 25 km at 50 km/h = 30 mins
    assert.strictEqual(estimateTravelTime(25, 50), 30);
  });

  it('formats distance into human-readable strings correctly', () => {
    assert.strictEqual(formatDistance(0), '0 km');
    assert.strictEqual(formatDistance(0.4), '400 m');
    assert.strictEqual(formatDistance(0.85), '850 m');
    assert.strictEqual(formatDistance(9.3), '9.3 km');
    assert.strictEqual(formatDistance(12), '12.0 km');
  });

  it('formats travel time durations into clear text', () => {
    assert.strictEqual(formatTravelTime(0), '0 mins');
    assert.strictEqual(formatTravelTime(0.5), '< 1 min');
    assert.strictEqual(formatTravelTime(22), '22 mins');
    assert.strictEqual(formatTravelTime(60), '1 hr');
    assert.strictEqual(formatTravelTime(75), '1 hr 15 mins');
    assert.strictEqual(formatTravelTime(120), '2 hrs');
    assert.strictEqual(formatTravelTime(135), '2 hrs 15 mins');
  });

  it('verifies radial distance boundary checks with isWithinRadius', () => {
    const isWithin10km = isWithinRadius(
      ikejaLocation.lat,
      ikejaLocation.lng,
      luthHospital.location.lat,
      luthHospital.location.lng,
      10.0
    );
    assert.strictEqual(isWithin10km, true, 'LUTH (9.3 km) must be within 10 km radius of Ikeja');

    const isWithin5km = isWithinRadius(
      ikejaLocation.lat,
      ikejaLocation.lng,
      luthHospital.location.lat,
      luthHospital.location.lng,
      5.0
    );
    assert.strictEqual(isWithin5km, false, 'LUTH (9.3 km) must NOT be within 5 km radius of Ikeja');
  });
});
