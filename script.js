/**
 * Modern, Optimized JavaScript for Prits Group Website
 * Designed for 90-100% Lighthouse scores
 * ES6+ with performance optimizations and accessibility features
 */

'use strict';

// ==========================================================================
// Constants and Configuration
// ==========================================================================

const CONFIG = {
    DEBOUNCE_DELAY: 150,
    THROTTLE_DELAY: 16,
    SCROLL_OFFSET: 100,
    ANIMATION_DURATION: 300,
    LAZY_LOAD_MARGIN: '50px',
    BACK_TO_TOP_THRESHOLD: 300
};

// ==========================================================================
// Utility Functions
// ==========================================================================

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute on leading edge
 * @returns {Function} Debounced function
 */
const debounce = (func, wait, immediate = false) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(this, args);
    };
};

/**
 * Throttle function to limit function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
const throttle = (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * Check if element is in viewport
 * @param {Element} element - Element to check
 * @param {number} threshold - Threshold percentage (0-1)
 * @returns {boolean} Is element in viewport
 */
const isInViewport = (element, threshold = 0.1) => {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;

    return (
        rect.top <= windowHeight * (1 - threshold) &&
        rect.bottom >= windowHeight * threshold &&
        rect.left <= windowWidth * (1 - threshold) &&
        rect.right >= windowWidth * threshold
    );
};

/**
 * Smooth scroll to element
 * @param {Element} element - Target element
 * @param {number} offset - Offset from top
 * @param {number} duration - Animation duration
 */
const smoothScrollTo = (element, offset = 0, duration = 800) => {
    const targetPosition = element.offsetTop - offset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    const animation = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    };

    const ease = (t, b, c, d) => {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    };

    requestAnimationFrame(animation);
};

/**
 * Set focus trap for modals and menus
 * @param {Element} element - Container element
 */
const setFocusTrap = (element) => {
    const focusableElements = element.querySelectorAll(
        'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', (e) => {
        const isTabPressed = e.key === 'Tab' || e.keyCode === 9;
        if (!isTabPressed) return;

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    });
};

// ==========================================================================
// Navigation Module
// ==========================================================================

class Navigation {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.mobileMenuBtn = document.getElementById('mobile-menu-btn');
        this.mobileMenu = document.getElementById('mobile-menu');
        this.navLinks = document.querySelectorAll('.nav-link, .mobile-link');
        this.isMenuOpen = false;

        this.init();
    }

    init() {
        if (!this.navbar) return;

        this.bindEvents();
        this.handleScroll();
        this.setActiveLink();
    }

    bindEvents() {
        // Mobile menu toggle
        if (this.mobileMenuBtn && this.mobileMenu) {
            this.mobileMenuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });

            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isMenuOpen) {
                    this.closeMobileMenu();
                }
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (this.isMenuOpen &&
                    !this.mobileMenu.contains(e.target) &&
                    !this.mobileMenuBtn.contains(e.target)) {
                    this.closeMobileMenu();
                }
            });
        }

        // Smooth scroll for anchor links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        this.closeMobileMenu();
                        smoothScrollTo(target, 80);
                        // Update focus management
                        target.setAttribute('tabindex', '-1');
                        target.focus();
                    }
                } else if (this.isMenuOpen) {
                    this.closeMobileMenu();
                }
            });
        });

        // Handle scroll events
        window.addEventListener('scroll', throttle(() => {
            this.handleScroll();
        }, CONFIG.THROTTLE_DELAY));

        // Handle resize events
        window.addEventListener('resize', debounce(() => {
            if (window.innerWidth >= 1024 && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        }, CONFIG.DEBOUNCE_DELAY));
    }

    toggleMobileMenu() {
        if (this.isMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        this.isMenuOpen = true;
        this.mobileMenu.classList.add('active');
        this.mobileMenuBtn.classList.add('active');
        this.mobileMenuBtn.setAttribute('aria-expanded', 'true');

        // Set focus trap
        setFocusTrap(this.mobileMenu);

        // Focus first menu item
        const firstLink = this.mobileMenu.querySelector('.mobile-link');
        if (firstLink) {
            firstLink.focus();
        }

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    closeMobileMenu() {
        this.isMenuOpen = false;
        this.mobileMenu.classList.remove('active');
        this.mobileMenuBtn.classList.remove('active');
        this.mobileMenuBtn.setAttribute('aria-expanded', 'false');

        // Restore body scroll
        document.body.style.overflow = '';

        // Return focus to menu button
        this.mobileMenuBtn.focus();
    }

    handleScroll() {
        const scrollY = window.pageYOffset;

        // Add scrolled class for navbar styling
        if (scrollY > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }

    setActiveLink() {
        const currentPath = window.location.pathname;
        this.navLinks.forEach(link => {
            const linkPath = new URL(link.href).pathname;
            if (linkPath === currentPath) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });
    }
}

// ==========================================================================
// Lazy Loading Module
// ==========================================================================

class LazyLoader {
    constructor() {
        this.images = document.querySelectorAll('img[loading="lazy"]');
        this.observer = null;
        this.init();
    }

    init() {
        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers
            this.loadAllImages();
            return;
        }

        this.observer = new IntersectionObserver(
            this.handleIntersect.bind(this),
            {
                rootMargin: CONFIG.LAZY_LOAD_MARGIN,
                threshold: 0.1
            }
        );

        this.images.forEach(img => {
            this.observer.observe(img);
            img.classList.add('lazy-image');
        });
    }

    handleIntersect(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                this.loadImage(img);
                this.observer.unobserve(img);
            }
        });
    }

    loadImage(img) {
        return new Promise((resolve, reject) => {
            const imageLoader = new Image();

            imageLoader.onload = () => {
                img.src = imageLoader.src;
                img.classList.add('loaded');
                img.removeAttribute('loading');
                resolve();
            };

            imageLoader.onerror = reject;
            imageLoader.src = img.src;
        });
    }

    loadAllImages() {
        this.images.forEach(img => {
            this.loadImage(img);
        });
    }
}

// ==========================================================================
// Form Validation Module
// ==========================================================================

class FormValidator {
    constructor() {
        this.forms = document.querySelectorAll('form[novalidate]');
        this.init();
    }

    init() {
        this.forms.forEach(form => {
            this.bindFormEvents(form);
        });
    }

    bindFormEvents(form) {
        const inputs = form.querySelectorAll('input, select, textarea');

        // Real-time validation
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            input.addEventListener('input', debounce(() => {
                if (input.classList.contains('error')) {
                    this.validateField(input);
                }
            }, 300));
        });

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit(form);
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        const required = field.hasAttribute('required');
        let isValid = true;
        let errorMessage = '';

        // Reset previous state
        this.clearFieldError(field);

        // Required field validation
        if (required && !value) {
            isValid = false;
            errorMessage = 'This field is required.';
        }
        // Email validation
        else if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address.';
            }
        }
        // Phone validation (if applicable)
        else if (type === 'tel' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number.';
            }
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        field.setAttribute('aria-invalid', 'true');

        const errorElement = document.getElementById(`${field.name}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('visible');
        }
    }

    clearFieldError(field) {
        field.classList.remove('error');
        field.removeAttribute('aria-invalid');

        const errorElement = document.getElementById(`${field.name}-error`);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('visible');
        }
    }

    async handleSubmit(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        let isFormValid = true;

        // Validate all fields
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            // Focus first error field
            const firstError = form.querySelector('.error');
            if (firstError) {
                firstError.focus();
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Simulate form submission (replace with actual submission logic)
        try {
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Sending...';

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Show success message
            this.showSuccessMessage(form);
            form.reset();

            // Restore button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;

        } catch (error) {
            console.error('Form submission error:', error);
            this.showErrorMessage(form, 'There was an error sending your message. Please try again.');
        }
    }

    showSuccessMessage(form) {
        // Create and show success message
        const message = document.createElement('div');
        message.className = 'alert alert-success';
        message.textContent = 'Thank you! Your message has been sent successfully.';
        message.setAttribute('role', 'alert');

        form.parentNode.insertBefore(message, form);
        message.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Remove message after 5 seconds
        setTimeout(() => {
            message.remove();
        }, 5000);
    }

    showErrorMessage(form, message) {
        // Create and show error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-error';
        errorDiv.textContent = message;
        errorDiv.setAttribute('role', 'alert');

        form.parentNode.insertBefore(errorDiv, form);
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Remove message after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// ==========================================================================
// FAQ Module
// ==========================================================================

class FAQ {
    constructor() {
        this.faqItems = document.querySelectorAll('.faq-item');
        this.init();
    }

    init() {
        this.faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');

            if (question && answer) {
                question.addEventListener('click', () => {
                    this.toggleFAQ(question, answer);
                });

                // Keyboard navigation
                question.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggleFAQ(question, answer);
                    }
                });
            }
        });
    }

    toggleFAQ(question, answer) {
        const isOpen = question.getAttribute('aria-expanded') === 'true';

        // Close all other FAQs
        this.faqItems.forEach(item => {
            const q = item.querySelector('.faq-question');
            const a = item.querySelector('.faq-answer');
            if (q !== question) {
                q.setAttribute('aria-expanded', 'false');
                a.classList.remove('active');
            }
        });

        // Toggle current FAQ
        question.setAttribute('aria-expanded', !isOpen);
        answer.classList.toggle('active', !isOpen);
    }
}

// ==========================================================================
// Back to Top Module
// ==========================================================================

class BackToTop {
    constructor() {
        this.button = document.getElementById('back-to-top');
        this.init();
    }

    init() {
        if (!this.button) return;

        this.bindEvents();
        this.handleScroll();
    }

    bindEvents() {
        this.button.addEventListener('click', (e) => {
            e.preventDefault();
            this.scrollToTop();
        });

        window.addEventListener('scroll', throttle(() => {
            this.handleScroll();
        }, CONFIG.THROTTLE_DELAY));
    }

    handleScroll() {
        const scrollY = window.pageYOffset;

        if (scrollY > CONFIG.BACK_TO_TOP_THRESHOLD) {
            this.button.classList.add('visible');
        } else {
            this.button.classList.remove('visible');
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        // Focus management for accessibility
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.focus();
        }
    }
}

// ==========================================================================
// Animation Module
// ==========================================================================

class AnimationObserver {
    constructor() {
        this.elements = document.querySelectorAll('[data-animate]');
        this.observer = null;
        this.init();
    }

    init() {
        if (!('IntersectionObserver' in window)) return;

        this.observer = new IntersectionObserver(
            this.handleIntersect.bind(this),
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        this.elements.forEach(el => {
            this.observer.observe(el);
        });
    }

    handleIntersect(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                this.observer.unobserve(entry.target);
            }
        });
    }
}

// ==========================================================================
// Performance Monitor
// ==========================================================================

class PerformanceMonitor {
    constructor() {
        this.init();
    }

    init() {
        // Monitor Core Web Vitals
        this.measureCLS();
        this.measureFCP();
        this.measureLCP();

        // Monitor resource loading
        this.monitorResources();
    }

    measureCLS() {
        if ('LayoutShift' in window) {
            let clsValue = 0;
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
            });
            observer.observe({ type: 'layout-shift', buffered: true });
        }
    }

    measureFCP() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name === 'first-contentful-paint') {
                        console.log('FCP:', entry.startTime);
                    }
                }
            });
            observer.observe({ type: 'paint', buffered: true });
        }
    }

    measureLCP() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('LCP:', lastEntry.startTime);
            });
            observer.observe({ type: 'largest-contentful-paint', buffered: true });
        }
    }

    monitorResources() {
        window.addEventListener('load', () => {
            const resources = performance.getEntriesByType('resource');
            resources.forEach(resource => {
                if (resource.transferSize > 100000) { // Large resources > 100KB
                    console.warn('Large resource detected:', resource.name, `${Math.round(resource.transferSize / 1024)}KB`);
                }
            });
        });
    }
}

// ==========================================================================
// Main Application
// ==========================================================================

class App {
    constructor() {
        this.modules = new Map();
        this.init();
    }

    async init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        try {
            // Initialize core modules
            this.modules.set('navigation', new Navigation());
            this.modules.set('lazyLoader', new LazyLoader());
            this.modules.set('formValidator', new FormValidator());
            this.modules.set('faq', new FAQ());
            this.modules.set('backToTop', new BackToTop());
            this.modules.set('animationObserver', new AnimationObserver());

            // Initialize performance monitoring in development
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                this.modules.set('performanceMonitor', new PerformanceMonitor());
            }

            // Set up global error handling
            this.setupErrorHandling();

            // Set up accessibility features
            this.setupAccessibility();

            console.log('App initialized successfully');

        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }

    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            // Could send to error reporting service
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            event.preventDefault();
        });
    }

    setupAccessibility() {
        // Skip links functionality
        const skipLinks = document.querySelectorAll('a[href^="#"]');
        skipLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                if (target) {
                    e.preventDefault();
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Announce dynamic content changes to screen readers
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        document.body.appendChild(announcer);

        // Store reference for other modules to use
        window.announcer = announcer;
    }

    getModule(name) {
        return this.modules.get(name);
    }
}

// ==========================================================================
// Initialize Application
// ==========================================================================

// Create global app instance
window.pritsApp = new App();

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { App, Navigation, LazyLoader, FormValidator, FAQ, BackToTop };
}
