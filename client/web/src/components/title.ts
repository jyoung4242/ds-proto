import { help, settings } from "../assets/assetPool";
import { Settings } from "./settings";
import { Help } from "./help";

import {
  bmale,
  bfemale,
  wmale,
  wfemale,
  rmale,
  rfemale,
  pmale,
  pfemale,
  userIcon,
  locationIcon,
  monsterIcon,
  cardIcon,
  effectIcon,
  mute,
  unmute,
  cursor,
} from "../assets/assetPool";

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
      <button class="titleButton" \${click@=>myTitle.login} \${disabled <== myTitle.isDisabled}>LOGIN</button>
      <img class="titleHelp" src="${help}" alt="" \${click@=>myHelp.showModal}/>
      <img class="game_menu_icon" src="${settings}" alt="" \${click@=>mypUI.showOptions}/>
      <img id="preload" style="visibility: hidden; position: fixed; top: 0; left: 0;" src="\${myTitle.preload}" alt=""  \${load@=>myTitle.load_next}/>
      ${this.help.template}
      ${this.settings.template}
    </div>`;
    setTimeout(() => {
      this.localState.state.myTitle.load_next();
    }, 200);
  }
}
