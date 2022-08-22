import mute from "../assets/options/whitemute.png";
import unmute from "../assets/options/whiteunmute.png";

export class Settings {
  componentName: string = "mySettings";

  template: string = `
      <div class="settings_container" \${===mySettings.showModal}> 
        <div class="setting_relative_container">
            <div class="settings_background_mask">
            </div>
            <div class="settings_inner_container">
                <div class="settings_inner_cont_rel">
                    <div class="setting_title">
                        <span>Settings</span>
                    </div>

                    <div class="settings_chat_cont">
                        <div class="settings_chat_rel">
                            <span class="settings_chat_label" >Chat</span>
                            <label class="settings_chat_um_label" >User Messages</label>
                            <input class="settings_chat_um_color" type="color" \${value<=>mySettings.chatUM} \${input@=>mySettings.updateChat}></input>
                            <label class="settings_chat_sys_label" >System Messages</label>
                            <input class="settings_chat_sys_color" type="color" \${value<=>mySettings.chatSM} \${input@=>mySettings.updateChat}></input>
                            <label class="settings_chat_om_label" >Other Messages</label>
                            <input class="settings_chat_om_color" type="color" \${value<=>mySettings.chatOM} \${input@=>mySettings.updateChat}></input>
                            <label class="settings_chat_bg_label" >Background</label>
                            <input class="settings_chat_bg_color" type="color" \${value<=>mySettings.chatBG} \${input@=>mySettings.updateChat}></input>
                            <label class="settings_chat_op_label" >Opacity</label>
                            <input class="settings_chat_op_color" type="range" min="0" max="1" step="0.1" \${value<=>mySettings.chatOP} \${input@=>mySettings.updateChat}></input>
                        </div>
                        
                    </div>

                    <div class="settings_screen_color_cont">
                        <div class="settings_chat_rel">
                            <span class="settings_screen_color_label" >Screen Color</span>
                            <label class="settings_screen_color_label_beg" >Beginning</label>
                            <input class="settings_screen_color_color_beg" type="color" \${value<=>mySettings.beginningColor} \${input@=>mySettings.updateColor}></input>
                            <label class="settings_screen_color_label_end" >Ending</label>
                            <input class="settings_screen_color_color_end" type="color" \${value<=>mySettings.endingColor} \${input@=>mySettings.updateColor}></input>
                        </div>
                    </div>

                    <div class="settings_gamespeed_cont">
                        <div class="settings_chat_rel">
                            <span class="settings_gamespeed_label" >Game Speed</span>
                            <label class="settings_gamespeed_label_low" >Slow</label>
                            <input class="settings_gamespeed_slider" type="range"  ></input>
                            <label class="settings_gamespeed_label_high" >Fast</label>
                        </div>
                       
                    </div>

                    <div class="settings_sfx_cont">
                        <div class="settings_chat_rel">
                            <span class="settings_sfx_label" >SFX Volume</span>
                            <img class="settings_sfx_icon" src="${unmute}" alt="" />
                            <label class="settings_sfx_label_low" >Low</label>
                            <input class="settings_sfx_slider" type="range"  ></input>
                            <label class="settings_sfx_label_high" >High</label>
                        </div>
                        
                    </div>

                    <div class="settings_bgm_cont">
                        <div class="settings_chat_rel">
                            <span class="settings_bgm_label" >Music Volume</span>
                            <img class="settings_bgm_icon" src="${unmute}" alt="" />
                            <label class="settings_bgm_label_low">Low</label>
                            <input class="settings_bgm_range_slider" type="range"></input>
                            <label class="settings_bgm_label_high">High</label>
                        </div>
                    </div>
                </div>
                <button class="lobbyButton settings_ok" \${click@=>mySettings.closeModal}>OK</button>
            </div>
        </div>
      </div>
        `;

  localState: any;
  constructor(state) {
    this.localState = state;
  }
}
