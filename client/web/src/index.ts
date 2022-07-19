import { UI, UIView } from "peasy-ui";
import { GameComponent, Router, SceneTransitionComponent, iComponentModel, iSceneTransitionModel } from "./components/index";
import "./styles/index";

const myApp = document.getElementById("App");

const uiStringTemplate = `
    ${GameComponent.template}
`;
const model = {
  [GameComponent.componentName]: GameComponent.model,
  [SceneTransitionComponent.componentName]: SceneTransitionComponent.model,
};
console.log(model);
let myUI: UIView;
myUI = UI.create(myApp, uiStringTemplate, model);

let intervalID = setInterval(() => {
  UI.update();
}, 1000 / 60);

setTimeout(() => model.myContainer.screenSwitch(model.myContainer, Router.Lobby), 4000);
setTimeout(() => model.myContainer.screenSwitch(model.myContainer, Router.Character), 6000);
setTimeout(() => model.myContainer.screenSwitch(model.myContainer, Router.Game), 8000);
