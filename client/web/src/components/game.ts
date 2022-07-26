import bmale from "../assets/people/ff_barbarian.png";
import bfemale from "../assets/people/ff_barbarian_w.png";
import wmale from "../assets/people/ff_wizard.png";
import wfemale from "../assets/people/ff_wizard_w.png";
import rmale from "../assets/people/ff_rogue.png";
import rfemale from "../assets/people/ff_rogue_w.png";
import pmale from "../assets/people/ff_paladin.png";
import pfemale from "../assets/people/ff_paladin_w.png";

import { CardPool } from "./cardPool";
import { Toast } from "./toast";

export class Game {
  componentName: string = "myGameScreen";
  cardPool: any;
  toast: any;
  template: string;
  localState: any;

  constructor(state) {
    this.localState = state;
    this.cardPool = new CardPool(state);
    this.toast = new Toast(state);
    this.toast.init();
    this.template = `
      <button class="lobbyButton" \${click@=>myToast.test}>Click me</button>

    ${this.cardPool.template}
    ${this.toast.template}
    `;
  }
}
