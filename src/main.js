import './style.css';
import { Game } from './models/Game.js';
import { Staff } from './models/Staff.js';
import { Marketing } from './models/Marketing.js';
import { UI } from './views/UI.js';
import { Scene } from './views/Scene.js';
import { ProjectController } from './controllers/ProjectController.js';
import { EventController } from './controllers/EventController.js';

// Initialize main game components
const game = new Game();
const ui = new UI(game);
const gameScene = new Scene('three-canvas');
const staff = new Staff(game);
const marketing = new Marketing(game);
const projectController = new ProjectController(game, ui);
const eventController = new EventController(game, ui);

// Setup UI event listeners
function setupEventListeners() {
  const panelBtns = document.querySelectorAll('.panel-btn[data-panel]');
  const panels = document.querySelectorAll('.panel');
  
  if (panelBtns.length === 0) {
    console.log("No panel buttons found - using original sidebar structure");
    return;
  }
  
  panelBtns.forEach(btn => {
    btn.onclick = () => {
      panels.forEach(p => p.classList.remove('active'));
      const targetPanel = document.getElementById('panel-' + btn.dataset.panel);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    };
  });
}

// Initialize the game
function init() {
  setupEventListeners();
  gameScene.init();
  game.startGame();
}

init();
