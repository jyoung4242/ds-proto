import { resolve } from "../webpack.config";
import { utils } from "./utils";

type GameEventType = {
  type: string;
  message?: string;
  timeout?: number;
  state?: string;
  //add optional
};

let dealCards: GameEventType = {
  type: "dealCards",
};

let clearscreen: GameEventType = {
  type: "clearscreen",
};

let startScreen: GameEventType = {
  type: "startBanner",
};

let showStartTurn: GameEventType = {
  type: "showStartTurn",
};

let setPlayerBloom: GameEventType = {
  type: "setBloom",
};

let log1: GameEventType = {
  type: "log",
  message: "log message 1",
};
let log2: GameEventType = {
  type: "log",
  message: "log message 2",
};
let log3: GameEventType = {
  type: "log",
  message: "log message 3",
};

let alert: GameEventType = {
  type: "alert",
  message: "alert message",
};

let longdelay: GameEventType = {
  type: "delay",
  timeout: 4000,
};

let shortdelay: GameEventType = {
  type: "delay",
  timeout: 1000,
};

let hideNavButton: GameEventType = {
  type: "hideNavButton",
};

let showNavBar: GameEventType = {
  type: "showNavBar",
};

let dealTD: GameEventType = {
  type: "dealTD",
};

let playerPassives: GameEventType = {
  type: "pPassives",
};

let indexProgressBar_passive: GameEventType = {
  type: "indexProgress",
  state: "passives",
};

let highlightTD: GameEventType = {
  type: "TDbloom",
};

type GameEventSequence = {
  sequence: GameEventType[];
};

let debug: GameEventType = {
  type: "debug",
};

export let startSetupSeq: GameEventSequence = { sequence: [clearscreen] };
export let startSequence: GameEventSequence = { sequence: [startScreen, dealCards, showStartTurn, setPlayerBloom] };
export let startTurn: GameEventSequence = {
  sequence: [hideNavButton, shortdelay, showNavBar, shortdelay, dealTD, shortdelay, playerPassives],
};
export let passives: GameEventSequence = {
  sequence: [hideNavButton, shortdelay, indexProgressBar_passive, shortdelay, highlightTD],
};

class GameEvent {
  state: any;
  event: GameEventType;
  constructor(event: GameEventType) {
    this.event = event;
  }

  debug(resolve) {
    let mutObs = new MutationObserver(entries => {
      console.log(entries);
    });
    let target = document.getElementById("mon");
    console.log("target: ", target);
    mutObs.observe(target, { childList: true });
    resolve();
  }

  indexProgress(resolve) {
    this.state.myNavBar.increment(`${this.event.state}`);
    resolve();
  }

  TDbloom(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    const username = this.state.gameData.Players[usr].name;
    const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
    //this.state.myNavBar.increment("passives");
    if (myTurn) {
      this.state.myTowerD.cssString = "td_bloom td_clickable";
    } else {
      this.state.myTowerD.cssString = "td_bloom";
    }
    resolve();
  }

  hideNavButton(resolve) {
    this.state.myNavInput.isVisible = false;
    resolve();
  }

  dealTD(resolve) {
    this.state.myTowerD.isVisible = true;
    resolve();
  }

  showNavBar(resolve) {
    this.state.myNavBar.showNavBar = true;
    resolve();
  }

  clearscreen(resolve) {
    this.state.myGame.showModal = false;
    this.state.myChat.isActive = false;
    this.state.myHand.isVisible = false;
    this.state.myLocation.isVisible = false;
    this.state.myTowerD.isVisible = false;
    this.state.myMonster.isVisible = false;
    this.state.myNavBar.showNavBar = false;
    this.state.myNavInput.isVisible = false;
    this.state.myNavInput.buttons = [];
    this.state.myHand.hand = [];
  }

  dealCards(resolve) {
    //deal monster card
    this.state.myMonster.isVisible = true;
    this.state.myLocation.isVisible = true;
    this.state.gameData.Players.forEach((p, i) => {
      switch (i) {
        case 0:
          this.state.myHand.player1Hand = [...this.state.gameData.Players[i].hand];
          break;
        case 1:
          this.state.myHand.player2Hand = [...this.state.gameData.Players[i].hand];
          break;
        case 2:
          this.state.myHand.player3Hand = [...this.state.gameData.Players[i].hand];
          break;
        case 3:
          this.state.myHand.player4Hand = [...this.state.gameData.Players[i].hand];
          break;
      }
    });

    resolve();
  }

  dealLocation(resolve) {}

  dealPlayer(resolve) {}

  startBanner(resolve) {
    this.state.myMessageOverlay.mainMessage = "STARTING GAME";
    this.state.myMessageOverlay.subMessage = "";
    this.state.myMessageOverlay.isVisble = true;
    setTimeout(() => {
      this.state.myMessageOverlay.isVisble = false;
      resolve();
    }, 5000);
  }

  pPassives(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    const username = this.state.gameData.Players[usr].name;
    const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
    //this.state.myNavBar.increment("passives");
    if (myTurn) {
      //show start turn button

      this.state.myNavInput.buttons = [];
      this.state.myNavInput.buttons.push({
        label: "Run Passives",
        action: (event, model, element) => {
          utils.passives();
          utils.playSound("button");
          this.state.myNavInput.isVisble = false;
        },
        unaction: (event, model, element) => {},
        style: "",
      });
      this.state.myNavInput.isVisible = true;
    } else {
    }
    resolve();
  }

  showStartTurn(resolve) {
    //get user name

    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    const username = this.state.gameData.Players[usr].name;
    const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;

    if (myTurn) {
      //show start turn button
      this.state.myNavInput.isVisible = true;
      this.state.myNavInput.buttons.push({
        label: "Start Turn",
        action: (event, model, element) => {
          utils.startTurn();
          utils.playSound("button");
          this.state.myNavInput.isVisble = false;
        },
        unaction: (event, model, element) => {},
        style: "",
      });
    } else {
      //toast message that its someone else's turn
      this.state.myToast.addToast("user", `It is ${username}'s turn!`);
    }
    resolve();
  }

  setBloom(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    this.state.mypUI.allPlayers[usr].bloomStatus = "playerBloom";
  }

  asyncShowMessage(resolve) {}

  syncShowMessage(resolve) {}

  log(resolve) {
    console.log(this.event.message);
    resolve();
  }

  alert(resolve) {
    window.alert(this.event.message);
    resolve();
  }

  delay(resolve) {
    console.log("delay");
    setTimeout(() => {
      resolve();
    }, this.event.timeout);
  }

  init(state) {
    this.state = state;
    return new Promise(resolve => {
      this[this.event.type](resolve);
    });
  }
}

export const startEventSequence = async (events: GameEventSequence, state: any) => {
  for (let i = 0; i < events.sequence.length; i++) {
    const eventHandler = new GameEvent(events.sequence[i]);
    await eventHandler.init(state);
  }
};
