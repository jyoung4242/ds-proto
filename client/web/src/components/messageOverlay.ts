export class MessageOverlay {
  componentName: string = "myMessageOverlay";

  template: string = `
    <div class="MO_container" \${===myMessageOverlay.isVisble}>
        <div class="MO_relative">
            <div class="MO_main">\${myMessageOverlay.mainMessage}</div>
            <divc class="MO_sub">\${myMessageOverlay.subMessage}</div>
        </div>
    </div>
    `;

  localState: any;
  constructor(state) {
    this.localState = state;
  }
}
