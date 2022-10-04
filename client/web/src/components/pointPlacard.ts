export class PointPlacard {
  componentName: string = "myPointPlacard";

  template: string;

  localState: any;
  constructor(state, mode: "attack" | "coin") {
    this.localState = state;
    if (mode == "attack")
      this.template = `
      <div class="Plac_container Plac_atk" \${===player.attackPlacard.isVisible} style="transform: translateY(\${player.attackPlacard.offset}px); opacity: \${player.attackPlacard.opacity};">
          <div class="Plac_txt" style="color: \${player.attackPlacard.color}">\${player.attackPlacard.text}</div>
      </div>
      `;
    else if (mode == "coin")
      this.template = `
      <div class="Plac_container Plac_coin" \${===player.coinPlacard.isVisible}  style="transform: translateY(\${player.coinPlacard.offset}px); opacity: \${player.coinPlacard.opacity};" >
          <div class="Plac_txt" style="color: \${player.coinPlacard.color}">\${player.coinPlacard.text}</div>
      </div>
      `;
  }
}
