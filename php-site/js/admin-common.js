// ── Auth guard — wait for Firebase to resolve before deciding ─────────────────
import { logout, authReady, isAdmin } from './firebase-config.js';

// ── Session timeout — 8 hours of inactivity ──────────────────────────────────
const SESSION_KEY = 'kesar_admin_last_active';
const SESSION_TIMEOUT_MS = 8 * 60 * 60 * 1000; // 8 hours

function touchSession() {
  localStorage.setItem(SESSION_KEY, Date.now().toString());
}

function isSessionExpired() {
  const last = parseInt(localStorage.getItem(SESSION_KEY) || '0', 10);
  if (!last) return false;
  return (Date.now() - last) > SESSION_TIMEOUT_MS;
}

['click', 'keydown', 'mousemove', 'touchstart'].forEach(evt => {
  document.addEventListener(evt, touchSession, { passive: true });
});

setInterval(async () => {
  if (isSessionExpired()) {
    await logout();
    window.location.replace('../index.php?session=expired');
  }
}, 60_000);

// ── Auth overlay — covers page while Firebase resolves ────────────────────────
const _overlay = document.createElement('div');
_overlay.id = 'admin-auth-overlay';
_overlay.style.cssText = 'position:fixed;inset:0;background:#FAF7F2;z-index:9999;display:flex;align-items:center;justify-content:center;transition:opacity .2s;';
_overlay.innerHTML = '<div style="text-align:center"><div class="spinner"></div><p style="margin-top:1rem;color:#8A7768;font-size:.875rem">Verifying access…</p></div>';
document.body.appendChild(_overlay);

async function checkAuth() {
  const user = await authReady;
  if (!user || !isAdmin(user.email)) {
    window.location.replace('../login_admin.php');
    return;
  }
  if (isSessionExpired()) {
    await logout();
    window.location.replace('../index.php?session=expired');
    return;
  }
  touchSession();
  _overlay.style.opacity = '0';
  setTimeout(() => _overlay.remove(), 200);
}

checkAuth();

// Re-check auth whenever the page becomes visible (tab switch, back button on mobile)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) checkAuth();
});

// ── Toast ─────────────────────────────────────────────────────────────────────
window.showToast = function(msg, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  el.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, duration);
};

// ── Logout ────────────────────────────────────────────────────────────────────
async function doLogout() {
  localStorage.removeItem(SESSION_KEY);
  await logout();
  window.location.replace('../index.php');
}
document.getElementById('admin-logout-btn')?.addEventListener('click', doLogout);
document.getElementById('admin-mobile-logout-btn')?.addEventListener('click', doLogout);

// ── Mobile menu toggle ────────────────────────────────────────────────────────
const mobileMenu = document.getElementById('admin-mobile-menu');
document.getElementById('admin-mobile-menu-btn')?.addEventListener('click', () => mobileMenu?.classList.remove('hidden'));
document.getElementById('admin-mobile-overlay')?.addEventListener('click', () => mobileMenu?.classList.add('hidden'));
