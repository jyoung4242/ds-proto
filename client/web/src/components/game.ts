import bmale from "../assets/people/ff_barbarian.png";
import bfemale from "../assets/people/ff_barbarian_w.png";
import wmale from "../assets/people/ff_wizard.png";
import wfemale from "../assets/people/ff_wizard_w.png";
import rmale from "../assets/people/ff_rogue.png";
import rfemale from "../assets/people/ff_rogue_w.png";
import pmale from "../assets/people/ff_paladin.png";
import pfemale from "../assets/people/ff_paladin_w.png";
import settings from "../assets/options/whitemenu.png";

import { CardPool, Toast, Chat, pUI, Hand, Location, Tower, Settings, Monster } from "../components/index";

export class Game {
  componentName: string = "myGameScreen";
  cardPool: any;
  toast: any;
  template: string;
  localState: any;
  chat: any;
  pui: any;
  hand: any;
  location: any;
  towerD: any;
  settings: any;
  monster: any;

  constructor(state) {
    this.localState = state;
    this.cardPool = new CardPool(state);
    this.toast = new Toast(state);
    this.chat = new Chat(state);
    this.toast.init();
    this.pui = new pUI(state);
    this.hand = new Hand(state);
    this.location = new Location(state);
    this.towerD = new Tower(state);
    this.settings = new Settings(state);
    this.monster = new Monster(state);

    this.template = `
    
    <img class="game_menu_icon" src="${settings}" alt="" \${click@=>mypUI.showOptions}>
    <button \${click@=>mypUI.addSE} > add StatusEffect</button>
    ${this.cardPool.template}
    ${this.toast.template}
    ${this.chat.template}
    ${this.pui.template}
    ${this.hand.template}
    ${this.location.template}
    ${this.towerD.template}
    ${this.settings.template}
    ${this.monster.template}
    `;
  }
}
