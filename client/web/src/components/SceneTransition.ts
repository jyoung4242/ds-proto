import { utils } from "../utils";

class SceneTransition {
  componentName: string = "mySceneTransition";
  template: string = `
    <div class="\${mySceneTransition.classString}" >
        <div></div>
    </div>
    `;
}
export const SceneTransitionComponent = new SceneTransition();
