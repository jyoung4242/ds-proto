export class StatusEffect {
  componentName: string = "myStatusEffect";
  template: string;
  localState: any;
  constructor(state) {
    this.localState = state;
    this.template = `
    <div class="SE_container">
           <div class="SE_rel">
                <div class="SE_status_effect_cont" \${effect<=*player.statusEffects}>
                    <div class="SE_status_effect">
                        <img  class="SE_status_effect_img" alt="" src="\${effect.img}"/>
                        <span class="tooltip">\${effect.text}</span>
                    </div>
                </div>
           </div>
      </div>`;
  }
}
