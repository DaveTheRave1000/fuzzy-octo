import * as THREE from 'three';
import './style.css';

// Basic game state
let money = 10000;
let staff = 3;
let progress = 0;
let milestone = 1;
let isRunning = true;

const moneyEl = document.getElementById('money');
const staffEl = document.getElementById('staff');
const progressEl = document.getElementById('progress');
const milestoneEl = document.getElementById('milestone');
const logEl = document.getElementById('log');

function updateUI() {
  moneyEl.textContent = `$${money}`;
  staffEl.textContent = staff;
  progressEl.textContent = `${progress}%`;
  milestoneEl.textContent = milestone;
}

function log(msg) {
  logEl.textContent = msg + '\n' + logEl.textContent;
}

function tick() {
  if (!isRunning) return;
  if (money <= 0) {
    log('You ran out of money! Game over.');
    isRunning = false;
    return;
  }
  if (progress >= 100) {
    log(`Milestone ${milestone} complete!`);
    milestone++;
    progress = 0;
    money += 5000;
    staff++;
  }
  // Simulate resource allocation
  money -= staff * 50;
  progress += staff * 2;
  updateUI();
  setTimeout(tick, 1000);
}

document.getElementById('hire').onclick = () => {
  if (money >= 2000) {
    staff++;
    money -= 2000;
    log('Hired a new staff member!');
    updateUI();
  } else {
    log('Not enough money to hire!');
  }
};

document.getElementById('pause').onclick = () => {
  isRunning = !isRunning;
  if (isRunning) {
    log('Game resumed.');
    tick();
  } else {
    log('Game paused.');
  }
};

// --- THREE.js 3D scene ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(300, 300);
document.getElementById('three-canvas').appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(5, 5, 5);
scene.add(light);

camera.position.z = 3;

function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}

animate();

// --- Start game ---
updateUI();
tick();
import { setupCounter } from './counter.js'

document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>Hello Vite!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>
  </div>
`

setupCounter(document.querySelector('#counter'))
