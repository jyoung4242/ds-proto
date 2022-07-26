import { utils } from "../utils";
//import { SceneTransition } from "./SceneTransition";
//import { TitleComponent } from "./title";
//import { LobbyComponent } from "./lobby";
//import { CharScreen } from "./charScreen";
import { SceneTransition, TitleComponent, LobbyComponent, CharScreen, StagingComponent, Game } from "./index";

export enum Router {
  Title,
  Lobby,
  Character,
  Staging,
  Game,
}

export class GameContainer {
  componentName: string = "myContainer";
  template: string;
  Title: any;
  Lobby: any;
  localState: any;
  charScreen: any;
  myStaging: any;
  game: any;

  SceneTransitionComponent: any;
  constructor(state) {
    this.localState = state;
    this.Title = new TitleComponent(state);
    this.Lobby = new LobbyComponent(state);
    this.SceneTransitionComponent = new SceneTransition(state);
    this.charScreen = new CharScreen(state);
    this.myStaging = new StagingComponent(state);
    this.game = new Game(state);

    this.template = `
    <div class="container">
        ${this.SceneTransitionComponent.template}           
        <div class="titlescreen" \${===myContainer.isTitle}>
          ${this.Title.template}
        </div>
        
        <div class="lobbyscreen" \${===myContainer.isLobby}>
          ${this.Lobby.template}
        </div>
        
        <div class="charscreen" \${===myContainer.isCharacter}>
          ${this.charScreen.template}
        </div>

        <div class="stagingScreen" \${===myContainer.isStaging}>
          ${this.myStaging.template}
        </div>
        
        <div class="gamescreen" \${=== myContainer.isGame}>
          ${this.game.template}
        </div>
    </div>
    `;
  }
}
