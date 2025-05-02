// --- Mobile Menu Toggle ---
const menuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const menuLinks = mobileMenu.querySelectorAll('.mobile-menu-link');

const toggleMenu = () => {
    const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', !isExpanded);

    mobileMenu.classList.toggle('opacity-0');
    mobileMenu.classList.toggle('opacity-100');
    mobileMenu.classList.toggle('-translate-y-4'); // Start slightly above
    mobileMenu.classList.toggle('translate-y-0'); // Move to position
    mobileMenu.classList.toggle('pointer-events-none'); // Disable clicks when hidden
    mobileMenu.classList.toggle('pointer-events-auto'); // Enable clicks when visible
};

menuButton.addEventListener('click', toggleMenu);

menuLinks.forEach(link => {
    link.addEventListener('click', () => {
        // Close menu after clicking a link if menu is open
        if (menuButton.getAttribute('aria-expanded') === 'true') {
            toggleMenu();
        }
    });
});
// Initialize aria-expanded state and mobile menu state
menuButton.setAttribute('aria-expanded', 'false');
mobileMenu.classList.add('opacity-0', '-translate-y-4', 'pointer-events-none');


// --- Three.js Background Animation ---
let scene, camera, renderer, stars, starGeo;

function initThreeJS() {
    // Scene setup
    scene = new THREE.Scene();

    // Camera setup
    // Camera at origin (0,0,0), looking towards negative Z by default
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000); // Far clip plane adjusted
    camera.position.z = 0;

    // Renderer setup
    const canvas = document.getElementById('bg-canvas');
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true, // Smoother lines
        alpha: true // Allow transparency
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background

    // Star geometry and material
    starGeo = new THREE.BufferGeometry();
    const starVertices = [];
    const numStars = 8000; // Number of stars
    const spread = 1000; // How far stars spread out in X and Y
    const depth = 2000; // Depth of the starfield in Z

    for (let i = 0; i < numStars; i++) {
        const x = (Math.random() - 0.5) * spread;
        const y = (Math.random() - 0.5) * spread;
        const z = -Math.random() * depth; // Generate stars behind the camera (negative Z)
        starVertices.push(x, y, z);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

    let sprite = new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAADMSURBVDjLY/j//z8DJZiBLgZkzDCgAl0Ds////wP///8Z+P//P8OQbNAApQZIDQoD8v9/UHJg+P//P0MbP3/+ZMz/AQMDAwMDw58/f2Z49uxZDAwMDAwM3L9/n+H79+8Mhv//zDCgAeQkIsz/DAwMDAx8/vz5gZmBgaERDAwMDAzMAgyAAAMAQjZkQpGNAMsAAAAASUVORK5ErkJggg=='); // Simple white dot texture
    let starMaterial = new THREE.PointsMaterial({
        color: 0x0ea5e9, // Cyan color for stars
        size: 0.7, // Adjust size of stars
        map: sprite,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false // Prevents issues with overlapping transparency
    });

    stars = new THREE.Points(starGeo, starMaterial);
    scene.add(stars);

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Start animation
    animate();
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    // Move stars towards the camera and wrap around
    const positions = starGeo.attributes.position.array;
    const speed = 2; // Speed at which stars move (adjust as needed)
    const resetZ = -2000; // Z position to reset stars to (should be consistent with depth)


    for (let i = 2; i < positions.length; i += 3) {
        // positions[i] is the Z coordinate
        positions[i] += speed; // Move star towards camera (positive Z)

        // If the star moves past the camera (Z > 0)
        if (positions[i] > 0) {
             positions[i] = resetZ; // Reset its Z position far back
        }
    }
    starGeo.attributes.position.needsUpdate = true; // Tell Three.js the positions have changed

    // Optional: Slight rotation for a subtle effect
    // if (stars) {
    //     stars.rotation.z += 0.0002;
    // }


    renderer.render(scene, camera);
    requestAnimationFrame(animate); // Loop
}

// Initialize Three.js after the window loads
window.onload = function() {
    try {
        initThreeJS();
    } catch (error) {
        console.error("Three.js initialization failed:", error);
        // Optionally hide the canvas or display a fallback message
        const canvas = document.getElementById('bg-canvas');
        if (canvas) canvas.style.display = 'none';
    }
};