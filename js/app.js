/**
 * BAYOUNG EXOPET - DIGITAL STOREFRONT & PORTFOLIO
 * Interactive App Logic, Catalog Data, WhatsApp Lead Generation
 */

// Official Business & Lead Generation Details
const BAYOUNG_CONFIG = {
  brandName: "Bayoung Exopet",
  owner: "Abbiyu Nafis Alwan",
  phone: "081252517813",
  whatsappNumber: "6281252517813",
  address: "WJHG+2PQ, Jl. Raya Segenggeng, Wonokerso, Kec. Pakisaji, Kabupaten Malang, Jawa Timur 65162",
  googleMapsUrl: "https://maps.google.com/?q=Jl.+Raya+Segenggeng,+Wonokerso,+Kec.+Pakisaji,+Kabupaten+Malang,+Jawa+Timur+65162",
  instagramUrl: "https://www.instagram.com/bayoung.exopet?stkn=MTFyeWxieWpqbjZjOA==",
  ownerIgUrl: "https://www.instagram.com/abyy.nfs?stkn=dnh1dDZtcWh6bGZh",
  tiktokUrl: "https://www.tiktok.com/@bayoungexopet?_r=1&_t=ZS-99meC0q93Ga",
  facebookUrl: "https://www.facebook.com/share/19KmGNmRGB/"
};

// Helper for Indonesian Status & Badge Mapping (KBBI compliant)
function formatStatus(status) {
  if (!status) return 'Tersedia';
  const s = String(status).toLowerCase();
  if (s === 'available' || s === 'ready' || s === 'tersedia') return 'Tersedia';
  if (s === 'sold' || s === 'sold out' || s === 'adopted' || s === 'teradopsi' || s === 'habis') return 'Sudah Teradopsi';
  if (s === 'booked' || s === 'dipesan') return 'Sudah Dipesan';
  return status;
}

function formatBadge(badge) {
  if (!badge) return 'Pilihan';
  const b = String(badge).toLowerCase();
  if (b.includes('best seller') || b.includes('terlaris')) return 'Terlaris';
  if (b.includes('ready') || b.includes('tersedia')) return 'Tersedia';
  if (b.includes('new item') || b.includes('baru')) return 'Produk Baru';
  if (b.includes('selected nutrition')) return 'Nutrisi Pilihan';
  if (b.includes('eco-friendly')) return 'Ramah Lingkungan';
  if (b.includes('exclusive purple')) return 'Koleksi Eksklusif';
  return badge;
}

function formatCategoryLabel(cat) {
  if (!cat) return 'Umum';
  const c = String(cat).trim().toLowerCase();
  if (c.includes('bedding') || c.includes('litter') || c.includes('alas')) return 'Alas Kandang';
  if (c.includes('supplements') || c.includes('diet') || c.includes('food') || c.includes('pakan') || c.includes('nutrisi')) return 'Pakan & Nutrisi';
  if (c.includes('housing') || c.includes('enclosure') || c.includes('furniture') || c.includes('kandang')) return 'Kandang & Habitat';
  if (c.includes('bowls') || c.includes('handling') || c.includes('accessories') || c.includes('aksesoris')) return 'Aksesoris Kandang';
  if (c.includes('musang')) return 'Musang';
  if (c.includes('otter') || c.includes('berang')) return 'Berang-berang';
  if (c.includes('hamster') || c.includes('rodent')) return 'Hamster';
  if (c.includes('rabbit') || c.includes('kelinci')) return 'Kelinci';
  if (c.includes('other') || c.includes('lainnya')) return 'Lainnya';
  return cat;
}

const WHATSAPP_SVG_ICON = `<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>`;

// Animals Data
let ANIMALS_DATA = [
  {
    id: "musang-pandan",
    name: "Musang Pandan",
    latin: "Paradoxurus hermaphroditus",
    category: "Musang",
    status: "Tersedia",
    image: "assets/images/hero_musang.jpg",
    age: "3.5 Bulan",
    character: "Jinak total, manja, suka digendong di pundak, bonding kuat",
    diet: "Pisang kepok matang, pepaya, bubur buah, protein ayam rebus",
    health: "Sehat prima, bebas kutu & jamur, kuku tumpul terawat, aktif",
    description: "Musang Pandan anakan hasil rawatan telaten sejak kecil dengan aroma pandan khas alami. Karakter sangat bersahabat, sudah terbiasa interaksi tangan manusia (hand-feed), cocok bagi Anda yang mencari sahabat eksotis berkarakter ceria.",
    requirements: "Kandang minimal 60x40x50 cm, alas pelet kayu berkualitas, serta komitmen waktu bermain minimal 30 menit per hari."
  },
  {
    id: "asian-otter",
    name: "Berang-berang Cakar Kecil",
    latin: "Aonyx cinereus",
    category: "Berang-berang",
    status: "Tersedia",
    image: "assets/images/otter.jpg",
    age: "4 Bulan",
    character: "Sangat interaktif, cerdas, vokal, menyukai aktivitas bermain air",
    diet: "Ikan air tawar segar, udang, pakan khusus carnivore & suplemen kalsium",
    health: "Bulu mengkilap kedap air, gigi dan mata bersih, aktif berenang",
    description: "Berang-berang cakar kecil Asia anakan sehat dengan energi ceria. Selalu menyapa dengan suara khas yang menggemaskan saat diajak bermain dan sangat responsif terhadap pemiliknya.",
    requirements: "Wajib memiliki bak/area air bersih untuk mandi berkala, pakan segar teratur, dan ruangan aman tanpa celah sempit."
  },
  {
    id: "hamster-syrian",
    name: "Hamster Syrian",
    latin: "Mesocricetus auratus",
    category: "Hamster",
    status: "Tersedia",
    image: "assets/images/hamster.jpg",
    age: "2 Bulan",
    character: "Tenang, santai, mudah dipegang, pipi menggemaskan",
    diet: "Campuran biji premium, pelet hamster tinggi serat, kudapan sayuran kering",
    health: "Bulu tebal halus, gigi rapi tidak overgrow, lincah di roda putar",
    description: "Hamster Syrian varian bulu panjang dan pendek dengan bulu selembut sutra. Memiliki temperamen yang tenang sehingga sangat bersahabat untuk pemula maupun anak-anak dengan pengawasan orang tua.",
    requirements: "Kandang luas satu ekor satu kandang (soliter), roda putar diameter minimal 21 cm, dan alas pelet kayu atau serbuk kertas."
  },
  {
    id: "netherland-dwarf",
    name: "Kelinci Netherland Dwarf",
    latin: "Oryctolagus cuniculus",
    category: "Kelinci",
    status: "Tersedia",
    image: "assets/images/rabbit.jpg",
    age: "2.5 Bulan",
    character: "Imut, lincah, telinga pendek tegak khas ras murni",
    diet: "Rumput timothy segar melimpah, pelet kelinci serat tinggi, air minum bersih",
    health: "Telinga dan mata bersih, kotoran bulat normal, bulu lebat",
    description: "Kelinci kerdil Netherland Dwarf asli dengan ukuran mungil dan mata bulat yang memikat. Ras ini dikenal aktif, lucu saat melompat gembira, dan cocok untuk pemeliharaan di dalam ruangan.",
    requirements: "Kotak kotoran dengan alas pelet kayu penyerap cairan, rak rumput terisi penuh sepanjang hari, serta ruang eksplorasi aman kabel."
  },
  {
    id: "hedgehog-pygmy",
    name: "Landak Mini Afrika",
    latin: "Atelerix albiventris",
    category: "Lainnya",
    status: "Tersedia",
    image: "assets/images/hedgehog.jpg",
    age: "3 Bulan",
    character: "Lucu menggulung diri, aktif di malam hari, tidak berisik",
    diet: "Pakan khusus serangga super premium, ulat hongkong, jangkrik bersih",
    health: "Duri bersih rapi, kulit sehat tanpa kerak/kutu, mata jernih",
    description: "Landak mini Afrika warna Salt & Pepper / Cinnicot dengan wajah mungil yang menggemaskan. Peliharaan unik bagi Anda yang menginginkan hewan eksotis berukuran kompak dan mandiri.",
    requirements: "Kandang tertutup ventilasi baik, roda putar tanpa celah 28 cm, dan suhu ruangan hangat yang stabil."
  }
];

// Products Data
let PRODUCTS_DATA = [
  {
    id: "wood-pellets",
    title: "Pelet Kayu (Wood Pellets) Premium",
    category: "Alas Kandang",
    image: "assets/images/wood_pellets_bag.jpg",
    thumb: "assets/images/wood_pellets_pile.jpg",
    badge: "Terlaris",
    highlight: "Alas Kandang Kayu Pinus Alami 100%",
    specs: [
      { label: "Bahan", val: "100% Serat Kayu Pinus Alami Murni" },
      { label: "Daya Serap", val: "Hingga 3x lipat berat pelet" },
      { label: "Kontrol Bau", val: "Ekstrak resin pinus alami pengikat amonia" },
      { label: "Debu", val: "Sangat Rendah (Bebas Debu 99%)" },
      { label: "Kemasan", val: "Tersedia 1 kg, 5 kg, 10 kg, sak 20 kg" }
    ],
    description: "Pelet Kayu Bayoung diproduksi khusus untuk kenyamanan dan kesehatan sistem pernapasan hewan eksotis Anda. Butiran pelet padat yang saat terkena cairan akan langsung menyerap seketika dan terurai menjadi serbuk tanpa meninggalkan genangan basah ataupun aroma amonia yang menyengat.",
    suitableFor: "Musang, Berang-berang, Kelinci, Hamster, Sugar Glider, Burung & Kucing"
  },
  {
    id: "food-nutrition",
    title: "Pakan & Nutrisi Lengkap",
    category: "Pakan & Nutrisi",
    image: "assets/images/food_nutrition.jpg",
    thumb: "assets/images/food_nutrition.jpg",
    badge: "Nutrisi Pilihan",
    highlight: "Pakan Seimbang & Suplemen Multivitamin",
    specs: [
      { label: "Kandungan", val: "Biji-bijian mutu tinggi, buah kering, ekstrak protein & kalsium" },
      { label: "Standar", val: "Bebas bahan pengawet kimia berbahaya" },
      { label: "Fungsi", val: "Menjaga kilau bulu, daya tahan tubuh, dan kepadatan tulang" },
      { label: "Penyajian", val: "Siap saji setiap hari sesuai takaran porsi" }
    ],
    description: "Formula pakan bernutrisi lengkap yang diracik khusus untuk memenuhi kebutuhan biologis hewan eksotis. Membantu hewan peliharaan Anda tumbuh sehat, bulu tetap lebat bersinar, serta memiliki daya tahan tubuh yang prima.",
    suitableFor: "Omnivora, Herbivora Eksotis, Musang, Pengerat & Kelinci"
  },
  {
    id: "habitat-enclosure",
    title: "Kandang & Tempat Tinggal",
    category: "Kandang & Habitat",
    image: "assets/images/habitat_enclosure.jpg",
    thumb: "assets/images/habitat_enclosure.jpg",
    badge: "Ramah Lingkungan",
    highlight: "Rumah Kayu Alami, Ayunan & Aksesoris Kandang",
    specs: [
      { label: "Bahan", val: "Kayu solid alami pilihan, tanpa vernis kimia" },
      { label: "Desain", val: "Pintu lengkung artistik, sirkulasi udara optimal" },
      { label: "Ketahanan", val: "Kokoh, tahan gigitan wajar, mudah dibersihkan" },
      { label: "Pilihan", val: "Tersedia aneka ukuran mini hingga sedang" }
    ],
    description: "Tempat berlindung dan istirahat yang menyerupai habitat alami di hutan. Memberikan rasa aman sehingga satwa eksotis Anda bebas dari stres dan dapat beristirahat dengan nyaman.",
    suitableFor: "Musang anakan, Berang-berang, Hamster Syrian, Kelinci kerdil & Landak mini"
  },
  {
    id: "accessories",
    title: "Aksesoris & Mangkuk Pakan",
    category: "Aksesoris",
    image: "assets/images/pet_accessories.jpg",
    thumb: "assets/images/pet_accessories.jpg",
    badge: "Koleksi Eksklusif",
    highlight: "Mangkuk Keramik Ungu, Botol Minum Dot & Tali Tuntun",
    specs: [
      { label: "Bahan", val: "Keramik tebal mengilap tahan gores & ramah makanan" },
      { label: "Desain", val: "Khas ungu Bayoung dengan ukiran lambang paw" },
      { label: "Fitur", val: "Bobot mantap tidak gampang terbalik atau tersenggol" },
      { label: "Perawatan", val: "Sangat mudah dicuci dan higienis" }
    ],
    description: "Aksesoris pelengkap premium bertema ungu ikonik Bayoung. Menjaga area makan hewan tetap bersih, rapi, dan sedap dipandang di dalam kandang kesayangan Anda.",
    suitableFor: "Semua jenis satwa eksotis peliharaan"
  }
];

// Guides Data
const GUIDES_DATA = [
  {
    id: "guide-musang",
    title: "Panduan Lengkap Memelihara Musang Pandan untuk Pemula",
    summary: "Musang Pandan (Asian Palm Civet) adalah salah satu hewan eksotis paling populer di Indonesia karena karakternya yang jinak, interaktif, dan aroma pandan yang khas.",
    sections: [
      {
        heading: "1. Karakter & Kebiasaan Alami",
        text: "Musang pandan pada dasarnya bersifat krepuskular dan nokturnal, namun anakan yang dirawat sejak bayi dapat menyesuaikan jam aktifnya dengan pemiliknya. Musang yang dirawat dengan penuh kasih sayang akan sangat bonding, suka memanjat ke pundak, dan menyapa ramah."
      },
      {
        heading: "2. Makanan Harian & Pola Diet",
        text: "Musang adalah hewan omnivora pemakan buah. Menu harian terbaik meliputi pisang kepok matang, pepaya, mangga manis, buah naga, diselingi protein berkualitas seperti dada ayam rebus tanpa garam atau telur rebus 2-3 kali seminggu."
      },
      {
        heading: "3. Kebersihan Kandang & Pemilihan Bedding",
        text: "Gunakan alas kandang wood pellets di nampan bawah kandang. Wood pellets mampu mengunci bau amonia urin seketika sehingga ruangan Anda tetap harum dan bersih. Ganti pelet yang sudah terurai setiap 2-3 hari sekali."
      },
      {
        heading: "4. Kunci Sukses Bonding (Menjinakkan)",
        text: "Berikan makanan langsung dari telapak tangan Anda (hand-feeding), letakkan kaos bekas Anda di dekat tempat tidurnya agar ia akrab dengan aroma tubuh Anda, dan luangkan waktu bermain di ruangan tertutup setiap malam."
      }
    ]
  },
  {
    id: "guide-wood-pellets",
    title: "Mengapa Wood Pellets Pilihan Terbaik untuk Alas Kandang Hewan Eksotis?",
    summary: "Memilih alas kandang (bedding) yang tepat adalah investasi kesehatan terbesar bagi hewan eksotis peliharaan Anda.",
    sections: [
      {
        heading: "1. Daya Serap Luar Biasa",
        text: "Wood pellets terbuat dari serat kayu murni yang dipadatkan dengan tekanan tinggi. Begitu terkena cairan, pori-pori pelet menyerap urin dengan cepat sehingga tidak meninggalkan genangan yang bisa mengotori kaki hewan."
      },
      {
        heading: "2. Perlindungan Saluran Pernapasan (Dust-Free)",
        text: "Serbuk gergaji kasar tradisional sering kali mengandung debu halus yang dapat memicu bersin, alergi, dan infeksi saluran pernapasan atas pada hewan kecil. Wood pellets Bayoung memiliki tingkat debu minimal sehingga jauh lebih aman."
      },
      {
        heading: "3. Netralisir Bau Alami Tanpa Kimia",
        text: "Resin alami kayu pinus secara alami mengikat molekul amonia, menghilangkan bau pesing tanpa butuh parfum buatan yang dapat mengganggu penciuman sensitif hewan eksotis."
      }
    ]
  },
  {
    id: "guide-otter",
    title: "Tips & Komitmen Merawat Asian Small-Clawed Otter",
    summary: "Otter adalah hewan yang cerdas dan menggemaskan, tetapi membutuhkan dedikasi dan komitmen tinggi dari sang pemelihara.",
    sections: [
      {
        heading: "1. Kebutuhan Area Bermain Air",
        text: "Otter adalah hewan semi-akuatik. Mereka membutuhkan akses berenang atau bermain di bak air bersih secara rutin untuk menjaga kesehatan bulu kedap airnya dan menjaga kebugaran otot."
      },
      {
        heading: "2. Menu Protein Tinggi",
        text: "Makanan utama otter harus terdiri dari ikan segar (ikan lele, gurami, nila), udang, atau pakan khusus yang tinggi protein dan taurin untuk menunjang metabolisme tubuhnya yang cepat."
      },
      {
        heading: "3. Komitmen Interaksi Sosial",
        text: "Otter hidup berkelompok di alam liar. Jika dipelihara sendiri, pemilik harus menggantikan peran kawanan tersebut dengan sering mengajak bermain dan tidak membiarkannya terisolasi sendirian terlalu lama."
      }
    ]
  }
];

// Helper: Open WhatsApp Lead URL with Custom Message
function openWhatsAppInquiry(message) {
  const encodedMsg = encodeURIComponent(message);
  const waUrl = `https://wa.me/${BAYOUNG_CONFIG.whatsappNumber}?text=${encodedMsg}`;
  window.open(waUrl, "_blank", "noopener,noreferrer");
}

// Modal Management
const modalOverlay = document.getElementById("modal-overlay");
const modalDialog = document.getElementById("modal-dialog");
const modalBody = document.getElementById("modal-body");

function closeModal() {
  if (modalOverlay) {
    modalOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }
}

function openModalWithContent(htmlContent) {
  if (modalBody && modalOverlay) {
    modalBody.innerHTML = htmlContent;
    modalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

// Show Animal Detail Modal
function showAnimalDetail(animalId) {
  const animal = ANIMALS_DATA.find(a => a.id === animalId) || ANIMALS_DATA[0];
  const isAvailable = !animal.status || animal.status.toLowerCase() === 'available' || animal.status.toLowerCase() === 'tersedia';
  
  const content = `
    <div class="modal-header-hero">
      <img src="${animal.image}" alt="${animal.name}" onerror="this.src='assets/images/hero_musang.jpg'">
    </div>
    <div class="modal-body">
      <div class="modal-badge-row">
        <span class="card-category-badge">${formatCategoryLabel(animal.category)}</span>
        <div class="card-status-row ${isAvailable ? '' : 'status-adopted-row'}" style="margin-bottom: 0;">
          <span class="status-dot ${isAvailable ? '' : 'status-adopted'}"></span>
          <span>${formatStatus(animal.status)}</span>
        </div>
        ${animal.price ? `<span class="card-price-tag" style="margin-left: auto; font-size: 1.05rem;">${animal.price}</span>` : ''}
      </div>

      <h2 class="modal-title">${animal.name}</h2>
      <p class="modal-subtitle"><em>${animal.latin || 'Satwa Eksotis'}</em> • Usia: ${animal.age || '-'}</p>

      <div class="modal-spec-grid">
        <div class="spec-box">
          <div class="spec-label">Karakter & Sifat</div>
          <div class="spec-value">${animal.character || '-'}</div>
        </div>
        <div class="spec-box">
          <div class="spec-label">Pola Pakan / Diet</div>
          <div class="spec-value">${animal.diet || 'Pakan segar berkualitas'}</div>
        </div>
        <div class="spec-box">
          <div class="spec-label">Kondisi Kesehatan</div>
          <div class="spec-value">${animal.health || 'Sehat prima & terawat'}</div>
        </div>
        <div class="spec-box">
          <div class="spec-label">Kebutuhan Kandang</div>
          <div class="spec-value">${animal.requirements || 'Kandang bersih & nyaman'}</div>
        </div>
      </div>

      <div class="modal-description">
        <strong>Tentang Satwa Ini:</strong><br>
        <p style="margin-top: 6px; line-height: 1.6;">${animal.description}</p>
      </div>

      <div class="modal-cta-box">
        <h4 class="modal-cta-title">Tertarik Mengadopsi Satwa Ini?</h4>
        <p class="modal-cta-desc">Hubungi kami via WhatsApp untuk konfirmasi ketersediaan, konsultasi adopsi, dan jadwal temu di studio Malang.</p>
        <button class="btn-whatsapp-modal" onclick="inquireAnimal('${animal.name}')">
          ${WHATSAPP_SVG_ICON}
          Tanya Adopsi via WhatsApp
        </button>
      </div>
    </div>
  `;

  openModalWithContent(content);
}

// Show Product Detail Modal
function showProductDetail(productId) {
  const product = PRODUCTS_DATA.find(p => p.id === productId) || PRODUCTS_DATA[0];
  
  const specs = product.specs || [];
  const specsHtml = specs.map(s => `
    <div class="spec-box">
      <div class="spec-label">${s.label}</div>
      <div class="spec-value">${s.val}</div>
    </div>
  `).join('');

  const content = `
    <div class="modal-header-hero">
      <img src="${product.image || product.thumb}" alt="${product.title}" onerror="this.src='assets/images/wood_pellets_bag.jpg'">
    </div>
    <div class="modal-body">
      <div class="modal-badge-row">
        <span class="card-category-badge">${formatCategoryLabel(product.category)}</span>
        <span class="card-category-badge" style="background:#ecfdf5; color:#059669;">${formatBadge(product.badge || 'Tersedia')}</span>
        ${product.price ? `<span class="card-price-tag" style="margin-left: auto; font-size: 1.05rem;">${product.price}</span>` : ''}
      </div>

      <h2 class="modal-title">${product.title}</h2>
      ${product.highlight ? `<p class="modal-subtitle">${product.highlight}</p>` : ''}

      ${specsHtml ? `<div class="modal-spec-grid">${specsHtml}</div>` : ''}

      <div class="modal-description">
        <strong>Deskripsi Produk:</strong><br>
        <p style="margin-top: 6px; line-height: 1.6;">${product.description || 'Produk perawatan satwa berkualitas dari Bayoung Exopet.'}</p>
        ${product.suitableFor ? `<div style="margin-top: 12px; font-size: 0.9rem; color: var(--text-muted);"><strong>Cocok untuk:</strong> ${product.suitableFor}</div>` : ''}
      </div>

      <div class="modal-cta-box">
        <h4 class="modal-cta-title">Pesan atau Konsultasi Produk</h4>
        <p class="modal-cta-desc">Pengiriman dari studio Bayoung Exopet Pakisaji, Malang ke seluruh Indonesia via kargo / kurir instan.</p>
        <button class="btn-whatsapp-modal" onclick="inquireProduct('${product.title}')">
          ${WHATSAPP_SVG_ICON}
          Pesan via WhatsApp
        </button>
      </div>
    </div>
  `;

  openModalWithContent(content);
}

// Show Educational Guides Modal
function showGuidesModal(guideId = "guide-musang") {
  const guide = GUIDES_DATA.find(g => g.id === guideId) || GUIDES_DATA[0];

  const sectionsHtml = guide.sections.map(s => `
    <div style="margin-bottom: 20px;">
      <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--primary); margin-bottom: 6px;">${s.heading}</h3>
      <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6;">${s.text}</p>
    </div>
  `).join('');

  const content = `
    <div class="modal-body" style="padding-top: 36px;">
      <div class="modal-badge-row">
        <span class="card-category-badge">✦ Panduan Satwa Eksotis</span>
      </div>
      <h2 class="modal-title" style="margin-bottom: 12px;">${guide.title}</h2>
      <p style="font-size: 1rem; color: var(--text-muted); margin-bottom: 24px; font-style: italic; background: #faf8ff; padding: 12px 16px; border-radius: 12px; border-left: 4px solid var(--primary);">
        "${guide.summary}"
      </p>

      <div style="margin-bottom: 24px;">
        ${sectionsHtml}
      </div>

      <div class="modal-cta-box">
        <h4 class="modal-cta-title">Punya Pertanyaan Seputar Perawatan?</h4>
        <p class="modal-cta-desc">Konsultasikan kebutuhan kandang, makanan, dan adaptasi hewan Anda langsung bersama tim Bayoung Exopet.</p>
        <button class="btn-whatsapp-modal" onclick="inquireConsultation()">
          ${WHATSAPP_SVG_ICON}
          Konsultasi Perawatan via WhatsApp
        </button>
      </div>
    </div>
  `;

  openModalWithContent(content);
}

// Show Search Modal
function showSearchModal() {
  const content = `
    <div class="modal-body" style="padding-top: 36px;">
      <h2 class="modal-title" style="margin-bottom: 8px;">Cari di Bayoung Exopet</h2>
      <p class="modal-subtitle">Temukan hewan adopsi, wood pellets, dan panduan perawatan.</p>
      
      <div style="margin-bottom: 20px;">
        <input type="text" id="modal-search-input" placeholder="Ketik jenis hewan atau produk (misal: Musang, Otter, Pellet)..." 
               style="width: 100%; padding: 14px 18px; border-radius: var(--radius-pill); border: 2px solid var(--primary-border); font-family: inherit; font-size: 1rem; outline: none;"
               oninput="handleLiveSearch(this.value)">
      </div>

      <div id="modal-search-results" style="display: flex; flex-direction: column; gap: 10px; max-height: 320px; overflow-y: auto;">
        <div style="text-align: center; color: var(--text-light); padding: 20px;">Ketik kata kunci untuk mulai mencari...</div>
      </div>
    </div>
  `;

  openModalWithContent(content);
  setTimeout(() => {
    const input = document.getElementById("modal-search-input");
    if (input) input.focus();
  }, 100);
}

// Live search inside modal
function handleLiveSearch(query) {
  const resultsContainer = document.getElementById("modal-search-results");
  if (!resultsContainer) return;

  const q = query.toLowerCase().trim();
  if (!q) {
    resultsContainer.innerHTML = `<div style="text-align: center; color: var(--text-light); padding: 20px;">Ketik kata kunci untuk mulai mencari...</div>`;
    return;
  }

  const matchedAnimals = ANIMALS_DATA.filter(a => a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q));
  const matchedProducts = PRODUCTS_DATA.filter(p => p.title.toLowerCase().includes(q) || p.highlight.toLowerCase().includes(q));

  if (matchedAnimals.length === 0 && matchedProducts.length === 0) {
    resultsContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px;">Tidak ditemukan hasil untuk "${query}". Silakan hubungi WhatsApp kami untuk ketersediaan khusus.</div>`;
    return;
  }

  let html = '';
  matchedAnimals.forEach(a => {
    html += `
      <div onclick="showAnimalDetail('${a.id}')" style="display: flex; align-items: center; gap: 14px; padding: 10px 14px; background: #fbf9ff; border: 1px solid #efe8f8; border-radius: 12px; cursor: pointer;">
        <img src="${a.image}" style="width: 48px; height: 48px; border-radius: 10px; object-fit: cover;">
        <div style="flex: 1;">
          <div style="font-weight: 700; color: var(--primary); font-size: 0.95rem;">${a.name}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Hewan Adopsi • ${a.category} • ${a.status}</div>
        </div>
        <span style="font-size: 0.82rem; font-weight: 700; color: var(--primary);">Lihat →</span>
      </div>
    `;
  });

  matchedProducts.forEach(p => {
    html += `
      <div onclick="showProductDetail('${p.id}')" style="display: flex; align-items: center; gap: 14px; padding: 10px 14px; background: #fbf9ff; border: 1px solid #efe8f8; border-radius: 12px; cursor: pointer;">
        <img src="${p.thumb}" style="width: 48px; height: 48px; border-radius: 10px; object-fit: cover;">
        <div style="flex: 1;">
          <div style="font-weight: 700; color: var(--text-main); font-size: 0.95rem;">${p.title}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Katalog Produk • ${p.highlight}</div>
        </div>
        <span style="font-size: 0.82rem; font-weight: 700; color: var(--primary);">Lihat →</span>
      </div>
    `;
  });

  resultsContainer.innerHTML = html;
}

// Show Location & Studio Modal
function showLocationModal() {
  const content = `
    <div class="modal-body" style="padding-top: 36px; text-align: center;">
      <div style="width: 140px; height: 140px; margin: 0 auto 16px; background: #faf8ff; border: 2px solid var(--primary-border); border-radius: 28px; padding: 10px; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-md);">
        <img src="assets/images/bayoung_logo_transparent.png" alt="Bayoung Exopet Logo" style="width: 100%; height: 100%; object-fit: contain;">
      </div>
      <div class="modal-badge-row" style="justify-content: center;">
        <span class="card-category-badge">📍 Studio Bayoung Exopet</span>
      </div>
      <h2 class="modal-title" style="margin-bottom: 8px;">Kunjungi Studio Kami</h2>
      <p class="modal-subtitle">Transaksi & serah terima hewan adopsi dilakukan secara tatap muka / offline.</p>
      
      <div class="modal-spec-grid" style="margin-bottom: 20px; text-align: left;">
        <div class="spec-box">
          <div class="spec-label">Founder / Owner</div>
          <div class="spec-value">${BAYOUNG_CONFIG.owner}</div>
        </div>
        <div class="spec-box">
          <div class="spec-label">Kontak Resmi</div>
          <div class="spec-value">${BAYOUNG_CONFIG.phone}</div>
        </div>
      </div>

      <div class="modal-description" style="margin-bottom: 20px; text-align: left;">
        <strong>Alamat Lengkap:</strong><br>
        ${BAYOUNG_CONFIG.address}
      </div>

      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <a href="${BAYOUNG_CONFIG.googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="flex: 1;">
          Buka di Google Maps ➔
        </a>
        <button onclick="inquireAppointment()" class="btn-secondary" style="flex: 1;">
          Janji Temu via WhatsApp
        </button>
      </div>
    </div>
  `;

  openModalWithContent(content);
}

// WhatsApp Lead Generation Message Handlers
function inquireAnimal(animalName) {
  const msg = `Halo Bayoung Exopet (${BAYOUNG_CONFIG.owner}), saya melihat website dan tertarik untuk konsultasi adopsi "${animalName}". Boleh info ketersediaan dan persyaratannya? Terima kasih.`;
  openWhatsAppInquiry(msg);
}

function inquireProduct(productName) {
  const msg = `Halo Bayoung Exopet, saya tertarik untuk order / tanya detail produk "${productName}". Mohon info stok dan harga pengiriman. Terima kasih.`;
  openWhatsAppInquiry(msg);
}

function inquireConsultation() {
  const msg = `Halo Bayoung Exopet, saya ingin konsultasi seputar perawatan hewan eksotis / rekomendasi pakan dan kandang. Terima kasih.`;
  openWhatsAppInquiry(msg);
}

function inquireCommunity() {
  const msg = `Halo Bayoung Exopet, saya ingin bergabung dengan WhatsApp Group Komunitas Pecinta Exotic Pet Bayoung. Boleh minta link undangannya? Terima kasih!`;
  openWhatsAppInquiry(msg);
}

function inquireAppointment() {
  const msg = `Halo Mas Abbiyu (${BAYOUNG_CONFIG.brandName}), saya ingin membuat janji temu berkunjung ke studio di Pakisaji Malang untuk melihat hewan adopsi / wood pellets.`;
  openWhatsAppInquiry(msg);
}

// Carousel Navigation for Adoption Cards
let currentCarouselIndex = 0;
function slideAdoptionCarousel(direction) {
  const grid = document.getElementById("adoption-grid");
  if (!grid) return;

  const cardWidth = 280; // approximate width + gap
  if (direction === "next") {
    grid.scrollBy({ left: cardWidth, behavior: "smooth" });
  } else {
    grid.scrollBy({ left: -cardWidth, behavior: "smooth" });
  }
}

// Filter Animals by Category (from "Ragam Satwa" Bar)
function filterCategory(categoryName) {
  showPage('adopsi');
  filterAdoptionCategory(categoryName);
}

// View All Animals Modal
function showAllAnimalsModal() {
  const cardsHtml = ANIMALS_DATA.map(a => {
    const isAvailable = !a.status || a.status.toLowerCase() === 'available' || a.status.toLowerCase() === 'tersedia';
    return `
    <div class="adoption-card" onclick="showAnimalDetail('${a.id}')" style="cursor: pointer;">
      <div class="card-image-wrap">
        <img src="${a.image}" alt="${a.name}" onerror="this.src='assets/images/hero_musang.jpg'">
      </div>
      <div class="card-content">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="card-category-badge" style="margin-bottom: 0;">${a.category}</span>
          ${a.price ? `<span class="card-price-tag">${a.price}</span>` : ''}
        </div>
        <h3 class="card-animal-name">${a.name}</h3>
        <div class="card-status-row ${isAvailable ? '' : 'status-adopted-row'}">
          <span class="status-dot ${isAvailable ? '' : 'status-adopted'}"></span>
          <span>${formatStatus(a.status)}</span>
        </div>
        <span class="card-action-link">Lihat Detail ➔</span>
      </div>
    </div>
  `;
  }).join('');

  const content = `
    <div class="modal-body" style="padding-top: 36px;">
      <div class="modal-badge-row">
        <span class="card-category-badge">✦ Katalog Satwa Eksotis</span>
      </div>
      <h2 class="modal-title" style="margin-bottom: 8px;">Koleksi Satwa Eksotis</h2>
      <p class="modal-subtitle">Semua satwa dirawat secara higienis, sehat, dan dipersiapkan dengan baik untuk keluarga baru.</p>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-top: 20px;">
        ${cardsHtml}
      </div>
    </div>
  `;

  openModalWithContent(content);
}

// View All Products Modal
function showAllProductsModal() {
  const cardsHtml = PRODUCTS_DATA.map(p => `
    <div class="adoption-card" onclick="showProductDetail('${p.id}')" style="cursor: pointer;">
      <div class="card-image-wrap">
        <img src="${p.thumb || p.image}" alt="${p.title}" onerror="this.src='assets/images/wood_pellets_pile.jpg'">
      </div>
      <div class="card-content">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="card-category-badge" style="margin-bottom: 0;">${p.category}</span>
          ${p.price ? `<span class="card-price-tag">${p.price}</span>` : ''}
        </div>
        <h3 class="card-animal-name">${p.title}</h3>
        <p style="font-size: 0.84rem; color: var(--text-muted); margin-bottom: 12px;">${p.highlight || (p.description ? p.description.substring(0, 50) + '...' : '')}</p>
        <span class="card-action-link">Lihat Produk ➔</span>
      </div>
    </div>
  `).join('');

  const content = `
    <div class="modal-body" style="padding-top: 36px;">
      <div class="modal-badge-row">
        <span class="card-category-badge">✦ Produk & Perlengkapan</span>
      </div>
      <h2 class="modal-title" style="margin-bottom: 8px;">Katalog Produk & Perlengkapan</h2>
      <p class="modal-subtitle">Perlengkapan terbaik untuk kebersihan kandang, nutrisi, dan kenyamanan hewan.</p>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-top: 20px;">
        ${cardsHtml}
      </div>
    </div>
  `;

  openModalWithContent(content);
}

// Mobile Menu Toggle
function toggleMobileMenu() {
  const nav = document.getElementById("main-nav");
  if (nav) {
    if (nav.style.display === "flex") {
      nav.style.display = "";
    } else {
      nav.style.display = "flex";
      nav.style.flexDirection = "column";
      nav.style.position = "absolute";
      nav.style.top = "80px";
      nav.style.left = "0";
      nav.style.width = "100%";
      nav.style.background = "#ffffff";
      nav.style.padding = "20px 24px";
      nav.style.boxShadow = "var(--shadow-md)";
      nav.style.borderBottom = "1px solid var(--primary-border)";
    }
  }
}

function closeMobileMenu() {
  const nav = document.getElementById("main-nav");
  if (nav && window.innerWidth <= 840) {
    nav.style.display = "";
  }
}

// Close modal on escape key or clicking backdrop
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

if (modalOverlay) {
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });
}

// FAQ Accordion Toggle
function toggleFaq(button) {
  const item = button.closest('.faq-item');
  if (item) {
    const wasActive = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
    if (!wasActive) {
      item.classList.add('active');
    }
  }
}

// ===================================================================
// DEDICATED PAGE / RUANG ROUTER (SPA HASH ROUTING)
// ===================================================================

const VALID_PAGES = ['beranda', 'ragam-satwa', 'adopsi', 'produk', 'edukasi', 'komunitas', 'tentang-kami'];

function getPageFromHash() {
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase().trim();
  if (VALID_PAGES.includes(hash)) return hash;
  if (hash === 'home' || hash === '') return 'beranda';
  if (hash === 'animals') return 'ragam-satwa';
  if (hash === 'adoption') return 'adopsi';
  if (hash === 'products') return 'produk';
  if (hash === 'learn') return 'edukasi';
  if (hash === 'community') return 'komunitas';
  if (hash === 'about') return 'tentang-kami';
  return 'beranda';
}

function showPage(pageId, updateUrl = true) {
  if (!VALID_PAGES.includes(pageId)) pageId = 'beranda';

  // 1. Hide all pages, show target page
  document.querySelectorAll('.page-view').forEach(p => {
    p.classList.remove('page-active');
  });

  const targetPage = document.getElementById(`page-${pageId}`);
  if (targetPage) {
    targetPage.classList.add('page-active');
  }

  // 2. Update active nav link (Desktop & Mobile)
  document.querySelectorAll('.nav-link').forEach(link => {
    const pageAttr = link.getAttribute('data-page');
    if (pageAttr === pageId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // 3. Update URL hash
  if (updateUrl) {
    history.pushState(null, '', `#/` + pageId);
  }

  // 4. Smooth scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });

  // 5. Close mobile menu
  closeMobileMenu();

  // 6. Refresh grids when visiting specific pages
  if (pageId === 'adopsi') renderAdoptionGrid();
  if (pageId === 'produk') renderFullProductsGrid();

  // 7. Refresh drag-to-scroll buttons on visible page
  setTimeout(refreshAllDragScrolls, 60);
}

window.addEventListener('hashchange', () => {
  const page = getPageFromHash();
  showPage(page, false);
});

// ===================================================================
// DYNAMIC LIVE CATALOG RENDERING & FILTERING
// ===================================================================

let currentAdoptionCategory = 'Semua';
function filterAdoptionCategory(cat) {
  currentAdoptionCategory = cat;
  document.querySelectorAll('.filter-pill-btn[data-animal-cat]').forEach(btn => {
    if (btn.getAttribute('data-animal-cat') === cat) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  renderAdoptionGrid();
}

function renderAdoptionGrid() {
  const grid = document.getElementById("adoption-grid");
  if (!grid || !Array.isArray(ANIMALS_DATA) || ANIMALS_DATA.length === 0) return;

  let filtered = ANIMALS_DATA;
  if (currentAdoptionCategory && currentAdoptionCategory !== 'Semua') {
    filtered = ANIMALS_DATA.filter(a => {
      const cat = (a.category || '').toLowerCase();
      const target = currentAdoptionCategory.toLowerCase();
      if (target === 'lainnya') {
        return !cat.includes('musang') && !cat.includes('otter') && !cat.includes('berang') && !cat.includes('hamster') && !cat.includes('kelinci') && !cat.includes('rabbit');
      }
      return cat.includes(target) || (target === 'berang-berang' && cat.includes('otter'));
    });
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: #faf8ff; border-radius: 20px; border: 1.5px dashed var(--primary-border);">
        <div style="font-size: 2.5rem; margin-bottom: 12px;">🐾</div>
        <h3 style="color: var(--primary); margin-bottom: 8px;">Belum Ada Satwa di Kategori Ini</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem;">Hubungi admin via WhatsApp untuk menanyakan jadwal ketersediaan anakan satwa.</p>
        <button onclick="filterAdoptionCategory('Semua')" class="btn-primary" style="margin-top: 18px; padding: 10px 22px; font-size: 0.88rem;">Lihat Semua Satwa</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(a => {
    const isAvailable = !a.status || a.status.toLowerCase() === 'available' || a.status.toLowerCase() === 'tersedia';
    return `
    <div class="adoption-card">
      <div class="card-image-wrap">
        <img src="${a.image}" alt="${a.name}" onerror="this.src='assets/images/hero_musang.jpg'">
      </div>
      <div class="card-content">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="card-category-badge" style="margin-bottom: 0;">${a.category}</span>
          ${a.price ? `<span class="card-price-tag">${a.price}</span>` : ''}
        </div>
        <h3 class="card-animal-name">${a.name}</h3>
        <div class="card-status-row ${isAvailable ? '' : 'status-adopted-row'}">
          <span class="status-dot ${isAvailable ? '' : 'status-adopted'}"></span>
          <span>${formatStatus(a.status)}</span>
        </div>
        <a href="javascript:void(0)" onclick="showAnimalDetail('${a.id}')" class="card-action-link">
          Lihat Detail ➔
        </a>
      </div>
    </div>
  `;
  }).join('');
}

let currentProductCategory = 'Semua';
function filterProductCategory(cat) {
  currentProductCategory = cat;
  document.querySelectorAll('.filter-pill-btn[data-prod-cat]').forEach(btn => {
    if (btn.getAttribute('data-prod-cat') === cat) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  renderFullProductsGrid();
}

function renderFullProductsGrid() {
  const grid = document.getElementById("products-full-grid");
  if (!grid || !Array.isArray(PRODUCTS_DATA) || PRODUCTS_DATA.length === 0) return;

  let filtered = PRODUCTS_DATA;
  if (currentProductCategory && currentProductCategory !== 'Semua') {
    filtered = PRODUCTS_DATA.filter(p => {
      const cat = (p.category || '').toLowerCase();
      const target = currentProductCategory.toLowerCase();
      if (target.includes('alas')) return cat.includes('alas') || cat.includes('bedding') || cat.includes('litter') || cat.includes('pellet');
      if (target.includes('pakan') || target.includes('nutrisi')) return cat.includes('pakan') || cat.includes('nutrisi') || cat.includes('diet') || cat.includes('supplement') || cat.includes('food');
      if (target.includes('kandang')) return cat.includes('kandang') || cat.includes('housing') || cat.includes('enclosure') || cat.includes('habitat');
      if (target.includes('aksesoris')) return cat.includes('aksesoris') || cat.includes('bowl') || cat.includes('accessories');
      return cat.includes(target);
    });
  }

  grid.innerHTML = filtered.map(p => `
    <div class="product-full-card" onclick="showProductDetail('${p.id}')" style="cursor: pointer;">
      <img src="${p.image || p.thumb}" alt="${p.title}" class="product-full-card-img" onerror="this.src='assets/images/wood_pellets_bag.jpg'">
      <div class="product-full-card-body">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="card-category-badge" style="margin-bottom: 0;">${formatCategoryLabel(p.category)}</span>
          ${p.price ? `<span class="card-price-tag">${p.price}</span>` : ''}
        </div>
        <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--primary); margin-bottom: 6px;">${p.title}</h3>
        <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 16px; flex: 1;">${p.highlight || (p.description ? p.description.substring(0, 70) + '...' : '')}</p>
        <button class="btn-pill-action" style="width: 100%; justify-content: center; font-size: 0.85rem;">
          Lihat Detail & Pesan ➔
        </button>
      </div>
    </div>
  `).join('');
}

function renderProductsGrid() {
  const grid = document.getElementById("products-grid-2x2");
  if (!grid || !Array.isArray(PRODUCTS_DATA) || PRODUCTS_DATA.length === 0) return;

  grid.innerHTML = PRODUCTS_DATA.slice(0, 4).map(p => `
    <div class="product-thumb-card" onclick="showProductDetail('${p.id}')">
      <div class="product-thumb-img">
        <img src="${p.thumb || p.image}" alt="${p.title}" onerror="this.src='assets/images/wood_pellets_pile.jpg'">
      </div>
      <div style="flex: 1; min-width: 0;">
        <span class="product-thumb-title">${p.title}</span>
        ${p.price ? `<div style="font-size: 0.82rem; font-weight: 700; color: var(--primary); margin-top: 2px;">${p.price}</div>` : ''}
      </div>
    </div>
  `).join('');
}

async function initLiveCatalog() {
  try {
    // 1. Fetch Animals
    let animalsRes = await fetch('/api/animals?t=' + Date.now()).catch(() => null);
    if (!animalsRes || !animalsRes.ok) {
      animalsRes = await fetch('data/animals.json?t=' + Date.now()).catch(() => null);
    }
    if (animalsRes && animalsRes.ok) {
      const liveAnimals = await animalsRes.json();
      if (Array.isArray(liveAnimals) && liveAnimals.length > 0) {
        ANIMALS_DATA = liveAnimals;
        renderAdoptionGrid();
      }
    }

    // 2. Fetch Products
    let productsRes = await fetch('/api/products?t=' + Date.now()).catch(() => null);
    if (!productsRes || !productsRes.ok) {
      productsRes = await fetch('data/products.json?t=' + Date.now()).catch(() => null);
    }
    if (productsRes && productsRes.ok) {
      const liveProducts = await productsRes.json();
      if (Array.isArray(liveProducts) && liveProducts.length > 0) {
        PRODUCTS_DATA = liveProducts;
        renderProductsGrid();
        renderFullProductsGrid();
      }
    }
  } catch (err) {
    console.log('Menggunakan data offline katalog bawaan:', err);
  }

  // Activate initial page based on URL hash
  const initialPage = getPageFromHash();
  showPage(initialPage, false);

  // Initialize drag-to-scroll on all avatar bars
  initAllDragToScroll();
}

// =====================================================================
// DRAG-TO-SCROLL & HORIZONTAL SCROLL FOR CATEGORY AVATARS
// =====================================================================

function setupDragToScroll(wrapper) {
  if (!wrapper || wrapper._hasDragInitialized) return;
  wrapper._hasDragInitialized = true;

  const container = wrapper.querySelector('.category-avatars');
  const btnPrev = wrapper.querySelector('.btn-prev');
  const btnNext = wrapper.querySelector('.btn-next');

  if (!container) return;

  function updateButtons() {
    const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);
    if (maxScroll <= 4) {
      if (btnPrev) btnPrev.style.opacity = '0.3';
      if (btnNext) btnNext.style.opacity = '0.3';
      return;
    }
    if (btnPrev) {
      const isStart = container.scrollLeft <= 4;
      btnPrev.style.opacity = isStart ? '0.35' : '1';
      btnPrev.style.pointerEvents = isStart ? 'none' : 'auto';
    }
    if (btnNext) {
      const isEnd = container.scrollLeft >= maxScroll - 4;
      btnNext.style.opacity = isEnd ? '0.35' : '1';
      btnNext.style.pointerEvents = isEnd ? 'none' : 'auto';
    }
  }

  wrapper._updateButtons = updateButtons;

  if (btnPrev) {
    btnPrev.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      container.scrollBy({ left: -220, behavior: 'smooth' });
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      container.scrollBy({ left: 220, behavior: 'smooth' });
    });
  }

  // Mouse Wheel: horizontal scroll when hovering
  container.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (maxScroll > 0) {
        const canScrollLeft = container.scrollLeft > 0 && e.deltaY < 0;
        const canScrollRight = container.scrollLeft < maxScroll && e.deltaY > 0;
        if (canScrollLeft || canScrollRight) {
          e.preventDefault();
          container.scrollLeft += e.deltaY;
          updateButtons();
        }
      }
    }
  }, { passive: false });

  // Mouse Drag to Scroll
  let isDown = false;
  let startX = 0;
  let scrollStart = 0;
  let hasDragged = false;
  let lastX = 0;
  let velocity = 0;
  let momentumID = null;

  function stopMomentum() {
    if (momentumID) {
      cancelAnimationFrame(momentumID);
      momentumID = null;
    }
  }

  container.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    stopMomentum();
    isDown = true;
    hasDragged = false;
    startX = e.pageX - container.offsetLeft;
    lastX = e.pageX;
    scrollStart = container.scrollLeft;
    velocity = 0;
    container.classList.add('is-dragging');
    document.body.style.userSelect = 'none';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const x = e.pageX - container.offsetLeft;
    const walk = x - startX;
    if (Math.abs(walk) > 4) {
      hasDragged = true;
    }
    velocity = e.pageX - lastX;
    lastX = e.pageX;
    container.scrollLeft = scrollStart - walk;
    updateButtons();
  });

  function handleDragEnd() {
    if (!isDown) return;
    isDown = false;
    container.classList.remove('is-dragging');
    document.body.style.userSelect = '';

    // Momentum glide
    if (Math.abs(velocity) > 1.5) {
      let currentVelocity = velocity * 1.4;
      function glide() {
        if (Math.abs(currentVelocity) < 0.4) {
          stopMomentum();
          updateButtons();
          return;
        }
        container.scrollLeft -= currentVelocity;
        currentVelocity *= 0.92;
        updateButtons();
        momentumID = requestAnimationFrame(glide);
      }
      stopMomentum();
      momentumID = requestAnimationFrame(glide);
    }

    // Suppress accidental clicks when user was dragging
    if (hasDragged) {
      const clickGuard = (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
      };
      container.addEventListener('click', clickGuard, { capture: true, once: true });
      setTimeout(() => {
        container.removeEventListener('click', clickGuard, { capture: true });
      }, 120);
    }
  }

  window.addEventListener('mouseup', handleDragEnd);

  container.addEventListener('scroll', updateButtons, { passive: true });
  window.addEventListener('resize', updateButtons);

  requestAnimationFrame(updateButtons);
  setTimeout(updateButtons, 150);
}

function initAllDragToScroll() {
  document.querySelectorAll('.category-avatars-scroll-wrapper').forEach(wrapper => {
    setupDragToScroll(wrapper);
  });
}

function refreshAllDragScrolls() {
  document.querySelectorAll('.category-avatars-scroll-wrapper').forEach(wrapper => {
    if (wrapper._updateButtons) {
      wrapper._updateButtons();
    }
  });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initLiveCatalog();
    initAllDragToScroll();
  });
} else {
  initLiveCatalog();
  initAllDragToScroll();
}


