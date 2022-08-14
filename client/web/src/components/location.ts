export class Location {
  componentName: string = "myLocation";
  template: string = `
    <div class="loc_container" >
        <div class="loc_rel_container">
            <span class="loc_title">Location Card</span>
            <div class="loc_card" \${===myLocation.isVisible}>
                <div  class="loc_card_title">\${myLocation.title}</div>
                <div  class="loc_card_level">Level \${myLocation.level}</div>
                <div  class="loc_card_health">Influence Points \${myLocation.damage}/\${myLocation.health}</div>
                <div  class="loc_card_sequence">Sequence \${myLocation.sequence}/3</div>
            </div>
        </div>
    </div>
`;

  localState: any;
  constructor(state) {
    this.localState = state;
  }
}
