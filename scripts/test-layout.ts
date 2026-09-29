/**
 * Task 5 Verification Suite: Global Layout, Navbar, Footer, and DemoRoleBar
 * Validates module exports, component structure, rendering safety, and spec requirements.
 */

// Allow Node.js/tsx to import .css files safely
require.extensions['.css'] = () => {};

import React from 'react';
import { renderToString } from 'react-dom/server';
import { SessionProvider } from 'next-auth/react';
import { NIGERIAN_LOCATIONS, DEFAULT_LOCATION } from '../src/data/nigerianLocations';
import { AppProvider } from '../src/context/AppContext';

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
  console.log('--- Testing Task 5: Global Layout, Navbar, Footer & DemoRoleBar ---\n');

  // Dynamically import components after .css extension handler is registered
  const { Navbar } = await import('../src/components/Navbar');
  const { Footer } = await import('../src/components/Footer');
  const { DemoRoleBar } = await import('../src/components/DemoRoleBar');
  const layoutModule = await import('../src/app/layout');
  const RootLayout = layoutModule.default;
  const { metadata, viewport } = layoutModule;

  // 1. Metadata and Viewport Verification
  console.log('1. Metadata & Viewport Specification:');
  assert(typeof metadata === 'object', 'metadata is defined and exported');
  assert(
    typeof metadata.title === 'string' && metadata.title.includes('Hospital Locator Nigeria'),
    `metadata.title contains "Hospital Locator Nigeria": ${metadata.title}`
  );
  assert(
    typeof metadata.description === 'string' && metadata.description.includes('Geospatial'),
    'metadata.description highlights geospatial healthcare discovery'
  );
  assert(Array.isArray(metadata.keywords) && metadata.keywords.length >= 5, 'metadata.keywords has >= 5 terms');
  assert(
    metadata.keywords!.includes('Emergency 112 Nigeria') && metadata.keywords!.includes('HEFAMAA accredited'),
    'metadata.keywords contains Nigerian emergency and accreditation tags'
  );
  assert(typeof viewport === 'object' && viewport.themeColor === '#0284c7', 'viewport has themeColor #0284c7');

  // 2. Component Exports Verification
  console.log('\n2. Component Exports:');
  assert(typeof Navbar === 'function', 'Navbar is exported as a React component function');
  assert(typeof Footer === 'function', 'Footer is exported as a React component function');
  assert(typeof DemoRoleBar === 'function', 'DemoRoleBar is exported as a React component function');
  assert(typeof RootLayout === 'function' || typeof RootLayout === 'object', 'RootLayout is exported as default React component');

  // 3. Footer Static Rendering & Content Verification
  console.log('\n3. Footer Rendering & Emergency Information:');
  const footerHtml = renderToString(React.createElement(Footer));
  assert(footerHtml.length > 500, `Footer renders cleanly to HTML string (len: ${footerHtml.length})`);
  assert(footerHtml.includes('112'), 'Footer includes National Emergency 112');
  assert(footerHtml.includes('tel:112'), 'Footer includes direct tel:112 dial link');
  assert(footerHtml.includes('767'), 'Footer includes Lagos Emergency 767');
  assert(footerHtml.includes('tel:767'), 'Footer includes direct tel:767 dial link');
  assert(footerHtml.includes('122'), 'Footer includes FRSC Rescue 122');
  assert(footerHtml.includes('tel:122'), 'Footer includes direct tel:122 dial link');
  assert(footerHtml.includes('HEFAMAA'), 'Footer includes HEFAMAA regulatory reference');
  assert(footerHtml.includes('Federal Ministry of Health'), 'Footer includes FMoH reference');
  assert(footerHtml.includes('Sanni Inuoluwadunsimi'), 'Footer includes CSC project author attribution');
  assert(footerHtml.includes('CSC Final Year Project'), 'Footer includes CSC Final Year Project text');
  assert(footerHtml.includes('/hospitals'), 'Footer links to /hospitals directory');
  assert(footerHtml.includes('/emergency'), 'Footer links to /emergency finder');
  assert(footerHtml.includes('/compare'), 'Footer links to /compare matrix');
  assert(footerHtml.includes('/dashboard/patient'), 'Footer links to /dashboard/patient');
  assert(footerHtml.includes('/dashboard/representative'), 'Footer links to /dashboard/representative');
  assert(footerHtml.includes('/dashboard/admin'), 'Footer links to /dashboard/admin');

  // 4. Provider Harness for Navbar & DemoRoleBar Rendering
  console.log('\n4. Component Rendering within Session & App Providers:');

  function MockProviders({
    children,
    session = null
  }: {
    children?: React.ReactNode;
    session?: any;
  }) {
    return React.createElement(
      SessionProvider,
      {
        session,
        children: React.createElement(AppProvider, { children })
      }
    );
  }

  // Test Navbar in Guest mode
  const navbarGuestHtml = renderToString(
    React.createElement(MockProviders, null, React.createElement(Navbar))
  );
  assert(navbarGuestHtml.length > 500, 'Navbar renders safely with Guest state');
  assert(navbarGuestHtml.includes('Hospital'), 'Navbar contains "Hospital" branding');
  assert(navbarGuestHtml.includes('Locator'), 'Navbar contains "Locator" branding');
  assert(navbarGuestHtml.includes('Emergency 24/7'), 'Navbar contains prominent "Emergency 24/7" CTA');
  assert(navbarGuestHtml.includes('/emergency'), 'Emergency CTA links to /emergency');
  assert(navbarGuestHtml.includes('/hospitals'), 'Navbar contains link to /hospitals');
  assert(navbarGuestHtml.includes('/compare'), 'Navbar contains link to /compare');
  assert(navbarGuestHtml.includes('/about'), 'Navbar contains link to /about');
  assert(navbarGuestHtml.includes('Sign In'), 'Navbar displays "Sign In" button in Guest mode');
  assert(navbarGuestHtml.includes('Register'), 'Navbar displays "Register" button in Guest mode');

  // Test Navbar in Authenticated (Patient) mode
  const mockPatientSession = {
    user: {
      id: 'user-patient-1',
      name: 'Amina Bello',
      email: 'patient@demo.com',
      role: 'patient'
    },
    expires: '2026-10-30T00:00:00.000Z'
  };
  const navbarPatientHtml = renderToString(
    React.createElement(MockProviders, { session: mockPatientSession }, React.createElement(Navbar))
  );
  assert(navbarPatientHtml.includes('Amina Bello'), 'Navbar displays authenticated patient user name');
  assert(navbarPatientHtml.includes('Patient'), 'Navbar displays Patient role badge');
  assert(navbarPatientHtml.includes('Sign Out'), 'Navbar includes Sign Out control when authenticated');

  // Test DemoRoleBar Rendering
  console.log('\n5. DemoRoleBar Dock Features & Nigerian Cities:');
  const demoBarHtml = renderToString(
    React.createElement(MockProviders, null, React.createElement(DemoRoleBar))
  );
  assert(demoBarHtml.length > 500, 'DemoRoleBar renders safely in provider tree');
  assert(demoBarHtml.includes('Guest'), 'DemoRoleBar provides 1-click Guest persona button');
  assert(demoBarHtml.includes('Patient (Amina)'), 'DemoRoleBar provides Patient (Amina) button');
  assert(demoBarHtml.includes('Facility Rep (Dr. Okafor)'), 'DemoRoleBar provides Facility Rep button');
  assert(demoBarHtml.includes('Admin (Admin Dunsimi)'), 'DemoRoleBar provides Admin button');
  assert(demoBarHtml.includes('Reset Data'), 'DemoRoleBar provides Reset Demo Data button');
  assert(demoBarHtml.includes('simulated-city-select'), 'DemoRoleBar includes simulated city dropdown selector');

  // Verify all 6 Nigerian Presets are present in DemoRoleBar dropdown
  NIGERIAN_LOCATIONS.forEach((loc) => {
    assert(
      demoBarHtml.includes(loc.name),
      `DemoRoleBar contains preset option: ${loc.name}`
    );
  });

  // 6. Root Layout Structure Verification
  console.log('\n6. Root Layout HTML Shell & Provider Wrapping:');
  const layoutHtml = renderToString(
    React.createElement(
      RootLayout,
      null,
      React.createElement('div', { id: 'test-child-content' }, 'Main Test Content')
    )
  );
  assert(layoutHtml.includes('Main Test Content'), 'RootLayout successfully renders nested children');
  assert(layoutHtml.includes('<header'), 'RootLayout contains <header> from Navbar');
  assert(layoutHtml.includes('<footer'), 'RootLayout contains <footer> from Footer');
  assert(layoutHtml.includes('Demo Persona:'), 'RootLayout includes floating DemoRoleBar dock');

  console.log('\n--- Test Summary ---');
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);

  if (passedTests === totalTests) {
    console.log('\nSUCCESS: All layout, navbar, footer, and demo role switcher tests passed cleanly!\n');
  } else {
    console.error('\nFAILURE: Some tests did not pass.\n');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed with unhandled error:', err);
  process.exit(1);
});
