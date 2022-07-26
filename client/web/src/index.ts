import { UI, UIView } from "peasy-ui";
import { State } from "./state/state";
import { GameContainer } from "./components/index";
import "./styles/index";
import { utils } from "./utils";

const myApp = document.getElementById("App");
const state = new State();

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

state.state.playerData.username = "test username";
