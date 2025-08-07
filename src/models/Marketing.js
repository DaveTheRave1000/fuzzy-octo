export class Marketing {
  static CAMPAIGN_COST = 1000;

  constructor(game) {
    this.game = game;
  }

  canLaunchCampaign() {
    return this.game.canAfford(Marketing.CAMPAIGN_COST);
  }

  launchCampaign() {
    if (!this.canLaunchCampaign()) return false;
    
    this.game.spendMoney(Marketing.CAMPAIGN_COST);
    this.game.hype += 5;
    return true;
  }

  loseHype(amount = 1) {
    this.game.hype = Math.max(0, this.game.hype - amount);
  }
}
