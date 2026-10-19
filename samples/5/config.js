/* Sample 5 — Kanjivaram (Tamil, Madurai). ⚠ All names, dates, places and numbers are DEMO data. */
window.INVITE = {
  id: 's5', langs: ['en', 'ta'],
  groom: { name: { en: 'Karthik', ta: 'கார்த்திக்' }, parents: { en: 'Son of Smt. Lalitha & Shri. Ramanathan', ta: 'திருமதி லலிதா – திரு. ராமநாதன் அவர்களின் மகன்' } },
  bride: { name: { en: 'Meenakshi', ta: 'மீனாட்சி' }, parents: { en: 'Daughter of Smt. Vasantha & Shri. Sundaram', ta: 'திருமதி வசந்தா – திரு. சுந்தரம் அவர்களின் மகள்' } },
  monogram: 'K ❀ M', hashtag: '#KarthikWedsMeenakshi',
  invocation: 'சுப முகூர்த்தம்',
  heroLine: { en: 'With the blessings of our elders', ta: 'பெரியோர்களின் ஆசியுடன்' },
  date: '2027-02-08T07:30:00+05:30', city: { en: 'Madurai', ta: 'மதுரை' }, siteUrl: 'https://example.com/karthik-meenakshi',
  message: { en: 'By the grace of Meenakshi Amman and the blessings of our elders, we joyfully invite you to the wedding of our children in the temple city of Madurai.', ta: 'மீனாட்சி அம்மனின் அருளாலும் பெரியோர்களின் ஆசியாலும், கோயில் நகரமாம் மதுரையில் நடைபெறும் எங்கள் பிள்ளைகளின் திருமணத்திற்கு உங்களை அன்புடன் அழைக்கிறோம்.' },
  guests: { iyer: { en: 'Dear Iyer Family', ta: 'அன்பான ஐயர் குடும்பத்தினருக்கு' } },
  titles: { date: [{ en: 'The muhurtham', ta: 'முகூர்த்தம்' }, { en: 'Scratch the betel leaf', ta: 'வெற்றிலையைச் சுரண்டுங்கள்' }], count: [null, { en: 'Days to the muhurtham', ta: 'முகூர்த்தத்திற்கு இன்னும்' }] },
  photos: {
    hero: 'assets/img/couple-garlands.webp', invite: 'assets/img/kolam-drawing.webp', venue: 'assets/img/couple-stage.webp', end: 'assets/img/procession.webp',
    gallery: [{ src: 'assets/img/couple-stage.webp', alt: 'The wedding stage' }, { src: 'assets/img/kolam-red.webp', alt: 'Kolam' }, { src: 'assets/img/anklets.webp', alt: 'Silver anklets' }, { src: 'assets/img/jasmine-2.webp', alt: 'Jasmine' }, { src: 'assets/img/threads.webp', alt: 'Silk threads' }]
  },
  story: [
    { when: { en: 'Margazhi 2021', ta: 'மார்கழி 2021' }, title: { en: 'A kolam at dawn', ta: 'விடியல் கோலம்' }, text: { en: 'She was drawing the kolam; he stepped right into it. Apologies were made. Coffee followed.', ta: 'அவள் கோலம் போட்டுக்கொண்டிருந்தாள்; அவன் அதில் கால் வைத்தான். மன்னிப்பு, பிறகு காபி.' }, photo: 'assets/img/jasmine.webp' },
    { when: { en: 'Chithirai 2022', ta: 'சித்திரை 2022' }, title: { en: 'The temple festival', ta: 'கோயில் திருவிழா' }, text: { en: 'Lost in the Chithirai crowds, found again by the jasmine stalls.', ta: 'சித்திரைத் திருவிழாக் கூட்டத்தில் தொலைந்து, மல்லிகைக் கடைகளருகே மீண்டும் சந்திப்பு.' }, photo: 'assets/img/diya.webp' },
    { when: { en: 'Pongal 2024', ta: 'பொங்கல் 2024' }, title: { en: 'Pongal with both families', ta: 'இரு குடும்பங்களுடன் பொங்கல்' }, text: { en: 'The pot boiled over — a good sign, said both grandmothers at once.', ta: 'பொங்கல் பொங்கி வழிந்தது — நல்ல சகுனம் என்றனர் இரு பாட்டிகளும் ஒரே நேரத்தில்.' }, photo: 'assets/img/anklets.webp' },
    { when: { en: 'Aavani 2026', ta: 'ஆவணி 2026' }, title: { en: 'Nichayathartham', ta: 'நிச்சயதார்த்தம்' }, text: { en: 'Plates of fruit, silk and turmeric — and the date was fixed.', ta: 'பழம், பட்டு, மஞ்சள் தட்டுகள் — திருமண நாள் குறிக்கப்பட்டது.' }, photo: 'assets/img/procession.webp' }
  ],
  events: [
    { id: 'nichayam', icon: 'rings', name: { en: 'Nichayathartham', ta: 'நிச்சயதார்த்தம்' }, start: '2027-02-06T18:00:00+05:30', hours: 3, venue: { en: 'Sundaram Illam, Anna Nagar', ta: 'சுந்தரம் இல்லம், அண்ணா நகர்' }, address: 'Anna Nagar, Madurai, Tamil Nadu 625020', note: { en: 'Exchange of thamboolam', ta: 'தாம்பூலம் மாற்றுதல்' } },
    { id: 'nalangu', icon: 'haldi', name: { en: 'Nalangu', ta: 'நலங்கு' }, start: '2027-02-07T17:00:00+05:30', hours: 3, venue: { en: 'Sri Meenakshi Kalyana Mandapam', ta: 'ஸ்ரீ மீனாட்சி கல்யாண மண்டபம்' }, address: 'Teppakulam, Madurai, Tamil Nadu 625009', note: { en: 'Songs, games & turmeric', ta: 'பாட்டு, விளையாட்டு, மஞ்சள்' } },
    { id: 'muhurtham', icon: 'wedding', main: true, name: { en: 'Muhurtham', ta: 'முகூர்த்தம்' }, start: '2027-02-08T07:30:00+05:30', hours: 4, venue: { en: 'Sri Meenakshi Kalyana Mandapam', ta: 'ஸ்ரீ மீனாட்சி கல்யாண மண்டபம்' }, address: 'Teppakulam, Madurai, Tamil Nadu 625009', note: { en: 'Thali at 7:45 AM, followed by a banana-leaf feast', ta: 'காலை 7:45க்கு தாலி, பிறகு வாழை இலை விருந்து' } },
    { id: 'reception', icon: 'reception', name: { en: 'Reception', ta: 'வரவேற்பு' }, start: '2027-02-08T18:30:00+05:30', hours: 4, venue: { en: 'Sri Meenakshi Kalyana Mandapam', ta: 'ஸ்ரீ மீனாட்சி கல்யாண மண்டபம்' }, address: 'Teppakulam, Madurai, Tamil Nadu 625009', note: { en: 'Nadaswaram, dinner & photos', ta: 'நாதஸ்வரம், இரவு விருந்து, புகைப்படங்கள்' } }
  ],
  venue: { name: { en: 'Sri Meenakshi Kalyana Mandapam', ta: 'ஸ்ரீ மீனாட்சி கல்யாண மண்டபம்' }, address: 'Teppakulam, Madurai, Tamil Nadu 625009', map: 'Teppakulam Madurai' },
  dress: [
    { event: 'nichayam', colors: ['#2e8b3e', '#d9a21b', '#fffdf5'], text: { en: 'Silk in green & gold', ta: 'பச்சை, தங்க நிற பட்டு' } },
    { event: 'nalangu', colors: ['#f6c231', '#c8102e', '#fffdf5'], text: { en: 'Yellow & kumkum red', ta: 'மஞ்சள், குங்குமச் சிவப்பு' } },
    { event: 'muhurtham', colors: ['#8e1450', '#d9a21b', '#fffdf5'], text: { en: 'Kanjivaram silk, veshti & angavastram', ta: 'காஞ்சிப் பட்டு, வேட்டி, அங்கவஸ்திரம்' } },
    { event: 'reception', colors: ['#3b0a2a', '#d9a21b', '#c0c7d9'], text: { en: 'Evening festive', ta: 'மாலை விழா உடை' } }
  ],
  travel: [
    { icon: 'plane', title: { en: 'Arriving', ta: 'வருகை' }, text: { en: 'Madurai Airport (IXM) is 25 min from the mandapam.', ta: 'மதுரை விமான நிலையம் (IXM) மண்டபத்திலிருந்து 25 நிமிடம்.' } },
    { icon: 'stay', title: { en: 'Staying', ta: 'தங்குமிடம்' }, text: { en: 'Rooms are reserved near Teppakulam for 6–8 Feb.', ta: 'தெப்பக்குளம் அருகே 6–8 பிப்ரவரி அறைகள் முன்பதிவு.' } },
    { icon: 'car', title: { en: 'Getting around', ta: 'பயணம்' }, text: { en: 'Vans will run from the hotel to the mandapam from 6 AM.', ta: 'காலை 6 மணி முதல் ஹோட்டலில் இருந்து மண்டபத்திற்கு வேன்கள்.' } }
  ],
  families: {
    bride: { title: { en: 'The Sundaram Family', ta: 'சுந்தரம் குடும்பம்' }, names: { en: 'Smt. Kamakshi & Shri. Natarajan\nSmt. Vasantha & Shri. Sundaram', ta: 'திருமதி காமாட்சி – திரு. நடராஜன்\nதிருமதி வசந்தா – திரு. சுந்தரம்' } },
    groom: { title: { en: 'The Ramanathan Family', ta: 'ராமநாதன் குடும்பம்' }, names: { en: 'Smt. Parvathi & Shri. Subramanian\nSmt. Lalitha & Shri. Ramanathan', ta: 'திருமதி பார்வதி – திரு. சுப்பிரமணியன்\nதிருமதி லலிதா – திரு. ராமநாதன்' } }
  },
  rsvp: { endpoint: '', deadline: '2027-01-20T23:59:00+05:30', maxGuests: 8 },
  wishes: [
    { name: 'Paati', text: { en: 'Pathinarum petru peruvazhvu vaazhga! ❤', ta: 'பதினாறும் பெற்று பெருவாழ்வு வாழ்க! ❤' } },
    { name: 'Arun', text: { en: 'From stepping on the kolam to stepping into forever!', ta: 'கோலத்தில் கால் வைத்ததிலிருந்து வாழ்நாள் முழுதும் வரை!' } },
    { name: 'Divya', text: { en: 'Save me the extra payasam please.', ta: 'எனக்கு கூடுதல் பாயசம் வைத்திருங்கள்.' } },
    { name: 'Mama', text: { en: 'Valga valamudan!', ta: 'வாழ்க வளமுடன்!' } }
  ],
  contact: { name: { en: 'Arun (bride’s cousin)', ta: 'அருண் (மணமகளின் உறவினர்)' }, phone: '+910000000005' },
  media: { music: 'assets/audio/music.mp3', musicVolume: .5, sfx: { open: 'assets/audio/open.mp3', reveal: 'assets/audio/reveal.mp3', scratch: 'assets/audio/scratch.mp3' } },
  credits: 'Photos: CC-licensed · <a href="assets/img/credits.html">credits</a> · music generated'
};
