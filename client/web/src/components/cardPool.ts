export class CardPool {
  componentName: string = "myGameScreen";

  template: string = `
    <div class="CP_container" \${===myGame.showModal}>

        <div class="CP_modal_ack" \${===myCardPool.showConfirmation}>
            <div class="CP_backgroundtint"></div>
            <div class="CP_Modal_Inner">
                <span class="CP_Modaltitle">Confirm card selection?</span>
                <div class="CP_cardspot">
                  <div class="card_title smallCard">\${myCardPool.selectedCard.title}</div>
                  <div class="card_level smallCard">Level \${myCardPool.selectedCard.level}</div>
                  <div class="card_desc smallCard">\${myCardPool.selectedCard.desc}</div>
                  <div class="card_cost smallCard">Cost \${myCardPool.selectedCard.cost}</div>
                </div>
                <div class="CP_buttonflex">
                    <button class="lobbyButton" \${click@=>myCardPool.confCancel}>Cancel</button>
                    <button class="lobbyButton" \${click@=>myCardPool.confAccept}>OK</button>
                </div>
            </div>
        </div>
        <div class="CP_CardModal">
            <div id="CP0" class="CP_cardspot CPspot1" \${click@=>myCardPool.clickHandler}>
              <div class="card_title smallCard">\${gameData.cardPool[0].title}</div>
              <div class="card_level smallCard">Level \${gameData.cardPool[0]..level}</div>
              <div class="card_desc smallCard">\${gameData.cardPool[0].effectString}</div>
              <div class="card_cost smallCard">Cost \${gameData.cardPool[0].cost}</div>
            </div>
            <div id="CP1" class="CP_cardspot CPspot2" \${click@=>myCardPool.clickHandler}>
              <div class="card_title smallCard">\${gameData.cardPool[1].title}</div>
              <div class="card_level smallCard">Level \${gameData.cardPool[1]..level}</div>
              <div class="card_desc smallCard">\${gameData.cardPool[1].effectString}</div>
              <div class="card_cost smallCard">Cost \${gameData.cardPool[1].cost}</div>
            </div>
            <div  id="CP2" class="CP_cardspot CPspot3" \${click@=>myCardPool.clickHandler}>
              <div class="card_title smallCard">\${gameData.cardPool[2].title}</div>
              <div class="card_level smallCard">Level \${gameData.cardPool[2]..level}</div>
              <div class="card_desc smallCard">\${gameData.cardPool[2].effectString}</div>
              <div class="card_cost smallCard">Cost \${gameData.cardPool[2].cost}</div>
            </div>
            <div id="CP3" class="CP_cardspot CPspot4" \${click@=>myCardPool.clickHandler}>
              <div class="card_title smallCard">\${gameData.cardPool[3].title}</div>
              <div class="card_level smallCard">Level \${gameData.cardPool[3]..level}</div>
              <div class="card_desc smallCard">\${gameData.cardPool[3].effectString}</div>
              <div class="card_cost smallCard">Cost \${gameData.cardPool[3].cost}</div>
            </div>
            <div id="CP4" class="CP_cardspot CPspot5" \${click@=>myCardPool.clickHandler}>
              <div class="card_title smallCard">\${gameData.cardPool[4].title}</div>
              <div class="card_level smallCard">Level \${gameData.cardPool[4]..level}</div>
              <div class="card_desc smallCard">\${gameData.cardPool[4].effectString}</div>
              <div class="card_cost smallCard">Cost \${gameData.cardPool[4].cost}</div>
            </div>
            <div id="CP5" class="CP_cardspot CPspot6" \${click@=>myCardPool.clickHandler}>
              <div class="card_title smallCard">\${gameData.cardPool[5].title}</div>
              <div class="card_level smallCard">Level \${gameData.cardPool[5]..level}</div>
              <div class="card_desc smallCard">\${gameData.cardPool[5].effectString}</div>
              <div class="card_cost smallCard">Cost \${gameData.cardPool[5].cost}</div>
            </div>
        </div>
        
    </div>
      `;

  localState: any;
  constructor(state) {
    this.localState = state;
  }
}
