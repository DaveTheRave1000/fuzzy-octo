// Standard UI class for managing DOM elements and game state
export class UI {
  constructor(game) {
    this.game = game;
    this.elements = {
      money: document.getElementById('btc'),
      reputation: document.getElementById('reputation'),
      uptime: document.getElementById('uptime'),
      cpuUsage: document.getElementById('cpu-usage'),
      log: document.getElementById('log'),
      pauseBtn: document.getElementById('pause-btn'),
      startGameBtn: document.getElementById('start-game-btn'),
      restartGameBtn: document.getElementById('restart-game-btn'),
      hackTargets: document.getElementById('hack-targets'),
      activeHacksList: document.getElementById('active-hacks-list'),
      cpuBar: document.getElementById('cpu-bar'),
      riskBar: document.getElementById('risk-bar'),
      networkStatus: document.getElementById('network-status'),
      upgradesList: document.getElementById('upgrades-list'),
      panels: {
        hack: document.getElementById('panel-hack'),
        network: document.getElementById('panel-network'),
        software: document.getElementById('panel-software'),
        darknet: document.getElementById('panel-darknet'),
        staff: document.getElementById('panel-staff'),
        marketing: document.getElementById('panel-marketing'),
        progress: document.getElementById('panel-progress')
      }
    };

    this.initializeEventListeners();
    this.showPanel('hack');
    this.startUpdateLoop();
  }

  startUpdateLoop = () => {
    setInterval(() => {
      this.update();
    }, 100); // Update every 100ms
  }

  initializeEventListeners() {
    if (this.elements.startGameBtn) {
      this.elements.startGameBtn.addEventListener('click', () => {
        this.game.startGame();
        // Hide the start modal
        const startModal = document.getElementById('start-game-modal');
        if (startModal) {
          startModal.classList.remove('active');
          startModal.style.display = 'none';
        }
        this.log('[SYSTEM] Initializing hack.net terminal...', 'system');
        this.log('[SYSTEM] Connection established', 'system');
        this.log('[SYSTEM] Welcome to the darknet', 'system');
      });
    }

    if (this.elements.restartGameBtn) {
      this.elements.restartGameBtn.addEventListener('click', () => {
        this.game.restartGame();
        this.log('[SYSTEM] System reset initiated...', 'system');
        this.log('[SYSTEM] All connections terminated', 'system');
        this.log('[SYSTEM] Restarting terminal...', 'system');
      });
    }

    if (this.elements.pauseBtn) {
      this.elements.pauseBtn.addEventListener('click', () => {
        const isPaused = this.game.togglePause();
        this.elements.pauseBtn.textContent = isPaused ? '[RESUME]' : '[PAUSE]';
        this.log(isPaused ? '[SYSTEM] System paused' : '[SYSTEM] System resumed', 'system');
      });
    }

    this.setupHackButtons();
    this.setupUpgradeButtons();
    this.setupNetworkButtons();
    this.initializePanels();
  }

  setupPanelButtons() {
    document.querySelectorAll('.panel-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const panelName = btn.dataset.panel;
        if (panelName) {
          this.showPanel(panelName);
        }
      });
    });
  }

  setupPauseButton() {
    if (this.elements.pauseBtn) {
      this.elements.pauseBtn.addEventListener('click', () => {
        const isPaused = this.game.togglePause();
        this.elements.pauseBtn.classList.toggle('paused', isPaused);
        const buttonText = this.elements.pauseBtn.querySelector('.button-text');
        if (buttonText) {
          buttonText.textContent = isPaused ? '[RESUME]' : '[PAUSE]';
        }
        this.log(isPaused ? 'Game Paused' : 'Game Resumed');
      });
    }
  }

  setupProjectButton() {
    if (this.elements.startBtn) {
      this.elements.startBtn.addEventListener('click', () => {
        if (!this.game.isPaused) {
          const projectType = this.elements.projectSelect?.value || 'indie';
          const message = this.game.startProject(projectType);
          this.log(message);
          this.update();
        } else {
          this.log('Cannot start project while game is paused');
        }
      });
    }
  }

  setupStaffButton() {
    const hireBtn = document.getElementById('hire');
    if (hireBtn) {
      hireBtn.addEventListener('click', () => {
        if (!this.game.isPaused && this.game.canAfford(2000)) {
          this.game.staff++;
          this.game.spendMoney(2000);
          this.log('Hired new staff member');
          this.update();
        }
      });
    }
  }

  setupHackButtons() {
    this.elements.hackTargets?.addEventListener('click', (e) => {
      const target = e.target.closest('.hack-target');
      if (target && !this.game.isPaused) {
        const targetId = target.dataset.targetId;
        const result = this.game.startHack(targetId);
        this.log(result.message);
        this.update();
      }
    });
  }

  setupUpgradeButtons() {
    document.querySelectorAll('.upgrade-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const upgradeId = btn.dataset.upgradeId;
        if (!this.game.isPaused) {
          const result = this.game.purchaseUpgrade(upgradeId);
          this.log(result.message);
          this.update();
        }
      });
    });
  }

  setupNetworkButtons() {
    document.querySelectorAll('.network-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const actionId = btn.dataset.actionId;
        if (!this.game.isPaused) {
          const result = this.game.executeNetworkAction(actionId);
          this.log(result.message);
          this.update();
        }
      });
    });
  }

  initializePanels() {
    document.querySelectorAll('.panel-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const panelName = btn.getAttribute('data-panel');
        if (panelName) {
          this.showPanel(panelName);
        }
      });
    });
  }

  showPanel(panelName) {
    const panel = this.elements.panels[panelName];
    if (!panel) {
      console.error(`Invalid panel name: ${panelName}`);
      return;
    }

    // Ensure panels container exists and is properly positioned
    const panelsContainer = document.querySelector('.panels-container');
    if (panelsContainer) {
      panelsContainer.style.marginLeft = '80px'; // Leave space for sidebar
    }

    // Hide all panels
    Object.values(this.elements.panels).forEach(p => {
      if (p) {
        p.classList.remove('active');
      }
    });
    
    // Show selected panel
    panel.classList.add('active');
    
    // Update button states
    document.querySelectorAll('.panel-btn').forEach(btn => {
      const btnPanel = btn.getAttribute('data-panel');
      btn.classList.toggle('active', btnPanel === panelName);
    });
  }

  updateProgressBar(barElement, value) {
    if (barElement) {
      const percent = Math.min(Math.max(value, 0), 100);
      barElement.style.width = `${percent}%`;
      barElement.classList.toggle('warning', percent >= 70);
      barElement.classList.toggle('danger', percent >= 90);
    }
  }

  updateActiveHacks(hacks) {
    if (!this.elements.activeHacksList) return;
    
    this.elements.activeHacksList.innerHTML = '';
    hacks.forEach(hack => {
      const hackEl = document.createElement('div');
      hackEl.classList.add('active-hack');
      hackEl.innerHTML = `
        <div class="hack-target">${hack.target}</div>
        <div class="hack-progress">
          <div class="progress-bar" style="width: ${hack.progress}%"></div>
        </div>
        <div class="hack-status">${hack.status}</div>
      `;
      this.elements.activeHacksList.appendChild(hackEl);
    });
  }

  updateHackTargets(targets) {
    if (!this.elements.hackTargets) return;

    this.elements.hackTargets.innerHTML = '';
    targets.forEach(target => {
      const targetEl = document.createElement('div');
      targetEl.classList.add('hack-target');
      targetEl.dataset.targetId = target.id;
      targetEl.innerHTML = `
        <div class="target-name">${target.name}</div>
        <div class="target-difficulty">Difficulty: ${target.difficulty}</div>
        <div class="target-reward">${target.reward} BTC</div>
      `;
      this.elements.hackTargets.appendChild(targetEl);
    });
  }

  updateUpgrades(upgrades) {
    if (!this.elements.upgradesList) return;

    this.elements.upgradesList.innerHTML = '';
    upgrades.forEach(upgrade => {
      const upgradeEl = document.createElement('div');
      upgradeEl.classList.add('upgrade-item');
      upgradeEl.dataset.upgradeId = upgrade.id;
      upgradeEl.innerHTML = `
        <div class="upgrade-name">${upgrade.name}</div>
        <div class="upgrade-description">${upgrade.description}</div>
        <div class="upgrade-cost">${upgrade.cost} BTC</div>
        <button class="upgrade-btn" data-upgrade-id="${upgrade.id}"
          ${!this.game.canAffordUpgrade(upgrade.id) ? 'disabled' : ''}>
          Purchase
        </button>
      `;
      this.elements.upgradesList.appendChild(upgradeEl);
    });
  }

  updateNetworkStatus(status) {
    if (!this.elements.networkStatus) return;

    this.elements.networkStatus.innerHTML = `
      <div class="network-info">
        <div>Connections: ${status.connections}</div>
        <div>Bandwidth: ${status.bandwidth} MB/s</div>
        <div>Encryption: ${status.encryption}</div>
        <div>Detection Risk: ${status.detectionRisk}%</div>
      </div>
    `;
  }

  update() {
    const gameState = this.game.getState();

    // Update global stats (with null checks)
    if (this.elements.money) this.elements.money.textContent = `${gameState.btc.toFixed(8)} BTC`;
    if (this.elements.reputation) this.elements.reputation.textContent = `Rep: ${gameState.reputation}`;
    if (this.elements.uptime) this.elements.uptime.textContent = `Uptime: ${gameState.uptimeFormatted}`;
    if (this.elements.cpuUsage) this.elements.cpuUsage.textContent = `CPU: ${gameState.cpuUsage}%`;

    // Update progress bars
    this.updateProgressBar(this.elements.cpuBar, gameState.cpuUsage);
    this.updateProgressBar(this.elements.riskBar, gameState.riskLevel);

    // Update active hacks list
    this.updateActiveHacks(gameState.activeHacks);

    // Update available targets
    this.updateHackTargets(gameState.availableTargets);

    // Update upgrades list
    this.updateUpgrades(gameState.availableUpgrades);

    // Update network status
    this.updateNetworkStatus(gameState.networkStatus);

    // Enable/disable buttons based on game state
    document.querySelectorAll('.action-btn').forEach(button => {
      button.disabled = this.game.isPaused || !gameState.isActive;
    });

    // Check for game over
    if (gameState.isGameOver && !document.getElementById('game-over')?.classList.contains('active')) {
      this.showGameOver(gameState);
    }
  }

  log(message, type = 'info') {
    if (!this.elements.log) return;

    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.classList.add('log-entry', type);
    logEntry.innerHTML = `
      <span class="log-time">[${timestamp}]</span>
      <span class="log-message">${this.formatLogMessage(message)}</span>
    `;
    
    this.elements.log.insertBefore(logEntry, this.elements.log.firstChild);
    
    // Keep only last 100 messages
    while (this.elements.log.children.length > 100) {
      this.elements.log.removeChild(this.elements.log.lastChild);
    }

    // Auto-scroll if near bottom
    if (this.elements.log.scrollTop > -50) {
      this.elements.log.scrollTop = 0;
    }
  }

  formatLogMessage(message) {
    // Escape any existing HTML
    message = message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Add ASCII color codes and formatting
    return message.replace(/\[(.*?)\]/g, '<span class="highlight">[$1]</span>')
                 .replace(/\{(.*?)\}/g, '<span class="success">{$1}</span>')
                 .replace(/\((.*?)\)/g, '<span class="warning">($1)</span>');
  }

  showGameOver(gameState) {
    if (!this.elements.networkStatus) return;

    this.elements.networkStatus.innerHTML = `
      <div class="game-over">
        <h2>SYSTEM TERMINATED</h2>
        <div class="final-stats">
          <p>Total BTC Earned: ${gameState.totalBtc.toFixed(8)} BTC</p>
          <p>Successful Hacks: ${gameState.successfulHacks}</p>
          <p>Failed Attempts: ${gameState.failedHacks}</p>
          <p>Detection Rate: ${gameState.detectionRate}%</p>
          <p>Max Reputation: ${gameState.maxReputation}</p>
        </div>
        <button id="restart-btn" class="crt-button">[ SYSTEM RESTART ]</button>
      </div>
    `;

    document.getElementById('restart-btn')?.addEventListener('click', () => {
      this.game.restartGame();
    });
  }
}
