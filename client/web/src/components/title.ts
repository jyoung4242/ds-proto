export class TitleComponent {
  componentName: string = "myTitle";
  template: string;
  localState: any;
  constructor(state) {
    this.localState = state;
    this.template = `
    <div class="mainTitle" >
      <span>\${myTitle.title}</span>
    </div>
    <div class="subTitle" >
      <span>\${myTitle.subtitle}</span>
    </div>
    <div>
      <button class="titleButton" \${click@=>myTitle.login}>LOGIN</button>
    </div>`;
  }
}
