class TitleComponent {
  componentName: string = "myTitle";
  template: string = `
  <div class="mainTitle"><span>\${myTitle.title}</span></div>
  <div class="subTitle"><span>\${myTitle.subtitle}</span></div>
  <div>
    <button class="titleButton" \${click@=>myTitle.login}>LOGIN</button
  </div>
    `;
}
export const Title = new TitleComponent();
