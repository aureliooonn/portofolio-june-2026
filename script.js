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

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05040a, 0.016);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 180);
    camera.position.set(0, 0.1, 18);

    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x05040a, 0);

    scene.add(new THREE.AmbientLight(0x6f8fb5, 0.5));

    const keyLight = new THREE.PointLight(0x70d6ff, 2.1, 80);
    keyLight.position.set(10, 8, 16);
    scene.add(keyLight);

    const warmLight = new THREE.PointLight(0xffb86b, 1.35, 70);
    warmLight.position.set(-14, -6, 12);
    scene.add(warmLight);

    const violetLight = new THREE.PointLight(0xc084fc, 1.1, 60);
    violetLight.position.set(6, -8, 6);
    scene.add(violetLight);

    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    function makePlanet({ radius, color, emissive, position, roughness = 0.48, metalness = 0.08 }) {
        const geometry = new THREE.SphereGeometry(radius, 96, 96);
        const material = new THREE.MeshStandardMaterial({
            color,
            roughness,
            metalness,
            emissive,
            emissiveIntensity: 0.1,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(...position);
        orbitGroup.add(mesh);
        return mesh;
    }

    const mainPlanet = makePlanet({
        radius: 3.35,
        color: 0x315a9e,
        emissive: 0x08162d,
        position: [4.7, -0.15, -2.4],
        roughness: 0.34,
    });

    const planetTexture = new THREE.Group();
    mainPlanet.add(planetTexture);
    for (let i = 0; i < 10; i += 1) {
        const band = new THREE.Mesh(
            new THREE.TorusGeometry(3.37 + i * 0.003, 0.012, 8, 160),
            new THREE.MeshBasicMaterial({
                color: i % 2 === 0 ? 0x70d6ff : 0xffb86b,
                transparent: true,
                opacity: i % 2 === 0 ? 0.12 : 0.08,
            })
        );
        band.rotation.x = Math.PI / 2 + (i - 5) * 0.045;
        band.rotation.y = 0.24;
        planetTexture.add(band);
    }

    const ring = new THREE.Mesh(
        new THREE.RingGeometry(4.25, 5.05, 160),
        new THREE.MeshBasicMaterial({
            color: 0xffd4a3,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.26,
        })
    );
    ring.position.copy(mainPlanet.position);
    ring.rotation.set(Math.PI / 2.45, 0.16, -0.32);
    orbitGroup.add(ring);

    const atmosphere = new THREE.Mesh(
        new THREE.SphereGeometry(3.72, 96, 96),
        new THREE.MeshBasicMaterial({
            color: 0x70d6ff,
            transparent: true,
            opacity: 0.13,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
        })
    );
    atmosphere.position.copy(mainPlanet.position);
    orbitGroup.add(atmosphere);

    const moons = [
        makePlanet({ radius: 0.72, color: 0xffb86b, emissive: 0x2b1204, position: [-3.6, 2.2, -5.2] }),
        makePlanet({ radius: 0.48, color: 0xc084fc, emissive: 0x170a28, position: [0.2, -2.8, -3.8] }),
        makePlanet({ radius: 0.34, color: 0xe8f3ff, emissive: 0x102138, position: [-5.4, -0.8, -4.4] }),
    ];

    const orbitLines = [];
    [
        { radius: 6.4, color: 0x70d6ff, opacity: 0.13, rotation: [Math.PI / 2.52, 0.1, -0.1] },
        { radius: 8.2, color: 0xc084fc, opacity: 0.1, rotation: [Math.PI / 2.28, -0.2, 0.2] },
        { radius: 10.2, color: 0xffb86b, opacity: 0.08, rotation: [Math.PI / 2.65, 0.24, -0.34] },
    ].forEach((item) => {
        const orbit = new THREE.Mesh(
            new THREE.TorusGeometry(item.radius, 0.01, 8, 220),
            new THREE.MeshBasicMaterial({
                color: item.color,
                transparent: true,
                opacity: item.opacity,
            })
        );
        orbit.rotation.set(...item.rotation);
        orbit.position.set(1.7, -0.1, -4);
        orbitGroup.add(orbit);
        orbitLines.push(orbit);
    });

    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2600;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
        starPositions[i] = (Math.random() - 0.5) * 170;
        starPositions[i + 1] = (Math.random() - 0.5) * 110;
        starPositions[i + 2] = (Math.random() - 0.5) * 150 - 18;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    const starField = new THREE.Points(
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

    const dustGeometry = new THREE.BufferGeometry();
    const dustCount = 460;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
        dustPositions[i] = (Math.random() - 0.5) * 80;
        dustPositions[i + 1] = (Math.random() - 0.5) * 50;
        dustPositions[i + 2] = (Math.random() - 0.5) * 60 - 12;
    }
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const nebulaDust = new THREE.Points(
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

    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    function updatePointer(event) {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    window.addEventListener('pointermove', updatePointer, { passive: true });

    function resizeRenderer() {
        const rect = hero.getBoundingClientRect();
        const width = Math.max(1, Math.floor(rect.width));
        const height = Math.max(1, Math.floor(rect.height));
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        if (width < 700) {
            camera.position.z = 22;
            mainPlanet.position.set(1.8, 1.5, -4.6);
            ring.position.copy(mainPlanet.position);
            atmosphere.position.copy(mainPlanet.position);
        } else if (width < 1000) {
            camera.position.z = 20;
            mainPlanet.position.set(2.8, 0.9, -3.5);
            ring.position.copy(mainPlanet.position);
            atmosphere.position.copy(mainPlanet.position);
        } else {
            camera.position.z = 18;
            mainPlanet.position.set(4.7, -0.15, -2.4);
            ring.position.copy(mainPlanet.position);
            atmosphere.position.copy(mainPlanet.position);
        }
    }

    window.addEventListener('resize', resizeRenderer);
    resizeRenderer();

    let animationId = 0;

    function animateScene() {
        animationId = window.requestAnimationFrame(animateScene);

        target.x += (pointer.x - target.x) * 0.045;
        target.y += (pointer.y - target.y) * 0.045;

        const motionScale = reduceMotion ? 0.18 : 1;
        mainPlanet.rotation.y += 0.0024 * motionScale;
        mainPlanet.rotation.x += 0.00035 * motionScale;
        planetTexture.rotation.z += 0.001 * motionScale;
        ring.rotation.z += 0.0016 * motionScale;
        atmosphere.rotation.y -= 0.001 * motionScale;

        moons.forEach((moon, index) => {
            moon.rotation.y += (0.003 + index * 0.001) * motionScale;
            moon.position.x += Math.sin(Date.now() * 0.00022 + index) * 0.0014 * motionScale;
            moon.position.y += Math.cos(Date.now() * 0.00018 + index) * 0.001 * motionScale;
        });

        orbitLines.forEach((orbit, index) => {
            orbit.rotation.z += (0.00045 + index * 0.00018) * motionScale;
        });

        starField.rotation.y += 0.00008 * motionScale;
        nebulaDust.rotation.y -= 0.00012 * motionScale;
        orbitGroup.rotation.y = target.x * 0.075;
        orbitGroup.rotation.x = target.y * 0.04;

        camera.position.x += (target.x * 0.7 - camera.position.x) * 0.025;
        camera.position.y += (target.y * 0.45 + 0.1 - camera.position.y) * 0.025;
        camera.lookAt(0.8, 0, -3.2);

        renderer.render(scene, camera);
    }

    animateScene();

    return () => {
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
