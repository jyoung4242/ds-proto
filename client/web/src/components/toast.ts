export class Toast {
  componentName: string = "myGameScreen";
  intervalID: NodeJS.Timer;
  template: string = `
  <div class="container">
    <div class="toast_container">
        <div  class="toast_entry" \${msg<=*myToast.messages} >
            <div id="elm_\${msg.$index}"  class="toast_img_container bloom">
                    <img \${mouseover@=>msg.hover} class="toast_img" src="\${msg.img}" alt=""/>    
            </div>
            <div  class="toast_message">\${msg.msg}</div>
            <div \${click@=>msg.close} class="toast_close">X</div>
        </div>
    </div>
  </div>
  `;

  localState: any;
  constructor(state) {
    this.localState = state;
  }

  init() {
    this.localState.state.myToast.intervalID = setInterval(() => {
      //update all toast timers
      const numMessages = this.localState.state.myToast.messages.length;
      if (numMessages > 0) {
        for (let index = numMessages - 1; index >= 0; index--) {
          let elm = document.getElementById(`elm_${index}`);
          if (!this.isHover(elm)) {
            this.localState.state.myToast.messages[index].timeOut -= 500;
            if (this.localState.state.myToast.messages[index].timeOut <= 0) {
              this.localState.state.myToast.messages.splice(index, 1);
            }
          }
        }
      }
    }, 500);
  }

  isHover = e => e.parentElement.querySelector(":hover") === e;
}
