import { resolve } from "../webpack.config";
import { utils } from "./utils";
import { Character, iStatusMessage } from "./components/character";
import { clearIsChoiceFlag } from "./state/state";
import { discard, nodraw, location, stunned, mBonus } from "./assets/assetPool";
import { RoundState } from "../../../api/types";
import { Router } from "./components";

let SE_map = {
  0: { img: stunned, effect: "STUNNED" },
  1: { img: "", effect: "NO HEALING" },
  2: { img: nodraw, effect: "CANNOT DRAW CARD" },
  3: { img: location, effect: "LOCATION CURSE" },
  4: { img: discard, effect: "DISCARD CURSE" },
  5: { img: mBonus, effect: "MONSTER DEFEAT BONUS" },
};

type GameEventType = {
  type: string;
  message?: string;
  timeout?: number;
  state?: string;
  value?: number;
  //add optional
};

let isAttackPointsZero = false;

let longdelay: GameEventType = { type: "delay", timeout: 1500 };
let shortdelay: GameEventType = { type: "delay", timeout: 300 };
let indexProgressBar_passive: GameEventType = { type: "indexProgress", state: "passives" };
let indexProgressBar_td: GameEventType = { type: "indexProgress", state: "td" };
let indexProgressBar_monster: GameEventType = { type: "indexProgress", state: "monster" };
let indexProgressBar_player: GameEventType = { type: "indexProgress", state: "player" };
let indexProgressBar_cardPool: GameEventType = { type: "indexProgress", state: "purchase" };
let indexProgressBar_mDamage: GameEventType = { type: "indexProgress", state: "damage" };
let indexProgressBar_EndTurn: GameEventType = { type: "indexProgress", state: "endturn" };
let indexProgressBar_reset: GameEventType = { type: "resetTimebar" };
let lose1Health: GameEventType = { type: "lowerhealth", value: 1 };
let lose2Health: GameEventType = { type: "lowerhealth", value: 2 };
let gain1Health: GameEventType = { type: "raisehealth", value: 1 };
let gain2Health: GameEventType = { type: "raisehealth", value: 2 };
let addAttack1: GameEventType = { type: "showAttackAnimation", value: 1, message: "add" };
let addAttack2: GameEventType = { type: "showAttackAnimation", value: 2, message: "add" };
let addCoin2: GameEventType = { type: "showCoinAnimation", value: 2, message: "add" };
let addCoin1: GameEventType = { type: "showCoinAnimation", value: 1, message: "add" };
let healOthers: GameEventType = { type: "healOthers", value: 1 };
let dealCards: GameEventType = { type: "dealCards" };
let clearscreen: GameEventType = { type: "clearscreen" };
let startScreen: GameEventType = { type: "startBanner" };
let nextRound: GameEventType = { type: "nextRound" };

let showStartTurn: GameEventType = { type: "showStartTurn" };
let setPlayerBloom: GameEventType = { type: "setBloom" };
let hideNavButton: GameEventType = { type: "hideNavButton" };
let showNavBar: GameEventType = { type: "showNavBar" };
let hideNavbar: GameEventType = { type: "hideNavBar" };
let dealTD: GameEventType = { type: "dealTD" };
let playerPassives: GameEventType = { type: "pPassives" };
let updateStatusEffects: GameEventType = { type: "statEffects" };
let highlightTD: GameEventType = { type: "TDbloom" };
let hideTDcard: GameEventType = { type: "hideTD" };
let enablemonsters: GameEventType = { type: "enableMonsters" };
let playerDamage: GameEventType = { type: "damageFlash" };
let playerHeal: GameEventType = { type: "healFlash" };
let locationDamage: GameEventType = { type: "locationFlash" };
let locationHeal: GameEventType = { type: "locationHealFlash" };
let highlightMonsters: GameEventType = { type: "bloomMonsters" };
let unBloomMonster: GameEventType = { type: "unbloomMonster" };
let promptPlayersHand: GameEventType = { type: "prompt_playerHand" };
let showPlayerHand: GameEventType = { type: "show_playerHand" };
let drawCard: GameEventType = { type: "draw" };
let drawCard2: GameEventType = { type: "draw2" };
let choose_Atk1Coin1: GameEventType = { type: "handChoiceAttack1Ability1" };
let choose_Health1Coin1: GameEventType = { type: "handChoiceHealth1Ability1" };
let choose_Atk1Draw1: GameEventType = { type: "handChoiceAtk1Draw1" };
let choose_Coin1Draw1: GameEventType = { type: "handChoiceCoin1Draw1" };
let choose_Health1Draw1: GameEventType = { type: "handChoiceHealth1Draw1" };
let hidePlayerHand: GameEventType = { type: "hideHand" };
let chooseOtherPlayerToHeal: GameEventType = { type: "otherplayerheal" };
let chooseAnyPlayerToHeal: GameEventType = { type: "anyplayerheal" };
let chooseAnyPlayerToCoin: GameEventType = { type: "anyplayercoin" };
let discard1card: GameEventType = { type: "discard1" };
let raisep1health: GameEventType = { type: "raiseOtherhealth1", value: 0 };
let raisep2health: GameEventType = { type: "raiseOtherhealth1", value: 1 };
let raisep3health: GameEventType = { type: "raiseOtherhealth1", value: 2 };
let raisep4health: GameEventType = { type: "raiseOtherhealth1", value: 3 };
let flashp1: GameEventType = { type: "otherHealthFlash", value: 0 };
let flashp2: GameEventType = { type: "otherHealthFlash", value: 1 };
let flashp3: GameEventType = { type: "otherHealthFlash", value: 2 };
let flashp4: GameEventType = { type: "otherHealthFlash", value: 3 };
let refreshPlayerHand: GameEventType = { type: "handRefresh" };
let raisep1Coin: GameEventType = { type: "otherCoinAdd", value: 0 };
let raisep2Coin: GameEventType = { type: "otherCoinAdd", value: 1 };
let raisep3Coin: GameEventType = { type: "otherCoinAdd", value: 2 };
let raisep4Coin: GameEventType = { type: "otherCoinAdd", value: 3 };
let showCardPoolEnable: GameEventType = { type: "prompt_CardPool" };
let openCardPool: GameEventType = { type: "openCardPool" };
let buycard: GameEventType = { type: "buyCardfromPool" };
let closeCardPool: GameEventType = { type: "closeCardPool" };
let enableMonsterDamage: GameEventType = { type: "enableMonster" };
let checkforCoins: GameEventType = { type: "checkCoins" };
let checkforAttack: GameEventType = { type: "checkForAttackPoints" };
let enableEndTurn: GameEventType = { type: "promptForEndTurn" };
let damagemonster: GameEventType = { type: "applyDamage" };
let clearSe0: GameEventType = { type: "clearStatusEffects", value: 0 };
let clearSe1: GameEventType = { type: "clearStatusEffects", value: 1 };
let clearSe2: GameEventType = { type: "clearStatusEffects", value: 2 };
let clearSe3: GameEventType = { type: "clearStatusEffects", value: 3 };
let showMonster: GameEventType = { type: "monsterChange", message: "show" };
let hideMonster: GameEventType = { type: "monsterChange", message: "hide" };
let gameoverwin: GameEventType = { type: "Endbanner", message: "VICTORY" };
let gameoverlose: GameEventType = { type: "Endbanner", message: "FAILURE, TRY AGAIN" };

let hideloc: GameEventType = { type: "hidelocation" };
let shownewloc: GameEventType = { type: "showlocation" };
let showLocationToast: GameEventType = { type: "toastLocationCurse" };
let showDrawToast: GameEventType = { type: "toastDrawCurse" };
let showDiscardCurseToast: GameEventType = { type: "toastDiscardCurse" };
let returnToLogin: GameEventType = { type: "resetGame" };
let dimPlayer: GameEventType = { type: "dimplayer" };
let setPlayerback0: GameEventType = { type: "reset", value: 0 };
let setPlayerback1: GameEventType = { type: "reset", value: 1 };
let setPlayerback2: GameEventType = { type: "reset", value: 2 };
let setPlayerback3: GameEventType = { type: "reset", value: 3 };

let hideCursor: GameEventType = { type: "hidecursor" };
let showCursor: GameEventType = { type: "showcursor" };
let setState: GameEventType = { type: "startsequence" };

type GameEventSequence = {
  sequence: GameEventType[];
};

export let damageMonster: GameEventSequence = { sequence: [damagemonster] };
export let startSetupSeq: GameEventSequence = { sequence: [clearscreen] };
export let startSequence: GameEventSequence = {
  sequence: [setState, startScreen, dealCards, showStartTurn, setPlayerBloom],
};
export let startTurn: GameEventSequence = {
  sequence: [hideNavButton, shortdelay, showNavBar, shortdelay, dealTD, showCursor, shortdelay, playerPassives],
};
export let passives: GameEventSequence = {
  sequence: [hideNavButton, shortdelay, indexProgressBar_passive, shortdelay, highlightTD],
};
export let updateStatEffects: GameEventSequence = { sequence: [updateStatusEffects, shortdelay] };
export let lowerHealth1: GameEventSequence = { sequence: [playerDamage, lose1Health, shortdelay, refreshPlayerHand] };
export let raiseHealth2: GameEventSequence = { sequence: [playerHeal, gain2Health, shortdelay, refreshPlayerHand] };
export let raiseHealth1: GameEventSequence = { sequence: [playerHeal, gain1Health, shortdelay, refreshPlayerHand] };
export let lowerHealth2: GameEventSequence = { sequence: [playerDamage, lose2Health, shortdelay, refreshPlayerHand] };
export let hideTD: GameEventSequence = {
  sequence: [hideTDcard, shortdelay, indexProgressBar_td, shortdelay, enablemonsters],
};
export let locDamage: GameEventSequence = { sequence: [locationDamage] };
export let bloomMonsters: GameEventSequence = { sequence: [highlightMonsters] };
export let skipMonsters: GameEventSequence = {
  sequence: [shortdelay, indexProgressBar_monster, shortdelay, promptPlayersHand],
};
export let MonsterPlayed: GameEventSequence = {
  sequence: [unBloomMonster, shortdelay, indexProgressBar_monster, promptPlayersHand],
};
export let playerHandShow: GameEventSequence = { sequence: [shortdelay, showPlayerHand] };
export let add1Attack: GameEventSequence = { sequence: [addAttack1, refreshPlayerHand] };
export let add2Attack: GameEventSequence = { sequence: [addAttack2, refreshPlayerHand] };
export let add1Coin: GameEventSequence = { sequence: [addCoin1, refreshPlayerHand] };
export let add2Coin: GameEventSequence = { sequence: [addCoin2, refreshPlayerHand] };
export let drawNewCard: GameEventSequence = { sequence: [drawCard, refreshPlayerHand] };
export let draw2NewCard: GameEventSequence = { sequence: [drawCard2, refreshPlayerHand] };
export let healOthers1: GameEventSequence = { sequence: [healOthers, refreshPlayerHand] };
export let remove1Location: GameEventSequence = { sequence: [locationHeal, refreshPlayerHand] };
export let chooseAtk1Coin1: GameEventSequence = { sequence: [choose_Atk1Coin1, refreshPlayerHand] };
export let chooseHealth1Coin1: GameEventSequence = { sequence: [choose_Health1Coin1, refreshPlayerHand] };
export let chooseAtk1Draw1: GameEventSequence = { sequence: [choose_Atk1Draw1, refreshPlayerHand] };
export let chooseCoin1Draw1: GameEventSequence = { sequence: [choose_Coin1Draw1, refreshPlayerHand] };
export let chooseHealth1Draw1: GameEventSequence = { sequence: [choose_Health1Draw1, refreshPlayerHand] };
export let playerHandDone: GameEventSequence = {
  sequence: [hidePlayerHand, shortdelay, indexProgressBar_player, shortdelay, showCardPoolEnable],
};
export let otherPlayer1Health: GameEventSequence = { sequence: [chooseOtherPlayerToHeal, refreshPlayerHand] };
export let anyPlayer1Health: GameEventSequence = { sequence: [chooseAnyPlayerToHeal, refreshPlayerHand] };
export let discard1: GameEventSequence = { sequence: [discard1card, refreshPlayerHand] };
export let p1Health1: GameEventSequence = { sequence: [raisep1health, flashp1, refreshPlayerHand] };
export let p2Health1: GameEventSequence = { sequence: [raisep2health, flashp2, refreshPlayerHand] };
export let p3Health1: GameEventSequence = { sequence: [raisep3health, flashp3, refreshPlayerHand] };
export let p4Health1: GameEventSequence = { sequence: [raisep4health, flashp4, refreshPlayerHand] };
export let refreshHand: GameEventSequence = { sequence: [refreshPlayerHand] };
export let anyPlayer1Coin: GameEventSequence = { sequence: [chooseAnyPlayerToCoin, refreshPlayerHand] };
export let p1Coin1: GameEventSequence = { sequence: [raisep1Coin, refreshPlayerHand] };
export let p2Coin1: GameEventSequence = { sequence: [raisep2Coin, refreshPlayerHand] };
export let p3Coin1: GameEventSequence = { sequence: [raisep3Coin, refreshPlayerHand] };
export let p4Coin1: GameEventSequence = { sequence: [raisep4Coin, refreshPlayerHand] };
export let showCardPool: GameEventSequence = { sequence: [openCardPool, shortdelay, checkforCoins] };
export let cardpurchased: GameEventSequence = { sequence: [shortdelay, buycard] };
export let hideCardpool: GameEventSequence = {
  sequence: [shortdelay, shortdelay, closeCardPool, shortdelay, indexProgressBar_cardPool, shortdelay, enableMonsterDamage],
};
export let enablemonsterDamage: GameEventSequence = { sequence: [checkforAttack, highlightMonsters] };
export let readyToEndTurn: GameEventSequence = { sequence: [indexProgressBar_mDamage, enableEndTurn] };

export let endturn: GameEventSequence = {
  sequence: [
    indexProgressBar_EndTurn,
    shortdelay,
    hideCursor,
    indexProgressBar_reset,
    shortdelay,
    hideNavbar,
    nextRound,
    dealCards,
    showCursor,
  ],
};
export let clearSE0: GameEventSequence = { sequence: [clearSe0] };
export let clearSE1: GameEventSequence = { sequence: [clearSe1] };
export let clearSE2: GameEventSequence = { sequence: [clearSe2] };
export let clearSE3: GameEventSequence = { sequence: [clearSe3] };

export let ChangeMonster: GameEventSequence = { sequence: [hideMonster, shortdelay, showMonster] };
export let winGameOver: GameEventSequence = { sequence: [gameoverwin, clearscreen, returnToLogin] };
export let loseGameOver: GameEventSequence = { sequence: [gameoverlose, clearscreen, returnToLogin] };
export let hideLocation: GameEventSequence = { sequence: [hideloc] };
export let showNewLocation: GameEventSequence = { sequence: [shortdelay, shownewloc] };
export let sendToastLocation: GameEventSequence = { sequence: [showLocationToast] };
export let sendToastDrawBlocked: GameEventSequence = { sequence: [showDrawToast] };
export let sendToastDiscardCurse: GameEventSequence = { sequence: [showDiscardCurseToast] };
export let stunnedPlayer: GameEventSequence = {
  sequence: [dimPlayer, refreshPlayerHand, updateStatusEffects, locationDamage],
};
export let resetPlayer0: GameEventSequence = { sequence: [setPlayerback0] };
export let resetPlayer1: GameEventSequence = { sequence: [setPlayerback1] };
export let resetPlayer2: GameEventSequence = { sequence: [setPlayerback2] };
export let resetPlayer3: GameEventSequence = { sequence: [setPlayerback3] };

class GameEvent {
  state: any;
  optParam: number;
  event: GameEventType;
  constructor(event: GameEventType, optParam?: number) {
    this.event = event;
    optParam ? (this.optParam = optParam) : (this.optParam = -1);
  }

  handChoiceAttack1Ability1(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    const username = this.state.gameData.Players[usr].name;
    const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
    if (myTurn) {
      this.state.myNavInput.contZ = "17";
      this.state.myNavInput.contWidth = "250";

      this.state.myNavInput.buttons = [
        {
          label: "Attack +1",
          action: () => {
            utils.userResponse({
              Callback: "chooseAttack1Ability1",
              Response: "Attack",
            });
            this.state.myNavInput.isVisible = false;
            this.state.myNavInput.contTop = "55%";
            this.state.myNavInput.contWidth = "190";
            this.state.myNavInput.contZ = "15";
            this.state.myNavInput.buttons = [];
            clearIsChoiceFlag();
          },
          unaction: () => {},
          style: "",
        },
        {
          label: "Coin +1",
          action: () => {
            utils.userResponse({
              Callback: "chooseAttack1Ability1",
              Response: "Coin",
            });
            this.state.myNavInput.isVisible = false;
            this.state.myNavInput.contTop = "55%";
            this.state.myNavInput.contWidth = "190";
            this.state.myNavInput.contZ = "15";
            this.state.myNavInput.buttons = [];
            clearIsChoiceFlag();
          },
          unaction: () => {},
          style: "",
        },
      ];

      this.state.myNavInput.contTop = "25%";
      this.state.myNavInput.isVisible = true;
    }
    resolve();
  }

  handChoiceCoin1Draw1(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    const username = this.state.gameData.Players[usr].name;
    const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
    if (myTurn) {
      this.state.myNavInput.contZ = "17";
      this.state.myNavInput.contWidth = "250";
      this.state.myNavInput.buttons = [
        {
          label: "Coin +1",
          action: () => {
            utils.userResponse({
              Callback: "chooseAbility1Draw1",
              Response: "Coin",
            });
            this.state.myNavInput.isVisible = false;
            this.state.myNavInput.contTop = "55%";
            this.state.myNavInput.contWidth = "190";
            this.state.myNavInput.buttons = [];
            this.state.myNavInput.contZ = "15";
            clearIsChoiceFlag();
          },
          unaction: () => {},
          style: "",
        },
        {
          label: "Draw 1",
          action: () => {
            utils.userResponse({
              Callback: "chooseAbility1Draw1",
              Response: "draw",
            });
            this.state.myNavInput.isVisible = false;
            this.state.myNavInput.contTop = "55%";
            this.state.myNavInput.contWidth = "190";
            this.state.myNavInput.buttons = [];
            this.state.myNavInput.contZ = "15";
            clearIsChoiceFlag();
          },
          unaction: () => {},
          style: "",
        },
      ];
      this.state.myNavInput.contTop = "25%";
      this.state.myNavInput.isVisible = true;
    }
    resolve();
  }

  startsequence(resolve) {
    if (this.state.myContainer.myRoute != Router.Game) {
      console.log("adding players");
      this.state.gameData.Players.forEach((p, i) => {
        this.state.mypUI.allPlayers.push(
          new Character({
            name: p.name,
            role: p.role,
            index: i,
            gender: p.gender,
            bloomStatus: "",
            statusEffects: p.statusEffects,
          })
        );
      });
      this.state.myContainer.screenSwitch(Router.Game);
      utils.playGameMusic();
    }
    resolve();
  }

  enableMonster(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    const username = this.state.gameData.Players[usr].name;
    const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;

    if (myTurn) {
      this.state.myNavInput.buttons = [];
      this.state.myNavInput.buttons.push({
        label: "Apply Damage",
        action: (event, model, element) => {
          utils.enableMonsterDamage();
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

  handChoiceAtk1Draw1(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    const username = this.state.gameData.Players[usr].name;
    const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
    if (myTurn) {
      this.state.myNavInput.contZ = "17";
      this.state.myNavInput.contWidth = "250";
      this.state.myNavInput.buttons = [
        {
          label: "Attack +1",
          action: () => {
            utils.userResponse({
              Callback: "chooseAttack1Draw1",
              Response: "Attack",
            });
            this.state.myNavInput.isVisible = false;
            this.state.myNavInput.contTop = "55%";
            this.state.myNavInput.contWidth = "190";
            this.state.myNavInput.contZ = "15";
            this.state.myNavInput.buttons = [];
            clearIsChoiceFlag();
          },
          unaction: () => {},
          style: "",
        },
        {
          label: "Draw 1",
          action: () => {
            utils.userResponse({
              Callback: "chooseAttack1Draw1",
              Response: "draw",
            });
            this.state.myNavInput.isVisible = false;
            this.state.myNavInput.contZ = "15";
            this.state.myNavInput.contTop = "55%";
            this.state.myNavInput.contWidth = "190";
            this.state.myNavInput.buttons = [];
            clearIsChoiceFlag();
          },
          unaction: () => {},
          style: "",
        },
      ];
      this.state.myNavInput.contTop = "25%";
      this.state.myNavInput.isVisible = true;
    }
    resolve();
  }

  handChoiceHealth1Draw1(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    const username = this.state.gameData.Players[usr].name;
    const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
    if (myTurn) {
      this.state.myNavInput.contZ = "17";
      this.state.myNavInput.contWidth = "250";
      this.state.myNavInput.buttons = [
        {
          label: "Health +1",
          action: () => {
            utils.userResponse({
              Callback: "chooseHealth1Draw1",
              Response: "Health",
            });
            this.state.myNavInput.isVisible = false;
            this.state.myNavInput.contZ = "15";
            this.state.myNavInput.contWidth = "190";
            this.state.myNavInput.contTop = "55%";
            this.state.myNavInput.buttons = [];
            clearIsChoiceFlag();
          },
          unaction: () => {},
          style: "",
        },
        {
          label: "Draw 1",
          action: () => {
            utils.userResponse({
              Callback: "chooseHealth1Draw1",
              Response: "draw",
            });
            this.state.myNavInput.isVisible = false;
            this.state.myNavInput.contZ = "15";
            this.state.myNavInput.contWidth = "190";
            this.state.myNavInput.contTop = "55%";
            this.state.myNavInput.buttons = [];
            clearIsChoiceFlag();
          },
          unaction: () => {},
          style: "",
        },
      ];
      this.state.myNavInput.contTop = "25%";
      this.state.myNavInput.isVisible = true;
    }
    resolve();
  }

  openCardPool(resolve) {
    utils.playSound("mailSend");
    this.state.myGame.showModal = true;
    resolve();
  }

  anyplayerheal(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });

    const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
    if (myTurn) {
      this.state.myNavInput.contZ = "17";

      this.state.myNavInput.buttons = [];
      const numPlayers = this.state.gameData.Players;
      this.state.myNavInput.contWidth = `${190 * numPlayers}`;
      this.state.gameData.Players.forEach(p => {
        this.state.myNavInput.buttons.push({
          label: `${p.name}`,
          action: () => {
            utils.userResponse({
              Callback: "addHealth1anyPlayer",
              Response: `${p.name}`,
            });
            this.state.myNavInput.isVisible = false;
            this.state.myNavInput.contTop = "55%";
            this.state.myNavInput.contWidth = "190";
            this.state.myNavInput.contZ = "15";
            this.state.myNavInput.buttons = [];
            clearIsChoiceFlag();
          },
          unaction: () => {},
          style: "",
        });
      });
      this.state.myNavInput.contTop = "25%";
      this.state.myNavInput.isVisible = true;
    }
    resolve();
  }

  anyplayercoin(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });

    const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
    if (myTurn) {
      this.state.myNavInput.contZ = "17";
      const numPlayers = this.state.gameData.Players.length;
      this.state.myNavInput.contWidth = `${190 * numPlayers}`;
      this.state.myNavInput.buttons = [];
      this.state.gameData.Players.forEach(p => {
        this.state.myNavInput.buttons.push({
          label: `${p.name}`,
          action: () => {
            utils.userResponse({
              Callback: "addCoin1anyPlayer",
              Response: `${p.name}`,
            });
            this.state.myNavInput.isVisible = false;
            this.state.myNavInput.contZ = "15";
            this.state.myNavInput.contWidth = "190";
            this.state.myNavInput.contTop = "55%";
            this.state.myNavInput.buttons = [];
            clearIsChoiceFlag();
          },
          unaction: () => {},
          style: "",
        });
      });
      this.state.myNavInput.contTop = "25%";
      this.state.myNavInput.isVisible = true;
    }
    resolve();
  }

  otherplayerheal(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    const username = this.state.gameData.Players[usr].name;
    const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
    if (myTurn) {
      this.state.myNavInput.contZ = "17";
      const listOfOtherPlayers = this.state.gameData.Players.filter((p, i) => i != usr);
      const numOtherPlayers = listOfOtherPlayers.length;
      this.state.myNavInput.contWidth = `${numOtherPlayers * 190}`;
      this.state.myNavInput.buttons = [];
      listOfOtherPlayers.forEach(p => {
        this.state.myNavInput.buttons.push({
          label: `${p.name}`,
          action: () => {
            utils.userResponse({
              Callback: "addHealth1anyPlayer",
              Response: `${p.name}`,
            });
            this.state.myNavInput.isVisible = false;
            this.state.myNavInput.contZ = "15";
            this.state.myNavInput.contTop = "55%";
            this.state.myNavInput.contWidth = "190";
            this.state.myNavInput.buttons = [];
            clearIsChoiceFlag();
          },
          unaction: () => {},
          style: "",
        });
      });
      this.state.myNavInput.contTop = "25%";
      this.state.myNavInput.isVisible = true;
    }
    resolve();
  }

  handChoiceHealth1Ability1(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    const username = this.state.gameData.Players[usr].name;
    const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
    if (myTurn) {
      this.state.myNavInput.contZ = "17";
      this.state.myNavInput.contWidth = "250";
      this.state.myNavInput.buttons = [
        {
          label: "Health +1",
          action: () => {
            utils.userResponse({
              Callback: "chooseHealth1Ability1",
              Response: "Health",
            });
            this.state.myNavInput.isVisible = false;
            this.state.myNavInput.contZ = "15";
            this.state.myNavInput.contTop = "55%";
            this.state.myNavInput.contWidth = "190";
            this.state.myNavInput.buttons = [];
            clearIsChoiceFlag();
          },
          unaction: () => {},
          style: "",
        },
        {
          label: "Coin +1",
          action: () => {
            utils.userResponse({
              Callback: "chooseHealth1Ability1",
              Response: "Coin",
            });
            this.state.myNavInput.isVisible = false;
            this.state.myNavInput.contZ = "15";
            this.state.myNavInput.contTop = "55%";
            this.state.myNavInput.contWidth = "190";
            this.state.myNavInput.buttons = [];
            clearIsChoiceFlag();
          },
          unaction: () => {},
          style: "",
        },
      ];

      this.state.myNavInput.contTop = "25%";
      this.state.myNavInput.isVisible = true;
    }
    resolve();
  }

  dimplayer(resolve) {
    console.log("dimmed");
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    this.state.mypUI.allPlayers[usr].stunStatus = " pui_stundim";
    this.state.mypUI.allPlayers[usr].zeroHealth();
    this.state.myToast.addToast("user", "PLAYER STUNNED!");
    resolve();
  }

  monsterChange(resolve) {
    if (this.event.message == "hide") {
      this.state.myMonster.isVisible = false;
      utils.playSound("cry");
      utils.playSound("die");
    } else if (this.event.message == "show") {
      this.state.myToast.addToast("monster", "New Monster Appears");
      this.state.myMonster.isVisible = true;
    }
    resolve();
  }

  statEffects(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    const username = this.state.gameData.Players[usr].name;
    const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;

    utils.playSound("statuseffect");
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

  discard1(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
    if (myTurn && this.state.gameData.Players[usr].hand.length > 0) {
      this.state.myNavInput.contZ = "17";
      this.state.myNavInput.buttons = [];
      const numCards = this.state.myHand.hand.length;
      this.state.myNavInput.contWidth = `${numCards * 190}`;
      this.state.myHand.hand.forEach(c => {
        this.state.myNavInput.buttons.push({
          label: `${c.title}`,
          action: () => {
            utils.userResponse({
              Callback: "discard",
              Response: `${c.id}`,
            });
            this.state.myNavInput.isVisible = false;
            this.state.myNavInput.contZ = "15";
            this.state.myNavInput.contTop = "55%";
            this.state.myNavInput.contWidth = `190`;
            this.state.myNavInput.buttons = [];
            clearIsChoiceFlag();
          },
          unaction: () => {},
          style: "",
        });
      });
      this.state.myNavInput.contTop = "25%";
      this.state.myNavInput.isVisible = true;
    }
    resolve();
  }

  healOthers(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    const username = this.state.gameData.Players[usr].name;
    const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
    if (myTurn) {
      const listOfOtherPlayers = this.state.gameData.Players.filter((p, i) => i != usr);
      listOfOtherPlayers.forEach(p => {
        p.addHealth(this.event.value);
        p.bloomStatus = p.bloomStatus + " playerHeal";
      });
    }
    resolve();
  }

  otherCoinAdd(resolve) {
    const usr = this.event.value;
    console.log("made it here, usr: ", usr);

    this.state.mypUI.allPlayers[usr].coinPlacard.color = "limegreen";
    this.state.mypUI.allPlayers[usr].coinPlacard.text = `+1`;

    this.state.mypUI.allPlayers[usr].coinPlacard.isVisible = true;
    const mInt = setInterval(() => {
      this.state.mypUI.allPlayers[usr].coinPlacard.offset -= 2;
      if (this.state.mypUI.allPlayers[usr].coinPlacard.offset < -15) {
        this.state.mypUI.allPlayers[usr].coinPlacard.opacity -= 0.05;
      }

      if (this.state.mypUI.allPlayers[usr].coinPlacard.offset <= -50) {
        clearInterval(mInt);
        this.state.mypUI.allPlayers[usr].coinPlacard.offset = 0;
        this.state.mypUI.allPlayers[usr].coinPlacard.opacity = 1;
        this.state.mypUI.allPlayers[usr].coinPlacard.isVisible = false;
      }
    }, 30);
    resolve();
  }

  prompt_CardPool(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    const username = this.state.gameData.Players[usr].name;
    const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
    if (myTurn) {
      this.state.myNavInput.buttons = [];
      this.state.myNavInput.buttons.push({
        label: "Open Card Pool",
        action: (event, model, element) => {
          const canbuy = this.checkCoins();
          if (canbuy) {
            utils.showCardPool();
            utils.playSound("button");
          } else {
            utils.playSound("buzzer");
            utils.doneBuyingCards();
            this.state.myNavInput.isVisible = false;
            this.state.myToast.addToast("card", "Not enough coins to buy cards");
          }
        },
        unaction: (event, model, element) => {},
        style: "",
      });
      this.state.myNavInput.isVisible = true;
    } else {
    }
    resolve();
  }

  checkCoins() {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    const username = this.state.gameData.Players[usr].name;
    const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;

    //if player doesn't have enough money...
    //can player afford any more cards

    const remainingFunds = this.state.gameData.Players[usr].coin;
    const newGroupOfBuyableCards = [
      this.state.gameData.cardPool[0],
      this.state.gameData.cardPool[1],
      this.state.gameData.cardPool[2],
      this.state.gameData.cardPool[3],
      this.state.gameData.cardPool[4],
      this.state.gameData.cardPool[5],
    ];

    const canBuy = newGroupOfBuyableCards.some(c => {
      return remainingFunds >= c.cost;
    });

    return canBuy;
  }

  resetTimebar(resolve) {
    this.state.myNavBar.resetTimeline();
    resolve();
  }

  reset(resolve) {
    const usr = this.event.value;
    console.log("resetting player", usr);
    this.state.mypUI.allPlayers[usr].resetHealth();
    resolve();
  }

  buyCardfromPool(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    const username = this.state.gameData.Players[usr].name;
    const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;

    //can player afford any more cards

    const remainingFunds = this.state.gameData.Players[usr].coin;
    const newGroupOfBuyableCards = [
      this.state.gameData.cardPool[0],
      this.state.gameData.cardPool[1],
      this.state.gameData.cardPool[2],
      this.state.gameData.cardPool[3],
      this.state.gameData.cardPool[4],
      this.state.gameData.cardPool[5],
    ];

    const canBuy = newGroupOfBuyableCards.some(c => {
      return remainingFunds >= c.cost;
    });
    utils.playSound("buy");
    console.log(`purchase test result: ${canBuy}`);
    if (!canBuy) {
      utils.doneBuyingCards();
    }
    resolve();
  }

  closeCardPool(resolve) {
    this.state.myGame.showModal = false;
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
    resolve();
  }
  draw2(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
    if (myTurn) {
      //grab card from state
      const lastcardindex = this.state.gameData.Players[usr].hand.length;
      const newCard1 = this.state.gameData.Players[usr].hand[lastcardindex - 1];
      const newCard2 = this.state.gameData.Players[usr].hand[lastcardindex - 2];

      //update current hand
      switch (usr) {
        case 0:
          this.state.myHand.player1Hand.push(newCard1);
          this.state.myHand.player1Hand.push(newCard2);
          break;
        case 1:
          this.state.myHand.player2Hand.push(newCard1);
          this.state.myHand.player2Hand.push(newCard2);
          break;
        case 2:
          this.state.myHand.player3Hand.push(newCard1);
          this.state.myHand.player3Hand.push(newCard2);
          break;
        case 3:
          this.state.myHand.player4Hand.push(newCard1);
          this.state.myHand.player4Hand.push(newCard2);
          break;
      }
      this.state.myHand.hand.push(newCard1);
      this.state.myHand.hand.push(newCard2);
    }
    resolve();
  }

  hidelocation(resolve) {
    this.state.location.isVisible = false;
    resolve();
  }

  showlocation(resolve) {
    this.state.location.isVisible = true;
    resolve();
  }

  toastLocationCurse(resolve) {
    this.state.myToast.addToast("location", "Location Curse Active");
    resolve();
  }

  toastDrawCurse(resolve) {
    this.state.myToast.addToast("card", "Player Draw Blocked");
    resolve();
  }
  toastDiscardCurse(resolve) {
    this.state.myToast.addToast("user", "Discard Curse Active");
    resolve();
  }

  promptForEndTurn(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    const username = this.state.gameData.Players[usr].name;
    const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
    if (myTurn) {
      this.state.myNavInput.buttons = [];
      this.state.myNavInput.buttons.push({
        label: "End Turn?",
        action: (event, model, element) => {
          utils.endTurn();
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

  draw(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });

    const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
    if (myTurn) {
      //grab card from state
      const lastcardindex = this.state.gameData.Players[usr].hand.length;
      const newCard = this.state.gameData.Players[usr].hand[lastcardindex - 1];

      utils.playSound("playCard");

      //update current hand
      switch (usr) {
        case 0:
          this.state.myHand.player1Hand.push(newCard);
          break;
        case 1:
          this.state.myHand.player2Hand.push(newCard);
          break;
        case 2:
          this.state.myHand.player3Hand.push(newCard);
          break;
        case 3:
          this.state.myHand.player4Hand.push(newCard);
          break;
      }
      this.state.myHand.hand.push(newCard);
    }
    resolve();
  }

  hidecursor(resolve) {
    this.state.mypUI.allPlayers.forEach(p => (p.myTurn = false));
    resolve();
  }

  showcursor(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    console.log("setting cursor:", usr);
    this.state.mypUI.allPlayers[usr].myTurn = true;
    resolve();
  }

  show_playerHand(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    const username = this.state.gameData.Players[usr].name;

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
    const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;
    this.state.myHand.isEmpty = myTurn && this.state.myHand.hand.length == 0;
    if (this.state.myHand.hand.length != 0) this.state.myHand.isVisible = true;
    //make cards clickable
    resolve();
  }

  showCoinAnimation(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });

    utils.playSound("coin");
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
      if (this.state.mypUI.allPlayers[usr].coinPlacard.offset < -15) {
        this.state.mypUI.allPlayers[usr].coinPlacard.opacity -= 0.05;
      }

      if (this.state.mypUI.allPlayers[usr].coinPlacard.offset <= -50) {
        clearInterval(mInt);
        this.state.mypUI.allPlayers[usr].coinPlacard.offset = 0;
        this.state.mypUI.allPlayers[usr].coinPlacard.opacity = 1;
        this.state.mypUI.allPlayers[usr].coinPlacard.isVisible = false;
      }
    }, 30);
    resolve();
  }

  checkForAttackPoints(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    isAttackPointsZero = this.state.gameData.Players[usr].attack == 0;
    if (isAttackPointsZero) {
      utils.monsterDamageDone();
    }
    resolve();
  }

  handRefresh(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });

    switch (usr) {
      case 0:
        this.state.myHand.player1Hand = [...this.state.gameData.Players[usr].hand];
        break;
      case 1:
        this.state.myHand.player2Hand = [...this.state.gameData.Players[usr].hand];
        break;
      case 2:
        this.state.myHand.player3Hand = [...this.state.gameData.Players[usr].hand];
        break;
      case 3:
        this.state.myHand.player4Hand = [...this.state.gameData.Players[usr].hand];
        break;
    }
    this.state.myHand.hand = [...this.state.gameData.Players[usr].hand];
    resolve();
  }

  showAttackAnimation(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });

    utils.playSound("gainAtk");

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
      if (this.state.mypUI.allPlayers[usr].attackPlacard.offset < -15) {
        this.state.mypUI.allPlayers[usr].attackPlacard.opacity -= 0.05;
      }

      if (this.state.mypUI.allPlayers[usr].attackPlacard.offset <= -50) {
        clearInterval(mInt);
        this.state.mypUI.allPlayers[usr].attackPlacard.offset = 0;
        this.state.mypUI.allPlayers[usr].attackPlacard.opacity = 1;
        this.state.mypUI.allPlayers[usr].attackPlacard.isVisible = false;
      }
    }, 30);
    resolve();
  }

  Endbanner(resolve) {
    this.state.myMessageOverlay.mainMessage = "GAME OVER";
    this.state.myMessageOverlay.subMessage = this.event.message;
    this.state.myMessageOverlay.isVisble = true;
    setTimeout(() => {
      this.state.myMessageOverlay.isVisble = false;
      resolve();
    }, 5000);
  }

  damageFlash(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    this.state.mypUI.allPlayers[usr].bloomStatus = this.state.mypUI.allPlayers[usr].bloomStatus + " playerdamage";
    resolve();
  }

  hideHand(resolve) {
    this.state.myHand.isVisible = false;
    resolve();
  }

  healFlash(resolve) {
    utils.playSound("healing");
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    this.state.mypUI.allPlayers[usr].bloomStatus = this.state.mypUI.allPlayers[usr].bloomStatus + " playerHeal";
    resolve();
  }

  locationFlash(resolve) {
    this.state.myLocation.addPoint(1, this.state);
    utils.playSound("crash");
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

    const mediaIndex = Math.floor(Math.random() * 3);
    utils.playSound(`dmg${mediaIndex}`);

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

  raiseOtherhealth1(resolve) {
    this.state.mypUI.allPlayers[this.event.value].addHealth(1);
    resolve();
  }

  otherHealthFlash(resolve) {
    const index = this.event.value;
    this.state.mypUI.allPlayers[index].bloomStatus = this.state.mypUI.allPlayers[index].bloomStatus + " playerHeal";
    resolve();
  }

  clearStatusEffects(resolve) {
    clearIsChoiceFlag();

    const usr = this.event.value;
    this.state.mypUI.allPlayers[usr].stunStatus = "";
    this.state.mypUI.allPlayers[usr].clearStatusMessages();
    resolve();
  }

  applyDamage(resolve) {
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });

    const mediaIndex = Math.floor(Math.random() * 3);
    if (this.state.gameData.activeMonsters[0].damage != this.state.gameData.activeMonsters[0].health)
      utils.playSound(`atk${mediaIndex}`);
    //showanimation
    this.state.myMonster.addAttack();

    // add locationdamage css to monster card
    const existingString = this.state.myMonster.cssString;
    this.state.myMonster.cssString = existingString + " playerdamage";
    setTimeout(() => {
      this.state.myMonster.cssString = existingString;
      if (this.state.gameData.Players[usr].attack == 0) {
        console.log(`attack empty`);
        this.state.myMonster.cssString = "";
        utils.monsterDamageDone();
      }
      resolve();
    }, 1000);
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
    if (isAttackPointsZero && RoundState.activeApplyingDamage) return;
    const usr = this.state.gameData.Players.findIndex(p => {
      return this.state.gameData.turn === p.id;
    });
    const myTurn = this.state.gameData.Players[usr].id == this.state.playerData.id;

    if (myTurn) {
      this.state.myMonster.cssString = " td_bloom td_clickable nohover";
    } else {
      this.state.myMonster.cssString = " td_bloom";
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

  hideNavBar(resolve) {
    this.state.myNavBar.showNavBar = false;
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
    resolve();
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
    }, 3000);
  }

  nextRound(resolve) {
    this.state.myMessageOverlay.mainMessage = "Next Turn";
    this.state.myMessageOverlay.subMessage = "";
    this.state.myMessageOverlay.isVisble = true;
    setTimeout(() => {
      this.state.myMessageOverlay.isVisble = false;
      console.log("starting turn");
      utils.startTurn();
      resolve();
    }, 3000);
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

      //0.1.8, skip button press, go straight into passives
      utils.passives();
    }
    /* this.state.myNavInput.buttons = [];
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
    } */
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
          this.state.myNavInput.isVisible = false;
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
    this.state.mypUI.allPlayers[usr].myTurn = true;

    resolve();
  }

  resetGame(resolve) {
    //change screen back to login
    //clear out game data
    this.state.myContainer.screenSwitch(Router.Lobby);
    this.state.gameData.Players = [];
    this.state.gameData.playerIndex = 1;
    this.state.gameData.roundState = 0;
    this.state.gameData.activeMonsters = [];
    this.state.gameData.location = {};
    this.state.gameData.TDcard = {};
    this.state.gameData.cardPool = [];
    this.state.gameData.turn = 0;
    this.state.gameData.turnOrder = [];
    this.state.gameData.gameID = "";

    resolve();
  }

  delay(resolve) {
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
    try {
      await eventHandler.init(state);
    } catch (error) {
      console.log("event loop fault", events.sequence, error);
    }
  }
};
