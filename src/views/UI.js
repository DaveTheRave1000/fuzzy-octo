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
      codeStream: document.getElementById('network-stream'),
      researchList: document.getElementById('research-list'),
      researchProjects: document.getElementById('research-projects'),
      researchPoints: document.getElementById('research-points'),
      upgradesList: document.getElementById('upgrades-list'),
      analytics: {
        completed: document.getElementById('stat-completed-hacks'),
        failed: document.getElementById('stat-failed-hacks'),
        btcPerMin: document.getElementById('stat-btc-per-min'),
        risk: document.getElementById('stat-risk'),
        activityList: document.getElementById('activity-list')
      },
      panels: {
        hack: document.getElementById('panel-hack'),
        network: document.getElementById('panel-network'),
        software: document.getElementById('panel-software'),
        darknet: document.getElementById('panel-darknet'),
        staff: document.getElementById('panel-staff'), // research
        progress: document.getElementById('panel-progress') // analytics
      },
      resourceStats: document.getElementById('resource-stats'),
    };

    this.lastUpgradesSig = '';
    this.lastResearchSig = '';

    this.clickCooldowns = { upgrade:0, research:0 };

    this.traceOverlay = document.getElementById('trace-overlay');
    this.graceBanner = null;
    this.injectedTrace = false;

    this.initializeEventListeners();
    this.showPanel('hack');
    this.startUpdateLoop();
    this.updateTraceUI();
  }

  startUpdateLoop = () => {
    setInterval(() => {
      this.update();
      this.updateCodeStream();
      this.updateAnalytics();
    }, 300); // slower composite update
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

  setupHackButtons() { /* now using event delegation */
    if (!this.elements.hackTargets) return;
    this.elements.hackTargets.addEventListener('click', (e) => {
      const btn = e.target.closest('.hack-btn');
      if (!btn || this.game.isPaused) return;
      const targetId = btn.dataset.targetId;
      if (!targetId) return;
      const result = this.game.startHack(targetId);
      this.log(result, 'system');
      this.update();
    });
  }

  setupUpgradeButtons() {
    if (!this.elements.upgradesList) return;
    this.elements.upgradesList.addEventListener('click', (e) => {
      const btn = e.target.closest('.upgrade-btn');
      if (!btn || this.game.isPaused) return;
      const now = performance.now();
      if (now - this.clickCooldowns.upgrade < 120) return; // debounce
      this.clickCooldowns.upgrade = now;
      const id = btn.dataset.upgradeId;
      if (!id) return;
      const cost = parseFloat(btn.dataset.cost || '0');
      if (this.game.btc < cost) {
        this.log(`[UPGRADE] Need ${cost.toFixed(5)} BTC`, 'warning');
        return;
      }
      const result = this.game.purchaseUpgrade(id);
      this.log(result.message, result.success ? 'success' : 'warning');
      // Delay re-render slightly to allow click visual feedback to complete
      setTimeout(()=>{
        this.lastUpgradesSig = '';
        this.updateUpgrades(this.game.getState().availableUpgrades);
      }, 50);
    });
  }

  updateUpgrades(upgrades) {
    if (!this.elements.upgradesList) return;
    // Build signature to avoid unnecessary rerender (reduces flicker / missed clicks)
    const sig = upgrades.map(u=>`${u.id}:${u.level}:${u.cost}`).join('|');
    if (sig === this.lastUpgradesSig) return; // no change
    this.lastUpgradesSig = sig;
    this.elements.upgradesList.innerHTML = '';
    upgrades.forEach(upgrade => {
      const affordable = this.game.btc >= upgrade.cost;
      const el = document.createElement('div');
      el.classList.add('software-item');
      el.innerHTML = `
        <div class="software-header"><span class="name">${upgrade.name}</span><span class="level">L${upgrade.level}</span></div>
        <div class="software-stats"><div class="power">Cost: ${upgrade.cost} BTC</div></div>
        <div class="software-stats"><div class="power">${upgrade.description}</div></div>
        <button class="crt-button upgrade-btn ${affordable ? '' : 'disabled'}" data-upgrade-id="${upgrade.id}" data-cost="${upgrade.cost}">UPGRADE</button>
      `;
      this.elements.upgradesList.appendChild(el);
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
      const stageCount = hack.stages ? hack.stages.length : 1;
      const currentStageIndex = hack.stageIndex || 0;
      const currentStage = hack.stages && hack.stages[currentStageIndex];
      let percent = 0;
      if (currentStage && hack.currentStageDuration) {
        percent = Math.min(100, (hack.stageElapsed / hack.currentStageDuration) * 100);
      } else if (hack.completed) {
        percent = 100;
      }
      const statusLabel = hack.failed ? '<span class="hack-status fail">FAILED</span>' : hack.completed ? '<span class="hack-status done">COMPLETE</span>' : `<span class="hack-status stage">${hack.currentStageName || (currentStage?currentStage.name:'')}</span>`;
      const barClasses = ['hack-progress-fill'];
      if (hack.failed) barClasses.push('failed');
      else if (hack.completed) barClasses.push('complete');
      else if (percent > 80) barClasses.push('high');
      else if (percent > 50) barClasses.push('mid');
      const hackEl = document.createElement('div');
      hackEl.classList.add('active-hack');
      hackEl.innerHTML = `
        <div class="hack-row">
          <div class="hack-name">${hack.name}</div>
          <div class="hack-stage-info">Stage ${(hack.failed||hack.completed)?'-':(currentStageIndex+1)}/${stageCount} ${statusLabel}</div>
        </div>
        <div class="hack-progress-bar"><div class="${barClasses.join(' ')}" style="width:${percent}%;"></div></div>
      `;
      this.elements.activeHacksList.appendChild(hackEl);
    });
  }

  updateHackTargets(targets) {
    if (!this.elements.hackTargets) return;
    this.elements.hackTargets.innerHTML = '';
    targets.forEach(target => {
      const targetEl = document.createElement('div');
      targetEl.classList.add('target-item');
      targetEl.innerHTML = `
        <span class="target-name">${target.name}</span>
        <span class="target-difficulty">Diff: ${target.difficulty}</span>
        <span class="target-reward">${target.reward.toFixed(4)} BTC</span>
        <button class="crt-button hack-btn" data-target-id="${target.id}">HACK</button>
      `;
      this.elements.hackTargets.appendChild(targetEl);
    });
  }

  updateUpgrades(upgrades) {
    if (!this.elements.upgradesList) return;
    // Build signature to avoid unnecessary rerender (reduces flicker / missed clicks)
    const sig = upgrades.map(u=>`${u.id}:${u.level}:${u.cost}`).join('|');
    if (sig === this.lastUpgradesSig) return; // no change
    this.lastUpgradesSig = sig;
    this.elements.upgradesList.innerHTML = '';
    upgrades.forEach(upgrade => {
      const affordable = this.game.btc >= upgrade.cost;
      const el = document.createElement('div');
      el.classList.add('software-item');
      el.innerHTML = `
        <div class="software-header"><span class="name">${upgrade.name}</span><span class="level">L${upgrade.level}</span></div>
        <div class="software-stats"><div class="power">Cost: ${upgrade.cost} BTC</div></div>
        <div class="software-stats"><div class="power">${upgrade.description}</div></div>
        <button class="crt-button upgrade-btn ${affordable ? '' : 'disabled'}" data-upgrade-id="${upgrade.id}" data-cost="${upgrade.cost}">UPGRADE</button>
      `;
      this.elements.upgradesList.appendChild(el);
    });
  }

  updateNetworkStatus(status) {
    if (!this.elements.networkStatus) return;

    const capacity = `${this.game.activeHacks.length}/${this.game.getMaxConcurrentHacks ? this.game.getMaxConcurrentHacks() : this.game.cpuPower}`;
    this.elements.networkStatus.innerHTML = `
      <div class="network-info">
        <div>Connections: ${status.connections}</div>
        <div>Bandwidth: ${status.bandwidth} MB/s</div>
        <div>Encryption: ${status.encryption}</div>
        <div>Detection Risk: ${status.detectionRisk}%</div>
        <div>CPU Slots: ${capacity}</div>
      </div>
    `;
  }

  updateAnalytics() {
    if (!this.game) return;
    const s = this.game.getState();
    if (this.elements.analytics.completed) this.elements.analytics.completed.textContent = s.successfulHacks;
    if (this.elements.analytics.failed) this.elements.analytics.failed.textContent = s.failedHacks;
    if (this.elements.analytics.btcPerMin) {
      const minutes = (this.game.uptime / 60) || 1;
      this.elements.analytics.btcPerMin.textContent = (s.totalBtc / minutes).toFixed(4);
    }
    if (this.elements.analytics.risk) this.elements.analytics.risk.textContent = `${Math.round(s.riskLevel)}%`;
    if (this.elements.analytics.activityList && s.activityFeed) {
      this.elements.analytics.activityList.innerHTML = s.activityFeed.slice(-10).reverse().map(a=>`<div class="activity-line">${new Date(a.t).toLocaleTimeString()} ${a.msg}</div>`).join('');
    }
  }

  updateCodeStream() {
    if (!this.elements.codeStream) return;
    // Generate pseudo code lines
    const lines = [];
    for (let i = 0; i < 3; i++) {
      lines.push(this.randomCodeLine());
    }
    // Keep last ~60 lines
    const existing = this.elements.codeStream.textContent.split('\n').filter(l => l.trim().length);
    const combined = existing.concat(lines).slice(-60);
    this.elements.codeStream.textContent = combined.join('\n');
  }

  randomCodeLine() {
    const hex = () => Math.floor(Math.random()*255).toString(16).padStart(2,'0');
    const ops = ['SCAN','AUTH','PING','HASH','DECRYPT','TRACE','ROUTE','ALLOC'];
    return `[${hex()}${hex()}] ${ops[Math.floor(Math.random()*ops.length)]} :: ${Math.random().toString(36).slice(2,10)} => ${hex()}${hex()}:${Math.floor(Math.random()*65535)}`;
  }

  update() {
    const gameState = this.game.getState();

    // Update global stats (new header stats)
    const btcEl = document.getElementById('global-btc');
    if (btcEl) btcEl.textContent = gameState.btc.toFixed(8);

    const riskEl = document.getElementById('global-risk');
    if (riskEl) riskEl.textContent = `${Math.round(gameState.riskLevel)}%`;

    const hacksEl = document.getElementById('global-active-hacks');
    if (hacksEl) hacksEl.textContent = gameState.activeHacks.length;

    const uptimeEl = document.getElementById('global-uptime');
    if (uptimeEl) uptimeEl.textContent = gameState.uptimeFormatted;

    // Existing hidden elements (legacy)
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

    // Update resource stats
    this.updateResourceStats(gameState);
    this.updateResearch(gameState.research);
    this.flushGameEvents();
    this.updateTraceUI(); // ensure trace / grace UI updates every cycle

    const cpuSlotsEl = document.getElementById('cpu-slots-display');
    if (cpuSlotsEl) {
      cpuSlotsEl.textContent = `${this.game.activeHacks.length}/${gameState.maxConcurrentHacks || this.game.cpuPower}`;
    }
  }

  flushGameEvents() {
    if (!this.game.recentEvents || !this.game.recentEvents.length) return;
    this.game.recentEvents.splice(0).forEach(evt => this.log(evt, 'system'));
  }

  updateResourceStats(state) {
    if (!this.elements.resourceStats) return;
    const miningRate = this.game.getMiningRate ? this.game.getMiningRate() : (0.00005 * this.game.upgrades.mining.level);
    this.elements.resourceStats.innerHTML = `
      <div class="res-item"><span class="res-label">CPU CORES</span><span class="res-value">${this.game.cpuPower}</span></div>
      <div class="res-item"><span class="res-label">BRUTE LVL</span><span class="res-value">${this.game.upgrades.bruteforce.level}</span></div>
      <div class="res-item"><span class="res-label">ENCRYPT LVL</span><span class="res-value">${this.game.upgrades.encryption.level}</span></div>
      <div class="res-item"><span class="res-label">MINING LVL</span><span class="res-value">${this.game.upgrades.mining.level}</span></div>
      <div class="res-item"><span class="res-label">MINING RATE</span><span class="res-value">${miningRate.toFixed(5)}/s</span></div>
      <div class="res-item"><span class="res-label">BTC</span><span class="res-value">${state.btc.toFixed(4)}</span></div>
      <div class="res-item"><span class="res-label">RISK</span><span class="res-value">${Math.round(state.riskLevel)}%</span></div>
    `;
  }

  updateResearch(researchState) {
    if (!researchState) return;
    if (this.elements.researchPoints) this.elements.researchPoints.textContent = researchState.points.toFixed(1);
    if (!this.elements.researchList) return;
    // Construct signature
    const sig = researchState.available.map(r=>`${r.id}:${r.level}:${r.cost}`).join('|') + `|p:${researchState.points.toFixed(2)}`;
    if (sig === this.lastResearchSig) return;
    this.lastResearchSig = sig;
    this.elements.researchList.innerHTML = '';
    researchState.available.forEach(item => {
      const insufficient = researchState.points < item.cost;
      const row = document.createElement('div');
      row.classList.add('staff-member');
      row.innerHTML = `
        <div class="research-name">${item.name} <span class="level">L${item.level}</span></div>
        <div class="research-cost">Cost: ${item.cost} RP</div>
        <button class="crt-button research-btn ${insufficient? 'disabled':''}" data-research-id="${item.id}" data-cost="${item.cost}">Research</button>
      `;
      this.elements.researchList.appendChild(row);
    });
    // Event delegation (attach once)
    if (!this._researchDelegated) {
      this._researchDelegated = true;
      this.elements.researchList.addEventListener('click', (e) => {
        const btn = e.target.closest('.research-btn');
        if (!btn || this.game.isPaused) return;
        const now = performance.now();
        if (now - this.clickCooldowns.research < 120) return; // debounce
        this.clickCooldowns.research = now;
        const id = btn.dataset.researchId;
        const cost = parseFloat(btn.dataset.cost || '0');
        if (this.game.research.points < cost) {
          this.log(`[RESEARCH] Need ${cost} RP`, 'warning');
          return;
        }
        const result = this.game.purchaseResearch(id);
        this.log(result.message, result.success ? 'success':'warning');
        setTimeout(()=>{
          this.lastResearchSig = '';
          this.updateResearch(this.game.getState().research);
        },50);
      });
    }
  }

  log(message, type='info') {
    if (!this.elements.log) return;
    const line = document.createElement('div');
    let derivedType = type;
    if (/^\[RISK\]/.test(message)) derivedType = 'risk';
    if (/^\[TRACE\]/.test(message)) derivedType = 'trace';
    line.className = `log-line ${derivedType}`;
    const ts = new Date().toLocaleTimeString();
    line.textContent = `[${ts}] ${message}`;
    this.elements.log.appendChild(line);
    this.elements.log.scrollTop = this.elements.log.scrollHeight;
  }

  updateTraceUI() {
    if (!this.traceOverlay) return;
    const g = this.game;
    // Mini-event active
    if (g.traceEventActive) {
      if (!this.injectedTrace) {
        const opts = ['PURGE LOGS','ROTATE KEYS','FLOOD NOISE'];
        this.traceOverlay.innerHTML = `
          <div class="trace-panel">
            <div class="trace-title">> TRACE COUNTERMEASURE</div>
            <div class="trace-desc">Active intrusion trace in progress. Select the correct countermeasure before lock completes.</div>
            <div class="trace-options">
              ${opts.map(o=>`<button class="trace-btn" data-trace-opt="${o}">${o}</button>`).join('')}
            </div>
            <div class="trace-timer">Time Left: <span id="trace-timer-val">${g.traceEventTimer.toFixed(1)}</span>s</div>
          </div>`;
        this.traceOverlay.style.display = 'flex';
        this.traceOverlay.addEventListener('click', this.onTraceClick);
        this.injectedTrace = true;
      } else {
        const tEl = document.getElementById('trace-timer-val');
        if (tEl) tEl.textContent = g.traceEventTimer.toFixed(1);
      }
    } else if (this.injectedTrace) {
      // remove overlay when event resolved
      this.traceOverlay.style.display = 'none';
      this.traceOverlay.innerHTML = '';
      this.traceOverlay.removeEventListener('click', this.onTraceClick);
      this.injectedTrace = false;
    }

    // Grace banner
    if (g.graceActive) {
      if (!this.graceBanner) {
        this.graceBanner = document.createElement('div');
        this.graceBanner.className = 'grace-banner';
        document.body.appendChild(this.graceBanner);
      }
      this.graceBanner.textContent = `GRACE WINDOW: ${g.graceTimer.toFixed(1)}s - Lower risk below 80 (${Math.round(g.detectionRisk)}%)`;
    } else if (this.graceBanner) {
      this.graceBanner.remove();
      this.graceBanner = null;
    }
  }

  onTraceClick = (e) => {
    const btn = e.target.closest('.trace-btn');
    if (!btn) return;
    const choice = btn.dataset.traceOpt;
    const result = this.game.resolveTraceOption(choice);
    if (result.resolved) {
      this.updateTraceUI();
    }
  }
}
