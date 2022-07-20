import { UI, UIView } from "peasy-ui";
import { State } from "./state/state";
import { GameContainer } from "./components/index";
import "./styles/index";
import { utils } from "./utils";

const myApp = document.getElementById("App");
const state = new State();
utils.init(state.state);
const GameComponent = new GameContainer(state.state);

const uiStringTemplate = `
    ${GameComponent.template}
`;

let myUI: UIView;
myUI = UI.create(myApp, uiStringTemplate, state.state);

//for event monitoring
setInterval(() => UI.update(), 100);
