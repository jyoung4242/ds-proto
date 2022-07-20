import { UI, UIView } from "peasy-ui";
import { State } from "./state/state";
import { GameComponent } from "./components/index";
import "./styles/index";
import { utils } from "./utils";

const myApp = document.getElementById("App");
const uiStringTemplate = `
    ${GameComponent.template}
`;
const state = new State();
utils.init(state.state);

let myUI: UIView;
myUI = UI.create(myApp, uiStringTemplate, state.state);

//for event monitoring
setInterval(() => UI.update(), 100);
