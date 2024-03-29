export class Monster {
  componentName: string = "myMonster";
  template: string = `
      <div  class="monster_container" >
          <div class="slash" style="left: \${attack.x }px; top: \${attack.y }px; \${attack.orientation}" \${attack<=*myMonster.monsterAttacks}></div>
          <div  class="monster_rel_container" >
              <span class="monster_title">Monster Card</span>
              <div id="mon" class="monster_card_outer \${myMonster.cssString}" $\{===myMonster.isVisible}>
                <div id="\${monster.id}" class="monster_card"  \${monster<=*gameData.activeMonsters} \${click@=>myMonster.clickHandler}>
                  <div class="topside">
                    <div  class="monster_card_title">\${monster.title}</div>
                    <div  class="monster_card_level">Level \${monster.level}</div>
                    <div  class="monster_card_health">Health: \${monster.damage}/\${monster.health}</div>
                    <div class="monster_card_description">\${monster.effectstring}</div>
                  </div>
                  <div class="bottomside">
                    <div  class="monster_card_subtitle">\${monster.title}</div>
                    <div class="monster_card_reward">Reward: \${monster.rewardstring}</div>
                  </div>    
                </div>
              </div>
              
          </div>
      </div>
  `;

  localState: any;
  constructor(state) {
    this.localState = state;
  }
}
