export class LobbyComponent {
  componentName: string = "myLobby";
  template: string = `
    <div class="mainTitle"><span>\${myLobby.title}</span></div>
    <div class="subTitle"><span>\${myLobby.subtitle}</span></div>
    <div>
      <button class="" \${click@=>myLobby.createGame}>Create New Game</button
      <button class="" \${click@=>myLobby.joinGame}>Join Existing Game</button
      <button class="" \${click@=>myLobby.logout}>Logout</button
    </div>
    <div>
        <span>Logged in as: \${playerData.username}</span>
    </div
      `;
  localState: any;
  constructor(state) {
    this.localState = state;
  }
}
