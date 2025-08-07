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
const scene = new Scene('three-canvas');
const staff = new Staff(game);
const marketing = new Marketing(game);
const projectController = new ProjectController(game, ui);
const eventController = new EventController(game, ui);

// Setup UI event listeners
function setupEventListeners() {
  // Basic staff and marketing actions
  const hireBtn = document.getElementById('hire');
  if (hireBtn) {
    hireBtn.addEventListener('click', () => {
      if (staff.hire()) {
        ui.log('Hired new staff member!');
        ui.update();
      } else {
        ui.log('Not enough money to hire staff!');
      }
    });
  }

  const marketBtn = document.getElementById('market');
  if (marketBtn) {
    marketBtn.addEventListener('click', () => {
      if (marketing.launchCampaign()) {
        ui.log('Marketing campaign launched!');
        ui.update();
      } else {
        ui.log('Not enough money for marketing!');
      }
    });
  }

  // Advanced team management
  document.getElementById('train-staff')?.addEventListener('click', () => {
    if (game.canAfford(5000) && game.staff > 0) {
      game.spendMoney(5000);
      ui.log('Staff training completed! Productivity increased.');
      ui.update();
    } else {
      ui.log('Not enough money or staff for training!');
    }
  });

  document.getElementById('team-building')?.addEventListener('click', () => {
    if (game.canAfford(3000) && game.staff > 0) {
      game.spendMoney(3000);
      ui.log('Team building event successful! Team morale improved.');
      ui.update();
    } else {
      ui.log('Not enough money or staff for team building!');
    }
  });

  // Advanced marketing actions
  document.getElementById('social-campaign')?.addEventListener('click', () => {
    if (game.canAfford(2000)) {
      game.spendMoney(2000);
      game.hype += 8;
      ui.log('Social media campaign launched! Hype increased significantly.');
      ui.update();
    } else {
      ui.log('Not enough money for social media campaign!');
    }
  });

  document.getElementById('press-release')?.addEventListener('click', () => {
    if (game.canAfford(4000)) {
      game.spendMoney(4000);
      game.hype += 15;
      ui.log('Press release published! Major hype boost achieved.');
      ui.update();
    } else {
      ui.log('Not enough money for press release!');
    }
  });

  // Update secondary stats displays
  function updateSecondaryStats() {
    const staffCount = document.getElementById('staff-count');
    const staffCost = document.getElementById('staff-cost');
    const hypeLevel = document.getElementById('hype-level');
    const socialReach = document.getElementById('social-reach');
    
    if (staffCount) staffCount.textContent = game.staff;
    if (staffCost) staffCost.textContent = game.staff * 2000;
    if (hypeLevel) hypeLevel.textContent = game.hype;
    if (socialReach) socialReach.textContent = `${(game.hype * 1000).toLocaleString()}`;
  }

  // Add updateSecondaryStats to the update cycle
  const originalUpdate = ui.update.bind(ui);
  ui.update = () => {
    originalUpdate();
    updateSecondaryStats();
  };
}

setupEventListeners();

// Game loop
function gameLoop() {
  if (game.isRunning) {
    projectController.update();
    eventController.update();
    
    if (game.project) {
      scene.updateProgress(
        game.project.progress,
        game.project.currentMilestone,
        game.project.milestones
      );
    }
    
    ui.update();
  }
}

// Start game loop
setInterval(gameLoop, 1000);

// Initial UI update
ui.update();



// --- Panel navigation logic ---
const panelBtns = document.querySelectorAll('.panel-btn');
const panels = document.querySelectorAll('.panel');
panelBtns.forEach(btn => {
  btn.onclick = () => {
    panels.forEach(p => p.classList.remove('active'));
    document.getElementById('panel-' + btn.dataset.panel).classList.add('active');
  };
});

