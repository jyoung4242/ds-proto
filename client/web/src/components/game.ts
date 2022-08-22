import bmale from "../assets/people/ff_barbarian.png";
import bfemale from "../assets/people/ff_barbarian_w.png";
import wmale from "../assets/people/ff_wizard.png";
import wfemale from "../assets/people/ff_wizard_w.png";
import rmale from "../assets/people/ff_rogue.png";
import rfemale from "../assets/people/ff_rogue_w.png";
import pmale from "../assets/people/ff_paladin.png";
import pfemale from "../assets/people/ff_paladin_w.png";
import settings from "../assets/options/whitemenu.png";

import { CardPool, Toast, Chat, pUI, Hand, Location, Tower, Settings } from "../components/index";

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

    this.template = `
    <button class="lobbyButton" \${click@=>mypUI.test}> coin</button>
    <button class="lobbyButton" \${click@=>mypUI.test1}> Attk</button>
    <button class="lobbyButton" \${click@=>mypUI.test2}>Reset</button>
    <button class="lobbyButton" \${click@=>mypUI.test3}>Toast!</button>
    <button class="lobbyButton" \${click@=>mypUI.test5}>Location</button>
    <img class="game_menu_icon" src="${settings}" alt="" \${click@=>mypUI.showOptions}>
    <label for="turn" id="lblturn">Player turn</label>
    <select \${change@=>mypUI.test4} name="playerturn" id="turn">
        <option value="0">Player 1</option>
        <option value="1">Player 2</option>
        <option value="2">Player 3</option>
        <option value="3">Player 4</option>
    </select>
    ${this.cardPool.template}
    ${this.toast.template}
    ${this.chat.template}
    ${this.pui.template}
    ${this.hand.template}
    ${this.location.template}
    ${this.towerD.template}
    ${this.settings.template}
    `;
  }
}
