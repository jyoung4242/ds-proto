import { UI, UIView } from "peasy-ui";
import { State } from "./state/state";
import { GameContainer, Router } from "./components/index";
import "./styles/index";
import { utils } from "./utils";

const myApp = document.getElementById("App");
//const state = new State();

let state = {
  playerData: {
    username: "",
  },
  myContainer: {
    myRoute: Router.Title,
    get isTitle() {
      return this.myRoute === Router.Title;
    },
    get isLobby() {
      return this.myRoute === Router.Lobby;
    },
    get isCharacter() {
      return this.myRoute === Router.Character;
    },
    get isGame() {
      return this.myRoute === Router.Game;
    },

    screenSwitch: async (newScreen: Router) => {
      //this.state.mySceneTransition.fadeIn();
      //await utils.wait(900);
      state.myContainer.myRoute = newScreen;
      //this.state.mySceneTransition.fadeOut();
      //await utils.wait(900);
      //this.state.mySceneTransition.reset();
      console.log(state.myContainer.myRoute);
    },
  },

  myTitle: {
    title: "DEMON SIEGE",
    subtitle: "PRESS LOGIN TO BEGIN",
    login: () => utils.login(),
  },
  mySceneTransition: {
    classString: "normal",
    fadeIn: () => (state.mySceneTransition.classString = "normal sceneTransition"),
    fadeOut: () => (state.mySceneTransition.classString = "normal sceneTransition fade-out"),
    reset: () => (state.mySceneTransition.classString = "normal"),
  },
  myLobby: {
    title: "Lobby",
    subtitle: "Choose to create game or join",
    isJoining: false,
    gameID: "",
    createGame: () => {
      console.log("Creating Game");
    },
    joinGame: () => {
      state.myLobby.isJoining = true;
    },
    logout: () => {
      state.playerData.username = "";
      state.myContainer.screenSwitch(Router.Title);
    },
    connect: () => {},
  },
};

utils.init(state);
//const GameComponent = new GameContainer(state);

const uiStringTemplate = `
    <div class="container">
        <div \${===myContainer.isTitle} class="titlescreen">
            <div class="mainTitle"> <span> \${myTitle.title}</span> </div>
            <div class="subTitle"> <span> \${myTitle.subtitle} </span></div>
            <div>
                <button \${click@=>myTitle.login} class="titleButton" >LOGIN</button>
            </div>
        </div>
        
        <div \${===myContainer.isLobby} class="lobbyscreen">
            <div class="mainLobby"> <span> \${myLobby.title} </span> </div>
            <div class="subLobby"><span>\${myLobby.subtitle}</span> </div>
            
            <div class="buttonflex">
                <button class="lobbyButton b1" \${click@=>myLobby.createGame}>Create New Game</button>
                <button class="lobbyButton b2" \${click@=>myLobby.joinGame}>Join Existing Game</button>
                <button \${click@=>myLobby.logout} class="lobbyButton b3" >Logout</button>
            </div>
            <div class="joinflex" \${===myLobby.isJoining}>
                <label for="joinGameInput">Enter Game ID</label>
                <input id="joinGameInput" class="joinGameText" \${value==>myLobby.gameID}/>
                <button class="lobbyButton b4" \${click@=>myLobby.connect}>Join</button>
            </div>
            <div class="loginText">
                <span>Logged in as: \${playerData.username}</span>
            </div>
        </div>
    </div>
`;

let myUI: UIView;
myUI = UI.create(myApp, uiStringTemplate, state);

setInterval(() => UI.update(), 100);

/**
 * 
        <div \${===myContainer.isCharacter} class="charscreen" >
            <div></div>
        </div>
        
        <div \${=== myContainer.isGame} class="gamescreen" >
            <div></div>
        </div>
 */
