export class NavBar {
  componentName: string = "myNavBar";

  template: string = `
    <div class="NBtimeline" \${===myNavBar.showNavBar}>
        <div data-state='\${ts.data}' class='NBtimestamp \${ts.style}' \${ts<=*myNavBar.timestamps} \${click@=>myNavBar.increment}>
        <div class=NBtimestap_rel>
            <p>\${ts.title}</p>
            <span class="NBdone" \${===ts.doneFlag}>\${ts.done}</span>
            <div class="NBconnector \${ts.connStyle}" \${===ts.connector}> </div>
        </div>
        </div>
    </div>
    `;

  localState: any;
  constructor(state) {
    this.localState = state;
  }
}
