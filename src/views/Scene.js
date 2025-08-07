import * as THREE from 'three';

export class Scene {
  constructor(containerId) {
    this.containerId = containerId;
  }

  init() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      console.error(`Container element with id '${this.containerId}' not found`);
      return;
    }
    
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: false }); // Retro look: disable antialiasing
    
    this.setupScene();
    this.createRetroScene();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupScene() {
    const containerRect = this.container.getBoundingClientRect();
    this.renderer.setSize(containerRect.width, containerRect.width);
    this.renderer.setClearColor(0x000000); // Black background
    this.container.appendChild(this.renderer.domElement);
    
    this.camera.position.z = 10;
    this.camera.position.y = 2;
    this.camera.lookAt(0, 0, 0);
    
    // Add retro-style lighting
    const ambientLight = new THREE.AmbientLight(0x444444);
    this.scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0x00ff00, 0.5); // Green tint
    mainLight.position.set(1, 1, 1);
    this.scene.add(mainLight);
  }

    createRetroScene() {
    // Create wireframe grid floor
    const gridGeometry = new THREE.PlaneGeometry(40, 40, 20, 20);
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });
    this.grid = new THREE.Mesh(gridGeometry, gridMaterial);
    this.grid.rotation.x = -Math.PI / 2;
    this.grid.position.y = -2;
    this.scene.add(this.grid);

    // Add horizon line
    const horizonGeometry = new THREE.TorusGeometry(15, 0.1, 16, 100);
    const horizonMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.3
    });
    this.horizon = new THREE.Mesh(horizonGeometry, horizonMaterial);
    this.horizon.rotation.x = Math.PI / 2;
    this.horizon.position.y = -1;
    this.scene.add(this.horizon);

    // Create computer terminal
    const terminalGeometry = new THREE.BoxGeometry(4, 3, 0.5);
    const terminalMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x222222,
      shininess: 30,
      emissive: 0x111111
    });
    this.terminal = new THREE.Mesh(terminalGeometry, terminalMaterial);
    this.scene.add(this.terminal);    // Create screen
    const screenGeometry = new THREE.PlaneGeometry(3.6, 2.6);
    const screenMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      emissive: 0x002200,
      shininess: 50,
      transparent: true,
      opacity: 0.8
    });
    this.screen = new THREE.Mesh(screenGeometry, screenMaterial);
    this.screen.position.z = 0.26;
    this.terminal.add(this.screen);

    // Create progress bars
    this.progressBars = [];
    for (let i = 0; i < 3; i++) {
      const barGeometry = new THREE.BoxGeometry(2.8, 0.2, 0.1);
      const barMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ff00,
        emissive: 0x002200,
        shininess: 30
      });
      const bar = new THREE.Mesh(barGeometry, barMaterial);
      bar.position.set(0, 0.8 - (i * 0.4), 0.3);
      bar.scale.x = 0.1; // Start at 10%
      this.progressBars.push(bar);
      this.terminal.add(bar);
    }
  }

  updateProgress(progress, milestone, totalMilestones) {
    // Update progress bars
    const progressScale = progress / 100;
    this.progressBars[0].scale.x = progressScale;
    this.progressBars[1].scale.x = milestone / totalMilestones;
    this.progressBars[2].scale.x = Math.min(1, milestone / (totalMilestones * 0.8));

    // Pulse effect on screen
    this.screen.material.emissive.g = 0.1 + Math.sin(Date.now() * 0.003) * 0.05;
    
    // Rotate terminal slightly based on progress
    this.terminal.rotation.y = Math.sin(Date.now() * 0.001) * 0.1;
    
    this.renderer.render(this.scene, this.camera);
  }

  animate() {
    requestAnimationFrame(this.animate);
    
    const time = Date.now() * 0.001;
    
    // Rotate grid for a moving effect
    this.grid.rotation.z = time * 0.1;
    
    // Pulse the horizon
    this.horizon.scale.set(
      1 + Math.sin(time) * 0.1,
      1 + Math.sin(time) * 0.1,
      1
    );
    
    // Add some ambient movement to the terminal
    this.terminal.rotation.y = Math.sin(time) * 0.1;
    this.screen.material.emissive.g = 0.1 + Math.sin(time * 3) * 0.05;
    
    // Move progress bars with a wave effect
    this.progressBars.forEach((bar, index) => {
      bar.position.z = 0.3 + Math.sin(time * 2 + index * 0.5) * 0.02;
    });
    
    this.renderer.render(this.scene, this.camera);
  }
}
