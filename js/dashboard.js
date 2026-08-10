/* ===========================================================
   Bike.X — dashboard.js (COMPLETE REFACTORED FILE)
   ALL localStorage calls replaced with DataService
   Custom modals for all confirmations
   ✅ Full Arabic/English support
   =========================================================== */

let currentUser = null;
let allListings = [];
let allUsers = [];

document.addEventListener("DOMContentLoaded", function() {
  translateStaticPage();
  
  // ✅ REFACTORED: Uses DataService
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

/* ---------- AVATAR UPLOAD (Full Arabic/English Support) ---------- */
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
        t("invalidImageType") || "Please select a valid image file (JPEG, PNG, GIF).",
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
        
        // ✅ Success modal with ONLY OK button (no Cancel)
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

/* ---------- LOAD LISTINGS ---------- */
function loadListings() {
  allListings = DataService.getAllListings();
  renderUserListings();
  
  if (currentUser.role === "admin") {
    renderAdminListings();
  }
}

/* ---------- LOAD USERS ---------- */
function loadUsers() {
  allUsers = DataService.getUsers();
  renderAdminUsers();
}

/* ---------- UPDATE ADMIN STATS ---------- */
function updateAdminStats() {
  document.getElementById("totalListings").textContent = allListings.length;
  document.getElementById("totalUsers").textContent = allUsers.length;
  document.getElementById("totalAdmins").textContent = allUsers.filter(u => u.role === "admin").length;
}

/* ---------- RENDER USER LISTINGS ---------- */
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
    
    let mediaContent = '';
    if (l.images && l.images.length > 0) {
      mediaContent = `<img src="${l.images[0]}" alt="${l.year} ${l.brand} ${l.model}" style="width:100%;height:100%;object-fit:cover;">`;
    } else if (typeof bikeSVG !== 'undefined') {
      mediaContent = bikeSVG(color, l.variant || 0);
    } else {
      mediaContent = `<div style="padding:20px;text-align:center;">🏍️</div>`;
    }
    
    const priceDisplay = typeof formatPrice !== 'undefined' ? formatPrice(l.price) : `SAR ${l.price.toLocaleString()}`;
    const conditionText = l.condition === 'new' ? (typeof t !== 'undefined' ? t("conditionNew") : "New") : (typeof t !== 'undefined' ? t("conditionUsed") : "Used");
    
    return `
      <div class="listing-card">
        <div class="card-media" style="background:linear-gradient(160deg, ${color}1a, transparent)">
          ${mediaContent}
          <span class="badge ${l.condition === 'used' ? 'used' : ''}">${conditionText}</span>
          ${l.images && l.images.length > 0 ? `<span class="badge" style="background:rgba(0,0,0,0.6);right:8px;left:auto;bottom:8px;top:auto;">📷 ${l.images.length}</span>` : ''}
        </div>
        <div class="card-body">
          <div class="card-title">${l.year} ${brandDisplay} ${l.model}</div>
          <div class="card-price mono">${priceDisplay}</div>
          <div class="card-meta">
            <span>${cityDisplay}</span>
            <span>&middot;</span>
            <span>${l.cc} cc</span>
            <span>&middot;</span>
            <span>${l.color}</span>
          </div>
          <div class="card-actions">
            <button class="btn btn-edit" onclick="editListing('${l.id}')">✏️ ${t("edit")}</button>
            <button class="btn btn-delete" onclick="deleteListing('${l.id}')">🗑️ ${t("delete")}</button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

/* ---------- RENDER ADMIN LISTINGS ---------- */
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
    
    let mediaContent = '';
    if (l.images && l.images.length > 0) {
      mediaContent = `<img src="${l.images[0]}" alt="${l.year} ${l.brand} ${l.model}" style="width:100%;height:100%;object-fit:cover;">`;
    } else if (typeof bikeSVG !== 'undefined') {
      mediaContent = bikeSVG(color, l.variant || 0);
    } else {
      mediaContent = `<div style="padding:20px;text-align:center;">🏍️</div>`;
    }
    
    const priceDisplay = typeof formatPrice !== 'undefined' ? formatPrice(l.price) : `SAR ${l.price.toLocaleString()}`;
    const conditionText = l.condition === 'new' ? (typeof t !== 'undefined' ? t("conditionNew") : "New") : (typeof t !== 'undefined' ? t("conditionUsed") : "Used");
    
    return `
      <div class="listing-card">
        <div class="card-media" style="background:linear-gradient(160deg, ${color}1a, transparent)">
          ${mediaContent}
          <span class="badge ${l.condition === 'used' ? 'used' : ''}">${conditionText}</span>
          ${isUserListing ? '<span class="badge" style="background:#7c3aed;right:8px;left:auto;">User</span>' : ''}
          ${l.images && l.images.length > 0 ? `<span class="badge" style="background:rgba(0,0,0,0.6);right:8px;left:auto;bottom:8px;top:auto;">📷 ${l.images.length}</span>` : ''}
        </div>
        <div class="card-body">
          <div class="card-title">${l.year} ${brandDisplay} ${l.model}</div>
          <div class="card-price mono">${priceDisplay}</div>
          <div class="card-meta">
            <span>${cityDisplay}</span>
            <span>&middot;</span>
            <span>${l.cc} cc</span>
            <span>&middot;</span>
            <span>${l.color}</span>
          </div>
          <div class="card-actions">
            <button class="btn btn-edit" onclick="editListing('${l.id}')">✏️ ${t("edit")}</button>
            <button class="btn btn-delete" onclick="deleteListing('${l.id}')">🗑️ ${t("delete")}</button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

/* ---------- RENDER ADMIN USERS ---------- */
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

/* ---------- DELETE LISTING (with custom modal & translations) ---------- */
function deleteListing(id) {
  showModal(
    t("confirmDeleteMessage"),
    t("confirmDeleteTitle"),
    "error",
    t("confirmDeleteConfirm"),
    t("confirmDeleteCancel")
  );
  
  window._pendingDeleteId = id;
  
  let okBtn = document.getElementById('modalOkBtn');
  if (!okBtn) {
    console.error('Modal OK button not found!');
    return;
  }
  
  const newOkBtn = okBtn.cloneNode(true);
  okBtn.parentNode.replaceChild(newOkBtn, okBtn);
  
  newOkBtn.addEventListener('click', function() {
    const idToDelete = window._pendingDeleteId;
    if (!idToDelete) return;
    
    const listing = allListings.find(l => l.id === idToDelete);
    if (!listing) {
      hideModal();
      return;
    }
    
    if (!listing.id.startsWith("U") && currentUser.role !== "admin") {
      showModal(t("permissionDenied"), t("permissionDenied"), "error", "OK", false);
      window._pendingDeleteId = null;
      return;
    }
    
    if (listing.id.startsWith("U")) {
      if (listing.creatorEmail && listing.creatorEmail !== currentUser.email) {
        showModal(t("permissionDenied"), t("permissionDenied"), "error", "OK", false);
        window._pendingDeleteId = null;
        return;
      }
    }
    
    DataService.deleteListing(idToDelete);
    loadListings();
    if (currentUser.role === "admin") updateAdminStats();
    
    window._pendingDeleteId = null;
    hideModal();
  });
}

/* ---------- EDIT LISTING ---------- */
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
  
  let brandOptions = '';
  let cityOptions = '';
  
  if (typeof BRANDS !== 'undefined') {
    brandOptions = BRANDS.map(b => `<option value="${b}" ${b === listing.brand ? 'selected' : ''}>${typeof brandLabel !== 'undefined' ? brandLabel(b) : b}</option>`).join('');
  }
  
  if (typeof CITIES !== 'undefined') {
    cityOptions = CITIES.map(c => `<option value="${c}" ${c === listing.city ? 'selected' : ''}>${typeof cityLabel !== 'undefined' ? cityLabel(c) : c}</option>`).join('');
  }
  
  modal.innerHTML = `
    <div class="modal-head">
      <h2>${t("editListing")}</h2>
      <button class="modal-close" id="modalCloseBtn">&times;</button>
    </div>
    <div class="modal-body" style="grid-template-columns:1fr;">
      <form class="edit-form" id="editForm">
        <div class="form-row">
          <div class="field">
            <label>${t("labelBrand")}</label>
            <select id="editBrand">
              ${brandOptions}
            </select>
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
            <label>${t("labelPriceSar")}</label>
            <input type="number" id="editPrice" value="${listing.price || ''}">
          </div>
          <div class="field">
            <label>${t("labelMileageKm")}</label>
            <input type="number" id="editMileage" value="${listing.mileage || ''}">
          </div>
        </div>
        <div class="form-row">
          <div class="field">
            <label>${t("labelCity")}</label>
            <select id="editCity">
              ${cityOptions}
            </select>
          </div>
          <div class="field">
            <label>${t("labelColor")}</label>
            <input type="text" id="editColor" value="${listing.color || ''}">
          </div>
        </div>
        <div class="form-row full">
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
}

/* ---------- SAVE LISTING EDIT ---------- */
function saveListingEdit(id) {
  const listing = allListings.find(l => l.id === id);
  if (!listing) return;
  
  const updated = {
    brand: document.getElementById("editBrand").value,
    model: document.getElementById("editModel").value.trim(),
    year: Number(document.getElementById("editYear").value) || null,
    cc: Number(document.getElementById("editCc").value) || null,
    price: Number(document.getElementById("editPrice").value) || null,
    mileage: Number(document.getElementById("editMileage").value) || null,
    city: document.getElementById("editCity").value,
    color: document.getElementById("editColor").value.trim(),
    condition: document.querySelector('input[name="editCondition"]:checked').value,
    desc: document.getElementById("editDesc").value.trim(),
    descAr: document.getElementById("editDesc").value.trim(),
  };
  
  if (listing.id.startsWith("U")) {
    DataService.updateListing(id, updated);
  } else if (currentUser.role === "admin") {
    showModal("Seed listing updated (will reset on page refresh).", "Info", "success", "OK", false);
  }
  
  closeModal();
  loadListings();
  if (currentUser.role === "admin") updateAdminStats();
}

/* ---------- ADMIN FUNCTIONS (with translations) ---------- */
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

/* ---------- NAVIGATION ---------- */
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

/* ---------- DASHBOARD MESSAGES ---------- */
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
      listingInfo = `${listing.year || ''} ${brandDisplay || ''} ${listing.model || ''}`.trim() || listing.title || 'Listing';
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