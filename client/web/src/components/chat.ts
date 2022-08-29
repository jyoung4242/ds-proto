import { bubble } from "../assets/assetPool";

export class Chat {
  componentName: string = "myChat";
  template: string = `
        <div class="chat_Component">
          <div class="chat_messageContainer" \${===myChat.isActive}>
            <!- messages field ->

            <div id="chatdiv" class="chat_message_innerContainer">
            <div class="\${msg.type}" \${msg<=*myChat.messages}>
            <!- peasy many to one binding for each message ->
            <p>\${msg.message}</p>
          </div>
            </div>

           
            <div>
              <!- input field ->
              <div>
                <input class="chat_inputtext" type="text" \${value<=>myChat.inputMessage} \${click@=>myChat.selectText}></input>
              </div>
              <!- message icon ->
              <div>
                <img class="chat_input_icon" width="25" height="25" alt="" src="${bubble}" \${click@=>myChat.sendMessage}/>  
              </div>
            </div>
          </div>
          <div class="chat_iconContainer">
            <div \${click@=>myChat.toggleChat}>
              <!- messaging icon->
              <img width="30" height="30" alt="" src="${bubble}"/>
            </div>
            <div class="chat_unreadpill" \${===myChat.showPill}  \${click@=>myChat.toggleChat}>
              <span>\${myChat.numUnreadMessages}</span>
              <!- unread messages pill ->
            </div>
          </div>
            
          
        </div>
          `;

  localState: any;
  constructor(state) {
    this.localState = state;
  }
}

/**
 * when rendered, this should create a keybinding for the message enter
 * and when unrendered, this should destroy that binding
 */
