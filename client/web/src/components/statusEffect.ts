export class StatusEffect {
  componentName: string = "myStatusEffect";
  template: string;
  localState: any;
  constructor(state) {
    this.localState = state;
    this.template = `
    <div class="SE_container">
           <div class="SE_rel">
                <div class="SE_status_effect_cont" \${effect<=*player.statusEffects} style="transform: rotate(\${effect.angle}deg);" >
                    <div class="SE_status_effect" style="transform: rotate(\${effect.negAngle}deg);"  >
                        <img  class="SE_status_effect_img" alt="" src="\${effect.img}" />
                        <span class="tooltip">\${effect.effect}</span>
                    </div>
                </div>
           </div>
      </div>`;
  }
}
