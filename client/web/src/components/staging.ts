import { settings } from "../assets/assetPool";
import { Settings } from "./settings";

export class StagingComponent {
  componentName: string = "myStaging";
  template: string;
  settings: any;

  localState: any;
  constructor(state) {
    this.localState = state;
    this.settings = new Settings(state);
    this.template = `
  <div class="stg_Screentitle">Game Staging Selection</div>
    <div class="stg_Container" \${===myStaging.isVisible}>
      ${this.settings.template}
      <img class="game_menu_icon" src="${settings}" alt="" \${click@=>mypUI.showOptions}>
      <div class="stg_PlayerEntry" \${players <=* myStaging.group} >
        <span class="stg_textSpan">Player \${players.index} : </span>
        <span class="stg_textSpan">\${players.name}</span>
        <img src="\${|players.img}" alt=""/>
      </div>                 
    </div>
          
    <div class="stg_buttonflex">
        <button class="lobbyButton" \${===myStaging.isVisible} \${click@=>myStaging.back}>Back</button>
        <button class="lobbyButton" \${===myStaging.isVisible} \${click@=>myStaging.logout}>Logout</button>
        <button class="lobbyButton" \${===myStaging.isVisible} \${click@=>myStaging.start} \${disabled<==myStaging.isDisabled}>Start Game</button>
    </div>
    
    <div class="loginText">
    <p>Logged in as: \${playerData.username}</p>
    <p>Game ID is \${gameData.gameID}</p>
    <p>Number Players Connected: \${myStaging.numConnectedPlayers}</p>
    <p>Number Players Setup: \${myStaging.numSetupPlayer}</p>
  </div>`;
  }
}
