/* Sample 1 — Chandni Mahal. ⚠ All names, dates, places and numbers are DEMO data. */
window.INVITE = {
  id: 's1', langs: ['en', 'hi'],
  groom: { name: { en: 'Vihaan', hi: 'विहान' }, parents: { en: 'Son of Mrs. Kavita & Mr. Arvind Rathore', hi: 'श्रीमती कविता एवं श्री अरविंद राठौड़ के सुपुत्र' } },
  bride: { name: { en: 'Ananya', hi: 'अनन्या' }, parents: { en: 'Daughter of Mrs. Ritu & Mr. Sanjay Mehta', hi: 'श्रीमती ऋतु एवं श्री संजय मेहता की सुपुत्री' } },
  monogram: 'V • A', hashtag: '#VihaanWedsAnanya',
  invocation: '॥ शुभ विवाह ॥',
  heroLine: { en: 'We’re getting married', hi: 'हम विवाह कर रहे हैं' },
  date: '2027-02-21T19:00:00+05:30', city: { en: 'Udaipur', hi: 'उदयपुर' }, siteUrl: 'https://example.com/vihaan-ananya',
  message: { en: 'With the blessings of our elders, we invite you to share in our joy as we begin our forever under the moonlit sky of Udaipur.', hi: 'बड़ों के आशीर्वाद के साथ, उदयपुर के चाँदनी भरे आसमान तले हमारे नए जीवन की शुरुआत में शामिल होकर हमारी ख़ुशी बढ़ाइए।' },
  guests: { shr7: { en: 'Dear Sharma Family', hi: 'आदरणीय शर्मा परिवार' } },
  titles: { date: [null, { en: 'Scratch the moon', hi: 'चाँद को खुरचें' }], count: [null, { en: 'Counting the nights', hi: 'रातें गिन रहे हैं' }] },
  photos: {
    invite: 'assets/img/couple-smile.webp', venue: 'assets/img/lake-palace.webp', end: 'assets/img/city-palace.webp',
    gallery: [{ src: 'assets/img/lake-palace.webp', alt: 'Lake Palace, Udaipur' }, { src: 'assets/img/couple-smile.webp', alt: 'The couple' }, { src: 'assets/img/sunset-city.webp', alt: 'Udaipur at sunset' }, { src: 'assets/img/jal-mahal.webp', alt: 'Jal Mahal' }, { src: 'assets/img/courtyard.webp', alt: 'City Palace courtyard' }]
  },
  story: [
    { when: { en: 'Winter 2022', hi: 'सर्दियाँ 2022' }, title: { en: 'A sunset over Pichola', hi: 'पिछोला पर सूर्यास्त' }, text: { en: 'Two friends-of-friends, one rooftop café, and a sunset neither wanted to end.', hi: 'दोस्तों के दोस्त, एक रूफ़टॉप कैफ़े, और एक सूर्यास्त जो कोई ख़त्म नहीं करना चाहता था।' }, photo: 'assets/img/sunset-city.webp' },
    { when: { en: 'Spring 2023', hi: 'बसंत 2023' }, title: { en: 'Lost in the City Palace', hi: 'सिटी पैलेस में खोए' }, text: { en: 'A wrong turn, a mirrored courtyard, and the longest conversation of our lives.', hi: 'एक ग़लत मोड़, शीशों वाला आँगन, और ज़िंदगी की सबसे लंबी बातचीत।' }, photo: 'assets/img/courtyard.webp' },
    { when: { en: 'Diwali 2024', hi: 'दिवाली 2024' }, title: { en: 'Meeting the families', hi: 'परिवारों से मुलाक़ात' }, text: { en: 'Two families, a hundred diyas, and far too many sweets.', hi: 'दो परिवार, सौ दीये, और बहुत सारी मिठाइयाँ।' }, photo: 'assets/img/diya.webp' },
    { when: { en: 'Full moon, 2026', hi: 'पूर्णिमा, 2026' }, title: { en: 'The proposal', hi: 'प्रस्ताव' }, text: { en: 'A boat, a lake palace glowing behind us, and one very nervous “will you?”', hi: 'एक नाव, पीछे जगमगाता जल महल, और एक घबराया हुआ “क्या तुम…?”' }, photo: 'assets/img/jal-mahal.webp' }
  ],
  events: [
    { id: 'mehndi', icon: 'mehndi', name: { en: 'Mehndi', hi: 'मेहंदी' }, start: '2027-02-19T16:00:00+05:30', hours: 4, venue: { en: 'Haveli Courtyard, Mehta Niwas', hi: 'हवेली आँगन, मेहता निवास' }, address: 'Gangaur Ghat Marg, Udaipur, Rajasthan 313001', note: { en: 'Henna, folk songs & chai', hi: 'मेहंदी, लोकगीत और चाय' } },
    { id: 'haldi', icon: 'haldi', name: { en: 'Haldi', hi: 'हल्दी' }, start: '2027-02-20T11:00:00+05:30', hours: 3, venue: { en: 'Poolside Lawns, Chandni Bagh', hi: 'पूलसाइड लॉन, चाँदनी बाग़' }, address: 'Lake Pichola, Udaipur, Rajasthan 313001', note: { en: 'Turmeric, marigolds & laughter', hi: 'हल्दी, गेंदे और हँसी' } },
    { id: 'sangeet', icon: 'sangeet', name: { en: 'Sangeet', hi: 'संगीत' }, start: '2027-02-20T19:30:00+05:30', hours: 4, venue: { en: 'Moonlight Terrace, Chandni Bagh', hi: 'मूनलाइट टैरेस, चाँदनी बाग़' }, address: 'Lake Pichola, Udaipur, Rajasthan 313001', note: { en: 'Performances by both families', hi: 'दोनों परिवारों की प्रस्तुतियाँ' } },
    { id: 'wedding', icon: 'wedding', main: true, name: { en: 'Wedding', hi: 'विवाह' }, start: '2027-02-21T19:00:00+05:30', hours: 5, venue: { en: 'Lakeside Mandap, Chandni Bagh', hi: 'झील किनारे मंडप, चाँदनी बाग़' }, address: 'Lake Pichola, Udaipur, Rajasthan 313001', note: { en: 'Pheras at 8:30 PM under the full moon', hi: 'पूर्णिमा की रात 8:30 बजे फेरे' } },
    { id: 'reception', icon: 'reception', name: { en: 'Reception', hi: 'रिसेप्शन' }, start: '2027-02-22T20:00:00+05:30', hours: 4, venue: { en: 'The Durbar Hall, Chandni Bagh', hi: 'दरबार हॉल, चाँदनी बाग़' }, address: 'Lake Pichola, Udaipur, Rajasthan 313001', note: { en: 'Dinner, music & dancing', hi: 'रात्रिभोज, संगीत और नृत्य' } }
  ],
  venue: { name: { en: 'Chandni Bagh, Lake Pichola', hi: 'चाँदनी बाग़, पिछोला झील' }, address: 'Lake Pichola, Udaipur, Rajasthan 313001', map: 'Lake Pichola, Udaipur' },
  dress: [
    { event: 'mehndi', colors: ['#2f7d4f', '#f2a7b8', '#f7d774'], text: { en: 'Greens & pinks, florals welcome', hi: 'हरा और गुलाबी, फूलों वाले प्रिंट' } },
    { event: 'haldi', colors: ['#f6c231', '#ffffff', '#f28c28'], text: { en: 'Yellow & white', hi: 'पीला और सफ़ेद' } },
    { event: 'sangeet', colors: ['#2b2f77', '#9b59b6', '#e6c37a'], text: { en: 'Jewel tones & sparkle', hi: 'गहरे रंग और चमक' } },
    { event: 'wedding', colors: ['#9c1c2b', '#e6c37a', '#fbf3e4'], text: { en: 'Reds, golds, ivory', hi: 'लाल, सुनहरा, आइवरी' } },
    { event: 'reception', colors: ['#0f1a3c', '#c0c7d9', '#e6c37a'], text: { en: 'Midnight blue & silver', hi: 'गहरा नीला और चाँदी' } }
  ],
  travel: [
    { icon: 'plane', title: { en: 'Arriving', hi: 'पहुँचना' }, text: { en: 'Maharana Pratap Airport (UDR) is 30 min away. Share your flight and we’ll pick you up.', hi: 'महाराणा प्रताप हवाई अड्डा (UDR) 30 मिनट दूर है। फ़्लाइट बताइए, हम लेने आएँगे।' } },
    { icon: 'stay', title: { en: 'Staying', hi: 'ठहरना' }, text: { en: 'Rooms are reserved at Chandni Bagh for 19–22 Feb.', hi: 'चाँदनी बाग़ में 19–22 फ़रवरी के लिए कमरे आरक्षित हैं।' } },
    { icon: 'boat', title: { en: 'Getting around', hi: 'आना-जाना' }, text: { en: 'Boats and shuttles every 30 min from the city ghats.', hi: 'शहर के घाटों से हर 30 मिनट पर नाव और शटल।' } }
  ],
  families: {
    bride: { title: { en: 'The Mehta Family', hi: 'मेहता परिवार' }, names: { en: 'Smt. Shanti & Shri Mohanlal Mehta\nMrs. Ritu & Mr. Sanjay Mehta', hi: 'श्रीमती शांति एवं श्री मोहनलाल मेहता\nश्रीमती ऋतु एवं श्री संजय मेहता' } },
    groom: { title: { en: 'The Rathore Family', hi: 'राठौड़ परिवार' }, names: { en: 'Smt. Kamla & Shri Bhawani Singh Rathore\nMrs. Kavita & Mr. Arvind Rathore', hi: 'श्रीमती कमला एवं श्री भवानी सिंह राठौड़\nश्रीमती कविता एवं श्री अरविंद राठौड़' } }
  },
  rsvp: { endpoint: '', deadline: '2027-01-31T23:59:00+05:30', maxGuests: 8 },
  wishes: [
    { name: 'Riya', text: { en: 'May every full moon remind you of this night. ✨', hi: 'हर पूर्णिमा आपको यह रात याद दिलाए। ✨' } },
    { name: 'Kabir & Tara', text: { en: 'From college fests to the mandap — so happy for you!', hi: 'कॉलेज फ़ेस्ट से मंडप तक — बहुत ख़ुशी है!' } },
    { name: 'Nani', text: { en: 'Sada sukhi raho, mere bachchon. ❤', hi: 'सदा सुखी रहो, मेरे बच्चों। ❤' } },
    { name: 'Arjun', text: { en: 'Save me a spot on the Sangeet floor!', hi: 'संगीत के फ़्लोर पर मेरी जगह रखना!' } }
  ],
  contact: { name: { en: 'Rohan (bride’s brother)', hi: 'रोहन (वधू के भाई)' }, phone: '+910000000001' },
  media: { intro: 'assets/video/intro.mp4', introPoster: 'assets/img/intro-poster.webp', hero: 'assets/video/hero-loop.mp4', heroPoster: 'assets/img/hero-poster.webp', music: 'assets/audio/music.mp3', sfx: { open: 'assets/audio/chime.mp3', reveal: 'assets/audio/reveal.mp3', scratch: 'assets/audio/scratch.mp3' } },
  credits: 'Photos: CC-licensed · <a href="assets/img/credits.html">credits</a> · videos & music generated'
};
