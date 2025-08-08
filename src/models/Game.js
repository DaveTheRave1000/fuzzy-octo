export class Game {
  // Provide a state snapshot for the UI
  getState = () => {
    return {
      btc: this.btc,
      reputation: this.reputation,
      uptimeFormatted: `${Math.floor(this.uptime / 60)}m ${Math.floor(this.uptime % 60)}s`,
      cpuUsage: this.cpuUsage || 0,
      riskLevel: this.detectionRisk || 0,
      activeHacks: this.activeHacks.map(h => ({
        id: h.id,
        name: h.name,
        stageIndex: h.stageIndex,
        stages: h.stages,
        completed: h.completed,
        failed: h.failed,
        stageElapsed: h.stageElapsed,
        currentStageDuration: h.stages[h.stageIndex] ? h.stages[h.stageIndex].duration : h.stages[h.stages.length-1].duration,
        currentStageName: h.stages[h.stageIndex] ? h.stages[h.stageIndex].name : (h.completed ? 'DONE' : '—')
      })),
      availableTargets: this.availableTargets,
      availableUpgrades: Object.values(this.upgrades).map(u => ({
        id: u.id,
        name: u.name,
        level: u.level,
        cost: this.getUpgradeCost(u),
        description: this.getUpgradeDescription(u.id)
      })),
      networkStatus: {
        connections: this.connections || 0,
        bandwidth: 100,
        encryption: `AES-256 L${this.upgrades.encryption.level}`,
        detectionRisk: this.detectionRisk || 0
      },
      isPaused: this.isPaused,
      isActive: this.isGameStarted && !this.isPaused && !this.isGameOver,
      isGameOver: this.isGameOver,
      totalBtc: this.totalBtcEarned || this.btc,
      successfulHacks: this.successfulHacks || 0,
      failedHacks: this.failedHacks || 0,
      detectionRate: this.detectionRisk || 0,
      maxReputation: this.maxReputation || this.reputation,
      research: {
        points: this.research.points,
        available: this.research.available.map(r => ({ id:r.id, name:r.name, cost:r.cost, level:r.level })),
        active: this.research.activeProjects
      },
      activityFeed: this.activityFeed ? this.activityFeed.slice(-20) : [],
      maxConcurrentHacks: this.getMaxConcurrentHacks ? this.getMaxConcurrentHacks() : this.cpuPower
    };
  }
  // Add missing capacity helper as arrow function (consistent binding)
  getMaxConcurrentHacks = () => this.cpuPower;
  constructor() {
    this.initializeGame();
    this.recentEvents = [];
    this.activityFeed = [];
    this.riskNotified60 = false;
    this.riskNotified80 = false;
    this.lastRiskTraceCheck = 0; // seconds accumulator for trace rolls
    this.traceEventActive = false;
    this.traceEventTimer = 0;
    this.traceEventAnswer = null;
    this.graceActive = false;
    this.graceTimer = 0;
  }

  initializeGame = () => {
    // Game state
    this.btc = 0.1;
    this.reputation = 0;
    this.cpuPower = 1;
    this.isGameStarted = false;
    this.isGameOver = false;
    this.uptime = 0;
    // Upgrades
    this.upgrades = {
      bruteforce: { id: 'bruteforce', name: 'Bruteforce', level: 1, baseCost: 0.01 },
      encryption: { id: 'encryption', name: 'Encryption Suite', level: 1, baseCost: 0.02 },
      mining: { id: 'mining', name: 'Mining Rig', level: 1, baseCost: 0.015 },
      cpu: { id: 'cpu', name: 'CPU Core', level: 1, baseCost: 0.05 }
    };
    // Network state
    this.activeHacks = [];
    this.availableTargets = [];
    this.connections = 1;
    this.securityLevel = 1;
    this.detectionRisk = 0;
    this.networkNodes = [];
    
    // Statistics
    this.successfulHacks = 0;
    this.failedHacks = 0;
    this.totalBtcEarned = 0;
    this.maxReputation = 0;
    
    // Software state
    this.software = {
      bruteforce: { level: 1, power: 1 },
      encryption: { level: 1, power: 1 },
      antivirus: { level: 1, power: 1 },
      mining: { level: 1, power: 1 }
    };
    
    // Global state
    this.uptime = 0;
    this.lastUpdate = Date.now();
    this.isPaused = true;
    this.cpuUsage = 0;
    this.detectionRisk = 0;
    this.hype = 0;
    this.isRunning = false;
    this.project = null;
    this.isGameStarted = false;
    this.isGameOver = false;
    
    // Project state
    this.devTime = 0;
    this.bugs = 0;
    this.devPhase = 'Planning';
    this.taskProgress = {};
    
    // Global state
    this.gameTime = 1;
    this.reputation = 0;
    this.followers = 0;
    this.lastUpdate = Date.now();
    this.isPaused = true; // Start paused until game starts
    this.dayLength = 20; // Seconds per day
    this.timeScale = 1;
    this.staffCost = 2000; // Monthly cost per staff member

    // Research system
    this.research = {
      points: 0,
      passiveRate: 0.01, // pts per second
      activeProjects: [],
      available: [
        { id: 'res-speed', name: 'Optimized Algorithms', cost: 10, effect: { bruteSpeed: 0.1 }, level: 0 },
        { id: 'res-risk', name: 'Stealth Protocols', cost: 15, effect: { riskMitigation: 0.05 }, level: 0 },
        { id: 'res-mining', name: 'Quantum Mining', cost: 20, effect: { miningBoost: 0.25 }, level: 0 },
        { id: 'res-cpu', name: 'Parallel Processing', cost: 25, effect: { cpuCore: 1 }, level: 0 }
      ]
    };

    // Prestige and achievements
    this.prestigeLevel = 0;
    this.prestigePoints = 0;
    this.achievements = {
      definitions: [
        { id:'btc-1', name:'First Milli', condition: g=>g.totalBtcEarned>=0.001, bonus: g=>{g.reputation+=1;} },
        { id:'btc-01', name:'Stack Builder', condition: g=>g.totalBtcEarned>=0.01, bonus: g=>{g.research.passiveRate+=0.002;} },
        { id:'hack-10', name:'Script Kiddie', condition: g=>g.successfulHacks>=10, bonus: g=>{g.software.bruteforce.power+=0.1;} },
        { id:'hack-100', name:'Operator', condition: g=>g.successfulHacks>=100, bonus: g=>{g.cpuPower+=1;} },
        { id:'risk-0', name:'Ghost', condition: g=>g.detectionRisk<5 && g.uptime>300, bonus: g=>{g.upgrades.encryption.level+=1;} }
      ],
      unlocked: new Set()
    };
    // Start the game loop
    this.startGameLoop();
  }

  startGame = () => {
    this.isGameStarted = true;
    this.isPaused = false;
    this.lastUpdate = Date.now();
    if (this.availableTargets.length === 0) {
      this.generateNewTargets();
    }
    return 'Game started!';
  }

  checkGameOver = () => {
    // Soft overflow model: do not instantly end at 100, handled in evaluateRisk()
    if (this.isGameOver) return true;
    return false;
  }

  startHack = (targetId) => {
    if (this.activeHacks.length >= this.getMaxConcurrentHacks()) {
      return `ERROR: CPU capacity reached (${this.activeHacks.length}/${this.getMaxConcurrentHacks()}). Upgrade CPU or wait.`;
    }
    const target = this.availableTargets.find(t => t.id === targetId);
    if (!target) return 'ERROR: Invalid target';
    this.activeHacks.push({
      id: target.id,
      name: target.name,
      reward: target.reward,
      difficulty: target.difficulty,
      stages: target.stages,
      stageIndex: 0,
      stageElapsed: 0,
      completed:false,
      failed:false
    });
    this.availableTargets = this.availableTargets.filter(t => t.id !== targetId);
    this.generateNewTargets();
    this.updateCPUUsage();
    this.addEvent(`[START] ${target.name}`);
    return `> Hack initiated on ${target.name}`;
  }

  updateHacks = (deltaTime) => {
    this.activeHacks.forEach(hack => {
      if (hack.completed || hack.failed) return;
      const currentStage = hack.stages[hack.stageIndex];
      hack.stageElapsed += deltaTime * (this.software.bruteforce.power + (this.upgrades.bruteforce.level - 1) * 0.25);
      // Random failure chance small per tick based on risk
      if (Math.random() < (this.detectionRisk / 100000)) {
        hack.failed = true;
        this.failedHacks += 1;
        this.detectionRisk = Math.min(100, this.detectionRisk + 3);
        this.addEvent(`[FAIL] ${hack.name} (${currentStage.name})`);
      }
      if (!hack.failed && hack.stageElapsed >= currentStage.duration) {
        hack.stageIndex++;
        hack.stageElapsed = 0;
        if (hack.stageIndex >= hack.stages.length) {
          hack.completed = true;
          const reward = hack.reward;
          this.btc += reward;
          this.totalBtcEarned += reward;
          this.reputation += Math.floor(hack.difficulty * 5);
          this.successfulHacks += 1;
          this.detectionRisk = Math.max(0, this.detectionRisk - 5);
          this.addEvent(`[COMPLETE] ${hack.name} +${reward.toFixed(4)} BTC`);
        } else {
          this.addEvent(`[STAGE] ${hack.name} -> ${hack.stages[hack.stageIndex].name}`);
        }
      } else if(!hack.failed) {
        const encryptionMitigation = 1 - (this.upgrades.encryption.level * 0.05);
        this.detectionRisk += (hack.difficulty * 0.015 * deltaTime) * encryptionMitigation;
      }
    });
    // Remove finished/failed hacks immediately to free CPU slots
    this.activeHacks = this.activeHacks.filter(h => !h.completed && !h.failed);
    this.updateCPUUsage();
  }

  updateMining = (deltaTime) => {
    const miningGain = this.getMiningRate() * deltaTime;
    this.btc += miningGain;
    this.totalBtcEarned += miningGain;
  }

  getMiningRate() {
    // Base rate scaled by mining upgrade and research effects
    const base = 0.00005; // baseline BTC per second
    const upgradeMult = Math.pow(2, this.upgrades.mining.level - 1); // +100% per level
    const softwareBoost = this.software.mining.power || 1; // includes research
    return base * upgradeMult * softwareBoost;
  }

  updateCPUUsage() {
    const running = this.activeHacks.filter(h => !h.completed).length;
    this.cpuUsage = Math.min(100, (running / this.cpuPower) * 100);
  }

  processRandomEvents(deltaTime) {
    if (Math.random() < deltaTime * 0.1) {
      const event = this.generateRandomEvent();
      this.processEvent(event);
    }
  }

  generateRandomEvent() {
    const events = [
      { type: 'security_scan', risk: 20, message: 'WARNING: Security scan detected!' },
      { type: 'vulnerability', reward: 0.05, message: 'Vulnerability discovered: +0.05 BTC' },
      { type: 'network_glitch', cpuImpact: -10, message: 'Network glitch: CPU performance degraded' }
    ];
    return events[Math.floor(Math.random() * events.length)];
  }

  processEvent(event) {
    switch (event.type) {
      case 'security_scan':
        this.detectionRisk += event.risk;
        break;
      case 'vulnerability':
        this.btc += event.reward;
        break;
      case 'network_glitch':
        this.cpuUsage = Math.max(0, this.cpuUsage + event.cpuImpact);
        break;
    }
    return event.message;
  }

  restartGame() {
    this.initializeGame();
    return 'Game restarted. Starting funds: $10,000';
  }

  togglePause() {
    if (!this.isGameStarted || this.isGameOver) return false;
    this.isPaused = !this.isPaused;
    if (!this.isPaused) {
      this.lastUpdate = Date.now();
    }
    return this.isPaused;
  }

  setTimeScale(scale) {
    this.timeScale = scale;
  }

  startProject(type) {
    const projectTypes = {
      indie: { budget: 5000, staff: 2, hype: 5, milestones: 3 },
      rpg: { budget: 15000, staff: 5, hype: 10, milestones: 5 },
      shooter: { budget: 10000, staff: 3, hype: 8, milestones: 4 }
    };

    const projectConfig = projectTypes[type] || projectTypes.indie;
    
    this.project = {
      type: type,
      budget: projectConfig.budget,
      requiredStaff: projectConfig.staff,
      hype: projectConfig.hype,
      progress: 0,
      currentMilestone: 1,
      milestones: projectConfig.milestones
    };

    this.isRunning = true;
    this.devTime = 0;
    this.bugs = 0;
    this.devPhase = 'Planning';
    this.taskProgress = {};
    
    return `Started new ${type} project`;
  }

  generateRandomTargets(count) {
    const difficultyScale = 1 + (this.uptime / 600) + (this.prestigeLevel * 0.1);
    const targetTypes = [
      { type: 'server', rewardRange: [0.001, 0.01], difficultyRange: [1, 3] },
      { type: 'database', rewardRange: [0.01, 0.05], difficultyRange: [2, 4] },
      { type: 'network', rewardRange: [0.05, 0.2], difficultyRange: [3, 5] },
      { type: 'crypto', rewardRange: [0.2, 1.0], difficultyRange: [4, 6] }
    ];
    return Array.from({ length: count }, () => {
      const base = targetTypes[Math.floor(Math.random() * targetTypes.length)];
      const difficulty = Math.floor((Math.random() * (base.difficultyRange[1] - base.difficultyRange[0] + 1) + base.difficultyRange[0]) * difficultyScale);
      const reward = base.rewardRange[0] + Math.random() * (base.rewardRange[1] - base.rewardRange[0]);
      const baseTime = difficulty * 6 + Math.random() * difficulty * 4;
      return {
        id: Math.random().toString(36).slice(2, 11),
        name: this.generateTargetName(base.type),
        difficulty,
        reward,
        stages: [
          { name: 'SCAN', duration: baseTime * 0.25 },
          { name: 'BREACH', duration: baseTime * 0.45 },
            { name: 'EXFIL', duration: baseTime * 0.30 }
        ]
      };
    });
  }

  generateTargetName(type) {
    const prefixes = ['Hidden', 'Secure', 'Private', 'Corporate', 'Global'];
    const suffixes = ['Hub', 'Core', 'Net', 'Base', 'Cloud'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${prefix}-${suffix}`;
  }

  startGameLoop() {
    this.gameLoop = setInterval(() => {
      if (!this.isPaused) {
        this.update();
      }
    }, 50); // Update every 50ms for smoother updates
  }

  update() {
    if (!this.isGameStarted || this.isPaused || this.isGameOver) {
      this.lastUpdate = Date.now();
      return;
    }
    const now = Date.now();
    const deltaTime = (now - this.lastUpdate) / 1000;
    this.lastUpdate = now;
    this.uptime += deltaTime;

    // Research passive accumulation
    this.research.points += this.research.passiveRate * deltaTime;

    // Passive risk decay pre-evaluation
    const decay = (0.01 + this.upgrades.encryption.level * 0.005) * deltaTime;
    this.detectionRisk = Math.max(0, this.detectionRisk - decay);

    this.updateHacks(deltaTime);
    this.updateMining(deltaTime);
    this.processRandomEvents(deltaTime);

    // Evaluate risk thresholds & overflow trace logic
    this.evaluateRisk(deltaTime);

    this.checkAchievements();
    this.checkGameOver();

    // Check for new day (86400 seconds = 1 day)
    const newDay = Math.floor((this.uptime) / 86400);
    const oldDay = Math.floor((this.uptime - deltaTime) / 86400);

    // Check if a new day has started
    if (newDay > oldDay) {
      this.onNewDay();
    }

    if (this.isRunning && this.project) {
      // Update development time
      this.devTime += deltaTime;
      
      // Update project progress based on staff and time
      const baseProgressRate = 0.01 * (1 + this.staff * 0.5);
      const phaseMultiplier = this.getPhaseMultiplier();
      const progressRate = baseProgressRate * phaseMultiplier;
      
      this.project.progress = Math.min(1, this.project.progress + progressRate * deltaTime);
      
      // Update task progress
      this.updateTaskProgress(deltaTime);
      
      // Generate random bugs based on staff and progress rate
      if (Math.random() < (0.05 + this.staff * 0.01) * deltaTime) {
        const newBugs = Math.floor(Math.random() * this.staff) + 1;
        this.bugs += newBugs;
        return `Found ${newBugs} new bug${newBugs > 1 ? 's' : ''}!`;
      }
      
      // Update dev phase based on progress
      const phaseChanged = this.updateDevPhase();
      if (phaseChanged) {
        return `Development phase changed to: ${this.devPhase}`;
      }
      
      // Complete project if done
      if (this.project.progress >= 1) {
        return this.completeProject();
      }
    }

    // Update followers based on reputation (daily chance)
    const currentDay = Math.floor(this.uptime / 86400); // Convert seconds to days
    const previousDay = Math.floor((this.uptime - deltaTime) / 86400);

    if (currentDay > previousDay) {
      // Handle daily updates
      if (Math.random() < 0.3 + (this.reputation * 0.01)) {
        const newFollowers = Math.floor((Math.random() * this.reputation) + 1);
        this.followers += newFollowers;
        return `Gained ${newFollowers} new followers!`;
      }
    }

    this.tickPostSystems(deltaTime);
  }

  onNewDay = () => {
    // Daily updates for network and security
    const operatingCosts = this.calculateDailyOperatingCosts();
    this.spendBTC(operatingCosts);

    // Generate new hack targets
    this.generateNewTargets();

    // Update security measures
    this.updateSecurityMeasures();

    // Log daily summary
    return {
      type: 'daily',
      message: `[SYSTEM] Daily Report:
        Operating Costs: ${operatingCosts.toFixed(8)} BTC
        Active Connections: ${this.connections}
        Security Level: ${this.securityLevel}
        Detection Risk: ${this.detectionRisk}%`
    };
  }

  calculateDailyOperatingCosts = () => {
    // Base cost for network operation
    let cost = 0.001; // 0.001 BTC base cost

    // Additional costs based on active systems
    cost += this.connections * 0.0001; // Cost per connection
    cost += this.activeHacks.length * 0.0002; // Cost per active hack
    cost += this.securityLevel * 0.0005; // Cost for security measures

    return cost;
  }

  generateNewTargets = () => {
    const count = 3 - this.availableTargets.length;
    if (count > 0) {
      this.availableTargets = this.availableTargets.concat(this.generateRandomTargets(count));
    }
  }

  updateSecurityMeasures = () => {
    // Increase security measures and detection risk based on activity
    this.detectionRisk = Math.min(
      100,
      this.detectionRisk + 
      (this.activeHacks.length * 2) - 
      (this.securityLevel * 0.5)
    );

    if (this.detectionRisk > 80) {
      this.log({
        type: 'warning',
        message: '[WARNING] High detection risk! Consider reducing activity.'
      });
    }
  }

  getPhaseMultiplier = () => {
    switch (this.devPhase) {
      case 'Planning': return 0.7;
      case 'Development': return 1.2;
      case 'Testing': return 0.8;
      case 'Polishing': return 0.5;
      default: return 1.0;
    }
  }

  updateTaskProgress = (deltaTime) => {
    if (!this.project) return;

    const phase = this.devPhase.toLowerCase();
    if (!this.taskProgress[phase]) {
      this.taskProgress[phase] = {
        tasks: [
          { name: 'Documentation', progress: 0 },
          { name: 'Implementation', progress: 0 },
          { name: 'Quality Checks', progress: 0 }
        ]
      };
    }

    this.taskProgress[phase].tasks.forEach(task => {
      if (task.progress < 1) {
        task.progress = Math.min(1, task.progress + (0.01 * deltaTime * this.staff));
      }
    });
  }

  updateDevPhase = () => {
    const progress = this.project.progress;
    if (progress < 0.25) {
      this.devPhase = 'Planning';
    } else if (progress < 0.5) {
      this.devPhase = 'Development';
    } else if (progress < 0.75) {
      this.devPhase = 'Testing';
    } else {
      this.devPhase = 'Polishing';
    }
  }

  canAfford = (cost) => {
    return this.money >= cost;
  }

  spendMoney = (amount) => {
    if (!this.canAfford(amount)) return false;
    this.money -= amount;
    return true;
  }

  earnMoney = (amount) => {
    this.money += amount;
  }

  setProject = (project) => {
    // Set initial values based on project
    this.project = project;
    this.money = project.budget;
    this.hype = Math.max(this.hype, project.hype);
    this.isRunning = true;
  }

  completeProject = () => {
    const earnings = this.calculateEarnings();
    this.earnMoney(earnings);
    
    // Bonus staff experience
    if (this.staff > 0) {
      this.hype += Math.floor(this.staff * 1.5);
    }
    
    this.project = null;
    this.isRunning = false;
    return earnings;
  }

  calculateEarnings = () => {
    if (!this.project) return 0;
    
    // Base earnings from project budget
    let earnings = this.project.budget;
    
    // Bonus from hype (exponential growth)
    earnings += Math.pow(this.hype, 1.5) * 100;
    
    // Staff efficiency bonus
    if (this.staff >= this.project.staff) {
      earnings *= 1.5;
      // Extra bonus for having more staff than needed
      if (this.staff > this.project.staff) {
        earnings *= 1 + ((this.staff - this.project.staff) * 0.1);
      }
    } else {
      // Penalty for understaffing
      earnings *= 0.5 + (this.staff / this.project.staff * 0.5);
    }
    
    return Math.floor(earnings);
  }
  
  getProjectStatus = () => {
    const baseStatus = {
      // Project-specific stats
      money: this.money,
      staff: this.staff,
      hype: this.hype,
      progress: this.project ? Math.floor(this.project.progress * 100) : 0,
      milestone: this.project ? `${this.project.currentMilestone}/${this.project.milestones}` : '-',
      isRunning: this.isRunning,
      devTime: Math.floor(this.devTime),
      bugs: this.bugs,
      devPhase: this.devPhase,
      
      // Global stats
      gameTime: Math.floor(this.gameTime),
      reputation: this.reputation,
      followers: this.followers
    };
    
    return baseStatus;
  }

  spendBTC = (amount) => {
    if (this.btc >= amount) {
      this.btc -= amount;
      return true;
    }
    return false;
  }

  // Upgrade helpers
  getUpgradeCost(u) { return +(u.baseCost * Math.pow(1.8, u.level - 1)).toFixed(5); }
  getUpgradeDescription(id) {
    switch(id) {
      case 'bruteforce': return 'Speed +25% per level';
      case 'encryption': return 'Risk gain -5% per level';
      case 'mining': return 'Mining +100% per level';
      case 'cpu': return 'Adds +1 concurrent hack';
      default: return '';
    }
  }
  canAffordUpgrade(id) {
    const u = this.upgrades[id];
    if (!u) return false;
    return this.btc >= this.getUpgradeCost(u);
  }
  purchaseUpgrade(id) {
    const u = this.upgrades[id];
    if (!u) return { success: false, message: 'Invalid upgrade' };
    const cost = this.getUpgradeCost(u);
    if (this.btc < cost) {
      this.addEvent(`[UPGRADE FAIL] ${u?.name||id} (insufficient BTC)`);
      return { success: false, message: 'Insufficient BTC' };
    }
    this.btc -= cost;
    u.level++;
    if (id === 'cpu') this.cpuPower++;
    if (id === 'mining') this.software.mining.power += 1;
    if (id === 'bruteforce') this.software.bruteforce.power += 0.25;
    this.addEvent(`[UPGRADE] ${u.name} L${u.level}`);
    return { success: true, message: `[UPGRADE] ${u.name} L${u.level}` };
  }
  purchaseResearch(id) {
    const r = this.research.available.find(p => p.id === id);
    if (!r) return { success:false, message:'Invalid research' };
    if (this.research.points < r.cost) {
      this.addEvent(`[RESEARCH FAIL] ${r?.name||id} need ${r.cost} RP`);
      return { success:false, message:'Insufficient research points' };
    }
    this.research.points -= r.cost;
    r.level++;
    if (r.effect.bruteSpeed) this.software.bruteforce.power += r.effect.bruteSpeed;
    if (r.effect.riskMitigation) this.research.passiveRate += 0.002;
    if (r.effect.miningBoost) this.software.mining.power += r.effect.miningBoost;
    if (r.effect.cpuCore) this.cpuPower += r.effect.cpuCore;
    r.cost = Math.ceil(r.cost * 1.75);
    this.addEvent(`[RESEARCH] ${r.name} L${r.level}`);
    return { success:true, message:`Research upgraded: ${r.name}` };
  }
  checkAchievements() {
    this.achievements.definitions.forEach(a => {
      if (!this.achievements.unlocked.has(a.id) && a.condition(this)) {
        this.achievements.unlocked.add(a.id);
        a.bonus(this);
        this.addEvent(`[ACHIEVEMENT] ${a.name}`);
      }
    });
  }
  addEvent(msg) {
    this.recentEvents.push(msg);
    this.activityFeed.push({ msg, t: Date.now() });
    if (this.activityFeed.length > 100) this.activityFeed.splice(0, this.activityFeed.length-100);
  }

  evaluateRisk(deltaTime) {
    const r = this.detectionRisk;
    if (r >= 60 && !this.riskNotified60) { this.addEvent('[RISK] Elevated network scrutiny detected.'); this.riskNotified60 = true; }
    if (r >= 80 && !this.riskNotified80) { this.addEvent('[RISK] CRITICAL: Active tracing suspected!'); this.riskNotified80 = true; }

    if (r < 60) { this.riskNotified60 = false; }
    if (r < 80) { this.riskNotified80 = false; }

    if (r >= 100 && !this.isGameOver) {
      this.lastRiskTraceCheck += deltaTime;
      if (this.lastRiskTraceCheck >= 1) {
        this.lastRiskTraceCheck = 0;
        const overflow = r - 100;
        const base = 0.05;
        const perOverflow = 0.005;
        const mitigation = this.upgrades.encryption.level * 0.03;
        const mitigationFactor = mitigation * 0.5;
        let chance = base + overflow * perOverflow - mitigationFactor;
        chance = Math.min(0.85, Math.max(0.02, chance));
        if (Math.random() < chance) {
          // Instead of immediate game over, launch mini-event if not already in one or grace
          if (!this.traceEventActive && !this.graceActive) {
            this.launchTraceEvent();
          } else if(this.graceActive) {
            // Grace already used; now it is final
            this.triggerGameOver();
          }
        } else {
          this.addEvent(`[TRACE] Sweep evaded (risk ${r.toFixed(1)} / overflow ${overflow}).`);
        }
      }
    } else {
      this.lastRiskTraceCheck = 0; // reset when under 100
    }
  }
  launchTraceEvent() {
    this.traceEventActive = true;
    this.traceEventTimer = 25; // extended to 25 seconds to choose
    const options = ['PURGE LOGS','ROTATE KEYS','FLOOD NOISE'];
    this.traceEventAnswer = options[Math.floor(Math.random()*options.length)];
    this.addEvent('[TRACE] Active trace detected! Execute countermeasure!');
  }
  resolveTraceOption(choice) {
    if (!this.traceEventActive) return { resolved:false };
    const success = choice === this.traceEventAnswer;
    if (success) {
      this.addEvent('[TRACE] Countermeasure successful. Entering GRACE window.');
      this.activateGraceWindow();
    } else {
      this.addEvent('[TRACE] Countermeasure failed. Trace tightening.');
      this.triggerGameOver();
    }
    this.traceEventActive = false;
    return { resolved:true, success };
  }
  activateGraceWindow() {
    this.graceActive = true;
    this.graceTimer = 10; // seconds
    // Mitigate immediate risk spike
    this.detectionRisk = Math.min(this.detectionRisk, 85);
  }
  update(deltaTime) {
    if (!this.isGameStarted || this.isPaused || this.isGameOver) {
      this.lastUpdate = Date.now();
      return;
    }
    const now = Date.now();
    const realDeltaTime = (now - this.lastUpdate) / 1000;
    this.lastUpdate = now;
    this.uptime += realDeltaTime;

    // Research passive accumulation
    this.research.points += this.research.passiveRate * realDeltaTime;

    // Passive risk decay pre-evaluation
    const decay = (0.01 + this.upgrades.encryption.level * 0.005) * realDeltaTime;
    this.detectionRisk = Math.max(0, this.detectionRisk - decay);

    this.updateHacks(realDeltaTime);
    this.updateMining(realDeltaTime);
    this.processRandomEvents(realDeltaTime);

    // Evaluate risk thresholds & overflow trace logic
    this.evaluateRisk(realDeltaTime);

    this.checkAchievements();
    this.checkGameOver();

    // Check for new day (86400 seconds = 1 day)
    const newDay = Math.floor((this.uptime) / 86400);
    const oldDay = Math.floor((this.uptime - realDeltaTime) / 86400);

    // Check if a new day has started
    if (newDay > oldDay) {
      this.onNewDay();
    }

    if (this.isRunning && this.project) {
      // Update development time
      this.devTime += realDeltaTime;
      
      // Update project progress based on staff and time
      const baseProgressRate = 0.01 * (1 + this.staff * 0.5);
      const phaseMultiplier = this.getPhaseMultiplier();
      const progressRate = baseProgressRate * phaseMultiplier;
      
      this.project.progress = Math.min(1, this.project.progress + progressRate * realDeltaTime);
      
      // Update task progress
      this.updateTaskProgress(realDeltaTime);
      
      // Generate random bugs based on staff and progress rate
      if (Math.random() < (0.05 + this.staff * 0.01) * realDeltaTime) {
        const newBugs = Math.floor(Math.random() * this.staff) + 1;
        this.bugs += newBugs;
        return `Found ${newBugs} new bug${newBugs > 1 ? 's' : ''}!`;
      }
      
      // Update dev phase based on progress
      const phaseChanged = this.updateDevPhase();
      if (phaseChanged) {
        return `Development phase changed to: ${this.devPhase}`;
      }
      
      // Complete project if done
      if (this.project.progress >= 1) {
        return this.completeProject();
      }
    }

    // Update followers based on reputation (daily chance)
    const currentDay = Math.floor(this.uptime / 86400); // Convert seconds to days
    const previousDay = Math.floor((this.uptime - realDeltaTime) / 86400);

    if (currentDay > previousDay) {
      // Handle daily updates
      if (Math.random() < 0.3 + (this.reputation * 0.01)) {
        const newFollowers = Math.floor((Math.random() * this.reputation) + 1);
        this.followers += newFollowers;
        return `Gained ${newFollowers} new followers!`;
      }
    }

    this.tickPostSystems(realDeltaTime);
  }

  tickPostSystems(deltaTime) {
    if (this.traceEventActive) {
      this.traceEventTimer -= deltaTime;
      if (this.traceEventTimer <= 0) {
        // Auto fail if no choice
        this.addEvent('[TRACE] No response. Trace lock achieved.');
        this.traceEventActive = false;
        this.triggerGameOver();
      }
    }
    if (this.graceActive) {
      this.graceTimer -= deltaTime;
      if (this.graceTimer <= 0) {
        if (this.detectionRisk >= 80) {
          this.addEvent('[GRACE] Risk still critical after grace window.');
          this.triggerGameOver();
        } else {
          this.addEvent('[GRACE] Trace window cleared. Resuming operations.');
        }
        this.graceActive = false;
      }
    }
  }
  triggerGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.isPaused = true;
    this.addEvent('[SYSTEM] SESSION TERMINATED. You were traced.');
  }
}
