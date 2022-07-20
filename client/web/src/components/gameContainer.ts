import { utils } from "../utils";
import { SceneTransition } from "./SceneTransition";
import { TitleComponent } from "./title";
import { LobbyComponent } from "./lobby";

export enum Router {
  Title,
  Lobby,
  Character,
  Game,
}

export class GameContainer {
  componentName: string = "myContainer";
  template: string;
  Title: any;
  Lobby: any;
  localState: any;
  SceneTransitionComponent: any;
  constructor(state) {
    this.localState = state;
    this.Title = new TitleComponent(state);
    this.Lobby = new LobbyComponent(state);
    this.SceneTransitionComponent = new SceneTransition(state);
    this.template = `
    <div class="container" >
        ${this.SceneTransitionComponent.template}
        
        <div class="titlescreen" \${ === myContainer.isTitle}>
          ${this.Title.template}
        </div>
        
        <div class="lobbyscreen" \${ === myContainer.isLobby}>
          ${this.Lobby.template}
        </div>
        
        <div class="charscreen" \${ === myContainer.isCharacter}>
          <div></div>
        </div>
        
        <div class="gamescreen" \${ === myContainer.isGame}>
          <div></div>
        </div>
    </div>
    `;
  }
}
