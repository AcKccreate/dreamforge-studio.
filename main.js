import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';

// === BASIC SETUP ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2c3e50);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.8, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
const canvasContainer = document.getElementById('canvas-container');
renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
canvasContainer.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1.2, 0);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
directionalLight.position.set(8, 12, 10);
scene.add(directionalLight);

const gridHelper = new THREE.GridHelper(10, 10, 0x888888, 0x444444);
scene.add(gridHelper);

// === UPGRADED CHARACTER CREATION LOGIC ===
const material = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.4, metalness: 0.1 });
const character = new THREE.Group();
scene.add(character);

// --- More creative and varied part options ---
const headOptions = [
    () => new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 16), material), // Classic Head
    () => new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material), // Robot Head
    () => new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 0.5, 4, 16), material), // Sci-fi/Pill Head
    () => new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.15, 16, 100), material), // Halo/Alien Head
];

const torsoOptions = [
    () => new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 0.8), material), // Blocky Torso
    () => new THREE.Mesh(new THREE.CapsuleGeometry(0.7, 1.0, 4, 16), material), // Organic/Alien Torso
    () => { // Armored Torso
        const torsoGroup = new THREE.Group();
        const main = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.8, 0.8), material);
        const plate = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.2, 1.0), material);
        plate.position.z = 0.1;
        torsoGroup.add(main, plate);
        return torsoGroup;
    },
];

const legsOptions = [
    () => { // Two separate legs
        const legGroup = new THREE.Group();
        const legLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.25, 2, 32), material);
        legLeft.position.x = -0.45;
        const legRight = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.25, 2, 32), material);
        legRight.position.x = 0.45;
        legGroup.add(legLeft, legRight);
        return legGroup;
    },
    () => { // Rocket Base
        const base = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.5, 32), material);
        base.position.y = -0.25;
        return base;
    },
     () => { // Spider Legs
        const legGroup = new THREE.Group();
        for (let i = 0; i < 6; i++) {
            const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 1.5), material);
            const angle = (Math.PI / 3) * i;
            leg.position.set(Math.cos(angle) * 0.8, 0, Math.sin(angle) * 0.8);
            leg.rotation.z = Math.PI / 2.5;
            legGroup.add(leg);
        }
        legGroup.position.y = -0.5;
        return legGroup;
    },
];

let currentHeadIndex = 0;
let currentTorsoIndex = 0;
let currentLegsIndex = 0;
let headMesh, torsoMesh, legsMesh;

function assembleCharacter() {
    character.clear();
    headMesh = headOptions[currentHeadIndex]();
    torsoMesh = torsoOptions[currentTorsoIndex]();
    legsMesh = legsOptions[currentLegsIndex]();

    legsMesh.position.y = 1;
    torsoMesh.position.y = 2.1;
    headMesh.position.y = 3.5;

    character.add(headMesh, torsoMesh, legsMesh);
}

// === UI EVENT LISTENERS ===
document.getElementById('next-head-btn').addEventListener('click', () => {
    currentHeadIndex = (currentHeadIndex + 1) % headOptions.length;
    assembleCharacter();
});

document.getElementById('next-torso-btn').addEventListener('click', () => {
    currentTorsoIndex = (currentTorsoIndex + 1) % torsoOptions.length;
    assembleCharacter();
});

document.getElementById('next-legs-btn').addEventListener('click', () => {
    currentLegsIndex = (currentLegsIndex + 1) % legsOptions.length;
    assembleCharacter();
});

const exporter = new STLExporter();
document.getElementById('export-stl-btn').addEventListener('click', () => {
    const result = exporter.parse(character, { binary: true });
    const blob = new Blob([result], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.href = URL.createObjectURL(blob);
    link.download = 'dreamforge-character.stl';
    link.click();
    document.body.removeChild(link);
});

// === RENDER LOOP AND RESIZING ===
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
});

assembleCharacter();
animate();
