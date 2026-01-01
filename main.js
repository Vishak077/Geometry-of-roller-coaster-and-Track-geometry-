// Scene
const scene = new THREE.Scene();

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

// Controls (slow auto-rotation)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.autoRotate = true;
controls.autoRotateSpeed = 0.4;
controls.enableZoom = false;

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

// Track points (mathematical model)
const points = [];
for (let i = 0; i < 120; i++) {
    points.push(
        new THREE.Vector3(
            i - 60,
            Math.sin(i * 0.25) * 6,
            Math.cos(i * 0.25) * 6
        )
    );
}

const curve = new THREE.CatmullRomCurve3(points);

// Curvature-based coloring
const safeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff88 });
const unsafeMaterial = new THREE.MeshStandardMaterial({ color: 0xff4444 });

const segments = 100;
let previousTangent = curve.getTangentAt(0);

for (let i = 1; i <= segments; i++) {
    const t1 = (i - 1) / segments;
    const t2 = i / segments;

    const tangent = curve.getTangentAt(t2);
    const curvature = tangent.clone().sub(previousTangent).length();

    const material = curvature > 0.12 ? unsafeMaterial : safeMaterial;

    const segment = new THREE.Mesh(
        new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3([
                curve.getPointAt(t1),
                curve.getPointAt(t2)
            ]),
            20,
            0.45,
            8,
            false
        ),
        material
    );

    scene.add(segment);
    previousTangent = tangent.clone();
}

// Animation
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
