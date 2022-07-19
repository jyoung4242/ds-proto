import { utils } from "../utils";

export type iSceneTransitionModel = {
  classString: string;
  fadeIn: Function;
  fadeOut: Function;
  reset: Function;
};

class SceneTransition {
  componentName: string = "mySceneTransition";
  template: string = `
    <div class="\${mySceneTransition.classString}" >
        <div></div>
    </div>
    `;
  model: iSceneTransitionModel = {
    classString: "normal",
    fadeIn: model => {
      model.classString = "normal sceneTransition";
    },
    fadeOut: model => {
      model.classString = "normal sceneTransition fade-out";
    },
    reset: model => {
      model.classString = "normal";
    },
  };
}
export const SceneTransitionComponent = new SceneTransition();
