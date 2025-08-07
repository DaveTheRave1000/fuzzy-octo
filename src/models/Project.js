export const projects = {
  indie: { name: 'Indie Platformer', budget: 10000, staff: 2, hype: 10, milestones: 3 },
  rpg: { name: 'Epic RPG', budget: 20000, staff: 4, hype: 20, milestones: 5 },
  shooter: { name: 'Space Shooter', budget: 15000, staff: 3, hype: 15, milestones: 4 }
};

export class Project {
  constructor(type) {
    const template = projects[type];
    Object.assign(this, template);
    this.type = type;
    this.progress = 0;
    this.currentMilestone = 1;
  }

  advanceProgress(staffCount) {
    const progressIncrease = staffCount * 2;
    this.progress += progressIncrease;
    
    if (this.progress >= 100) {
      this.progress = 0;
      this.currentMilestone++;
      return true; // milestone completed
    }
    return false;
  }

  isComplete() {
    return this.currentMilestone > this.milestones;
  }
}
