export class Staff {
  static HIRE_COST = 2000;

  constructor(game) {
    this.game = game;
  }

  canHire() {
    return this.game.canAfford(Staff.HIRE_COST);
  }

  hire() {
    if (!this.canHire()) return false;
    
    this.game.spendMoney(Staff.HIRE_COST);
    this.game.staff++;
    return true;
  }

  fire() {
    if (this.game.staff <= 0) return false;
    this.game.staff--;
    return true;
  }

  getProductivity() {
    return this.game.staff * 2; // Each staff member adds 2% progress per tick
  }
}
