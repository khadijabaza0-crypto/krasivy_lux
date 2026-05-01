/**
 * Wilayas Algerie — tarifs DA (liste client, transporteur ZR Express)
 */
const WILAYAS_ZR_EXPRESS = [
  { code: 1,  ar: 'أدرار', fr: 'Adrar', domicile: 1400, stopDesk: 970 },
  { code: 2,  ar: 'الشلف', fr: 'Chlef', domicile: 800, stopDesk: 520 },
  { code: 3,  ar: 'الأغواط', fr: 'Laghouat', domicile: 950, stopDesk: 620 },
  { code: 4,  ar: 'أم البواقي', fr: 'Oum El Bouaghi', domicile: 750, stopDesk: 520 },
  { code: 5,  ar: 'باتنة', fr: 'Batna', domicile: 800, stopDesk: 520 },
  { code: 6,  ar: 'بجاية', fr: 'Béjaïa', domicile: 750, stopDesk: 520 },
  { code: 7,  ar: 'بسكرة', fr: 'Biskra', domicile: 950, stopDesk: 620 },
  { code: 8,  ar: 'بشار', fr: 'Béchar', domicile: 1100, stopDesk: 720 },
  { code: 9,  ar: 'البليدة', fr: 'Blida', domicile: 750, stopDesk: 520 },
  { code: 10, ar: 'البويرة', fr: 'Bouira', domicile: 750, stopDesk: 520 },
  { code: 11, ar: 'تمنراست', fr: 'Tamanrasset', domicile: 1600, stopDesk: 1120 },
  { code: 12, ar: 'تبسة', fr: 'Tébessa', domicile: 850, stopDesk: 520 },
  { code: 13, ar: 'تلمسان', fr: 'Tlemcen', domicile: 900, stopDesk: 570 },
  { code: 14, ar: 'تيارت', fr: 'Tiaret', domicile: 800, stopDesk: 520 },
  { code: 15, ar: 'تيزي وزو', fr: 'Tizi Ouzou', domicile: 750, stopDesk: 520 },
  { code: 16, ar: 'الجزائر العاصمة', fr: 'Alger', domicile: 600, stopDesk: 470 },
  { code: 17, ar: 'الجلفة', fr: 'Djelfa', domicile: 950, stopDesk: 620 },
  { code: 18, ar: 'جيجل', fr: 'Jijel', domicile: 750, stopDesk: 520 },
  { code: 20, ar: 'سعيدة', fr: 'Saida', domicile: 800, stopDesk: 570 },
  { code: 21, ar: 'سكيكدة', fr: 'Skikda', domicile: 750, stopDesk: 520 },
  { code: 22, ar: 'سيدي بلعباس', fr: 'Sidi Bel Abbès', domicile: 800, stopDesk: 520 },
  { code: 23, ar: 'عنابة', fr: 'Annaba', domicile: 800, stopDesk: 520 },
  { code: 24, ar: 'قالمة', fr: 'Guelma', domicile: 750, stopDesk: 520 },
  { code: 25, ar: 'قسنطينة', fr: 'Constantine', domicile: 750, stopDesk: 520 },
  { code: 26, ar: 'المدية', fr: 'Médéa', domicile: 800, stopDesk: 520 },
  { code: 27, ar: 'مستغانم', fr: 'Mostaganem', domicile: 800, stopDesk: 520 },
  { code: 28, ar: 'مسيلة', fr: 'Msila', domicile: 850, stopDesk: 570 },
  { code: 29, ar: 'معسكر', fr: 'Mascara', domicile: 800, stopDesk: 520 },
  { code: 30, ar: 'ورقلة', fr: 'Ouargla', domicile: 950, stopDesk: 670 },
  { code: 31, ar: 'وهران', fr: 'Oran', domicile: 750, stopDesk: 520 },
  { code: 32, ar: 'البيض', fr: 'El Bayadh', domicile: 1100, stopDesk: 670 },
  { code: 34, ar: 'برج بوعريريج', fr: 'Bordj Bou Arréridj', domicile: 600, stopDesk: 520 },
  { code: 35, ar: 'بومرداس', fr: 'Boumerdès', domicile: 750, stopDesk: 520 },
  { code: 36, ar: 'الطارف', fr: 'El Tarf', domicile: 800, stopDesk: 520 },
  { code: 38, ar: 'تيسمسيلت', fr: 'Tissemsilt', domicile: 800, stopDesk: 520 },
  { code: 39, ar: 'الوادي', fr: 'El Oued', domicile: 950, stopDesk: 670 },
  { code: 40, ar: 'خنشلة', fr: 'Khenchela', domicile: 800, stopDesk: 520 },
  { code: 41, ar: 'سوق أهراس', fr: 'Souk Ahras', domicile: 750, stopDesk: 520 },
  { code: 42, ar: 'تيبازة', fr: 'Tipaza', domicile: 750, stopDesk: 520 },
  { code: 43, ar: 'ميلة', fr: 'Mila', domicile: 700, stopDesk: 520 },
  { code: 44, ar: 'عين الدفلى', fr: 'Aïn Defla', domicile: 750, stopDesk: 520 },
  { code: 45, ar: 'النعامة', fr: 'Naâma', domicile: 1100, stopDesk: 670 },
];

function findWilayaByCode(code) {
  const n = typeof code === 'string' ? parseInt(code, 10) : code;
  return WILAYAS_ZR_EXPRESS.find(w => w.code === n) || null;
}
