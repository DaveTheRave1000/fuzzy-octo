export class Game {
  // Provide a state snapshot for the UI
  getState = () => {
    return {
      btc: this.btc,
      reputation: this.reputation,
      uptimeFormatted: `${Math.floor(this.uptime / 60)}m ${Math.floor(this.uptime % 60)}s`,
      cpuUsage: this.cpuUsage || 0,
      riskLevel: this.detectionRisk || 0,
      activeHacks: this.activeHacks || [],
      availableTargets: this.availableTargets || [],
      availableUpgrades: [], // Add upgrade logic if needed
      networkStatus: {
        connections: this.connections || 0,
        bandwidth: 100, // Example value
        encryption: 'AES-256', // Example value
        detectionRisk: this.detectionRisk || 0
      },
      isPaused: this.isPaused,
      isActive: this.isGameStarted && !this.isPaused && !this.isGameOver,
      isGameOver: this.isGameOver,
      totalBtc: this.totalBtcEarned || this.btc,
      successfulHacks: this.successfulHacks || 0,
      failedHacks: this.failedHacks || 0,
      detectionRate: this.detectionRisk || 0,
      maxReputation: this.maxReputation || this.reputation
    };
  }
  // Provide a state snapshot for the UI
  getState = () => {
    return {
      btc: this.btc,
      reputation: this.reputation,
      uptimeFormatted: `${Math.floor(this.uptime / 60)}m ${Math.floor(this.uptime % 60)}s`,
      cpuUsage: this.cpuUsage || 0,
      riskLevel: this.detectionRisk || 0,
      activeHacks: this.activeHacks || [],
      availableTargets: this.availableTargets || [],
      availableUpgrades: [], // Add upgrade logic if needed
      networkStatus: {
        connections: this.connections || 0,
        bandwidth: 100, // Example value
        encryption: 'AES-256', // Example value
        detectionRisk: this.detectionRisk || 0
      },
      isPaused: this.isPaused,
      isActive: this.isGameStarted && !this.isPaused && !this.isGameOver,
      isGameOver: this.isGameOver,
      totalBtc: this.totalBtcEarned || this.btc,
      successfulHacks: this.successfulHacks || 0,
      failedHacks: this.failedHacks || 0,
      detectionRate: this.detectionRisk || 0,
      maxReputation: this.maxReputation || this.reputation
    };
  }
  constructor() {
    this.initializeGame();
  }

  initializeGame = () => {
    // Game state
    this.btc = 0.1;
    this.reputation = 0;
    this.cpuPower = 1;
    this.isGameStarted = false;
    this.isGameOver = false;
    this.uptime = 0;
    
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

    // Start the game loop
    this.startGameLoop();
  }

  startGame = () => {
    this.isGameStarted = true;
    this.isPaused = false;
    this.lastUpdate = Date.now();
    return 'Game started!';
  }

  checkGameOver = () => {
    if (this.detectionRisk >= 100 && !this.isGameOver) {
      this.isGameOver = true;
      this.isPaused = true;
      return true;
    }
    return false;
  }

  startHack = (target) => {
    if (this.activeHacks.length >= this.cpuPower) {
      return 'ERROR: Insufficient CPU resources';
    }

    const hack = {
      target: target,
      progress: 0,
      difficulty: this.calculateDifficulty(target),
      reward: this.calculateReward(target),
      detectionRisk: Math.random() * 20
    };

    this.activeHacks.push(hack);
    this.updateCPUUsage();
    return `Initiating hack on ${target}...`;
  }

  updateHacks = (deltaTime) => {
    this.activeHacks = this.activeHacks.filter(hack => {
      hack.progress += (this.software.bruteforce.power * deltaTime) / hack.difficulty;
      
      if (hack.progress >= 1) {
        this.completeHack(hack);
        return false;
      }
      
      // Increase detection risk
      this.detectionRisk += (hack.detectionRisk * deltaTime) / 100;
      return true;
    });

    this.updateCPUUsage();
  }

  completeHack(hack) {
    this.btc += hack.reward;
    this.reputation += Math.floor(hack.difficulty * 10);
    this.detectionRisk = Math.max(0, this.detectionRisk - 10);
    return `Hack completed. +${hack.reward.toFixed(4)} BTC`;
  }

  updateMining = (deltaTime) => {
    const miningRate = this.software.mining.power * deltaTime / 3600; // BTC per hour
    this.btc += miningRate;
    this.cpuUsage = Math.min(100, this.cpuUsage + (miningRate * 100));
  }

  updateCPUUsage() {
    this.cpuUsage = Math.min(100, (this.activeHacks.length / this.cpuPower) * 100);
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
    const targetTypes = [
      { type: 'server', rewardRange: [0.001, 0.01], difficultyRange: [1, 3] },
      { type: 'database', rewardRange: [0.01, 0.05], difficultyRange: [2, 4] },
      { type: 'network', rewardRange: [0.05, 0.2], difficultyRange: [3, 5] },
      { type: 'crypto', rewardRange: [0.2, 1.0], difficultyRange: [4, 6] }
    ];

    return Array.from({ length: count }, () => {
      const target = targetTypes[Math.floor(Math.random() * targetTypes.length)];
      const difficulty = Math.floor(
        Math.random() * (target.difficultyRange[1] - target.difficultyRange[0] + 1) +
        target.difficultyRange[0]
      );
      const reward = 
        target.rewardRange[0] +
        Math.random() * (target.rewardRange[1] - target.rewardRange[0]);

      return {
        id: Math.random().toString(36).substr(2, 9),
        name: this.generateTargetName(target.type),
        type: target.type,
        difficulty,
        reward,
        progress: 0,
        timeToHack: difficulty * 10
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
    const deltaTime = (now - this.lastUpdate) / 1000; // Convert to seconds
    this.lastUpdate = now;

    // Update uptime
    this.uptime += deltaTime;
    
    // Update game systems
    this.updateHacks(deltaTime);
    this.updateMining(deltaTime);
    this.processRandomEvents(deltaTime);
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
    // Remove some old targets and add new ones
    this.availableTargets = this.availableTargets
      .filter(target => Math.random() > 0.2) // 20% chance to remove old targets
      .concat(this.generateRandomTargets(2)); // Add 2 new targets
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
}
