export class StagingComponent {
  componentName: string = "myStaging";
  template: string = `
  <div class="stg_Screentitle">Game Staging Selection</div>
  <div class="stg_Container">
    <div class="stg_PlayerEntry" \${players <=* myStaging.group}>
      <span class="stg_textSpan">Player \${players.index} : </span>
      <span class="stg_textSpan">\${players.name}</span>
      <img src="\${players.img}" alt=""/>
    </div>                 
  </div>
        
  <div class="stg_buttonflex">
      <button class="lobbyButton" \${click@=>myStaging.back}>Back</button>
      <button class="lobbyButton" \${click@=>myStaging.logout}>Logout</button>
      <button class="lobbyButton" \${click@=>myStaging.start}>Start Game</button>
  </div>
  
  <div class="loginText">
        <span>Logged in as: \${playerData.username}</span>
  </div>
  `;

  localState: any;
  constructor(state) {
    this.localState = state;
  }
}
