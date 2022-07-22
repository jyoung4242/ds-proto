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
    <div>
        ${GameComponent.template}
    </div>
`;

let myUI: UIView;
myUI = UI.create(myApp, uiStringTemplate, state.state);

setInterval(() => UI.update(), 100);
