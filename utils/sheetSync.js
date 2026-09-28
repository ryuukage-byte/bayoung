const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const DATA_DIR = path.join(__dirname, '..', 'data');
const animalsFile = path.join(DATA_DIR, 'animals.json');
const productsFile = path.join(DATA_DIR, 'products.json');
const xlsxPath = path.join(__dirname, '..', 'Katalog_Bayoung_Exopet.xlsx');
const csvAnimalsPath = path.join(DATA_DIR, 'katalog_hewan_adopsi.csv');
const csvProductsPath = path.join(DATA_DIR, 'katalog_produk_bayoung.csv');

/**
 * Memperbarui file spreadsheet Excel (.xlsx) dan CSV lokal secara otomatis
 */
function updateLocalSpreadsheet() {
  try {
    if (!fs.existsSync(animalsFile) || !fs.existsSync(productsFile)) return;

    const animals = JSON.parse(fs.readFileSync(animalsFile, 'utf8'));
    const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));

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

    const wb = XLSX.utils.book_new();
    const wsAnimals = XLSX.utils.json_to_sheet(animalsSheetData);
    const wsProducts = XLSX.utils.json_to_sheet(productsSheetData);

    wsAnimals['!cols'] = [
      { wch: 5 }, { wch: 18 }, { wch: 22 }, { wch: 14 }, { wch: 24 },
      { wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 35 }, { wch: 35 },
      { wch: 35 }, { wch: 35 }, { wch: 40 }
    ];

    wsProducts['!cols'] = [
      { wch: 5 }, { wch: 18 }, { wch: 25 }, { wch: 20 }, { wch: 15 },
      { wch: 14 }, { wch: 15 }, { wch: 30 }, { wch: 35 }, { wch: 30 },
      { wch: 40 }
    ];

    XLSX.utils.book_append_sheet(wb, wsAnimals, '🐾 Hewan Adopsi');
    XLSX.utils.book_append_sheet(wb, wsProducts, '🪵 Produk & Perlengkapan');

    XLSX.writeFile(wb, xlsxPath);
    fs.writeFileSync(csvAnimalsPath, XLSX.utils.sheet_to_csv(wsAnimals), 'utf8');
    fs.writeFileSync(csvProductsPath, XLSX.utils.sheet_to_csv(wsProducts), 'utf8');
    console.log('📊 [Spreadsheet] File Excel & CSV lokal berhasil diperbarui otomatis.');
  } catch (err) {
    console.error('⚠️ [Spreadsheet] Gagal memperbarui file Excel lokal:', err.message);
  }
}

/**
 * Sinkronisasi real-time ke Google Sheet Webhook jika GOOGLE_SHEET_WEBHOOK_URL dikonfigurasi
 */
async function syncToGoogleSheet(action, payload) {
  // Selalu perbarui spreadsheet lokal terlebih dahulu
  updateLocalSpreadsheet();

  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!webhookUrl || !webhookUrl.startsWith('http')) return;

  try {
    if (typeof fetch === 'function') {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload, updatedAt: new Date().toISOString() })
      });
      console.log(`🌐 [Google Sheet] Sinkronisasi ${action}:`, res.status);
    }
  } catch (err) {
    console.error('⚠️ [Google Sheet] Gagal sinkronisasi webhook:', err.message);
  }
}

module.exports = {
  updateLocalSpreadsheet,
  syncToGoogleSheet
};
