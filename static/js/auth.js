(() => {
    // ===== AUTH MANAGEMENT =====
    window.getAuthHeaders = window.getAuthHeaders || (() => {
        const token = localStorage.getItem('krishi_access_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    });

    window.saveAuth = window.saveAuth || ((token, user) => {
        localStorage.setItem('krishi_access_token', token);
        localStorage.setItem('krishi_user', JSON.stringify(user));
    });

    window.logout = window.logout || (() => {
        localStorage.removeItem('krishi_access_token');
        localStorage.removeItem('krishi_user');
        window.location.href = '/';
    });

    window.authFetch = window.authFetch || (async (url, options = {}) => {
        const headers = { ...options.headers, ...window.getAuthHeaders() };
        const res = await fetch(url, { ...options, headers });
        if (res.status === 401) console.warn('Unauthorized request. Possible session expiration.');
        return res;
    });

    // ===== THEME MANAGEMENT =====
    const html = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    const saved = localStorage.getItem('krishi-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(saved || (prefersDark ? 'dark' : 'light'));

    function setTheme(theme) {
        html.setAttribute('data-theme', theme);
        if (themeToggle) themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('krishi-theme', theme);
    }
    themeToggle?.addEventListener('click', () => {
        setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });

    // ===== PASSWORD VISIBILITY TOGGLE =====
    document.querySelectorAll('.pw-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const inputId = btn.dataset.target;
            const input = document.getElementById(inputId);
            if (!input) return;
            const show = input.type === 'password';
            input.type = show ? 'text' : 'password';
            btn.textContent = show ? '🙈' : '👁️';
        });
    });

    // ===== INPUT VALIDATION HELPERS =====
    const validators = {
        name: (v) => v.trim().length >= 2 ? null : 'Name must be at least 2 characters.',
        email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : 'Please enter a valid email.',
        password: (v) => v.length >= 8 ? null : 'Password must be at least 8 characters.',
        confirmPassword: (v, form) => {
            const pw = form.querySelector('#password')?.value;
            return v === pw ? null : 'Passwords do not match.';
        },
    };

    function validateField(input, form) {
        const id = input.id;
        const rule = validators[id];
        const err = rule ? rule(input.value, form) : null;
        setFieldError(input, err);
        return !err;
    }

    function setFieldError(input, message) {
        const errEl = input.closest('.field-group')?.querySelector('.field-error');
        if (!errEl) return;
        if (message) {
            errEl.textContent = '⚠ ' + message;
            input.classList.add('error-field');
        } else {
            errEl.textContent = '';
            input.classList.remove('error-field');
        }
    }

    function clearAllErrors(form) {
        form.querySelectorAll('.error-field').forEach(f => f.classList.remove('error-field'));
        form.querySelectorAll('.field-error').forEach(e => e.textContent = '');
    }

    function showAlert(el, type, message) {
        el.className = `auth-alert ${type} show`;
        el.querySelector('.auth-alert-msg').textContent = message;
        el.querySelector('.auth-alert-icon').textContent = type === 'success' ? '✅' : '❌';
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function hideAlert(el) {
        el.className = 'auth-alert';
    }

    function setLoading(btn, on) {
        btn.disabled = on;
        btn.classList.toggle('loading', on);
    }

    // ===== SIGNUP FORM =====
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        // Live validation on blur
        signupForm.querySelectorAll('.auth-input').forEach(input => {
            input.addEventListener('blur', () => validateField(input, signupForm));
            input.addEventListener('input', () => {
                if (input.classList.contains('error-field')) validateField(input, signupForm);
            });
        });

        const alertBox = document.getElementById('signupAlert');
        const submitBtn = document.getElementById('signupBtn');

        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideAlert(alertBox);

            // Validate all fields
            const fields = [...signupForm.querySelectorAll('.auth-input')];
            const allValid = fields.reduce((acc, input) => validateField(input, signupForm) && acc, true);
            if (!allValid) return;

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            setLoading(submitBtn, true);
            try {
                const res = await fetch('/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                const data = await res.json();

                if (res.ok) {
                    showAlert(alertBox, 'success', '🎉 Account created! Redirecting to login…');
                    signupForm.reset();
                    clearAllErrors(signupForm);
                    setTimeout(() => { window.location.href = '/login'; }, 1800);
                } else {
                    const msg = data.error || data.msg || 'Signup failed. Please try again.';
                    showAlert(alertBox, 'error', msg);
                }
            } catch (err) {
                showAlert(alertBox, 'error', 'Network error. Please check your connection.');
            } finally {
                setLoading(submitBtn, false);
            }
        });
    }

    // ===== LOGIN FORM =====
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.querySelectorAll('.auth-input').forEach(input => {
            input.addEventListener('blur', () => validateField(input, loginForm));
            input.addEventListener('input', () => {
                if (input.classList.contains('error-field')) validateField(input, loginForm);
            });
        });

        const alertBox = document.getElementById('loginAlert');
        const submitBtn = document.getElementById('loginBtn');

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideAlert(alertBox);

            const fields = [...loginForm.querySelectorAll('.auth-input')];
            const allValid = fields.reduce((acc, input) => validateField(input, loginForm) && acc, true);
            if (!allValid) return;

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            setLoading(submitBtn, true);
            try {
                const res = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();

                if (res.ok && data.access_token) {
                    window.saveAuth(data.access_token, {
                        id: data.user,
                        name: data.name || data.email,
                        email: data.email
                    });
                    showAlert(alertBox, 'success', 'Welcome back! Redirecting…');
                    setTimeout(() => { window.location.href = '/dashboard'; }, 1000);
                } else {
                    const msg = data.error || data.msg || 'Invalid credentials. Please try again.';
                    showAlert(alertBox, 'error', msg);
                }
            } catch (err) {
                showAlert(alertBox, 'error', 'Network error. Please check your connection.');
            } finally {
                setLoading(submitBtn, false);
            }
        });
    }
})();
