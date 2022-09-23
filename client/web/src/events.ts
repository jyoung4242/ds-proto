import { utils } from "./utils";

type GameEventType = {
  type: string;
  message?: string;
  timeout?: number;
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
  timeout: 5000,
};

let shortdelay: GameEventType = {
  type: "delay",
  timeout: 1000,
};

type GameEventSequence = {
  sequence: GameEventType[];
};

export let startSetupSeq: GameEventSequence = { sequence: [clearscreen] };
export let startSequence: GameEventSequence = { sequence: [startScreen, dealCards, showStartTurn, setPlayerBloom] };

class GameEvent {
  state: any;
  event: GameEventType;
  constructor(event: GameEventType) {
    this.event = event;
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
    console.log(this.state.myHand.player1Hand);
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

  showStartTurn(resolve) {
    //get user name
    console.log("i made it here");
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    const username = this.state.gameData.Players[usr].name;
    const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
    console.log("values: ", usr, username, myTurn, this.state.playerData.id, this.state.gameData.Players[usr].id);
    if (myTurn) {
      //show start turn button
      this.state.myNavInput.isVisible = true;
      this.state.myNavInput.buttons.push({
        label: "Start Turn",
        action: (event, model, element) => {
          utils.startTurn();
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
