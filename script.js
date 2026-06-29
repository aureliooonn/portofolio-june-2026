const loader = document.querySelector('.loading');

function hideLoader() {
    if (!loader) return;
    loader.style.transition = 'opacity 0.35s ease';
    loader.style.opacity = '0';
    setTimeout(() => {
        loader.style.display = 'none';
    }, 380);
}

function initScene() {
    if (typeof THREE === 'undefined') {
        throw new Error('Three.js is not available. Check the CDN script URL.');
    }

    const canvas = document.querySelector('#space-canvas');
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02030d, 0.014);

    const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.1, 120);
    camera.position.set(0, 0, 16);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x02030d, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    const pointLight = new THREE.PointLight(0x8fceff, 1.6, 45);
    pointLight.position.set(12, 10, 18);
    scene.add(ambientLight, pointLight);

    const planets = [];

    function createPlanet(radius, color, position, ringColor) {
        const geometry = new THREE.SphereGeometry(radius, 64, 64);
        const material = new THREE.MeshStandardMaterial({
            color,
            roughness: 0.22,
            metalness: 0.09,
            emissive: 0x061020,
            emissiveIntensity: 0.12,
        });

        const planet = new THREE.Mesh(geometry, material);
        planet.position.set(position[0], position[1], position[2]);
        scene.add(planet);

        if (ringColor) {
            const ringGeometry = new THREE.RingGeometry(radius * 1.25, radius * 1.45, 64);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: ringColor,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.35,
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            ring.position.copy(planet.position);
            scene.add(ring);
            return { mesh: planet, ring };
        }

        return { mesh: planet };
    }

    planets.push(createPlanet(2.2, 0x4d83ff, [-2.6, 0.2, -1.2], 0x73c5ff));
    planets.push(createPlanet(1.1, 0xffa770, [2.8, 0.7, -2.4], 0xffc28b));
    planets.push(createPlanet(0.85, 0xb07eff, [0.8, -1.8, -3.2], 0xd8b7ff));

    const atmosphere = new THREE.Mesh(
        new THREE.SphereGeometry(2.45, 64, 64),
        new THREE.MeshBasicMaterial({
            color: 0x82c7ff,
            transparent: true,
            opacity: 0.16,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
        })
    );
    atmosphere.position.copy(planets[0].mesh.position);
    scene.add(atmosphere);

    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2200;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
        starPositions[i] = (Math.random() - 0.5) * 140;
        starPositions[i + 1] = (Math.random() - 0.5) * 90;
        starPositions[i + 2] = (Math.random() - 0.5) * 120;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.05,
        opacity: 0.78,
        transparent: true,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    const glowGeometry = new THREE.TorusGeometry(4.8, 0.08, 16, 100);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x81d1ff,
        transparent: true,
        opacity: 0.12,
    });
    const glowRing = new THREE.Mesh(glowGeometry, glowMaterial);
    glowRing.rotation.x = Math.PI / 2.3;
    glowRing.position.set(-2.6, 0.2, -1.2);
    scene.add(glowRing);

    const mouse = { x: 0, y: 0 };
    window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    function resizeRenderer() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    window.addEventListener('resize', resizeRenderer);
    resizeRenderer();

    function animateScene() {
        requestAnimationFrame(animateScene);

        starField.rotation.y += 0.00012;
        glowRing.rotation.z += 0.0007;

        planets.forEach((planet, index) => {
            planet.mesh.rotation.y += 0.002 + index * 0.0004;
            if (planet.ring) planet.ring.rotation.z += 0.0026;
        });

        const targetX = mouse.x * 1.2;
        const targetY = mouse.y * 0.8;
        camera.position.x += (targetX - camera.position.x) * 0.04;
        camera.position.y += (targetY - camera.position.y) * 0.04;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    }

    animateScene();
}

function initAnimations() {
    if (typeof gsap === 'undefined') {
        throw new Error('GSAP is not available. Check the CDN script URL.');
    }

    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    gsap.from('.nav-links a', {
        opacity: 0,
        y: -16,
        duration: 0.9,
        stagger: 0.08,
        ease: 'power3.out',
    });

    gsap.from(
        '.hero-copy h1, .hero-copy .hero-text, .hero-stats, .hero-actions, .planet-card, .planet-summary',
        {
            opacity: 0,
            y: 30,
            duration: 1.1,
            stagger: 0.12,
            ease: 'power3.out',
        }
    );

    if (typeof ScrollTrigger !== 'undefined') {
        gsap.utils.toArray('.section').forEach((section) => {
            gsap.from(section.querySelectorAll('h2, p, .about-card, .project-card, .photo-card, .design-card, .contact-card'), {
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse',
                },
                opacity: 0,
                y: 30,
                duration: 1,
                ease: 'power3.out',
                stagger: 0.12,
            });
        });
    } else {
        initScrollRevealFallback();
    }
}

function initScrollRevealFallback() {
    const items = document.querySelectorAll('.section');
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.18 }
    );

    items.forEach((item) => {
        item.classList.add('scroll-fade-up');
        observer.observe(item);
    });
}

function initializePortfolio() {
    try {
        initScene();
        initAnimations();
    } catch (error) {
        console.error('Portfolio init failed:', error);
    } finally {
        hideLoader();
    }
}

window.addEventListener('load', initializePortfolio);
setTimeout(hideLoader, 4500);
