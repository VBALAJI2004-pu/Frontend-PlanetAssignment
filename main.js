const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container").appendChild(renderer.domElement);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.3));
const sunLight = new THREE.PointLight(0xffffff, 2, 500);
scene.add(sunLight);

// Sun
const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Planets
const planets = [];
const orbitData = [
  { name: "Mercury", color: 0xaaaaaa, distance: 6, size: 0.3, speed: 0.04 },
  { name: "Venus", color: 0xffcc99, distance: 8, size: 0.5, speed: 0.015 },
  { name: "Earth", color: 0x3399ff, distance: 10, size: 0.5, speed: 0.01 },
  { name: "Mars", color: 0xff3300, distance: 12, size: 0.4, speed: 0.008 },
  { name: "Jupiter", color: 0xff9966, distance: 16, size: 1.2, speed: 0.002 },
  { name: "Saturn", color: 0xffcc66, distance: 20, size: 1.1, speed: 0.0016 },
  { name: "Uranus", color: 0x66ccff, distance: 24, size: 0.9, speed: 0.0012 },
  { name: "Neptune", color: 0x3333ff, distance: 28, size: 0.9, speed: 0.001 }
];

const sliderContainer = document.getElementById("sliders");

orbitData.forEach((data) => {
  const geometry = new THREE.SphereGeometry(data.size, 16, 16);
  const material = new THREE.MeshStandardMaterial({ color: data.color });
  const mesh = new THREE.Mesh(geometry, material);

  mesh.userData = {
    angle: Math.random() * Math.PI * 2,
    speed: data.speed,
    radius: data.distance,
    name: data.name
  };

  planets.push(mesh);
  scene.add(mesh);

  // Slider UI
  const label = document.createElement("label");
  label.innerText = `${data.name} Speed`;

  const input = document.createElement("input");
  input.type = "range";
  input.min = "0";
  input.max = "0.1";
  input.step = "0.001";
  input.value = data.speed;
  input.addEventListener("input", (e) => {
    mesh.userData.speed = parseFloat(e.target.value);
  });

  sliderContainer.appendChild(label);
  sliderContainer.appendChild(input);
});

// Camera setup
camera.position.z = 50;
const clock = new THREE.Clock();

// Pause/Resume
let isPaused = false;
document.getElementById("pauseBtn").addEventListener("click", () => {
  isPaused = !isPaused;
  document.getElementById("pauseBtn").innerText = isPaused ? "Resume" : "Pause";
});

// Dark/Light Toggle
document.getElementById("themeToggle").addEventListener("change", (e) => {
  document.body.classList.toggle("light", e.target.checked);
});

// Stars background
function addStars(count = 1000) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  for (let i = 0; i < count; i++) {
    positions.push((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200);
  }
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
  const stars = new THREE.Points(geometry, material);
  scene.add(stars);
}
addStars();

// Tooltip
const tooltip = document.getElementById("tooltip");
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Animate loop
function animate() {
  requestAnimationFrame(animate);

  if (!isPaused) {
    const delta = clock.getDelta();
    planets.forEach((planet) => {
      planet.userData.angle += delta * planet.userData.speed * 10;
      const { angle, radius } = planet.userData;
      planet.position.x = Math.cos(angle) * radius;
      planet.position.z = Math.sin(angle) * radius;
    });
  }

  // Hover detection
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets);
  if (intersects.length > 0) {
    const planet = intersects[0].object;
    tooltip.style.display = "block";
    tooltip.innerText = planet.userData.name;
    tooltip.style.left = `${event.clientX + 10}px`;
    tooltip.style.top = `${event.clientY - 20}px`;
  } else {
    tooltip.style.display = "none";
  }

  renderer.render(scene, camera);
}
animate();

// Track mouse for hover
window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});
