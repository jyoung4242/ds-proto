import bmale from "../assets/people/ff_barbarian.png";
import bfemale from "../assets/people/ff_barbarian_w.png";
import wmale from "../assets/people/ff_wizard.png";
import wfemale from "../assets/people/ff_wizard_w.png";
import rmale from "../assets/people/ff_rogue.png";
import rfemale from "../assets/people/ff_rogue_w.png";
import pmale from "../assets/people/ff_paladin.png";
import pfemale from "../assets/people/ff_paladin_w.png";

import { CardPool, Toast, Chat, pUI } from "../components/index";

export class Game {
  componentName: string = "myGameScreen";
  cardPool: any;
  toast: any;
  template: string;
  localState: any;
  chat: any;
  pui: any;

  constructor(state) {
    this.localState = state;
    this.cardPool = new CardPool(state);
    this.toast = new Toast(state);
    this.chat = new Chat(state);
    this.toast.init();
    this.pui = new pUI(state);

    this.template = `
    <button class="lobbyButton" \${click@=>mypUI.test}>Click me</button>
    <button class="lobbyButton" \${click@=>mypUI.test1}>Click me</button>
    <button class="lobbyButton" \${click@=>mypUI.test2}>Click me</button>
    ${this.cardPool.template}
    ${this.toast.template}
    ${this.chat.template}
    ${this.pui.template}
    `;
  }
}

//  <button class="lobbyButton" \${click@=>myToast.test}>Click me</button>
