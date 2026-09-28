/**
 * ===================================================================
 * 🐾 BAYOUNG EXOPET - GOOGLE APPS SCRIPT SPREADSHEET & WEBHOOK SYNC
 * ===================================================================
 * Skrip ini berfungsi untuk:
 * 1. Membuat & menata otomatis Sheet Katalog Bayoung Exopet (Desain Hijau Hutan Khas Bayoung).
 * 2. Mengisi seluruh data satwa dan produk awal secara instan.
 * 3. Menjadi Webhook (doPost) agar Telegram Bot bisa menambah / mengupdate data secara real-time!
 *
 * CARA PAKAI CEPAT (HANYA 1 MENIT):
 * 1. Buka https://sheets.new di browser (Google Sheet baru).
 * 2. Klik menu "Ekstensi" (Extensions) > "Apps Script".
 * 3. Hapus semua teks yang ada, lalu tempel (Paste) seluruh isi kode ini.
 * 4. Pada pilihan fungsi di bagian atas, pilih "setupBayoungSheet", lalu klik tombol "Jalankan" (Run).
 *    (Beri izin akses Google jika diminta).
 * 5. Buka kembali Google Sheet Anda -> Sheet sudah jadi, rapi, berwarna hijau hutan, dan terisi semua data!
 *
 * (OPSIONAL) SINKRONISASI REAL-TIME DENGAN BOT TELEGRAM:
 * 1. Di Apps Script, klik tombol "Deploy" (Terapkan) > "New deployment" (Penerapan baru).
 * 2. Pilih jenis "Web app" (Aplikasi web).
 * 3. Ubah "Who has access" (Siapa yang memiliki akses) menjadi "Anyone" (Siapa saja).
 * 4. Klik "Deploy", salin Web App URL-nya.
 * 5. Masukkan URL tersebut ke file .env di server Anda:
 *    GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
 * ===================================================================
 */

// Data Awal Hewan Adopsi
const INITIAL_ANIMALS = [
  {
    "id": "buaya-darat",
    "name": "buaya darat",
    "category": "Reptil",
    "latin": "Exotic Pet",
    "age": "Dewasa",
    "price": "Rp 500.000",
    "status": "Tersedia",
    "character": "Aktif lincah, rasa ingin tahu tinggi, sehat prima",
    "diet": "Buah segar matang, protein ayam rebus & suplemen kalsium",
    "health": "Sehat prima, aktif, bebas jamur & kutu, kuku terawat",
    "requirements": "Kandang nyaman bersih, alas wood pellets berkualitas, serta komitmen bermain.",
    "image": "assets/images/uploads/img_1790563487436_i6j8d.jpg"
  },
  {
    "id": "buaya-abiyu",
    "name": "buaya abiyu",
    "category": "buaya",
    "latin": "Exotic Pet",
    "age": "4 Bulan",
    "price": "Hubungi Admin",
    "status": "Tersedia",
    "character": "Aktif lincah, rasa ingin tahu tinggi, sehat prima",
    "diet": "Buah segar matang, protein ayam rebus & suplemen kalsium",
    "health": "Sehat prima, aktif, bebas jamur & kutu, kuku terawat",
    "requirements": "Kandang nyaman bersih, alas wood pellets berkualitas, serta komitmen bermain.",
    "image": "assets/images/hero_musang.jpg"
  },
  {
    "id": "musang-pandan",
    "name": "Musang Pandan",
    "category": "Musang",
    "latin": "Paradoxurus hermaphroditus",
    "age": "3.5 Bulan",
    "price": "Rp 650.000",
    "status": "Tersedia",
    "character": "Jinak total, manja, suka digendong di pundak, bonding kuat",
    "diet": "Pisang kepok matang, pepaya, bubur buah, protein ayam rebus",
    "health": "Sehat prima, bebas kutu & jamur, kuku tumpul terawat, aktif",
    "requirements": "Kandang minimal 60x40x50 cm, alas wood pellets berkualitas, serta komitmen waktu bermain minimal 30 menit per hari.",
    "image": "assets/images/hero_musang.jpg"
  },
  {
    "id": "asian-otter",
    "name": "Asian Small-Clawed Otter",
    "category": "Otter",
    "latin": "Aonyx cinereus",
    "age": "4 Bulan",
    "price": "Rp 2.500.000",
    "status": "Tersedia",
    "character": "Sangat interaktif, cerdas, vokal, menyukai aktivitas bermain air",
    "diet": "Ikan air tawar segar, udang, pakan khusus carnivore & suplemen kalsium",
    "health": "Bulu mengkilap kedap air, gigi dan mata bersih, aktif berenang",
    "requirements": "Wajib memiliki bak/area air bersih untuk mandi berkala, pakan segar teratur, dan ruangan aman tanpa celah sempit.",
    "image": "assets/images/otter.jpg"
  },
  {
    "id": "hamster-syrian",
    "name": "Hamster Syrian",
    "category": "Rodent",
    "latin": "Mesocricetus auratus",
    "age": "2 Bulan",
    "price": "Rp 50.000",
    "status": "Tersedia",
    "character": "Tenang, santai, mudah dipegang, pipi menggemaskan",
    "diet": "Mix seed premium, pelet hamster tinggi serat, treats sayuran kering",
    "health": "Bulu tebal halus, gigi rapi tidak overgrow, lincah di wheel",
    "requirements": "Kandang luas satu ekor satu kandang (soliter), running wheel diameter minimal 21 cm, dan alas bedding wood pellets atau paper bedding.",
    "image": "assets/images/hamster.jpg"
  },
  {
    "id": "netherland-dwarf",
    "name": "Netherland Dwarf",
    "category": "Rabbit",
    "latin": "Oryctolagus cuniculus",
    "age": "2.5 Bulan",
    "price": "Rp 250.000",
    "status": "Tersedia",
    "character": "Imut, lincah, telinga pendek tegak khas ras murni",
    "diet": "Timothy hay ad libitum (80%), pelet kelinci serat tinggi, air minum bersih",
    "health": "Telinga dan mata bersih, kotoran bulat normal, bulu lebat",
    "requirements": "Litter box dengan alas wood pellets penyerap urin, hay rack terisi penuh sepanjang hari, serta ruang eksplorasi aman kabel.",
    "image": "assets/images/rabbit.jpg"
  },
  {
    "id": "hedgehog-pygmy",
    "name": "African Pygmy Hedgehog",
    "category": "Other",
    "latin": "Atelerix albiventris",
    "age": "3 Bulan",
    "price": "Rp 350.000",
    "status": "Tersedia",
    "character": "Lucu menggulung diri, aktif di malam hari, tidak berisik",
    "diet": "Kibble serangga/kucing super premium, mealworms, jangkrik bersih",
    "health": "Duri bersih rapi, kulit sehat tanpa kerak/mites, mata jernih",
    "requirements": "Kandang tertutup ventilasi baik, running wheel silent 28cm, dan suhu ruangan hangat yang stabil.",
    "image": "assets/images/hedgehog.jpg"
  }
];

// Data Awal Produk & Perlengkapan
const INITIAL_PRODUCTS = [
  {
    "id": "abiyuna",
    "title": "abiyuna",
    "category": "Bedding & Litter",
    "price": "Rp 10.000",
    "status": "Tersedia",
    "badge": "New Item",
    "highlight": "anakucay",
    "description": "anakucay",
    "suitableFor": "Semua hewan eksotis peliharaan",
    "image": "assets/images/uploads/img_1790562178615_s7gyl.jpg"
  },
  {
    "id": "abiyu",
    "title": "abiyu",
    "category": "Daily Diet & Supplements",
    "price": "Rp 123.710",
    "status": "Tersedia",
    "badge": "New Item",
    "highlight": "dhjla",
    "description": "dhjla",
    "suitableFor": "Semua hewan eksotis peliharaan",
    "image": "assets/images/wood_pellets_bag.jpg"
  },
  {
    "id": "wood-pellets",
    "title": "Wood Pellets Premium",
    "category": "Bedding & Litter",
    "price": "Rp 35.000",
    "status": "Tersedia",
    "badge": "Best Seller",
    "highlight": "Alas Kandang Kayu Pinus Alami 100%",
    "description": "Wood Pellets Bayoung diproduksi khusus untuk kenyamanan dan kesehatan sistem pernapasan hewan eksotis Anda. Daya serap tinggi 3x lipat, pengikat aroma amonia alami, bebas debu 99%.",
    "suitableFor": "Musang, Otter, Kelinci, Hamster, Sugar Glider, Burung & Kucing",
    "image": "assets/images/wood_pellets_bag.jpg"
  },
  {
    "id": "food-nutrition",
    "title": "Food & Nutrition",
    "category": "Daily Diet & Supplements",
    "price": "Rp 45.000",
    "status": "Tersedia",
    "badge": "Selected Nutrition",
    "highlight": "Pakan Seimbang & Suplemen Multivitamin",
    "description": "Formula pakan bernutrisi lengkap yang diracik khusus untuk memenuhi kebutuhan biologis hewan eksotis. Membantu bulu tetap lebat bersinar dan daya tahan prima.",
    "suitableFor": "Omnivora, Herbivora Eksotis, Musang, Rodentia & Kelinci",
    "image": "assets/images/food_nutrition.jpg"
  },
  {
    "id": "habitat-enclosure",
    "title": "Habitat & Enclosure",
    "category": "Housing & Furniture",
    "price": "Rp 120.000",
    "status": "Tersedia",
    "badge": "Eco-Friendly",
    "highlight": "Rumah Kayu Alami, Hammock & Aksesoris Kandang",
    "description": "Tempat berlindung dan istirahat yang menyerupai habitat alami di hutan. Memberikan rasa aman sehingga hewan bebas stres.",
    "suitableFor": "Musang anakan, Otter, Hamster Syrian, Kelinci kerdil & Landak mini",
    "image": "assets/images/habitat_enclosure.jpg"
  },
  {
    "id": "accessories",
    "title": "Pet Accessories",
    "category": "Bowls & Handling",
    "price": "Rp 25.000",
    "status": "Tersedia",
    "badge": "Exclusive Purple",
    "highlight": "Mangkuk Keramik Ungu, Botol Minum Dot & Harness",
    "description": "Aksesoris pelengkap premium bertema ungu ikonik Bayoung. Menjaga area makan hewan tetap bersih, higienis, dan rapi.",
    "suitableFor": "Semua jenis hewan eksotis peliharaan",
    "image": "assets/images/pet_accessories.jpg"
  }
];

/**
 * FUNGSI UTAMA: Otomatis membuat format, warna, validasi dropdown & mengisi data awal
 */
function setupBayoungSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Setup Tab Hewan Adopsi
  let animalSheet = ss.getSheetByName('🐾 Hewan Adopsi');
  if (!animalSheet) {
    animalSheet = ss.insertSheet('🐾 Hewan Adopsi', 0);
  }
  animalSheet.clear();
  
  const animalHeaders = [
    'No', 'ID', 'Nama Satwa', 'Kategori', 'Nama Latin / Spesies',
    'Usia', 'Biaya Adopsi', 'Status', 'Karakter', 'Pola Pakan',
    'Kondisi Kesehatan', 'Kebutuhan Kandang', 'Foto'
  ];
  
  animalSheet.getRange(1, 1, 1, animalHeaders.length).setValues([animalHeaders]);
  formatHeaderRow(animalSheet, animalHeaders.length, '#1B4332'); // Hijau Tua Khas Bayoung
  
  // Masukkan data hewan awal
  const animalRows = INITIAL_ANIMALS.map((a, i) => [
    i + 1,
    a.id,
    a.name,
    a.category,
    a.latin,
    a.age,
    a.price,
    a.status || 'Tersedia',
    a.character,
    a.diet,
    a.health,
    a.requirements,
    a.image
  ]);
  
  if (animalRows.length > 0) {
    animalSheet.getRange(2, 1, animalRows.length, animalHeaders.length).setValues(animalRows);
    animalSheet.getRange(2, 1, animalRows.length, animalHeaders.length)
      .setVerticalAlignment('middle')
      .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
    animalSheet.getRange(2, 1, animalRows.length, 2).setHorizontalAlignment('center');
    animalSheet.getRange(2, 6, animalRows.length, 3).setHorizontalAlignment('center');
  }
  
  // Validasi Dropdown Status Hewan (Kolom H / 8)
  const animalStatusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Tersedia', 'Sudah Teradopsi'], true)
    .setAllowInvalid(false)
    .build();
  animalSheet.getRange('H2:H200').setDataValidation(animalStatusRule);
  
  // Atur Lebar Kolom Hewan
  const animalWidths = [45, 130, 160, 100, 170, 90, 120, 110, 220, 220, 220, 220, 180];
  animalWidths.forEach((w, idx) => animalSheet.setColumnWidth(idx + 1, w));
  animalSheet.setFrozenRows(1);
  applyStatusFormatting(animalSheet, 'H', 'Tersedia', 'Sudah Teradopsi');

  // 2. Setup Tab Produk & Perlengkapan
  let productSheet = ss.getSheetByName('🪵 Produk & Perlengkapan');
  if (!productSheet) {
    productSheet = ss.insertSheet('🪵 Produk & Perlengkapan', 1);
  }
  productSheet.clear();

  const productHeaders = [
    'No', 'ID', 'Nama Produk', 'Kategori', 'Harga',
    'Status', 'Label', 'Keunggulan Utama', 'Deskripsi', 'Cocok Untuk', 'Foto'
  ];

  productSheet.getRange(1, 1, 1, productHeaders.length).setValues([productHeaders]);
  formatHeaderRow(productSheet, productHeaders.length, '#2D5A27'); // Hijau Daun Hutan

  const productRows = INITIAL_PRODUCTS.map((p, i) => [
    i + 1,
    p.id,
    p.title,
    p.category,
    p.price,
    p.status || 'Tersedia',
    p.badge,
    p.highlight,
    p.description,
    p.suitableFor,
    p.image
  ]);

  if (productRows.length > 0) {
    productSheet.getRange(2, 1, productRows.length, productHeaders.length).setValues(productRows);
    productSheet.getRange(2, 1, productRows.length, productHeaders.length)
      .setVerticalAlignment('middle')
      .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
    productSheet.getRange(2, 1, productRows.length, 2).setHorizontalAlignment('center');
    productSheet.getRange(2, 5, productRows.length, 3).setHorizontalAlignment('center');
  }

  // Validasi Dropdown Status Produk (Kolom F / 6)
  const productStatusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Tersedia', 'Stok Habis'], true)
    .setAllowInvalid(false)
    .build();
  productSheet.getRange('F2:F200').setDataValidation(productStatusRule);

  // Atur Lebar Kolom Produk
  const productWidths = [45, 130, 180, 140, 110, 110, 110, 200, 240, 200, 180];
  productWidths.forEach((w, idx) => productSheet.setColumnWidth(idx + 1, w));
  productSheet.setFrozenRows(1);
  applyStatusFormatting(productSheet, 'F', 'Tersedia', 'Stok Habis');

  // Hapus sheet default "Sheet1" jika ada
  const defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('Sheet 1');
  if (defaultSheet && ss.getSheets().length > 2) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }

  SpreadsheetApp.getUi().alert('🎉 BERHASIL! Spreadsheet Bayoung Exopet siap digunakan dengan desain rapi & data lengkap.');
}

/**
 * Helper: Desain Baris Header yang Indah & Elegan
 */
function formatHeaderRow(sheet, numCols, bgColor) {
  const headerRange = sheet.getRange(1, 1, 1, numCols);
  headerRange
    .setBackground(bgColor)
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setFontFamily('Segoe UI')
    .setFontSize(10)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(1, 38);
}

/**
 * Helper: Pewarnaan Otomatis Status (Hijau untuk Tersedia, Merah untuk Teradopsi / Habis)
 */
function applyStatusFormatting(sheet, colLetter, readyText, notReadyText) {
  const range = sheet.getRange(`${colLetter}2:${colLetter}200`);
  
  const ruleAvailable = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo(readyText)
    .setBackground('#D4EDDA') // Hijau Lembut
    .setFontColor('#155724')
    .setBold(true)
    .setRanges([range])
    .build();

  const ruleUnavailable = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo(notReadyText)
    .setBackground('#F8D7DA') // Merah Lembut
    .setFontColor('#721C24')
    .setBold(true)
    .setRanges([range])
    .build();

  const rules = sheet.getConditionalFormatRules();
  rules.push(ruleAvailable, ruleUnavailable);
  sheet.setConditionalFormatRules(rules);
}

/**
 * ===================================================================
 * 🌐 WEBHOOK REAL-TIME SYNC (doPost)
 * ===================================================================
 * Menerima sinyal otomatis dari Bot Telegram / Website saat ada:
 * - Tambah Hewan Baru
 * - Ubah Status Teradopsi
 * - Ubah Biaya Adopsi
 * - Tambah Produk Baru
 * - Ubah Status Stok Habis
 * - Ubah Harga Produk
 */
function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const payload = JSON.parse(raw);
    const action = payload.action;
    const data = payload.payload;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'ADD_ANIMAL') {
      const sheet = ss.getSheetByName('🐾 Hewan Adopsi');
      if (sheet) {
        const lastRow = sheet.getLastRow();
        const nextNo = lastRow;
        sheet.appendRow([
          nextNo,
          data.id || '',
          data.name || '',
          data.category || '',
          data.latin || 'Exotic Pet',
          data.age || '',
          data.price || '',
          data.status || 'Tersedia',
          data.character || '',
          data.diet || '',
          data.health || '',
          data.requirements || '',
          data.image || ''
        ]);
      }
    } else if (action === 'UPDATE_ANIMAL_STATUS') {
      const sheet = ss.getSheetByName('🐾 Hewan Adopsi');
      if (sheet) {
        const idCol = sheet.getRange('B2:B' + sheet.getLastRow()).getValues();
        for (let i = 0; i < idCol.length; i++) {
          if (idCol[i][0] === data.id) {
            sheet.getRange(i + 2, 8).setValue(data.status); // Kolom H (Status)
            break;
          }
        }
      }
    } else if (action === 'UPDATE_ANIMAL_PRICE') {
      const sheet = ss.getSheetByName('🐾 Hewan Adopsi');
      if (sheet) {
        const idCol = sheet.getRange('B2:B' + sheet.getLastRow()).getValues();
        for (let i = 0; i < idCol.length; i++) {
          if (idCol[i][0] === data.id) {
            sheet.getRange(i + 2, 7).setValue(data.price); // Kolom G (Biaya Adopsi)
            break;
          }
        }
      }
    } else if (action === 'ADD_PRODUCT') {
      const sheet = ss.getSheetByName('🪵 Produk & Perlengkapan');
      if (sheet) {
        const lastRow = sheet.getLastRow();
        const nextNo = lastRow;
        sheet.appendRow([
          nextNo,
          data.id || '',
          data.title || '',
          data.category || '',
          data.price || '',
          data.status || 'Tersedia',
          data.badge || '',
          data.highlight || '',
          data.description || '',
          data.suitableFor || 'Semua hewan eksotis',
          data.image || ''
        ]);
      }
    } else if (action === 'UPDATE_PRODUCT_STATUS') {
      const sheet = ss.getSheetByName('🪵 Produk & Perlengkapan');
      if (sheet) {
        const idCol = sheet.getRange('B2:B' + sheet.getLastRow()).getValues();
        for (let i = 0; i < idCol.length; i++) {
          if (idCol[i][0] === data.id) {
            sheet.getRange(i + 2, 6).setValue(data.status); // Kolom F (Status)
            break;
          }
        }
      }
    } else if (action === 'UPDATE_PRODUCT_PRICE') {
      const sheet = ss.getSheetByName('🪵 Produk & Perlengkapan');
      if (sheet) {
        const idCol = sheet.getRange('B2:B' + sheet.getLastRow()).getValues();
        for (let i = 0; i < idCol.length; i++) {
          if (idCol[i][0] === data.id) {
            sheet.getRange(i + 2, 5).setValue(data.price); // Kolom E (Harga)
            break;
          }
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'success', action: action }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: 'ok', message: 'Bayoung Exopet Sheets Webhook Aktif' }))
    .setMimeType(ContentService.MimeType.JSON);
}
