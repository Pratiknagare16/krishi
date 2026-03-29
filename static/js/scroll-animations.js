/* ===== SCROLL-ANIMATIONS.JS ===== */
/* Intersection Observer-based animations for scroll reveals */
/* Lightweight, performant, and accessible */

(function() {
  'use strict';

  // ===== INTERSECTION OBSERVER FOR SCROLL REVEALS =====
  
  /**
   * Initialize Intersection Observer for scroll-based animations
   * Watches elements with .scroll-reveal class or related classes
   */
  function initScrollAnimations() {
    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported. Scroll animations disabled.');
      return;
    }

    // Options for observer
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px', // Trigger when element is 50px before fully visible
      threshold: 0.1 // Trigger at 10% visibility
    };

    // Callback when element enters/leaves viewport
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Add 'revealed' class to trigger the animation
          entry.target.classList.add('revealed');
          // Optional: unobserve after animating to improve performance
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all scroll-reveal elements
    const revealElements = document.querySelectorAll(
      '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale'
    );

    revealElements.forEach((element) => {
      observer.observe(element);
    });
  }

  // ===== PAGE LOAD ANIMATIONS =====

  /**
   * Add fade-in animation to page on load
   */
  function animatePageLoad() {
    // Add fade-in to body
    document.body.classList.add('animate-fade-in');

    // Animate header
    const header = document.querySelector('header');
    if (header) {
      header.classList.add('animate-slide-in-down');
    }

    // Animate first section (hero, intro, etc.)
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.classList.add('animate-fade-in');
    }

    // Stagger animate hero text elements if they exist
    const heroText = document.querySelector('.hero-text, .intro-text');
    if (heroText) {
      const textElements = heroText.querySelectorAll('h1, p, .hero-cta, .btn, [data-animate]');
      textElements.forEach((el, index) => {
        el.style.animation = `slideInUp 0.5s ease-out ${0.2 + index * 0.1}s forwards`;
        el.style.opacity = '0';
      });
    }
  }

  // ===== BUTTON INTERACTIONS =====

  /**
   * Add ripple effect to buttons on click
   */
  function initButtonRipple() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-hover-lift, button[class*="btn"]');
    
    buttons.forEach((button) => {
      button.addEventListener('click', function(e) {
        createRipple(this, e);
      });
    });
  }

  /**
   * Create ripple effect
   */
  function createRipple(button, event) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');

    // Remove existing ripple
    const existingRipple = button.querySelector('.ripple');
    if (existingRipple) {
      existingRipple.remove();
    }

    button.appendChild(ripple);

    // Auto-remove after animation
    setTimeout(() => ripple.remove(), 600);
  }

  // ===== CARD ANIMATIONS =====

  /**
   * Auto-add hover lift to cards
   */
  function initCardAnimations() {
    const cards = document.querySelectorAll('[class*="card"], [class*="Card"], .feature-card, .stat-card');
    
    cards.forEach((card) => {
      if (!card.classList.contains('card-hover-lift')) {
        card.classList.add('card-hover-lift');
      }
    });
  }

  // ===== LINK ANIMATIONS =====

  /**
   * Add smooth underline animation to links
   */
  function initLinkAnimations() {
    const navLinks = document.querySelectorAll('nav a, .nav-link, a[class*="link"]:not([class*="btn"])');
    
    navLinks.forEach((link) => {
      if (!link.classList.contains('link-hover-underline')) {
        link.classList.add('link-hover-underline');
      }
    });
  }

  // ===== IMAGE ANIMATIONS =====

  /**
   * Add zoom effect to images in certain containers
   */
  function initImageAnimations() {
    const imageContainers = document.querySelectorAll(
      '[class*="hero-visual"], [class*="feature-image"], [class*="product-image"], .img-container'
    );
    
    imageContainers.forEach((container) => {
      if (!container.classList.contains('img-hover-zoom')) {
        container.classList.add('img-hover-zoom');
      }
    });
  }

  // ===== NAVBAR SCROLL ANIMATION =====

  /**
   * Add shadow to navbar on scroll (similar to Apple)
   */
  function initNavbarScrollAnimation() {
    const header = document.querySelector('header, .header, nav[class*="header"]');
    if (!header) return;

    let previousScrollTop = 0;

    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;

      // Add shadow when scrolled down
      if (currentScroll > 20) {
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
        header.style.transition = 'box-shadow 0.3s ease-out';
      } else {
        header.style.boxShadow = 'none';
      }

      previousScrollTop = currentScroll;
    }, { passive: true });
  }

  // ===== STAGGERED LIST ANIMATIONS =====

  /**
   * Auto-apply stagger animation to lists
   */
  function initStaggerAnimations() {
    const lists = document.querySelectorAll('ul, ol, [role="list"]');
    
    lists.forEach((list) => {
      // Only apply if list has multiple items
      const items = list.querySelectorAll('li, [role="listitem"]');
      if (items.length > 0 && items.length <= 10) {
        items.forEach((item) => {
          item.classList.add('animate-stagger-item');
        });
      }
    });
  }

  // ===== LAZY LOAD PLACEHOLDER ANIMATIONS =====

  /**
   * Animate skeleton/placeholder loaders with shimmer
   */
  function initSkeletonAnimations() {
    const skeletons = document.querySelectorAll('[class*="skeleton"], [class*="loading"], [class*="placeholder"]');
    
    skeletons.forEach((skeleton) => {
      skeleton.classList.add('skeleton');
    });
  }

  // ===== FOCUS ANIMATIONS (ACCESSIBILITY) =====

  /**
   * Add smooth focus states for keyboard navigation
   */
  function initFocusAnimations() {
    const focusableElements = document.querySelectorAll('button, a, input, select, textarea');
    
    focusableElements.forEach((element) => {
      element.addEventListener('focus', function() {
        this.style.outline = 'none';
        this.style.boxShadow = `0 0 0 3px rgba(45, 158, 79, 0.2)`;
        this.style.transition = 'box-shadow 0.2s ease-out';
      });

      element.addEventListener('blur', function() {
        this.style.boxShadow = '';
      });
    });
  }

  // ===== MODAL/DIALOG ANIMATIONS =====

  /**
   * Auto-animate modals and dialogs
   */
  function initModalAnimations() {
    const modals = document.querySelectorAll('[role="dialog"], .modal, [class*="modal"], [class*="dialog"]');
    
    modals.forEach((modal) => {
      // Apply animations on show
      const originalStyle = modal.style.display;
      
      const observer = new MutationObserver(() => {
        if (modal.style.display !== 'none' && modal.style.display !== '') {
          modal.classList.add('animate-scale-in');
        }
      });

      observer.observe(modal, { attributes: true, attributeFilter: ['style', 'class'] });
    });
  }

  // ===== FORM ANIMATIONS =====

  /**
   * Animate form elements
   */
  function initFormAnimations() {
    const formInputs = document.querySelectorAll('input, textarea, select');
    
    formInputs.forEach((input) => {
      // Focus animation
      input.addEventListener('focus', function() {
        this.style.borderColor = 'var(--primary)';
        this.style.boxShadow = '0 0 0 3px rgba(45, 158, 79, 0.1)';
        this.style.transition = 'all 0.2s ease-out';
      });

      // Blur animation
      input.addEventListener('blur', function() {
        this.style.borderColor = '';
        this.style.boxShadow = '';
      });
    });
  }

  // ===== PAGE TRANSITION ANIMATION =====

  /**
   * Smooth page transitions using fade and slide
   */
  function initPageTransitions() {
    const links = document.querySelectorAll('a[href^="/"], a[href^="./"]');
    
    links.forEach((link) => {
      // Skip external links, anchors, and special links
      if (
        link.target === '_blank' ||
        link.href.includes('#') ||
        link.className.includes('btn-secondary') ||
        link.getAttribute('data-no-transition') === 'true'
      ) {
        return;
      }

      link.addEventListener('click', function(e) {
        // Only apply transition for local navigation
        const href = this.href;
        
        // Check if same page
        if (href === window.location.href) {
          e.preventDefault();
          return;
        }

        e.preventDefault();

        // Fade out current page
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.3s ease-out';

        // Navigate after fade
        setTimeout(() => {
          window.location.href = href;
        }, 300);
      });
    });
  }

  // ===== SCROLL TO TOP SMOOTH =====

  /**
   * Smooth scroll to top functionality
   */
  function initSmoothScrollTop() {
    const scrollTopBtn = document.querySelector('[class*="scroll-top"], #scrollTopBtn');
    
    if (scrollTopBtn) {
      scrollTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });

      // Show/hide button based on scroll
      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
          scrollTopBtn.style.opacity = '1';
          scrollTopBtn.style.pointerEvents = 'auto';
        } else {
          scrollTopBtn.style.opacity = '0';
          scrollTopBtn.style.pointerEvents = 'none';
        }
      }, { passive: true });
    }
  }

  // ===== PREVENT LAYOUT SHIFT DURING ANIMATIONS =====

  /**
   * Use CSS containment to improve animation performance
   */
  function initContainment() {
    const animatedElements = document.querySelectorAll(
      '[class*="animate-"], [class*="scroll-reveal"]'
    );
    
    animatedElements.forEach((el) => {
      if (!el.style.contain) {
        el.style.contain = 'layout style paint';
      }
    });
  }

  // ===== INITIALIZE ALL ANIMATIONS =====

  /**
   * Master initialization function
   * Called when DOM is ready
   */
  function initializeAllAnimations() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runAll);
    } else {
      runAll();
    }

    function runAll() {
      initScrollAnimations();
      animatePageLoad();
      initButtonRipple();
      initCardAnimations();
      initLinkAnimations();
      initImageAnimations();
      initNavbarScrollAnimation();
      initStaggerAnimations();
      initSkeletonAnimations();
      initFocusAnimations();
      initModalAnimations();
      initFormAnimations();
      initPageTransitions();
      initSmoothScrollTop();
      initContainment();

      console.log('✨ Krishi Officer Animation System Initialized');
    }
  }

  // Start everything
  initializeAllAnimations();

  // Export functions for manual use if needed
  window.ScrollAnimations = {
    createRipple,
    animatePageLoad,
    initScrollAnimations,
    forceScrollReveal: () => {
      document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale').forEach(el => {
        el.classList.add('revealed');
      });
    }
  };
})();
