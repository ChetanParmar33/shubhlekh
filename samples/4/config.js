/* Sample 4 — Mehndi Bagh (Lucknow Nikah). ⚠ All names, dates, places and numbers are DEMO data. */
window.INVITE = {
  id: 's4', langs: ['en', 'ur'],
  groom: { name: { en: 'Ayaan', ur: 'ایان' }, parents: { en: 'Son of Mrs. Nasreen & Mr. Faisal Rizvi', ur: 'جناب فیصل رضوی و محترمہ نسرین کے صاحبزادے' } },
  bride: { name: { en: 'Zoya', ur: 'زویا' }, parents: { en: 'Daughter of Mrs. Shabana & Mr. Imran Naqvi', ur: 'جناب عمران نقوی و محترمہ شبانہ کی صاحبزادی' } },
  monogram: 'A · Z', hashtag: '#AyaanZoyaKaNikah',
  invocation: 'بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
  heroLine: { en: 'Together with their families', ur: 'اپنے اہلِ خانہ کے ساتھ' },
  date: '2027-04-10T19:30:00+05:30', city: { en: 'Lucknow', ur: 'لکھنؤ' }, siteUrl: 'https://example.com/ayaan-zoya',
  message: { en: 'With the blessings of Allah and the duas of our elders, we request the pleasure of your company at the Nikah of our children, in the city of tehzeeb and gardens.', ur: 'اللہ تعالیٰ کے فضل اور بزرگوں کی دعاؤں سے، تہذیب اور باغوں کے شہر میں ہمارے بچوں کے نکاح میں آپ کی شرکت ہمارے لیے باعثِ مسرت ہوگی۔' },
  guests: { rizvi: { en: 'Respected Rizvi Sahab & family', ur: 'محترم رضوی صاحب اور اہلِ خانہ' } },
  titles: { date: [null, { en: 'Scratch the mehndi', ur: 'مہندی کھرچیں' }], count: [null, { en: 'Days until the Nikah', ur: 'نکاح میں باقی دن' }] },
  photos: {
    hero: 'assets/img/bridal-mehndi.webp', invite: 'assets/img/hands-bw.webp', venue: 'assets/img/imambara-hall.webp', end: 'assets/img/chota-imambara.webp',
    gallery: [{ src: 'assets/img/chota-imambara.webp', alt: 'Chota Imambara' }, { src: 'assets/img/henna-red.webp', alt: 'Henna' }, { src: 'assets/img/imambara-arch.webp', alt: 'Bara Imambara' }, { src: 'assets/img/henna-velvet.webp', alt: 'Mehndi' }, { src: 'assets/img/imambara-hall.webp', alt: 'A grand hall' }]
  },
  story: [
    { when: { en: 'Muharram 2022', ur: 'محرم 2022' }, title: { en: 'Under the old arches', ur: 'پرانی محرابوں کے نیچے' }, text: { en: 'A heritage walk, a sudden downpour, and one shared umbrella under the Imambara arches.', ur: 'ایک ہیریٹیج واک، اچانک بارش، اور امام باڑے کی محرابوں تلے ایک چھتری۔' }, photo: 'assets/img/imambara-arch.webp' },
    { when: { en: 'Eid 2023', ur: 'عید 2023' }, title: { en: 'Sheer khurma & shayari', ur: 'شیر خرما اور شاعری' }, text: { en: 'He recited Faiz; she corrected one word. He has never forgotten it.', ur: 'انہوں نے فیض سنایا، انہوں نے ایک لفظ درست کیا۔ وہ آج تک نہیں بھولے۔' }, photo: 'assets/img/arch-view.webp' },
    { when: { en: 'Chand Raat 2024', ur: 'چاند رات 2024' }, title: { en: 'Mehndi on Chand Raat', ur: 'چاند رات کی مہندی' }, text: { en: 'Her name hidden in the henna on his sister’s hand — the families caught on.', ur: 'بہن کے ہاتھ کی مہندی میں چھپا ان کا نام — گھر والے سمجھ گئے۔' }, photo: 'assets/img/henna-velvet.webp' },
    { when: { en: 'Winter 2026', ur: 'سردیاں 2026' }, title: { en: 'The mangni', ur: 'منگنی' }, text: { en: 'Rings, rose petals and a dua from both grandmothers.', ur: 'انگوٹھیاں، گلاب کی پتیاں اور دونوں دادیوں کی دعا۔' }, photo: 'assets/img/mosque-dusk.webp' }
  ],
  events: [
    { id: 'manjha', icon: 'haldi', name: { en: 'Manjha', ur: 'مانجھا' }, start: '2027-04-08T16:00:00+05:30', hours: 3, venue: { en: 'Naqvi Manzil, Hazratganj', ur: 'نقوی منزل، حضرت گنج' }, address: 'Hazratganj, Lucknow, Uttar Pradesh 226001', note: { en: 'Haldi, ubtan & dholak geet', ur: 'ہلدی، ابٹن اور ڈھولک کے گیت' } },
    { id: 'mehndi', icon: 'mehndi', name: { en: 'Mehndi', ur: 'مہندی' }, start: '2027-04-09T19:00:00+05:30', hours: 4, venue: { en: 'The Baradari Gardens', ur: 'بارہ دری باغ' }, address: 'Kaiserbagh, Lucknow, Uttar Pradesh 226001', note: { en: 'Henna, qawwali & kebabs', ur: 'مہندی، قوالی اور کباب' } },
    { id: 'nikah', icon: 'moon', main: true, name: { en: 'Nikah', ur: 'نکاح' }, start: '2027-04-10T19:30:00+05:30', hours: 4, venue: { en: 'The Baradari Gardens', ur: 'بارہ دری باغ' }, address: 'Kaiserbagh, Lucknow, Uttar Pradesh 226001', note: { en: 'Nikah after Isha, followed by dinner', ur: 'عشاء کے بعد نکاح، پھر طعام' } },
    { id: 'walima', icon: 'reception', name: { en: 'Walima', ur: 'ولیمہ' }, start: '2027-04-11T20:00:00+05:30', hours: 4, venue: { en: 'Awadh Grand Hall', ur: 'اودھ گرانڈ ہال' }, address: 'Gomti Nagar, Lucknow, Uttar Pradesh 226010', note: { en: 'Awadhi dawat — biryani, galouti & sheermal', ur: 'اودھی دعوت — بریانی، گلاوٹی اور شیرمال' } }
  ],
  venue: { name: { en: 'The Baradari Gardens, Kaiserbagh', ur: 'بارہ دری باغ، قیصر باغ' }, address: 'Kaiserbagh, Lucknow, Uttar Pradesh 226001', map: 'Safed Baradari Lucknow' },
  dress: [
    { event: 'manjha', colors: ['#f6c231', '#9bb39b', '#ffffff'], text: { en: 'Yellow & sage', ur: 'پیلا اور ہلکا سبز' } },
    { event: 'mehndi', colors: ['#0f4d3a', '#ebb8c3', '#b8955a'], text: { en: 'Green & blush, gota-patti', ur: 'سبز اور گلابی، گوٹا پٹی' } },
    { event: 'nikah', colors: ['#fbf6ee', '#b8955a', '#ebb8c3'], text: { en: 'Chikankari, ivory & gold', ur: 'چکن کاری، ہاتھی دانت اور سنہرا' } },
    { event: 'walima', colors: ['#23392f', '#b8955a', '#8a2f45'], text: { en: 'Sherwani & farshi gharara', ur: 'شیروانی اور فرشی غرارہ' } }
  ],
  travel: [
    { icon: 'plane', title: { en: 'Arriving', ur: 'آمد' }, text: { en: 'Chaudhary Charan Singh Airport (LKO) is 35 min away.', ur: 'چودھری چرن سنگھ ہوائی اڈہ (LKO) 35 منٹ کی دوری پر ہے۔' } },
    { icon: 'stay', title: { en: 'Staying', ur: 'قیام' }, text: { en: 'Rooms are reserved in Hazratganj for 8–11 April.', ur: 'حضرت گنج میں 8 تا 11 اپریل کمرے محفوظ ہیں۔' } },
    { icon: 'car', title: { en: 'Getting around', ur: 'آمد و رفت' }, text: { en: 'Cars between the hotel and all venues, every evening.', ur: 'ہوٹل اور تمام مقامات کے درمیان ہر شام گاڑیاں۔' } }
  ],
  families: {
    bride: { title: { en: 'The Naqvi Family', ur: 'نقوی خاندان' }, names: { en: 'Begum Akhtar Jahan & Mr. Sajjad Naqvi\nMrs. Shabana & Mr. Imran Naqvi', ur: 'بیگم اختر جہاں و جناب سجاد نقوی\nمحترمہ شبانہ و جناب عمران نقوی' } },
    groom: { title: { en: 'The Rizvi Family', ur: 'رضوی خاندان' }, names: { en: 'Begum Zahida & Mr. Mohsin Rizvi\nMrs. Nasreen & Mr. Faisal Rizvi', ur: 'بیگم زاہدہ و جناب محسن رضوی\nمحترمہ نسرین و جناب فیصل رضوی' } }
  },
  rsvp: { endpoint: '', deadline: '2027-03-20T23:59:00+05:30', maxGuests: 6 },
  wishes: [
    { name: 'Dadi Jaan', text: { en: 'Allah aap dono ko hamesha khush rakhe. ❤', ur: 'اللہ آپ دونوں کو ہمیشہ خوش رکھے۔ ❤' } },
    { name: 'Sana', text: { en: 'The shayari couple — Faiz would approve!', ur: 'شاعری والی جوڑی — فیض بھی داد دیتے!' } },
    { name: 'Rehan Bhai', text: { en: 'Mubarak ho! See you at the galouti counter.', ur: 'مبارک ہو! گلاوٹی کاؤنٹر پر ملتے ہیں۔' } },
    { name: 'Amna Khala', text: { en: 'May your home bloom like a Lucknowi garden.', ur: 'آپ کا گھر لکھنؤ کے باغ کی طرح مہکے۔' } }
  ],
  contact: { name: { en: 'Rehan (groom’s brother)', ur: 'ریحان (دولہا کے بھائی)' }, phone: '+910000000004' },
  media: { music: 'assets/audio/music.mp3', musicVolume: .5, sfx: { open: 'assets/audio/open.mp3', reveal: 'assets/audio/reveal.mp3', scratch: 'assets/audio/scratch.mp3' } },
  credits: 'Photos: CC-licensed · <a href="assets/img/credits.html">credits</a> · music generated'
};
