import { Review } from '@/types';

export const INITIAL_REVIEWS: Review[] = [
  {
    _id: 'rev-luth-1',
    hospitalId: 'hosp-luth',
    userId: 'user-patient-1',
    userName: 'Amina Bello',
    overallRating: 4,
    staffRating: 5,
    cleanlinessRating: 4,
    waitTimeRating: 3,
    careQualityRating: 5,
    reviewText:
      'The emergency team at LUTH saved my uncle during a severe acute asthma attack. The doctors and nurses in the trauma unit were extremely responsive and competent under intense pressure. The triage process was quick, although the administrative payment queue for routine diagnostics took longer than expected.',
    helpful: 24,
    notHelpful: 1,
    response:
      'Thank you for your candid feedback, Mrs. Bello. We are delighted that our emergency resuscitation team provided prompt care to your uncle. We are actively expanding our digitized point-of-care payment kiosks to significantly shorten pharmacy and lab administrative wait times.',
    responseDate: '2026-09-12T14:30:00Z',
    createdAt: '2026-09-10T09:15:00Z',
    visitDate: '2026-09-08'
  },
  {
    _id: 'rev-luth-2',
    hospitalId: 'hosp-luth',
    userId: 'user-patient-2',
    userName: 'Emeka Okafor',
    overallRating: 4,
    staffRating: 4,
    cleanlinessRating: 4,
    waitTimeRating: 3,
    careQualityRating: 4,
    reviewText:
      'Comprehensive medical care and high-grade dialysis center. The consultants are among the best in West Africa. However, finding parking near the accident & emergency wing during peak morning hours can be difficult.',
    helpful: 15,
    notHelpful: 2,
    createdAt: '2026-09-15T11:20:00Z',
    visitDate: '2026-09-14'
  },
  {
    _id: 'rev-lasuth-1',
    hospitalId: 'hosp-lasuth',
    userId: 'user-patient-3',
    userName: 'Dr. Funke Adeyemi',
    overallRating: 5,
    staffRating: 5,
    cleanlinessRating: 5,
    waitTimeRating: 4,
    careQualityRating: 5,
    reviewText:
      'LASUTH surgical team did an exemplary job on my sister’s emergency laparotomy. From ambulance intake at the Ikeja gate to postoperative ICU recovery, the communication was clear and compassionate. Clean surgical suites and professional nursing.',
    helpful: 32,
    notHelpful: 0,
    response:
      'Thank you, Dr. Adeyemi. Our surgical theater and ICU nursing personnel are committed to international standards of emergency clinical governance. We wish your sister a seamless and robust recovery.',
    responseDate: '2026-09-18T10:00:00Z',
    createdAt: '2026-09-17T16:45:00Z',
    visitDate: '2026-09-15'
  },
  {
    _id: 'rev-lasuth-2',
    hospitalId: 'hosp-lasuth',
    userId: 'user-patient-4',
    userName: 'Tunde Bakare',
    overallRating: 4,
    staffRating: 4,
    cleanlinessRating: 4,
    waitTimeRating: 3,
    careQualityRating: 4,
    reviewText:
      'Excellent pediatric care at the Ayinke House annex. The pediatricians were patient and explained all medications thoroughly. The registration desk handled our Reliance HMO coverage without any hitches.',
    helpful: 19,
    notHelpful: 1,
    createdAt: '2026-09-20T13:10:00Z',
    visitDate: '2026-09-19'
  },
  {
    _id: 'rev-national-abuja-1',
    hospitalId: 'hosp-national-abuja',
    userId: 'user-patient-5',
    userName: 'Halima Danjuma',
    overallRating: 5,
    staffRating: 5,
    cleanlinessRating: 5,
    waitTimeRating: 4,
    careQualityRating: 5,
    reviewText:
      'The oncology center and linear accelerator radiotherapy unit at National Hospital Abuja are world-class. Compassionate oncologists and well-organized nursing shifts. The facility premises are secure, spacious, and very clean.',
    helpful: 41,
    notHelpful: 2,
    response:
      'Thank you for sharing your experience, Hajiya Danjuma. Our oncology division continues to invest in modern radiotherapy and patient-centered counseling. We appreciate your encouraging words.',
    responseDate: '2026-09-22T08:45:00Z',
    createdAt: '2026-09-21T10:30:00Z',
    visitDate: '2026-09-18'
  },
  {
    _id: 'rev-national-abuja-2',
    hospitalId: 'hosp-national-abuja',
    userId: 'user-patient-6',
    userName: 'Chinedu Eze',
    overallRating: 4,
    staffRating: 4,
    cleanlinessRating: 4,
    waitTimeRating: 4,
    careQualityRating: 4,
    reviewText:
      'Brought my mother in for emergency trauma care after a highway incident along the airport road. The Level I trauma triage team initiated CT scans and stabilization in under 20 minutes.',
    helpful: 28,
    notHelpful: 1,
    createdAt: '2026-09-23T14:15:00Z',
    visitDate: '2026-09-22'
  },
  {
    _id: 'rev-uch-ibadan-1',
    hospitalId: 'hosp-uch-ibadan',
    userId: 'user-patient-7',
    userName: 'Prof. Olumide Johnson',
    overallRating: 5,
    staffRating: 5,
    cleanlinessRating: 4,
    waitTimeRating: 4,
    careQualityRating: 5,
    reviewText:
      'UCH remains the undisputed pride of Nigerian tertiary medicine. The neurology and neurosurgery team led by seasoned professors handled a complex spinal intervention with utmost precision. Outstanding clinical intellect and dedication.',
    helpful: 53,
    notHelpful: 0,
    response:
      'We are deeply honored by your review, Prof. Johnson. UCH Ibadan will continue upholding our foundational pledge of clinical excellence, medical training, and compassionate tertiary care.',
    responseDate: '2026-09-05T16:20:00Z',
    createdAt: '2026-09-04T12:00:00Z',
    visitDate: '2026-09-01'
  },
  {
    _id: 'rev-uch-ibadan-2',
    hospitalId: 'hosp-uch-ibadan',
    userId: 'user-patient-8',
    userName: 'Blessing Adeleke',
    overallRating: 4,
    staffRating: 4,
    cleanlinessRating: 4,
    waitTimeRating: 3,
    careQualityRating: 5,
    reviewText:
      'The antenatal and delivery suites are very well equipped. The midwives were encouraging and professional throughout my 14 hours of labor. High patient volume means you should arrive early for outpatient checkups.',
    helpful: 18,
    notHelpful: 1,
    createdAt: '2026-09-14T09:40:00Z',
    visitDate: '2026-09-12'
  },
  {
    _id: 'rev-reddington-vi-1',
    hospitalId: 'hosp-reddington-vi',
    userId: 'user-patient-9',
    userName: 'Kelechi Nwosu',
    overallRating: 5,
    staffRating: 5,
    cleanlinessRating: 5,
    waitTimeRating: 5,
    careQualityRating: 5,
    reviewText:
      'Unsurpassed private healthcare experience in Lagos. Arrived at 2 AM with acute chest discomfort; was admitted immediately into the cardiac catheterization observation unit. Zero wait time and exceptional hotel-grade cleanliness.',
    helpful: 37,
    notHelpful: 0,
    response:
      'Thank you for your generous review, Mr. Nwosu. Our 24/7 cardiac emergency protocols are calibrated to respond within minutes of arrival. We are glad you are feeling well.',
    responseDate: '2026-09-25T11:10:00Z',
    createdAt: '2026-09-24T18:05:00Z',
    visitDate: '2026-09-24'
  },
  {
    _id: 'rev-lagoon-ikoyi-1',
    hospitalId: 'hosp-lagoon-ikoyi',
    userId: 'user-patient-10',
    userName: 'Folashade Coker',
    overallRating: 5,
    staffRating: 5,
    cleanlinessRating: 5,
    waitTimeRating: 4,
    careQualityRating: 5,
    reviewText:
      'Lagoon Hospital Ikoyi has top-tier orthopedic surgeons. Had arthroscopic knee surgery here and was walking comfortably within days. Seamless AXA Mansard insurance pre-authorization.',
    helpful: 22,
    notHelpful: 0,
    createdAt: '2026-09-19T15:20:00Z',
    visitDate: '2026-09-16'
  },
  {
    _id: 'rev-evercare-lekki-1',
    hospitalId: 'hosp-evercare-lekki',
    userId: 'user-patient-11',
    userName: 'Babatunde Fashola Jr.',
    overallRating: 5,
    staffRating: 5,
    cleanlinessRating: 5,
    waitTimeRating: 5,
    careQualityRating: 5,
    reviewText:
      'Evercare sets the standard for modern tertiary hospitals in Nigeria. The pediatric emergency wing treated my 3-year-old son with unmatched gentleness and pediatric equipment. Clean, bright, and impeccably staffed.',
    helpful: 45,
    notHelpful: 1,
    response:
      'Thank you for entrusting Evercare Hospital with your child’s care. Our specialized pediatric emergency team is committed to delivering gold-standard clinical outcomes in a soothing environment.',
    responseDate: '2026-09-27T09:30:00Z',
    createdAt: '2026-09-26T14:50:00Z',
    visitDate: '2026-09-25'
  },
  {
    _id: 'rev-first-cardiology-1',
    hospitalId: 'hosp-first-cardiology',
    userId: 'user-patient-12',
    userName: 'Chief Anthony Okoro',
    overallRating: 5,
    staffRating: 5,
    cleanlinessRating: 5,
    waitTimeRating: 4,
    careQualityRating: 5,
    reviewText:
      'FCC is arguably the pinnacle of cardiovascular specialty medicine in Nigeria. The intensive care unit and coronary angiogram lab are staffed by UK/US-trained interventional cardiologists who pay meticulous attention to details.',
    helpful: 33,
    notHelpful: 0,
    createdAt: '2026-09-11T17:15:00Z',
    visitDate: '2026-09-10'
  },
  {
    _id: 'rev-fmc-ebute-metta-1',
    hospitalId: 'hosp-fmc-ebute-metta',
    userId: 'user-patient-13',
    userName: 'Ibrahim Alabi',
    overallRating: 4,
    staffRating: 4,
    cleanlinessRating: 4,
    waitTimeRating: 4,
    careQualityRating: 4,
    reviewText:
      'FMC Ebute Metta has transformed significantly over the last few years. Their automated electronic medical records system sped up consultation remarkably. NHIS desk was polite and efficient.',
    helpful: 29,
    notHelpful: 2,
    response:
      'Thank you Mr. Alabi. Our electronic health records modernization drive is aimed at eliminating paper bottlenecks for all NHIS beneficiaries. We appreciate your encouraging feedback.',
    responseDate: '2026-09-14T12:00:00Z',
    createdAt: '2026-09-13T10:10:00Z',
    visitDate: '2026-09-11'
  },
  {
    _id: 'rev-upth-ph-1',
    hospitalId: 'hosp-upth-ph',
    userId: 'user-patient-14',
    userName: 'Tamuno Briggs',
    overallRating: 4,
    staffRating: 4,
    cleanlinessRating: 4,
    waitTimeRating: 3,
    careQualityRating: 5,
    reviewText:
      'UPTH emergency department along the East-West road has saved countless lives in the Niger Delta. The trauma surgeons managed severe industrial burns with great dedication. Highly experienced clinical teams.',
    helpful: 26,
    notHelpful: 1,
    createdAt: '2026-09-16T16:30:00Z',
    visitDate: '2026-09-14'
  },
  {
    _id: 'rev-garki-abuja-1',
    hospitalId: 'hosp-garki-abuja',
    userId: 'user-patient-15',
    userName: 'Zainab Mohammed',
    overallRating: 5,
    staffRating: 5,
    cleanlinessRating: 4,
    waitTimeRating: 4,
    careQualityRating: 5,
    reviewText:
      'Garki Hospital’s public-private partnership model works noticeably well. Short consultation wait times, friendly nurses, and reliable pharmacy stock. Their fertility clinic provides wonderful psychological and clinical guidance.',
    helpful: 31,
    notHelpful: 1,
    response:
      'Thank you, Mrs. Mohammed. Our public-private partnership model strives to combine tertiary clinical expertise with private-sector speed and customer care. We are grateful for your review.',
    responseDate: '2026-09-21T11:45:00Z',
    createdAt: '2026-09-20T08:30:00Z',
    visitDate: '2026-09-18'
  },
  {
    _id: 'rev-vedic-lekki-1',
    hospitalId: 'hosp-vedic-lekki',
    userId: 'user-patient-16',
    userName: 'Ngozi Obi',
    overallRating: 5,
    staffRating: 5,
    cleanlinessRating: 5,
    waitTimeRating: 5,
    careQualityRating: 5,
    reviewText:
      'Superb diagnostic imaging center. Did an MRI and full cardiac panel; results were delivered to my phone within three hours. Very clean environment with strict hygiene protocols.',
    helpful: 20,
    notHelpful: 0,
    createdAt: '2026-09-22T13:40:00Z',
    visitDate: '2026-09-21'
  },
  {
    _id: 'rev-st-nicholas-1',
    hospitalId: 'hosp-st-nicholas',
    userId: 'user-patient-17',
    userName: 'Oladipo Williams',
    overallRating: 5,
    staffRating: 5,
    cleanlinessRating: 5,
    waitTimeRating: 4,
    careQualityRating: 5,
    reviewText:
      'Historic center of excellence for kidney care in Nigeria. My father has been undergoing hemodialysis here for 18 months; the nephrologists and renal nurses are family to us now. Highly recommended.',
    helpful: 42,
    notHelpful: 0,
    response:
      'Thank you Mr. Williams. Serving our renal patients with continuity, dignity, and clinical diligence is the sacred mission of St. Nicholas Hospital. We send our warmest regards to your father.',
    responseDate: '2026-09-19T10:15:00Z',
    createdAt: '2026-09-18T14:20:00Z',
    visitDate: '2026-09-17'
  },
  {
    _id: 'rev-akth-kano-1',
    hospitalId: 'hosp-akth-kano',
    userId: 'user-patient-18',
    userName: 'Musa Abdullahi',
    overallRating: 4,
    staffRating: 4,
    cleanlinessRating: 4,
    waitTimeRating: 3,
    careQualityRating: 5,
    reviewText:
      'Aminu Kano Teaching Hospital has outstanding medical consultants and emergency surgical teams. Patient volume from Kano, Jigawa, and Katsina is colossal, so the waiting halls can get packed, but critical trauma cases receive immediate attention.',
    helpful: 35,
    notHelpful: 2,
    createdAt: '2026-09-24T10:00:00Z',
    visitDate: '2026-09-23'
  },
  {
    _id: 'rev-mch-ikeja-1',
    hospitalId: 'hosp-mch-ikeja',
    userId: 'user-patient-19',
    userName: 'Yetunde Shonibare',
    overallRating: 4,
    staffRating: 5,
    cleanlinessRating: 4,
    waitTimeRating: 4,
    careQualityRating: 5,
    reviewText:
      'The maternal and neonatal ICU doctors took fantastic care of my preterm twins. Dedicated incubators, skilled pediatric nurses, and constant monitoring. Ilera Eko health scheme covered our core expenses seamlessly.',
    helpful: 39,
    notHelpful: 1,
    response:
      'Thank you, Mrs. Shonibare! We are thrilled to hear that the twins are thriving. Mother and Child Hospital Ikeja remains dedicated to safeguarding maternal and infant health across Lagos.',
    responseDate: '2026-09-26T15:00:00Z',
    createdAt: '2026-09-25T11:30:00Z',
    visitDate: '2026-09-22'
  },
  {
    _id: 'rev-cedarcrest-abuja-1',
    hospitalId: 'hosp-cedarcrest-abuja',
    userId: 'user-patient-20',
    userName: 'Air Commodore (Rtd) S. Bello',
    overallRating: 5,
    staffRating: 5,
    cleanlinessRating: 5,
    waitTimeRating: 4,
    careQualityRating: 5,
    reviewText:
      'Premier orthopedic and trauma surgery facility. Following an athletic femur injury, Cedarcrest reconstructed the joint with world-class orthopedic instrumentation. The physical therapy unit is equally phenomenal.',
    helpful: 27,
    notHelpful: 0,
    createdAt: '2026-09-27T16:00:00Z',
    visitDate: '2026-09-26'
  }
];
