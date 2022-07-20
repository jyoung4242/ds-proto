import { utils } from "../utils";
import { SceneTransitionComponent } from "./SceneTransition";
import { Title } from "./title";

export enum Router {
  Title,
  Lobby,
  Character,
  Game,
}

class GameContainer {
  componentName: string = "myContainer";
  template: string = `
    <div class="container" >
        ${SceneTransitionComponent.template}
        
        <div class="titlescreen" \${ === myContainer.isTitle}>
          ${Title.template}
        </div>
        
        <div class="lobbyscreen" \${ === myContainer.isLobby}>
          <div></div>
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
export const GameComponent = new GameContainer();
