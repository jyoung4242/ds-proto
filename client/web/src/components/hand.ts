import { Card } from "./card";

export class Hand {
  componentName: string = "myHand";
  template: string = `
        <div class="hand_container" \${===myHand.isVisible}>
          <div class="hand">
            <div class="card_container" \${card<=*myHand.hand}>
                    <div class="card_title">\${card.title}</div>
                    <div class="card_level">\${card.level}</div>
                    <div class="card_desc">\${card.description}</div>
            </div>
          </div>
          <div class="footer">
                \${myHand.footer}
          </div>
        </div>
            `;

  localState: any;
  constructor(state) {
    this.localState = state;
  }
}
