const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const DATA_DIR = path.join(__dirname, '..', 'data');
const animalsFile = path.join(DATA_DIR, 'animals.json');
const productsFile = path.join(DATA_DIR, 'products.json');

const animals = JSON.parse(fs.readFileSync(animalsFile, 'utf8'));
const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));

// Format animals for spreadsheet
const animalsSheetData = animals.map((a, idx) => ({
  'No': idx + 1,
  'ID': a.id || `hewan-${idx + 1}`,
  'Nama Satwa': a.name || '-',
  'Kategori': a.category || '-',
  'Nama Latin / Spesies': a.latin || '-',
  'Usia': a.age || '-',
  'Biaya Adopsi': typeof a.priceAmount === 'number' ? `Rp ${a.priceAmount.toLocaleString('id-ID')}` : (a.price || 'Hubungi Admin'),
  'Status': a.status || 'Tersedia',
  'Karakter': a.character || '-',
  'Pola Pakan': a.diet || '-',
  'Kondisi Kesehatan': a.health || '-',
  'Kebutuhan Kandang': a.requirements || '-',
  'Foto': a.image ? `http://localhost:3000/${a.image}` : '-'
}));

// Format products for spreadsheet
const productsSheetData = products.map((p, idx) => ({
  'No': idx + 1,
  'ID': p.id || `produk-${idx + 1}`,
  'Nama Produk': p.title || '-',
  'Kategori': p.category || '-',
  'Harga': p.price || '-',
  'Status': p.status || 'Tersedia',
  'Label': p.badge || '-',
  'Keunggulan Utama': p.highlight || '-',
  'Deskripsi': p.description || '-',
  'Cocok Untuk': p.suitableFor || 'Semua hewan eksotis peliharaan',
  'Foto': p.image ? `http://localhost:3000/${p.image}` : '-'
}));

// Create Workbook
const wb = XLSX.utils.book_new();

const wsAnimals = XLSX.utils.json_to_sheet(animalsSheetData);
const wsProducts = XLSX.utils.json_to_sheet(productsSheetData);

// Set column widths
wsAnimals['!cols'] = [
  { wch: 5 },  // No
  { wch: 18 }, // ID
  { wch: 22 }, // Nama Satwa
  { wch: 14 }, // Kategori
  { wch: 24 }, // Latin
  { wch: 12 }, // Usia
  { wch: 16 }, // Biaya Adopsi
  { wch: 14 }, // Status
  { wch: 35 }, // Karakter
  { wch: 35 }, // Pola Pakan
  { wch: 35 }, // Kesehatan
  { wch: 35 }, // Kandang
  { wch: 40 }  // Foto
];

wsProducts['!cols'] = [
  { wch: 5 },  // No
  { wch: 18 }, // ID
  { wch: 25 }, // Nama Produk
  { wch: 20 }, // Kategori
  { wch: 15 }, // Harga
  { wch: 14 }, // Status
  { wch: 15 }, // Label
  { wch: 30 }, // Highlight
  { wch: 35 }, // Deskripsi
  { wch: 30 }, // Cocok Untuk
  { wch: 40 }  // Foto
];

XLSX.utils.book_append_sheet(wb, wsAnimals, '🐾 Hewan Adopsi');
XLSX.utils.book_append_sheet(wb, wsProducts, '🪵 Produk & Perlengkapan');

const xlsxPath = path.join(__dirname, '..', 'Katalog_Bayoung_Exopet.xlsx');
XLSX.writeFile(wb, xlsxPath);
console.log('✅ File Excel berhasil dibuat:', xlsxPath);

// Also generate CSVs
const csvAnimalsPath = path.join(DATA_DIR, 'katalog_hewan_adopsi.csv');
const csvProductsPath = path.join(DATA_DIR, 'katalog_produk_bayoung.csv');

fs.writeFileSync(csvAnimalsPath, XLSX.utils.sheet_to_csv(wsAnimals), 'utf8');
fs.writeFileSync(csvProductsPath, XLSX.utils.sheet_to_csv(wsProducts), 'utf8');
console.log('✅ File CSV Hewan berhasil dibuat:', csvAnimalsPath);
console.log('✅ File CSV Produk berhasil dibuat:', csvProductsPath);
