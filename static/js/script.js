(() => {
    // ===== AUTH MANAGEMENT =====
    window.getAuthHeaders = () => {
        const token = localStorage.getItem('krishi_access_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    window.saveAuth = (token, user) => {
        localStorage.setItem('krishi_access_token', token);
        localStorage.setItem('krishi_user', JSON.stringify(user));
    };

    window.logout = () => {
        localStorage.removeItem('krishi_access_token');
        localStorage.removeItem('krishi_user');
        window.location.href = '/';
    };

    window.authFetch = async (url, options = {}) => {
        const headers = {
            ...options.headers,
            ...window.getAuthHeaders()
        };
        const res = await fetch(url, { ...options, headers });
        if (res.status === 401) {
            // Token expired or invalid — usually you'd redirect to login
            console.warn('Unauthorized request. Possible session expiration.');
        }
        return res;
    };

    // ===== THEME MANAGEMENT =====
    const html = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');

    // Load saved preference or system default
    const savedTheme = localStorage.getItem('krishi-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

    setTheme(initialTheme);

    function setTheme(theme) {
        html.setAttribute('data-theme', theme);
        if (themeToggle) {
            themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
            themeToggle.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
        }
        localStorage.setItem('krishi-theme', theme);
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = html.getAttribute('data-theme');
            setTheme(current === 'dark' ? 'light' : 'dark');
        });
    }

    // ===== MOBILE HAMBURGER =====
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            mobileMenu.classList.toggle('open');
        });

        // Close on link click
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('open');
                mobileMenu.classList.remove('open');
            });
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
                hamburger.classList.remove('open');
                mobileMenu.classList.remove('open');
            }
        });
    }

    // ===== STICKY HEADER SHADOW =====
    const header = document.getElementById('header');
    const onScroll = () => {
        if (header) header.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ===== GET STARTED BUTTON =====
    const getStartedBtn = document.getElementById('getStartedBtn');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', (e) => {
            createRipple(getStartedBtn, e);
            setTimeout(() => { window.location.href = '/dashboard'; }, 280);
        });
    }

    // ===== RIPPLE EFFECT =====
    function createRipple(el, event) {
        const ripple = document.createElement('span');
        const rect = el.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.cssText = `
            width: ${size}px; height: ${size}px;
            left: ${event.clientX - rect.left - size / 2}px;
            top: ${event.clientY - rect.top - size / 2}px;
        `;
        ripple.className = 'ripple-effect';
        el.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
    }

    // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
    document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a[href^="#"]');
        if (!anchor) return;
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // ===== SCROLL-TRIGGERED ANIMATIONS =====
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.feature-card, .step-item').forEach((el, i) => {
        el.style.transitionDelay = `${i * 0.08}s`;
        observer.observe(el);
    });

    // ===== SUBTLE PARALLAX ON HERO =====
    const hero = document.querySelector('.hero');
    let raf;
    window.addEventListener('mousemove', (e) => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
            if (hero) {
                const mx = (e.clientX / window.innerWidth - 0.5) * 12;
                const my = (e.clientY / window.innerHeight - 0.5) * 12;
                hero.style.setProperty('--mouse-x', `${mx}px`);
                hero.style.setProperty('--mouse-y', `${my}px`);
            }
        });
    }, { passive: true });

})();
