import bmale from "../assets/people/barbarian_m.png";
import bfemale from "../assets/people/ff_barbarian_w.png";
import wmale from "../assets/people/ff_wizard.png";
import wfemale from "../assets/people/ff_wizard_w.png";
import rmale from "../assets/people/ff_rogue.png";
import rfemale from "../assets/people/ff_rogue_w.png";
import pmale from "../assets/people/ff_paladin.png";
import pfemale from "../assets/people/ff_paladin_w.png";

import atk from "../assets/hud/attackicon.png";
import coin from "../assets/hud/stackofcoin.png";

export class pUI {
  componentName: string = "myUI";
  template: string = `
        <div class="pui_Container" \${mouseout@=>mypUI.clear} \${mousemove@=>mypUI.checkHover}>
            <div class="pui_playerContainer"  \${player<=*mypUI.allPlayers}>
                <div >

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
        </div>
          `;

  localState: any;
  constructor(state) {
    this.localState = state;
  }
}
