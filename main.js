// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05080c);

// Camera
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 15, 35);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;
controls.enableZoom = false;

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

// === CURVE MODEL (Mathematical Track) ===
const points = [];
for (let i = 0; i <= 120; i++) {
    points.push(
        new THREE.Vector3(
            i - 60,
            Math.sin(i * 0.25) * 6,
            Math.cos(i * 0.25) * 6
        )
    );
}

const curve = new THREE.CatmullRomCurve3(points);

// === TUBE GEOMETRY ===
const geometry = new THREE.TubeGeometry(curve, 300, 0.45, 10, false);

// === CURVATURE-BASED COLORING ===
const colors = [];
let prevTangent = curve.getTangentAt(0);

for (let i = 0; i <= 300; i++) {
    const t = i / 300;
    const tangent = curve.getTangentAt(t);
    const curvature = tangent.clone().sub(prevTangent).length();

    const color =
        curvature > 0.12
            ? new THREE.Color(0xff4444) // unsafe
            : new THREE.Color(0x00ff88); // safe

    for (let j = 0; j < geometry.parameters.radialSegments + 1; j++) {
        colors.push(color.r, color.g, color.b);
    }

    prevTangent = tangent.clone();
}

geometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(colors, 3)
);

// Material
const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    metalness: 0.4,
    roughness: 0.3
});

const track = new THREE.Mesh(geometry, material);
scene.add(track);

// === ANIMATE ===
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

