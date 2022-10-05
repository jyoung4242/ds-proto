import { Card } from "./card";

export class Hand {
  componentName: string = "myHand";
  template: string = `

       <div class="hand_blurdiv" \${===myHand.isVisible}>
          <div class="hand_container" >
            <div class="hand">
              <div id="\${card.id}" class="card_container" \${card<=*myHand.hand} \${click@=>myHand.clickHandler}>
                      <div class="card_title">\${card.title}</div>
                      <div class="card_level">Level \${card.level}</div>
                      <div class="card_desc">\${card.effectString}</div>
              </div>
              <button class="lobbyButton card_done_button" \${click@=>myHand.done}  \${===myHand.isEmpty}>FINISHED</button>
            </div>
            <div class="footer">
                  \${myHand.footer}
            </div>
          </div>
       </div>
            `;

  localState: any;
  constructor(state) {
    this.localState = state;
  }
}
