export class NavInput {
  componentName: string = "myNavInput";

  template: string = `
    <div class="NIcontainer" \${===myNavInput.isVisible} style="--component-top: \${myNavInput.contTop}; --component-width: \${myNavInput.contWidth}; --component-zh: \${myNavInput.contZ}" >
        <button \${button<=*myNavInput.buttons}  \${mouseup@=>button.unaction} \${mousedown@=>button.action} class="NIbutton \${button.style}">\${button.label}</button>
    </div>
      `;

  localState: any;
  constructor(state) {
    this.localState = state;
  }

  init() {}
}
