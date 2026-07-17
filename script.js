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

function markSceneFallback() {
    document.body.classList.add('scene-fallback');
}

function initScene() {
    const canvas = document.querySelector('#space-canvas');
    const hero = document.querySelector('.hero-section');

    if (!canvas || !hero || typeof THREE === 'undefined') {
        markSceneFallback();
        return null;
    }

    // --- Procedural Moon Texture ---
    function createMoonTexture(size) {
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const ctx = c.getContext('2d');

        // Base gradient
        const grad = ctx.createRadialGradient(size * 0.42, size * 0.38, 0, size * 0.5, size * 0.5, size * 0.55);
        grad.addColorStop(0, '#d4d0c8');
        grad.addColorStop(0.35, '#c8c4ba');
        grad.addColorStop(0.7, '#b8b4aa');
        grad.addColorStop(1, '#8a8578');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);

        // Mare (dark plains)
        const mareRegions = [
            { x: 0.38, y: 0.32, rx: 0.16, ry: 0.12 },
            { x: 0.55, y: 0.45, rx: 0.13, ry: 0.1 },
            { x: 0.3,  y: 0.58, rx: 0.11, ry: 0.09 },
            { x: 0.62, y: 0.28, rx: 0.09, ry: 0.07 },
            { x: 0.45, y: 0.65, rx: 0.14, ry: 0.1 },
        ];
        mareRegions.forEach(function(m) {
            ctx.fillStyle = 'rgba(120, 116, 108, 0.28)';
            ctx.beginPath();
            ctx.ellipse(m.x * size, m.y * size, m.rx * size, m.ry * size, 0, 0, Math.PI * 2);
            ctx.fill();
        });

        // Large craters
        var craters = [];
        for (var i = 0; i < 50; i++) {
            craters.push({
                x: Math.random(),
                y: Math.random(),
                r: 0.008 + Math.random() * 0.035,
            });
        }
        craters.forEach(function(cr) {
            var cx = cr.x * size;
            var cy = cr.y * size;
            var crR = cr.r * size;

            // Rim
            ctx.beginPath();
            ctx.arc(cx, cy, crR, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(160, 155, 145, 0.32)';
            ctx.lineWidth = Math.max(1, crR * 0.22);
            ctx.stroke();

            // Shadow
            ctx.beginPath();
            ctx.arc(cx + crR * 0.22, cy + crR * 0.22, crR * 0.75, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(90, 86, 78, 0.14)';
            ctx.fill();

            // Highlight
            ctx.beginPath();
            ctx.arc(cx - crR * 0.2, cy - crR * 0.2, crR * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(220, 216, 208, 0.12)';
            ctx.fill();
        });

        // Tiny crater dots
        for (var j = 0; j < 200; j++) {
            var tx = Math.random() * size;
            var ty = Math.random() * size;
            var tr = 0.5 + Math.random() * 2;
            ctx.beginPath();
            ctx.arc(tx, ty, tr, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(100, 96, 88, ' + (0.08 + Math.random() * 0.14) + ')';
            ctx.fill();
        }

        // Surface noise (subtle)
        var imgData = ctx.getImageData(0, 0, size, size);
        var d = imgData.data;
        for (var k = 0; k < d.length; k += 4) {
            var noise = (Math.random() - 0.5) * 12;
            d[k]     = Math.min(255, Math.max(0, d[k] + noise));
            d[k + 1] = Math.min(255, Math.max(0, d[k + 1] + noise));
            d[k + 2] = Math.min(255, Math.max(0, d[k + 2] + noise));
        }
        ctx.putImageData(imgData, 0, 0);

        return new THREE.CanvasTexture(c);
    }

    var moonTexture = createMoonTexture(2048);

    // --- Scene Setup ---
    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05040a, 0.012);

    var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
    camera.position.set(0, 0.2, 16);

    var renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x05040a, 0);

    // --- Lighting ---
    scene.add(new THREE.AmbientLight(0x6f8fb5, 0.4));

    var keyLight = new THREE.PointLight(0x70d6ff, 2.8, 90);
    keyLight.position.set(8, 6, 14);
    scene.add(keyLight);

    var warmLight = new THREE.PointLight(0xffb86b, 1.6, 70);
    warmLight.position.set(-12, -4, 10);
    scene.add(warmLight);

    var violetLight = new THREE.PointLight(0xc084fc, 0.9, 60);
    violetLight.position.set(4, -10, 6);
    scene.add(violetLight);

    // --- Moon ---
    var moonGroup = new THREE.Group();
    scene.add(moonGroup);

    var moonMesh = new THREE.Mesh(
        new THREE.SphereGeometry(3.6, 128, 128),
        new THREE.MeshStandardMaterial({
            map: moonTexture,
            roughness: 0.82,
            metalness: 0.02,
            emissive: 0x0e0d0a,
            emissiveIntensity: 0.08,
        })
    );
    moonMesh.position.set(3.8, 0, -3);
    moonGroup.add(moonMesh);

    // Atmosphere glow
    var moonGlow = new THREE.Mesh(
        new THREE.SphereGeometry(4.1, 96, 96),
        new THREE.MeshBasicMaterial({
            color: 0x70d6ff,
            transparent: true,
            opacity: 0.09,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
        })
    );
    moonGlow.position.copy(moonMesh.position);
    moonGroup.add(moonGlow);

    // Hover glow ring
    var glowRing = new THREE.Mesh(
        new THREE.RingGeometry(3.9, 4.3, 96),
        new THREE.MeshBasicMaterial({
            color: 0x70d6ff,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
        })
    );
    glowRing.position.copy(moonMesh.position);
    glowRing.rotation.set(Math.PI / 2.5, 0.15, -0.2);
    moonGroup.add(glowRing);

    // Orbit ring around moon
    var moonOrbitRing = new THREE.Mesh(
        new THREE.TorusGeometry(5.2, 0.008, 8, 200),
        new THREE.MeshBasicMaterial({
            color: 0x70d6ff,
            transparent: true,
            opacity: 0.18,
        })
    );
    moonOrbitRing.position.copy(moonMesh.position);
    moonOrbitRing.rotation.set(Math.PI / 2.4, 0.2, -0.3);
    moonGroup.add(moonOrbitRing);

    // Second orbit ring (amber)
    var moonOrbitRing2 = new THREE.Mesh(
        new THREE.TorusGeometry(6.4, 0.006, 8, 200),
        new THREE.MeshBasicMaterial({
            color: 0xffb86b,
            transparent: true,
            opacity: 0.1,
        })
    );
    moonOrbitRing2.position.copy(moonMesh.position);
    moonOrbitRing2.rotation.set(Math.PI / 2.1, -0.3, 0.4);
    moonGroup.add(moonOrbitRing2);

    // Small decorative moons orbiting
    var miniMoons = [];
    [
        { radius: 0.32, color: 0xffb86b, emissive: 0x2b1204, orbitR: 5.8, speed: 0.0006, tilt: 0.3 },
        { radius: 0.22, color: 0xc084fc, emissive: 0x170a28, orbitR: 7.0, speed: 0.0004, tilt: -0.4 },
    ].forEach(function(cfg) {
        var m = new THREE.Mesh(
            new THREE.SphereGeometry(cfg.radius, 32, 32),
            new THREE.MeshStandardMaterial({
                color: cfg.color,
                emissive: cfg.emissive,
                emissiveIntensity: 0.15,
                roughness: 0.5,
                metalness: 0.1,
            })
        );
        m.userData = { orbitR: cfg.orbitR, speed: cfg.speed, tilt: cfg.tilt, angle: Math.random() * Math.PI * 2 };
        m.position.copy(moonMesh.position);
        moonGroup.add(m);
        miniMoons.push(m);
    });

    // --- Starfield ---
    var starGeometry = new THREE.BufferGeometry();
    var starCount = 2800;
    var starPositions = new Float32Array(starCount * 3);
    for (var i = 0; i < starCount * 3; i += 3) {
        starPositions[i]     = (Math.random() - 0.5) * 180;
        starPositions[i + 1] = (Math.random() - 0.5) * 120;
        starPositions[i + 2] = (Math.random() - 0.5) * 160 - 20;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    var starField = new THREE.Points(
        starGeometry,
        new THREE.PointsMaterial({
            color: 0xe8f3ff,
            size: 0.055,
            transparent: true,
            opacity: 0.82,
            depthWrite: false,
        })
    );
    scene.add(starField);

    // --- Nebula Dust ---
    var dustGeometry = new THREE.BufferGeometry();
    var dustCount = 500;
    var dustPositions = new Float32Array(dustCount * 3);
    for (var d = 0; d < dustCount * 3; d += 3) {
        dustPositions[d]     = (Math.random() - 0.5) * 90;
        dustPositions[d + 1] = (Math.random() - 0.5) * 55;
        dustPositions[d + 2] = (Math.random() - 0.5) * 65 - 14;
    }
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    var nebulaDust = new THREE.Points(
        dustGeometry,
        new THREE.PointsMaterial({
            color: 0xc084fc,
            size: 0.16,
            transparent: true,
            opacity: 0.18,
            depthWrite: false,
        })
    );
    scene.add(nebulaDust);

    // --- Interaction ---
    var pointer = { x: 0, y: 0 };
    var target = { x: 0, y: 0 };
    var moonTargetRot = { x: 0, y: 0 };
    var moonCurrentRot = { x: 0, y: 0 };
    var isHovering = false;

    function updatePointer(event) {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    window.addEventListener('pointermove', updatePointer, { passive: true });

    // Hover detection on moon
    var raycaster = new THREE.Raycaster();
    var mouseVec = new THREE.Vector2();

    canvas.addEventListener('pointermove', function(e) {
        var rect = canvas.getBoundingClientRect();
        mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouseVec, camera);
        var hits = raycaster.intersectObject(moonMesh);
        isHovering = hits.length > 0;
        canvas.style.cursor = isHovering ? 'grab' : 'default';
    });

    canvas.addEventListener('pointerdown', function() {
        if (isHovering) canvas.style.cursor = 'grabbing';
    });
    canvas.addEventListener('pointerup', function() {
        canvas.style.cursor = isHovering ? 'grab' : 'default';
    });

    // --- Resize ---
    function resizeRenderer() {
        var rect = hero.getBoundingClientRect();
        var w = Math.max(1, Math.floor(rect.width));
        var h = Math.max(1, Math.floor(rect.height));
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();

        if (w < 700) {
            camera.position.z = 22;
            moonMesh.position.set(1.5, 1.2, -5);
        } else if (w < 1000) {
            camera.position.z = 19;
            moonMesh.position.set(2.5, 0.6, -3.8);
        } else {
            camera.position.z = 16;
            moonMesh.position.set(3.8, 0, -3);
        }

        moonGlow.position.copy(moonMesh.position);
        glowRing.position.copy(moonMesh.position);
        moonOrbitRing.position.copy(moonMesh.position);
        moonOrbitRing2.position.copy(moonMesh.position);
    }

    window.addEventListener('resize', resizeRenderer);
    resizeRenderer();

    // --- Animate ---
    var animationId = 0;

    function animateScene() {
        animationId = window.requestAnimationFrame(animateScene);

        target.x += (pointer.x - target.x) * 0.04;
        target.y += (pointer.y - target.y) * 0.04;

        var ms = reduceMotion ? 0.15 : 1;

        // Moon follows mouse with tilt
        moonTargetRot.y = target.x * 0.35;
        moonTargetRot.x = -target.y * 0.2;
        moonCurrentRot.x += (moonTargetRot.x - moonCurrentRot.x) * 0.06;
        moonCurrentRot.y += (moonTargetRot.y - moonCurrentRot.y) * 0.06;

        moonMesh.rotation.y += 0.0012 * ms;
        moonMesh.rotation.x = moonCurrentRot.x;
        moonMesh.rotation.z = moonCurrentRot.y * 0.15;

        // Moon subtle float
        var floatY = Math.sin(Date.now() * 0.0003) * 0.12 * ms;
        var floatX = Math.cos(Date.now() * 0.0002) * 0.06 * ms;
        moonMesh.position.y = (hero.clientWidth < 700 ? 1.2 : 0) + floatY;
        moonMesh.position.x = (hero.clientWidth < 700 ? 1.5 : hero.clientWidth < 1000 ? 2.5 : 3.8) + floatX;

        // Update glow positions to match moon
        moonGlow.position.copy(moonMesh.position);
        glowRing.position.copy(moonMesh.position);
        moonOrbitRing.position.copy(moonMesh.position);
        moonOrbitRing2.position.copy(moonMesh.position);

        // Hover glow effect
        var glowTarget = isHovering ? 0.22 : 0;
        glowRing.material.opacity += (glowTarget - glowRing.material.opacity) * 0.08;
        var atmoTarget = isHovering ? 0.16 : 0.09;
        moonGlow.material.opacity += (atmoTarget - moonGlow.material.opacity) * 0.06;

        // Orbit rings rotate
        moonOrbitRing.rotation.z += 0.0008 * ms;
        moonOrbitRing2.rotation.z -= 0.0005 * ms;

        // Mini moons orbit
        miniMoons.forEach(function(m) {
            var ud = m.userData;
            ud.angle += ud.speed * ms;
            m.position.x = moonMesh.position.x + Math.cos(ud.angle) * ud.orbitR;
            m.position.y = moonMesh.position.y + Math.sin(ud.angle) * ud.orbitR * Math.sin(ud.tilt);
            m.position.z = moonMesh.position.z + Math.sin(ud.angle) * ud.orbitR * Math.cos(ud.tilt);
            m.rotation.y += 0.003 * ms;
        });

        // Stars & dust drift
        starField.rotation.y += 0.00006 * ms;
        nebulaDust.rotation.y -= 0.0001 * ms;

        // Camera follows pointer subtly
        camera.position.x += (target.x * 0.6 - camera.position.x) * 0.02;
        camera.position.y += (target.y * 0.35 + 0.2 - camera.position.y) * 0.02;
        camera.lookAt(1.2, 0, -3);

        renderer.render(scene, camera);
    }

    animateScene();

    return function () {
        window.cancelAnimationFrame(animationId);
        window.removeEventListener('pointermove', updatePointer);
        window.removeEventListener('resize', resizeRenderer);
        renderer.dispose();
    };
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
        initScene();
    } catch (error) {
        console.error('Scene init failed:', error);
        markSceneFallback();
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
