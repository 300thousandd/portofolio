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
    
    // --- Crearea unei mașini simple folosind geometrii de bază ---
    // Corpul mașinii (un cub mare)
    const carBodyGeometry = new THREE.BoxGeometry(2, 0.5, 1);
    const carBodyMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    const carBody = new THREE.Mesh(carBodyGeometry, carBodyMaterial);
    carBody.position.y = 0.25; // Asigură-te că este plasat corect pe axa Y
    scene.add(carBody);

    // Roțile mașinii (cilindri)
    const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 32);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    const wheel1 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel1.position.set(-0.8, 0.15, 0.4); // Roata din față stânga
    wheel1.rotation.z = Math.PI / 2; // Rotește roata pentru a fi pe orizontală
    scene.add(wheel1);

    const wheel2 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel2.position.set(0.8, 0.15, 0.4); // Roata din față dreapta
    wheel2.rotation.z = Math.PI / 2;
    scene.add(wheel2);

    const wheel3 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel3.position.set(-0.8, 0.15, -0.4); // Roata din spate stânga
    wheel3.rotation.z = Math.PI / 2;
    scene.add(wheel3);

    const wheel4 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel4.position.set(0.8, 0.15, -0.4); // Roata din spate dreapta
    wheel4.rotation.z = Math.PI / 2;
    scene.add(wheel4);

    // Grup pentru "crack"-uri
    const cracksGroup = new THREE.Group();
    carBody.add(cracksGroup);
    
    let carDamageClicks = 0;
    const damageThreshold = 5;
    let exploding = false;
    
    scene.add(new THREE.AmbientLight(0x404040));
    const pointLight = new THREE.PointLight(0xffffff, 1, 10);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);
    
    // Actualizează coordonatele mouse-ului relativ la canvas și procesează evenimentul
    renderer.domElement.addEventListener("pointerdown", function(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(carBody);
      
      if (intersects.length > 0 && !exploding) {
        // Clic pe mașină: adaugă crack și crește damage-ul
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
    
    // Event listener pentru zoom (wheel)
    renderer.domElement.addEventListener("wheel", function(event) {
      // Inversează direcția pentru zoom: scroll în jos crește distanța, scroll în sus o micșorează
      camera.position.z += event.deltaY * 0.01;
      // Asigură-te că camera nu se apropie prea mult
      camera.position.z = Math.max(2, camera.position.z);
      event.preventDefault();
    });
    
    // Funcție pentru a adăuga un crack pe mașină
    function addCrack() {
      const crackGeom = new THREE.Geometry();
      const p1 = new THREE.Vector3((Math.random()-0.5)*2, (Math.random()-0.5)*2, 0);
      const p2 = p1.clone().add(new THREE.Vector3((Math.random()-0.5)*0.5, (Math.random()-0.5)*0.5, 0));
      crackGeom.vertices.push(p1, p2);
      const crackMat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2, transparent: true, opacity: 1 });
      const crackLine = new THREE.Line(crackGeom, crackMat);
      cracksGroup.add(crackLine);
    }
    
    // Funcție de reset pentru mașină și crack-uri
    function resetCar() {
      carDamageClicks = 0;
      cracksGroup.clear();
      exploding = false;
    }
    
    // Funcție pentru explozia nebuloasă
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
    
    // Funcție pentru explozia mașinii
    function explodeCar() {
      // Aceasta ar putea include fragmentarea mașinii în bucăți și animarea exploziei
      // Detaliile depind de complexitatea pe care o dorești pentru acest efect
    }
    
    function animate() {
      requestAnimationFrame(animate);
      carBody.rotation.y += 0.005;  // Rotește mașina pentru efect vizual
      renderer.render(scene, camera);
    }
    animate();
    
    // Resize listener: actualizează renderer și camera
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
