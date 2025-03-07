document.addEventListener("DOMContentLoaded", async function () {
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
  
  async function dynamicTranslate(text, targetLang) {
      const cacheKey = `translate_${text}_${targetLang}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) return cached;  
      
      try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
        const data = await response.json();
        if (data && data.responseData && data.responseData.translatedText) {
          localStorage.setItem(cacheKey, data.responseData.translatedText);  
          return data.responseData.translatedText;
        }
      } catch (e) {
        console.error("Translation error:", e);
      }
      return text;  
  }

  async function changeLanguage() {
    const lang = document.getElementById("lang").value;
    localStorage.setItem("language", lang);
    
    for (let el of translatableElements) {
      const originalText = el.dataset.original || el.innerText;
      el.dataset.original = originalText;  
      
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
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / (window.innerHeight / 2), 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("threeD-canvas") });
  renderer.setSize(window.innerWidth, window.innerHeight / 2);

  camera.position.z = 5;

  // Road
  const roadGeometry = new THREE.PlaneGeometry(10, 2);
  const roadMaterial = new THREE.MeshBasicMaterial({ color: 0x555555, side: THREE.DoubleSide });
  const road = new THREE.Mesh(roadGeometry, roadMaterial);
  road.rotation.x = -Math.PI / 2;
  scene.add(road);

  // Car Body
  const carBodyGeometry = new THREE.BoxGeometry(1.5, 0.5, 0.8);
  const carBodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const carBody = new THREE.Mesh(carBodyGeometry, carBodyMaterial);
  carBody.position.y = 0.35;
  scene.add(carBody);

  // Wheels
  const wheelGeometry = new THREE.SphereGeometry(0.2, 32, 32);
  const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  
  const wheels = [];
  const wheelPositions = [
    [-0.6, 0.1, 0.4], [0.6, 0.1, 0.4],
    [-0.6, 0.1, -0.4], [0.6, 0.1, -0.4]
  ];

  for (let pos of wheelPositions) {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.position.set(...pos);
    scene.add(wheel);
    wheels.push(wheel);
  }

  scene.add(new THREE.AmbientLight(0x404040));
  const light = new THREE.PointLight(0xffffff, 1, 10);
  light.position.set(2, 2, 2);
  scene.add(light);

  let moving = false;
  let moveDirection = 1;

  renderer.domElement.addEventListener("dblclick", function () {
    moving = !moving;
  });

  function animate() {
    requestAnimationFrame(animate);
    if (moving) {
      carBody.position.x += 0.05 * moveDirection;
      wheels.forEach(wheel => wheel.rotation.x -= 0.1);
      if (carBody.position.x > 4.5 || carBody.position.x < -4.5) {
        moveDirection *= -1;
      }
    }
    wheels.forEach((wheel, i) => {
      wheel.position.x = carBody.position.x + (i % 2 === 0 ? -0.6 : 0.6);
    });
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight / 2;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });
});
