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
  
  async function dynamicTranslate(text, targetLang) {
      const cacheKey = `translate_${text}_${targetLang}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) return cached;  // Return cached translation if available
      
      try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
        const data = await response.json();
        if (data && data.responseData && data.responseData.translatedText) {
          localStorage.setItem(cacheKey, data.responseData.translatedText);  // Cache the translation
          return data.responseData.translatedText;
        }
      } catch (e) {
        console.error("Translation error:", e);
      }
      return text;  // Return original text if translation fails
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
    
    const baseCameraZ = 5;
    camera.position.z = baseCameraZ;
    
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    // --- Car Model ---
    const carBodyGeometry = new THREE.BoxGeometry(2, 0.5, 1);
    const carBodyMaterial = new THREE.MeshStandardMaterial({ color: 0x1E90FF });
    const carBody = new THREE.Mesh(carBodyGeometry, carBodyMaterial);
    carBody.position.y = 0.25;
    scene.add(carBody);

    const roofGeometry = new THREE.BoxGeometry(1.2, 0.3, 0.8);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x00BFFF });
    const carRoof = new THREE.Mesh(roofGeometry, roofMaterial);
    carRoof.position.set(0, 0.65, 0);
    scene.add(carRoof);

    const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 32);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    const wheel1 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel1.position.set(-0.8, 0.1, 0.4);
    wheel1.rotation.z = Math.PI / 2;
    scene.add(wheel1);

    const wheel2 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel2.position.set(0.8, 0.1, 0.4);
    wheel2.rotation.z = Math.PI / 2;
    scene.add(wheel2);

    const wheel3 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel3.position.set(-0.8, 0.1, -0.4);
    wheel3.rotation.z = Math.PI / 2;
    scene.add(wheel3);

    const wheel4 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel4.position.set(0.8, 0.1, -0.4);
    wheel4.rotation.z = Math.PI / 2;
    scene.add(wheel4);

    const cracksGroup = new THREE.Group();
    carBody.add(cracksGroup);
    
    let carDamageClicks = 0;
    const damageThreshold = 5;
    let exploding = false;
    
    scene.add(new THREE.AmbientLight(0x404040));
    const pointLight = new THREE.PointLight(0xffffff, 1, 10);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);

    renderer.domElement.addEventListener("pointerdown", function(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(carBody);
      
      if (intersects.length > 0 && !exploding) {
        carDamageClicks++;
        addCrack();
        if (carDamageClicks >= damageThreshold) {
          exploding = true;
          explodeCar();
        }
      } else if (intersects.length === 0) {
        createNebulaExplosion(mouse);
      }
    });

    renderer.domElement.addEventListener("wheel", function(event) {
      camera.position.z += event.deltaY * 0.01;
      camera.position.z = Math.max(2, camera.position.z);
      event.preventDefault();
    });
    
    function addCrack() {
      const crackGeom = new THREE.Geometry();
      const p1 = new THREE.Vector3((Math.random()-0.5)*2, (Math.random()-0.5)*2, 0);
      const p2 = p1.clone().add(new THREE.Vector3((Math.random()-0.5)*0.5, (Math.random()-0.5)*0.5, 0));
      crackGeom.vertices.push(p1, p2);
      const crackMat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2, transparent: true, opacity: 1 });
      const crackLine = new THREE.Line(crackGeom, crackMat);
      cracksGroup.add(crackLine);
    }

    function resetCar() {
      carDamageClicks = 0;
      cracksGroup.clear();
      exploding = false;
    }

    function createNebulaExplosion(clickPos) {
      const numParticles = 500;
      const particlesGeom = new THREE.Geometry();
      for (let i = 0; i < numParticles; i++) {
        const particle = new THREE.Vector3(
          clickPos.x * 5 + (Math.random() - 0.5) * 0.5,
          clickPos.y * 5 + (Math.random() - 0.5) * 0.5,
          0
        );
        particlesGeom.vertices.push(particle);
      }
      const particlesMat = new THREE.PointsMaterial({
        size: 0.02,
        color: new THREE.Color().setHSL(Math.random(), 1.0, 0.5),
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending
      });
      const particleSystem = new THREE.Points(particlesGeom, particlesMat);
      scene.add(particleSystem);
      
      const nebulaStart = Date.now();
      function animateNebula() {
        const elapsed = (Date.now() - nebulaStart) / 1000;
        if (elapsed < 3) {
          particlesMat.opacity = 1 - (elapsed / 3);
          requestAnimationFrame(animateNebula);
        } else {
          scene.remove(particleSystem);
        }
      }
      animateNebula();
    }

    function explodeCar() {
      // Implementation for car explosion (not updated here, but you can adjust as needed)
    }

    let carMoveSpeed = 0.05;  // Speed at which the car moves
    
    function animate() {
      requestAnimationFrame(animate);
      
      // Car movement and wheel rotation
      carBody.position.x += carMoveSpeed;
      wheel1.rotation.x += 0.1;  // Rotate the wheel with car movement
      wheel2.rotation.x += 0.1;
      wheel3.rotation.x += 0.1;
      wheel4.rotation.x += 0.1;
      
      if (carBody.position.x > 5) {
        carBody.position.x = -5; // Reset car position when it goes off-screen
      }

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
  }

  create3DScene();
});
