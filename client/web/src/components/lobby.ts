import { settings } from "../assets/assetPool";
import { Settings } from "./settings";

export class LobbyComponent {
  settings: any;
  componentName: string = "myLobby";
  template: string;
  localState: any;
  constructor(state) {
    this.localState = state;
    this.settings = new Settings(state);
    this.template = `
    <div class="mainLobby"><span>\${myLobby.title}</span></div>
    <div class="sLobby"><span>\${myLobby.subtitle}</span></div>
    <img class="game_menu_icon" src="${settings}" alt="" \${click@=>mypUI.showOptions}>
    ${this.settings.template}
    <div class="buttonflex">
      <button class="lobbyButton b1" \${click@=>myLobby.createGame}>Create New Game</button>
      <button class="lobbyButton b2" \${click@=>myLobby.joinGame}>Join Existing Game</button>
      
      <button class="lobbyButton b3" \${click@=>myLobby.logout}>Logout</button>
    </div>
    <div class="joinflex" \${===myLobby.isJoining}>
        <label for="joinGameInput">Enter Game ID</label>
        <input id="joinGameInput" \${input@=>myLobby.validate} class=\${myLobby.validationCSSstring} \${value==>gameData.gameID}/>
        <button class="lobbyButton b4" \${click@=>myLobby.connect} \${disabled<==myLobby.buttonEnable}>Join</button>
    </div>
    <div class="loginText">
        <span>Logged in as: \${playerData.username}</span>
    </div>`;
  }
}

//<button class="lobbyButton b2" \${click@=>myLobby.findGame}>Find Existing Game</button>
