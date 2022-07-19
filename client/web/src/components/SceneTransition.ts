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
    <div class="\${classString}" >
        <div></div>
    </div>
    `;
  model: iSceneTransitionModel = {
    classString: "",
    fadeIn: model => {
      model.classString = "sceneTransition";
    },
    fadeOut: model => {
      model.classString = "sceneTransition fade-out";
    },
    reset: model => {
      model.classString = "";
    },
  };
}
export const SceneTransitionComponent = new SceneTransition();
