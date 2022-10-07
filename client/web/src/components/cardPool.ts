export class CardPool {
  componentName: string = "myGameScreen";

  template: string = `
    <div class="CP_container" \${===myGame.showModal}>

        <div class="CP_modal_ack">
            <div class="CP_backgroundtint"></div>
            <div class="CP_Modal_Inner">
                <span class="CP_Modaltitle">Confirm card selection?</span>
                <div class="CP_cardspot"></div>
                <div class="CP_buttonflex">
                    <button class="lobbyButton">Cancel</button>
                    <button class="lobbyButton">OK</button>
                </div>
            </div>
        </div>
        <div class="CP_CardModal">
            <div class="CP_cardspot CPspot1">
              <div class="card_title smallCard">\${gameData.cardPool[0].title}</div>
              <div class="card_level smallCard">Level \${gameData.cardPool[0]..level}</div>
              <div class="card_desc smallCard">\${gameData.cardPool[0].effectString}</div>
            </div>
            <div class="CP_cardspot CPspot2">
              <div class="card_title smallCard">\${gameData.cardPool[1].title}</div>
              <div class="card_level smallCard">Level \${gameData.cardPool[1]..level}</div>
              <div class="card_desc smallCard">\${gameData.cardPool[1].effectString}</div>
            </div>
            <div class="CP_cardspot CPspot3">
              <div class="card_title smallCard">\${gameData.cardPool[2].title}</div>
              <div class="card_level smallCard">Level \${gameData.cardPool[2]..level}</div>
              <div class="card_desc smallCard">\${gameData.cardPool[2].effectString}</div>
            </div>
            <div class="CP_cardspot CPspot4">
              <div class="card_title smallCard">\${gameData.cardPool[3].title}</div>
              <div class="card_level smallCard">Level \${gameData.cardPool[3]..level}</div>
              <div class="card_desc smallCard">\${gameData.cardPool[3].effectString}</div>
            </div>
            <div class="CP_cardspot CPspot5">
              <div class="card_title smallCard">\${gameData.cardPool[4].title}</div>
              <div class="card_level smallCard">Level \${gameData.cardPool[4]..level}</div>
              <div class="card_desc smallCard">\${gameData.cardPool[4].effectString}</div>
            </div>
            <div class="CP_cardspot CPspot6">
              <div class="card_title smallCard">\${gameData.cardPool[5].title}</div>
              <div class="card_level smallCard">Level \${gameData.cardPool[5]..level}</div>
              <div class="card_desc smallCard">\${gameData.cardPool[5].effectString}</div>
            </div>
        </div>
        
    </div>
      `;

  localState: any;
  constructor(state) {
    this.localState = state;
  }
}
