import { UI, UIView } from "peasy-ui";
import { State } from "./state/state";
import { GameContainer } from "./components/index";
import "./styles/index";
import { utils } from "./utils";

const myApp = document.getElementById("App");
let state = new State();

utils.init(state);

if (localStorage.getItem("DSsettings")) {
  utils.loadSettings();
}

const GameComponent = new GameContainer(state);

const globalCSSvars = `--background-start: \${mySettings.beginningColor}; --background-end: \${mySettings.endingColor}; --chatUM: \${mySettings.chatUM};--chatOM: \${mySettings.chatOM};--chatSM: \${mySettings.chatSM};--chatOP: \${mySettings.chatOP};--chatBG: \${mySettings.chatBG}`;

const uiStringTemplate = `
  <div class="app" style="${globalCSSvars}">
    ${GameComponent.template}
  </div>
`;

let myUI: UIView;
myUI = UI.create(myApp, uiStringTemplate, state.state);

setInterval(() => UI.update(), 1000 / 60);
