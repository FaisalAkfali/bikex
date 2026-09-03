/* ===========================================================
   Bike X — dashboard.js (COMPLETE)
   =========================================================== */

let currentUser = null;
let allListings = [];
let allUsers = [];

document.addEventListener("DOMContentLoaded", function() {
  translateStaticPage();
  
  currentUser = DataService.getCurrentUser();
  if (!currentUser) {
    window.location.href = "login.html?next=dashboard.html";
    return;
  }
  
  updateUserProfileDisplay();
  setupAvatarUpload();
  
  if (currentUser.role === "admin") {
    document.querySelectorAll(".admin-only").forEach(el => el.style.display = "flex");
  }
  
  loadListings();
  loadDashboardMessages();
  if (currentUser.role === "admin") {
    loadUsers();
    updateAdminStats();
    loadDeletionFeedbackStats();
  }
  
  setupNavigation();
  setupSettingsForm();
  
  document.getElementById("logoutBtn").addEventListener("click", function() {
    DataService.logout();
    window.location.href = "index.html";
  });
  document.getElementById("themeSwitch").addEventListener("click", toggleTheme);
});

function updateUserProfileDisplay() {
  const user = currentUser;
  document.getElementById("userName").textContent = user.name;
  document.getElementById("userEmail").textContent = user.email;
  
  const roleEl = document.getElementById("userRole");
  roleEl.textContent = user.role === "admin" ? "Admin" : "User";
  if (user.role === "admin") {
    roleEl.classList.add("admin");
  }
  
  updateAvatarDisplay(user);
}

function updateAvatarDisplay(user) {
  const avatarContainer = document.getElementById("userAvatar");
  
  if (user && user.avatar) {
    avatarContainer.innerHTML = `<img src="${user.avatar}" alt="${user.name}" class="avatar-img">`;
  } else {
    const initials = getUserInitials(user.name);
    const color = getAvatarColor(user.name);
    avatarContainer.innerHTML = `<span class="avatar-initials" style="background:${color}">${initials}</span>`;
  }
}

function setupAvatarUpload() {
  const uploadBtn = document.getElementById("avatarUploadBtn");
  const fileInput = document.getElementById("avatarInput");
  
  uploadBtn.addEventListener("click", function() {
    fileInput.click();
  });
  
  fileInput.addEventListener("change", function(e) {
    const file = this.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      showModal(
        t("invalidImageType") || "Please select a valid image file.",
        t("invalidFile") || "Invalid File",
        "error",
        "OK",
        false
      );
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      showModal(
        t("imageTooLarge") || "Image size must be less than 2MB.",
        t("fileTooLarge") || "File Too Large",
        "error",
        "OK",
        false
      );
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
      const imageData = event.target.result;
      
      if (DataService.updateUserProfile(currentUser.email, { avatar: imageData })) {
        currentUser = DataService.getCurrentUser();
        updateAvatarDisplay(currentUser);
        renderAuthArea();
        
        showModal(
          t("avatarUpdated") || "Profile picture updated successfully!",
          t("success") || "Success",
          "success",
          "OK",
          false
        );
      } else {
        showModal(
          t("avatarUpdateFailed") || "Failed to update profile picture.",
          t("error") || "Error",
          "error",
          "OK",
          false
        );
      }
    };
    reader.readAsDataURL(file);
    
    this.value = '';
  });
}

function loadListings() {
  allListings = DataService.getAllListings();
  renderUserListings();
  
  if (currentUser.role === "admin") {
    renderAdminListings();
  }
}

function loadUsers() {
  allUsers = DataService.getUsers();
  renderAdminUsers();
}

function updateAdminStats() {
  document.getElementById("totalListings").textContent = allListings.length;
  document.getElementById("totalUsers").textContent = allUsers.length;
  document.getElementById("totalAdmins").textContent = allUsers.filter(u => u.role === "admin").length;
}

function renderUserListings() {
  const container = document.getElementById("userListings");
  
  const stored = JSON.parse(localStorage.getItem("moto_listings") || "[]");
  
  const userListings = stored.filter(listing => {
    if (listing.creatorEmail) {
      return listing.creatorEmail === currentUser.email;
    }
    if (listing.id && listing.id.startsWith("U")) {
      return true;
    }
    return false;
  });
  
  if (userListings.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <h3>${t("noListingsYet")}</h3>
        <p>${t("createFirstListing")}</p>
        <a href="sell.html" class="btn btn-solid" style="margin-top:12px;">+ ${t("addNewListing")}</a>
      </div>
    `;
    return;
  }
  
  container.innerHTML = userListings.map(l => {
    const color = typeof colorFor !== 'undefined' ? colorFor(l.brand) : '#ff5a1f';
    const brandDisplay = typeof brandLabel !== 'undefined' ? brandLabel(l.brand) : l.brand;
    const cityDisplay = typeof cityLabel !== 'undefined' ? cityLabel(l.city) : l.city;
    const conditionText = l.condition === 'new' ? t("conditionNew") : t("conditionUsed");
    const conditionClass = l.condition === 'used' ? 'used' : '';
    
    let mediaContent = '';
    if (l.images && l.images.length > 0) {
      mediaContent = `<img src="${l.images[0]}" alt="${l.year} ${l.brand} ${l.model}" style="width:100%;height:100%;object-fit:cover;">`;
    } else if (typeof bikeSVG !== 'undefined') {
      mediaContent = bikeSVG(color, l.variant || 0);
    } else {
      mediaContent = `<div style="padding:20px;text-align:center;">🏍️</div>`;
    }
    
    const priceDisplay = typeof formatPrice !== 'undefined' ? formatPrice(l.price) : `SAR ${l.price.toLocaleString()}`;
    
    let titleText = '';
    if (l.category === 'motorcycles') {
      titleText = `${l.year || ''} ${brandDisplay} ${l.model || ''}`.trim();
    } else if (l.category === 'parts' || l.category === 'gear') {
      titleText = l.title || l.subtitle || 'Item';
    } else if (l.category === 'services') {
      titleText = l.title || l.subtitle || 'Service';
    } else {
      titleText = l.title || l.subtitle || 'Listing';
    }
    
    let metaParts = [cityDisplay];
    if (l.category === 'parts') metaParts.push(l.subtitle || '');
    else if (l.category === 'gear') metaParts.push(l.subtitle || '');
    else if (l.category === 'services') metaParts.push(l.subtitle || '');
    else if (l.category === 'motorcycles') {
      if (l.cc) metaParts.push(`${l.cc} cc`);
      if (l.color) metaParts.push(l.color);
    }
    metaParts.push(conditionText);
    const metaHTML = metaParts.filter(p => p).map(p => `<span>${p}</span>`).join('<span>&middot;</span>');
    
    const categoryKey = "category" + l.category.charAt(0).toUpperCase() + l.category.slice(1);
    const categoryLabel = t(categoryKey) || l.category;
    
    return `
      <div class="listing-card">
        <div class="card-media" style="background:linear-gradient(160deg, ${color}1a, transparent)">
          ${mediaContent}
          <span class="badge badge-condition ${conditionClass}">${conditionText}</span>
          ${l.images && l.images.length > 1 ? `<span class="badge badge-image-count" style="background:rgba(0,0,0,0.6);bottom:8px;right:8px;left:auto;top:auto;"><i class="fa-solid fa-image" style="color: rgb(255, 122, 61);"></i> ${l.images.length}</span>` : ''}
          <span class="badge badge-category" style="background:#7c3aed;top:8px;">${categoryLabel}</span>
        </div>
        <div class="card-body">
          <div class="card-title">${titleText}</div>
          <div class="card-price mono">${priceDisplay}</div>
          <div class="card-meta">${metaHTML}</div>
          <div class="card-actions">
            <button class="btn btn-edit" onclick="editListing('${l.id}')">✏️ ${t("edit")}</button>
            <button class="btn btn-delete" onclick="deleteListing('${l.id}')">🗑️ ${t("delete")}</button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function renderAdminListings() {
  const container = document.getElementById("adminListings");
  
  if (allListings.length === 0) {
    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><h3>${t("noListings")}</h3></div>`;
    return;
  }
  
  container.innerHTML = allListings.map(l => {
    const color = typeof colorFor !== 'undefined' ? colorFor(l.brand) : '#ff5a1f';
    const brandDisplay = typeof brandLabel !== 'undefined' ? brandLabel(l.brand) : l.brand;
    const cityDisplay = typeof cityLabel !== 'undefined' ? cityLabel(l.city) : l.city;
    const isUserListing = l.id && l.id.startsWith("U");
    const conditionText = l.condition === 'new' ? t("conditionNew") : t("conditionUsed");
    const conditionClass = l.condition === 'used' ? 'used' : '';
    
    let mediaContent = '';
    if (l.images && l.images.length > 0) {
      mediaContent = `<img src="${l.images[0]}" alt="${l.year} ${l.brand} ${l.model}" style="width:100%;height:100%;object-fit:cover;">`;
    } else if (typeof bikeSVG !== 'undefined') {
      mediaContent = bikeSVG(color, l.variant || 0);
    } else {
      mediaContent = `<div style="padding:20px;text-align:center;">🏍️</div>`;
    }
    
    const priceDisplay = typeof formatPrice !== 'undefined' ? formatPrice(l.price) : `SAR ${l.price.toLocaleString()}`;
    
    let titleText = '';
    if (l.category === 'motorcycles') {
      titleText = `${l.year || ''} ${brandDisplay} ${l.model || ''}`.trim();
    } else if (l.category === 'parts' || l.category === 'gear') {
      titleText = l.title || l.subtitle || 'Item';
    } else if (l.category === 'services') {
      titleText = l.title || l.subtitle || 'Service';
    } else {
      titleText = l.title || l.subtitle || 'Listing';
    }
    
    let metaParts = [cityDisplay];
    if (l.category === 'parts') metaParts.push(l.subtitle || '');
    else if (l.category === 'gear') metaParts.push(l.subtitle || '');
    else if (l.category === 'services') metaParts.push(l.subtitle || '');
    else if (l.category === 'motorcycles') {
      if (l.cc) metaParts.push(`${l.cc} cc`);
      if (l.color) metaParts.push(l.color);
    }
    metaParts.push(conditionText);
    const metaHTML = metaParts.filter(p => p).map(p => `<span>${p}</span>`).join('<span>&middot;</span>');
    
    const categoryKey = "category" + l.category.charAt(0).toUpperCase() + l.category.slice(1);
    const categoryLabel = t(categoryKey) || l.category;
    
    return `
      <div class="listing-card">
        <div class="card-media" style="background:linear-gradient(160deg, ${color}1a, transparent)">
          ${mediaContent}
          <span class="badge badge-condition ${conditionClass}">${conditionText}</span>
          ${isUserListing ? '<span class="badge" style="background:#7c3aed;right:8px;left:auto;">User</span>' : ''}
          ${l.images && l.images.length > 1 ? `<span class="badge badge-image-count" style="background:rgba(0,0,0,0.6);bottom:8px;right:8px;left:auto;top:auto;"><i class="fa-solid fa-image" style="color: rgb(255, 122, 61);"></i> ${l.images.length}</span>` : ''}
          <span class="badge badge-category" style="background:#7c3aed;top:8px;">${categoryLabel}</span>
        </div>
        <div class="card-body">
          <div class="card-title">${titleText}</div>
          <div class="card-price mono">${priceDisplay}</div>
          <div class="card-meta">${metaHTML}</div>
          <div class="card-actions">
            <button class="btn btn-edit" onclick="editListing('${l.id}')">✏️ ${t("edit")}</button>
            <button class="btn btn-delete" onclick="deleteListing('${l.id}')">🗑️ ${t("delete")}</button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function renderAdminUsers() {
  const tbody = document.getElementById("adminUsersBody");
  
  if (allUsers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:20px;">${t("noUsers")}</td></tr>`;
    return;
  }
  
  tbody.innerHTML = allUsers.map(u => `
    <tr>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${u.phone || '-'}</td>
      <td><span class="user-role ${u.role === 'admin' ? 'admin' : ''}" style="font-size:0.7rem;padding:2px 10px;">${u.role === 'admin' ? 'Admin' : 'User'}</span></td>
      <td>
        ${u.role === 'admin' ? 
          `<button class="btn btn-remove-admin" onclick="removeAdmin('${u.email}')">${t("removeAdmin")}</button>` :
          `<button class="btn btn-make-admin" onclick="makeAdmin('${u.email}')">${t("makeAdmin")}</button>`
        }
        ${u.email !== 'admin@biikex.sa' ? `<button class="btn btn-delete" onclick="deleteUser('${u.email}')">🗑️</button>` : ''}
      </td>
    </tr>
  `).join("");
}

/* ============================================================
   DELETION FEEDBACK
   ============================================================ */

function deleteListing(id) {
  window._pendingDeleteId = id;
  showDeleteFeedbackModal();
}

function showDeleteFeedbackModal() {
  const overlay = document.getElementById("deleteFeedbackModal");
  if (!overlay) {
    console.error("deleteFeedbackModal not found! Fallback to direct delete.");
    confirmDeletion(window._pendingDeleteId);
    return;
  }
  
  const reasonSelect = document.getElementById("deleteReason");
  const otherWrap = document.getElementById("deleteReasonOtherWrap");
  const otherInput = document.getElementById("deleteReasonOtherInput");
  if (reasonSelect) reasonSelect.value = "";
  if (otherWrap) otherWrap.style.display = "none";
  if (otherInput) otherInput.value = "";
  
  overlay.classList.add("active");
  document.body.style.overflow = "hidden";
  
  if (reasonSelect) {
    reasonSelect.onchange = function() {
      const wrap = document.getElementById("deleteReasonOtherWrap");
      if (this.value === "other") {
        wrap.style.display = "block";
      } else {
        wrap.style.display = "none";
      }
    };
  }
  
  const cancelBtn = document.getElementById("deleteFeedbackCancelBtn");
  if (cancelBtn) {
    cancelBtn.onclick = function() {
      hideFeedbackModal();
      window._pendingDeleteId = null;
    };
  }
  
  const submitBtn = document.getElementById("deleteFeedbackSubmitBtn");
  if (submitBtn) {
    submitBtn.onclick = function() {
      const reason = document.getElementById("deleteReason").value;
      if (!reason) {
        showModal(
          t("deleteFeedbackRequired") || "Please select a reason to delete.",
          "⚠️ " + (t("missingInformation") || "Missing Information"),
          "error",
          "OK",
          false
        );
        return;
      }
      
      let reasonOther = null;
      if (reason === "other") {
        reasonOther = document.getElementById("deleteReasonOtherInput").value.trim();
        if (!reasonOther) {
          showModal(
            t("deleteReasonOtherRequired") || "Please specify your reason.",
            "⚠️ " + (t("missingInformation") || "Missing Information"),
            "error",
            "OK",
            false
          );
          return;
        }
      }
      
      const listing = allListings.find(l => l.id === window._pendingDeleteId);
      if (listing) {
        let listingTitle = '';
        if (listing.category === 'motorcycles') {
          const brandDisplay = typeof brandLabel !== 'undefined' ? brandLabel(listing.brand) : listing.brand;
          listingTitle = `${listing.year || ''} ${brandDisplay || ''} ${listing.model || ''}`.trim() || listing.title || 'Listing';
        } else {
          listingTitle = listing.title || listing.subtitle || 'Listing';
        }
        
        DataService.saveDeletionFeedback({
          listingId: listing.id,
          listingTitle: listingTitle,
          reason: reason,
          reasonOther: reasonOther,
          deletedBy: currentUser ? currentUser.name : 'Unknown'
        });
      }
      
      hideFeedbackModal();
      confirmDeletion(window._pendingDeleteId);
    };
  }
}

function hideFeedbackModal() {
  const overlay = document.getElementById("deleteFeedbackModal");
  if (overlay) overlay.classList.remove("active");
  document.body.style.overflow = "";
}

function confirmDeletion(id) {
  const listing = allListings.find(l => l.id === id);
  if (!listing) {
    hideFeedbackModal();
    return;
  }
  
  if (!listing.id.startsWith("U") && currentUser.role !== "admin") {
    showModal(t("permissionDenied"), t("permissionDenied"), "error", "OK", false);
    window._pendingDeleteId = null;
    hideFeedbackModal();
    return;
  }
  
  if (listing.id.startsWith("U")) {
    if (listing.creatorEmail && listing.creatorEmail !== currentUser.email) {
      showModal(t("permissionDenied"), t("permissionDenied"), "error", "OK", false);
      window._pendingDeleteId = null;
      hideFeedbackModal();
      return;
    }
  }
  
  DataService.deleteListing(id);
  loadListings();
  if (currentUser.role === "admin") updateAdminStats();
  
  window._pendingDeleteId = null;
  hideFeedbackModal();
}

function loadDeletionFeedbackStats() {
  const stats = DataService.getDeletionFeedbackStats();
  const feedbacks = DataService.getDeletionFeedback();
  
  const container = document.getElementById("deletionFeedbackStats");
  if (!container) return;
  
  container.innerHTML = `
    <div class="admin-section">
      <h3>${t("deletionFeedbackTitle") || "Deletion Feedback"}</h3>
      <div class="admin-stats">
        <div class="stat-card">
          <span class="stat-number">${stats.total}</span>
          <span class="stat-label">${t("totalDeletions") || "Total Deletions"}</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">${stats.soldOutside}</span>
          <span class="stat-label">${t("deleteReasonSoldOutside") || "Sold Outside"}</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">${stats.canceled}</span>
          <span class="stat-label">${t("deleteReasonCanceled") || "Canceled"}</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">${stats.other}</span>
          <span class="stat-label">${t("deleteReasonOther") || "Other"}</span>
        </div>
      </div>
      <div style="margin-top:12px; max-height:300px; overflow-y:auto;">
        ${feedbacks.length > 0 ? feedbacks.map(f => `
          <div style="padding:8px 12px; border-bottom:1px solid var(--border); font-size:0.85rem;">
            <strong>${f.listingTitle}</strong>
            <span style="color:var(--muted);">— ${f.reason}</span>
            ${f.reasonOther ? `<span style="color:var(--muted);"> (${f.reasonOther})</span>` : ''}
            <span style="color:var(--muted);font-size:0.7rem;display:block;">${new Date(f.deletedAt).toLocaleDateString()}</span>
          </div>
        `).join('') : '<p style="color:var(--muted);text-align:center;padding:20px;">' + t("noDeletionFeedback") + '</p>'}
      </div>
    </div>
  `;
}

/* ============================================================
   EDIT LISTING (simplified)
   ============================================================ */

function editListing(id) {
  const listing = allListings.find(l => l.id === id);
  if (!listing) return;
  
  if (!listing.id.startsWith("U") && currentUser.role !== "admin") {
    showModal(t("permissionDenied"), t("permissionDenied"), "error", "OK", false);
    return;
  }
  
  if (listing.id.startsWith("U")) {
    if (listing.creatorEmail && listing.creatorEmail !== currentUser.email) {
      showModal(t("permissionDenied"), t("permissionDenied"), "error", "OK", false);
      return;
    }
  }
  
  const overlay = document.getElementById("modalOverlay");
  const modal = document.getElementById("modalContent");
  
  const category = listing.category || 'motorcycles';
  const categoryKey = "category" + category.charAt(0).toUpperCase() + category.slice(1);
  const categoryLabel = t(categoryKey) || category;
  
  let formHtml = '';
  
  const currentRegion = getRegionForCity(listing.city);
  const currentRegionId = currentRegion ? currentRegion.id : '';
  
  let regionOptions = `<option value="">${t("selectRegionDefault")}</option>`;
  if (typeof REGIONS !== 'undefined') {
    REGIONS.forEach(r => {
      const label = getLang() === 'ar' ? r.nameAr : r.nameEn;
      regionOptions += `<option value="${r.id}" ${r.id === currentRegionId ? 'selected' : ''}>${label}</option>`;
    });
  }
  
  let cityOptions = '';
  if (currentRegionId) {
    const cities = getCitiesForRegion(currentRegionId);
    cityOptions = `<option value="" disabled selected>${t("selectCityDefault")}</option>`;
    cities.forEach(c => {
      const displayName = cityLabel(c);
      cityOptions += `<option value="${c}" ${c === listing.city ? 'selected' : ''}>${displayName}</option>`;
    });
  } else {
    cityOptions = `<option value="" disabled selected>${t("selectCityDefault")}</option>`;
  }
  
  let commonFields = `
    <div class="form-row">
      <div class="field">
        <label>${t("labelPriceSar")}</label>
        <input type="number" id="editPrice" value="${listing.price || ''}">
      </div>
      <div class="field">
        <label>${t("labelRegion")}</label>
        <select id="editRegion">
          ${regionOptions}
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="field">
        <label>${t("labelCity")}</label>
        <select id="editCity" ${currentRegionId ? '' : 'disabled'}>
          ${cityOptions}
        </select>
      </div>
      <div class="field">
        <label>${t("labelCondition")}</label>
        <div class="condition-toggle">
          <label><input type="radio" name="editCondition" value="new" ${listing.condition === 'new' ? 'checked' : ''}><span>${t("conditionNew")}</span></label>
          <label><input type="radio" name="editCondition" value="used" ${listing.condition === 'used' ? 'checked' : ''}><span>${t("conditionUsed")}</span></label>
        </div>
      </div>
    </div>
    <div class="form-row full">
      <div class="field">
        <label>${t("labelDescription")}</label>
        <textarea id="editDesc">${listing.desc || ''}</textarea>
      </div>
    </div>
  `;
  
  if (category === 'motorcycles') {
    let brandOptions = '';
    if (typeof BRANDS !== 'undefined') {
      brandOptions = BRANDS.map(b => `<option value="${b}" ${b === listing.brand ? 'selected' : ''}>${brandLabel(b)}</option>`).join('');
      brandOptions += `<option value="Other" ${listing.brand && !BRANDS.includes(listing.brand) ? 'selected' : ''}>${t("brandOther")}</option>`;
    }
    const showOtherBrand = listing.brand && !BRANDS.includes(listing.brand);
    
    formHtml = `
      <div class="form-row">
        <div class="field">
          <label>${t("labelBrand")}</label>
          <select id="editBrand">
            ${brandOptions}
          </select>
          <div id="editBrandOtherWrap" style="${showOtherBrand ? '' : 'display:none;'} margin-top:8px;">
            <label>${t("labelSpecifyBrand")}</label>
            <input type="text" id="editBrandOtherInput" value="${showOtherBrand ? listing.brand : ''}">
          </div>
        </div>
        <div class="field">
          <label>${t("labelModel")}</label>
          <input type="text" id="editModel" value="${listing.model || ''}">
        </div>
      </div>
      <div class="form-row">
        <div class="field">
          <label>${t("labelYear")}</label>
          <input type="number" id="editYear" value="${listing.year || ''}">
        </div>
        <div class="field">
          <label>${t("labelEngineCc")}</label>
          <input type="number" id="editCc" value="${listing.cc || ''}">
        </div>
      </div>
      <div class="form-row">
        <div class="field">
          <label>${t("labelMileageKm")}</label>
          <input type="number" id="editMileage" value="${listing.mileage || ''}">
        </div>
        <div class="field">
          <label>${t("labelColor")}</label>
          <input type="text" id="editColor" value="${listing.color || ''}">
        </div>
      </div>
      ${commonFields}
    `;
  } else if (category === 'parts') {
    let partBrandOptions = '<option value="">Any / Universal</option>';
    if (typeof BRANDS !== 'undefined') {
      BRANDS.forEach(b => {
        partBrandOptions += `<option value="${b}" ${b === listing.brand ? 'selected' : ''}>${brandLabel(b)}</option>`;
      });
      partBrandOptions += `<option value="Other" ${listing.brand && !BRANDS.includes(listing.brand) ? 'selected' : ''}>${t("brandOther")}</option>`;
    }
    const showOtherPartBrand = listing.brand && !BRANDS.includes(listing.brand);
    
    let partTypeOptions = ['Exhaust','Brakes','Drivetrain','Electrical','Bodywork','Luggage','Tires & Wheels','Engine','Suspension','Other'];
    let partTypeSelect = partTypeOptions.map(t => `<option value="${t}" ${t === listing.subtitle ? 'selected' : ''}>${t}</option>`).join('');
    
    formHtml = `
      <div class="form-row">
        <div class="field">
          <label>${t("labelPartTitle")}</label>
          <input type="text" id="editPartTitle" value="${listing.title || ''}">
        </div>
        <div class="field">
          <label>${t("labelPartType")}</label>
          <select id="editPartType">
            ${partTypeSelect}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="field">
          <label>${t("labelPartBrand")}</label>
          <select id="editPartBrand">
            ${partBrandOptions}
          </select>
          <div id="editPartBrandOtherWrap" style="${showOtherPartBrand ? '' : 'display:none;'} margin-top:8px;">
            <label>${t("labelSpecifyBrand")}</label>
            <input type="text" id="editPartBrandOtherInput" value="${showOtherPartBrand ? listing.brand : ''}">
          </div>
        </div>
      </div>
      ${commonFields}
    `;
  } else if (category === 'gear') {
    let gearTypeOptions = ['Helmet','Jacket','Gloves','Boots','Tank Bag','Rain Suit','Electronics','Other'];
    let gearTypeSelect = gearTypeOptions.map(t => `<option value="${t}" ${t === listing.subtitle ? 'selected' : ''}>${t}</option>`).join('');
    
    let gearSize = '';
    if (listing.subtitle && listing.subtitle.includes('· Size ')) {
      gearSize = listing.subtitle.split('· Size ')[1] || '';
    }
    
    formHtml = `
      <div class="form-row">
        <div class="field">
          <label>${t("labelGearTitle")}</label>
          <input type="text" id="editGearTitle" value="${listing.title || ''}">
        </div>
        <div class="field">
          <label>${t("labelGearType")}</label>
          <select id="editGearType">
            ${gearTypeSelect}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="field">
          <label>${t("labelGearSize")}</label>
          <input type="text" id="editGearSize" value="${gearSize}">
        </div>
      </div>
      ${commonFields}
    `;
  } else if (category === 'services') {
    let serviceTypeOptions = ['Towing / Flatbed Recovery','Insurance & Ownership Transfer Offices','Mobile Washing','Parking'];
    let serviceTypeSelect = serviceTypeOptions.map(t => `<option value="${t}" ${t === listing.title ? 'selected' : ''}>${t}</option>`).join('');
    
    formHtml = `
      <div class="form-row">
        <div class="field">
          <label>${t("labelServiceType")}</label>
          <select id="editServiceType">
            ${serviceTypeSelect}
          </select>
        </div>
      </div>
      ${commonFields}
    `;
  }
  
  modal.innerHTML = `
    <div class="modal-head">
      <h2>${t("editListing")} (${categoryLabel})</h2>
      <button class="modal-close" id="modalCloseBtn">&times;</button>
    </div>
    <div class="modal-body" style="grid-template-columns:1fr;">
      <form class="edit-form" id="editForm">
        ${formHtml}
        
        <div class="form-row full" style="margin-top:12px; padding-top:12px; border-top:1px solid var(--border);">
          <div class="field">
            <label data-i18n="labelCommentsToggle">${t("labelCommentsToggle")}</label>
            <div class="condition-toggle">
              <label>
                <input type="radio" name="editCommentsEnabled" value="yes" ${listing.commentsEnabled !== false ? 'checked' : ''}>
                <span>${t("commentsAllowLabel")}</span>
              </label>
              <label>
                <input type="radio" name="editCommentsEnabled" value="no" ${listing.commentsEnabled === false ? 'checked' : ''}>
                <span>${t("commentsDisableLabel")}</span>
              </label>
            </div>
            <div class="field-hint">${t("commentsToggleHint")}</div>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn" onclick="closeModal()">${t("cancelBtn")}</button>
          <button type="submit" class="btn btn-solid">${t("saveChanges")}</button>
        </div>
      </form>
    </div>
  `;
  
  overlay.classList.add("open");
  
  document.getElementById("modalCloseBtn").addEventListener("click", closeModal);
  document.getElementById("editForm").addEventListener("submit", function(e) {
    e.preventDefault();
    saveListingEdit(id);
  });
  
  const regionSelect = document.getElementById("editRegion");
  const citySelect = document.getElementById("editCity");
  
  if (regionSelect && citySelect) {
    regionSelect.addEventListener("change", function() {
      const regionId = this.value;
      if (regionId) {
        const cities = getCitiesForRegion(regionId);
        citySelect.innerHTML = `<option value="" disabled selected>${t("selectCityDefault")}</option>`;
        cities.forEach(c => {
          const displayName = cityLabel(c);
          citySelect.insertAdjacentHTML("beforeend", `<option value="${c}">${displayName}</option>`);
        });
        citySelect.disabled = false;
      } else {
        citySelect.innerHTML = `<option value="" disabled selected>${t("selectCityDefault")}</option>`;
        citySelect.disabled = true;
      }
    });
  }
  
  const brandSelect = document.getElementById("editBrand");
  if (brandSelect) {
    brandSelect.addEventListener("change", function() {
      const wrap = document.getElementById("editBrandOtherWrap");
      if (wrap) wrap.style.display = this.value === "Other" ? "" : "none";
    });
  }
  const partBrandSelect = document.getElementById("editPartBrand");
  if (partBrandSelect) {
    partBrandSelect.addEventListener("change", function() {
      const wrap = document.getElementById("editPartBrandOtherWrap");
      if (wrap) wrap.style.display = this.value === "Other" ? "" : "none";
    });
  }
}

function saveListingEdit(id) {
  const listing = allListings.find(l => l.id === id);
  if (!listing) return;
  
  const category = listing.category || 'motorcycles';
  let updated = {};
  
  const price = document.getElementById("editPrice");
  if (price) updated.price = Number(price.value) || null;
  
  const city = document.getElementById("editCity");
  if (city) updated.city = city.value;
  
  const desc = document.getElementById("editDesc");
  if (desc) updated.desc = desc.value.trim();
  
  const conditionRadios = document.querySelectorAll('input[name="editCondition"]');
  if (conditionRadios.length) {
    const checked = document.querySelector('input[name="editCondition"]:checked');
    if (checked) updated.condition = checked.value;
  }
  
  const commentsEnabledRadio = document.querySelector('input[name="editCommentsEnabled"]:checked');
  if (commentsEnabledRadio) {
    updated.commentsEnabled = commentsEnabledRadio.value === "yes";
  }
  
  if (category === 'motorcycles') {
    const brandSel = document.getElementById("editBrand");
    let brand = brandSel.value;
    if (brand === "Other") {
      brand = document.getElementById("editBrandOtherInput").value.trim();
    }
    updated.brand = brand;
    
    const model = document.getElementById("editModel");
    if (model) updated.model = model.value.trim();
    
    const year = document.getElementById("editYear");
    if (year) updated.year = Number(year.value) || null;
    
    const cc = document.getElementById("editCc");
    if (cc) updated.cc = Number(cc.value) || null;
    
    const mileage = document.getElementById("editMileage");
    if (mileage) updated.mileage = Number(mileage.value) || null;
    
    const color = document.getElementById("editColor");
    if (color) updated.color = color.value.trim();
  } else if (category === 'parts') {
    const title = document.getElementById("editPartTitle");
    if (title) updated.title = title.value.trim();
    
    const partType = document.getElementById("editPartType");
    if (partType) updated.subtitle = partType.value;
    
    const partBrandSel = document.getElementById("editPartBrand");
    let partBrand = partBrandSel.value;
    if (partBrand === "Other") {
      partBrand = document.getElementById("editPartBrandOtherInput").value.trim();
    }
    updated.brand = partBrand;
  } else if (category === 'gear') {
    const title = document.getElementById("editGearTitle");
    if (title) updated.title = title.value.trim();
    
    const gearType = document.getElementById("editGearType");
    const gearSize = document.getElementById("editGearSize");
    let subtitle = gearType.value;
    if (gearSize && gearSize.value.trim()) {
      subtitle += ` · Size ${gearSize.value.trim()}`;
    }
    updated.subtitle = subtitle;
  } else if (category === 'services') {
    const serviceType = document.getElementById("editServiceType");
    if (serviceType) {
      updated.title = serviceType.value;
      updated.subtitle = serviceType.value;
    }
  }
  
  if (listing.id.startsWith("U")) {
    DataService.updateListing(id, updated);
  } else if (currentUser.role === "admin") {
    showModal("Seed listing updated (will reset on page refresh).", "Info", "success", "OK", false);
  }
  
  closeModal();
  loadListings();
  if (currentUser.role === "admin") updateAdminStats();
}

/* ---------- ADMIN FUNCTIONS ---------- */
function makeAdmin(email) {
  showModal(
    t("confirmMakeAdminMessage").replace('{email}', email),
    t("confirmActionTitle"),
    "warning",
    t("confirmDeleteConfirm"),
    t("confirmDeleteCancel")
  );
  
  window._pendingAdminEmail = email;
  
  let okBtn = document.getElementById('modalOkBtn');
  if (!okBtn) return;
  const newOkBtn = okBtn.cloneNode(true);
  okBtn.parentNode.replaceChild(newOkBtn, okBtn);
  
  newOkBtn.addEventListener('click', function() {
    const email = window._pendingAdminEmail;
    if (!email) return;
    
    let users = DataService.getUsers();
    const index = users.findIndex(u => u.email === email);
    if (index !== -1) {
      users[index].role = "admin";
      localStorage.setItem("moto_users", JSON.stringify(users));
      loadUsers();
      updateAdminStats();
      showModal(
        `${email} ${t("isNowAdmin")}`,
        t("success"),
        "success",
        "OK",
        false
      );
    }
    window._pendingAdminEmail = null;
    hideModal();
  });
}

function removeAdmin(email) {
  if (email === "admin@biikex.sa") {
    showModal(t("actionBlocked"), t("actionBlocked"), "error", "OK", false);
    return;
  }
  
  showModal(
    t("confirmRemoveAdminMessage").replace('{email}', email),
    t("confirmActionTitle"),
    "warning",
    t("confirmDeleteConfirm"),
    t("confirmDeleteCancel")
  );
  
  window._pendingAdminEmail = email;
  
  let okBtn = document.getElementById('modalOkBtn');
  if (!okBtn) return;
  const newOkBtn = okBtn.cloneNode(true);
  okBtn.parentNode.replaceChild(newOkBtn, okBtn);
  
  newOkBtn.addEventListener('click', function() {
    const email = window._pendingAdminEmail;
    if (!email) return;
    
    let users = DataService.getUsers();
    const index = users.findIndex(u => u.email === email);
    if (index !== -1) {
      users[index].role = "user";
      localStorage.setItem("moto_users", JSON.stringify(users));
      loadUsers();
      updateAdminStats();
      showModal(
        `${email} ${t("isNowUser")}`,
        t("success"),
        "success",
        "OK",
        false
      );
    }
    window._pendingAdminEmail = null;
    hideModal();
  });
}

function deleteUser(email) {
  if (email === "admin@biikex.sa") {
    showModal(t("actionBlocked"), t("actionBlocked"), "error", "OK", false);
    return;
  }
  
  showModal(
    t("confirmDeleteUserMessage").replace('{email}', email),
    t("confirmDeleteTitle"),
    "error",
    t("confirmDeleteConfirm"),
    t("confirmDeleteCancel")
  );
  
  window._pendingDeleteUserEmail = email;
  
  let okBtn = document.getElementById('modalOkBtn');
  if (!okBtn) return;
  const newOkBtn = okBtn.cloneNode(true);
  okBtn.parentNode.replaceChild(newOkBtn, okBtn);
  
  newOkBtn.addEventListener('click', function() {
    const email = window._pendingDeleteUserEmail;
    if (!email) return;
    
    let users = JSON.parse(localStorage.getItem("moto_users") || "[]");
    users = users.filter(u => u.email !== email);
    localStorage.setItem("moto_users", JSON.stringify(users));
    loadUsers();
    updateAdminStats();
    showModal(
      `${email} ${t("userDeleted")}`,
      t("success"),
      "success",
      "OK",
      false
    );
    window._pendingDeleteUserEmail = null;
    hideModal();
  });
}

/* ---------- SETTINGS FORM ---------- */
function setupSettingsForm() {
  const form = document.getElementById("settingsForm");
  
  document.getElementById("settingsName").value = currentUser.name;
  document.getElementById("settingsPhone").value = currentUser.phone || "";
  document.getElementById("settingsEmail").value = currentUser.email;
  
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    
    const name = document.getElementById("settingsName").value.trim();
    const phone = document.getElementById("settingsPhone").value.trim();
    const password = document.getElementById("settingsPassword").value;
    const confirmPassword = document.getElementById("settingsConfirmPassword").value;
    const messageEl = document.getElementById("settingsMessage");
    
    if (!name) {
      showSettingsMessage("Please enter your name.", "error");
      return;
    }
    
    if (password && password !== confirmPassword) {
      showSettingsMessage("Passwords don't match.", "error");
      return;
    }
    
    const updates = { name, phone };
    if (password) {
      updates.password = password;
    }
    
    if (DataService.updateUserProfile(currentUser.email, updates)) {
      currentUser = DataService.getCurrentUser();
      document.getElementById("userName").textContent = currentUser.name;
      showSettingsMessage("Settings saved successfully!", "success");
      
      document.getElementById("settingsPassword").value = "";
      document.getElementById("settingsConfirmPassword").value = "";
      
      renderAuthArea();
    } else {
      showSettingsMessage("Failed to update profile.", "error");
    }
  });
}

function showSettingsMessage(msg, type) {
  const el = document.getElementById("settingsMessage");
  el.textContent = msg;
  el.className = "settings-message " + type;
  setTimeout(() => {
    el.className = "settings-message";
  }, 5000);
}

function setupNavigation() {
  document.querySelectorAll(".nav-btn[data-tab]").forEach(btn => {
    btn.addEventListener("click", function() {
      const tab = this.dataset.tab;
      
      document.querySelectorAll(".nav-btn[data-tab]").forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      
      document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
      document.getElementById("tab-" + tab).classList.add("active");
      
      if (tab === "messages") {
        loadDashboardMessages();
      }
    });
  });
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("modalOverlay").addEventListener("click", function(e) {
    if (e.target === this) closeModal();
  });
});

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("moto_theme", next);
}

function loadDashboardMessages() {
  const container = document.getElementById("dashboardMessages");
  const badge = document.getElementById("messagesCountBadge");
  
  if (!container) return;

  const currentUser = DataService.getSession();
  if (!currentUser) {
    container.innerHTML = `<div class="empty-state">Please log in to see messages.</div>`;
    return;
  }

  let allMessages = DataService.getMessages();
  
  const conversations = {};
  allMessages.forEach(msg => {
    if (msg.from === currentUser.email || msg.to === currentUser.email) {
      const key = msg.listingId;
      if (!conversations[key] || new Date(msg.timestamp) > new Date(conversations[key].timestamp)) {
        conversations[key] = msg;
      }
    }
  });

  const convList = Object.values(conversations).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (badge) badge.textContent = `${convList.length} conversation${convList.length !== 1 ? 's' : ''}`;

  if (convList.length === 0) {
    container.innerHTML = `<div class="empty-state">
      <h3>No messages yet</h3>
      <p>Browse listings and start a conversation!</p>
      <a href="index.html" class="btn btn-solid" style="margin-top:10px;">Browse Listings</a>
    </div>`;
    return;
  }

  let allListings = DataService.getAllListings();

  container.innerHTML = convList.map(msg => {
    const listing = allListings.find(l => l.id === msg.listingId);
    const otherUser = msg.from === currentUser.email ? msg.to : msg.from;
    const otherUserName = msg.from === currentUser.email ? msg.toName || msg.to : msg.fromName || msg.from;
    const unreadCount = allMessages.filter(m => 
      m.listingId === msg.listingId && 
      m.to === currentUser.email && 
      !m.read
    ).length;

    let listingInfo = '';
    if (listing) {
      const brandDisplay = typeof brandLabel !== 'undefined' ? brandLabel(listing.brand) : listing.brand;
      if (listing.category === 'motorcycles') {
        listingInfo = `${listing.year || ''} ${brandDisplay || ''} ${listing.model || ''}`.trim() || listing.title || 'Listing';
      } else {
        listingInfo = listing.title || listing.subtitle || 'Listing';
      }
    } else {
      listingInfo = 'Listing';
    }

    return `
      <div class="dashboard-message-item" onclick="window.location.href='listing.html?id=${msg.listingId}&chat=${otherUser}'">
        <div class="dashboard-msg-avatar">${otherUserName.charAt(0).toUpperCase()}</div>
        <div class="dashboard-msg-content">
          <div class="dashboard-msg-name">${otherUserName} <span class="dashboard-msg-listing">${listingInfo}</span></div>
          <div class="dashboard-msg-preview">${msg.message.substring(0, 50)}${msg.message.length > 50 ? '...' : ''}</div>
          <div class="dashboard-msg-date">${new Date(msg.timestamp).toLocaleDateString()}</div>
        </div>
        ${unreadCount > 0 ? `<span class="dashboard-msg-badge">${unreadCount}</span>` : ''}
      </div>
    `;
  }).join('');
}
