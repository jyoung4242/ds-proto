export class Toast {
  componentName: string = "myGameScreen";
  intervalID: NodeJS.Timer;
  template: string = `
      <div class="toast_container">
        <div data-cid="msg-\${message.$index}" class="toast_entry" \${message <=* myToast.messages}>
            <div data-tid="msg-\${message.$index}" class="toast_message">
                <span class="hidden" data-sid="msg-\${message.$index}">\${message.message}</span>
            </div>
            <div data-id="msg-\${message.$index}" $\{mouseenter@=>message.hover} $\{mouseleave@=>message.leave} class="toast_img_container bloom">
                <img class="toast_img" src="\${message.icon}" alt=""/>    
            </div>
            <div data-id="msg-\${message.$index}" class="toast_close" \${click@=>message.close}>X</div>
        </div>
      </div>
        `;

  localState: any;
  constructor(state) {
    this.localState = state;
  }

  init() {
    this.localState.state.myToast.intervalID = setInterval(() => {
      //work backwards through messages
      if (this.localState.state.myToast.messages.length) {
        for (let index = this.localState.state.myToast.messages.length - 1; index > -1; index--) {
          //test if its being hovered
          let hoverElement = document.querySelector(`[data-tid=\"msg-${index}\"]`);
          if (!hoverElement.classList.contains("wide")) {
            if (this.localState.state.myToast.messages[index].timeout <= 0) {
              //toast message can be removed from array, time'd out
              let hideElement = document.querySelector(`[data-cid=\"msg-${index}\"]`);
              hideElement.classList.add("toast_entry_close");
              setTimeout(() => {
                this.localState.state.myToast.messages.splice(index, 1);
              }, 750);
            } else {
              this.localState.state.myToast.messages[index].timeout -= 500;
            }
          }
        }
      }
    }, 500);
  }
}
