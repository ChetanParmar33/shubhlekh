/* Sample 3 — Rajwada (Rajput, Jodhpur). ⚠ All names, dates, places and numbers are DEMO data. */
window.INVITE = {
  id: 's3', langs: ['en', 'hi'],
  groom: { name: { en: 'Aditya Singh', hi: 'आदित्य सिंह' }, parents: { en: 'Son of Rani Sa Padmini Kanwar & Thakur Mahendra Singh Rathore', hi: 'रानी सा पद्मिनी कँवर एवं ठाकुर महेंद्र सिंह राठौड़ के सुपुत्र' } },
  bride: { name: { en: 'Rajnandini', hi: 'राजनंदिनी' }, parents: { en: 'Daughter of Rani Sa Gayatri Kumari & Thakur Vikram Singh Shekhawat', hi: 'रानी सा गायत्री कुमारी एवं ठाकुर विक्रम सिंह शेखावत की सुपुत्री' } },
  monogram: 'A ✦ R', hashtag: '#ShahiShaadiJodhpur',
  invocation: '॥ श्री गणेशाय नमः ॥',
  heroLine: { en: 'The royal families request your presence', hi: 'शाही परिवार आपकी उपस्थिति के अभिलाषी हैं' },
  date: '2026-12-05T19:00:00+05:30', city: { en: 'Jodhpur', hi: 'जोधपुर' }, siteUrl: 'https://example.com/aditya-rajnandini',
  message: { en: 'By the grace of Shri Ganesh and the blessings of our ancestors, the Rathore and Shekhawat families request the honour of your presence as two royal houses become one.', hi: 'श्री गणेश की कृपा और पूर्वजों के आशीर्वाद से, राठौड़ एवं शेखावत परिवार दो शाही घरानों के मिलन के इस शुभ अवसर पर आपकी गरिमामयी उपस्थिति के अभिलाषी हैं।' },
  guests: { rao: { en: 'Respected Rao Sahab & family', hi: 'आदरणीय राव साहब एवं परिवार' } },
  titles: { date: [{ en: 'The auspicious day', hi: 'शुभ मुहूर्त' }, { en: 'Unveil the date', hi: 'तिथि प्रकट करें' }], count: [null, { en: 'Until the Baraat', hi: 'बारात तक' }], events: [null, { en: 'The Royal Celebrations', hi: 'शाही उत्सव' }] },
  photos: {
    hero: 'assets/img/fort-day.webp', invite: 'assets/img/jharokha.webp', venue: 'assets/img/umaid.webp', end: 'assets/img/palace-facade.webp',
    gallery: [{ src: 'assets/img/umaid.webp', alt: 'Umaid Bhawan' }, { src: 'assets/img/fort-night.webp', alt: 'Mehrangarh at night' }, { src: 'assets/img/courtyard-women.webp', alt: 'A palace courtyard' }, { src: 'assets/img/jharokha.webp', alt: 'Carved jharokhas' }, { src: 'assets/img/umaid-pool.webp', alt: 'The palace pool' }]
  },
  story: [
    { when: { en: 'Dussehra 2021', hi: 'दशहरा 2021' }, title: { en: 'A polo match in Jodhpur', hi: 'जोधपुर का पोलो मैच' }, text: { en: 'He fell off his horse. She was the only one who didn’t laugh — for about three seconds.', hi: 'वे घोड़े से गिर पड़े। सिर्फ़ वही थीं जो नहीं हँसीं — लगभग तीन सेकंड तक।' }, photo: 'assets/img/blue-city.webp' },
    { when: { en: 'Teej 2022', hi: 'तीज 2022' }, title: { en: 'Letters across Rajasthan', hi: 'राजस्थान भर में चिट्ठियाँ' }, text: { en: 'Jaipur to Jodhpur, one handwritten letter a week.', hi: 'जयपुर से जोधपुर, हर हफ़्ते एक हाथ से लिखी चिट्ठी।' }, photo: 'assets/img/hawa-mahal.webp' },
    { when: { en: 'Gangaur 2024', hi: 'गणगौर 2024' }, title: { en: 'The families meet', hi: 'परिवारों का मिलन' }, text: { en: 'An afternoon of kesar chai, old stories and approving nods.', hi: 'केसर चाय, पुरानी कहानियाँ और सहमति में हिलते सिर।' }, photo: 'assets/img/carved.webp' },
    { when: { en: 'Sharad Purnima 2025', hi: 'शरद पूर्णिमा 2025' }, title: { en: 'Sagai by the palace pool', hi: 'महल के कुंड पर सगाई' }, text: { en: 'A ring, a sword-salute and a very proud dadisa.', hi: 'एक अँगूठी, तलवारों की सलामी और बेहद गर्वित दादीसा।' }, photo: 'assets/img/umaid-pool.webp' }
  ],
  events: [
    { id: 'tilak', icon: 'lamp', name: { en: 'Tilak', hi: 'तिलक' }, start: '2026-12-03T11:00:00+05:30', hours: 3, venue: { en: 'Rathore Haveli', hi: 'राठौड़ हवेली' }, address: 'Old City, Jodhpur, Rajasthan 342001', note: { en: 'The bride’s family welcomes the groom', hi: 'वधू पक्ष द्वारा वर का स्वागत' } },
    { id: 'haldi', icon: 'haldi', name: { en: 'Haldi & Mayra', hi: 'हल्दी एवं मायरा' }, start: '2026-12-04T10:00:00+05:30', hours: 4, venue: { en: 'Zenana Mahal courtyard', hi: 'ज़नाना महल का आँगन' }, address: 'Umaid Bhawan Road, Jodhpur 342006', note: { en: 'Maternal uncles bring the mayra', hi: 'मामा परिवार मायरा लेकर आएँगे' } },
    { id: 'mehfil', icon: 'sangeet', name: { en: 'Mehfil-e-Raag', hi: 'महफ़िल-ए-राग' }, start: '2026-12-04T20:00:00+05:30', hours: 4, venue: { en: 'The Durbar Lawns', hi: 'दरबार लॉन' }, address: 'Umaid Bhawan Road, Jodhpur 342006', note: { en: 'Manganiyar folk music under the stars', hi: 'सितारों तले मांगणियार लोकसंगीत' } },
    { id: 'phere', icon: 'wedding', main: true, name: { en: 'Baraat & Phere', hi: 'बारात एवं फेरे' }, start: '2026-12-05T19:00:00+05:30', hours: 6, venue: { en: 'The Palace Mandap', hi: 'महल का मंडप' }, address: 'Umaid Bhawan Road, Jodhpur 342006', note: { en: 'Baraat on horseback at 7, phere at 10', hi: 'सात बजे घोड़ी पर बारात, दस बजे फेरे' } },
    { id: 'daawat', icon: 'reception', name: { en: 'Shahi Daawat', hi: 'शाही दावत' }, start: '2026-12-06T20:00:00+05:30', hours: 4, venue: { en: 'The Grand Durbar Hall', hi: 'ग्रैंड दरबार हॉल' }, address: 'Umaid Bhawan Road, Jodhpur 342006', note: { en: 'A royal feast — safa & bandhgala welcome', hi: 'शाही भोज — साफ़ा और बंदगला' } }
  ],
  venue: { name: { en: 'The Palace, Umaid Bhawan Road', hi: 'महल, उम्मेद भवन रोड' }, address: 'Umaid Bhawan Road, Jodhpur, Rajasthan 342006', map: 'Umaid Bhawan Palace Jodhpur' },
  dress: [
    { event: 'tilak', colors: ['#e07b24', '#f6e9d2', '#c9a24a'], text: { en: 'Saffron & ivory', hi: 'केसरिया और आइवरी' } },
    { event: 'haldi', colors: ['#f6b819', '#7a1428', '#f6e9d2'], text: { en: 'Leheriya & bandhej', hi: 'लहरिया और बांधेज' } },
    { event: 'mehfil', colors: ['#2a2f77', '#c9a24a', '#5a0f22'], text: { en: 'Velvet & jewel tones', hi: 'मख़मल और गहरे रंग' } },
    { event: 'phere', colors: ['#7a1428', '#c9a24a', '#e07b24'], text: { en: 'Poshak, safa & bandhgala', hi: 'पोशाक, साफ़ा और बंदगला' } }
  ],
  travel: [
    { icon: 'plane', title: { en: 'Arriving', hi: 'पहुँचना' }, text: { en: 'Jodhpur Airport (JDH) is 15 min away — cars await every flight.', hi: 'जोधपुर हवाई अड्डा (JDH) 15 मिनट दूर — हर फ़्लाइट पर गाड़ी मिलेगी।' } },
    { icon: 'stay', title: { en: 'Staying', hi: 'ठहरना' }, text: { en: 'Heritage suites are reserved for 3–6 Dec.', hi: '3–6 दिसंबर के लिए हेरिटेज सुइट आरक्षित हैं।' } },
    { icon: 'car', title: { en: 'Getting around', hi: 'आना-जाना' }, text: { en: 'Vintage cars and shuttles between the haveli and the palace.', hi: 'हवेली और महल के बीच विंटेज कारें और शटल।' } }
  ],
  families: {
    bride: { title: { en: 'House of Shekhawat', hi: 'शेखावत घराना' }, names: { en: 'Rajmata Kesar Kanwar\nRani Sa Gayatri Kumari & Thakur Vikram Singh', hi: 'राजमाता केसर कँवर\nरानी सा गायत्री कुमारी एवं ठाकुर विक्रम सिंह' } },
    groom: { title: { en: 'House of Rathore', hi: 'राठौड़ घराना' }, names: { en: 'Rajmata Sugan Kanwar\nRani Sa Padmini Kanwar & Thakur Mahendra Singh', hi: 'राजमाता सुगन कँवर\nरानी सा पद्मिनी कँवर एवं ठाकुर महेंद्र सिंह' } }
  },
  rsvp: { endpoint: '', deadline: '2026-11-20T23:59:00+05:30', maxGuests: 6 },
  wishes: [
    { name: 'Dadisa', text: { en: 'Khamma ghani! May your home always glow like Mehrangarh at dusk.', hi: 'खम्मा घणी! आपका घर साँझ के मेहरानगढ़ जैसा सदा जगमगाए।' } },
    { name: 'Kunwar Yash', text: { en: 'Finally! The polo story will be retold at every family wedding.', hi: 'आख़िरकार! पोलो वाला क़िस्सा अब हर शादी में सुनाया जाएगा।' } },
    { name: 'Bhavna Baisa', text: { en: 'The most graceful jodi of Marwar.', hi: 'मारवाड़ की सबसे सुंदर जोड़ी।' } },
    { name: 'The Manganiyars', text: { en: 'We will sing till sunrise for you.', hi: 'आपके लिए सूर्योदय तक गाएँगे।' } }
  ],
  contact: { name: { en: 'Kunwar Yash (groom’s cousin)', hi: 'कुँवर यश (वर के भाई)' }, phone: '+910000000003' },
  media: { music: 'assets/audio/music.mp3', musicVolume: .5, sfx: { open: 'assets/audio/open.mp3', reveal: 'assets/audio/reveal.mp3', scratch: 'assets/audio/scratch.mp3' } },
  credits: 'Photos: CC-licensed · <a href="assets/img/credits.html">credits</a> · music generated'
};
