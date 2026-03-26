/**
 * auth-guard.js — Centralised authentication & route-guard module.
 *
 * Usage (protected pages):   add <script src="...auth-guard.js"></script> FIRST,
 *                            then call initAuthGuard({ protected: true }) at page load.
 * Usage (public pages):      call initAuthGuard({ protected: false }) to redirect
 *                            already-logged-in users to the dashboard.
 */

// ─── Core helpers ────────────────────────────────────────────────────────────

window.getToken = () => localStorage.getItem('krishi_access_token');

window.getUser = () => {
    try { return JSON.parse(localStorage.getItem('krishi_user')) || {}; }
    catch { return {}; }
};

window.getAuthHeaders = () => {
    const token = window.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

window.saveAuth = (token, user) => {
    localStorage.setItem('krishi_access_token', token);
    localStorage.setItem('krishi_user', JSON.stringify(user));
};

window.clearAuth = () => {
    localStorage.removeItem('krishi_access_token');
    localStorage.removeItem('krishi_user');
};

window.authFetch = async (url, options = {}) => {
    const headers = { ...options.headers, ...window.getAuthHeaders() };
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
        // Token expired — kick back to login
        window.clearAuth();
        window.location.replace('/login?expired=1');
    }
    return res;
};

// ─── Logout ──────────────────────────────────────────────────────────────────

window.logout = () => {
    window.clearAuth();
    // Smooth fade-out before redirect
    document.body.style.transition = 'opacity 0.3s ease';
    document.body.style.opacity = '0';
    setTimeout(() => window.location.replace('/'), 320);
};

// ─── User UI hydration ───────────────────────────────────────────────────────

function hydrateUserInfo() {
    const user = window.getUser();
    const name = user.name || user.email || 'Farmer';
    const email = user.email || '';
    const initial = (user.name || user.email || 'F')[0].toUpperCase();

    // Avatar: initials-based dynamic URL
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2d9e4f&color=fff&size=128`;

    document.querySelectorAll('.sidebar-avatar').forEach(el => { el.src = avatarUrl; });
    document.querySelectorAll('.sidebar-user-name').forEach(el => { el.textContent = name; });
    document.querySelectorAll('.sidebar-user-email').forEach(el => {
        el.textContent = email || 'Krishi Farmer';
    });
}

// ─── Route Guard ─────────────────────────────────────────────────────────────

/**
 * @param {object} opts
 * @param {boolean} opts.protected  If true, redirect to /login when no token found.
 *                                  If false, redirect to /dashboard when token exists.
 */
window.initAuthGuard = function (opts = { protected: true }) {
    const token = window.getToken();

    if (opts.protected && !token) {
        // Save the intended URL so we can redirect back after login
        const intended = window.location.pathname + window.location.search;
        window.location.replace(`/login?redirect=${encodeURIComponent(intended)}`);
        return; // Stop further execution — page will redirect
    }

    if (!opts.protected && token) {
        // Already logged in — send to dashboard (or redirect param from login)
        const next = new URLSearchParams(window.location.search).get('redirect') || '/dashboard';
        window.location.replace(next);
        return;
    }

    // Page is accessible — hydrate UI
    if (token) hydrateUserInfo();

    // Wire up any logout buttons on the page
    document.querySelectorAll('[data-action="logout"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.logout();
        });
    });

    // Page-entry fade-in
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
    requestAnimationFrame(() => { document.body.style.opacity = '1'; });
};

// ─── Theme Toggle (shared) ───────────────────────────────────────────────────

(function () {
    const html = document.documentElement;
    const saved = localStorage.getItem('krishi-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved || (prefersDark ? 'dark' : 'light'));

    function applyTheme(t) {
        html.setAttribute('data-theme', t);
        const btn = document.getElementById('themeToggle');
        if (btn) btn.textContent = t === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('krishi-theme', t);
    }

    // Listen for toggle button (deferred — may not exist yet)
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
        });
    });
})();
