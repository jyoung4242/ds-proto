import bmale from "../assets/people/barbarian_m.png";
import bfemale from "../assets/people/barbarian_w.png";
import wmale from "../assets/people/wizard.png";
import wfemale from "../assets/people/wizard_female.png";
import rmale from "../assets/people/rogue_male.png";
import rfemale from "../assets/people/rogue_w.png";
import pmale from "../assets/people/paladin_male.png";
import pfemale from "../assets/people/paladin_w.png";

import settings from "../assets/options/whitemenu.png";
import { Settings } from "./settings";

export class CharScreen {
  componentName: string = "myCharscreen";
  settings: any;
  template: string;

  localState: any;
  constructor(state) {
    this.localState = state;
    this.settings = new Settings(state);
    this.template = `
    <div class="charscreentitle">Character Selection</div>
    <div class="charscreenContainer">
      ${this.settings.template}
      <div class="cs_modaldiv" \${!==myCharscreen.isModalShowing}>
          <div class="cs_inputsdiv">
            <input class="cs_inputname"  type="text" \${focus@=>myCharscreen.selectText} \${value<=>myCharscreen.characterName}/>
            <div class="switchcontainer">
                <div class="cs_letter">M</div>
                <div class="cs_MFselectordiv" style="justify-content:\${myCharscreen.switchPosition};" \${click@=>myCharscreen.toggleGender}>
                    <div class="cs_selectorButton"> </div>
                </div>
                <div class="cs_letter">F</div>
            </div>
          </div>

          <button class="lobbyButton barbutton" \${click@=>myCharscreen.selectBarbarian}>Barbarian</button>
          <img src="${bmale}" class="cs_barbarian_sprite "  alt=""  \${===myCharscreen.isMale} >
          <img src="${bfemale}" class="cs_barbarian_sprite "  alt="" \${!==myCharscreen.isMale} >
                          
          <button class="lobbyButton wizbutton" \${click@=>myCharscreen.selectWizard}>Wizard</button>
          <img src="${wmale}" class="cs_wizard_sprite "  alt="" \${===myCharscreen.isMale} />
          <img src="${wfemale}" class="cs_wizard_sprite " alt="" \${!==myCharscreen.isMale}/>
          
          <button class="lobbyButton rogbutton" \${click@=>myCharscreen.selectRogue}>Rogue</button>
          <img src="${rmale}" class="cs_rogue_sprite"  alt="" \${===myCharscreen.isMale} />
          <img src="${rfemale}" class="cs_rogue_sprite" alt="" \${!==myCharscreen.isMale} />
        
          <button class="lobbyButton palbutton" \${click@=>myCharscreen.selectPaladin}>Paladin</button>
          <img src="${pmale}" class="cs_paladin_sprite"  alt="" \${===myCharscreen.isMale} />
          <img src="${pfemale}" class="cs_paladin_sprite"  alt="" \${!==myCharscreen.isMale} />

      </div>
      <div class="cs_modaldiv2" \${===myCharscreen.isModalShowing}>
          <div class="cs_modal2_title">Confirm these character selection settings?</div>
          <div class="cs_modal2_prompt">Character Name: \${myCharscreen.characterName}</div>
          <div class="cs_modal2_image">
            <img src="\${myCharscreen.imgSource}" alt=""/>
          </div>
          <div class="cs_modal2_buttondiv">
            <button class="lobbyButton" \${click@=>myCharscreen.cancelSelection}>Cancel</button>
            <button class="lobbyButton" \${click@=>myCharscreen.enterGame}>Accept</button>
          </div>
          
      </div> 
           
      
    </div>
          
    <div class="csbuttonflex">
        <button class="lobbyButton " \${click@=>myCharscreen.goBack}>Back</button>
        <button class="lobbyButton " \${click@=>myCharscreen.logout}>Logout</button>
    </div>
    
    <div class="loginText">
          <p>Logged in as: \${playerData.username}</p>
          <p>Game ID is \${gameData.gameID}</p>
    </div>
    <img class="game_menu_icon" src="${settings}" alt="" \${click@=>mypUI.showOptions}/>
      `;
  }
}
