import { help, settings } from "../assets/assetPool";
import { Settings } from "./settings";
import { Help } from "./help";

export class TitleComponent {
  componentName: string = "myTitle";
  template: string;
  localState: any;
  help: any;
  settings: any;

  constructor(state) {
    this.settings = new Settings(state);
    this.localState = state;
    this.help = new Help(state);
    this.template = `
    <span class="version">\${myTitle.version}</span>
    <div class="mainTitle" >
      <span>\${myTitle.title}</span>
    </div>
    <div class="STitle" >
      <span>\${myTitle.subtitle}</span>
    </div>
    <div>
      <button class="titleButton" \${click@=>myTitle.login}>LOGIN</button>
      <img class="titleHelp" src="${help}" alt="" \${click@=>myHelp.showModal}/>
      <img class="game_menu_icon" src="${settings}" alt="" \${click@=>mypUI.showOptions}>
      ${this.help.template}
      ${this.settings.template}
    </div>`;
  }
}
