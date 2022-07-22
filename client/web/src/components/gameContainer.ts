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
    //${this.SceneTransitionComponent.template}
    this.template = `
    <div class="container">
               
        <div class="titlescreen" \${===myContainer.isTitle}>
          <div class="mainTitle" >
            <span>\${myTitle.title}</span>
          </div>
          <div class="subTitle">
            <span>\${myTitle.subtitle}</span>
          </div>
          <div>
            <button class="titleButton" \${click@=>myTitle.login}>LOGIN</button>
          </div>
        </div>
        
        <div class="lobbyscreen" \${===myContainer.isLobby}>
          <div class="mainLobby"><span>\${myLobby.title}</span></div>
          <div class="subLobby"><span>\${myLobby.subtitle}</span></div>
          
          <div class="buttonflex">
            <button class="lobbyButton b1" \${click@=>myLobby.createGame}>Create New Game</button>
            <button class="lobbyButton b2" \${click@=>myLobby.joinGame}>Join Existing Game</button>
            <button class="lobbyButton b3" \${click@=>myLobby.logout}>Logout</button>
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
        
        <div class="charscreen" \${===myContainer.isCharacter}>
          <div></div>
        </div>
        
        <div class="gamescreen" \${=== myContainer.isGame}>
          <div></div>
        </div>
    </div>
    `;
  }
}
//${this.Title.template}${this.Lobby.template}
