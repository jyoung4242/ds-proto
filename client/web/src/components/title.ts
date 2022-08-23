import help from "../assets/help/whitequestion-mark.png";

import { Help } from "./help";

export class TitleComponent {
  componentName: string = "myTitle";
  template: string;
  localState: any;
  help: any;

  constructor(state) {
    this.localState = state;
    this.help = new Help(state);
    this.template = `
    <div class="mainTitle" >
      <span>\${myTitle.title}</span>
    </div>
    <div class="STitle" >
      <span>\${myTitle.subtitle}</span>
    </div>
    <div>
      <button class="titleButton" \${click@=>myTitle.login}>LOGIN</button>
      <img class="titleHelp" src="${help}" alt="" \${click@=>myHelp.showModal}/>
      ${this.help.template}
    </div>`;
  }
}
