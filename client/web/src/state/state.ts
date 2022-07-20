import { utils } from "../utils";
import { Router, SceneTransitionComponent } from "../components";

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
          this.state.myTitle.title = "He's funny";
          this.state.mySceneTransition.fadeIn();
          await utils.wait(800);
          console.log(this.state);
          this.state.myContainer.myRoute = newScreen;
          this.state.mySceneTransition.fadeOut();
          await utils.wait(800);
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
    };
  }

  emit() {
    const event = new CustomEvent("STATECHANGE");
    document.dispatchEvent(event);
  }

  call(key: string, cb: string) {
    this.state[key][cb];
  }

  mutateState(key: string, value: any): string {
    if (this.state[key] === undefined) return "state not defined";
    if (this.state[key] === value) return "state did not change";
    this.state[key] = value;
    this.emit();
    return "state updated";
  }
}
