export class EventController {
  constructor(game, ui) {
    this.game = game;
    this.ui = ui;
    this.events = [
      {
        chance: 0.1,
        execute: () => {
          this.game.money -= 1000;
          this.ui.log('A bug cost you $1000 to fix!');
        }
      },
      {
        chance: 0.15,
        execute: () => {
          this.game.hype += 5;
          this.ui.log('A streamer played your game! Hype increased.');
        }
      },
      {
        chance: 0.1,
        execute: () => {
          if (this.game.staff > 1) {
            this.game.staff--;
            this.ui.log('A staff member quit!');
          }
        }
      },
      {
        chance: 0.1,
        execute: () => {
          this.game.money += 2000;
          this.ui.log('Publisher gave you a bonus!');
        }
      },
      {
        chance: 0.15,
        execute: () => {
          this.game.hype = Math.max(0, this.game.hype - 3);
          this.ui.log('Negative review! Hype decreased.');
        }
      }
    ];
  }

  update() {
    if (!this.game.isRunning) return;
    
    for (const event of this.events) {
      if (Math.random() < event.chance) {
        event.execute();
        this.ui.update();
        break; // Only one event per update
      }
    }
  }
}
