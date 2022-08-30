import { StatusEffect } from "./statusEffect";
import { atk, coin } from "../assets/assetPool";

export class pUI {
  componentName: string = "myUI";
  template: string;

  localState: any;
  statusEffect: any;
  constructor(state) {
    this.localState = state;
    this.statusEffect = new StatusEffect(state);
    this.template = `
    <div class="pui_Container" \${mouseout@=>mypUI.clear} \${mousemove@=>mypUI.checkHover}>
        <div class="pui_playerContainer"  \${player<=*mypUI.allPlayers}>
            
                ${this.statusEffect.template}
                <p class="pui_coin_text">\${player.coin}</p>
                <p class="pui_atk_text">\${player.attack}</p>
                <img class="pui_atkIMG" src=${atk} alt="" width="25" height="25"/>
                <img class="pui_coinIMG" src=${coin} alt="" width="25" height="25"/>
                <img class="pui_character" src="\${player.img}" alt="" width="60" height="100" \${mouseenter@=>player.setHover} \${mouseleave@=>player.clearHover} />
                <svg class="pui_svg \${player.bloomStatus}" >
                    <style>
                      pui_meter-\${player.index}{
                        stroke-dashoffset: calc((65 * 0.01745 * 36)*(10-\${player.health}));
                      }
                    </style>
                    <circle class="pui_bg" cx="70" cy="70" r="65" />
                    <circle class="pui_meter-\${player.index}" cx="70" cy="70" r="65" />
                </svg>
            
        </div>
    </div>
      `;
  }
}
