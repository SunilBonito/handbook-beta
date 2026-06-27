/* ============================================================
   3D viewer using three.js
   - Procedural cabinet geometry (placeholder for the real SKP→GLB)
   - OrbitControls for rotate/zoom/pan
   - View presets (iso/front/side/top)
   - Wireframe toggle
   ============================================================ */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ===== Configuration ===========================
// Real cabinet GLB converted from SKP via 3DS export
const GLB_URL = 'models/cabinet.glb';

// Brand-aligned colors (match the page CSS palette)
const COLORS = {
  pu_dark:   0x1F1F1D,   // PU 4009 MT body
  pu_groove: 0x0A0A0A,   // deeper for groove shadows
  edge:      0x3A3A38,   // subtle edge highlight
  hinge:     0x7A7A75,   // metal hinge tone
  back:      0x2A2A28,   // back panel (slightly lighter than body)
};

// ===== Three.js scene setup ====================
const container = document.getElementById('threeCanvas');
const width = container.clientWidth;
const height = container.clientHeight;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xF2F0EA);  // warm off-white — matches page bone palette, lets the matte black cabinet pop without harsh contrast

const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
const ISO_POSITION = new THREE.Vector3(1.6, 1.2, 1.8);
camera.position.copy(ISO_POSITION);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// ===== Lighting ================================
// Gallery-style soft lighting tuned for a matte BLACK cabinet on warm OFF-WHITE.
// White bounces ambient back, so we need less direct light than on dark backgrounds.
// Goal: edges visible, soft shadow on floor, no harsh hot spots.
const ambient = new THREE.AmbientLight(0xfff8ee, 0.85);
scene.add(ambient);

// Hemisphere gives subtle top-down warmth variation
const hemi = new THREE.HemisphereLight(0xfff5e8, 0xD9D5CC, 0.4);
scene.add(hemi);

const keyLight = new THREE.DirectionalLight(0xfff5e8, 1.1);
keyLight.position.set(2, 3, 2.5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 2048;
keyLight.shadow.mapSize.height = 2048;
keyLight.shadow.camera.left = -2;
keyLight.shadow.camera.right = 2;
keyLight.shadow.camera.top = 2;
keyLight.shadow.camera.bottom = -2;
keyLight.shadow.camera.near = 0.1;
keyLight.shadow.camera.far = 10;
keyLight.shadow.bias = -0.0005;
keyLight.shadow.radius = 4;  // soften shadow edges
scene.add(keyLight);

// Soft fill from the opposite side, slightly warm
const fillLight = new THREE.DirectionalLight(0xfff5e8, 0.5);
fillLight.position.set(-2.5, 1.5, 1);
scene.add(fillLight);

// Subtle rim light from behind to define silhouette against the bright background
const rimLight = new THREE.DirectionalLight(0xe8e4dc, 0.3);
rimLight.position.set(0, 2, -2.5);
scene.add(rimLight);

// ===== Floor (subtle ground catch) =============
const floorGeom = new THREE.PlaneGeometry(10, 10);
const floorMat = new THREE.ShadowMaterial({ opacity: 0.18 });  // softer for white background
const floor = new THREE.Mesh(floorGeom, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.36;
floor.receiveShadow = true;
scene.add(floor);

// ===== Cabinet group ===========================
const cabinet = new THREE.Group();
scene.add(cabinet);

// Materials
const puMat = new THREE.MeshStandardMaterial({
  color: COLORS.pu_dark,
  roughness: 0.72,
  metalness: 0.05,
});
const grooveMat = new THREE.MeshStandardMaterial({
  color: COLORS.pu_groove,
  roughness: 0.85,
  metalness: 0.0,
});
const backMat = new THREE.MeshStandardMaterial({
  color: COLORS.back,
  roughness: 0.8,
  metalness: 0.0,
});
const hingeMat = new THREE.MeshStandardMaterial({
  color: COLORS.hinge,
  roughness: 0.3,
  metalness: 0.85,
});

// Cabinet dimensions in arbitrary units (scaled to fit viewport)
// Real cabinet: shutter 450mm wide × 700mm tall, cabinet body slightly deeper
const W = 0.9;   // width
const H = 1.4;   // height (overall including skirting)
const D = 0.6;   // depth
const SHUTTER_T = 0.025;  // shutter thickness (25mm proportional)
const SKIRT_H = 0.18;     // skirting height

// --- Cabinet body (carcass) ---
function makePanel(w, h, d, mat) {
  const geom = new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(geom, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

const bodyTop = makePanel(W, 0.018, D, backMat);
bodyTop.position.set(0, H/2 - 0.009, 0);
cabinet.add(bodyTop);

const bodyBottom = makePanel(W, 0.018, D, backMat);
bodyBottom.position.set(0, -H/2 + SKIRT_H + 0.009, 0);
cabinet.add(bodyBottom);

const bodyLeft = makePanel(0.018, H - SKIRT_H, D, backMat);
bodyLeft.position.set(-W/2 + 0.009, SKIRT_H/2, 0);
cabinet.add(bodyLeft);

const bodyRight = makePanel(0.018, H - SKIRT_H, D, backMat);
bodyRight.position.set(W/2 - 0.009, SKIRT_H/2, 0);
cabinet.add(bodyRight);

const bodyBack = makePanel(W - 0.04, H - SKIRT_H - 0.04, 0.008, backMat);
bodyBack.position.set(0, SKIRT_H/2, -D/2 + 0.004);
cabinet.add(bodyBack);

// --- Skirting ---
const skirt = makePanel(W, SKIRT_H, D - 0.05, puMat);
skirt.position.set(0, -H/2 + SKIRT_H/2, 0.025);
cabinet.add(skirt);

// --- PU Shutter (the door) with grooves ---
const shutterGroup = new THREE.Group();
shutterGroup.position.set(0, SKIRT_H/2 + 0.05, D/2 + SHUTTER_T/2);

// Main shutter slab
const shutterW = W - 0.06;
const shutterH = H - SKIRT_H - 0.1;
const shutter = makePanel(shutterW, shutterH, SHUTTER_T, puMat);
shutter.castShadow = true;
shutterGroup.add(shutter);

// 6mm groove pattern — 4 vertical grooves spaced at 6mm intervals
// In our scaled space, 6mm ≈ 0.054 (approximate visual proportion)
const grooveCount = 5;
const grooveWidth = 0.008;
const grooveDepth = 0.006;
const grooveSpacing = shutterW / (grooveCount + 1);

for (let i = 1; i <= grooveCount; i++) {
  const grooveGeom = new THREE.BoxGeometry(grooveWidth, shutterH * 0.95, grooveDepth);
  const groove = new THREE.Mesh(grooveGeom, grooveMat);
  groove.position.set(
    -shutterW/2 + i * grooveSpacing,
    0,
    SHUTTER_T/2 - grooveDepth/2 + 0.001
  );
  shutterGroup.add(groove);
}

cabinet.add(shutterGroup);

// --- Hinges (small visual nods on left edge of shutter) ---
const hingeGeom = new THREE.CylinderGeometry(0.018, 0.018, 0.06, 16);
const hingeTop = new THREE.Mesh(hingeGeom, hingeMat);
hingeTop.rotation.z = Math.PI / 2;
hingeTop.position.set(-shutterW/2 + 0.04, shutterH/2 - 0.15, 0);
hingeTop.castShadow = true;
shutterGroup.add(hingeTop);

const hingeBot = new THREE.Mesh(hingeGeom.clone(), hingeMat);
hingeBot.rotation.z = Math.PI / 2;
hingeBot.position.set(-shutterW/2 + 0.04, -shutterH/2 + 0.15, 0);
hingeBot.castShadow = true;
shutterGroup.add(hingeBot);

// Center the whole cabinet at origin
cabinet.position.y = 0.18;

// ===== OrbitControls ===========================
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.18, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 0.8;
controls.maxDistance = 8;
controls.maxPolarAngle = Math.PI * 0.85;  // don't allow looking from below
controls.update();

// ===== View presets ============================
const VIEWS = {
  iso:   { pos: ISO_POSITION.clone(),                   target: new THREE.Vector3(0, 0.18, 0) },
  front: { pos: new THREE.Vector3(0, 0.2, 2.6),         target: new THREE.Vector3(0, 0.18, 0) },
  side:  { pos: new THREE.Vector3(2.6, 0.2, 0),         target: new THREE.Vector3(0, 0.18, 0) },
  top:   { pos: new THREE.Vector3(0.001, 2.8, 0.001),   target: new THREE.Vector3(0, 0.18, 0) },
};

function animateTo(pos, target, duration = 600) {
  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();
  const startTime = performance.now();

  function step() {
    const elapsed = performance.now() - startTime;
    const t = Math.min(elapsed / duration, 1);
    // ease-in-out cubic
    const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    camera.position.lerpVectors(startPos, pos, e);
    controls.target.lerpVectors(startTarget, target, e);
    controls.update();

    if (t < 1) requestAnimationFrame(step);
  }
  step();
}

document.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const view = VIEWS[btn.dataset.view];
    if (view) animateTo(view.pos, view.target);
  });
});

// Reset button
document.getElementById('resetBtn').addEventListener('click', () => {
  document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('[data-view="iso"]').classList.add('active');
  animateTo(VIEWS.iso.pos, VIEWS.iso.target);
});

// Wireframe toggle
let wireframe = false;
document.getElementById('explodeBtn').addEventListener('click', (e) => {
  wireframe = !wireframe;
  cabinet.traverse(child => {
    if (child.isMesh && child.material) {
      child.material.wireframe = wireframe;
    }
  });
  e.currentTarget.style.color = wireframe ? '#B3614E' : '';
});

// ===== If a GLB URL is provided, load it instead =====
if (GLB_URL) {
  const loader = new GLTFLoader();
  loader.load(GLB_URL,
    (gltf) => {
      // Remove procedural cabinet, add loaded model
      scene.remove(cabinet);
      const loaded = gltf.scene;

      // STEP 1 — compute bounding box at native scale
      const box = new THREE.Box3().setFromObject(loaded);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      console.log('GLB native size:', size, 'center:', center);

      // STEP 2 — scale so the LARGEST dimension fits within ~1.2 units
      // (smaller than 1.4 so the cabinet has breathing room in the vitrine)
      const TARGET_SIZE = 1.2;
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = TARGET_SIZE / maxDim;
      loaded.scale.setScalar(scale);

      // STEP 3 — move the model so its center sits at world origin (XZ),
      // and its base sits on the floor plane (Y = -0.36 to match shadow catcher)
      loaded.position.x = -center.x * scale;
      loaded.position.z = -center.z * scale;
      loaded.position.y = -box.min.y * scale - 0.36;  // base on floor

      // STEP 4 — apply consistent PU finish material to all meshes
      // (the 3DS conversion typically loses original materials)
      const puFinishMat = new THREE.MeshStandardMaterial({
        color: 0x1F1F1D,
        roughness: 0.55,        // slightly less rough than before so light catches edges
        metalness: 0.05,
      });
      loaded.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.material = puFinishMat;
        }
      });

      scene.add(loaded);

      // STEP 5 — re-aim the camera target at the cabinet's actual center
      // (so it stays in frame as you orbit)
      const finalBox = new THREE.Box3().setFromObject(loaded);
      const finalCenter = finalBox.getCenter(new THREE.Vector3());
      controls.target.copy(finalCenter);
      // Pull camera back so we see the whole cabinet, not a corner
      camera.position.set(
        finalCenter.x + 1.8,
        finalCenter.y + 1.0,
        finalCenter.z + 2.2
      );
      controls.update();

      // Also update the view presets to use the new center
      VIEWS.iso.target.copy(finalCenter);
      VIEWS.iso.pos.set(finalCenter.x + 1.8, finalCenter.y + 1.0, finalCenter.z + 2.2);
      VIEWS.front.target.copy(finalCenter);
      VIEWS.front.pos.set(finalCenter.x, finalCenter.y, finalCenter.z + 2.8);
      VIEWS.side.target.copy(finalCenter);
      VIEWS.side.pos.set(finalCenter.x + 2.8, finalCenter.y, finalCenter.z);
      VIEWS.top.target.copy(finalCenter);
      VIEWS.top.pos.set(finalCenter.x + 0.001, finalCenter.y + 3.0, finalCenter.z + 0.001);

      // Hide the placeholder honesty note — we're showing the real model now
      const note = document.querySelector('.placeholder-note');
      if (note) note.style.display = 'none';

      console.log('Cabinet GLB loaded · scale:', scale, '· final center:', finalCenter);
    },
    (xhr) => {
      // Progress callback
      if (xhr.lengthComputable) {
        const pct = (xhr.loaded / xhr.total * 100).toFixed(0);
        console.log(`Loading cabinet: ${pct}%`);
      }
    },
    (err) => {
      console.warn('GLB load failed, keeping procedural model.', err);
    }
  );
}

// ===== Resize handling ==========================
function handleResize() {
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener('resize', handleResize);

// ===== Render loop =============================
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
