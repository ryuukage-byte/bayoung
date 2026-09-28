const fs = require('fs');
const path = require('path');
const { Telegraf, Markup } = require('telegraf');
const { syncToGoogleSheet, updateLocalSpreadsheet } = require('./utils/sheetSync');

const DATA_DIR = path.join(__dirname, 'data');
const ADMINS_FILE = path.join(DATA_DIR, 'admins.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ANIMALS_FILE = path.join(DATA_DIR, 'animals.json');
const UPLOADS_DIR = path.join(__dirname, 'assets', 'images', 'uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Helper: Read & Write JSON
function readJSON(file, fallback = []) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
  }
  return fallback;
}

function writeJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
    return false;
  }
}

// Admin Helpers
function getAdminsConfig() {
  const superadmin = (process.env.SUPERADMIN_ID || '8886152961').trim();
  const config = readJSON(ADMINS_FILE, { superadmin, admins: [superadmin] });
  if (!config.superadmin) config.superadmin = superadmin;
  if (!Array.isArray(config.admins)) config.admins = [superadmin];
  if (!config.admins.includes(superadmin)) config.admins.unshift(superadmin);
  return config;
}

function isAdmin(userId) {
  if (!userId) return false;
  const uid = userId.toString().trim();
  const config = getAdminsConfig();
  return config.superadmin === uid || config.admins.includes(uid);
}

function isSuperAdmin(userId) {
  if (!userId) return false;
  const uid = userId.toString().trim();
  const config = getAdminsConfig();
  return config.superadmin === uid;
}

function addAdmin(newId) {
  const uid = newId.toString().trim();
  const config = getAdminsConfig();
  if (!config.admins.includes(uid)) {
    config.admins.push(uid);
    writeJSON(ADMINS_FILE, config);
    return true;
  }
  return false;
}

function removeAdmin(idToRemove) {
  const uid = idToRemove.toString().trim();
  const config = getAdminsConfig();
  if (uid === config.superadmin) return false;
  const initialLength = config.admins.length;
  config.admins = config.admins.filter(id => id !== uid);
  if (config.admins.length !== initialLength) {
    writeJSON(ADMINS_FILE, config);
    return true;
  }
  return false;
}

// Download Telegram Photo to Local Storage with retry
async function downloadTelegramPhoto(telegram, fileId, fallbackImage = null) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const fileLink = await telegram.getFileLink(fileId);
      const response = await fetch(fileLink.href);
      if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      const fileName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.jpg`;
      const destPath = path.join(UPLOADS_DIR, fileName);
      fs.writeFileSync(destPath, buffer);
      return `assets/images/uploads/${fileName}`;
    } catch (err) {
      console.warn(`Attempt ${attempt} downloading photo:`, err.message);
      if (attempt < 3) await new Promise(r => setTimeout(r, 1200));
    }
  }
  return fallbackImage;
}

// Number & Rupiah Formatting Helpers
function formatRupiah(num) {
  if (typeof num === 'string' && (num.toLowerCase().includes('hubungi') || num.toLowerCase().includes('nego'))) {
    return 'Hubungi Admin';
  }
  const n = parseInt(num, 10);
  if (isNaN(n) || n <= 0) return 'Hubungi Admin';
  return 'Rp ' + n.toLocaleString('id-ID');
}

// Safe Message Reply / Edit helper to prevent Telegram 400 crashes
async function safeReplyOrEdit(ctx, text, extra = {}) {
  if (ctx.callbackQuery) {
    try {
      return await ctx.editMessageText(text, extra);
    } catch (err) {
      if (err.description && err.description.includes('message is not modified')) {
        return;
      }
    }
  }
  try {
    return await ctx.reply(text, extra);
  } catch (e) {
    console.error('safeReplyOrEdit fallback error:', e.message);
  }
}

// Interactive Price Keypad Generator
function getPriceKeyboard(sessionType, currentPrice) {
  const isAnimal = sessionType === 'animal';
  const presets = isAnimal 
    ? [350000, 500000, 650000, 750000, 850000, 1200000]
    : [25000, 35000, 50000, 85000, 120000, 150000];

  const stepSmall = isAnimal ? 50000 : 5000;
  const stepLarge = isAnimal ? 100000 : 10000;
  const currentFormatted = formatRupiah(currentPrice);

  return Markup.inlineKeyboard([
    [
      Markup.button.callback(formatRupiah(presets[0]), `set_price_${presets[0]}`),
      Markup.button.callback(formatRupiah(presets[1]), `set_price_${presets[1]}`),
      Markup.button.callback(formatRupiah(presets[2]), `set_price_${presets[2]}`)
    ],
    [
      Markup.button.callback(formatRupiah(presets[3]), `set_price_${presets[3]}`),
      Markup.button.callback(formatRupiah(presets[4]), `set_price_${presets[4]}`),
      Markup.button.callback(formatRupiah(presets[5]), `set_price_${presets[5]}`)
    ],
    [
      Markup.button.callback(`➖ ${isAnimal ? '50rb' : '5rb'}`, `adjust_price_${-stepSmall}`),
      Markup.button.callback(`➕ ${isAnimal ? '50rb' : '5rb'}`, `adjust_price_${stepSmall}`)
    ],
    [
      Markup.button.callback(`➖ ${isAnimal ? '100rb' : '10rb'}`, `adjust_price_${-stepLarge}`),
      Markup.button.callback(`➕ ${isAnimal ? '100rb' : '10rb'}`, `adjust_price_${stepLarge}`)
    ],
    [
      Markup.button.callback('📞 Set: Hubungi Admin (Nego)', 'set_price_hubungi')
    ],
    [
      Markup.button.callback(`✅ Simpan: ${currentFormatted}`, 'confirm_price')
    ],
    [
      Markup.button.callback('❌ Batal', 'menu_main')
    ]
  ]);
}

// Preset Catalog Definitions (For Zero-Typing Experience)
const ANIMAL_CAT_PRESETS = {
  'Musang Pandan': {
    category: 'Musang',
    latin: 'Paradoxurus hermaphroditus',
    defaultPrice: 650000,
    image: 'assets/images/hero_musang.jpg',
    names: ['Musang Pandan Baby', 'Musang Pandan Jinak Total', 'Musang Pandan Ekor Putih', 'Musang Pandan Rawatan']
  },
  'Musang Bulan': {
    category: 'Musang',
    latin: 'Paguma larvata',
    defaultPrice: 850000,
    image: 'assets/images/hero_musang.jpg',
    names: ['Musang Bulan Baby', 'Musang Bulan Jinak', 'Musang Bulan Super White']
  },
  'Asian Otter': {
    category: 'Otter',
    latin: 'Aonyx cinereus',
    defaultPrice: 2500000,
    image: 'assets/images/otter.jpg',
    names: ['Asian Small-Clawed Otter Baby', 'Otter Jinak Handfeed', 'Otter Rawatan Prima']
  },
  'Hamster': {
    category: 'Rodent',
    latin: 'Mesocricetus auratus',
    defaultPrice: 50000,
    image: 'assets/images/hamster.jpg',
    names: ['Hamster Syrian Longhair', 'Hamster Winter White', 'Hamster Roborovski']
  },
  'Kelinci': {
    category: 'Rabbit',
    latin: 'Oryctolagus cuniculus',
    defaultPrice: 250000,
    image: 'assets/images/rabbit.jpg',
    names: ['Netherland Dwarf Ras Murni', 'Holland Lop Anakan', 'Kelinci Fuzzy Lop']
  },
  'Landak Mini': {
    category: 'Other',
    latin: 'Atelerix albiventris',
    defaultPrice: 350000,
    image: 'assets/images/hedgehog.jpg',
    names: ['African Pygmy Hedgehog', 'Landak Mini Salt & Pepper', 'Landak Mini Albino']
  }
};

const PRODUCT_CAT_PRESETS = {
  'Wood Pellets': {
    category: 'Alas Kandang',
    defaultPrice: 35000,
    image: 'assets/images/wood_pellets_bag.jpg',
    thumb: 'assets/images/wood_pellets_pile.jpg',
    names: ['Wood Pellets Premium 1kg', 'Wood Pellets Premium 5kg', 'Wood Pellets Premium 10kg', 'Wood Pellets Sak 20kg']
  },
  'Pakan & Nutrisi': {
    category: 'Pakan & Nutrisi',
    defaultPrice: 45000,
    image: 'assets/images/food_nutrition.jpg',
    thumb: 'assets/images/food_nutrition.jpg',
    names: ['Mix Seed & Dried Fruits', 'Pelet Nutrisi Hewan Eksotis', 'Suplemen Multivitamin Prima']
  },
  'Kandang & Habitat': {
    category: 'Kandang & Habitat',
    defaultPrice: 120000,
    image: 'assets/images/habitat_enclosure.jpg',
    thumb: 'assets/images/habitat_enclosure.jpg',
    names: ['Rumah Kayu Alami Eksotis', 'Hammock Ayunan Kandang', 'Kandang Portabel Nyaman']
  },
  'Aksesoris': {
    category: 'Aksesoris Kandang',
    defaultPrice: 25000,
    image: 'assets/images/pet_accessories.jpg',
    thumb: 'assets/images/pet_accessories.jpg',
    names: ['Mangkuk Keramik Ungu Bayoung', 'Botol Minum Dot Anti Tetes', 'Harness Tali Badan Eksotis']
  }
};

// In-Memory User State
const userSessions = {};

function initBot(token) {
  if (!token) {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN not provided.');
    return null;
  }

  const bot = new Telegraf(token);

  // Security: Only Whitelisted Admins
  bot.use(async (ctx, next) => {
    const fromId = ctx.from && ctx.from.id;
    if (!fromId) return;

    if (!isAdmin(fromId)) {
      return ctx.reply(
        `⛔ *Akses Ditolak*\n\n` +
        `ID Telegram Anda: \`${fromId}\` belum terdaftar sebagai admin Bayoung Exopet.\n\n` +
        `Silakan hubungi Superadmin (@abyy.nfs) untuk mendaftarkan ID Anda.`,
        { parse_mode: 'Markdown' }
      );
    }
    return next();
  });

  // Main Menu Generator
  function getMainMenu(userId) {
    const isSuper = isSuperAdmin(userId);
    const buttons = [
      [
        Markup.button.callback('🐾 Tambah Hewan (Musang, Otter, dll)', 'menu_add_animal')
      ],
      [
        Markup.button.callback('🪵 Tambah Produk (Wood Pellets, dll)', 'menu_add_product')
      ],
      [
        Markup.button.callback('📋 Kelola Hewan (Status/Ubah)', 'menu_list_animals'),
        Markup.button.callback('📦 Kelola Produk', 'menu_list_products')
      ],
      [
        Markup.button.callback('📊 Unduh Spreadsheet (Excel)', 'menu_download_sheet')
      ],
      [
        Markup.button.callback('ℹ️ Panduan Cepat', 'menu_help'),
        Markup.button.callback('🌐 Info Website', 'menu_web_status')
      ]
    ];

    if (isSuper) {
      buttons.splice(4, 0, [
        Markup.button.callback('👥 Kelola Admin ID', 'menu_manage_admins')
      ]);
    }

    return Markup.inlineKeyboard(buttons);
  }

  // /start or /menu command
  bot.command(['start', 'menu'], async (ctx) => {
    delete userSessions[ctx.from.id];
    await ctx.reply(
      `🐾 *BAYOUNG EXOPET — CMS ADMIN BOT* 🐾\n\n` +
      `Halo *${ctx.from.first_name || 'Admin'}*! Kelola katalog web Bayoung Exopet langsung dari tombol di bawah tanpa perlu banyak mengetik:\n\n` +
      `Silakan pilih menu:`,
      {
        parse_mode: 'Markdown',
        ...getMainMenu(ctx.from.id)
      }
    );
  });

  // Download Spreadsheet Handlers
  bot.action('menu_download_sheet', async (ctx) => {
    try {
      await ctx.answerCbQuery('Menyiapkan file spreadsheet...');
      updateLocalSpreadsheet();
      const xlsxPath = path.join(__dirname, 'Katalog_Bayoung_Exopet.xlsx');
      if (fs.existsSync(xlsxPath)) {
        await ctx.replyWithDocument(
          { source: xlsxPath, filename: 'Katalog_Bayoung_Exopet.xlsx' },
          {
            caption: '📊 *Spreadsheet Katalog Bayoung Exopet*\n\n' +
                     '✅ *🐾 Tab 1*: Hewan Adopsi (Musang, Otter, dll)\n' +
                     '✅ *🪵 Tab 2*: Produk & Perlengkapan (Wood Pellets, dll)\n\n' +
                     '💡 _Bisa langsung dibuka di Microsoft Excel atau di-import ke Google Sheets._',
            parse_mode: 'Markdown'
          }
        );
      } else {
        await ctx.reply('⚠️ File spreadsheet belum tersedia.');
      }
    } catch (err) {
      console.error('Error sending spreadsheet:', err);
      await ctx.reply('⚠️ Gagal mengirim spreadsheet: ' + err.message);
    }
  });

  bot.command(['spreadsheet', 'excel', 'sheet'], async (ctx) => {
    try {
      updateLocalSpreadsheet();
      const xlsxPath = path.join(__dirname, 'Katalog_Bayoung_Exopet.xlsx');
      if (fs.existsSync(xlsxPath)) {
        await ctx.replyWithDocument(
          { source: xlsxPath, filename: 'Katalog_Bayoung_Exopet.xlsx' },
          {
            caption: '📊 *Spreadsheet Katalog Bayoung Exopet*\n\n' +
                     '✅ *🐾 Tab 1*: Hewan Adopsi\n' +
                     '✅ *🪵 Tab 2*: Produk & Perlengkapan\n\n' +
                     '💡 _Bisa langsung dibuka di Microsoft Excel atau Google Sheets._',
            parse_mode: 'Markdown'
          }
        );
      }
    } catch (err) {
      await ctx.reply('⚠️ Gagal mengirim spreadsheet: ' + err.message);
    }
  });

  // /batal command
  bot.command(['batal', 'cancel'], async (ctx) => {
    delete userSessions[ctx.from.id];
    await ctx.reply('❌ Proses dibatalkan.', getMainMenu(ctx.from.id));
  });

  // Admin Management Commands
  bot.command('list_admin', async (ctx) => {
    const config = getAdminsConfig();
    let text = `👥 *Daftar Admin Bayoung Exopet:*\n\n`;
    text += `👑 *Superadmin*: \`${config.superadmin}\`\n\n`;
    text += `👮‍♂️ *Admin Terdaftar (${config.admins.length}):*\n`;
    config.admins.forEach((id, idx) => {
      text += `${idx + 1}. \`${id}\`${id === config.superadmin ? ' (Superadmin)' : ''}\n`;
    });
    text += `\n_Gunakan /tambah_admin [ID] atau /hapus_admin [ID]._`;
    await ctx.reply(text, { parse_mode: 'Markdown' });
  });

  bot.command('tambah_admin', async (ctx) => {
    if (!isSuperAdmin(ctx.from.id)) return ctx.reply('⛔ Hanya Superadmin yang berhak menambah admin.');
    const parts = ctx.message.text.trim().split(/\s+/);
    if (parts.length < 2) return ctx.reply('⚠️ Contoh: `/tambah_admin 123456789`', { parse_mode: 'Markdown' });
    const targetId = parts[1].replace(/[^0-9]/g, '');
    if (addAdmin(targetId)) {
      await ctx.reply(`✅ Berhasil menambahkan ID \`${targetId}\` sebagai Admin!`, { parse_mode: 'Markdown' });
    } else {
      await ctx.reply(`ℹ️ ID \`${targetId}\` sudah terdaftar sebagai Admin.`, { parse_mode: 'Markdown' });
    }
  });

  bot.command('hapus_admin', async (ctx) => {
    if (!isSuperAdmin(ctx.from.id)) return ctx.reply('⛔ Hanya Superadmin yang berhak menghapus admin.');
    const parts = ctx.message.text.trim().split(/\s+/);
    if (parts.length < 2) return ctx.reply('⚠️ Contoh: `/hapus_admin 123456789`', { parse_mode: 'Markdown' });
    const targetId = parts[1].replace(/[^0-9]/g, '');
    if (targetId === getAdminsConfig().superadmin) return ctx.reply('❌ Superadmin tidak dapat dihapus.');
    if (removeAdmin(targetId)) {
      await ctx.reply(`✅ Berhasil menghapus ID \`${targetId}\` dari Admin.`, { parse_mode: 'Markdown' });
    } else {
      await ctx.reply(`⚠️ ID \`${targetId}\` tidak ditemukan.`, { parse_mode: 'Markdown' });
    }
  });

  // Action: Main Menu Return
  bot.action('menu_main', async (ctx) => {
    delete userSessions[ctx.from.id];
    await ctx.editMessageText(
      `🐾 *BAYOUNG EXOPET — CMS BOT* 🐾\n\nPilih aksi yang ingin Anda lakukan:`,
      {
        parse_mode: 'Markdown',
        ...getMainMenu(ctx.from.id)
      }
    );
  });

  bot.action('menu_help', async (ctx) => {
    const helpText = 
      `💡 *Panduan Input Cepat (Quick Caption)*\n\n` +
      `Anda bisa langsung **kirim foto hewan/produk** ke chat bot ini dengan teks caption:\n\n` +
      `🐾 *Contoh Tambah Hewan:*\n` +
      `\`\`\`\n` +
      `/tambah_hewan\n` +
      `Nama: Musang Pandan Baby\n` +
      `Kategori: Musang\n` +
      `Harga: Rp 650.000\n` +
      `Usia: 2.5 Bulan\n` +
      `Karakter: Jinak total, manja\n` +
      `\`\`\`\n\n` +
      `🪵 *Contoh Tambah Produk:*\n` +
      `\`\`\`\n` +
      `/tambah_produk\n` +
      `Nama: Wood Pellets 10kg\n` +
      `Harga: Rp 85.000\n` +
      `Kategori: Alas Kandang\n` +
      `\`\`\``;

    await ctx.editMessageText(helpText, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Kembali ke Menu Utama', 'menu_main')]])
    });
  });

  bot.action('menu_web_status', async (ctx) => {
    const text = 
      `🌐 *Status Website Bayoung Exopet*\n\n` +
      `✅ *Server & API*: Aktif Berjalan\n` +
      `🔗 *Akses Web*: \`http://localhost:3000\`\n` +
      `📱 *Katalog Live*: Tersinkronisasi Otomatis\n\n` +
      `_Setiap produk atau hewan yang Anda masukkan lewat bot ini langsung terbit di website secara real-time!_`;

    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Kembali ke Menu Utama', 'menu_main')]])
    });
  });

  bot.action('menu_manage_admins', async (ctx) => {
    if (!isSuperAdmin(ctx.from.id)) return ctx.answerCbQuery('Hanya superadmin.');
    const config = getAdminsConfig();
    let text = `👥 *Kelola Admin Telegram*\n\n` +
      `👑 *Superadmin*: \`${config.superadmin}\`\n\n` +
      `*Admin Terdaftar:*\n`;
    config.admins.forEach((id, idx) => {
      text += `${idx + 1}. \`${id}\`${id === config.superadmin ? ' *(Utama)*' : ''}\n`;
    });
    text += `\n*Perintah Cepat:*\n` +
      `• Tambah admin: \`/tambah_admin [ID]\`\n` +
      `• Hapus admin: \`/hapus_admin [ID]\``;

    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Kembali ke Menu Utama', 'menu_main')]])
    });
  });

  // =================================================================
  // ANIMAL WIZARD (ZERO-TYPING BUTTON FLOW)
  // =================================================================

  bot.action('menu_add_animal', async (ctx) => {
    userSessions[ctx.from.id] = {
      type: 'animal',
      step: 'photo',
      data: {
        status: 'Tersedia',
        priceAmount: 650000
      }
    };

    await ctx.editMessageText(
      `🐾 *Tambah Hewan Adopsi (Langkah 1/5)*\n\n` +
      `Silakan **kirimkan foto hewan** ke chat ini.\n\n` +
      `_Atau gunakan tombol di bawah jika ingin menggunakan foto default:_`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('🖼️ Gunakan Foto Default & Lanjut', 'animal_skip_photo')],
          [Markup.button.callback('❌ Batal', 'menu_main')]
        ])
      }
    );
  });

  bot.action('animal_skip_photo', async (ctx) => {
    const session = userSessions[ctx.from.id];
    if (!session || session.type !== 'animal') return;
    session.data.image = 'assets/images/hero_musang.jpg';
    showAnimalCategorySelector(ctx);
  });

  function showAnimalCategorySelector(ctx) {
    const session = userSessions[ctx.from.id];
    if (!session) return;
    session.step = 'category_selection';

    const text = `🐾 *Pilih Jenis / Kategori Hewan (Langkah 2/5):*`;
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('🦡 Musang Pandan', 'anim_pick_cat_Musang Pandan'),
        Markup.button.callback('🦝 Musang Bulan', 'anim_pick_cat_Musang Bulan')
      ],
      [
        Markup.button.callback('🦦 Asian Otter', 'anim_pick_cat_Asian Otter'),
        Markup.button.callback('🐹 Hamster Syrian', 'anim_pick_cat_Hamster')
      ],
      [
        Markup.button.callback('🐰 Kelinci', 'anim_pick_cat_Kelinci'),
        Markup.button.callback('🦔 Landak Mini', 'anim_pick_cat_Landak Mini')
      ],
      [
        Markup.button.callback('✏️ Ketik Jenis Lain Sendiri', 'anim_pick_cat_custom')
      ],
      [
        Markup.button.callback('❌ Batal', 'menu_main')
      ]
    ]);

    if (ctx.updateType === 'callback_query') {
      ctx.editMessageText(text, { parse_mode: 'Markdown', ...keyboard });
    } else {
      ctx.reply(text, { parse_mode: 'Markdown', ...keyboard });
    }
  }

  // Handle Animal Category Click
  bot.action(/^anim_pick_cat_(.+)$/, async (ctx) => {
    const key = ctx.match[1];
    const session = userSessions[ctx.from.id];
    if (!session || session.type !== 'animal') return;

    if (key === 'custom') {
      session.step = 'custom_category';
      return ctx.editMessageText(
        `Ketik jenis hewan yang ingin Anda masukkan:\n(Contoh: *Sugar Glider* atau *Reptil*)`,
        { parse_mode: 'Markdown' }
      );
    }

    const preset = ANIMAL_CAT_PRESETS[key];
    session.data.presetKey = key;
    session.data.category = preset.category;
    session.data.latin = preset.latin;
    session.data.priceAmount = preset.defaultPrice;
    if (!session.data.image || session.data.image.includes('hero_musang')) {
      session.data.image = preset.image;
    }

    // Move to Name Selection
    showAnimalNameSelector(ctx, preset);
  });

  function showAnimalNameSelector(ctx, preset) {
    const session = userSessions[ctx.from.id];
    session.step = 'name_selection';

    const catName = preset.category || session.data.category || session.data.presetKey || 'Hewan';
    const buttons = (preset.names || []).map((nm, idx) => [
      Markup.button.callback(`✦ ${nm}`, `anim_pick_name_${idx}`)
    ]);
    buttons.push([Markup.button.callback('✏️ Ketik Nama Kustom', 'anim_name_custom')]);
    buttons.push([Markup.button.callback('❌ Batal', 'menu_main')]);

    const text = `🐾 *Pilih Nama Hewan (Langkah 3/5):*\nKategori: *${catName}*`;

    return safeReplyOrEdit(ctx, text, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(buttons)
    });
  }

  bot.action(/^anim_pick_name_(\d+)$/, async (ctx) => {
    const idx = parseInt(ctx.match[1], 10);
    const session = userSessions[ctx.from.id];
    if (!session || session.type !== 'animal') return;

    const preset = ANIMAL_CAT_PRESETS[session.data.presetKey] || session.data.customPreset || { names: [session.data.name || 'Hewan Eksotis'] };
    session.data.name = preset.names[idx] || `${session.data.category || 'Hewan'} Eksotis`;
    session.data.id = session.data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `animal-${Date.now()}`;

    // Move to Age selector
    showAnimalAgeSelector(ctx);
  });

  bot.action('anim_name_custom', async (ctx) => {
    const session = userSessions[ctx.from.id];
    if (!session) return;
    session.step = 'custom_name';
    await safeReplyOrEdit(ctx, 'Ketik nama lengkap hewan adopsi:\n(Contoh: *Musang Pandan Ekor Putih Jinak*)', { parse_mode: 'Markdown' });
  });

  function showAnimalAgeSelector(ctx) {
    const session = userSessions[ctx.from.id];
    session.step = 'age_selection';

    const text = `📅 *Pilih Usia Hewan (Langkah 4/5):*\nNama: *${session.data.name}*`;
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('1.5 Bulan', 'anim_age_1.5 Bulan'),
        Markup.button.callback('2 Bulan', 'anim_age_2 Bulan'),
        Markup.button.callback('2.5 Bulan', 'anim_age_2.5 Bulan')
      ],
      [
        Markup.button.callback('3 Bulan', 'anim_age_3 Bulan'),
        Markup.button.callback('3.5 Bulan', 'anim_age_3.5 Bulan'),
        Markup.button.callback('4 Bulan', 'anim_age_4 Bulan')
      ],
      [
        Markup.button.callback('Remaja (5-7 Bulan)', 'anim_age_Remaja'),
        Markup.button.callback('Dewasa', 'anim_age_Dewasa')
      ],
      [
        Markup.button.callback('✏️ Ketik Usia Kustom', 'anim_age_custom')
      ],
      [
        Markup.button.callback('❌ Batal', 'menu_main')
      ]
    ]);

    return safeReplyOrEdit(ctx, text, { parse_mode: 'Markdown', ...keyboard });
  }

  bot.action('anim_age_custom', async (ctx) => {
    const session = userSessions[ctx.from.id];
    if (!session) return ctx.answerCbQuery();
    session.step = 'custom_age';
    await safeReplyOrEdit(ctx, '📅 Ketik usia hewan ini:\n(Contoh: *1.5 Bulan* atau *8 Bulan*)', { parse_mode: 'Markdown' });
  });

  bot.action(/^anim_age_(.+)$/, async (ctx) => {
    const age = ctx.match[1];
    const session = userSessions[ctx.from.id];
    if (!session || session.type !== 'animal') return;

    session.data.age = age;
    // Move to interactive price selector
    showPriceKeypad(ctx);
  });

  function showPriceKeypad(ctx) {
    const session = userSessions[ctx.from.id];
    session.step = 'price_keypad';

    const formatted = formatRupiah(session.data.priceAmount);
    const itemName = session.type === 'animal' ? session.data.name : session.data.title;

    const text = 
      `💰 *Tentukan Harga / Biaya Adopsi (Langkah 5/5):*\n\n` +
      `Item: *${itemName}*\n` +
      `Harga Terpilih: *${formatted}*\n\n` +
      `_Klik tombol nominal atau gunakan (+) / (-) untuk mengatur:_`;

    const keyboard = getPriceKeyboard(session.type, session.data.priceAmount);
    return safeReplyOrEdit(ctx, text, { parse_mode: 'Markdown', ...keyboard });
  }

  // Handle Price Adjustment Callbacks (+ / -)
  bot.action(/^adjust_price_(-?\d+)$/, async (ctx) => {
    const diff = parseInt(ctx.match[1], 10);
    const session = userSessions[ctx.from.id];
    if (!session) return ctx.answerCbQuery();

    let cur = typeof session.data.priceAmount === 'number' ? session.data.priceAmount : 500000;
    cur += diff;
    if (cur < 0) cur = 0;
    session.data.priceAmount = cur;

    await ctx.answerCbQuery(`${diff > 0 ? '+' : ''}${diff.toLocaleString('id-ID')}`);
    showPriceKeypad(ctx);
  });

  // Handle Set Price directly to preset
  bot.action(/^set_price_(\d+)$/, async (ctx) => {
    const target = parseInt(ctx.match[1], 10);
    const session = userSessions[ctx.from.id];
    if (!session) return ctx.answerCbQuery();

    session.data.priceAmount = target;
    await ctx.answerCbQuery(`Harga diset ke ${formatRupiah(target)}`);
    showPriceKeypad(ctx);
  });

  bot.action('set_price_hubungi', async (ctx) => {
    const session = userSessions[ctx.from.id];
    if (!session) return ctx.answerCbQuery();

    session.data.priceAmount = 'Hubungi Admin';
    await ctx.answerCbQuery('Diset ke Hubungi Admin');
    showPriceKeypad(ctx);
  });

  // Handle Confirm Price
  bot.action('confirm_price', async (ctx) => {
    const session = userSessions[ctx.from.id];
    if (!session) return ctx.answerCbQuery();

    session.data.price = formatRupiah(session.data.priceAmount);

    if (session.type === 'animal') {
      // Animal: Ask for character presets
      showAnimalCharacterSelector(ctx);
    } else if (session.type === 'product') {
      // Product: Finalize directly!
      finalizeProduct(ctx);
    } else if (session.type === 'edit_product_price') {
      // Editing existing product price
      finalizeEditPrice(ctx);
    } else if (session.type === 'edit_animal_price') {
      // Editing existing animal price
      finalizeEditAnimalPrice(ctx);
    }
  });

  function showAnimalCharacterSelector(ctx) {
    const session = userSessions[ctx.from.id];
    session.step = 'character_selection';

    const text = `✨ *Pilih Karakter & Temperamen:*`;
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🐾 Jinak Total, Manja & Bonding', 'anim_char_Jinak total, manja, suka di pundak & bonding')],
      [Markup.button.callback('🍼 Biasa Handfeed & Gendong', 'anim_char_Biasa handfeed, ramah dan tidak gigit')],
      [Markup.button.callback('⚡ Lincah, Aktif & Sehat Prima', 'anim_char_Aktif lincah, rasa ingin tahu tinggi, sehat prima')],
      [Markup.button.callback('💤 Tenang, Santai & Kalem', 'anim_char_Tenang, kalem, mudah dihandle')],
      [Markup.button.callback('✏️ Ketik Karakter Kustom Sendiri', 'anim_char_custom')],
      [Markup.button.callback('❌ Batal', 'menu_main')]
    ]);

    return safeReplyOrEdit(ctx, text, { parse_mode: 'Markdown', ...keyboard });
  }

  bot.action('anim_char_custom', async (ctx) => {
    const session = userSessions[ctx.from.id];
    if (!session) return ctx.answerCbQuery();
    session.step = 'custom_character';
    await safeReplyOrEdit(ctx, '✨ Ketik karakter atau sifat khusus hewan ini:\n(Contoh: *Jinak total, manja, suka dielus, aktif dan sehat*)', { parse_mode: 'Markdown' });
  });

  bot.action(/^anim_char_(.+)$/, async (ctx) => {
    const char = ctx.match[1];
    const session = userSessions[ctx.from.id];
    if (!session || session.type !== 'animal') return;

    session.data.character = char;
    finalizeAnimal(ctx);
  });

  function finalizeAnimal(ctx) {
    const session = userSessions[ctx.from.id];
    const data = session.data;

    data.diet = data.diet || 'Buah segar matang, protein ayam rebus & suplemen kalsium';
    data.health = data.health || 'Sehat prima, aktif, bebas jamur & kutu, kuku terawat';
    data.requirements = data.requirements || 'Kandang nyaman bersih, alas wood pellets berkualitas, serta komitmen bermain.';
    data.description = data.description || `${data.name} anakan sehat dan terawat prima di studio Bayoung Exopet Pakisaji Malang. Karakter ${data.character}, usia ${data.age}.`;

    const animals = readJSON(ANIMALS_FILE, []);
    let finalId = data.id || `animal-${Date.now()}`;
    let counter = 1;
    while (animals.some(a => a.id === finalId)) {
      finalId = `${data.id}-${counter++}`;
    }
    data.id = finalId;

    animals.unshift(data);
    writeJSON(ANIMALS_FILE, animals);
    syncToGoogleSheet('ADD_ANIMAL', data);

    delete userSessions[ctx.from.id];

    const successText = 
      `🎉 *HEWAN ADOPSI BERHASIL DITAMBAHKAN!* 🎉\n\n` +
      `🐾 *Nama*: ${data.name}\n` +
      `🏷️ *Kategori*: ${data.category}\n` +
      `📅 *Usia*: ${data.age}\n` +
      `💰 *Biaya Adopsi*: *${data.price}*\n` +
      `✨ *Karakter*: ${data.character}\n` +
      `🟢 *Status*: Tersedia\n\n` +
      `✅ *Langsung tampil di website Bayoung Exopet sekarang!*`;

    safeReplyOrEdit(ctx, successText, {
      parse_mode: 'Markdown',
      ...getMainMenu(ctx.from.id)
    });
  }

  // =================================================================
  // PRODUCT WIZARD (ZERO-TYPING BUTTON FLOW)
  // =================================================================

  bot.action('menu_add_product', async (ctx) => {
    userSessions[ctx.from.id] = {
      type: 'product',
      step: 'photo',
      data: {
        badge: 'Terlaris',
        status: 'Tersedia',
        priceAmount: 35000
      }
    };

    await ctx.editMessageText(
      `🪵 *Tambah Produk / Perlengkapan (Langkah 1/4)*\n\n` +
      `Silakan **kirimkan foto produk** ke chat ini.\n\n` +
      `_Atau gunakan tombol di bawah untuk foto default:_`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('🖼️ Gunakan Foto Default & Lanjut', 'product_skip_photo')],
          [Markup.button.callback('❌ Batal', 'menu_main')]
        ])
      }
    );
  });

  bot.action('product_skip_photo', async (ctx) => {
    const session = userSessions[ctx.from.id];
    if (!session || session.type !== 'product') return;
    session.data.image = 'assets/images/wood_pellets_bag.jpg';
    session.data.thumb = 'assets/images/wood_pellets_pile.jpg';
    showProductCategorySelector(ctx);
  });

  function showProductCategorySelector(ctx) {
    const session = userSessions[ctx.from.id];
    session.step = 'category_selection';

    const text = `🪵 *Pilih Kategori Produk (Langkah 2/4):*`;
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('🪵 Wood Pellets (Alas Kandang)', 'prod_pick_cat_Wood Pellets')
      ],
      [
        Markup.button.callback('🥣 Pakan & Nutrisi', 'prod_pick_cat_Pakan & Nutrisi')
      ],
      [
        Markup.button.callback('🏠 Kandang & Habitat', 'prod_pick_cat_Kandang & Habitat')
      ],
      [
        Markup.button.callback('🐾 Mangkuk & Aksesoris', 'prod_pick_cat_Aksesoris')
      ],
      [
        Markup.button.callback('✏️ Ketik Kategori Kustom', 'prod_pick_cat_custom')
      ],
      [
        Markup.button.callback('❌ Batal', 'menu_main')
      ]
    ]);

    return safeReplyOrEdit(ctx, text, { parse_mode: 'Markdown', ...keyboard });
  }

  bot.action(/^prod_pick_cat_(.+)$/, async (ctx) => {
    const key = ctx.match[1];
    const session = userSessions[ctx.from.id];
    if (!session || session.type !== 'product') return;

    if (key === 'custom') {
      session.step = 'custom_prod_category';
      return safeReplyOrEdit(ctx, 'Ketik kategori produk:\n(Contoh: *Vitamin & Suplemen* atau *Shampoo & Perawatan*)', { parse_mode: 'Markdown' });
    }

    const preset = PRODUCT_CAT_PRESETS[key];
    session.data.presetKey = key;
    session.data.category = preset.category;
    session.data.priceAmount = preset.defaultPrice;
    if (!session.data.image || session.data.image.includes('wood_pellets_bag')) {
      session.data.image = preset.image;
      session.data.thumb = preset.thumb;
    }

    showProductNameSelector(ctx, preset);
  });

  function showProductNameSelector(ctx, preset) {
    const session = userSessions[ctx.from.id];
    session.step = 'name_selection';

    const names = preset && preset.names ? preset.names : [];
    const buttons = names.map((nm, idx) => [
      Markup.button.callback(`✦ ${nm}`, `prod_pick_name_${idx}`)
    ]);
    buttons.push([Markup.button.callback('✏️ Ketik Nama Kustom', 'prod_name_custom')]);
    buttons.push([Markup.button.callback('❌ Batal', 'menu_main')]);

    const catName = preset && preset.category ? preset.category : (session.data.category || 'Produk');
    const text = `🪵 *Pilih Nama Produk (Langkah 3/4):*\nKategori: *${catName}*`;

    return safeReplyOrEdit(ctx, text, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(buttons)
    });
  }

  bot.action(/^prod_pick_name_(\d+)$/, async (ctx) => {
    const idx = parseInt(ctx.match[1], 10);
    const session = userSessions[ctx.from.id];
    if (!session || session.type !== 'product') return;

    const preset = PRODUCT_CAT_PRESETS[session.data.presetKey] || session.data.customProdPreset;
    const names = preset && preset.names ? preset.names : [];
    session.data.title = names[idx] || `${session.data.category || 'Produk'} Bayoung`;
    session.data.id = session.data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `prod-${Date.now()}`;

    // Move directly to price keypad
    showPriceKeypad(ctx);
  });

  bot.action('prod_name_custom', async (ctx) => {
    const session = userSessions[ctx.from.id];
    if (!session) return;
    session.step = 'custom_prod_name';
    await safeReplyOrEdit(ctx, 'Ketik nama lengkap produk:\n(Contoh: *Wood Pellets Sak 20kg*)', { parse_mode: 'Markdown' });
  });

  function finalizeProduct(ctx) {
    const session = userSessions[ctx.from.id];
    const data = session.data;

    data.highlight = data.highlight || `${data.title} kualitas premium terjamin untuk hewan kesayangan Anda.`;
    data.description = data.description || `${data.title} diproduksi khusus untuk kenyamanan dan kesehatan hewan peliharaan Anda. Kualitas terpilih bebas zat kimia berbahaya.`;
    data.suitableFor = data.suitableFor || 'Musang, Otter, Kelinci, Hamster & Hewan Eksotis lainnya';
    data.specs = data.specs || [
      { label: 'Kategori', val: data.category },
      { label: 'Standar Kualitas', val: 'Premium Selected Grade' }
    ];

    const products = readJSON(PRODUCTS_FILE, []);
    let finalId = data.id || `prod-${Date.now()}`;
    let counter = 1;
    while (products.some(p => p.id === finalId)) {
      finalId = `${data.id}-${counter++}`;
    }
    data.id = finalId;

    products.unshift(data);
    writeJSON(PRODUCTS_FILE, products);
    syncToGoogleSheet('ADD_PRODUCT', data);

    delete userSessions[ctx.from.id];

    const successText = 
      `🎉 *PRODUK BERHASIL DITAMBAHKAN!* 🎉\n\n` +
      `📦 *Nama*: ${data.title}\n` +
      `🏷️ *Kategori*: ${data.category}\n` +
      `💰 *Harga*: *${data.price}*\n` +
      `🟢 *Status*: Tersedia\n\n` +
      `✅ *Langsung tampil di katalog website Bayoung Exopet!*`;

    safeReplyOrEdit(ctx, successText, {
      parse_mode: 'Markdown',
      ...getMainMenu(ctx.from.id)
    });
  }

  // =================================================================
  // LIST & EDIT PRODUCTS / ANIMALS
  // =================================================================

  // =================================================================
  // LIST & EDIT PRODUCTS (SELECT ITEM FIRST)
  // =================================================================

  bot.action('menu_list_products', async (ctx) => {
    const products = readJSON(PRODUCTS_FILE, []);
    if (products.length === 0) {
      return ctx.editMessageText(
        `📦 Belum ada produk di database. Silakan tambah produk baru!`,
        {
          ...Markup.inlineKeyboard([
            [Markup.button.callback('🪵 Tambah Produk Baru', 'menu_add_product')],
            [Markup.button.callback('⬅️ Kembali', 'menu_main')]
          ])
        }
      );
    }

    let text = `📦 *DAFTAR PRODUK (${products.length})*\n\n`;
    const buttons = [];

    products.forEach((p, index) => {
      const isReady = p.status === 'Ready' || p.status === 'Tersedia' || p.status === 'Ada';
      text += `*${index + 1}. ${p.title}*\n`;
      text += `   🏷️ ${p.category}\n`;
      text += `   💰 Harga: *${p.price || 'Rp -'}* | Status: _${p.status || 'Tersedia'}_ ${isReady ? '🟢' : '🔴'}\n\n`;

      buttons.push([
        Markup.button.callback(`${index + 1}. ${p.title.substring(0, 24)} ${isReady ? '🟢' : '🔴'}`, `manage_prod_${p.id}`)
      ]);
    });

    text += `_Pilih nomor produk di bawah yang ingin Anda kelola:_`;

    buttons.push([
      Markup.button.callback('🪵 Tambah Produk Baru', 'menu_add_product'),
      Markup.button.callback('⬅️ Menu Utama', 'menu_main')
    ]);

    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(buttons)
    });
  });

  // Manage Single Product Submenu
  bot.action(/^manage_prod_(.+)$/, async (ctx) => {
    const prodId = ctx.match[1];
    const products = readJSON(PRODUCTS_FILE, []);
    const target = products.find(p => p.id === prodId);
    if (!target) return ctx.answerCbQuery('Produk tidak ditemukan.');

    const isReady = target.status === 'Ready' || target.status === 'Tersedia' || target.status === 'Ada';
    const text = 
      `🪵 *Kelola Produk: ${target.title}*\n\n` +
      `🏷️ *Kategori*: ${target.category}\n` +
      `💰 *Harga*: *${target.price || 'Rp -'}*\n` +
      `📌 *Status*: *${target.status || 'Tersedia'}* ${isReady ? '🟢 (Stok Tersedia)' : '🔴 (Habis)'}\n\n` +
      `_Pilih aksi yang ingin dilakukan:_`;

    const buttons = [
      [
        Markup.button.callback(isReady ? '🔴 Tandai Stok Habis' : '🟢 Tandai Stok Tersedia', `toggle_prod_status_${target.id}`)
      ],
      [
        Markup.button.callback('✏️ Ubah Harga (+ / -)', `edit_price_prod_${target.id}`)
      ],
      [
        Markup.button.callback('🗑️ Hapus Produk dari Web', `del_prod_${target.id}`)
      ],
      [
        Markup.button.callback('⬅️ Kembali ke Daftar Produk', 'menu_list_products')
      ]
    ];

    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(buttons)
    });
  });

  bot.action(/^toggle_prod_status_(.+)$/, async (ctx) => {
    const prodId = ctx.match[1];
    const products = readJSON(PRODUCTS_FILE, []);
    const target = products.find(p => p.id === prodId);
    if (!target) return ctx.answerCbQuery('Produk tidak ditemukan.');

    const isReady = target.status === 'Ready' || target.status === 'Tersedia' || target.status === 'Ada';
    target.status = isReady ? 'Habis' : 'Tersedia';
    writeJSON(PRODUCTS_FILE, products);
    syncToGoogleSheet('UPDATE_PRODUCT_STATUS', { id: prodId, status: target.status });
    await ctx.answerCbQuery(`Status diubah ke ${target.status}`);

    return bot.handleUpdate({
      ...ctx.update,
      callback_query: { ...ctx.update.callback_query, data: `manage_prod_${prodId}` }
    });
  });

  bot.action(/^edit_price_prod_(.+)$/, async (ctx) => {
    const prodId = ctx.match[1];
    const products = readJSON(PRODUCTS_FILE, []);
    const product = products.find(p => p.id === prodId);
    if (!product) return ctx.answerCbQuery('Produk tidak ditemukan.');

    const num = parseInt(product.price ? product.price.replace(/[^0-9]/g, '') : '35000', 10) || 35000;

    userSessions[ctx.from.id] = {
      type: 'edit_product_price',
      targetId: prodId,
      data: {
        title: product.title,
        priceAmount: num
      }
    };

    showPriceKeypad(ctx);
  });

  function finalizeEditPrice(ctx) {
    const session = userSessions[ctx.from.id];
    const products = readJSON(PRODUCTS_FILE, []);
    const product = products.find(p => p.id === session.targetId);
    if (product) {
      product.price = session.data.price;
      writeJSON(PRODUCTS_FILE, products);
      syncToGoogleSheet('UPDATE_PRODUCT_PRICE', { id: product.id, price: product.price });
      const targetId = session.targetId;
      delete userSessions[ctx.from.id];

      return bot.handleUpdate({
        ...ctx.update,
        callback_query: { ...ctx.update.callback_query, data: `manage_prod_${targetId}` }
      });
    }
  }

  bot.action(/^del_prod_(.+)$/, async (ctx) => {
    const prodId = ctx.match[1];
    let products = readJSON(PRODUCTS_FILE, []);
    const target = products.find(p => p.id === prodId);
    if (!target) return ctx.answerCbQuery('Produk tidak ditemukan.');

    products = products.filter(p => p.id !== prodId);
    writeJSON(PRODUCTS_FILE, products);
    updateLocalSpreadsheet();
    await ctx.answerCbQuery(`Produk "${target.title}" dihapus.`);

    return bot.handleUpdate({
      ...ctx.update,
      callback_query: { ...ctx.update.callback_query, data: 'menu_list_products' }
    });
  });

  // =================================================================
  // LIST & EDIT ANIMALS (SELECT ITEM FIRST)
  // =================================================================

  bot.action('menu_list_animals', async (ctx) => {
    const animals = readJSON(ANIMALS_FILE, []);
    if (animals.length === 0) {
      return ctx.editMessageText(
        `🐾 Belum ada hewan di database. Silakan tambah hewan baru!`,
        {
          ...Markup.inlineKeyboard([
            [Markup.button.callback('🐾 Tambah Hewan Baru', 'menu_add_animal')],
            [Markup.button.callback('⬅️ Kembali', 'menu_main')]
          ])
        }
      );
    }

    let text = `🐾 *DAFTAR HEWAN ADOPSI (${animals.length})*\n\n`;
    const buttons = [];

    animals.forEach((a, index) => {
      const isAvail = a.status === 'Available' || a.status === 'Tersedia';
      text += `*${index + 1}. ${a.name}*\n`;
      text += `   🏷️ ${a.category} • Usia: ${a.age || '-'}\n`;
      text += `   💰 Adopsi: *${a.price || 'Hubungi Kami'}*\n`;
      text += `   📌 Status: *${a.status || 'Tersedia'}* ${isAvail ? '🟢 (Tersedia)' : '🔴 (Teradopsi)'}\n\n`;

      buttons.push([
        Markup.button.callback(`${index + 1}. ${a.name.substring(0, 24)} ${isAvail ? '🟢' : '🔴'}`, `manage_anim_${a.id}`)
      ]);
    });

    text += `_Pilih nomor hewan di bawah yang ingin Anda kelola:_`;

    buttons.push([
      Markup.button.callback('🐾 Tambah Hewan Baru', 'menu_add_animal'),
      Markup.button.callback('⬅️ Menu Utama', 'menu_main')
    ]);

    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(buttons)
    });
  });

  // Manage Single Animal Submenu
  bot.action(/^manage_anim_(.+)$/, async (ctx) => {
    const animId = ctx.match[1];
    const animals = readJSON(ANIMALS_FILE, []);
    const target = animals.find(a => a.id === animId);
    if (!target) return ctx.answerCbQuery('Hewan tidak ditemukan.');

    const isAvail = target.status === 'Available' || target.status === 'Tersedia';
    const text = 
      `🐾 *Kelola Hewan: ${target.name}*\n\n` +
      `🏷️ *Kategori*: ${target.category}\n` +
      `📅 *Usia*: ${target.age || '-'}\n` +
      `💰 *Biaya Adopsi*: *${target.price || 'Hubungi Kami'}*\n` +
      `📌 *Status Saat Ini*: *${target.status || 'Tersedia'}* ${isAvail ? '🟢 (Tersedia di Web)' : '🔴 (Sudah Teradopsi)'}\n` +
      `✨ *Karakter*: ${target.character || '-'}\n\n` +
      `_Pilih aksi yang ingin dilakukan:_`;

    const buttons = [
      [
        Markup.button.callback(isAvail ? '🔴 Tandai Sudah Teradopsi' : '🟢 Tandai Tersedia', `toggle_anim_status_${target.id}`)
      ],
      [
        Markup.button.callback('✏️ Ubah Harga (+ / -)', `edit_price_anim_${target.id}`)
      ],
      [
        Markup.button.callback('🗑️ Hapus Hewan dari Web', `del_anim_${target.id}`)
      ],
      [
        Markup.button.callback('⬅️ Kembali ke Daftar Hewan', 'menu_list_animals')
      ]
    ];

    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(buttons)
    });
  });

  bot.action(/^toggle_anim_status_(.+)$/, async (ctx) => {
    const animId = ctx.match[1];
    const animals = readJSON(ANIMALS_FILE, []);
    const target = animals.find(a => a.id === animId);
    if (!target) return ctx.answerCbQuery('Hewan tidak ditemukan.');

    const isAvail = target.status === 'Available' || target.status === 'Tersedia';
    target.status = isAvail ? 'Sudah Teradopsi' : 'Tersedia';
    writeJSON(ANIMALS_FILE, animals);
    syncToGoogleSheet('UPDATE_ANIMAL_STATUS', { id: animId, status: target.status });
    await ctx.answerCbQuery(`Status diubah ke ${target.status}!`);

    return bot.handleUpdate({
      ...ctx.update,
      callback_query: { ...ctx.update.callback_query, data: `manage_anim_${animId}` }
    });
  });

  bot.action(/^edit_price_anim_(.+)$/, async (ctx) => {
    const animId = ctx.match[1];
    const animals = readJSON(ANIMALS_FILE, []);
    const target = animals.find(a => a.id === animId);
    if (!target) return ctx.answerCbQuery('Hewan tidak ditemukan.');

    const num = parseInt(target.price ? target.price.replace(/[^0-9]/g, '') : '650000', 10) || 650000;

    userSessions[ctx.from.id] = {
      type: 'edit_animal_price',
      targetId: animId,
      data: {
        name: target.name,
        priceAmount: num
      }
    };

    showPriceKeypad(ctx);
  });

  function finalizeEditAnimalPrice(ctx) {
    const session = userSessions[ctx.from.id];
    const animals = readJSON(ANIMALS_FILE, []);
    const animal = animals.find(a => a.id === session.targetId);
    if (animal) {
      animal.price = session.data.price;
      writeJSON(ANIMALS_FILE, animals);
      syncToGoogleSheet('UPDATE_ANIMAL_PRICE', { id: animal.id, price: animal.price });
      const targetId = session.targetId;
      delete userSessions[ctx.from.id];

      return bot.handleUpdate({
        ...ctx.update,
        callback_query: { ...ctx.update.callback_query, data: `manage_anim_${targetId}` }
      });
    }
  }

  bot.action(/^del_anim_(.+)$/, async (ctx) => {
    const animId = ctx.match[1];
    let animals = readJSON(ANIMALS_FILE, []);
    const target = animals.find(a => a.id === animId);
    if (!target) return ctx.answerCbQuery('Hewan tidak ditemukan.');

    animals = animals.filter(a => a.id !== animId);
    writeJSON(ANIMALS_FILE, animals);
    updateLocalSpreadsheet();
    await ctx.answerCbQuery(`Hewan "${target.name}" dihapus.`);

    return bot.handleUpdate({
      ...ctx.update,
      callback_query: { ...ctx.update.callback_query, data: 'menu_list_animals' }
    });
  });

  // Photo Receiver Handler
  bot.on('photo', async (ctx) => {
    const userId = ctx.from.id;
    const session = userSessions[userId];
    const caption = ctx.message.caption ? ctx.message.caption.trim() : '';

    if (caption.startsWith('/tambah_produk')) return handleQuickAddProduct(ctx);
    if (caption.startsWith('/tambah_hewan')) return handleQuickAddAnimal(ctx);

    if (session && session.step === 'photo') {
      const photos = ctx.message.photo;
      const largest = photos[photos.length - 1];
      await ctx.reply('⏳ Mengunggah foto...');

      const localPath = await downloadTelegramPhoto(ctx.telegram, largest.file_id);
      if (!localPath) {
        return ctx.reply('❌ Gagal mengunduh foto. Coba lagi atau gunakan foto default.');
      }

      session.data.image = localPath;
      if (session.type === 'product') {
        session.data.thumb = localPath;
        return showProductCategorySelector(ctx);
      } else {
        return showAnimalCategorySelector(ctx);
      }
    }

    // Unsolicited photo
    await ctx.reply(
      `📸 Foto diterima! Pilih menu yang diinginkan:`,
      Markup.inlineKeyboard([
        [Markup.button.callback('🐾 Tambah Hewan Baru', 'menu_add_animal')],
        [Markup.button.callback('🪵 Tambah Produk Baru', 'menu_add_product')],
        [Markup.button.callback('⬅️ Menu Utama', 'menu_main')]
      ])
    );
  });

  // Text Message Receiver Handler (For any custom typed inputs)
  bot.on('text', async (ctx) => {
    const userId = ctx.from.id;
    const text = ctx.message.text.trim();
    const session = userSessions[userId];

    if (!session) {
      return ctx.reply('Pilih menu di bawah atau ketik /menu:', getMainMenu(userId));
    }

    // If in price keypad step and user typed a number
    if (session.step === 'price_keypad') {
      const cleaned = text.replace(/[^0-9]/g, '');
      if (cleaned) {
        session.data.priceAmount = parseInt(cleaned, 10);
        await ctx.reply(`Harga diset ke ${formatRupiah(session.data.priceAmount)}!`);
        return showPriceKeypad(ctx);
      }
    }

    // Custom Category Input
    if (session.step === 'custom_category') {
      session.data.category = text;
      session.data.latin = 'Exotic Pet';
      session.data.priceAmount = 500000;
      session.data.presetKey = text;
      const preset = {
        category: text,
        names: [`${text} Baby`, `${text} Jinak Total`, `${text} Rawatan`]
      };
      session.data.customPreset = preset;
      showAnimalNameSelector(ctx, preset);
      return;
    }

    // Custom Animal Name Input
    if (session.step === 'custom_name') {
      session.data.name = text;
      session.data.id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `animal-${Date.now()}`;
      showAnimalAgeSelector(ctx);
      return;
    }

    // Custom Animal Age Input
    if (session.step === 'custom_age') {
      session.data.age = text;
      showPriceKeypad(ctx);
      return;
    }

    // Custom Animal Character Input
    if (session.step === 'custom_character') {
      session.data.character = text;
      finalizeAnimal(ctx);
      return;
    }

    // Custom Product Category Input
    if (session.step === 'custom_prod_category') {
      session.data.category = text;
      session.data.priceAmount = 50000;
      session.data.presetKey = text;
      const preset = {
        category: text,
        names: [`${text} Premium`, `${text} Standar`]
      };
      session.data.customProdPreset = preset;
      showProductNameSelector(ctx, preset);
      return;
    }

    // Custom Product Name Input
    if (session.step === 'custom_prod_name') {
      session.data.title = text;
      session.data.id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `prod-${Date.now()}`;
      showPriceKeypad(ctx);
      return;
    }
  });

  // Quick Caption Handlers
  async function handleQuickAddProduct(ctx) {
    const photos = ctx.message.photo;
    let imagePath = 'assets/images/wood_pellets_bag.jpg';
    if (photos && photos.length > 0) {
      await ctx.reply('⏳ Mengunggah foto produk...');
      const downloaded = await downloadTelegramPhoto(ctx.telegram, photos[photos.length - 1].file_id);
      if (downloaded) imagePath = downloaded;
    }

    const lines = ctx.message.caption.split('\n');
    let title = 'Wood Pellets Premium';
    let price = 'Rp 35.000';
    let category = 'Alas Kandang';

    lines.forEach(line => {
      const lower = line.toLowerCase();
      if (lower.startsWith('nama:')) title = line.substring(5).trim();
      else if (lower.startsWith('harga:')) price = formatRupiah(line.substring(6).trim().replace(/[^0-9]/g, ''));
      else if (lower.startsWith('kategori:')) category = line.substring(9).trim();
    });

    const products = readJSON(PRODUCTS_FILE, []);
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `prod-${Date.now()}`;
    const newProd = {
      id,
      title,
      category,
      price,
      status: 'Tersedia',
      image: imagePath,
      thumb: imagePath,
      badge: 'Terlaris',
      highlight: `${title} kualitas premium terjamin untuk hewan kesayangan Anda.`,
      description: `${title} diproduksi khusus untuk kenyamanan dan kebersihan kandang hewan eksotis.`,
      suitableFor: 'Musang, Berang-berang, Kelinci, Hamster & Hewan Eksotis lainnya',
      specs: [
        { label: 'Kategori', val: category },
        { label: 'Standar Kualitas', val: 'Premium Selected Grade' }
      ]
    };

    products.unshift(newProd);
    writeJSON(PRODUCTS_FILE, products);
    syncToGoogleSheet('ADD_PRODUCT', newProd);

    await ctx.reply(
      `✅ *PRODUK DITAMBAHKAN VIA QUICK CAPTION!*\n\n` +
      `📦 *${title}*\n💰 *${price}*\n🏷️ ${category}\n\n` +
      `_Telah tayang di katalog web!_`,
      { parse_mode: 'Markdown', ...getMainMenu(ctx.from.id) }
    );
  }

  async function handleQuickAddAnimal(ctx) {
    const photos = ctx.message.photo;
    let imagePath = 'assets/images/hero_musang.jpg';
    if (photos && photos.length > 0) {
      await ctx.reply('⏳ Mengunggah foto hewan...');
      const downloaded = await downloadTelegramPhoto(ctx.telegram, photos[photos.length - 1].file_id);
      if (downloaded) imagePath = downloaded;
    }

    const lines = ctx.message.caption.split('\n');
    let name = 'Musang Pandan Baby';
    let category = 'Musang';
    let price = 'Rp 650.000';
    let age = '2.5 Bulan';
    let character = 'Jinak total, manja, sehat';

    lines.forEach(line => {
      const lower = line.toLowerCase();
      if (lower.startsWith('nama:')) name = line.substring(5).trim();
      else if (lower.startsWith('kategori:')) category = line.substring(9).trim();
      else if (lower.startsWith('harga:')) price = formatRupiah(line.substring(6).trim().replace(/[^0-9]/g, ''));
      else if (lower.startsWith('usia:')) age = line.substring(5).trim();
      else if (lower.startsWith('karakter:')) character = line.substring(9).trim();
    });

    const animals = readJSON(ANIMALS_FILE, []);
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `animal-${Date.now()}`;
    const newAnimal = {
      id,
      name,
      latin: category.toLowerCase().includes('musang') ? 'Paradoxurus hermaphroditus' :
             category.toLowerCase().includes('otter') ? 'Aonyx cinereus' : 'Exotic Pet',
      category,
      price,
      status: 'Tersedia',
      image: imagePath,
      age,
      character,
      diet: 'Buah segar matang, protein ayam rebus & suplemen kalsium',
      health: 'Sehat prima, aktif, bebas parasit, nafsu makan baik',
      description: `${name} hasil rawatan telaten di studio Bayoung Exopet Pakisaji Malang. Karakter ${character}.`,
      requirements: 'Kandang luas bersih, alas wood pellets berkualitas, serta komitmen perawatan rutin.'
    };

    animals.unshift(newAnimal);
    writeJSON(ANIMALS_FILE, animals);
    syncToGoogleSheet('ADD_ANIMAL', newAnimal);

    await ctx.reply(
      `✅ *HEWAN ADOPSI DITAMBAHKAN VIA QUICK CAPTION!*\n\n` +
      `🐾 *${name}*\n🏷️ ${category} • Usia: ${age}\n💰 Biaya Adopsi: *${price}*\n\n` +
      `_Telah tayang di katalog adopsi web!_`,
      { parse_mode: 'Markdown', ...getMainMenu(ctx.from.id) }
    );
  }

  // Global Error Handler
  bot.catch((err, ctx) => {
    console.error(`Bot error for ${ctx?.updateType}:`, err);
    try {
      ctx.reply('⚠️ Terjadi kendala saat memproses permintaan. Silakan ketik /start untuk kembali ke menu utama.');
    } catch (e) {}
  });

  // Graceful Launch
  bot.launch().then(() => {
    console.log('🤖 Telegram CMS Bot Bayoung Exopet is active and listening for messages!');
  }).catch(err => {
    console.error('Failed to launch Telegram Bot:', err);
  });

  return bot;
}

module.exports = {
  initBot,
  readJSON,
  writeJSON,
  getAdminsConfig,
  addAdmin,
  removeAdmin
};
