/* ===========================================================
   Bike.X — listing.js (COMPLETE REFACTORED)
   All data now flows through DataService
   ✅ Phone visibility toggle
   ✅ Chat enable/disable toggle
   ✅ Both buttons hide when disabled
   =========================================================== */

let currentListing = null;
let currentImages = [];
let currentImageIndex = 0;
let comments = [];

/* ---------- FALLBACK SVG (if no image) ---------- */
function fallbackListingSVG(listing) {
  const category = listing.category || "motorcycles";
  const color = typeof colorFor !== 'undefined' ? colorFor(listing.brand || "") : '#ff5a1f';

  if (category !== "motorcycles") {
    const iconSvg = typeof categoryIconSVG !== 'undefined' ? categoryIconSVG(category, 64) : '';
    const svg = `<svg viewBox="0 0 290 170" xmlns="http://www.w3.org/2000/svg">
      <rect width="290" height="170" fill="${color}0d"/>
      <g transform="translate(113,53)" style="color:${color}">${iconSvg}</g>
    </svg>`;
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }

  const v = listing.variant || 0;
  let svg = '';

  if (typeof bikeSVG !== 'undefined') {
    svg = bikeSVG(color, v);
  } else {
    svg = `<svg viewBox="0 0 290 170" xmlns="http://www.w3.org/2000/svg">
      <circle cx="65" cy="120" r="32" stroke="${color}" stroke-width="6" fill="none"/>
      <circle cx="235" cy="120" r="32" stroke="${color}" stroke-width="6" fill="none"/>
      <rect x="70" y="70" width="150" height="40" fill="${color}" opacity="0.3" rx="10"/>
    </svg>`;
  }

  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

/* ---------- DOM READY ---------- */
document.addEventListener("DOMContentLoaded", function() {
  translateStaticPage();
  setupMobileMenu();
  
  const params = new URLSearchParams(window.location.search);
  const listingId = params.get("id");
  
  if (!listingId) {
    window.location.href = "index.html";
    return;
  }
  
  loadListing(listingId);
  setupLightbox();
  setupCommentForm();
});

/* ---------- LOAD LISTING ---------- */
function loadListing(id) {
  try {
    const allListings = DataService.getAllListings();
    const listing = allListings.find(l => l.id === id);
    
    if (!listing) {
      document.getElementById("listingLoading").innerHTML = `
        <div class="error-state">
          <h2>Listing not found</h2>
          <p>The motorcycle listing you're looking for doesn't exist.</p>
          <a href="index.html" class="btn btn-solid">← Back to listings</a>
        </div>
      `;
      return;
    }
    
    currentListing = listing;
    loadComments(id);
    renderListing(listing);
    
  } catch (error) {
    console.error("Error loading listing:", error);
    document.getElementById("listingLoading").innerHTML = `
      <div class="error-state">
        <h2>Error loading listing</h2>
        <p>There was a problem loading this listing. Please try again.</p>
        <a href="index.html" class="btn btn-solid">← Back to listings</a>
      </div>
    `;
  }
}

/* ---------- RENDER LISTING ---------- */
function renderListing(listing) {
  // Hide loading, show content
  document.getElementById("listingLoading").style.display = "none";
  document.getElementById("listingContent").style.display = "block";

  // ============================================================
  // COMMENTS SECTION (with disabled message)
  // ============================================================
  const commentsSection = document.getElementById("commentsSection");
  const commentsList = document.getElementById("commentsList");
  const commentFormWrapper = document.querySelector(".comment-form-wrapper");
  const commentForm = document.getElementById("commentForm");

  if (commentsSection) {
    if (listing.commentsEnabled === false) {
      // Show disabled message
      commentsSection.style.display = "block";
      if (commentsList) {
        commentsList.innerHTML = `
          <div class="comment-disabled">
            <i class="fas fa-comment-slash" style="font-size:28px;color:var(--muted);display:block;margin-bottom:10px;"></i>
            <p style="color:var(--muted);font-size:0.95rem;margin:0;">
              ${t("commentsDisabled") || "Comments are disabled by the seller."}
            </p>
          </div>
        `;
      }
      // Hide the comment form
      if (commentFormWrapper) {
        commentFormWrapper.style.display = "none";
      }
    } else {
      commentsSection.style.display = "block";
      // Render normal comments
      renderComments();
      // Show the comment form
      if (commentFormWrapper) {
        commentFormWrapper.style.display = "block";
      }
      if (commentForm) {
        commentForm.style.display = "flex";
      }
    }
  }

  // ============================================================
  // CATEGORY & BASIC INFO
  // ============================================================
  const category = listing.category || "motorcycles";
  const cityDisplay = typeof cityLabel !== 'undefined' ? cityLabel(listing.city) : listing.city;
  const isNew = listing.condition === 'new';
  const conditionText = isNew ? (typeof t !== 'undefined' ? t("conditionNew") : "New") : (typeof t !== 'undefined' ? t("conditionUsed") : "Used");

  // ============================================================
  // NON-MOTORCYCLE CATEGORIES (Parts / Gear / Services)
  // ============================================================
  if (category !== "motorcycles") {
    // ---- Parts / Gear & Accessories / Services ----
    const titleText = listing.title || "Listing";
    document.getElementById("listingTitle").textContent = titleText;
    document.title = `${titleText} — Bike.X`;

    const priceDisplay = typeof formatPrice !== 'undefined' ? formatPrice(listing.price) : `SAR ${listing.price.toLocaleString()}`;
    document.getElementById("listingPrice").textContent = category === "services"
      ? `${typeof t !== 'undefined' ? t("fromPricePrefix") : "From"} ${priceDisplay}`
      : priceDisplay;

    if (listing.condition) {
      document.getElementById("listingCondition").textContent = conditionText;
      document.getElementById("listingCondition").className = `listing-condition ${listing.condition}`;
    } else {
      document.getElementById("listingCondition").style.display = "none";
    }

    // Hide motorcycle-only spec rows
    ["detailBrandRow", "detailModelRow", "detailYearRow", "detailEngineRow", "detailMileageRow", "detailColorRow"].forEach(id => {
      const row = document.getElementById(id);
      if (row) row.style.display = "none";
    });

    document.getElementById("detailCity").textContent = cityDisplay;
    if (listing.condition) {
      document.getElementById("detailCondition").textContent = conditionText;
    } else {
      const row = document.getElementById("detailConditionRow");
      if (row) row.style.display = "none";
    }

    if (listing.subtitle) {
      const typeRow = document.getElementById("detailTypeRow");
      if (typeRow) typeRow.style.display = "";
      document.getElementById("detailType").textContent = listing.subtitle;
    }
  } else {
    // ============================================================
    // MOTORCYCLES
    // ============================================================
    let brandDisplay = listing.brand;
    if (typeof brandLabel !== 'undefined') {
      brandDisplay = brandLabel(listing.brand);
    }

    const titleParts = [listing.year, brandDisplay, listing.model].filter(Boolean);
    const titleText = titleParts.join(" ") || brandDisplay;
    document.getElementById("listingTitle").textContent = titleText;
    document.title = `${titleText} — Bike.X`;

    const priceDisplay = typeof formatPrice !== 'undefined' ? formatPrice(listing.price) : `SAR ${listing.price.toLocaleString()}`;
    document.getElementById("listingPrice").textContent = priceDisplay;

    document.getElementById("listingCondition").textContent = conditionText;
    document.getElementById("listingCondition").className = `listing-condition ${listing.condition}`;

    document.getElementById("detailBrand").textContent = brandDisplay;

    if (listing.model) {
      document.getElementById("detailModel").textContent = listing.model;
    } else {
      const row = document.getElementById("detailModelRow");
      if (row) row.style.display = "none";
    }

    if (listing.year) {
      document.getElementById("detailYear").textContent = listing.year;
    } else {
      const row = document.getElementById("detailYearRow");
      if (row) row.style.display = "none";
    }

    if (listing.cc) {
      document.getElementById("detailEngine").textContent = `${listing.cc} cc`;
    } else {
      const row = document.getElementById("detailEngineRow");
      if (row) row.style.display = "none";
    }

    const kmUnit = typeof t !== 'undefined' ? t("kmUnit") : "km";
    if (listing.mileage !== null && listing.mileage !== undefined) {
      document.getElementById("detailMileage").textContent = `${listing.mileage.toLocaleString()} ${kmUnit}`;
    } else {
      const row = document.getElementById("detailMileageRow");
      if (row) row.style.display = "none";
    }

    if (listing.color) {
      document.getElementById("detailColor").textContent = listing.color;
    } else {
      const row = document.getElementById("detailColorRow");
      if (row) row.style.display = "none";
    }

    if (listing.city) {
      document.getElementById("detailCity").textContent = cityDisplay;
    } else {
      const row = document.getElementById("detailCityRow");
      if (row) row.style.display = "none";
    }

    document.getElementById("detailCondition").textContent = conditionText;
  }

  // ============================================================
  // DESCRIPTION
  // ============================================================
  const lang = typeof getLang !== 'undefined' ? getLang() : 'en';
  const desc = (lang === 'ar' && listing.descAr) ? listing.descAr : listing.desc;
  document.getElementById("listingDescription").textContent = desc || "No description provided.";

  // ============================================================
  // SELLER SECTION (COMPLETE FIXED)
  // ============================================================
  const isUserListing = listing.id.startsWith("U");
  const sellerName = isUserListing ? "Private Seller" : "Dealer";
  document.getElementById("sellerName").textContent = sellerName;
  
  // Set avatar background color
  const avatarColor = getAvatarColor(sellerName);
  document.getElementById("sellerAvatar").style.background = avatarColor;
  document.getElementById("sellerAvatar").textContent = sellerName.charAt(0);
  
  // ---- Phone visibility ----
  const sellerPhone = isUserListing ? (listing.creatorPhone || "+966 5X XXX XXXX") : "+966 5X XXX XXXX";
  const phoneVisible = listing.phoneVisible !== false; // Default: true (show phone)

  // ---- Chat enabled ----
  const chatEnabled = listing.chatEnabled !== false; // Default: true (chat enabled)

  const contactBtn = document.getElementById("contactSellerBtn");
  const chatBtn = document.getElementById("chatSellerBtn");
  const sellerContact = document.getElementById("sellerContact");
  const phoneStatus = document.getElementById("phoneStatus");
  const contactPhone = document.getElementById("contactPhone");
  const buttonContainer = document.querySelector('.listing-seller .buttons-row');

  // ---- Handle Contact/Phone button ----
  if (!phoneVisible) {
    // Hide the contact button
    if (contactBtn) contactBtn.style.display = "none";
    // Show status message
    if (phoneStatus) {
      phoneStatus.textContent = "📵 " + (t("phoneHiddenDesc") || "Phone number hidden by seller");
      phoneStatus.style.color = "var(--muted)";
    }
    if (contactPhone) {
      contactPhone.textContent = t("phoneHidden") || "Phone hidden by seller";
      contactPhone.style.color = "var(--muted)";
      contactPhone.style.fontStyle = "italic";
    }
  } else {
    // Show the contact button
    if (contactBtn) {
      contactBtn.style.display = "flex";
      // Remove old listeners by cloning
      const newContactBtn = contactBtn.cloneNode(true);
      contactBtn.parentNode.replaceChild(newContactBtn, contactBtn);
      newContactBtn.addEventListener("click", function() {
        if (sellerContact.style.display === "none" || sellerContact.style.display === "") {
          sellerContact.style.display = "block";
          this.textContent = typeof t !== 'undefined' ? t("hideContact") : "Hide Contact Details";
        } else {
          sellerContact.style.display = "none";
          this.textContent = typeof t !== 'undefined' ? t("showContact") : "Show Contact Details";
        }
      });
    }
    if (contactPhone) {
      contactPhone.textContent = sellerPhone;
      contactPhone.style.color = "";
      contactPhone.style.fontStyle = "";
    }
    if (phoneStatus) {
      phoneStatus.textContent = "";
    }
  }

  // ---- Handle Chat button ----
  if (!chatEnabled && chatBtn) {
    chatBtn.style.display = "none";
  } else if (chatBtn) {
    chatBtn.style.display = "flex";
    // Remove old listeners by cloning
    const newChatBtn = chatBtn.cloneNode(true);
    chatBtn.parentNode.replaceChild(newChatBtn, chatBtn);
    newChatBtn.addEventListener("click", function() {
      const user = DataService.getSession();
      if (!user) {
        window.location.href = `login.html?next=listing.html?id=${listing.id}`;
        return;
      }
      openChatModal(listing);
    });
  }

  // ---- If both buttons are disabled, hide the entire button row ----
  if (buttonContainer) {
    const contactVisible = phoneVisible && contactBtn !== null;
    const chatVisible = chatEnabled && chatBtn !== null;
    if (!contactVisible && !chatVisible) {
      buttonContainer.style.display = "none";
    } else {
      buttonContainer.style.display = "flex";
      // If only one button is visible, make it full width
      const visibleBtns = buttonContainer.querySelectorAll('.btn:not([style*="display: none"])');
      if (visibleBtns.length === 1) {
        visibleBtns.forEach(btn => { btn.style.width = "100%"; });
      } else {
        visibleBtns.forEach(btn => { btn.style.width = ""; });
      }
    }
  }

  // ---- Ensure contact section starts hidden ----
  if (sellerContact) {
    sellerContact.style.display = "none";
  }

  // ============================================================
  // GALLERY
  // ============================================================
  setupGallery(listing);
  
  // ============================================================
  // FAVORITE
  // ============================================================
  setupFavorite(listing);
}

/* ---------- CHAT FUNCTIONS (with status indicators) ---------- */
function openChatModal(listing) {
  let modal = document.getElementById("chatModal");
  if (!modal) {
    modal = document.createElement('div');
    modal.id = "chatModal";
    modal.className = "modal-overlay-custom";
    modal.innerHTML = `
      <div class="modal-custom chat-modal">
        <div class="chat-modal-header">
          <h3 id="chatModalTitle">Chat with Seller</h3>
          <button class="chat-modal-close" id="chatModalClose">&times;</button>
        </div>
        <div class="chat-modal-messages" id="chatMessages">
          <div class="chat-empty">Loading messages...</div>
        </div>
        <div class="chat-modal-input">
          <textarea id="chatInput" placeholder="${typeof t !== 'undefined' ? t('chatPlaceholder') : 'Ask about the listing...'}" rows="2"></textarea>
          <button class="btn btn-solid" id="chatSendBtn">${typeof t !== 'undefined' ? t('sendMessage') : 'Send'}</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const overlay = document.getElementById("chatModal");
  const titleEl = document.getElementById("chatModalTitle");
  const messagesEl = document.getElementById("chatMessages");
  const inputEl = document.getElementById("chatInput");
  const sendBtn = document.getElementById("chatSendBtn");
  const closeBtn = document.getElementById("chatModalClose");

  const brandDisplay = typeof brandLabel !== 'undefined' ? brandLabel(listing.brand) : listing.brand;
  const listingTitle = listing.title || `${listing.year || ''} ${brandDisplay || ''} ${listing.model || ''}`.trim() || 'Listing';
  if (titleEl) titleEl.textContent = `Chat about "${listingTitle}"`;

  loadChatMessages(listing, messagesEl);

  overlay.classList.add("active");
  document.body.style.overflow = "hidden";

  if (closeBtn) {
    closeBtn.onclick = function() {
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    };
  }
  overlay.onclick = function(e) {
    if (e.target === this) {
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  };

  if (sendBtn) {
    sendBtn.onclick = function() {
      sendChatMessage(listing, inputEl, messagesEl);
    };
  }
  if (inputEl) {
    inputEl.onkeydown = function(e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage(listing, inputEl, messagesEl);
      }
    };
  }
}

function loadChatMessages(listing, container) {
  const currentUser = DataService.getSession();
  if (!currentUser) {
    container.innerHTML = `<div class="chat-empty">Please log in to chat.</div>`;
    return;
  }

  const sellerEmail = listing.creatorEmail || listing.email || "seller@example.com";

  const allMessages = DataService.getMessages();
  const listingMessages = allMessages.filter(m =>
    m.listingId === listing.id &&
    ((m.from === currentUser.email && m.to === sellerEmail) ||
     (m.from === sellerEmail && m.to === currentUser.email))
  );

  if (listingMessages.length === 0) {
    container.innerHTML = `<div class="chat-empty">No messages yet. Start the conversation!</div>`;
    return;
  }

  container.innerHTML = listingMessages.map(msg => {
    const isOwn = msg.from === currentUser.email;
    const senderName = msg.fromName || msg.from;
    
    // Get avatar
    const avatarColor = getAvatarColor(senderName);
    const initials = getUserInitials(senderName);
    const avatarHtml = msg.fromAvatar 
      ? `<img src="${msg.fromAvatar}" alt="${senderName}" class="chat-avatar-img">`
      : `<span class="chat-avatar-initials" style="background:${avatarColor}">${initials}</span>`;
    
    // Status indicator
    let statusHtml = '';
    if (isOwn) {
      const status = DataService.getMessageStatus(msg);
      if (status === 'read') {
        statusHtml = `<span class="msg-status read">✓✓</span>`;
      } else if (status === 'delivered') {
        statusHtml = `<span class="msg-status delivered">✓✓</span>`;
      } else if (status === 'sent') {
        statusHtml = `<span class="msg-status sent">✓</span>`;
      } else {
        statusHtml = `<span class="msg-status sending">⏳</span>`;
      }
    }
    
    // ===== REPLY CONTEXT =====
    let replyContextHtml = '';
    if (msg.replyToId && msg.replyToMessage) {
      const repliedMsg = listingMessages.find(m => m.id === msg.replyToId);
      if (repliedMsg) {
        const repliedText = repliedMsg.message.length > 40 
          ? repliedMsg.message.substring(0, 40) + '...' 
          : repliedMsg.message;
        replyContextHtml = `
          <div class="chat-reply-context">
            <span class="reply-arrow">↩️</span>
            <span>${t("replyingTo") || "Replying to"}: "${escapeHtml(repliedText)}"</span>
          </div>
        `;
      }
    }
    
    // ===== REPLY BUTTON =====
    const replyBtnHtml = `
      <button class="chat-reply-btn" data-msg-id="${msg.id}" data-msg-text="${escapeHtml(msg.message)}">
        <i class="fas fa-reply"></i> ${t("reply") || "Reply"}
      </button>
    `;
    
    return `
      <div class="chat-message-wrapper ${isOwn ? 'own' : 'other'}">
        <div class="chat-avatar">${avatarHtml}</div>
        <div class="chat-message ${isOwn ? 'chat-message-own' : 'chat-message-other'} ${msg.replyToId ? 'is-reply' : ''}">
          ${replyContextHtml}
          <div class="chat-message-sender">${isOwn ? 'You' : senderName}</div>
          <div class="chat-message-text">${escapeHtml(msg.message)}</div>
          <div class="chat-message-time">
            ${new Date(msg.timestamp).toLocaleTimeString()}
            ${statusHtml}
          </div>
          <div style="display:flex; justify-content:flex-end; margin-top:4px;">
            ${replyBtnHtml}
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.scrollTop = container.scrollHeight;
  
  // Mark messages as read
  DataService.markMessagesAsRead(listing.id, currentUser.email);
  
  // Re-render after a moment to show read receipts
  setTimeout(() => {
    loadChatMessages(listing, container);
  }, 500);

  // ===== ATTACH REPLY EVENT LISTENERS =====
  container.querySelectorAll('.chat-reply-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const msgId = this.dataset.msgId;
      const msgText = this.dataset.msgText;
      const inputEl = document.getElementById("chatInput");
      if (inputEl) {
        // Pre-fill input with @mention style
        const senderName = this.closest('.chat-message-wrapper').querySelector('.chat-message-sender').textContent;
        inputEl.value = `@${senderName}: `;
        inputEl.focus();
        // Store reply context for sending
        window._replyToId = msgId;
        window._replyToMessage = msgText;
        // Show visual feedback
        this.innerHTML = '<i class="fas fa-check"></i> ' + (t("replying") || "Replying...");
        setTimeout(() => {
          this.innerHTML = '<i class="fas fa-reply"></i> ' + (t("reply") || "Reply");
        }, 1500);
      }
    });
  });
}

function sendChatMessage(listing, inputEl, messagesEl) {
  const currentUser = DataService.getSession();
  if (!currentUser) {
    showModal("Please log in to send messages.", "⚠️ Not Logged In", "error", "OK", false);
    return;
  }

  const message = inputEl.value.trim();
  if (!message) return;

  const sellerEmail = listing.creatorEmail || listing.email || "seller@example.com";
  const sellerName = listing.creatorName || "Seller";
  
  const fullUser = DataService.getCurrentUser();

  // ===== CHECK FOR REPLY =====
  let replyToId = window._replyToId || null;
  let replyToMessage = window._replyToMessage || null;
  
  // Clear reply context after sending
  window._replyToId = null;
  window._replyToMessage = null;

  const newMessage = {
    listingId: listing.id,
    from: currentUser.email,
    fromName: currentUser.name,
    fromAvatar: fullUser ? fullUser.avatar : null,
    to: sellerEmail,
    toName: sellerName,
    message: message,
    replyToId: replyToId,
    replyToMessage: replyToMessage
  };

  DataService.sendMessage(newMessage);

  inputEl.value = "";
  loadChatMessages(listing, messagesEl);
}

/* ---------- GALLERY FUNCTIONS ---------- */
function setupGallery(listing) {
  if (listing.images && listing.images.length > 0) {
    currentImages = listing.images;
  } else {
    currentImages = [fallbackListingSVG(listing)];
  }
  
  currentImageIndex = 0;
  updateMainImage();
  
  const thumbnailsContainer = document.getElementById("galleryThumbnails");
  if (currentImages.length > 1) {
    thumbnailsContainer.innerHTML = currentImages.map((img, index) => `
      <div class="gallery-thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
        <img src="${img}" alt="Thumbnail ${index + 1}" onerror="this.src=fallbackListingSVG(currentListing || {});">
      </div>
    `).join('');
    
    thumbnailsContainer.querySelectorAll('.gallery-thumbnail').forEach(thumb => {
      thumb.addEventListener('click', function() {
        const index = Number(this.dataset.index);
        currentImageIndex = index;
        updateMainImage();
        updateThumbnails();
      });
    });
    
    document.getElementById("galleryPrev").style.display = 'flex';
    document.getElementById("galleryNext").style.display = 'flex';
  } else {
    thumbnailsContainer.innerHTML = '';
    document.getElementById("galleryPrev").style.display = 'none';
    document.getElementById("galleryNext").style.display = 'none';
  }
  
  document.getElementById("galleryPrev").addEventListener('click', function(e) {
    e.stopPropagation();
    if (currentImages.length <= 1) return;
    currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
    updateMainImage();
    updateThumbnails();
  });
  
  document.getElementById("galleryNext").addEventListener('click', function(e) {
    e.stopPropagation();
    if (currentImages.length <= 1) return;
    currentImageIndex = (currentImageIndex + 1) % currentImages.length;
    updateMainImage();
    updateThumbnails();
  });
  
  document.addEventListener('keydown', function(e) {
    if (document.getElementById("lightboxOverlay").classList.contains("active")) return;
    if (currentImages.length <= 1) return;
    if (e.key === 'ArrowLeft') {
      currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
      updateMainImage();
      updateThumbnails();
    } else if (e.key === 'ArrowRight') {
      currentImageIndex = (currentImageIndex + 1) % currentImages.length;
      updateMainImage();
      updateThumbnails();
    }
  });
  
  document.getElementById("galleryExpand").addEventListener('click', function() {
    openLightbox(currentImageIndex);
  });
  
  document.getElementById("mainImage").addEventListener('click', function() {
    openLightbox(currentImageIndex);
  });
}

function updateMainImage() {
  const img = document.getElementById("mainImage");
  if (currentImages.length > 0 && currentImages[currentImageIndex]) {
    img.src = currentImages[currentImageIndex];
    img.onerror = function() {
      img.onerror = null;
      img.src = fallbackListingSVG(currentListing || {});
    };
  }
  img.alt = `Image ${currentImageIndex + 1}`;
  document.getElementById("imageCounter").textContent = `${currentImageIndex + 1} / ${currentImages.length}`;
}

function updateThumbnails() {
  document.querySelectorAll('.gallery-thumbnail').forEach((thumb, index) => {
    thumb.classList.toggle('active', index === currentImageIndex);
  });
}

/* ---------- LIGHTBOX ---------- */
function setupLightbox() {
  const overlay = document.getElementById("lightboxOverlay");
  const img = document.getElementById("lightboxImage");
  const closeBtn = document.getElementById("lightboxClose");
  const prevBtn = document.getElementById("lightboxPrev");
  const nextBtn = document.getElementById("lightboxNext");
  const counter = document.getElementById("lightboxCounter");
  
  closeBtn.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', function(e) {
    if (e.target === this) closeLightbox();
  });
  
  prevBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (currentImages.length <= 1) return;
    currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
    img.src = currentImages[currentImageIndex];
    counter.textContent = `${currentImageIndex + 1} / ${currentImages.length}`;
    updateMainImage();
    updateThumbnails();
  });
  
  nextBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (currentImages.length <= 1) return;
    currentImageIndex = (currentImageIndex + 1) % currentImages.length;
    img.src = currentImages[currentImageIndex];
    counter.textContent = `${currentImageIndex + 1} / ${currentImages.length}`;
    updateMainImage();
    updateThumbnails();
  });
  
  document.addEventListener('keydown', function(e) {
    if (!overlay.classList.contains("active")) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevBtn.click();
    if (e.key === 'ArrowRight') nextBtn.click();
  });
}

function openLightbox(index) {
  const overlay = document.getElementById("lightboxOverlay");
  const img = document.getElementById("lightboxImage");
  const counter = document.getElementById("lightboxCounter");
  
  if (currentImages.length === 0) return;
  
  currentImageIndex = index;
  img.src = currentImages[currentImageIndex] || '';
  counter.textContent = `${currentImageIndex + 1} / ${currentImages.length}`;
  overlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  document.getElementById("lightboxOverlay").classList.remove("active");
  document.body.style.overflow = "";
}

/* ---------- FAVORITE ---------- */
function setupFavorite(listing) {
  const btn = document.getElementById("favoriteBtn");
  const icon = document.getElementById("favoriteIcon");
  
  let favs = DataService.getFavorites();
  
  const isFav = favs.includes(listing.id);
  
  if (isFav) {
    icon.textContent = '♥';
    btn.classList.add('active');
  }
  
  btn.addEventListener('click', function() {
    const currentFavs = DataService.toggleFavorite(listing.id);
    
    if (currentFavs.includes(listing.id)) {
      icon.textContent = '♥';
      this.classList.add('active');
    } else {
      icon.textContent = '♡';
      this.classList.remove('active');
    }
  });
}

/* ---------- COMMENTS ---------- */
function loadComments(listingId) {
  comments = DataService.getComments(listingId);
  renderComments();
}

function renderComments() {
  const container = document.getElementById("commentsList");
  
  if (comments.length === 0) {
    container.innerHTML = `
      <div class="comment-empty">
        <p>${typeof t !== 'undefined' ? t("noCommentsYet") : "No comments yet. Be the first to comment!"}</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = comments.map(comment => {
    const avatarColor = getAvatarColor(comment.author || "User");
    const initials = getUserInitials(comment.author || "User");
    const avatarHtml = comment.avatar 
      ? `<img src="${comment.avatar}" alt="${comment.author}" class="comment-avatar-img">`
      : `<span class="comment-avatar-initials" style="background:${avatarColor}">${initials}</span>`;
    
    // ===== REPLY BUTTON =====
    const replyBtnHtml = `
      <button class="comment-reply-btn" data-comment-id="${comment.id}" data-author="${escapeHtml(comment.author)}">
        <i class="fas fa-reply"></i> ${t("reply") || "Reply"}
      </button>
    `;
    
    // ===== RENDER REPLIES =====
    let repliesHtml = '';
    if (comment.replies && comment.replies.length > 0) {
      repliesHtml = `
        <div class="comment-replies">
          ${comment.replies.map(reply => {
            const replyAvatarColor = getAvatarColor(reply.author || "User");
            const replyInitials = getUserInitials(reply.author || "User");
            const replyAvatarHtml = reply.avatar 
              ? `<img src="${reply.avatar}" alt="${reply.author}" class="comment-avatar-img">`
              : `<span class="comment-avatar-initials" style="background:${replyAvatarColor}">${replyInitials}</span>`;
            
            return `
              <div class="comment-item comment-reply">
                <div class="comment-header">
                  <div class="comment-user">
                    <div class="comment-avatar">${replyAvatarHtml}</div>
                    <span class="comment-author">${escapeHtml(reply.author)}</span>
                  </div>
                  <span class="comment-date">${new Date(reply.date).toLocaleDateString()} ${new Date(reply.date).toLocaleTimeString()}</span>
                </div>
                <div class="comment-body">${escapeHtml(reply.text)}</div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
    
    return `
      <div class="comment-item" data-comment-id="${comment.id}">
        <div class="comment-header">
          <div class="comment-user">
            <div class="comment-avatar">${avatarHtml}</div>
            <span class="comment-author">${escapeHtml(comment.author)}</span>
          </div>
          <div class="comment-actions">
            <span class="comment-date">${new Date(comment.date).toLocaleDateString()} ${new Date(comment.date).toLocaleTimeString()}</span>
            ${replyBtnHtml}
          </div>
        </div>
        <div class="comment-body">${escapeHtml(comment.text)}</div>
        ${repliesHtml}
        <div class="comment-reply-form-wrapper" id="replyForm_${comment.id}" style="display:none; margin-top:12px;">
          <div class="comment-reply-form">
            <div class="reply-indicator">
              <span>${t("replyingTo") || "Replying to"} <strong>${escapeHtml(comment.author)}</strong></span>
              <button class="reply-cancel-btn" data-comment-id="${comment.id}">${t("cancelBtn") || "Cancel"}</button>
            </div>
            <div class="comment-form">
              <textarea id="replyInput_${comment.id}" placeholder="${t("writeReply") || "Write your reply..."}" rows="2"></textarea>
              <button class="btn btn-solid reply-submit-btn" data-comment-id="${comment.id}" data-parent-author="${escapeHtml(comment.author)}">
                ${t("postReply") || "Post Reply"}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  // ===== ATTACH REPLY EVENT LISTENERS =====
  document.querySelectorAll('.comment-reply-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const commentId = this.dataset.commentId;
      const form = document.getElementById(`replyForm_${commentId}`);
      if (form) {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
        const textarea = document.getElementById(`replyInput_${commentId}`);
        if (textarea) {
          setTimeout(() => textarea.focus(), 100);
        }
      }
    });
  });
  
  document.querySelectorAll('.reply-cancel-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const commentId = this.dataset.commentId;
      const form = document.getElementById(`replyForm_${commentId}`);
      if (form) form.style.display = 'none';
    });
  });
  
  document.querySelectorAll('.reply-submit-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const commentId = this.dataset.commentId;
      const textarea = document.getElementById(`replyInput_${commentId}`);
      if (textarea && textarea.value.trim()) {
        submitReply(commentId, textarea.value.trim());
        textarea.value = '';
        const form = document.getElementById(`replyForm_${commentId}`);
        if (form) form.style.display = 'none';
      } else {
        showCommentMessage("Please write a reply.", "error");
      }
    });
  });
}

function submitReply(commentId, text) {
  const user = DataService.getSession();
  if (!user) {
    showCommentMessage("Please log in to reply.", "error");
    return;
  }
  
  const fullUser = DataService.getCurrentUser();
  
  const reply = {
    author: user.name || "Anonymous",
    authorEmail: user.email || "",
    avatar: fullUser ? fullUser.avatar : null,
    text: text,
    date: new Date().toISOString()
  };
  
  // Find the comment and add reply
  const comment = comments.find(c => c.id === commentId);
  if (!comment) {
    showCommentMessage("Comment not found.", "error");
    return;
  }
  
  if (!comment.replies) comment.replies = [];
  comment.replies.push(reply);
  
  // Save back to localStorage
  const allComments = JSON.parse(localStorage.getItem("moto_comments") || "{}");
  if (allComments[currentListing.id]) {
    const commentIndex = allComments[currentListing.id].findIndex(c => c.id === commentId);
    if (commentIndex !== -1) {
      allComments[currentListing.id][commentIndex] = comment;
      localStorage.setItem("moto_comments", JSON.stringify(allComments));
    }
  }
  
  renderComments();
  showCommentMessage("Reply posted successfully!", "success");
}

function setupCommentForm() {
  const form = document.getElementById("commentForm");
  const input = document.getElementById("commentInput");
  const message = document.getElementById("commentMessage");
  
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    
    const text = input.value.trim();
    if (!text) {
      showCommentMessage("Please write a comment.", "error");
      return;
    }
    
    let user = DataService.getSession();
    
    if (!user) {
      showCommentMessage("Please log in to post a comment.", "error");
      return;
    }
    
    // Get full user data to include avatar
    const fullUser = DataService.getCurrentUser();
    
    const comment = {
      author: user.name || "Anonymous",
      authorEmail: user.email || "",
      avatar: fullUser ? fullUser.avatar : null,
      text: text
    };
    
    comments = DataService.addComment(currentListing.id, comment);
    renderComments();
    input.value = "";
    showCommentMessage("Comment posted successfully!", "success");
  });
}

function showCommentMessage(msg, type) {
  const el = document.getElementById("commentMessage");
  el.textContent = msg;
  el.className = "comment-message " + type;
  setTimeout(() => {
    el.className = "comment-message";
  }, 5000);
}

/* ---------- HELPER FUNCTIONS ---------- */
function getAvatarColor(name) {
  const colors = ['#ff5a1f', '#1f6f5c', '#2563eb', '#b91c1c', '#7c3aed', '#0d9488', '#a16207', '#dc2626', '#059669', '#4f46e5'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/* ---------- MOBILE MENU ---------- */
function setupMobileMenu() {
  const hamburger = document.getElementById("hamburgerMenu");
  const overlay = document.getElementById("mobileMenuOverlay");
  const backdrop = document.getElementById("menuBackdrop");
  const closeBtn = document.getElementById("mobileMenuClose");
  const mobileAuth = document.getElementById("mobileAuth");

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

  function updateMobileAuth() {
    if (!mobileAuth) return;
    const user = DataService.getSession();
    if (user) {
      mobileAuth.innerHTML = `
        <a href="dashboard.html" class="btn btn-solid" style="width:100%;justify-content:center;">
          <i class="fa-solid fa-user fa-lg" style="color: rgb(255, 122, 61);"></i> ${user.name}
        </a>
        <button class="btn" id="mobileLogoutBtn" style="width:100%;justify-content:center;">
          <i class="fa-solid fa-right-from-bracket fa-lg" style="color: rgb(255, 122, 61);"></i> ${t("logoutBtn")}
        </button>
      `;
      const logoutBtn = mobileAuth.querySelector("#mobileLogoutBtn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", function() {
          DataService.logout();
          window.location.href = "index.html";
        });
      }
    } else {
      mobileAuth.innerHTML = `
        <a href="login.html" class="btn btn-solid" style="width:100%;justify-content:center;">
          <i class="fa-solid fa-right-to-bracket fa-lg" style="color: rgb(255, 122, 61);"></i> ${t("loginLink")}
        </a>
      `;
    }
  }

  function openMenu() {
    overlay.classList.add("open");
    backdrop.classList.add("active");
    hamburger.classList.add("active");
    document.body.style.overflow = "hidden";
    updateMobileAuth();
  }

  function closeMenu() {
    overlay.classList.remove("open");
    backdrop.classList.remove("active");
    hamburger.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (hamburger) hamburger.addEventListener("click", openMenu);
  if (closeBtn) closeBtn.addEventListener("click", closeMenu);
  if (backdrop) backdrop.addEventListener("click", closeMenu);

  document.querySelectorAll(".mobile-nav-link").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") closeMenu();
  });

  const mobileLangSwitch = document.getElementById("mobileLangSwitch");
  if (mobileLangSwitch) {
    const newLangBtn = mobileLangSwitch.cloneNode(true);
    mobileLangSwitch.parentNode.replaceChild(newLangBtn, mobileLangSwitch);
    newLangBtn.addEventListener('click', function() {
      const currentLang = localStorage.getItem("moto_lang") || "en";
      const newLang = currentLang === "ar" ? "en" : "ar";
      localStorage.setItem("moto_lang", newLang);
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
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("moto_theme", next);
    });
  }
}