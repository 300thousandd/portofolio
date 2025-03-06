script.js - code

document.addEventListener("DOMContentLoaded", async function() {
    // --- Smooth Scroll for Navigation Links ---
    const links = document.querySelectorAll("nav ul li a");
    links.forEach(link => {
        link.addEventListener("click", function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        target.scrollIntoView({ behavior: "smooth" });
        });
    });

    // --- Dynamic Translation Logic with Caching ---
    const translatableElements = document.querySelectorAll("[data-lang]");
    
    // Verifică dacă textul a fost deja salvat în cache pentru traducere
    async function dynamicTranslate(text, targetLang) {
        const cacheKey = `translate_${text}_${targetLang}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) return cached;  // Dacă există în cache, returnează traducerea
        
        try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
        const data = await response.json();
        if (data && data.responseData && data.responseData.translatedText) {
            localStorage.setItem(cacheKey, data.responseData.translatedText);  // Salvează traducerea în cache
            return data.responseData.translatedText;
        }
        } catch (e) {
        console.error("Translation error:", e);
        }
        return text;  // Dacă nu se poate traduce, lasă textul original
    }

    async function changeLanguage() {
        const lang = document.getElementById("lang").value;
        localStorage.setItem("language", lang);
        
        // Parcurge toate elementele și traduce textul
        for (let el of translatableElements) {
        const originalText = el.dataset.original || el.innerText;
        el.dataset.original = originalText;  // Salvează textul original dacă nu este deja salvat
        
        if (lang === "en") {
            el.innerText = originalText;
        } else {
            el.innerText = await dynamicTranslate(originalText, lang);
        }
        }
    }

    const savedLang = localStorage.getItem("language") || "en";
    document.getElementById("lang").value = savedLang;
    await changeLanguage();
    
    document.getElementById("lang").addEventListener("change", changeLanguage);
    
    // --- 3D Scene Setup ---
    function create3DScene() {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / (window.innerHeight / 2),
        0.1,
        1000
      );
      const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("threeD-canvas") });
      renderer.setSize(window.innerWidth, window.innerHeight / 2);
      
      // Variabile pentru zoom
      const baseCameraZ = 5;
      camera.position.z = baseCameraZ;
      
      // Set up raycaster and mouse vector
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      
      // Creează o piramidă hexagonală mov cu bază mai mare (raza 2)
     import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Car body
const carBodyGeometry = new THREE.BoxGeometry(4, 1, 2);
const carBodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const carBody = new THREE.Mesh(carBodyGeometry, carBodyMaterial);
carBody.position.y = 1;
scene.add(carBody);

// Wheels
const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 32);
const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

const wheelPositions = [
    [-1.5, 0.5, 1], [1.5, 0.5, 1], 
    [-1.5, 0.5, -1], [1.5, 0.5, -1]
];

wheelPositions.forEach(pos => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(...pos);
    scene.add(wheel);
});

// Lights
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 5, 10);
controls.update();

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

      
    create3DScene();
  });
  
