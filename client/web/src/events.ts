import { resolve } from "../webpack.config";
import { utils } from "./utils";
import { iStatusMessage } from "./components/character";

import { discard, nodraw, location } from "./assets/assetPool";

let SE_map = {
  0: { img: "", effect: "STUNNED" },
  1: { img: "", effect: "NO HEALING" },
  2: { img: nodraw, effect: "CANNOT DRAW CARD" },
  3: { img: location, effect: "LOCATION CURSE" },
  4: { img: discard, effect: "DISCARD CURSE" },
};

type GameEventType = {
  type: string;
  message?: string;
  timeout?: number;
  state?: string;
  value?: number;
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
  timeout: 2000,
};

let shortdelay: GameEventType = {
  type: "delay",
  timeout: 500,
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

let updateStatusEffects: GameEventType = {
  type: "statEffects",
};

let indexProgressBar_passive: GameEventType = {
  type: "indexProgress",
  state: "passives",
};

let indexProgressBar_td: GameEventType = {
  type: "indexProgress",
  state: "td",
};

let indexProgressBar_monster: GameEventType = {
  type: "indexProgress",
  state: "monster",
};

let highlightTD: GameEventType = {
  type: "TDbloom",
};

let debug: GameEventType = {
  type: "debug",
};

let lose1Health: GameEventType = {
  type: "lowerhealth",
  value: 1,
};

let lose2Health: GameEventType = {
  type: "lowerhealth",
  value: 2,
};

let gain1Health: GameEventType = {
  type: "raisehealth",
  value: 1,
};

let gain2Health: GameEventType = {
  type: "raisehealth",
  value: 2,
};

let hideTDcard: GameEventType = {
  type: "hideTD",
};

let enablemonsters: GameEventType = {
  type: "enableMonsters",
};

let playerDamage: GameEventType = {
  type: "damageFlash",
};

let playerHeal: GameEventType = {
  type: "healFlash",
};

let locationDamage: GameEventType = {
  type: "locationFlash",
};

let locationHeal: GameEventType = {
  type: "locationHealFlash",
};

let highlightMonsters: GameEventType = {
  type: "bloomMonsters",
};

let unBloomMonster: GameEventType = {
  type: "unbloomMonster",
};

let promptPlayersHand: GameEventType = {
  type: "prompt_playerHand",
};
let showPlayerHand: GameEventType = {
  type: "show_playerHand",
};

let addAttack1: GameEventType = {
  type: "showAttackAnimation",
  value: 1,
  message: "add",
};

let addAttack2: GameEventType = {
  type: "showAttackAnimation",
  value: 2,
  message: "add",
};

let addCoin2: GameEventType = {
  type: "showCoinAnimation",
  value: 2,
  message: "add",
};

let addCoin1: GameEventType = {
  type: "showCoinAnimation",
  value: 1,
  message: "add",
};

let healOthers: GameEventType = {
  type: "healOthers",
  value: 1,
};

let drawCard: GameEventType = {
  type: "draw",
};

type GameEventSequence = {
  sequence: GameEventType[];
};

export let startSetupSeq: GameEventSequence = { sequence: [clearscreen] };
export let startSequence: GameEventSequence = { sequence: [startScreen, dealCards, showStartTurn, setPlayerBloom] };
export let startTurn: GameEventSequence = {
  sequence: [hideNavButton, shortdelay, showNavBar, shortdelay, dealTD, shortdelay, playerPassives],
};
export let passives: GameEventSequence = {
  sequence: [hideNavButton, shortdelay, indexProgressBar_passive, shortdelay, highlightTD],
};
export let updateStatEffects: GameEventSequence = {
  sequence: [shortdelay, updateStatusEffects, shortdelay],
};

export let lowerHealth1: GameEventSequence = {
  sequence: [shortdelay, playerDamage, lose1Health, shortdelay],
};

export let raiseHealth2: GameEventSequence = {
  sequence: [shortdelay, playerHeal, gain2Health, shortdelay],
};

export let raiseHealth1: GameEventSequence = {
  sequence: [shortdelay, playerHeal, gain1Health, shortdelay],
};

export let lowerHealth2: GameEventSequence = {
  sequence: [shortdelay, playerDamage, lose2Health, shortdelay],
};

export let hideTD: GameEventSequence = {
  sequence: [hideTDcard, shortdelay, shortdelay, indexProgressBar_td, enablemonsters],
};

export let locDamage: GameEventSequence = {
  sequence: [locationDamage],
};

export let bloomMonsters: GameEventSequence = {
  sequence: [highlightMonsters],
};

export let skipMonsters: GameEventSequence = {
  sequence: [shortdelay, indexProgressBar_monster, shortdelay, promptPlayersHand],
};
export let MonsterPlayed: GameEventSequence = {
  sequence: [unBloomMonster, shortdelay, indexProgressBar_monster, promptPlayersHand],
};

export let playerHandShow: GameEventSequence = {
  sequence: [shortdelay, showPlayerHand],
};

export let add1Attack: GameEventSequence = {
  sequence: [addAttack1],
};

export let add2Attack: GameEventSequence = {
  sequence: [addAttack2],
};
export let add1Coin: GameEventSequence = {
  sequence: [addCoin1],
};

export let add2Coin: GameEventSequence = {
  sequence: [addCoin2],
};

export let drawNewCard: GameEventSequence = {
  sequence: [drawCard],
};

export let healOthers1: GameEventSequence = {
  sequence: [shortdelay, healOthers, shortdelay],
};

export let remove1Location: GameEventSequence = {
  sequence: [locationHeal],
};

class GameEvent {
  state: any;
  event: GameEventType;
  constructor(event: GameEventType) {
    this.event = event;
  }

  statEffects(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    const username = this.state.gameData.Players[usr].name;
    const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;

    //clear UI statusEffects
    this.state.mypUI.allPlayers[usr].statusEffects = [];
    //loop through statuseffects call execute callbacks
    this.state.gameData.Players[usr].statusEffects.forEach(se => {
      let msg: iStatusMessage = {
        img: SE_map[se].img,
        effect: SE_map[se].effect,
        angle: 0,
        negAngle: 0,
      };
      this.state.mypUI.allPlayers[usr].addStatusMessage(msg);
    });

    this.state.myToast.addToast("effect", `Player received status effect`);
    resolve();
  }

  healOthers(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    const arrayOfPlayersToHeal = this.state.gameData.Players.splice(usr, 1);

    arrayOfPlayersToHeal.forEach(p => {
      p.addHealth(this.event.value);
      p.bloomStatus = p.bloomStatus + " playerHeal";
    });

    resolve();
  }

  prompt_playerHand(resolve) {
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
        label: "Play your hand?",
        action: (event, model, element) => {
          utils.showPcard();
          utils.playSound("button");
          this.state.myNavInput.isVisible = false;
        },
        unaction: (event, model, element) => {},
        style: "",
      });
      this.state.myNavInput.isVisible = true;
    } else {
    }
  }

  draw(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    //grab card from state
    const lastcardindex = this.state.gameData.Players[usr].hand.length;
    const newCard = this.state.gameData.Players[usr].hand[lastcardindex];

    //update player hand
    this.state.mypUI.allPlayers[usr].hand.push(newCard);
    //update current hand
    this.state.mypUI.hand.push(newCard);
    resolve();
  }

  show_playerHand(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    const username = this.state.gameData.Players[usr].name;
    const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;

    switch (usr) {
      case 0:
        this.state.myHand.hand = [...this.state.myHand.player1Hand];

        break;
      case 1:
        this.state.myHand.hand = [...this.state.myHand.player2Hand];
        break;
      case 2:
        this.state.myHand.hand = [...this.state.myHand.player3Hand];
        break;
      case 3:
        this.state.myHand.hand = [...this.state.myHand.player4Hand];
        break;
    }
    this.state.myHand.footer = `${username.replace(/^\w/, c => c.toUpperCase())}'s Hand`;
    if (this.state.myHand.hand.length != 0) this.state.myHand.isVisible = true;
    //make cards clickable
    resolve();
  }

  showCoinAnimation(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });

    if (this.event.message == "add") {
      this.state.mypUI.allPlayers[usr].coinPlacard.color = "limegreen";
      this.state.mypUI.allPlayers[usr].coinPlacard.text = `+${this.event.value}`;
    } else if (this.event.message == "remove") {
      this.state.mypUI.allPlayers[usr].coinPlacard.color = "red";
      this.state.mypUI.allPlayers[usr].coinPlacard.text = `-${this.event.value}`;
    }

    this.state.mypUI.allPlayers[usr].coinPlacard.isVisible = true;
    const mInt = setInterval(() => {
      this.state.mypUI.allPlayers[usr].coinPlacard.offset -= 2;
      if (this.state.mypUI.allPlayers[usr].coinPlacard.offset < -25) {
        this.state.mypUI.allPlayers[usr].coinPlacard.opacity -= 0.05;
      }

      if (this.state.mypUI.allPlayers[usr].coinPlacard.offset <= -75) {
        clearInterval(mInt);
        this.state.mypUI.allPlayers[usr].coinPlacard.offset = 0;
        this.state.mypUI.allPlayers[usr].coinPlacard.opacity = 1;
        this.state.mypUI.allPlayers[usr].coinPlacard.isVisible = false;
      }
    }, 50);
    resolve();
  }

  showAttackAnimation(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });

    if (this.event.message == "add") {
      this.state.mypUI.allPlayers[usr].attackPlacard.color = "limegreen";
      this.state.mypUI.allPlayers[usr].attackPlacard.text = `+${this.event.value}`;
    } else if (this.event.message == "remove") {
      this.state.mypUI.allPlayers[usr].attackPlacard.color = "red";
      this.state.mypUI.allPlayers[usr].attackPlacard.text = `-${this.event.value}`;
    }

    this.state.mypUI.allPlayers[usr].attackPlacard.isVisible = true;
    const mInt = setInterval(() => {
      this.state.mypUI.allPlayers[usr].attackPlacard.offset -= 2;
      if (this.state.mypUI.allPlayers[usr].attackPlacard.offset < -25) {
        this.state.mypUI.allPlayers[usr].attackPlacard.opacity -= 0.05;
      }

      if (this.state.mypUI.allPlayers[usr].attackPlacard.offset <= -75) {
        clearInterval(mInt);
        this.state.mypUI.allPlayers[usr].attackPlacard.offset = 0;
        this.state.mypUI.allPlayers[usr].attackPlacard.opacity = 1;
        this.state.mypUI.allPlayers[usr].attackPlacard.isVisible = false;
      }
    }, 50);
    resolve();
  }

  damageFlash(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    this.state.mypUI.allPlayers[usr].bloomStatus = this.state.mypUI.allPlayers[usr].bloomStatus + " playerdamage";
    resolve();
  }

  healFlash(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    this.state.mypUI.allPlayers[usr].bloomStatus = this.state.mypUI.allPlayers[usr].bloomStatus + " playerHeal";
    resolve();
  }

  locationFlash(resolve) {
    this.state.myLocation.cssString = " locationdamage";
    setTimeout(() => {
      this.state.myLocation.cssString = "";
    }, 500);
    resolve();
  }

  locationHealFlash(resolve) {
    this.state.myLocation.cssString = " locationHeal";
    setTimeout(() => {
      this.state.myLocation.cssString = "";
    }, 500);
    resolve();
  }

  enableMonsters(resolve) {
    utils.enableM();
    resolve();
  }

  hideTD(resolve) {
    this.state.myTowerD.cssString = "";
    this.state.myTowerD.isVisible = false;
    resolve();
  }

  lowerhealth(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    this.state.mypUI.allPlayers[usr].lowerHealth(this.event.value);
    resolve();
  }

  raisehealth(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    this.state.mypUI.allPlayers[usr].addHealth(this.event.value);
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
    const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
    //this.state.myNavBar.increment("passives");
    if (myTurn) {
      this.state.myTowerD.cssString = "td_bloom td_clickable";
    } else {
      this.state.myTowerD.cssString = "td_bloom";
    }
    resolve();
  }

  bloomMonsters(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
    //this.state.myNavBar.increment("passives");
    if (myTurn) {
      this.state.myMonster.cssString = " td_bloom td_clickable nohover";
    } else {
      this.state.myMonster.cssString = "td_bloom";
    }
    resolve();
  }

  unbloomMonster(resolve) {
    this.state.myMonster.cssString = "";
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
          this.state.myNavInput.isVisible = false;
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
