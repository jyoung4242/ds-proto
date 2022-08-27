export class LobbyComponent {
  componentName: string = "myLobby";
  template: string = `
    <div class="mainLobby"><span>\${myLobby.title}</span></div>
    <div class="sLobby"><span>\${myLobby.subtitle}</span></div>
    
    <div class="buttonflex">
      <button class="lobbyButton b1" \${click@=>myLobby.createGame}>Create New Game</button>
      <button class="lobbyButton b2" \${click@=>myLobby.joinGame}>Join Existing Game</button>
      
      <button class="lobbyButton b3" \${click@=>myLobby.logout}>Logout</button>
    </div>
    <div class="joinflex" \${===myLobby.isJoining}>
        <label for="joinGameInput">Enter Game ID</label>
        <input id="joinGameInput" \${input@=>myLobby.validate} class=\${myLobby.validationCSSstring} \${value==>myLobby.gameID}/>
        <button class="lobbyButton b4" \${click@=>myLobby.connect} \${disabled<==myLobby.buttonEnable}>Join</button>
    </div>
    <div class="loginText">
        <span>Logged in as: \${playerData.username}</span>
    </div>`;
  localState: any;
  constructor(state) {
    this.localState = state;
  }
}

//<button class="lobbyButton b2" \${click@=>myLobby.findGame}>Find Existing Game</button>
