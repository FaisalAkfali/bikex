/* ===========================================================
   Bike X — messages.js (COMPLETE REFACTORED)
   All data flows through DataService
   WhatsApp-style read receipts (✓, ✓✓, ✓✓ blue)
   =========================================================== */

let currentThreadListingId = null;
let currentThreadOtherUser = null;

/* ---------- LOAD MESSAGES (Inbox) ---------- */
function loadMessages() {
  const container = document.getElementById("messagesInbox");
  if (!container) return;

  const currentUser = DataService.getSession();
  if (!currentUser) {
    container.innerHTML = `<div class="messages-empty">
      <i class="fas fa-comment-slash" style="font-size:48px;color:var(--muted);"></i>
      <h3>${t("loginLink") || "Please log in"}</h3>
      <a href="login.html" class="btn btn-solid">${t("loginLink")}</a>
    </div>`;
    return;
  }

  const allMessages = DataService.getMessages();
  
  // Get unique conversations where current user is involved
  const conversations = {};
  allMessages.forEach(msg => {
    if (msg.from === currentUser.email || msg.to === currentUser.email) {
      const key = msg.listingId + "_" + [msg.from, msg.to].sort().join("_");
      if (!conversations[key] || new Date(msg.timestamp) > new Date(conversations[key].timestamp)) {
        conversations[key] = msg;
      }
    }
  });

  const convList = Object.values(conversations).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (convList.length === 0) {
    container.innerHTML = `<div class="messages-empty">
      <i class="fas fa-inbox" style="font-size:48px;color:var(--muted);"></i>
      <h3>${t("noMessagesYet") || "No messages yet"}</h3>
      <p>${t("startConversation") || "Start a conversation by asking about a listing!"}</p>
      <a href="index.html" class="btn">${t("browseListings") || "Browse listings"}</a>
    </div>`;
    return;
  }

  const allListings = DataService.getAllListings();

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
      <div class="message-conversation" data-listing-id="${msg.listingId}" data-other-user="${otherUser}">
        <div class="message-conv-avatar">
          <span>${otherUserName.charAt(0).toUpperCase()}</span>
        </div>
        <div class="message-conv-content">
          <div class="message-conv-header">
            <span class="message-conv-name">${otherUserName}</span>
            <span class="message-conv-date">${new Date(msg.timestamp).toLocaleDateString()}</span>
          </div>
          <div class="message-conv-listing">${listingInfo}</div>
          <div class="message-conv-preview">${msg.message.substring(0, 60)}${msg.message.length > 60 ? '...' : ''}</div>
        </div>
        ${unreadCount > 0 ? `<span class="message-unread-badge">${unreadCount}</span>` : ''}
      </div>
    `;
  }).join('');

  // Click to open conversation inline
  container.querySelectorAll('.message-conversation').forEach(conv => {
    conv.addEventListener('click', function() {
      const listingId = this.dataset.listingId;
      const otherUser = this.dataset.otherUser;
      openThread(listingId, otherUser);
    });
  });
}

/* ---------- OPEN THREAD ---------- */
function openThread(listingId, otherUser) {
  currentThreadListingId = listingId;
  currentThreadOtherUser = otherUser;

  const layout = document.getElementById("messagesLayout");
  if (layout) layout.classList.add("show-thread");

  // Highlight the active conversation
  document.querySelectorAll('.message-conversation').forEach(el => {
    el.classList.toggle('active', el.dataset.listingId === listingId && el.dataset.otherUser === otherUser);
  });

  renderThread();
}

/* ---------- CLOSE THREAD ---------- */
function closeThread() {
  const layout = document.getElementById("messagesLayout");
  if (layout) layout.classList.remove("show-thread");
  currentThreadListingId = null;
  currentThreadOtherUser = null;
}

/* ---------- RENDER THREAD (with status indicators) ---------- */
function renderThread() {
  const threadEl = document.getElementById("messagesThread");
  if (!threadEl || !currentThreadListingId) return;

  const currentUser = DataService.getSession();
  if (!currentUser) return;

  const allListings = DataService.getAllListings();
  const listing = allListings.find(l => l.id === currentThreadListingId);

  let listingTitle = "Listing";
  if (listing) {
    const brandDisplay = typeof brandLabel !== 'undefined' ? brandLabel(listing.brand) : listing.brand;
    listingTitle = listing.title || `${listing.year || ''} ${brandDisplay || ''} ${listing.model || ''}`.trim() || 'Listing';
  }

  const allMessages = DataService.getMessages();
  const threadMessages = allMessages
    .filter(m => m.listingId === currentThreadListingId &&
      ((m.from === currentUser.email && m.to === currentThreadOtherUser) ||
       (m.to === currentUser.email && m.from === currentThreadOtherUser)))
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const otherUserName = threadMessages.length
    ? (threadMessages[0].from === currentThreadOtherUser ? (threadMessages[0].fromName || currentThreadOtherUser) : (threadMessages[0].toName || currentThreadOtherUser))
    : currentThreadOtherUser;

  threadEl.innerHTML = `
    <div class="messages-thread-header">
      <button class="messages-thread-back" id="threadBackBtn" aria-label="Back">&larr;</button>
      <div class="messages-thread-header-info">
        <div class="messages-thread-header-name">${otherUserName}</div>
        <div class="messages-thread-header-listing">${listingTitle}</div>
      </div>
    </div>
    <div class="messages-thread-messages" id="threadMessagesList"></div>
    <div class="messages-thread-input">
      <textarea id="threadInput" placeholder="${t("chatPlaceholder") || "Ask about the listing..."}" rows="2"></textarea>
      <button class="btn btn-solid" id="threadSendBtn">${t("sendMessage") || "Send"}</button>
    </div>
  `;

  const listEl = document.getElementById("threadMessagesList");
  if (threadMessages.length === 0) {
    listEl.innerHTML = `<div class="chat-empty">${t("noMessagesYet") || "No messages yet. Start the conversation!"}</div>`;
  } else {
    listEl.innerHTML = threadMessages.map(msg => {
      const isOwn = msg.from === currentUser.email;
      const senderName = isOwn ? 'You' : (msg.fromName || msg.from);
      
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
        const repliedMsg = threadMessages.find(m => m.id === msg.replyToId);
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
          <div class="chat-message ${isOwn ? 'chat-message-own' : 'chat-message-other'} ${msg.replyToId ? 'is-reply' : ''}">
            ${replyContextHtml}
            <div class="chat-message-sender">${senderName}</div>
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
    listEl.scrollTop = listEl.scrollHeight;
  }

  // Mark messages as read
  let changed = false;
  allMessages.forEach(m => {
    if (m.listingId === currentThreadListingId && m.to === currentUser.email && m.from === currentThreadOtherUser && !m.read) {
      m.read = true;
      m.status = 'read';
      changed = true;
    }
  });
  if (changed) {
    localStorage.setItem("moto_messages", JSON.stringify(allMessages));
    setTimeout(() => {
      renderThread();
      loadMessages();
    }, 300);
  }

  // ===== ATTACH REPLY EVENT LISTENERS =====
  listEl.querySelectorAll('.chat-reply-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const msgId = this.dataset.msgId;
      const msgText = this.dataset.msgText;
      const inputEl = document.getElementById("threadInput");
      if (inputEl) {
        const senderName = this.closest('.chat-message-wrapper').querySelector('.chat-message-sender').textContent;
        inputEl.value = `@${senderName}: `;
        inputEl.focus();
        window._replyToId = msgId;
        window._replyToMessage = msgText;
        this.innerHTML = '<i class="fas fa-check"></i> ' + (t("replying") || "Replying...");
        setTimeout(() => {
          this.innerHTML = '<i class="fas fa-reply"></i> ' + (t("reply") || "Reply");
        }, 1500);
      }
    });
  });

  const backBtn = document.getElementById("threadBackBtn");
  if (backBtn) backBtn.addEventListener("click", closeThread);

  const sendBtn = document.getElementById("threadSendBtn");
  const inputEl = document.getElementById("threadInput");
  if (sendBtn) sendBtn.addEventListener("click", sendThreadMessage);
  if (inputEl) {
    inputEl.addEventListener("keydown", function(e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendThreadMessage();
      }
    });
  }
}

/* ---------- SEND THREAD MESSAGE (No Modal) ---------- */
function sendThreadMessage() {
  const inputEl = document.getElementById("threadInput");
  if (!inputEl) return;
  const message = inputEl.value.trim();
  if (!message) return;

  const currentUser = DataService.getSession();
  if (!currentUser || !currentThreadListingId || !currentThreadOtherUser) {
    return;
  }

  const allListings = DataService.getAllListings();
  const listing = allListings.find(l => l.id === currentThreadListingId);
  const allMessages = DataService.getMessages();

  const priorMsg = allMessages.find(m => m.listingId === currentThreadListingId &&
    (m.from === currentThreadOtherUser || m.to === currentThreadOtherUser));
  const otherUserName = priorMsg
    ? (priorMsg.from === currentThreadOtherUser ? priorMsg.fromName : priorMsg.toName)
    : (listing ? (listing.creatorName || null) : null);

  // ===== CHECK FOR REPLY =====
  let replyToId = window._replyToId || null;
  let replyToMessage = window._replyToMessage || null;
  window._replyToId = null;
  window._replyToMessage = null;

  const fullUser = DataService.getCurrentUser();

  const newMessage = {
    listingId: currentThreadListingId,
    from: currentUser.email,
    fromName: currentUser.name,
    fromAvatar: fullUser ? fullUser.avatar : null,
    to: currentThreadOtherUser,
    toName: otherUserName || currentThreadOtherUser,
    message: message,
    replyToId: replyToId,
    replyToMessage: replyToMessage
  };

  DataService.sendMessage(newMessage);

  inputEl.value = "";
  renderThread();
  loadMessages();
}
