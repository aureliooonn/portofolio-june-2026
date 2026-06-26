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
    const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.set(0, 0, 8);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    const pointLight = new THREE.PointLight(0x88b7ff, 1.35, 28);
    pointLight.position.set(6, 5, 6);
    scene.add(ambientLight, pointLight);

    const earthGeometry = new THREE.SphereGeometry(2.25, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
        color: 0x4b7cff,
        roughness: 0.25,
        metalness: 0.08,
        emissive: 0x0c1f3d,
        emissiveIntensity: 0.15,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    const atmosphereGeometry = new THREE.SphereGeometry(2.35, 64, 64);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x86c6ff,
        transparent: true,
        opacity: 0.18,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 1800;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 120;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.04,
        opacity: 0.75,
        transparent: true,
    });
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

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
        earth.rotation.y += 0.0012;
        atmosphere.rotation.y += 0.0009;
        earth.rotation.x += (mouse.y * 0.12 - earth.rotation.x) * 0.05;
        earth.rotation.y += (mouse.x * 0.18 - earth.rotation.y) * 0.05;
        starField.rotation.y += 0.00008;
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

    gsap.from('.hero-copy h1, .hero-copy .hero-text, .hero-stats, .hero-actions, .hero-avatar', {
        opacity: 0,
        y: 30,
        duration: 1.1,
        stagger: 0.12,
        ease: 'power3.out',
    });

    if (typeof ScrollTrigger !== 'undefined') {
        gsap.utils.toArray('.section').forEach((section) => {
            gsap.from(section.children, {
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse',
                },
                opacity: 0,
                y: 30,
                duration: 1,
                ease: 'power3.out',
                stagger: 0.1,
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
