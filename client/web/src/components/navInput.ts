export class NavInput {
  componentName: string = "myNavInput";

  template: string = `
    <div class="NIcontainer" \${===myNavInput.isVisible} style="--component-width: \${myNavInput.contWidth};" >
        <button \${button<=*myNavInput.buttons}  \${mouseup@=>button.unaction} \${mousedown@=>button.action} class="NIbutton \${button.style}">\${button.label}</button>
    </div>
      `;

  localState: any;
  constructor(state) {
    this.localState = state;
  }

  init() {}
}
