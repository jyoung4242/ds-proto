import { utils } from "../utils";
import { SceneTransitionComponent, iSceneTransitionModel } from "./SceneTransition";

export enum Router {
  Title,
  Lobby,
  Character,
  Game,
}

export type iComponentModel = {
  myRoute: Router;
  isTitle: boolean;
  isLobby: boolean;
  isCharacter: boolean;
  isGame: boolean;
  screenSwitch: Function;
};

class GameContainer {
  componentName: string = "myContainer";
  template: string = `
    <div class="container" >
        ${SceneTransitionComponent.template}
        
        <div class="titlescreen" \${ === myContainer.isTitle}>
          <div></div>
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

  model: iComponentModel = {
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

    screenSwitch: async (model: iComponentModel, newScreen: Router) => {
      SceneTransitionComponent.model.fadeIn(SceneTransitionComponent.model);
      await utils.wait(2000);
      SceneTransitionComponent.model.fadeOut(SceneTransitionComponent.model);
      model.myRoute = newScreen;
      await utils.wait(2000);
      SceneTransitionComponent.model.reset(SceneTransitionComponent.model);
    },
  };
}
export const GameComponent = new GameContainer();
