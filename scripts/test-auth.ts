/**
 * NextAuth Configuration & Role-Based Session Provider Verification Script
 * Validates CredentialsProvider demo authentication, JWT/Session callbacks,
 * route handlers, and AuthSessionProvider exports.
 */

import { authOptions, DEMO_USERS } from '../src/lib/auth';
import { GET, POST } from '../src/app/api/auth/[...nextauth]/route';
import { AuthSessionProvider } from '../src/context/AuthSessionProvider';
import { Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${testName}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${testName}${details ? ` -> ${details}` : ''}`);
  }
}

async function runTests() {
  console.log('--- Testing NextAuth.js Configuration & Role-Based Session Provider ---\n');

  // 1. Verify NextAuth Options Configuration
  console.log('1. NextAuth Options Configuration:');
  assert(authOptions.session?.strategy === 'jwt', 'Session strategy is JWT');
  assert(authOptions.pages?.signIn === '/login', 'Sign-in page points to /login');
  assert(Array.isArray(authOptions.providers) && authOptions.providers.length > 0, 'Providers array has credentials provider');
  assert(Boolean(authOptions.secret), 'Secret key is defined');

  const credentialsProvider = authOptions.providers.find(
    (p: any) => p.id === 'credentials'
  ) as any;
  assert(Boolean(credentialsProvider), 'CredentialsProvider is registered with id="credentials"');
  
  const authorizeFn = credentialsProvider.options?.authorize || credentialsProvider.authorize;
  assert(typeof authorizeFn === 'function', 'CredentialsProvider has authorize() function in options');

  // 2. Verify Demo Accounts Seed Data
  console.log('\n2. Demo Accounts Seed Data:');
  assert(DEMO_USERS.length === 3, `Expected 3 demo accounts, found ${DEMO_USERS.length}`);

  const patientDemo = DEMO_USERS.find((u) => u.role === 'patient');
  const repDemo = DEMO_USERS.find((u) => u.role === 'representative');
  const adminDemo = DEMO_USERS.find((u) => u.role === 'admin');

  assert(Boolean(patientDemo), 'Patient demo account exists');
  assert(patientDemo?.email === 'patient@hospital.ng', 'Patient email is patient@hospital.ng');
  assert(patientDemo?.password === 'password123', 'Patient password is password123');

  assert(Boolean(repDemo), 'Representative demo account exists');
  assert(repDemo?.email === 'rep@hospital.ng', 'Representative email is rep@hospital.ng');
  assert(repDemo?.password === 'password123', 'Representative password is password123');
  assert(repDemo?.hospitalId === 'hosp-fmc-asaba', 'Representative is linked to FMC Asaba hosp-fmc-asaba');

  assert(Boolean(adminDemo), 'Admin demo account exists');
  assert(adminDemo?.email === 'admin@hospital.ng', 'Admin email is admin@hospital.ng');
  assert(adminDemo?.password === 'password123', 'Admin password is password123');

  // 3. Verify Authorize Callback with Demo Credentials
  console.log('\n3. Authorize Callback Authentication:');

  // Patient Login
  const authedPatient = await authorizeFn({
    email: 'patient@hospital.ng',
    password: 'password123'
  }, {} as any);
  assert(Boolean(authedPatient), 'Patient signs in successfully with valid credentials');
  assert(authedPatient?.id === 'user-patient-1', 'Patient user has correct ID user-patient-1');
  assert(authedPatient?.role === 'patient', 'Patient user has role "patient"');
  assert(authedPatient?.phoneNumber === '+234 803 123 4567', 'Patient user has Nigerian phone number');

  // Representative Login
  const authedRep = await authorizeFn({
    email: 'rep@hospital.ng',
    password: 'password123'
  }, {} as any);
  assert(Boolean(authedRep), 'Representative signs in successfully with valid credentials');
  assert(authedRep?.id === 'user-rep-1', 'Representative user has correct ID user-rep-1');
  assert(authedRep?.role === 'representative', 'Representative user has role "representative"');
  assert(authedRep?.hospitalId === 'hosp-fmc-asaba', 'Representative user carries hospitalId "hosp-fmc-asaba"');

  // Admin Login
  const authedAdmin = await authorizeFn({
    email: 'admin@hospital.ng',
    password: 'password123'
  }, {} as any);
  assert(Boolean(authedAdmin), 'Admin signs in successfully with valid credentials');
  assert(authedAdmin?.id === 'user-admin-1', 'Admin user has correct ID user-admin-1');
  assert(authedAdmin?.role === 'admin', 'Admin user has role "admin"');

  // Case-Insensitive Email & Whitespace Trimming
  const authedTrimmed = await authorizeFn({
    email: '  Patient@Demo.com  ',
    password: 'password123'
  }, {} as any);
  assert(Boolean(authedTrimmed), 'Authorize handles mixed case and surrounding whitespace');
  assert(authedTrimmed?.role === 'patient', 'Trimmed login returns correct role');

  // 4. Verify Authorize Callback Rejections
  console.log('\n4. Authorize Callback Rejections:');

  const invalidPass = await authorizeFn({
    email: 'patient@demo.com',
    password: 'wrongpassword'
  }, {} as any);
  assert(invalidPass === null, 'Rejects wrong password with null');

  const unknownEmail = await authorizeFn({
    email: 'stranger@example.com',
    password: 'password123'
  }, {} as any);
  assert(unknownEmail === null, 'Rejects unknown email with null');

  const emptyCreds = await authorizeFn({}, {} as any);
  assert(emptyCreds === null, 'Rejects empty credentials with null');

  const noEmail = await authorizeFn({ password: 'password123' } as any, {} as any);
  assert(noEmail === null, 'Rejects missing email with null');

  const noPass = await authorizeFn({ email: 'admin@demo.com' } as any, {} as any);
  assert(noPass === null, 'Rejects missing password with null');

  // 5. Verify JWT and Session Callbacks
  console.log('\n5. JWT & Session Role Token Transfer:');

  const jwtCallback = authOptions.callbacks?.jwt;
  const sessionCallback = authOptions.callbacks?.session;

  assert(typeof jwtCallback === 'function', 'JWT callback is defined');
  assert(typeof sessionCallback === 'function', 'Session callback is defined');

  if (jwtCallback && sessionCallback) {
    // Initial sign-in: transfer user attributes to token
    const initialToken: JWT = {};
    const populatedToken = await jwtCallback({
      token: initialToken,
      user: authedRep,
      account: null
    } as any);

    assert(populatedToken.id === 'user-rep-1', 'JWT token receives user ID');
    assert(populatedToken.role === 'representative', 'JWT token receives user role');
    assert(populatedToken.hospitalId === 'hosp-fmc-asaba', 'JWT token receives hospitalId');
    assert(populatedToken.phoneNumber === '+234 803 456 7890', 'JWT token receives phoneNumber');

    // Subsequent token request without user
    const subsequentToken = await jwtCallback({
      token: populatedToken,
      account: null
    } as any);
    assert(subsequentToken.role === 'representative', 'JWT callback preserves token on subsequent requests');

    // Session callback: transfer token attributes to session.user
    const mockSession: Session = {
      expires: new Date(Date.now() + 3600000).toISOString(),
      user: {
        id: '',
        role: 'patient',
        name: 'Dr. Adeyemi Adeleke',
        email: 'rep@hospital.ng'
      }
    };

    const finalSession = (await sessionCallback({
      session: mockSession,
      token: populatedToken,
      user: {} as any,
      newSession: null,
      trigger: 'update'
    })) as Session;

    assert(finalSession.user?.id === 'user-rep-1', 'Session user has transferred ID');
    assert(finalSession.user?.role === 'representative', 'Session user has transferred role "representative"');
    assert(finalSession.user?.hospitalId === 'hosp-fmc-asaba', 'Session user has transferred hospitalId');
    assert(finalSession.user?.phoneNumber === '+234 803 456 7890', 'Session user has transferred phoneNumber');
    assert(finalSession.user?.email === 'rep@hospital.ng', 'Session user preserves base email');
  }

  // 6. Verify NextAuth Route Handlers
  console.log('\n6. NextAuth Route Handler:');
  assert(typeof GET === 'function', 'GET route handler is exported as a function');
  assert(typeof POST === 'function', 'POST route handler is exported as a function');

  // 7. Verify AuthSessionProvider Component
  console.log('\n7. AuthSessionProvider Component:');
  assert(typeof AuthSessionProvider === 'function', 'AuthSessionProvider is exported as a React component function');

  // Summary
  console.log('\n--- Test Summary ---');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    console.error(`\nFAILED: ${failed} assertion(s) failed.`);
    process.exit(1);
  } else {
    console.log('\nSUCCESS: All NextAuth credentials, JWT/session callbacks, route handlers, and providers passed cleanly!');
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Unexpected error running auth tests:', err);
  process.exit(1);
});
