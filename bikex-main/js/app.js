/* ===========================================================
   Bike X — app.js (PRODUCTION READY)
   All console.log statements removed
   =========================================================== */

/* ---------- Theme ---------- */
function initTheme(){
  const saved = localStorage.getItem("moto_theme");
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
}

function toggleTheme(){
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("moto_theme", next);
}

/* ---------- Page loader ---------- */
(function() {
  function hidePageLoader() {
    var loader = document.getElementById("pageLoader");
    if (!loader) return;
    loader.classList.add("loader-hide");
    setTimeout(function() {
      if (loader.parentNode) loader.parentNode.removeChild(loader);
    }, 550);
  }
  window.addEventListener("load", hidePageLoader);
  setTimeout(hidePageLoader, 5000);
})();

/* ---------- Theme-aware logo ---------- */
function applyThemeLogo() {
  const theme = document.documentElement.getAttribute("data-theme");
  const src = theme === "dark" ? "img/logo.png" : "img/logo-light.png";
  document.querySelectorAll(".site-logo-img").forEach(img => {
    if (img.getAttribute("src") !== src) img.setAttribute("src", src);
  });
}

/* ---------- Shared utilities ---------- */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/* ---------- Seller rating ---------- */
function getSellerRating(email) {
  const key = email || "seller@example.com";
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  const rating = Math.round((4.0 + (hash % 11) / 10) * 10) / 10;
  const reviewCount = 5 + (hash % 60);
  return { rating, reviewCount };
}

function renderStarRating(rating) {
  const rounded = Math.round(rating);
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    stars += i <= rounded ? "★" : "☆";
  }
  return stars;
}

/* ---------- Formatting ---------- */
const fmtKm = n => n.toLocaleString("en-US").padStart(6,"0");

/* ---------- Rendering ---------- */
let state = {
  search:"", brand:"", region:"", city:"", condition:"", minPrice:"", maxPrice:"",
  sort:"newest", onlyFavorites:false, category:"motorcycles"
};

function applyFilters(listings){
  const favs = DataService.getFavorites();
  return listings.filter(l => {
    if(state.category && (l.category || "motorcycles") !== state.category) return false;
    if(state.onlyFavorites && !favs.includes(l.id)) return false;
    // ---- region filter ----
    if (state.region) {
      const citiesInRegion = getCitiesForRegion(state.region);
      if (!citiesInRegion.includes(l.city)) return false;
    }
    // ---- city filter (narrower) ----
    if (state.city && l.city !== state.city) return false;
    // ---- brand filter (only for motorcycles) ----
    if (state.category === "motorcycles" && state.brand && l.brand !== state.brand) return false;
    // ---- condition (skip for services) ----
    if (state.category !== "services" && state.condition && l.condition !== state.condition) return false;
    // ---- price ----
    if (state.minPrice && l.price < Number(state.minPrice)) return false;
    if (state.maxPrice && l.price > Number(state.maxPrice)) return false;
    // ---- search ----
    if (state.search){
      const q = state.search.toLowerCase();
      const hay = `${l.brand||""} ${l.model||""} ${l.title||""} ${l.subtitle||""} ${l.city} ${l.year||""}`.toLowerCase();
      if(!hay.includes(q)) return false;
    }
    return true;
  });
}

function applySort(listings){
  const arr = [...listings];
  switch(state.sort){
    case "price-asc": arr.sort((a,b)=>a.price-b.price); break;
    case "price-desc": arr.sort((a,b)=>b.price-a.price); break;
    case "mileage-asc": arr.sort((a,b)=>(a.mileage||0)-(b.mileage||0)); break;
    case "year-desc": arr.sort((a,b)=>(b.year||0)-(a.year||0)); break;
    default: break;
  }
  return arr;
}

function getListingImage(listing) {
  if (listing.images && listing.images.length > 0) {
    return listing.images[0];
  }
  return null;
}

const CATEGORY_ICON_PATHS = {
  services: '<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6"/><path d="M9 17h6"/><path d="M9 9h1"/>',
  gear: '<path d="M4 14a9 9 0 0118 0v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z"/><path d="M5.5 8.5l-2 .3 1.2 1.8"/><circle cx="7" cy="14.5" r="1"/><path d="M9 10.5L18 8.3V14.8L9 16.8Z"/><path d="M14.7 9L14.3 15.6"/>',
  parts: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>',
  motorcycles: '<circle cx="5" cy="17" r="3"/><circle cx="19" cy="17" r="3"/><path d="M5 17h4l3-6h4l2 4h2"/><path d="M9 11l2-3h3"/>'
};

function categoryIconSVG(category, size){
  const paths = CATEGORY_ICON_PATHS[category] || CATEGORY_ICON_PATHS.parts;
  return `<svg viewBox="0 0 24 24" width="${size||44}" height="${size||44}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

function categoryIconTile(category){
  return `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--accent);">${categoryIconSVG(category, 44)}</div>`;
}

function handleMediaImageError(imgEl, color, variant){
  const media = imgEl.closest('.card-media') || imgEl.closest('.offer-thumb-lg');
  if (media) media.style.background = `linear-gradient(160deg, ${color}1a, transparent)`;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = bikeSVG(color, variant);
  const svgEl = wrapper.firstElementChild;
  if (svgEl) imgEl.replaceWith(svgEl);
}

/* ---------- RENDER GRID ---------- */
function renderGrid(){
  const grid = document.getElementById("grid");
  if (!grid) return;
  
  const all = DataService.getAllListings();
  const filtered = applySort(applyFilters(all));
  const favs = DataService.getFavorites();

  const countEl = document.getElementById("resultsCount");
  if (countEl) countEl.textContent = t("resultsFound")(filtered.length);

  if(filtered.length === 0){
    grid.innerHTML = `<div class="empty-state">
      <h3>${t("emptyTitle")}</h3>
      <p>${t("emptyText")}</p>
    </div>`;
    return;
  }

  let html = '';
  filtered.forEach(l => {
    const category = l.category || "motorcycles";
    const isFav = favs.includes(l.id);
    const cityDisplay = cityLabel(l.city);
    const conditionText = l.condition === 'new' ? t('conditionNew') : t('conditionUsed');
    const conditionClass = l.condition === 'used' ? 'used' : '';

    if (category !== "motorcycles") {
      const color = colorFor(l.brand || "");
      const priceLabel = category === "services" ? `${t("fromPricePrefix")} ${formatPrice(l.price)}` : formatPrice(l.price);
      
      // Determine display title and subtitle
      let displayTitle = l.title || l.subtitle || 'Listing';
      let displaySubtitle = l.subtitle || '';
      
      html += `
      <article class="card" data-id="${l.id}" tabindex="0" role="button" aria-label="${displayTitle}">
        <div class="card-media" style="background:linear-gradient(160deg, ${color}1a, transparent);">
          ${categoryIconTile(category)}
          ${l.condition ? `<span class="badge ${conditionClass}">${conditionText}</span>` : ''}
          <button class="fav-btn ${isFav?'active':''}" data-fav="${l.id}" aria-label="${t('saveListingAria')}" aria-pressed="${isFav}">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 21s-7-4.6-9.5-9C.7 8.4 2 4.8 5.4 3.9 7.7 3.3 10 4.4 12 7c2-2.6 4.3-3.7 6.6-3.1C22 4.8 23.3 8.4 21.5 12 19 16.4 12 21 12 21z"/></svg>
          </button>
        </div>
        <div class="card-body">
          <div class="card-title">${displayTitle}</div>
          <div class="card-price mono">${priceLabel}</div>
          <div class="card-meta">
            <span>${cityDisplay}</span>
            ${displaySubtitle ? `<span>&middot;</span><span>${displaySubtitle}</span>` : ''}
            ${l.condition ? `<span>&middot;</span><span>${conditionText}</span>` : ''}
          </div>
        </div>
      </article>`;
      return;
    }

    // ---- Motorcycles ----
    const color = colorFor(l.brand);
    const brandDisplay = brandLabel(l.brand);
    const mainImage = getListingImage(l);

    const titleParts = [l.year, brandDisplay, l.model].filter(Boolean);
    const titleText = titleParts.join(" ") || brandDisplay;

    const metaParts = [];
    if (l.city) metaParts.push(cityLabel(l.city));
    if (l.cc) metaParts.push(`${l.cc} cc`);
    if (l.color) metaParts.push(l.color);
    if (l.condition) metaParts.push(conditionText);
    const metaHTML = metaParts.map(p => `<span>${p}</span>`).join('<span>&middot;</span>');

    let mediaContent = '';
    if (mainImage) {
      mediaContent = `<img src="${mainImage}" alt="${titleText}" style="width:100%;height:100%;object-fit:cover;" onerror="handleMediaImageError(this, '${color}', ${l.variant || 0})">`;
    } else {
      mediaContent = bikeSVG(color, l.variant || 0);
    }
    
    html += `
    <article class="card" data-id="${l.id}" tabindex="0" role="button" aria-label="${titleText} listing">
      <div class="card-media" style="${mainImage ? 'background:var(--surface-2);' : 'background:linear-gradient(160deg, ' + color + '1a, transparent);'}">
        ${mediaContent}
        <span class="badge ${conditionClass}">${conditionText}</span>
        ${l.images && l.images.length > 1 ? `<span class="badge" style="background:rgba(0,0,0,0.6);right:8px;left:auto;bottom:8px;top:auto;"><i class="fa-solid fa-image" style="color: rgb(255, 122, 61);"></i> ${l.images.length}</span>` : ''}
        <button class="fav-btn ${isFav?'active':''}" data-fav="${l.id}" aria-label="${t('saveListingAria')}" aria-pressed="${isFav}">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 21s-7-4.6-9.5-9C.7 8.4 2 4.8 5.4 3.9 7.7 3.3 10 4.4 12 7c2-2.6 4.3-3.7 6.6-3.1C22 4.8 23.3 8.4 21.5 12 19 16.4 12 21 12 21z"/></svg>
        </button>
      </div>
      <div class="card-body">
        <div class="card-title">${titleText}</div>
        <div class="card-price mono">${formatPrice(l.price)}</div>
        ${metaHTML ? `<div class="card-meta">${metaHTML}</div>` : ''}
        ${l.mileage !== null && l.mileage !== undefined ? `<div class="odometer">
          <span>${t('odoLabel')}</span><span class="mono">${fmtKm(l.mileage)} ${t('kmUnit')}</span>
        </div>` : ''}
      </div>
    </article>`;
  });
  
  grid.innerHTML = html;
}

/* ---------- HERO SLIDER ---------- */
function renderHeroOffers(){
  const track = document.getElementById("heroSlideTrack");
  const dotsContainer = document.getElementById("heroOfferDots");
  if (!track || !dotsContainer) return;

  const all = DataService.getAllListings().filter(l => (l.category || "motorcycles") === "motorcycles");

  const listings = all
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 8);

  if (listings.length === 0) {
    track.innerHTML = `<div class="hero-slide active" style="display:flex;align-items:center;justify-content:center;color:var(--muted);">No motorcycles listed yet</div>`;
    dotsContainer.innerHTML = '';
    return;
  }

  track.innerHTML = listings.map((listing, index) => {
    const color = colorFor(listing.brand);
    const brandDisplay = brandLabel(listing.brand);
    const priceDisplay = formatPrice(listing.price);
    const mainImage = getListingImage(listing);

    let mediaHtml = '';
    if (mainImage) {
      mediaHtml = `<img src="${mainImage}" alt="${listing.year} ${brandDisplay} ${listing.model}" loading="lazy" onerror="this.style.display='none';var fb=this.nextElementSibling;if(fb)fb.style.display='flex';">
        <div class="hero-fallback" style="display:none;align-items:center;justify-content:center;width:100%;height:100%;background:linear-gradient(160deg, ${color}1a, transparent);">${bikeSVG(color, listing.variant || 0)}</div>`;
    } else {
      mediaHtml = `<div class="hero-fallback" style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:linear-gradient(160deg, ${color}1a, transparent);">${bikeSVG(color, listing.variant || 0)}</div>`;
    }

    const activeClass = index === 0 ? ' active' : '';

    return `
      <div class="hero-slide${activeClass}" data-id="${listing.id}" data-index="${index}">
        ${mediaHtml}
        <div class="hero-overlay">
          <div class="hero-title">${listing.year} ${brandDisplay} ${listing.model}</div>
          <div class="hero-price">${priceDisplay}</div>
        </div>
      </div>
    `;
  }).join('');

  dotsContainer.innerHTML = listings.map((_, index) => {
    const activeClass = index === 0 ? ' active' : '';
    return `<button class="dot${activeClass}" data-index="${index}" aria-label="Go to slide ${index + 1}"></button>`;
  }).join('');

  let currentIndex = 0;
  const totalSlides = listings.length;
  let slideInterval = null;
  const INTERVAL_MS = 2800;

  function goToSlide(index) {
    track.querySelectorAll('.hero-slide').forEach(s => s.classList.remove('active'));
    dotsContainer.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));

    const slides = track.querySelectorAll('.hero-slide');
    const dots = dotsContainer.querySelectorAll('.dot');
    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;

    slides[index].classList.add('active');
    dots[index].classList.add('active');
    currentIndex = index;
  }

  function nextSlide() {
    goToSlide((currentIndex + 1) % totalSlides);
  }

  function startAutoPlay() {
    if (slideInterval) clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, INTERVAL_MS);
  }

  function stopAutoPlay() {
    if (slideInterval) {
      clearInterval(slideInterval);
      slideInterval = null;
    }
  }

  dotsContainer.querySelectorAll('.dot').forEach(dot => {
    dot.addEventListener('click', function(e) {
      e.stopPropagation();
      stopAutoPlay();
      const index = Number(this.dataset.index);
      goToSlide(index);
      startAutoPlay();
    });
  });

  track.querySelectorAll('.hero-slide').forEach(slide => {
    slide.addEventListener('click', function() {
      const id = this.dataset.id;
      if (id) openListing(id);
    });
    slide.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const id = this.dataset.id;
        if (id) openListing(id);
      }
    });
  });

  const sliderContainer = document.getElementById("heroOffers");
  if (sliderContainer) {
    sliderContainer.addEventListener('mouseenter', stopAutoPlay);
    sliderContainer.addEventListener('mouseleave', startAutoPlay);
    sliderContainer.addEventListener('focusin', stopAutoPlay);
    sliderContainer.addEventListener('focusout', startAutoPlay);
  }

  goToSlide(0);
  startAutoPlay();
}

function openListing(id) {
  window.location.href = `listing.html?id=${id}`;
}

/* ---------- POPULATE FILTER OPTIONS (UPDATED: City empty until region selected) ---------- */
function populateFilterOptions(){
  const regionSel = document.getElementById("filterRegion");
  const citySel = document.getElementById("filterCity");
  if (!regionSel || !citySel) return;

  // Populate region dropdown
  regionSel.innerHTML = `<option value="" data-i18n="allRegions">${t("allRegions")}</option>`;
  REGIONS.forEach(r => {
    const label = getLang() === 'ar' ? r.nameAr : r.nameEn;
    regionSel.insertAdjacentHTML("beforeend", `<option value="${r.id}">${label}</option>`);
  });

  // Initially, city dropdown has only "All cities" (no specific cities)
  citySel.innerHTML = `<option value="" data-i18n="allCities">${t("allCities")}</option>`;

  // When region changes, populate city options
  regionSel.addEventListener("change", function() {
    const regionId = this.value;
    if (regionId) {
      const cities = getCitiesForRegion(regionId);
      // Clear and add "All cities" + cities
      citySel.innerHTML = `<option value="" data-i18n="allCities">${t("allCities")}</option>`;
      cities.forEach(c => {
        const displayName = cityLabel(c);
        citySel.insertAdjacentHTML("beforeend", `<option value="${c}">${displayName}</option>`);
      });
      state.region = regionId;
      state.city = ""; // reset city when region changes
      citySel.value = "";
    } else {
      // No region selected: city dropdown reverts to only "All cities"
      citySel.innerHTML = `<option value="" data-i18n="allCities">${t("allCities")}</option>`;
      state.region = "";
      state.city = "";
    }
    renderGrid();
  });

  // City change
  citySel.addEventListener("change", function(e) {
    state.city = e.target.value;
    renderGrid();
  });
}

/* ---------- BRAND FILTER ---------- */
const BRAND_VISIBLE_COUNT = 6;

function renderBrandFilter() {
  const grid = document.getElementById("brandGrid");
  const moreBtn = document.getElementById("brandShowMore");
  if (!grid) return;

  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
  grid.style.gap = '8px';
  grid.style.width = '100%';

  const all = DataService.getAllListings().filter(l => (l.category || "motorcycles") === "motorcycles");
  const brandCounts = {};
  all.forEach(l => {
    brandCounts[l.brand] = (brandCounts[l.brand] || 0) + 1;
  });

  const sortedBrands = [...BRANDS].sort((a, b) => {
    return (brandCounts[b] || 0) - (brandCounts[a] || 0);
  });

  const tiles = [{ value: "", label: "All", all: true }];
  sortedBrands.forEach(b => {
    tiles.push({ value: b, label: b, all: false });
  });

  const isMobile = window.innerWidth < 480;
  const BRAND_VISIBLE_COUNT = isMobile ? 4 : 6;

  grid.innerHTML = tiles.map((tile, i) => {
    const logoPath = tile.all ? null : getBrandLogo(tile.value);
    const activeClass = state.brand === tile.value ? " active" : "";
    const hiddenClass = i >= BRAND_VISIBLE_COUNT ? " brand-tile-hidden" : "";
    const isDisabled = !tile.all && (brandCounts[tile.value] || 0) === 0;

    let content = '';
    if (tile.all) {
      content = `<span class="brand-name">${tile.label}</span>`;
    } else if (logoPath) {
      content = `<img src="${logoPath}" alt="${tile.label}" class="brand-logo-img" loading="lazy" 
                        onerror="this.outerHTML='<span style=\\'font-weight:600;font-size:0.7rem;color:var(--text);\\'>${tile.label.charAt(0)}</span>'">`;
    } else {
      content = `<span style="font-weight:600;font-size:0.7rem;color:var(--text);">${tile.label.charAt(0)}</span>`;
    }

    return `<button type="button" class="brand-tile${tile.all ? " all-tile" : ""}${activeClass}${isDisabled ? " disabled" : ""}${hiddenClass}"
                    data-brand="${tile.value}" ${isDisabled ? 'disabled' : ''}
                    title="${tile.label}">
      ${content}
    </button>`;
  }).join("");

  grid.querySelectorAll(".brand-tile:not([disabled])").forEach(tile => {
    tile.addEventListener("click", function() {
      grid.querySelectorAll(".brand-tile").forEach(t => t.classList.remove("active"));
      this.classList.add("active");
      state.brand = this.dataset.brand;
      renderGrid();
    });
  });

  if (moreBtn) {
    const hasHidden = tiles.length > BRAND_VISIBLE_COUNT;
    moreBtn.style.display = hasHidden ? "flex" : "none";
    moreBtn.classList.remove("expanded");
    const label = moreBtn.querySelector("span");
    const lang = getLang();
    if (label) label.textContent = lang === 'ar' ? 'عرض المزيد' : 'Show more';
    
    moreBtn.onclick = function() {
      const isExpanded = this.classList.toggle("expanded");
      grid.querySelectorAll(".brand-tile").forEach((t, idx) => {
        if (idx >= BRAND_VISIBLE_COUNT) {
          t.classList.toggle("brand-tile-hidden", !isExpanded);
        }
      });
      if (label) {
        label.textContent = isExpanded 
          ? (lang === 'ar' ? 'عرض أقل' : 'Show less')
          : (lang === 'ar' ? 'عرض المزيد' : 'Show more');
      }
    };
  }

  if (window.innerWidth < 768) {
    grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
  }
  if (window.innerWidth < 480) {
    grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    grid.style.gap = '4px';
  }
}

/* ---------- CATEGORY SWITCHER ---------- */
function setupCategorySwitcher() {
  const tabs = document.querySelectorAll("#categoryTabs .category-tab");
  const brandGroup = document.getElementById("brandFilterGroup");
  const conditionGroup = document.getElementById("conditionFilterGroup");
  if (!tabs.length) return;

  function applyCategoryUI() {
    if (brandGroup) brandGroup.style.display = state.category === "motorcycles" ? "" : "none";
    if (conditionGroup) conditionGroup.style.display = state.category === "services" ? "none" : "";
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", function() {
      if (this.classList.contains("active")) return;
      tabs.forEach(t => t.classList.remove("active"));
      this.classList.add("active");
      state.category = this.dataset.category;
      state.brand = "";
      state.condition = "";
      applyCategoryUI();
      if (state.category === "motorcycles") renderBrandFilter();
      renderGrid();
    });
  });

  applyCategoryUI();
}

/* ---------- WIRE EVENTS ---------- */
function wireEvents(){
  const themeSwitch = document.getElementById("themeSwitch");
  if (themeSwitch) {
    themeSwitch.addEventListener("click", toggleTheme);
  }

  const searchForm = document.getElementById("searchForm");
  if (searchForm) {
    searchForm.addEventListener("submit", function(e) {
      e.preventDefault();
      state.search = document.getElementById("searchInput").value.trim();
      renderGrid();
    });
  }

  // City filter already handled in populateFilterOptions, but we need to ensure it triggers render
  // No additional listener needed because it's attached there.

  const filterCondition = document.getElementById("filterCondition");
  if (filterCondition) {
    filterCondition.addEventListener("change", function(e) { 
      state.condition = e.target.value; 
      renderGrid(); 
    });
  }
  
  const minPrice = document.getElementById("minPrice");
  if (minPrice) {
    minPrice.addEventListener("input", function(e) { 
      state.minPrice = e.target.value; 
      renderGrid(); 
    });
  }
  
  const maxPrice = document.getElementById("maxPrice");
  if (maxPrice) {
    maxPrice.addEventListener("input", function(e) { 
      state.maxPrice = e.target.value; 
      renderGrid(); 
    });
  }
  
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", function(e) { 
      state.sort = e.target.value; 
      renderGrid(); 
    });
  }
  
  const clearFilters = document.getElementById("clearFilters");
  if (clearFilters) {
    clearFilters.addEventListener("click", function() {
      // Reset state (keep onlyFavorites and category)
      state = { 
        search:"", brand:"", region:"", city:"", condition:"", minPrice:"", maxPrice:"", 
        sort:"newest", onlyFavorites:state.onlyFavorites, category:state.category 
      };
      // Reset search input
      const searchInput = document.getElementById("searchInput");
      if (searchInput) searchInput.value = "";
      // Reset brand tiles
      const brandGridEl = document.getElementById("brandGrid");
      if (brandGridEl) {
        brandGridEl.querySelectorAll(".brand-tile").forEach(t => t.classList.toggle("active", t.dataset.brand === ""));
      }
      // Reset region and city dropdowns
      const regionSel = document.getElementById("filterRegion");
      const citySel = document.getElementById("filterCity");
      if (regionSel) regionSel.value = "";
      if (citySel) {
        // Reset city to only "All cities" option
        citySel.innerHTML = `<option value="" data-i18n="allCities">${t("allCities")}</option>`;
        citySel.value = "";
      }
      // Reset condition
      const filterConditionEl = document.getElementById("filterCondition");
      if (filterConditionEl) filterConditionEl.value = "";
      // Reset prices
      const minPriceEl = document.getElementById("minPrice");
      if (minPriceEl) minPriceEl.value = "";
      const maxPriceEl = document.getElementById("maxPrice");
      if (maxPriceEl) maxPriceEl.value = "";
      // Reset sort
      const sortSelectEl = document.getElementById("sortSelect");
      if (sortSelectEl) sortSelectEl.value = "newest";
      // Re-render
      renderGrid();
    });
  }

  document.querySelectorAll(".chip[data-brand]").forEach(function(chip) {
    const brand = chip.dataset.brand;
    chip.textContent = brandLabel(brand);
    chip.addEventListener("click", function() {
      document.querySelectorAll(".chip[data-brand]").forEach(function(c) { 
        c.classList.remove("active"); 
      });
      chip.classList.add("active");
      state.brand = brand;
      const brandGridEl = document.getElementById("brandGrid");
      if (brandGridEl) {
        brandGridEl.querySelectorAll(".brand-tile").forEach(t => {
          t.classList.toggle("active", t.dataset.brand === brand);
        });
      }
      renderGrid();
      const grid = document.getElementById("grid");
      if (grid) grid.scrollIntoView({behavior:"smooth", block:"start"});
    });
  });

  const favToggle = document.getElementById("favToggle");
  if (favToggle) {
    favToggle.addEventListener("click", function() {
      state.onlyFavorites = !state.onlyFavorites;
      favToggle.classList.toggle("active", state.onlyFavorites);
      renderGrid();
    });
  }

  const grid = document.getElementById("grid");
  if (grid) {
    grid.addEventListener("click", function(e) {
      const favBtn = e.target.closest("[data-fav]");
      if (favBtn) {
        const id = favBtn.dataset.fav;
        const favs = DataService.toggleFavorite(id);
        favBtn.classList.toggle("active", favs.includes(id));
        favBtn.setAttribute("aria-pressed", favs.includes(id));
        if (state.onlyFavorites) renderGrid();
        return;
      }
      const card = e.target.closest(".card");
      if (card) openListing(card.dataset.id);
    });
    
    grid.addEventListener("keypress", function(e) {
      if (e.key === "Enter") {
        const card = e.target.closest(".card");
        if (card) openListing(card.dataset.id);
      }
    });
  }
}

/* ---------- MOBILE AUTH ---------- */
function updateMobileAuth() {
  const navAuthEl = document.getElementById("mobileNavAuth");
  const greetingEl = document.getElementById("mobileAuth");

  if (!navAuthEl && !greetingEl) return;

  const user = DataService.getSession();

  if (navAuthEl) {
    if (user) {
      navAuthEl.innerHTML = `
        <a href="dashboard.html" class="mobile-nav-link" id="mobileNavDashboard"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: rgb(255, 122, 61);"></i> ${t("dashboardBtn")}</a>
        <a href="messages.html" class="mobile-nav-link" id="mobileNavMessages"> <i class="fa-solid fa-comments fa-lg" style="color: rgb(255, 122, 61);"></i> ${t("messages")}</a>
        <button type="button" class="mobile-nav-link mobile-nav-btn" id="mobileNavLogout"> <i class="fa-solid fa-right-from-bracket fa-lg" style="color: rgb(255, 122, 61);"></i> ${t("logoutBtn")}</button>
      `;
      const logoutBtn = navAuthEl.querySelector("#mobileNavLogout");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", function() {
          DataService.logout();
          window.location.href = "index.html";
        });
      }
    } else {
      navAuthEl.innerHTML = `<a href="login.html" class="mobile-nav-link" id="mobileNavLogin"><i class="fa-solid fa-right-to-bracket fa-xl" style="color: rgb(255, 122, 61);"></i>  ${t("loginLink")}</a>`;
    }
  }

  if (greetingEl) {
    greetingEl.innerHTML = user
      ? `<div style="text-align:center; font-size:0.8rem; color:var(--muted);">👋 Hi, ${user.name}</div>`
      : "";
  }
}

/* ---------- MOBILE MENU ---------- */
function setupMobileMenu() {
  const hamburger = document.getElementById("hamburgerMenu");
  const overlay = document.getElementById("mobileMenuOverlay");
  const backdrop = document.getElementById("menuBackdrop");
  const closeBtn = document.getElementById("mobileMenuClose");

  const mobileSearchBtn = document.getElementById("mobileSearchBtn");
  const mobileSearchInput = document.getElementById("mobileSearchInput");

  if (mobileSearchBtn && mobileSearchInput) {
    mobileSearchBtn.addEventListener("click", function() {
      const query = mobileSearchInput.value.trim();
      if (query) {
        closeMenu();
        window.location.href = "index.html?search=" + encodeURIComponent(query);
      }
    });
    mobileSearchInput.addEventListener("keypress", function(e) {
      if (e.key === "Enter") {
        const query = this.value.trim();
        if (query) {
          closeMenu();
          window.location.href = "index.html?search=" + encodeURIComponent(query);
        }
      }
    });
  }

  function openMenu() {
    overlay.classList.add("open");
    backdrop.classList.add("active");
    hamburger.classList.add("active");
    document.body.style.overflow = "hidden";
    updateMobileAuth();
  }

  function closeMenu() {
    if (overlay) overlay.classList.remove("open");
    if (backdrop) backdrop.classList.remove("active");
    if (hamburger) hamburger.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (hamburger) hamburger.addEventListener("click", openMenu);
  if (closeBtn) closeBtn.addEventListener("click", closeMenu);
  if (backdrop) backdrop.addEventListener("click", closeMenu);

  document.querySelectorAll(".mobile-nav-link").forEach(function(link) {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") closeMenu();
  });

  const mobileLangSwitch = document.getElementById("mobileLangSwitch");
  if (mobileLangSwitch) {
    const newLangBtn = mobileLangSwitch.cloneNode(true);
    mobileLangSwitch.parentNode.replaceChild(newLangBtn, mobileLangSwitch);
    newLangBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const currentLang = localStorage.getItem("moto_lang") || "en";
      const next = currentLang === "ar" ? "en" : "ar";
      localStorage.setItem("moto_lang", next);
      window.location.reload();
    });
  }

  const mobileThemeSwitch = document.getElementById("mobileThemeSwitch");
  if (mobileThemeSwitch) {
    const newThemeBtn = mobileThemeSwitch.cloneNode(true);
    mobileThemeSwitch.parentNode.replaceChild(newThemeBtn, mobileThemeSwitch);
    newThemeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleTheme();
    });
  }
}

/* ---------- DOM READY ---------- */
document.addEventListener("DOMContentLoaded", function() {
  initTheme();
  translateStaticPage();
  populateFilterOptions(); // now populates region and city (city empty until region selected)
  renderBrandFilter();
  setupCategorySwitcher();
  wireEvents();
  
  setTimeout(function() {
    updateMobileAuth();
  }, 200);
  
  setTimeout(function() {
    renderGrid();
    renderHeroOffers();
  }, 100);
  
  setupMobileMenu();
});

document.addEventListener('visibilitychange', function() {
  if (!document.hidden) {
    updateMobileAuth();
  }
});

/* ---------- CUSTOM MODAL ---------- */
const MODAL_ICONS = {
  error: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
  success: '<circle cx="12" cy="12" r="10"/><path d="M8 12.5l2.5 2.5L16 9.5" stroke-linecap="round" stroke-linejoin="round"/>',
  warning: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
};

function showModal(message, title, type, confirmText, cancelText) {
  const overlay = document.getElementById('customModal');
  const titleEl = document.getElementById('modalTitle');
  const messageEl = document.getElementById('modalMessage');
  const iconEl = overlay ? overlay.querySelector('.modal-custom-icon') : null;
  const okBtn = document.getElementById('modalOkBtn');
  const cancelBtn = document.getElementById('modalCancelBtn');

  if (!overlay) return;

  if (titleEl) titleEl.textContent = title || t('error');
  if (messageEl) messageEl.textContent = message || 'Something went wrong.';

  if (iconEl) {
    const isSuccess = type === 'success';
    const isWarning = type === 'warning';
    iconEl.classList.toggle('success', isSuccess);
    iconEl.classList.toggle('warning', isWarning);
    const svg = iconEl.querySelector('svg');
    if (svg) {
      if (isSuccess) svg.innerHTML = MODAL_ICONS.success;
      else if (isWarning) svg.innerHTML = MODAL_ICONS.warning;
      else svg.innerHTML = MODAL_ICONS.error;
    }
  }

  if (okBtn) {
    okBtn.textContent = confirmText || 'OK';
    okBtn.style.display = 'inline-flex';
  }
  
  if (cancelBtn) {
    if (cancelText === false) {
      cancelBtn.style.display = 'none';
    } else {
      cancelBtn.textContent = cancelText || t('confirmDeleteCancel') || 'Cancel';
      cancelBtn.style.display = 'inline-flex';
    }
  }

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function hideModal() {
  const overlay = document.getElementById('customModal');
  if (!overlay) return;
  overlay.classList.remove('active');
  document.body.style.overflow = '';
  window._pendingDeleteId = null;
  window._pendingAdminEmail = null;
  window._pendingDeleteUserEmail = null;
}

document.addEventListener('DOMContentLoaded', function() {
  const overlay = document.getElementById('customModal');
  if (overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === this) hideModal();
    });
  }
  
  const okBtn = document.getElementById('modalOkBtn');
  if (okBtn) {
    okBtn.addEventListener('click', hideModal);
  }
  
  const cancelBtn = document.getElementById('modalCancelBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', hideModal);
  }
  
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') hideModal();
  });
});
