import { settings } from "../assets/assetPool";
import { CardPool, Toast, Chat, pUI, Hand, Location, Tower, Settings, Monster, NavBar, NavInput } from "../components/index";

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
  navBar: any;
  navInput: any;

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
    this.navBar = new NavBar(state);
    this.navInput = new NavInput(state);
    this.template = `
    
    <img class="game_menu_icon" src="${settings}" alt="" \${click@=>mypUI.showOptions}>
    
    ${this.cardPool.template}
    ${this.toast.template}
    ${this.chat.template}
    ${this.pui.template}
    ${this.hand.template}
    ${this.location.template}
    ${this.towerD.template}
    ${this.settings.template}
    ${this.monster.template}
    ${this.navBar.template}
    ${this.navInput.template}
    `;
  }
}
