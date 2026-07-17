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
    var canvas = document.querySelector('#space-canvas');
    var hero = document.querySelector('.hero-section');

    if (!canvas || !hero || typeof THREE === 'undefined') {
        markSceneFallback();
        return null;
    }

    // --- Scene ---
    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
    camera.position.set(0, 0, 18);

    var renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x05040a, 0);

    // --- Lighting (bright, multi-angle for moon shading) ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));

    var dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(6, 4, 10);
    scene.add(dirLight);

    var fillLight = new THREE.DirectionalLight(0x70d6ff, 0.6);
    fillLight.position.set(-8, -2, 6);
    scene.add(fillLight);

    var rimLight = new THREE.PointLight(0xffb86b, 1.4, 60);
    rimLight.position.set(-6, 8, -4);
    scene.add(rimLight);

    var bottomLight = new THREE.PointLight(0xc084fc, 0.7, 50);
    bottomLight.position.set(3, -8, 4);
    scene.add(bottomLight);

    // --- Moon (solid Phong material — guaranteed visible) ---
    var moonMesh = new THREE.Mesh(
        new THREE.SphereGeometry(3.8, 96, 96),
        new THREE.MeshPhongMaterial({
            color: 0xb8b4aa,
            emissive: 0x181612,
            emissiveIntensity: 0.15,
            shininess: 12,
            specular: 0x444444,
        })
    );
    moonMesh.position.set(4, 0, -3);
    scene.add(moonMesh);

    // Atmosphere glow shell
    var moonGlow = new THREE.Mesh(
        new THREE.SphereGeometry(4.3, 64, 64),
        new THREE.MeshBasicMaterial({
            color: 0x70d6ff,
            transparent: true,
            opacity: 0.08,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
        })
    );
    moonGlow.position.copy(moonMesh.position);
    scene.add(moonGlow);

    // Hover glow ring
    var glowRing = new THREE.Mesh(
        new THREE.RingGeometry(4.1, 4.5, 80),
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
    scene.add(glowRing);

    // Orbit rings
    var moonOrbitRing = new THREE.Mesh(
        new THREE.TorusGeometry(5.5, 0.008, 8, 200),
        new THREE.MeshBasicMaterial({ color: 0x70d6ff, transparent: true, opacity: 0.18 })
    );
    moonOrbitRing.position.copy(moonMesh.position);
    moonOrbitRing.rotation.set(Math.PI / 2.4, 0.2, -0.3);
    scene.add(moonOrbitRing);

    var moonOrbitRing2 = new THREE.Mesh(
        new THREE.TorusGeometry(6.8, 0.006, 8, 200),
        new THREE.MeshBasicMaterial({ color: 0xffb86b, transparent: true, opacity: 0.1 })
    );
    moonOrbitRing2.position.copy(moonMesh.position);
    moonOrbitRing2.rotation.set(Math.PI / 2.1, -0.3, 0.4);
    scene.add(moonOrbitRing2);

    // Small orbiting moons
    var miniMoons = [];
    [
        { r: 0.3, color: 0xffb86b, emissive: 0x2b1204, orbitR: 6.0, speed: 0.0006, tilt: 0.3 },
        { r: 0.2, color: 0xc084fc, emissive: 0x170a28, orbitR: 7.4, speed: 0.0004, tilt: -0.4 },
    ].forEach(function(cfg) {
        var m = new THREE.Mesh(
            new THREE.SphereGeometry(cfg.r, 24, 24),
            new THREE.MeshPhongMaterial({
                color: cfg.color,
                emissive: cfg.emissive,
                emissiveIntensity: 0.2,
                shininess: 8,
            })
        );
        m._orb = { orbitR: cfg.orbitR, speed: cfg.speed, tilt: cfg.tilt, a: Math.random() * Math.PI * 2 };
        scene.add(m);
        miniMoons.push(m);
    });

    // --- Starfield ---
    var starGeo = new THREE.BufferGeometry();
    var starN = 2600;
    var starPos = new Float32Array(starN * 3);
    for (var s = 0; s < starN * 3; s += 3) {
        starPos[s]     = (Math.random() - 0.5) * 180;
        starPos[s + 1] = (Math.random() - 0.5) * 120;
        starPos[s + 2] = (Math.random() - 0.5) * 160 - 20;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    var starField = new THREE.Points(starGeo, new THREE.PointsMaterial({
        color: 0xe8f3ff, size: 0.06, transparent: true, opacity: 0.85, depthWrite: false,
    }));
    scene.add(starField);

    // --- Nebula dust ---
    var dustGeo = new THREE.BufferGeometry();
    var dustN = 400;
    var dustPos = new Float32Array(dustN * 3);
    for (var d = 0; d < dustN * 3; d += 3) {
        dustPos[d]     = (Math.random() - 0.5) * 90;
        dustPos[d + 1] = (Math.random() - 0.5) * 55;
        dustPos[d + 2] = (Math.random() - 0.5) * 65 - 14;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    var nebulaDust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
        color: 0xc084fc, size: 0.18, transparent: true, opacity: 0.15, depthWrite: false,
    }));
    scene.add(nebulaDust);

    // --- Interaction state ---
    var pointer = { x: 0, y: 0 };
    var target = { x: 0, y: 0 };
    var moonTilt = { x: 0, y: 0 };
    var isHovering = false;

    function onPointerMove(e) {
        pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // Raycaster for hover detection
    var raycaster = new THREE.Raycaster();
    var mouseVec = new THREE.Vector2();

    canvas.addEventListener('pointermove', function(e) {
        var rect = canvas.getBoundingClientRect();
        mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouseVec, camera);
        isHovering = raycaster.intersectObject(moonMesh).length > 0;
        canvas.style.cursor = isHovering ? 'grab' : 'default';
    });
    canvas.addEventListener('pointerdown', function() {
        if (isHovering) canvas.style.cursor = 'grabbing';
    });
    canvas.addEventListener('pointerup', function() {
        canvas.style.cursor = isHovering ? 'grab' : 'default';
    });

    // --- Resize ---
    var baseX = 4;
    function resize() {
        var rect = hero.getBoundingClientRect();
        var w = Math.max(1, Math.floor(rect.width));
        var h = Math.max(1, Math.floor(rect.height));
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();

        if (w < 700) {
            camera.position.z = 24;
            baseX = 1.2;
        } else if (w < 1000) {
            camera.position.z = 20;
            baseX = 2.6;
        } else {
            camera.position.z = 18;
            baseX = 4;
        }
    }
    window.addEventListener('resize', resize);
    resize();

    // --- Animate ---
    var raf = 0;
    var startTime = Date.now();

    function animate() {
        raf = window.requestAnimationFrame(animate);

        var ms = reduceMotion ? 0.15 : 1;
        var t = (Date.now() - startTime) * 0.001;

        target.x += (pointer.x - target.x) * 0.04;
        target.y += (pointer.y - target.y) * 0.04;

        // Moon tilt toward cursor
        moonTilt.x += (target.y * 0.25 - moonTilt.x) * 0.06;
        moonTilt.y += (-target.x * 0.35 - moonTilt.y) * 0.06;

        moonMesh.rotation.y = t * 0.08;
        moonMesh.rotation.x = moonTilt.x;
        moonMesh.rotation.z = moonTilt.y * 0.12;

        // Float
        var fx = Math.cos(t * 0.2) * 0.08 * ms;
        var fy = Math.sin(t * 0.3) * 0.15 * ms;
        moonMesh.position.x = baseX + fx;
        moonMesh.position.y = fy;

        // Keep all attachments at moon position
        moonGlow.position.copy(moonMesh.position);
        glowRing.position.copy(moonMesh.position);
        moonOrbitRing.position.copy(moonMesh.position);
        moonOrbitRing2.position.copy(moonMesh.position);

        // Hover glow
        var gTgt = isHovering ? 0.2 : 0;
        glowRing.material.opacity += (gTgt - glowRing.material.opacity) * 0.08;
        var aTgt = isHovering ? 0.15 : 0.08;
        moonGlow.material.opacity += (aTgt - moonGlow.material.opacity) * 0.06;

        // Orbit rings spin
        moonOrbitRing.rotation.z += 0.0008 * ms;
        moonOrbitRing2.rotation.z -= 0.0005 * ms;

        // Mini moons orbit
        miniMoons.forEach(function(m) {
            var o = m._orb;
            o.a += o.speed * ms;
            m.position.x = moonMesh.position.x + Math.cos(o.a) * o.orbitR;
            m.position.y = moonMesh.position.y + Math.sin(o.a) * o.orbitR * Math.sin(o.tilt);
            m.position.z = moonMesh.position.z + Math.sin(o.a) * o.orbitR * Math.cos(o.tilt);
            m.rotation.y += 0.004 * ms;
        });

        // Stars & dust drift
        starField.rotation.y += 0.00006 * ms;
        nebulaDust.rotation.y -= 0.0001 * ms;

        // Camera follows pointer
        camera.position.x += (target.x * 0.5 - camera.position.x) * 0.02;
        camera.position.y += (target.y * 0.3 + 0.1 - camera.position.y) * 0.02;
        camera.lookAt(1, 0, -3);

        renderer.render(scene, camera);
    }
    animate();

    return function() {
        window.cancelAnimationFrame(raf);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('resize', resize);
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
