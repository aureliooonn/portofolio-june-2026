const loader = document.querySelector('.loading');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function hideLoader() {
    if (!loader) return;
    loader.style.transition = 'opacity 0.28s ease';
    loader.style.opacity = '0';
    window.setTimeout(() => {
        loader.style.display = 'none';
    }, 320);
}

// Enhanced Navbar Interactivity
function initNavbarInteraction() {
    const navLinks = document.querySelectorAll('.nav-links a');
    const navBrand = document.querySelector('.nav-brand');

    // Add smooth scroll listener for active state
    const updateActiveLink = () => {
        const scrollPosition = window.scrollY + 100;

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!href.startsWith('#')) return;

            const section = document.querySelector(href);
            if (!section) return;

            const { offsetTop, offsetHeight } = section;
            const isActive = scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight;

            if (isActive) {
                navLinks.forEach(l => l.dataset.active = 'false');
                link.dataset.active = 'true';
            }
        });
    };

    // Enhance nav links with interactive effects
    navLinks.forEach((link, index) => {
        link.addEventListener('mouseenter', (e) => {
            navLinks.forEach((l, i) => {
                if (i !== index) {
                    l.style.opacity = '0.5';
                    l.style.transform = 'scale(0.95)';
                }
            });
        });

        link.addEventListener('mouseleave', () => {
            navLinks.forEach((l) => {
                l.style.opacity = '1';
                l.style.transform = 'scale(1)';
            });
        });

        link.addEventListener('click', (e) => {
            navLinks.forEach(l => l.dataset.active = 'false');
            link.dataset.active = 'true';
        });
    });

    // Navbar brand glow effect on scroll
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        if (scrolled > 100) {
            navBrand?.style.setProperty('--glow-opacity', '0.8');
        } else {
            navBrand?.style.setProperty('--glow-opacity', '0.4');
        }
        updateActiveLink();
    }, { passive: true });
}

// CSS 3D Moon — mouse-follow tilt (no Three.js)
function initMoonTilt() {
    const moon = document.getElementById('moon3d');
    if (!moon || reduceMotion) return;

    let mx = 0, my = 0, tx = 0, ty = 0;

    window.addEventListener('pointermove', function(e) {
        tx = (e.clientX / window.innerWidth - 0.5) * 2;
        ty = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    // Disable CSS float animation once JS takes over
    moon.style.animation = 'none';

    function tick() {
        mx += (tx - mx) * 0.06;
        my += (ty - my) * 0.06;
        moon.style.transform = 'rotateX(' + (-my * 15).toFixed(1) + 'deg) rotateY(' + (mx * 20).toFixed(1) + 'deg)';
        requestAnimationFrame(tick);
    }
    tick();
}

function initScrollRevealFallback() {
    const items = document.querySelectorAll('.section-heading, .profile-copy, .toolkit-panel, .profile-morph, .project-card, .visual-item, .contact-copy, .contact-card');

    if (!('IntersectionObserver' in window) || reduceMotion) {
        items.forEach((item) => item.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            });
        },
        { threshold: 0.16 }
    );

    items.forEach((item) => {
        item.classList.add('scroll-fade-up');
        observer.observe(item);
    });
}

function initProfileMorph() {
    const card = document.querySelector('[data-morph-card]');
    if (!card) return;

    let pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let morph = 0;
    let frame = 0;
    let hasPointer = false;

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function updateCard() {
        frame = 0;

        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.hypot(pointer.x - centerX, pointer.y - centerY);
        const influence = Math.max(rect.width, rect.height) * 0.92;
        const targetMorph = hasPointer ? clamp(1 - distance / influence, 0, 1) : 0;
        morph += (targetMorph - morph) * 0.16;

        const localX = clamp(((pointer.x - rect.left) / rect.width) * 100, 0, 100);
        const localY = clamp(((pointer.y - rect.top) / rect.height) * 100, 0, 100);
        const tiltY = reduceMotion ? 0 : (localX - 50) * 0.09 * morph;
        const tiltX = reduceMotion ? 0 : (50 - localY) * 0.08 * morph;

        card.style.setProperty('--morph', morph.toFixed(3));
        card.style.setProperty('--cursor-x', `${localX.toFixed(2)}%`);
        card.style.setProperty('--cursor-y', `${localY.toFixed(2)}%`);
        card.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
        card.classList.toggle('is-near', morph > 0.28);

        if (Math.abs(targetMorph - morph) > 0.002) {
            frame = window.requestAnimationFrame(updateCard);
        }
    }

    function requestUpdate() {
        if (!frame) frame = window.requestAnimationFrame(updateCard);
    }

    function handlePointerMove(event) {
        hasPointer = true;
        pointer = { x: event.clientX, y: event.clientY };
        requestUpdate();
    }

    function handlePointerLeave() {
        hasPointer = false;
        requestUpdate();
    }

    function handlePointerDown(event) {
        hasPointer = true;
        pointer = { x: event.clientX, y: event.clientY };
        morph = Math.max(morph, 0.82);
        requestUpdate();
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);
    window.addEventListener('blur', handlePointerLeave);
    window.addEventListener('resize', requestUpdate);
    requestUpdate();
}

function initAnimations() {
    if (reduceMotion || typeof gsap === 'undefined') {
        initScrollRevealFallback();
        return;
    }

    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    gsap.from('.nav-brand, .nav-links a', {
        opacity: 0,
        y: -14,
        duration: 0.7,
        stagger: 0.06,
        ease: 'power3.out',
    });

    gsap.from('.hero-copy .eyebrow, .hero-copy h1, .hero-copy p, .hero-actions, .profile-morph, .mission-panel', {
        opacity: 0,
        y: 34,
        duration: 1.05,
        stagger: 0.1,
        ease: 'power3.out',
    });

    if (typeof ScrollTrigger === 'undefined') {
        initScrollRevealFallback();
        return;
    }

    gsap.utils
        .toArray('.section-heading, .profile-copy, .toolkit-panel, .profile-morph, .project-card, .visual-item, .contact-copy, .contact-card')
        .forEach((item) => {
            gsap.from(item, {
                scrollTrigger: {
                    trigger: item,
                    start: 'top 86%',
                    toggleActions: 'play none none reverse',
                },
                opacity: 0,
                y: 34,
                duration: 0.8,
                ease: 'power3.out',
            });
        });
}

function initializePortfolio() {
    try {
        initMoonTilt();
    } catch (error) {
        console.error('Moon tilt init failed:', error);
    }

    try {
        initNavbarInteraction();
    } catch (error) {
        console.error('Navbar interaction init failed:', error);
    }

    try {
        initProfileMorph();
        initAnimations();
    } catch (error) {
        console.error('Animation init failed:', error);
        initScrollRevealFallback();
    } finally {
        hideLoader();
    }
}

window.addEventListener('load', initializePortfolio);
window.setTimeout(hideLoader, 2500);
