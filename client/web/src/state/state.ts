import { utils } from "../utils";
import { Router } from "../components";

export class State {
  state: any;

  constructor() {
    this.state = {
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
          this.state.mySceneTransition.fadeIn();
          await utils.wait(900);
          this.state.myContainer.myRoute = newScreen;
          this.state.mySceneTransition.fadeOut();
          await utils.wait(900);
          this.state.mySceneTransition.reset();
        },
      },

      myTitle: {
        title: "DEMON SIEGE",
        subtitle: "PRESS LOGIN TO BEGIN",
        login: () => {
          utils.login();
        },
      },
      mySceneTransition: {
        classString: "normal",
        fadeIn: () => {
          this.state.mySceneTransition.classString = "normal sceneTransition";
        },
        fadeOut: () => {
          this.state.mySceneTransition.classString = "normal sceneTransition fade-out";
        },
        reset: () => {
          this.state.mySceneTransition.classString = "normal";
        },
      },
      myLobby: {
        title: "Lobby",
        subtitle: "Select next option",
        createGame: () => {
          console.log("Creating Game");
        },
        joinGame: () => {
          console.log("Joining Game");
        },
        logout: () => {
          console.log("Logging Out");
        },
      },
    };
  }
}
