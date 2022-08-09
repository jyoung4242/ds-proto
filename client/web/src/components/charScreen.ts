import bmale from "../assets/people/ff_barbarian.png";
import bfemale from "../assets/people/ff_barbarian_w.png";
import wmale from "../assets/people/ff_wizard.png";
import wfemale from "../assets/people/ff_wizard_w.png";
import rmale from "../assets/people/ff_rogue.png";
import rfemale from "../assets/people/ff_rogue_w.png";
import pmale from "../assets/people/ff_paladin.png";
import pfemale from "../assets/people/ff_paladin_w.png";

export class CharScreen {
  componentName: string = "myCharscreen";

  template: string = `
    <div class="charscreentitle">Character Selection</div>
    <div class="charscreenContainer">
      <div class="cs_modaldiv" \${!==myCharscreen.isModalShowing}>
          <div class="cs_inputsdiv">
            <input class="cs_inputname"  type="text"  \${value<=>myCharscreen.characterName}/>
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
        <button class="lobbyButton " \${click@=>myCharscreen.joinGame}>Back</button>
        <button class="lobbyButton " \${click@=>myCharscreen.logout}>Logout</button>
    </div>
    
    <div class="loginText">
          <span>Logged in as: \${playerData.username}</span>
    </div>
      `;

  localState: any;
  constructor(state) {
    this.localState = state;
  }
}
