/* ===========================================================
   Bike.X — sell.js (COMPLETE)
   - Region + City (region‑first)
   - Images stored as base64 (persist across pages)
   - Condition (New/Used) visible for all categories
   - Category‑aware fields
   - Saves creatorName + creatorAvatar for real seller display
   =========================================================== */

let pendingImageFiles = [];
let sellCategory = "motorcycles";

const SELL_COPY = {
  en: {
    motorcycles: { title: "List your motorcycle", subtitle: "Fill in the details below. Your listing appears at the top of the homepage instantly — no account needed for this demo." },
    parts: { title: "List a part", subtitle: "Fill in the details below to list a motorcycle part or component. Your listing appears instantly on the homepage." },
    gear: { title: "List gear or an accessory", subtitle: "Fill in the details below to list riding gear or an accessory. Your listing appears instantly on the homepage." },
    services: { title: "List a service", subtitle: "Fill in the details below to list a service. Your listing appears instantly on the homepage." }
  },
  ar: {
    motorcycles: { title: "أضف دراجتك النارية", subtitle: "املأ التفاصيل أدناه. سيظهر إعلانك أعلى الصفحة الرئيسية فورًا — لا حاجة لحساب في هذا العرض التجريبي." },
    parts: { title: "أضف قطعة غيار", subtitle: "املأ التفاصيل أدناه لإضافة قطعة غيار أو مكوّن. سيظهر إعلانك فورًا في الصفحة الرئيسية." },
    gear: { title: "أضف ملابس أو مستلزمات", subtitle: "املأ التفاصيل أدناه لإضافة ملابس ركوب أو مستلزم. سيظهر إعلانك فورًا في الصفحة الرئيسية." },
    services: { title: "أضف خدمة", subtitle: "املأ التفاصيل أدناه لإضافة خدمة. سيظهر إعلانك فورًا في الصفحة الرئيسية." }
  }
};

/* ---------- DOM READY ---------- */
document.addEventListener("DOMContentLoaded", function() {
  translateStaticPage();

  const brandSel = document.getElementById("brand");
  const regionSel = document.getElementById("region");
  const citySel = document.getElementById("city");
  const partBrandSel = document.getElementById("partBrand");

  // Populate brand dropdowns
  if (typeof BRANDS !== 'undefined' && typeof CITIES !== 'undefined') {
    BRANDS.forEach(function(b) {
      const option = document.createElement('option');
      option.value = b;
      option.textContent = brandLabel(b);
      brandSel.appendChild(option);

      const partOption = document.createElement('option');
      partOption.value = b;
      partOption.textContent = brandLabel(b);
      partBrandSel.appendChild(partOption);
    });

    // "Other" option at the end
    const brandOtherOpt = document.createElement('option');
    brandOtherOpt.value = "Other";
    brandOtherOpt.textContent = t("brandOther");
    brandSel.appendChild(brandOtherOpt);

    const partBrandOtherOpt = document.createElement('option');
    partBrandOtherOpt.value = "Other";
    partBrandOtherOpt.textContent = t("brandOther");
    partBrandSel.appendChild(partBrandOtherOpt);
  }

  // Populate region dropdown
  if (typeof REGIONS !== 'undefined') {
    REGIONS.forEach(r => {
      const label = getLang() === 'ar' ? r.nameAr : r.nameEn;
      regionSel.insertAdjacentHTML("beforeend", `<option value="${r.id}">${label}</option>`);
    });
  }

  // City dropdown starts empty and disabled
  citySel.innerHTML = `<option value="" disabled selected data-i18n="selectCityDefault">${t("selectCityDefault")}</option>`;
  citySel.disabled = true;

  // Region → City dynamic update
  regionSel.addEventListener("change", function() {
    const regionId = this.value;
    if (regionId) {
      const cities = getCitiesForRegion(regionId);
      citySel.innerHTML = `<option value="" disabled selected data-i18n="selectCityDefault">${t("selectCityDefault")}</option>`;
      cities.forEach(c => {
        const displayName = cityLabel(c);
        citySel.insertAdjacentHTML("beforeend", `<option value="${c}">${displayName}</option>`);
      });
      citySel.disabled = false;
    } else {
      citySel.innerHTML = `<option value="" disabled selected data-i18n="selectCityDefault">${t("selectCityDefault")}</option>`;
      citySel.disabled = true;
    }
  });

  // "Other" brand toggle
  setupBrandOtherToggle("brand", "brandOtherWrap");
  setupBrandOtherToggle("partBrand", "partBrandOtherWrap");

  // Image upload
  setupImageUpload();

  // Category switcher
  setupSellCategorySwitcher();

  // Form submit
  document.getElementById("sellForm").addEventListener("submit", handleSellSubmit);
});

/* ---------- "Other" brand toggle ---------- */
function setupBrandOtherToggle(selectId, wrapId) {
  const select = document.getElementById(selectId);
  const wrap = document.getElementById(wrapId);
  if (!select || !wrap) return;
  const input = wrap.querySelector("input");

  function update() {
    if (select.value === "Other") {
      wrap.style.display = "";
      if (input) input.setAttribute("required", "required");
    } else {
      wrap.style.display = "none";
      if (input) input.removeAttribute("required");
    }
  }

  select.addEventListener("change", update);
  update();
}

/* ---------- Category switcher ---------- */
function setupSellCategorySwitcher() {
  const tabs = document.querySelectorAll("#sellCategoryTabs .category-tab");
  const groups = {
    motorcycles: document.getElementById("fieldsMotorcycle"),
    parts: document.getElementById("fieldsParts"),
    gear: document.getElementById("fieldsGear"),
    services: document.getElementById("fieldsServices")
  };
  const requiredFields = {
    motorcycles: ["brand", "model", "year", "cc", "mileage", "color", "price", "city", "condition", "desc"],
    parts: ["partTitle", "partType", "partBrand", "price", "city", "condition", "desc"],
    gear: ["gearTitle", "gearType", "gearSize", "price", "city", "condition", "desc"],
    services: ["serviceType", "price", "city", "desc"]
  };
  const conditionRow = document.getElementById("conditionFieldRow");
  const priceLabel = document.querySelector('label[for="price"]');

  function applySellCategoryUI() {
    Object.keys(groups).forEach(cat => {
      if (groups[cat]) groups[cat].style.display = (cat === sellCategory) ? "" : "none";
    });

    // Set required fields
    Object.keys(requiredFields).forEach(cat => {
      requiredFields[cat].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (cat === sellCategory) {
          el.setAttribute("required", "required");
        } else {
          el.removeAttribute("required");
        }
      });
    });

    // Condition row is always visible
    if (conditionRow) conditionRow.style.display = "";

    // Update price label for services
    const lang = typeof getLang !== 'undefined' ? getLang() : 'en';
    if (priceLabel) {
      if (sellCategory === "services") {
        priceLabel.removeAttribute("data-i18n");
        priceLabel.textContent = lang === 'ar' ? "السعر ابتداءً من (ر.س) (اختياري)" : "Starting price (SAR) (optional)";
      } else {
        priceLabel.setAttribute("data-i18n", "labelPriceSar");
        priceLabel.textContent = t("labelPriceSar");
      }
    }

    // Update title/subtitle
    const copy = (SELL_COPY[lang] || SELL_COPY.en)[sellCategory];
    const titleEl = document.getElementById("sellPageTitle");
    const subtitleEl = document.getElementById("sellPageSubtitle");
    if (titleEl && copy) { titleEl.removeAttribute("data-i18n"); titleEl.textContent = copy.title; }
    if (subtitleEl && copy) { subtitleEl.removeAttribute("data-i18n"); subtitleEl.textContent = copy.subtitle; }
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", function() {
      if (this.classList.contains("active")) return;
      tabs.forEach(t => t.classList.remove("active"));
      this.classList.add("active");
      sellCategory = this.dataset.category;
      applySellCategoryUI();
    });
  });

  applySellCategoryUI();
}

/* ---------- IMAGE UPLOAD ---------- */
function setupImageUpload() {
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("imageInput");
  const uploadArea = document.getElementById("imageUploadArea");

  dropzone.addEventListener("click", function(e) {
    if (e.target === fileInput) return;
    fileInput.click();
  });

  fileInput.addEventListener("change", function(e) {
    const files = this.files;
    handleFiles(files);
    this.value = '';
  });

  dropzone.addEventListener("dragover", function(e) {
    e.preventDefault();
    uploadArea.classList.add("dragover");
  });

  dropzone.addEventListener("dragleave", function(e) {
    e.preventDefault();
    uploadArea.classList.remove("dragover");
  });

  dropzone.addEventListener("drop", function(e) {
    e.preventDefault();
    uploadArea.classList.remove("dragover");
    const files = e.dataTransfer.files;
    handleFiles(files);
  });
}

function handleFiles(files) {
  const maxImages = 6;
  const maxSize = 2 * 1024 * 1024;
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (pendingImageFiles.length >= maxImages) {
    showModal("You can upload a maximum of 6 images.", "⚠️ Image Limit", "error");
    return;
  }

  let validFiles = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (!validTypes.includes(file.type)) {
      showModal("Please select a valid image file (JPEG, PNG, GIF, WEBP).", "⚠️ Invalid File", "error");
      continue;
    }

    if (file.size > maxSize) {
      showModal("Image size must be less than 2MB.", "⚠️ File Too Large", "error");
      continue;
    }

    if (pendingImageFiles.length + validFiles.length >= maxImages) {
      showModal("You can upload a maximum of 6 images.", "⚠️ Image Limit", "error");
      break;
    }

    validFiles.push(file);
  }

  validFiles.forEach(function(file) {
    pendingImageFiles.push(file);
    renderImagePreviews();
  });
}

function renderImagePreviews() {
  const previewGrid = document.getElementById("imagePreviewGrid");

  if (pendingImageFiles.length === 0) {
    previewGrid.innerHTML = '';
    return;
  }

  previewGrid.innerHTML = pendingImageFiles.map(function(file, index) {
    const isMain = index === 0;
    const previewUrl = URL.createObjectURL(file);
    return `
      <div class="image-preview-item ${isMain ? 'main-image' : ''}">
        <img src="${previewUrl}" alt="Uploaded image ${index + 1}">
        <button class="remove-image-btn" data-index="${index}" title="Remove image">×</button>
        <span class="image-order-badge">${isMain ? 'Main' : '#' + (index + 1)}</span>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.remove-image-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const index = Number(this.dataset.index);
      pendingImageFiles.splice(index, 1);
      renderImagePreviews();
    });
  });
}

/* ---------- SUBMIT HANDLER ---------- */
function handleSellSubmit(e) {
  e.preventDefault();

  const priceRaw = document.getElementById("price").value;
  const price = priceRaw ? Number(priceRaw) : null;
  const city = document.getElementById("city").value;
  const condition = document.querySelector('input[name="condition"]:checked').value;
  const commentsEnabled = document.querySelector('input[name="commentsEnabled"]:checked').value === "yes";
  const phoneVisible = document.querySelector('input[name="phoneVisible"]:checked').value === "yes";
  const enteredDesc = document.getElementById("desc").value.trim();

  // ✅ Get user + full user (for avatar)
  const user = DataService.getSession();
  const fullUser = DataService.getCurrentUser();

  if (!enteredDesc) {
    showModal("Please fill in all fields.", "⚠️ Missing Information", "error");
    return;
  }

  if (pendingImageFiles.length === 0) {
    showModal(t("imageRequiredAlert"), "⚠️ Images Required", "error");
    return;
  }

  // ---- Convert images to base64 ----
  const imagePromises = pendingImageFiles.map((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  });

  Promise.all(imagePromises).then((imageDataUrls) => {
    let newListing = null;

    if (sellCategory === "motorcycles") {
      const brandSelVal = document.getElementById("brand").value;
      const brand = brandSelVal === "Other"
        ? document.getElementById("brandOtherInput").value.trim()
        : brandSelVal;
      const modelRaw = document.getElementById("model").value.trim();
      const yearRaw = document.getElementById("year").value;
      const ccRaw = document.getElementById("cc").value;
      const mileageRaw = document.getElementById("mileage").value;
      const colorRaw = document.getElementById("color").value.trim();

      if (!brand) {
        showModal("Please select a brand.", "⚠️ Missing Information", "error");
        return;
      }

      const model = modelRaw || null;
      const year = yearRaw ? Number(yearRaw) : null;
      const cc = ccRaw ? Number(ccRaw) : null;
      const mileage = mileageRaw ? Number(mileageRaw) : null;
      const color = colorRaw || null;

      newListing = {
        id: "U" + Date.now(),
        category: "motorcycles",
        brand: brand, model: model, year: year, cc: cc,
        price: price, mileage: mileage, city: city, color: color,
        condition: condition,
        commentsEnabled: commentsEnabled, phoneVisible: phoneVisible,
        desc: enteredDesc, descAr: enteredDesc,
        variant: Math.floor(Math.random() * 3),
        images: imageDataUrls,
        createdAt: new Date().toISOString(),
        creatorEmail: user ? user.email : null,
        creatorName: user ? user.name : null,
        creatorAvatar: fullUser ? fullUser.avatar : null  // ✅ NEW
      };
    } else if (sellCategory === "parts") {
      const partTitle = document.getElementById("partTitle").value.trim();
      const partType = document.getElementById("partType").value;
      const partBrandSelVal = document.getElementById("partBrand").value;
      const partBrand = partBrandSelVal === "Other"
        ? document.getElementById("partBrandOtherInput").value.trim()
        : partBrandSelVal;

      if (!partTitle || !partType) {
        showModal("Please fill in all fields.", "⚠️ Missing Information", "error");
        return;
      }

      newListing = {
        id: "U" + Date.now(),
        category: "parts",
        title: partTitle, subtitle: partType, brand: partBrand,
        price: price, city: city,
        condition: condition,
        commentsEnabled: commentsEnabled, phoneVisible: phoneVisible,
        desc: enteredDesc, descAr: enteredDesc,
        variant: Math.floor(Math.random() * 3),
        images: imageDataUrls,
        createdAt: new Date().toISOString(),
        creatorEmail: user ? user.email : null,
        creatorName: user ? user.name : null,
        creatorAvatar: fullUser ? fullUser.avatar : null  // ✅ NEW
      };
    } else if (sellCategory === "gear") {
      const gearTitle = document.getElementById("gearTitle").value.trim();
      const gearType = document.getElementById("gearType").value;
      const gearSize = document.getElementById("gearSize").value.trim();

      if (!gearTitle || !gearType) {
        showModal("Please fill in all fields.", "⚠️ Missing Information", "error");
        return;
      }

      let subtitle = gearType;
      if (gearSize) subtitle += ` · Size ${gearSize}`;

      newListing = {
        id: "U" + Date.now(),
        category: "gear",
        title: gearTitle, subtitle: subtitle,
        price: price, city: city,
        condition: condition,
        commentsEnabled: commentsEnabled, phoneVisible: phoneVisible,
        desc: enteredDesc, descAr: enteredDesc,
        variant: Math.floor(Math.random() * 3),
        images: imageDataUrls,
        createdAt: new Date().toISOString(),
        creatorEmail: user ? user.email : null,
        creatorName: user ? user.name : null,
        creatorAvatar: fullUser ? fullUser.avatar : null  // ✅ NEW
      };
    } else if (sellCategory === "services") {
      const serviceTypeSel = document.getElementById("serviceType");
      const serviceType = serviceTypeSel.value;
      const serviceTypeLabel = serviceTypeSel.selectedOptions[0] ? serviceTypeSel.selectedOptions[0].textContent : serviceType;

      if (!serviceType) {
        showModal("Please fill in all fields.", "⚠️ Missing Information", "error");
        return;
      }

      newListing = {
        id: "U" + Date.now(),
        category: "services",
        title: serviceTypeLabel, subtitle: serviceTypeLabel,
        price: price, city: city,
        condition: condition,
        commentsEnabled: commentsEnabled, phoneVisible: phoneVisible,
        desc: enteredDesc, descAr: enteredDesc,
        variant: Math.floor(Math.random() * 3),
        images: imageDataUrls,
        createdAt: new Date().toISOString(),
        creatorEmail: user ? user.email : null,
        creatorName: user ? user.name : null,
        creatorAvatar: fullUser ? fullUser.avatar : null  // ✅ NEW
      };
    }

    if (!newListing) return;

    DataService.saveListing(newListing);

    const toast = document.getElementById("toast");
    toast.textContent = t("toastPublished");
    toast.classList.add("show");

    setTimeout(function() {
      window.location.href = "index.html";
    }, 1200);
  }).catch((err) => {
    console.error("Error reading images:", err);
    showModal("Failed to process images. Please try again.", "Error", "error");
  });
}
