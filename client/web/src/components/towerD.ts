export class Tower {
  componentName: string = "myTowerD";
  template: string = `
    <div class="td_container" >
        <div class="td_rel_container ">
            <span class="td_title">Tower Defense Card</span>
            <div class="td_card \${myTowerD.cssString}" \${===myTowerD.isVisible} \${click@=>myTowerD.clicked}>
                <div  class="td_card_title">\${myTowerD.title}</div>
                <div  class="td_card_level">Level \${myTowerD.level}</div>
                <div  class="td_card_desc">\${myTowerD.desc}</div>
            </div>
        </div>
    </div>
`;

  localState: any;
  constructor(state) {
    this.localState = state;
  }
}
