export class Chat {
  componentName: string = "myChat";
  template: string = `
        <div >
          
        </div>
          `;

  localState: any;
  constructor(state) {
    this.localState = state;
  }
}
