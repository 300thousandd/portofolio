// Basic scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('threeD-canvas'),
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Simple Car Model (using cubes and spheres)
function createCar() {
  const car = new THREE.Group();

  // Car body (a simple rectangle)
  const bodyGeometry = new THREE.BoxGeometry(4, 1, 2);
  const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  car.add(body);

  // Car wheels (using spheres)
  const wheelGeometry = new THREE.SphereGeometry(0.5);
  const wheelMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });

  const wheel1 = new THREE.Mesh(wheelGeometry, wheelMaterial);
  wheel1.position.set(-1.5, -0.5, 1);
  car.add(wheel1);

  const wheel2 = new THREE.Mesh(wheelGeometry, wheelMaterial);
  wheel2.position.set(1.5, -0.5, 1);
  car.add(wheel2);

  const wheel3 = new THREE.Mesh(wheelGeometry, wheelMaterial);
  wheel3.position.set(-1.5, -0.5, -1);
  car.add(wheel3);

  const wheel4 = new THREE.Mesh(wheelGeometry, wheelMaterial);
  wheel4.position.set(1.5, -0.5, -1);
  car.add(wheel4);

  return car;
}

const car = createCar();
scene.add(car);

// Position the camera
camera.position.z = 10;

// Simple animation
function animate() {
  requestAnimationFrame(animate);

  // Rotate the car and wheels for the animation
  car.rotation.y += 0.01; // Rotate the car body

  // Rotate the wheels
  car.children.forEach(child => {
    if (child.geometry.type === 'SphereGeometry') {
      child.rotation.x += 0.05;
    }
  });

  renderer.render(scene, camera);
}

animate();
