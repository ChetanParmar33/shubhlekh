"""Generates samples/6–17/config.js + index.html (+ credits.html) from the content below.
All names, dates, venues and numbers are DEMO data. Run: python3 tools/build_samples.py"""
import json, os, html

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'samples')

def b(en, gu): return {'en': en, 'gu': gu}

# ── shared building blocks ─────────────────────────────────────────────
EV = {
    'sagai':     (b('Sagai', 'સગાઈ'), 'rings', b('Gol-dhana, rings and blessings', 'ગોળ-ધાણા, વીંટી અને આશીર્વાદ')),
    'ganesh':    (b('Ganesh Sthapana', 'ગણેશ સ્થાપના'), 'lamp', b('Inviting Ganpati Bappa to bless the wedding', 'લગ્નના આશીર્વાદ માટે ગણપતિ બાપ્પાનું સ્થાપન')),
    'mandap':    (b('Mandap Muhurat', 'મંડપ મુહૂર્ત'), 'lamp', b('The first pillar of the mandap is blessed', 'મંડપના પ્રથમ સ્તંભનું પૂજન')),
    'grah':      (b('Grah Shanti', 'ગ્રહ શાંતિ'), 'lamp', b('A peaceful havan with both families', 'બંને પરિવાર સાથે શાંતિ હવન')),
    'pithi':     (b('Pithi', 'પીઠી'), 'haldi', b('Turmeric, laughter and lots of colour', 'પીઠી, હાસ્ય અને રંગોની રમઝટ')),
    'mehndi':    (b('Mehndi Rasam', 'મહેંદી રસમ'), 'mehndi', b('Henna, folk songs and chai', 'મહેંદી, લોકગીતો અને ચા')),
    'mameru':    (b('Mameru', 'મામેરું'), 'rings', b('The mosal arrives with gifts for the bride', 'મોસાળ પક્ષ કન્યા માટે ભેટ-સોગાદ લઈને પધારે')),
    'garba':     (b('Raas Garba', 'રાસ ગરબા'), 'sangeet', b('Bring your dandiyas — dhol till midnight', 'દાંડિયા સાથે લાવજો — મધરાત સુધી ઢોલ')),
    'sangeet':   (b('Sangeet Sandhya', 'સંગીત સંધ્યા'), 'sangeet', b('Songs and performances by both families', 'બંને પરિવારનાં ગીતો અને પ્રસ્તુતિ')),
    'lagna':     (b('Hast Melap', 'હસ્તમેળાપ'), 'wedding', b('Hast Melap at the auspicious muhurat, followed by dinner', 'શુભ મુહૂર્તે હસ્તમેળાપ, ત્યારબાદ ભોજન')),
    'reception': (b('Reception', 'સ્વાગત સમારંભ'), 'reception', b('Dinner, music and blessings', 'ભોજન, સંગીત અને શુભાશિષ')),
}
DRESS = {
    'pithi': b('Yellow & white — clothes that can get turmeric on them', 'પીળો અને સફેદ — પીઠીના ડાઘ લાગે તો વાંધો નહીં'),
    'mehndi': b('Greens and pinks, florals welcome', 'લીલો અને ગુલાબી, ફૂલોની ભાત'),
    'garba': b('Chaniya choli & kediyu — the brighter the better', 'ચણિયાચોળી અને કેડિયું — જેટલું રંગીન એટલું સરસ'),
    'sangeet': b('Jewel tones and a little sparkle', 'ઘેરા રંગ અને થોડી ચમક'),
    'lagna': b('Festive traditional — reds, golds and ivory', 'પરંપરાગત — લાલ, સોનેરી અને આઇવરી'),
    'reception': b('Evening formal — Indo-western welcome', 'સાંજનો ફૉર્મલ પહેરવેશ — ઇન્ડો-વેસ્ટર્ન પણ ચાલશે'),
    'sagai': b('Pastels and champagne', 'પેસ્ટલ અને શેમ્પેન રંગો'),
    'mameru': b('Traditional, family colours', 'પરંપરાગત, પરિવારના રંગો'),
}
STORIES = {
    'garba':    (b('Navratri 2022', 'નવરાત્રિ 2022'), b('The same garba circle', 'એક જ ગરબાનું વર્તુળ'), b('Nine nights, one circle, and two people who kept ending up side by side.', 'નવ રાત, એક વર્તુળ, અને બે જણ જે વારંવાર બાજુમાં જ આવી જતાં.')),
    'kite':     (b('Uttarayan 2023', 'ઉત્તરાયણ 2023'), b('A kite on the wrong terrace', 'ખોટા ધાબે આવેલો પતંગ'), b('His kite was cut and landed on her terrace. She refused to give it back without a cup of chai.', 'એનો પતંગ કપાઈને એના ધાબે આવ્યો. એક કપ ચા વગર એણે પતંગ પાછો આપવાની ના પાડી.')),
    'college':  (b('College days', 'કૉલેજના દિવસો'), b('Library partners', 'લાઇબ્રેરીના સાથી'), b('Two seats by the window, one shared highlighter and many unfinished assignments.', 'બારી પાસેની બે ખુરશી, એક જ હાઇલાઇટર અને ઘણા અધૂરા અસાઇનમેન્ટ.')),
    'families': (b('Diwali 2024', 'દિવાળી 2024'), b('The families meet', 'પરિવારોનું મિલન'), b('Mathiya, chorafali and a long talk on the jhula — both mothers agreed before dessert.', 'મઠિયાં, ચોળાફળી અને હીંચકે લાંબી વાત — મીઠાઈ પહેલાં જ બંને મમ્મીઓ સહમત.')),
    'proposal': (b('Sharad Purnima 2025', 'શરદ પૂનમ 2025'), b('The proposal', 'પ્રસ્તાવ'), b('Doodh-poha under the full moon and one very nervous question.', 'પૂનમના ચાંદ નીચે દૂધ-પૌંઆ અને એક ગભરાયેલો સવાલ.')),
    'sagai':    (b('Labh Pancham 2025', 'લાભ પાંચમ 2025'), b('Gol-dhana', 'ગોળ-ધાણા'), b('A spoon of gol-dhana, two rings and a room full of happy relatives.', 'એક ચમચી ગોળ-ધાણા, બે વીંટી અને ખુશખુશાલ સગાંઓથી ભરેલો ઓરડો.')),
    'pol':      (b('Monsoon 2022', 'ચોમાસું 2022'), b('Lost in the pol', 'પોળમાં ખોવાયાં'), b('A heritage walk, a sudden shower and shelter under the same carved jharukho.', 'હેરિટેજ વૉક, અચાનક વરસાદ અને એક જ કોતરેલા ઝરૂખા નીચે આશરો.')),
    'rann':     (b('Rann Utsav 2023', 'રણ ઉત્સવ 2023'), b('The white desert', 'સફેદ રણ'), b('A full moon over the salt flats — he forgot the camera, she remembered everything.', 'મીઠાના રણ પર પૂનમનો ચાંદ — એ કૅમેરા ભૂલી ગયો, એને બધું યાદ રહી ગયું.')),
    'vav':      (b('Winter 2022', 'શિયાળો 2022'), b('Down the stepwell', 'વાવનાં પગથિયાં'), b('Counting the steps of the old vav, they lost count and found each other.', 'જૂની વાવનાં પગથિયાં ગણતાં ગણતાં ગણતરી ભૂલ્યાં અને એકબીજાને મળ્યાં.')),
    'darshan':  (b('Janmashtami 2023', 'જન્માષ્ટમી 2023'), b('Darshan together', 'સાથે દર્શન'), b('Both families in the same mangla darshan queue at dawn. The rest, as they say, was blessed.', 'પરોઢે મંગળા દર્શનની એક જ લાઇનમાં બંને પરિવાર. બાકીનું તો શ્રીજીની કૃપા.')),
    'spring':   (b('Holi 2023', 'હોળી 2023'), b('Kesudo colours', 'કેસૂડાનો રંગ'), b('She brought natural kesudo colour; he brought a water balloon. She still won.', 'એ કેસૂડાનો કુદરતી રંગ લાવી, એ પાણીનો ફુગ્ગો. છતાં જીતી તો એ જ.')),
    'temple':   (b('Paryushan 2023', 'પર્યુષણ 2023'), b('A quiet beginning', 'શાંત શરૂઆત'), b('They met while volunteering at the derasar — a simple hello that became everything.', 'દેરાસરમાં સેવા કરતાં મળ્યાં — એક સાદું નમસ્તે જે બધું બની ગયું.')),
    'loom':     (b('Spring 2023', 'વસંત 2023'), b('At the weavers’ street', 'વણકરોની શેરીમાં'), b('Watching a patola take shape thread by thread, they realised some things are worth the wait.', 'દોરે દોરે પટોળું બનતું જોઈ સમજાયું કે કેટલીક વસ્તુઓ રાહ જોવા જેવી હોય છે.')),
    'chai':     (b('Winter 2023', 'શિયાળો 2023'), b('The chai stop', 'ચાની કીટલી'), b('Every evening, the same kitli, two cutting chais and a conversation that never ended.', 'દર સાંજે એ જ કીટલી, બે કટિંગ ચા અને ક્યારેય પૂરી ન થતી વાત.')),
}
WISHES = [
    ('Ba', b('Sada sukhi raho, mara dikrao! ❤', 'સદા સુખી રહો, મારાં દીકરાઓ! ❤')),
    ('Mama-Mami', b('We’ll bring the mameru — you bring the smiles!', 'મામેરું અમે લાવીશું — સ્મિત તમે લાવજો!')),
    ('Hiral', b('Save me a spot in the garba circle!', 'ગરબાના વર્તુળમાં મારી જગ્યા રાખજો!')),
    ('Kaka', b('Wishing you a lifetime of laughter and dhokla.', 'જીવનભર હાસ્ય અને ઢોકળાંની શુભેચ્છા.')),
    ('Neel & Tanvi', b('From college canteen to the mandap — so proud of you!', 'કૉલેજ કેન્ટીનથી મંડપ સુધી — તમારા પર ગર્વ છે!')),
    ('Masi', b('May your home always be full of light and love.', 'તમારું ઘર સદા પ્રકાશ અને પ્રેમથી ભર્યું રહે.')),
    ('Bhavik', b('The jodi everyone was waiting for!', 'જે જોડીની સૌ રાહ જોતા હતા!')),
    ('Dada', b('Jai Shri Krishna — blessings from all of us.', 'જય શ્રી કૃષ્ણ — અમારા સૌના આશીર્વાદ.')),
]
TRAVEL = {
    'Ahmedabad': ('Sardar Vallabhbhai Patel Airport (AMD)', 'સરદાર વલ્લભભાઈ પટેલ એરપોર્ટ (AMD)', 'Ahmedabad Junction (Kalupur)', 'અમદાવાદ જંક્શન (કાલુપુર)'),
    'Vadodara': ('Vadodara Airport (BDQ)', 'વડોદરા એરપોર્ટ (BDQ)', 'Vadodara Junction', 'વડોદરા જંક્શન'),
    'Rajkot': ('Rajkot International Airport (HSR)', 'રાજકોટ આંતરરાષ્ટ્રીય એરપોર્ટ (HSR)', 'Rajkot Junction', 'રાજકોટ જંક્શન'),
    'Patan': ('Ahmedabad Airport (AMD), about 2 hours away', 'અમદાવાદ એરપોર્ટ (AMD), આશરે 2 કલાક', 'Patan railway station', 'પાટણ રેલવે સ્ટેશન'),
    'Surat': ('Surat Airport (STV)', 'સુરત એરપોર્ટ (STV)', 'Surat railway station', 'સુરત રેલવે સ્ટેશન'),
    'Bhuj': ('Bhuj Airport (BHJ)', 'ભુજ એરપોર્ટ (BHJ)', 'Bhuj railway station', 'ભુજ રેલવે સ્ટેશન'),
    'Gandhinagar': ('Ahmedabad Airport (AMD), 25 minutes away', 'અમદાવાદ એરપોર્ટ (AMD), 25 મિનિટ', 'Gandhinagar Capital station', 'ગાંધીનગર કેપિટલ સ્ટેશન'),
    'Jamnagar': ('Jamnagar Airport (JGA)', 'જામનગર એરપોર્ટ (JGA)', 'Jamnagar railway station', 'જામનગર રેલવે સ્ટેશન'),
    'Anand': ('Vadodara Airport (BDQ), 45 minutes away', 'વડોદરા એરપોર્ટ (BDQ), 45 મિનિટ', 'Anand Junction', 'આણંદ જંક્શન'),
    'Bhavnagar': ('Bhavnagar Airport (BHU)', 'ભાવનગર એરપોર્ટ (BHU)', 'Bhavnagar Terminus', 'ભાવનગર ટર્મિનસ'),
}
CITY_GU = {'Ahmedabad': 'અમદાવાદ', 'Vadodara': 'વડોદરા', 'Rajkot': 'રાજકોટ', 'Patan': 'પાટણ', 'Surat': 'સુરત', 'Bhuj': 'ભુજ', 'Gandhinagar': 'ગાંધીનગર', 'Jamnagar': 'જામનગર', 'Anand': 'આણંદ', 'Bhavnagar': 'ભાવનગર'}

# ── the 12 samples ─────────────────────────────────────────────────────
S = [
 dict(id=6, title='Kankotri', color='#b3121f', fonts='Rozha+One&family=Hind+Vadodara:wght@400;500;600&family=Shrikhand',
      groom=('Harsh', 'હર્ષ', 'Patel', 'પટેલ', ('Nayna', 'નયના'), ('Mahesh', 'મહેશ')), bride=('Pooja', 'પૂજા', 'Shah', 'શાહ', ('Varsha', 'વર્ષા'), ('Kirit', 'કિરીટ')),
      city='Ahmedabad', date='2027-01-24T19:30:00+05:30', mono='H • P', tag='#HarshNiPooja', inv='॥ શ્રી ગણેશાય નમઃ ॥',
      hero=b('With the blessings of Shri Ganesh', 'શ્રી ગણેશના આશીર્વાદ સાથે'),
      msg=b('With the blessings of our kuldevi and our elders, we joyfully invite you and your family to grace the wedding of our children.', 'કુળદેવી અને વડીલોના આશીર્વાદથી, અમારાં સંતાનોના શુભ લગ્ન પ્રસંગે આપને સહપરિવાર પધારવા ભાવભીનું આમંત્રણ પાઠવીએ છીએ.'),
      venue=('Shubh Vatika Party Plot', 'શુભ વાટિકા પાર્ટી પ્લૉટ', 'S.G. Highway, Thaltej, Ahmedabad 380059', 'Shubh Vatika Party Plot Thaltej Ahmedabad'),
      events=[('ganesh', -2, '09:00', 2), ('mandap', -1, '10:00', 2), ('pithi', -1, '16:00', 3), ('lagna', 0, '19:30', 5), ('reception', 1, '20:00', 4)],
      dresscolors=[['#f6c21a', '#ffffff', '#f28c28'], ['#b3121f', '#f6c21a', '#fff4dc'], ['#3d1f6b', '#e9b949', '#f4d6c6']],
      photos=dict(hero='couple', invite='couple-2', venue='rangoli', end='marigold', gallery=['couple', 'puja', 'kumkum', 'ganesh', 'puja-2']),
      stories=[('families', 'thali'), ('proposal', 'puja'), ('sagai', 'kumkum')], wishes=[0, 3, 5, 7],
      date_title=b('Scratch the kumkum', 'કંકુ ઘસીને જુઓ')),
 dict(id=7, title='Panetar', color='#b0141e', fonts='Great+Vibes&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Lato:wght@400;700&family=Noto+Serif+Gujarati:wght@400;600',
      groom=('Nirav', 'નિરવ', 'Desai', 'દેસાઈ', ('Rekha', 'રેખા'), ('Bharat', 'ભરત')), bride=('Isha', 'ઈશા', 'Mehta', 'મહેતા', ('Sonal', 'સોનલ'), ('Rajesh', 'રાજેશ')),
      city='Vadodara', date='2027-02-07T18:45:00+05:30', mono='N & I', tag='#NiravWedsIsha', inv='॥ શુભ લગ્ન ॥',
      hero=b('Together with our families', 'અમારા પરિવારો સાથે'),
      msg=b('In the colours of a bride’s panetar — red for love, white for a pure beginning — we invite you to bless our new journey.', 'કન્યાના પાનેતરના રંગોમાં — લાલ પ્રેમનો, સફેદ પવિત્ર શરૂઆતનો — અમારી નવી સફરને આશીર્વાદ આપવા પધારશો.'),
      venue=('Laxmi Vilas Lawns', 'લક્ષ્મી વિલાસ લૉન્સ', 'Pratapgunj, Vadodara 390002', 'Laxmi Vilas Palace Vadodara'),
      events=[('mehndi', -2, '16:00', 4), ('grah', -1, '10:00', 2), ('sangeet', -1, '19:30', 4), ('lagna', 0, '18:45', 5), ('reception', 1, '20:00', 4)],
      dresscolors=[['#2f7d4f', '#f2a7b8', '#f7d774'], ['#6d1b7b', '#d4a24c', '#fff'], ['#b0141e', '#fffaf4', '#d4a24c']],
      photos=dict(hero='mehndi', invite='couple', venue='couple-2', end='embroidery', gallery=['mehndi-2', 'couple', 'mehndi-3', 'bandhani', 'mehndi-4']),
      stories=[('college', 'mehndi-3'), ('chai', 'bandhani'), ('proposal', 'mehndi-2')], wishes=[5, 1, 4, 0],
      date_title=b('Scratch the bandhani', 'બાંધણી ઘસીને જુઓ')),
 dict(id=8, title='Gharchola', color='#7d0d16', fonts='Abril+Fatface&family=Mukta+Vaani:wght@400;500;600&family=Baloo+Bhai+2:wght@500;700',
      groom=('Chirag', 'ચિરાગ', 'Dave', 'દવે', ('Hansa', 'હંસા'), ('Pravin', 'પ્રવીણ')), bride=('Komal', 'કોમલ', 'Joshi', 'જોષી', ('Meena', 'મીના'), ('Jayesh', 'જયેશ')),
      city='Rajkot', date='2027-02-14T20:00:00+05:30', mono='C · K', tag='#ChiragKomalNaLagna', inv='॥ શ્રી ગણેશાય નમઃ ॥',
      hero=b('Our families invite you', 'અમારા પરિવાર આપને આમંત્રે છે'),
      msg=b('Like the gharchola woven with golden zari, may two families be woven into one. Please join us with your loved ones.', 'સોનેરી જરીથી વણાયેલા ઘરચોળાની જેમ બે પરિવાર એક બને. આપ સ્વજનો સાથે અવશ્ય પધારશો.'),
      venue=('Rangila Party Plot', 'રંગીલા પાર્ટી પ્લૉટ', 'Kalawad Road, Rajkot 360005', 'Kalawad Road Rajkot'),
      events=[('mandap', -2, '09:30', 2), ('mameru', -1, '11:00', 3), ('garba', -1, '20:30', 4), ('lagna', 0, '20:00', 5), ('reception', 1, '20:00', 4)],
      dresscolors=[['#7d0d16', '#1f6b3a', '#e2b54e'], ['#ff3d8b', '#ffb21e', '#2a4ca6'], ['#7d0d16', '#e2b54e', '#fff4dc']],
      photos=dict(hero='red-cloth', invite='couple', venue='marigold', end='couple-2', gallery=['couple', 'red-cloth-2', 'white-cloth', 'couple-2', 'marigold']),
      stories=[('chai', 'red-cloth-2'), ('families', 'marigold'), ('sagai', 'white-cloth')], wishes=[1, 3, 2, 6],
      date_title=b('Scratch the zari', 'જરી ઘસીને જુઓ')),
 dict(id=9, title='Patola', color='#5b1236', fonts='Bodoni+Moda:ital,wght@0,500;0,700;1,500&family=Anek+Gujarati:wght@400;500;600',
      groom=('Jay', 'જય', 'Parikh', 'પરીખ', ('Bhavna', 'ભાવના'), ('Dilip', 'દિલીપ')), bride=('Riddhi', 'રિદ્ધિ', 'Trivedi', 'ત્રિવેદી', ('Alpa', 'અલ્પા'), ('Hemant', 'હેમંત')),
      city='Patan', date='2027-03-06T19:00:00+05:30', mono='J ✦ R', tag='#JayRiddhi', inv='॥ શુભ વિવાહ ॥',
      hero=b('Two threads, one beautiful pattern', 'બે દોરા, એક સુંદર ભાત'),
      msg=b('A patola is woven slowly, with patience and love, so the pattern lasts a lifetime. With our families’ blessings, we begin ours.', 'પટોળું ધીરજ અને પ્રેમથી ધીમે ધીમે વણાય છે, જેથી ભાત જીવનભર ટકે. પરિવારના આશીર્વાદથી અમે અમારી ભાત શરૂ કરીએ છીએ.'),
      venue=('Rani Baug Heritage Lawns', 'રાણી બાગ હેરિટેજ લૉન્સ', 'Rani ki Vav Road, Patan 384265', 'Rani ki Vav Patan'),
      events=[('sagai', -2, '18:00', 3), ('pithi', -1, '11:00', 3), ('sangeet', -1, '19:30', 4), ('lagna', 0, '19:00', 5), ('reception', 1, '19:30', 4)],
      dresscolors=[['#5b1236', '#f2b134', '#1d7a6b'], ['#1d7a6b', '#f2b134', '#ffffff'], ['#5b1236', '#f2b134', '#c94f2b']],
      photos=dict(hero='embroidery-3', invite='celebration', venue='loom', end='embroidery-2', gallery=['loom', 'embroidery', 'mirror', 'textile', 'textile-2']),
      stories=[('loom', 'loom'), ('college', 'embroidery'), ('proposal', 'mirror')], wishes=[7, 4, 1, 5],
      date_title=b('Scratch the ikat', 'ઇકત ઘસીને જુઓ')),
 dict(id=10, title='Raas Garba', color='#14112e', fonts='Kumar+One&family=Baloo+Bhai+2:wght@400;500;700',
      groom=('Parth', 'પાર્થ', 'Chokshi', 'ચોક્સી', ('Jigna', 'જિજ્ઞા'), ('Nilesh', 'નિલેશ')), bride=('Hetal', 'હેતલ', 'Mistry', 'મિસ્ત્રી', ('Daksha', 'દક્ષા'), ('Ramesh', 'રમેશ')),
      city='Surat', date='2026-12-12T19:30:00+05:30', mono='P ✺ H', tag='#ParthHetalNoRaas', inv='॥ જય અંબે ॥',
      hero=b('Dhol vagse, raas ramase!', 'ઢોલ વાગશે, રાસ રમાશે!'),
      msg=b('From the garba circle where it all began to the mandap where forever starts — come dance with us!', 'જે ગરબાના વર્તુળમાં બધું શરૂ થયું ત્યાંથી મંડપ સુધી — આવો, સાથે ગરબે ઘૂમીએ!'),
      venue=('Tapi Riverfront Grounds', 'તાપી રિવરફ્રન્ટ ગ્રાઉન્ડ', 'Adajan, Surat 395009', 'Adajan Surat'),
      events=[('mehndi', -2, '16:00', 4), ('garba', -2, '20:30', 4), ('pithi', -1, '11:00', 3), ('lagna', 0, '19:30', 5), ('reception', 1, '20:00', 4)],
      dresscolors=[['#ff3d8b', '#ffb21e', '#2a4ca6'], ['#14112e', '#ff3d8b', '#ffb21e'], ['#b3121f', '#ffb21e', '#ffffff']],
      photos=dict(hero='garba-temple', invite='dancer', venue='troupe', end='raas', gallery=['raas', 'chaniya', 'garba-temple', 'troupe', 'dhol']),
      stories=[('garba', 'dancer'), ('families', 'dhol'), ('proposal', 'chaniya')], wishes=[2, 6, 0, 4],
      date_title=b('Scratch the garbo', 'ગરબો ઘસીને જુઓ')),
 dict(id=11, title='Safed Rann', color='#0d1b3d', fonts='Parisienne&family=Tenor+Sans&family=Hind+Vadodara:wght@400;500;600',
      groom=('Dhruv', 'ધ્રુવ', 'Thakkar', 'ઠક્કર', ('Kokila', 'કોકિલા'), ('Arvind', 'અરવિંદ')), bride=('Kinjal', 'કિંજલ', 'Soni', 'સોની', ('Usha', 'ઉષા'), ('Pankaj', 'પંકજ')),
      city='Bhuj', date='2026-12-24T19:00:00+05:30', mono='D ☾ K', tag='#DhruvKinjalUnderTheMoon', inv='॥ શુભ લગ્ન ॥',
      hero=b('Under the full moon', 'પૂનમના ચાંદ નીચે'),
      msg=b('On a full-moon night, where the white desert meets the sky, we will begin our forever. We would love you there.', 'પૂનમની રાતે, જ્યાં સફેદ રણ આકાશને મળે છે, ત્યાં અમે નવા જીવનની શરૂઆત કરીશું. આપની હાજરી અમારે માટે અમૂલ્ય છે.'),
      venue=('Chandni Rann Resort', 'ચાંદની રણ રિસોર્ટ', 'Dhordo, Bhuj 370510', 'Dhordo Bhuj'),
      events=[('mehndi', -2, '15:00', 4), ('garba', -1, '20:00', 4), ('pithi', -1, '10:30', 3), ('lagna', 0, '19:00', 5), ('reception', 1, '19:30', 4)],
      dresscolors=[['#f4f7ff', '#9fb4d8', '#0d1b3d'], ['#ff3d8b', '#ffb21e', '#f4f7ff'], ['#b3121f', '#f4f7ff', '#c0c7d9']],
      photos=dict(hero='rann-sunset', invite='mirrorwork', venue='tents-night', end='rann-dusk', gallery=['rann-sky', 'salt', 'rann-wide', 'birds-sunset', 'mirrorwork']),
      stories=[('rann', 'rann-wide'), ('chai', 'tents-night'), ('proposal', 'rann-sky')], wishes=[5, 0, 6, 3],
      date_title=b('Scratch the moon', 'ચાંદ ઘસીને જુઓ')),
 dict(id=12, title='Pol ni Haveli', color='#5a3a22', fonts='Alegreya:ital,wght@0,500;0,700;1,500&family=Alegreya+SC:wght@500;700&family=Alegreya+Sans:wght@400;500&family=Rasa:wght@400;600',
      groom=('Manan', 'મનન', 'Kapadia', 'કાપડિયા', ('Rupa', 'રૂપા'), ('Sanjay', 'સંજય')), bride=('Shreya', 'શ્રેયા', 'Zaveri', 'ઝવેરી', ('Hina', 'હીના'), ('Atul', 'અતુલ')),
      city='Ahmedabad', date='2027-01-31T19:00:00+05:30', mono='M ❖ S', tag='#MananShreya', inv='॥ શ્રી ગણેશાય નમઃ ॥',
      hero=b('Welcome to our haveli', 'અમારી હવેલીમાં પધારો'),
      msg=b('In the old pol where our grandparents grew up, under carved jharukhas and a courtyard full of family, we invite you to celebrate with us.', 'જે પોળમાં અમારાં દાદા-દાદી મોટાં થયાં, કોતરેલા ઝરૂખા અને પરિવારથી ભરેલા ચોક વચ્ચે — આપ સાથે ઉજવણી કરવા પધારશો.'),
      venue=('Haveli Chowk, Mandvi ni Pol', 'હવેલી ચોક, માંડવીની પોળ', 'Manek Chowk, Ahmedabad 380001', 'Manek Chowk Ahmedabad'),
      events=[('ganesh', -2, '09:00', 2), ('mameru', -1, '11:00', 3), ('sangeet', -1, '19:30', 4), ('lagna', 0, '19:00', 5), ('reception', 1, '20:00', 4)],
      dresscolors=[['#e8a33d', '#2c4a8a', '#fff4dc'], ['#5a3a22', '#e8a33d', '#2c4a8a'], ['#9e1b1f', '#e8a33d', '#fff4dc']],
      photos=dict(hero='pol-house', invite='courtyard', venue='old-arches', end='pillars', gallery=['pol-house', 'courtyard', 'pillars', 'stepwell-arch', 'drums']),
      stories=[('pol', 'lane'), ('kite', 'pol-house'), ('families', 'courtyard')], wishes=[7, 1, 3, 5],
      date_title=b('Scratch the carving', 'કોતરણી ઘસીને જુઓ')),
 dict(id=13, title='Uttarayan', color='#2a8fd6', fonts='Pacifico&family=Fredoka:wght@400;500;600&family=Nunito:wght@400;600;700&family=Baloo+Bhai+2:wght@500;700',
      groom=('Kunal', 'કુણાલ', 'Bhatt', 'ભટ્ટ', ('Smita', 'સ્મિતા'), ('Nitin', 'નીતિન')), bride=('Nidhi', 'નિધિ', 'Pandya', 'પંડ્યા', ('Jyoti', 'જ્યોતિ'), ('Vipul', 'વિપુલ')),
      city='Vadodara', date='2027-01-16T19:00:00+05:30', mono='K + N', tag='#KunalNidhiKaipo', inv='॥ શુભ લગ્ન ॥',
      hero=b('Our kites got tangled — forever!', 'અમારા પતંગના પેચ લાગી ગયા — કાયમ માટે!'),
      msg=b('It started with a cut kite and a cup of chai. Now our strings are tied for life — come celebrate with us right after Uttarayan!', 'એક કપાયેલા પતંગ અને કપ ચાથી શરૂઆત થઈ. હવે અમારી દોરી જીવનભર બંધાઈ — ઉત્તરાયણ પછી તરત અમારી સાથે ઉજવણી કરવા આવજો!'),
      venue=('Akash Terrace Gardens', 'આકાશ ટેરેસ ગાર્ડન', 'Alkapuri, Vadodara 390007', 'Alkapuri Vadodara'),
      events=[('mehndi', -2, '16:00', 4), ('pithi', -1, '10:30', 3), ('garba', -1, '20:00', 4), ('lagna', 0, '19:00', 5), ('reception', 1, '20:00', 4)],
      dresscolors=[['#ffd23f', '#ff5a5f', '#6ec6f5'], ['#ff5a5f', '#ffd23f', '#3ec99a'], ['#d1263b', '#ffd23f', '#ffffff']],
      photos=dict(hero='kites-city', invite='kite-dome', venue='kites-cloud', end='rooftop-sunset', gallery=['kites-beach', 'kite-rainbow', 'lantern', 'kite-sky', 'kites-city']),
      stories=[('kite', 'kite-rainbow'), ('chai', 'lantern'), ('proposal', 'rooftop-sunset')], wishes=[2, 4, 0, 6],
      date_title=b('Scratch the kite', 'પતંગ ઘસીને જુઓ')),
 dict(id=14, title='Vav', color='#16585e', fonts='Cinzel:wght@500;700&family=Marcellus+SC&family=Spectral:ital,wght@0,400;0,500;1,400&family=Noto+Serif+Gujarati:wght@400;600',
      groom=('Rohan', 'રોહન', 'Vyas', 'વ્યાસ', ('Kalpana', 'કલ્પના'), ('Ashok', 'અશોક')), bride=('Janvi', 'જાનવી', 'Upadhyay', 'ઉપાધ્યાય', ('Nita', 'નીતા'), ('Girish', 'ગિરીશ')),
      city='Gandhinagar', date='2027-02-21T19:15:00+05:30', mono='R · J', tag='#RohanJanvi', inv='॥ શ્રી ગણેશાય નમઃ ॥',
      hero=b('Step by step, into forever', 'પગલે પગલે, કાયમના સાથ તરફ'),
      msg=b('Like the old stepwells that keep water safe for generations, may our home keep love safe for a lifetime. Please bless us with your presence.', 'જેમ જૂની વાવ પેઢીઓ સુધી પાણી સાચવે છે, તેમ અમારું ઘર જીવનભર પ્રેમ સાચવે. આપની હાજરીથી આશીર્વાદ આપશો.'),
      venue=('Sabarmati Heritage Courtyard', 'સાબરમતી હેરિટેજ કોર્ટયાર્ડ', 'Adalaj, Gandhinagar 382421', 'Adalaj Stepwell'),
      events=[('ganesh', -2, '09:00', 2), ('grah', -1, '10:00', 2), ('pithi', -1, '15:30', 3), ('lagna', 0, '19:15', 5), ('reception', 1, '20:00', 4)],
      dresscolors=[['#f6c21a', '#ffffff', '#f28c28'], ['#16585e', '#c99a62', '#f3e3c3'], ['#9e1b1f', '#c99a62', '#f3e3c3']],
      photos=dict(hero='vav-deep', invite='vav-gallery', venue='vav-steps', end='vav-light', gallery=['vav-carving', 'vav-pillars', 'vav-corridor', 'vav-bw', 'vav-deep']),
      stories=[('vav', 'vav-steps'), ('college', 'vav-corridor'), ('families', 'vav-carving')], wishes=[0, 5, 7, 1],
      date_title=b('Scratch the stone', 'પથ્થર ઘસીને જુઓ')),
 dict(id=15, title='Shreeji', color='#0e3b2e', fonts='Italianno&family=Gilda+Display&family=Karla:wght@400;500;700&family=Farsan&family=Hind+Vadodara:wght@400;600',
      groom=('Yash', 'યશ', 'Kothari', 'કોઠારી', ('Pushpa', 'પુષ્પા'), ('Hasmukh', 'હસમુખ')), bride=('Krupa', 'કૃપા', 'Gajjar', 'ગજ્જર', ('Nirmala', 'નિર્મળા'), ('Mukesh', 'મુકેશ')),
      city='Jamnagar', date='2027-04-18T19:30:00+05:30', mono='Y ❀ K', tag='#YashKrupa', inv='॥ શ્રી કૃષ્ણ શરણં મમ ॥',
      hero=b('By Shreeji’s grace', 'શ્રીજીની કૃપાથી'),
      msg=b('With Shreeji’s grace and the blessings of our Vaishnav families, we invite you to the wedding of our children. Jai Shri Krishna!', 'શ્રીજીની કૃપા અને વૈષ્ણવ પરિવારોના આશીર્વાદથી અમારાં સંતાનોના શુભ લગ્નમાં આપને ભાવભીનું આમંત્રણ. જય શ્રી કૃષ્ણ!'),
      venue=('Lakhota Lake Lawns', 'લાખોટા તળાવ લૉન્સ', 'Lakhota Lake Road, Jamnagar 361001', 'Lakhota Lake Jamnagar'),
      events=[('ganesh', -2, '09:00', 2), ('mehndi', -1, '16:00', 4), ('sangeet', -1, '20:00', 3), ('lagna', 0, '19:30', 5), ('reception', 1, '20:00', 4)],
      dresscolors=[['#2f7d4f', '#e46aa0', '#e8c25b'], ['#0e3b2e', '#e8c25b', '#e46aa0'], ['#b3121f', '#e8c25b', '#fff4dc']],
      photos=dict(hero='peacock', invite='shreeji', venue='lotus', end='peacock-2', gallery=['peacock-3', 'lotus-2', 'lotus-3', 'lotus-4', 'peacock']),
      stories=[('darshan', 'shreeji'), ('families', 'lotus-2'), ('proposal', 'lotus-4')], wishes=[7, 5, 0, 3],
      date_title=b('Scratch the lotus', 'કમળ ઘસીને જુઓ')),
 dict(id=16, title='Kesudo', color='#f26b1d', fonts='DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;700&family=Mukta+Vaani:wght@400;600',
      groom=('Aakash', 'આકાશ', 'Amin', 'અમીન', ('Sejal', 'સેજલ'), ('Ketan', 'કેતન')), bride=('Dhara', 'ધારા', 'Chaudhari', 'ચૌધરી', ('Mamta', 'મમતા'), ('Jagdish', 'જગદીશ')),
      city='Anand', date='2027-03-21T18:30:00+05:30', mono='A/D', tag='#AakashDhara', inv='',
      hero=b('Spring, kesudo and us', 'વસંત, કેસૂડો અને અમે'),
      msg=b('When the kesudo blooms, spring says hello. We are saying “forever” — and we’d love you to be there.', 'કેસૂડો ખીલે ત્યારે વસંત આવે છે. અમે “કાયમ” કહી રહ્યાં છીએ — અને આપ સાથે હો તો આનંદ બેવડાય.'),
      venue=('The Mango Orchard', 'ધ મેંગો ઑર્ચર્ડ', 'Vallabh Vidyanagar, Anand 388120', 'Vallabh Vidyanagar Anand'),
      events=[('sagai', -2, '18:30', 3), ('mehndi', -1, '15:30', 4), ('pithi', -1, '11:00', 2), ('lagna', 0, '18:30', 5), ('reception', 1, '19:30', 4)],
      dresscolors=[['#f9cfb4', '#8aa58c', '#fdf6ee'], ['#f26b1d', '#fdf6ee', '#8aa58c'], ['#c2410c', '#f9cfb4', '#fdf6ee']],
      photos=dict(hero='kesudo', invite='kesudo-3', venue='kesudo-tree', end='kesudo-6', gallery=['kesudo-2', 'kesudo-4', 'kesudo-5', 'kesudo-7', 'kesudo']),
      stories=[('spring', 'kesudo-2'), ('college', 'kesudo-4'), ('sagai', 'kesudo-5')], wishes=[4, 6, 2, 5],
      date_title=b('Scratch the blossom', 'કેસૂડો ઘસીને જુઓ')),
 dict(id=17, title='Shubh Vivah', color='#c9a14a', fonts='Cormorant+Upright:wght@500;600;700&family=Cormorant+SC:wght@500;600&family=Jost:wght@300;400;500&family=Rasa:wght@400;600',
      groom=('Ankit', 'અંકિત', 'Sanghvi', 'સંઘવી', ('Jayshree', 'જયશ્રી'), ('Rajendra', 'રાજેન્દ્ર')), bride=('Vidhi', 'વિધિ', 'Doshi', 'દોશી', ('Kusum', 'કુસુમ'), ('Navin', 'નવીન')),
      city='Bhavnagar', date='2027-02-28T18:00:00+05:30', mono='A ◌ V', tag='#AnkitVidhi', inv='॥ નમો અરિહંતાણં ॥',
      hero=b('With pure hearts and joyful blessings', 'નિર્મળ મન અને મંગલ આશીર્વાદ સાથે'),
      msg=b('With the blessings of the Arihants and our elders, we humbly invite you to the auspicious wedding of our children.', 'અરિહંત ભગવંતો અને વડીલોના આશીર્વાદથી, અમારાં સંતાનોના મંગલ લગ્ન પ્રસંગે આપને સાદર આમંત્રણ પાઠવીએ છીએ.'),
      venue=('Shanti Bhavan Vatika', 'શાંતિ ભવન વાટિકા', 'Waghawadi Road, Bhavnagar 364002', 'Waghawadi Road Bhavnagar'),
      events=[('sagai', -2, '17:00', 3), ('mehndi', -1, '15:00', 3), ('pithi', -1, '10:00', 2), ('lagna', 0, '18:00', 4), ('reception', 0, '20:00', 3)],
      dresscolors=[['#fffdf7', '#c9a14a', '#e9dcc0'], ['#e9dcc0', '#8aa58c', '#fffdf7'], ['#b3121f', '#c9a14a', '#fffdf7']],
      photos=dict(hero='temple', invite='lotus', venue='hill-temple', end='spires', gallery=['dome', 'hill-temple-2', 'lotus-2', 'lotus-3', 'temple']),
      stories=[('temple', 'dome'), ('families', 'lotus-2'), ('sagai', 'lotus-3')], wishes=[0, 5, 1, 4],
      date_title=b('Scratch to reveal the muhurat', 'મુહૂર્ત જોવા ઘસો')),
]

import datetime as dt
def shift(date, days, hhmm):
    d = dt.date.fromisoformat(date[:10]) + dt.timedelta(days=days)
    return f'{d.isoformat()}T{hhmm}:00+05:30'

def person(p, son):
    first_en, first_gu, sur_en, sur_gu, mom, dad = p
    rel_en, rel_gu = ('Son', 'સુપુત્ર') if son else ('Daughter', 'સુપુત્રી')
    return {'name': b(first_en, first_gu),
            'parents': b(f'{rel_en} of Smt. {mom[0]} & Shri {dad[0]} {sur_en}', f'શ્રીમતી {mom[1]} તથા શ્રી {dad[1]} {sur_gu}ના {rel_gu}')}

def config(s):
    city, cgu = s['city'], CITY_GU[s['city']]
    vname, vgu, vaddr, vmap = s['venue']
    g, br = s['groom'], s['bride']
    events = []
    for key, day, hhmm, hours in s['events']:
        name, icon, note = EV[key]
        main = key == 'lagna'
        venue = b(vname, vgu) if key in ('lagna', 'reception', 'garba', 'sangeet') else b(f'{br[2]} Niwas', f'{br[3]} નિવાસ') if key in ('mandap', 'ganesh', 'grah', 'mameru', 'pithi') else b(vname, vgu)
        addr = vaddr if 'Niwas' not in venue['en'] else f'{city} — address shared on WhatsApp'
        events.append({'id': key, 'icon': icon, 'name': name, 'start': shift(s['date'], day, hhmm), 'hours': hours, 'venue': venue, 'address': addr, 'note': note, **({'main': True} if main else {})})
    dress_keys = [e['id'] for e in events if e['id'] in DRESS][-3:]
    air, airgu, rail, railgu = TRAVEL[city]
    P = s['photos']; img = lambda n: f'assets/img/{n}.webp'
    return {
        'id': f's{s["id"]}', 'langs': ['en', 'gu'],
        'groom': person(g, True), 'bride': person(br, False), 'monogram': s['mono'], 'hashtag': s['tag'], 'invocation': s['inv'],
        'heroLine': s['hero'], 'date': s['date'], 'city': b(city, cgu), 'siteUrl': 'https://example.com',
        'message': s['msg'],
        'guests': {'shah1': b('Dear Shah Family', 'આદરણીય શાહ પરિવાર'), 'mehta1': b('Dear Mehta Family', 'આદરણીય મહેતા પરિવાર')},
        'titles': {'date': [None, s['date_title']]},
        'photos': {'hero': img(P['hero']), 'invite': img(P['invite']), 'venue': img(P['venue']), 'end': img(P['end']),
                   'gallery': [{'src': img(x), 'alt': s['title']} for x in P['gallery']]},
        'story': [{'when': STORIES[k][0], 'title': STORIES[k][1], 'text': STORIES[k][2], 'photo': img(ph)} for k, ph in s['stories']],
        'events': events,
        'venue': {'name': b(vname, vgu), 'address': vaddr, 'map': vmap},
        'dress': [{'event': k, 'colors': s['dresscolors'][i % len(s['dresscolors'])], 'text': DRESS[k]} for i, k in enumerate(dress_keys)],
        'travel': [
            {'icon': 'plane', 'title': b('Arriving', 'આગમન'), 'text': b(f'{air}. Share your flight and we’ll arrange a pick-up.', f'{airgu}. ફ્લાઇટની વિગત મોકલશો તો અમે લેવા આવીશું.')},
            {'icon': 'stay', 'title': b('Staying', 'ઉતારો'), 'text': b('Rooms are reserved for out-of-town guests — just tell us your dates.', 'બહારગામના મહેમાનો માટે ઉતારાની વ્યવસ્થા છે — બસ તારીખ જણાવશો.')},
            {'icon': 'car', 'title': b('By train & road', 'ટ્રેન અને રસ્તા'), 'text': b(f'{rail} is nearby. Cars will run between the stay and the venue.', f'{railgu} નજીક છે. ઉતારા અને સ્થળ વચ્ચે ગાડીઓની વ્યવસ્થા છે.')},
        ],
        'families': {
            'bride': {'title': b(f'The {br[2]} Family', f'{br[3]} પરિવાર'), 'names': b(f'Smt. {br[4][0]} & Shri {br[5][0]} {br[2]}\nwith all the family', f'શ્રીમતી {br[4][1]} તથા શ્રી {br[5][1]} {br[3]}\nસમસ્ત પરિવાર')},
            'groom': {'title': b(f'The {g[2]} Family', f'{g[3]} પરિવાર'), 'names': b(f'Smt. {g[4][0]} & Shri {g[5][0]} {g[2]}\nwith all the family', f'શ્રીમતી {g[4][1]} તથા શ્રી {g[5][1]} {g[3]}\nસમસ્ત પરિવાર')},
        },
        'rsvp': {'endpoint': '', 'deadline': shift(s['date'], -20, '23:59'), 'maxGuests': 8},
        'wishes': [{'name': WISHES[i][0], 'text': WISHES[i][1]} for i in s['wishes']],
        'contact': {'name': b(f'{br[0]}’s brother', f'{br[1]}ના ભાઈ'), 'phone': '+910000000000'},
        'media': {'music': 'assets/audio/music.mp3', 'musicVolume': .5, 'sfx': {'open': 'assets/audio/open.mp3', 'reveal': 'assets/audio/reveal.mp3', 'scratch': 'assets/audio/scratch.mp3'}},
        'credits': 'Photos: CC-licensed · <a href="assets/img/credits.html">credits</a>',
    }

PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{title}">
<meta name="theme-color" content="{color}">
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="You are invited">
<meta property="og:image" content="assets/img/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22%3E%3Crect width=%2264%22 height=%2264%22 rx=%2216%22 fill=%22{iconc}%22/%3E%3Cpath d=%22M32 50C20 40 20 24 32 12c12 12 12 28 0 38Z%22 fill=%22%23f3dfa2%22/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family={fonts}&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../../core/base.css">
<link rel="stylesheet" href="../../core/skin.css">
<link rel="stylesheet" href="theme.css">
</head>
<body>
<div id="gate" class="gate"></div>
<canvas id="fx" aria-hidden="true"></canvas>
<main id="page"></main>
<div id="chrome"></div>
<div id="toast" class="toast" role="status" aria-live="polite"></div>
<noscript><p style="text-align:center;padding:40px 20px">{title}. Please enable JavaScript to open the invitation.</p></noscript>
<script src="config.js"></script>
<script src="../../core/i18n.js"></script>
<script src="../../core/kit.js"></script>
<script src="theme.js"></script>
<script src="../../core/engine.js"></script>
</body>
</html>
"""
LIC = {'by': 'CC BY', 'by-sa': 'CC BY-SA', 'cc0': 'CC0', 'pdm': 'Public Domain'}

if __name__ == '__main__':
    for s in S:
        d = os.path.join(ROOT, str(s['id'])); os.makedirs(os.path.join(d, 'assets', 'img'), exist_ok=True)
        cfg = config(s)
        missing = [p for p in [cfg['photos'][k] for k in ('hero', 'invite', 'venue', 'end')] + [g['src'] for g in cfg['photos']['gallery']] + [x['photo'] for x in cfg['story']] if not os.path.exists(os.path.join(d, p))]
        if missing: print(s['id'], 'MISSING', missing)
        open(os.path.join(d, 'config.js'), 'w').write(f'/* {s["title"]} — generated by tools/build_samples.py. ⚠ All names, dates, places and numbers are DEMO data. */\nwindow.INVITE = ' + json.dumps(cfg, ensure_ascii=False, indent=1) + ';\n')
        g, br = s['groom'][0], s['bride'][0]
        when = dt.date.fromisoformat(s['date'][:10]).strftime('%-d %b %Y')
        title = f"{g} & {br} · {when} · {s['city']}"
        open(os.path.join(d, 'index.html'), 'w').write(PAGE.format(title=html.escape(title), color=s['color'], fonts=s['fonts'], iconc=s['color'].replace('#', '%23')))
        cf = os.path.join(d, 'assets', 'img', 'credits.json'); rows = ''
        if os.path.exists(cf):
            for name, c in sorted(json.load(open(cf)).items()):
                lic = LIC.get(c['license'], (c['license'] or '').upper()) + (' ' + c['version'] if c.get('version') and c['license'] not in ('cc0', 'pdm') else '')
                rows += f"<li><b>{html.escape(name)}.webp</b> — “{html.escape(c['title'] or 'Untitled')}” by {html.escape(c['creator'] or 'unknown')}, {lic} · <a href=\"{html.escape(c['link'] or '#')}\">source</a></li>\n"
        open(os.path.join(d, 'assets', 'img', 'credits.html'), 'w').write(
            "<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Photo credits</title>"
            "<style>body{font:15px/1.6 system-ui,sans-serif;max-width:720px;margin:40px auto;padding:0 20px;color:#222}li{margin:8px 0}</style></head><body>"
            f"<h1>Photo credits</h1><p>Photos are used under their Creative Commons / public-domain licences and were resized for the web. Music and sound effects were generated for this design.</p><ul>{rows}</ul></body></html>")
    print('ok', len(S), 'samples')
