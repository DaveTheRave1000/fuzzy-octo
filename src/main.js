import './style.css';
import { Game } from './models/Game.js';
import { UI } from './views/UI.js';

// Initialize main game components
const game = new Game();
const ui = new UI(game);

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
  // Removed automatic startGame() call; wait for user to press the start button.
}

init();
