import { utils } from "../utils";

export class SceneTransition {
  componentName: string = "mySceneTransition";
  template: string = `
    <div class="\${mySceneTransition.classString}" >
        <div></div>
    </div>
    `;
  localState: any;
  constructor(state) {
    this.localState = state;
  }
}
