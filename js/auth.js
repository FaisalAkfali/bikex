/* ===========================================================
   Bike.X — auth.js (REFACTORED to use DataService)
   =========================================================== */

function ensureSeedUser(){
  const users = DataService.getUsers();
  if(!users.some(u => u.email === "demo@motoharaj.sa")){
    DataService.registerUser({ 
      name:"Demo Rider", 
      email:"demo@motoharaj.sa", 
      password:"demo1234",
      phone:"+966 5X XXX XXXX"
    });
  }
  if(!users.some(u => u.email === "admin@biikex.sa")){
    DataService.registerUser({ 
      name:"Admin", 
      email:"admin@biikex.sa", 
      password:"admin123",
      phone:"+966 5X XXX XXXX"
    });
  }
}

function getUser(){
  return DataService.getSession();
}

function getCurrentUser(){
  return DataService.getCurrentUser();
}

function setSession(user){
  DataService.setSession(user);
}

function logout(){
  DataService.logout();
  window.location.href = "index.html";
}

function findUserByEmail(email){
  return DataService.findUserByEmail(email);
}

function findUserByPhone(phone){
  const users = DataService.getUsers();
  const normalized = phone.replace(/\s+/g, "");
  return users.find(u => u.phone && u.phone.replace(/\s+/g, "") === normalized);
}

function loginOrCreateByPhone(phone){
  let user = findUserByPhone(phone);
  if (!user) {
    const last4 = phone.replace(/\D/g, "").slice(-4);
    user = {
      name: "Rider " + last4,
      email: "phone_" + phone.replace(/\D/g, "") + "@otp.bikex.local",
      password: null,
      phone: phone
    };
    DataService.registerUser(user);
  }
  DataService.setSession(user);
  return user;
}

function loginOrCreateGoogleDemo(profile){
  let user = DataService.findUserByEmail(profile.email);
  if (!user) {
    user = {
      name: profile.name,
      email: profile.email,
      password: null,
      phone: "",
      signedInWithGoogleDemo: true
    };
    DataService.registerUser(user);
  }
  DataService.setSession(user);
  return user;
}

function registerUser({ name, email, password, phone }){
  return DataService.registerUser({ name, email, password, phone });
}

function updateUserProfile(email, updates){
  return DataService.updateUserProfile(email, updates);
}

function getNextParam(){
  const params = new URLSearchParams(window.location.search);
  return params.get("next") || "index.html";
}

function isAdmin(){
  const user = getCurrentUser();
  return user && user.role === "admin";
}

function isLoggedIn(){
  return getUser() !== null;
}

// --- Avatar helpers remain the same ---
function getUserAvatar(user){
  if (user && user.avatar) {
    return user.avatar;
  }
  return null;
}

function getAvatarColor(name){
  const colors = ['#ff5a1f', '#1f6f5c', '#2563eb', '#b91c1c', '#7c3aed', '#0d9488', '#a16207', '#dc2626', '#059669', '#4f46e5'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getUserInitials(name){
  return name.split(' ').map(word => word.charAt(0).toUpperCase()).join('').substring(0, 2);
}

// --- Render Auth Area (uses DataService internally) ---
function renderAuthArea(){
  const el = document.getElementById("authArea");
  if(!el) return;
  const user = DataService.getSession();
  if(user){
    const fullUser = DataService.getCurrentUser();
    const avatar = fullUser && fullUser.avatar ? fullUser.avatar : null;
    const initials = getUserInitials(user.name);
    const avatarColor = getAvatarColor(user.name);
    
    let avatarHtml = '';
    if (avatar) {
      avatarHtml = `<img src="${avatar}" alt="${user.name}" class="user-avatar-img">`;
    } else {
      avatarHtml = `<span class="user-avatar-initials" style="background:${avatarColor}">${initials}</span>`;
    }
    
    el.innerHTML = `
      <a href="messages.html" class="btn" id="messagesLinkBtn" title="${t("messages")}">
        <i class="fas fa-comment-dots"></i>
      </a>
      <a href="dashboard.html" class="btn btn-user-profile" id="userProfileBtn">
        <span class="user-avatar-small">${avatarHtml}</span>
        <span class="user-name-display">${user.name}</span>
      </a>
      <button class="btn" id="logoutBtn">${t("logoutBtn")}</button>`;
    const logoutBtn = el.querySelector("#logoutBtn");
    if(logoutBtn) logoutBtn.addEventListener("click", logout);
  } else {
    el.innerHTML = `<a href="login.html" class="btn" id="loginLinkBtn">${t("loginLink")}</a>`;
  }
}

// Keep the DOMContentLoaded call at the bottom
document.addEventListener("DOMContentLoaded", () => {
  ensureSeedUser();
});