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
            <div class="CP_cardspot CPspot1"></div>
            <div class="CP_cardspot CPspot2"></div>
            <div class="CP_cardspot CPspot3"></div>
            <div class="CP_cardspot CPspot4"></div>
            <div class="CP_cardspot CPspot5"></div>
            <div class="CP_cardspot CPspot6"></div>
        </div>
        
    </div>
      `;

  localState: any;
  constructor(state) {
    this.localState = state;
  }
}
