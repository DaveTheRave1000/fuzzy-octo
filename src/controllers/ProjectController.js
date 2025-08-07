import { Project } from '../models/Project.js';

export class ProjectController {
  constructor(game, ui) {
    this.game = game;
    this.ui = ui;
    this.setupEventListeners();
  }

  setupEventListeners() {
    const projectSelect = document.getElementById('project-select');
    const startBtn = document.getElementById('start-btn');

    if (!projectSelect || !startBtn) {
      console.error('Required project elements not found');
      return;
    }

    // Update project info when selection changes
    projectSelect.addEventListener('change', () => {
      const projectType = projectSelect.value;
      const project = new Project(projectType);
      this.showProjectInfo(project);
    });

    // Start project when button clicked
    startBtn.addEventListener('click', () => {
      if (this.game.isRunning) {
        this.ui.log('A project is already in progress!');
        return;
      }
      
      const projectType = projectSelect.value;
      const project = new Project(projectType);
      
      // Check if we have minimum required staff
      if (this.game.staff < project.staff) {
        this.ui.log(`Need at least ${project.staff} staff members to start this project!`);
        return;
      }

      this.game.setProject(project);
      this.game.money = project.budget;
      
      this.ui.log(`Initializing ${project.name} project...`);
      this.ui.log(`Initial budget: $${project.budget}`);
      this.ui.log(`Required staff: ${project.staff}`);
      this.ui.log(`Target milestones: ${project.milestones}`);
      
      startBtn.textContent = 'Project In Progress';
      startBtn.disabled = true;
      
      this.ui.update();
    });

    // Show initial project info
    const initialProject = new Project(projectSelect.value);
    this.showProjectInfo(initialProject);
  }

  showProjectInfo(project) {
    const statsDiv = document.querySelector('.project-stats .stats');
    if (statsDiv) {
      statsDiv.innerHTML = `
        <div>Required Staff: <span>${project.staff}</span></div>
        <div>Initial Budget: <span>$${project.budget}</span></div>
        <div>Starting Hype: <span>${project.hype}</span></div>
        <div>Milestones: <span>${project.milestones}</span></div>
      `;
    }
  }

  update() {
    if (!this.game.isRunning || !this.game.project) return;

    const milestoneCompleted = this.game.project.advanceProgress(this.game.staff);
    
    if (milestoneCompleted) {
      const milestone = this.game.project.currentMilestone - 1;
      const bonus = 3000 + (this.game.hype * 100);
      this.game.money += bonus;
      
      this.ui.log(`Milestone ${milestone} completed!`);
      this.ui.log(`Milestone bonus: $${bonus}`);
      
      if (this.game.project.isComplete()) {
        const earnings = this.game.completeProject();
        this.ui.log('🎉 Project Successfully Completed! 🎉');
        this.ui.log(`Total earnings: $${earnings}`);
        
        // Reset start button
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
          startBtn.textContent = 'Initialize Project';
          startBtn.disabled = false;
        }
      }
    }
    
    this.ui.update();
  }
}
