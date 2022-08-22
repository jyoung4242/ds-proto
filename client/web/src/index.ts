import { UI, UIView } from "peasy-ui";
import { State } from "./state/state";
import { GameContainer } from "./components/index";
import "./styles/index";
import { utils } from "./utils";

const myApp = document.getElementById("App");
let state = new State();
console.log("state: ", state);
if (localStorage.getItem("DSsettings")) {
  let settings = JSON.parse(localStorage.getItem("DSsettings"));
  console.log(settings);
  state.state.mySettings.chatOM = settings.chatOM;
  state.state.mySettings.chatOP = settings.chatOP;
  state.state.mySettings.chatBG = settings.chatBG;
  state.state.mySettings.chatSM = settings.chatSM;
  state.state.mySettings.chatUM = settings.chatUM;
  state.state.mySettings.beginningColor = settings.bColor;
  state.state.mySettings.endingColor = settings.eColor;
  state.state.mySettings.gameSpeed = settings.GS;
  state.state.mySettings.sfxGain = settings.sfx;
  state.state.mySettings.bgmGain = settings.bgm;
  state.state.mySettings.updateChat(null, state.state);
  state.state.mySettings.updateColor(null, state.state);
}
console.log("state: ", state);
utils.init(state);
const GameComponent = new GameContainer(state);

const uiStringTemplate = `
  <div>
    ${GameComponent.template}
  </div>
`;

let myUI: UIView;
myUI = UI.create(myApp, uiStringTemplate, state.state);

setInterval(() => UI.update(), 1000 / 60);
