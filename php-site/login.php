<?php
$pageTitle = 'Login — Kesar Kosmetics';
$cssPath = 'css/style.css';
include 'includes/head.php';
?>

<div class="min-h-screen bg-gradient-to-br from-[#FAF7F2] via-[#F5EEE6] to-[#EDE4D8] flex items-center justify-center px-4 py-10 relative overflow-hidden">
  <div class="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#F5A800]/8 blur-3xl pointer-events-none"></div>
  <div class="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#E8620A]/8 blur-3xl pointer-events-none"></div>

  <!-- Close button -->
  <button onclick="history.back()" class="fixed top-5 right-5 p-2.5 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md hover:bg-white transition-all z-50 border border-[#EDE4D8]" aria-label="Close">
    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-[#5D4037]" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
  </button>

  <div class="w-full max-w-sm">
    <div class="text-center mb-8">
      <a href="index.php"><img src="assets/logo.png" alt="Kesar Kosmetics" class="h-20 mx-auto object-contain drop-shadow-sm" /></a>
      <h1 class="font-heading text-3xl font-semibold text-[#3E2723] mt-5">Welcome back</h1>
      <p class="text-[#8A7768] mt-1.5 text-sm">Sign in to continue your journey</p>
    </div>

    <div class="bg-white rounded-3xl shadow-[0_8px_40px_rgba(62,39,35,0.1)] border border-[#EDE4D8] p-8">
      <div class="h-0.5 w-16 bg-gradient-to-r from-[#D97736] to-[#F5A800] rounded-full mx-auto mb-8"></div>

      <p id="login-error" class="hidden text-red-600 text-sm bg-red-50 rounded-xl px-3 py-2 mb-4"></p>

      <button id="google-btn" class="w-full flex items-center justify-center gap-3 border-2 border-[#EDE4D8] hover:border-[#D97736] rounded-2xl py-3.5 text-sm font-semibold text-[#3E2723] hover:bg-[#FFF8F0] transition-all shadow-sm hover:shadow-md">
        <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span id="google-btn-text">Continue with Google</span>
      </button>

      <p class="mt-6 text-center text-xs text-[#B0A090] leading-relaxed">
        New here? Clicking above creates your account automatically.
      </p>
    </div>

    <p class="text-center text-xs text-[#B0A090] mt-6">Protected by Firebase Authentication</p>
  </div>
</div>

<div id="toast-container"></div>

<script type="module">
import { loginWithGoogle, onUserChange, isAdmin } from './js/firebase-config.js';

const urlParams = new URLSearchParams(window.location.search);
const redirect = urlParams.get('redirect') || 'index.php';

// Already logged in
onUserChange((user) => {
  if (user) {
    window.location.href = isAdmin(user.email) ? 'admin/dashboard.php' : redirect;
  }
});

document.getElementById('google-btn').addEventListener('click', async () => {
  const btn = document.getElementById('google-btn');
  const btnText = document.getElementById('google-btn-text');
  const errEl = document.getElementById('login-error');
  btn.disabled = true; btnText.textContent = 'Signing in…';
  errEl.classList.add('hidden');
  try {
    const user = await loginWithGoogle();
    showToast(`Welcome, ${user.name}!`, 'success');
    setTimeout(() => {
      window.location.href = isAdmin(user.email) ? 'admin/dashboard.php' : redirect;
    }, 500);
  } catch (err) {
    if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
      errEl.textContent = 'Sign-in failed. Please try again.';
      errEl.classList.remove('hidden');
    }
  } finally {
    btn.disabled = false; btnText.textContent = 'Continue with Google';
  }
});

window.showToast = function(msg, type='info') {
  const c = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${type==='success'?'✓':'ℹ'}</span><span>${msg}</span>`;
  c.appendChild(el);
  setTimeout(() => el.remove(), 3000);
};
</script>
</body>
</html>
