// ============================================================
// js/services/dataService.js
// CENTRAL DATA LAYER (Frontend-only for now)
// All localStorage reads/writes live here.
// When we switch to Supabase, we will ONLY rewrite this file.
// ============================================================

const DataService = {

  // ---------- LISTINGS ----------
  getAllListings() {
    const stored = JSON.parse(localStorage.getItem("moto_listings") || "[]");
    if (typeof SEED_LISTINGS !== 'undefined') {
      return [...stored, ...SEED_LISTINGS];
    }
    return stored;
  },

  saveListing(listing) {
    const stored = JSON.parse(localStorage.getItem("moto_listings") || "[]");
    stored.unshift(listing);
    localStorage.setItem("moto_listings", JSON.stringify(stored));
    return listing;
  },

  deleteListing(id) {
    let stored = JSON.parse(localStorage.getItem("moto_listings") || "[]");
    stored = stored.filter(l => l.id !== id);
    localStorage.setItem("moto_listings", JSON.stringify(stored));
    return true;
  },

  updateListing(id, updates) {
    let stored = JSON.parse(localStorage.getItem("moto_listings") || "[]");
    const index = stored.findIndex(l => l.id === id);
    if (index !== -1) {
      stored[index] = { ...stored[index], ...updates };
      localStorage.setItem("moto_listings", JSON.stringify(stored));
      return stored[index];
    }
    return null;
  },

  // ---------- FAVORITES ----------
  getFavorites() {
    return JSON.parse(localStorage.getItem("moto_favorites") || "[]");
  },

  toggleFavorite(id) {
    let favs = this.getFavorites();
    if (favs.includes(id)) {
      favs = favs.filter(f => f !== id);
    } else {
      favs.push(id);
    }
    localStorage.setItem("moto_favorites", JSON.stringify(favs));
    return favs;
  },

  // ---------- USERS & SESSION ----------
  getUsers() {
    return JSON.parse(localStorage.getItem("moto_users") || "[]");
  },

  getCurrentUser() {
    const session = this.getSession();
    if (!session) return null;
    const users = this.getUsers();
    return users.find(u => u.email === session.email) || null;
  },

  getSession() {
    return JSON.parse(localStorage.getItem("moto_user") || "null");
  },

  setSession(user) {
    localStorage.setItem("moto_user", JSON.stringify({
      name: user.name,
      email: user.email,
      role: user.role || "user",
      avatar: user.avatar || null
    }));
  },

  logout() {
    localStorage.removeItem("moto_user");
  },

  findUserByEmail(email) {
    const users = this.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  registerUser(userData) {
    const users = this.getUsers();
    users.push({
      ...userData,
      role: "user",
      avatar: null,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem("moto_users", JSON.stringify(users));
    return userData;
  },

  updateUserProfile(email, updates) {
    let users = this.getUsers();
    const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem("moto_users", JSON.stringify(users));
      const session = this.getSession();
      if (session && session.email === email) {
        this.setSession(users[index]);
      }
      return true;
    }
    return false;
  },

  // ---------- MESSAGES with Status ----------
  getMessages() {
    return JSON.parse(localStorage.getItem("moto_messages") || "[]");
  },

sendMessage(message) {
  const messages = this.getMessages();
  const newMsg = {
    ...message,
    id: "M" + Date.now(),
    timestamp: new Date().toISOString(),
    read: false,
    delivered: false,
    status: 'sending',
    replyToId: message.replyToId || null,  // ✅ ADD THIS
    replyToMessage: message.replyToMessage || null  // ✅ ADD THIS
  };
  messages.push(newMsg);
  localStorage.setItem("moto_messages", JSON.stringify(messages));
  
  setTimeout(() => {
    this.markMessageDelivered(newMsg.id);
  }, 500);
  
  return newMsg;
},

  markMessageDelivered(messageId) {
    const messages = this.getMessages();
    const msg = messages.find(m => m.id === messageId);
    if (msg) {
      msg.delivered = true;
      msg.status = 'delivered';
      localStorage.setItem("moto_messages", JSON.stringify(messages));
    }
  },

  markMessagesAsRead(listingId, userEmail) {
    const messages = this.getMessages();
    let updated = false;
    messages.forEach(msg => {
      if (msg.listingId === listingId && msg.to === userEmail && !msg.read) {
        msg.read = true;
        msg.status = 'read';
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem("moto_messages", JSON.stringify(messages));
      // Simulate read receipt - in real app, this would notify sender via WebSocket
      return true;
    }
    return false;
  },

  getMessageStatus(message) {
    if (message.read) return 'read';
    if (message.delivered) return 'delivered';
    if (message.status === 'sending') return 'sending';
    return 'sent';
  },

  // ---------- COMMENTS ----------
  getComments(listingId) {
    const all = JSON.parse(localStorage.getItem("moto_comments") || "{}");
    return all[listingId] || [];
  },

addComment(listingId, commentData) {
  const all = JSON.parse(localStorage.getItem("moto_comments") || "{}");
  if (!all[listingId]) all[listingId] = [];
  const newComment = {
    ...commentData,
    id: "C" + Date.now(),
    date: new Date().toISOString(),
    replies: [] // ✅ Add replies array for nested comments
  };
  all[listingId].push(newComment);
  localStorage.setItem("moto_comments", JSON.stringify(all));
  return all[listingId];
}
};

// Make it globally available to all your HTML pages
if (typeof window !== 'undefined') {
  window.DataService = DataService;
  console.log('✅ DataService loaded successfully (localStorage mode)');
}