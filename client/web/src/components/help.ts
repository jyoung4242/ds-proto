import arrow from "../assets/help/whiteback-button.png";

export class Help {
  componentName: string = "myHelp";

  template: string = `
      <div class="settings_container" \${===myHelp.isVisible}> 
        <div class="setting_relative_container">
            <div class="settings_background_mask">
            </div>
            <div class="help_inner_container">
                <span class="help_title">How To Play</span>
                <span class="help_pagenum">Page \${myHelp.pageNum} / \${myHelp.numPages}</span>
                <p class="help_text" \${===myHelp.page1}>  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
                <p class="help_text" \${===myHelp.page2}>  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                Pretium aenean pharetra magna ac placerat vestibulum lectus mauris ultrices. A scelerisque purus semper eget duis at tellus at urna. Imperdiet sed euismod nisi porta. 
                Platea dictumst vestibulum rhoncus est pellentesque elit ullamcorper dignissim. Volutpat lacus laoreet non curabitur gravida arcu ac tortor. 
                Vel quam elementum pulvinar etiam non quam lacus suspendisse faucibus. Volutpat commodo sed egestas egestas fringilla phasellus faucibus. Scelerisque fermentum dui faucibus in. 
                Urna nunc id cursus metus aliquam. Lectus mauris ultrices eros in cursus. 

                Felis imperdiet proin fermentum leo vel orci. Elementum tempus egestas sed sed risus pretium quam vulputate dignissim.
                </p>
                <img \${click@=>myHelp.back} class="help_nav_left" src="${arrow}" alt="" />
                <img \${click@=>myHelp.next} class="help_nav_right" src="${arrow}" alt="" />
                <button class="lobbyButton settings_ok" \${click@=>myHelp.closeModal}>OK</button>
            </div>
        </div>
      </div>
        `;

  localState: any;
  constructor(state) {
    this.localState = state;
  }
}
