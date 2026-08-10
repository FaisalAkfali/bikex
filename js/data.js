/* ===========================================================
   Bike.X — seed data
   No stock photos: every listing renders a generated line-art
   bike so the catalog has one consistent visual identity.
   =========================================================== */

const CITIES = ["Riyadh","Jeddah","Dammam","Mecca","Medina","Khobar","Abha","Taif"];
const BRANDS = ["Yamaha","Honda","Kawasaki","Ducati","Harley-Davidson","BMW","KTM","Suzuki","Royal Enfield","Indian Motorcycles","CFMOTO","Polaris","Can-Am","SYM","Bajaj Boxer"];

// Top-level browse categories (order matches the category switcher UI)
const CATEGORIES = ["services", "gear", "parts", "motorcycles"];

// Brand logo paths (PNG files with transparent background)
const BRAND_LOGOS = {
  "Yamaha": "img/brands/yamaha.png",
  "Honda": "img/brands/honda.png",
  "Kawasaki": "img/brands/kawasaki.png",
  "Ducati": "img/brands/ducati.png",
  "Harley-Davidson": "img/brands/harley-davidson.png",
  "BMW": "img/brands/BMW.png",
  "KTM": "img/brands/KTM.png",
  "Suzuki": "img/brands/Suzuki.png",
  "Royal Enfield": "img/brands/Royal Enfield.png",
  "Indian Motorcycles": "img/brands/Indian motorcycles.png",
  "CFMOTO": "img/brands/CFMOTO.png",
  "Polaris": "img/brands/polaris.png",
  "Can-Am": "img/brands/Can-Am.png",
  "SYM": "img/brands/SYM.png",
  "Bajaj Boxer": "img/brands/Bajaj Boxer.png"
};

// Brand colors for fallback/loading states
const BRAND_COLORS = {
  "Yamaha": "#e60012",
  "Honda": "#cc0000",
  "Kawasaki": "#00a651",
  "Ducati": "#b31b1b",
  "Harley-Davidson": "#fdb813",
  "BMW": "#0066b3",
  "KTM": "#ff6600",
  "Suzuki": "#cc0000",
  "Royal Enfield": "#2a2a2a",
  "Indian Motorcycles": "#8b0000",
  "CFMOTO": "#e2231a",
  "Polaris": "#c8102e",
  "Can-Am": "#ffc72c",
  "SYM": "#004b93",
  "Bajaj Boxer": "#1a1a1a"
};

// Get brand logo path
function getBrandLogo(brand) {
  return BRAND_LOGOS[brand] || null;
}

// Get brand color
function getBrandColor(brand) {
  return BRAND_COLORS[brand] || "#666666";
}

function bikeSVG(color, variant = 0){
  const variants = [
    `<path d="M30 110 L70 70 L130 70 L160 50 L210 50 L230 75 L260 75" stroke="${color}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
     <circle cx="65" cy="120" r="32" stroke="${color}" stroke-width="6" fill="none"/>
     <circle cx="235" cy="120" r="32" stroke="${color}" stroke-width="6" fill="none"/>
     <path d="M70 90 L100 70 L140 95 L100 110 Z" fill="${color}" opacity="0.85"/>
     <line x1="65" y1="120" x2="100" y2="110" stroke="${color}" stroke-width="6"/>
     <line x1="235" y1="120" x2="190" y2="100" stroke="${color}" stroke-width="6"/>`,
    `<path d="M28 118 L80 118 L110 80 L170 80 L185 60 L230 60" stroke="${color}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
     <circle cx="62" cy="122" r="30" stroke="${color}" stroke-width="6" fill="none"/>
     <circle cx="232" cy="122" r="30" stroke="${color}" stroke-width="6" fill="none"/>
     <ellipse cx="135" cy="95" rx="38" ry="14" fill="${color}" opacity="0.85"/>
     <line x1="62" y1="122" x2="110" y2="100" stroke="${color}" stroke-width="6"/>
     <line x1="232" y1="122" x2="195" y2="100" stroke="${color}" stroke-width="6"/>`,
    `<path d="M32 112 L75 75 L120 75 L145 55 L195 55 L222 80 L255 80" stroke="${color}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
     <circle cx="68" cy="118" r="34" stroke="${color}" stroke-width="6" fill="none"/>
     <circle cx="238" cy="118" r="34" stroke="${color}" stroke-width="6" fill="none"/>
     <path d="M75 92 L110 70 L150 92 L110 108 Z" fill="${color}" opacity="0.85"/>
     <line x1="68" y1="118" x2="110" y2="108" stroke="${color}" stroke-width="6"/>
     <line x1="238" y1="118" x2="200" y2="92" stroke="${color}" stroke-width="6"/>`
  ];
  const path = variants[variant % variants.length];
  return `<svg viewBox="0 0 290 170" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${path}</svg>`;
}

const PALETTE = ["#ff5a1f","#1f6f5c","#2563eb","#b91c1c","#7c3aed","#0d9488","#a16207"];

const SEED_LISTINGS = [];

function colorFor(brand){
  const idx = BRANDS.indexOf(brand) % PALETTE.length;
  return PALETTE[idx === -1 ? 0 : idx];
}

// Log to confirm data is loaded
console.log('data.js loaded. SEED_LISTINGS count:', SEED_LISTINGS.length);