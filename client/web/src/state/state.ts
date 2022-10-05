import { utils } from "../utils";
import { Router, Card } from "../components";
import { Character } from "../components/character";
import { Gender, MCard, Roles, RoundState } from "../../../../api/types";
import { UpdateArgs } from "../../../.hathora/client";
import {
  add1Attack,
  add1Coin,
  add2Coin,
  bloomMonsters,
  chooseAtk1Coin1,
  chooseAtk1Draw1,
  chooseCoin1Draw1,
  chooseHealth1Coin1,
  chooseHealth1Draw1,
  drawNewCard,
  healOthers1,
  hideTD,
  locDamage,
  lowerHealth1,
  lowerHealth2,
  MonsterPlayed,
  passives,
  playerHandDone,
  playerHandShow,
  raiseHealth1,
  remove1Location,
  skipMonsters,
  startEventSequence,
  startSequence,
  startSetupSeq,
  startTurn,
  updateStatEffects,
} from "../events";

import {
  bmale,
  bfemale,
  wmale,
  wfemale,
  rmale,
  rfemale,
  pmale,
  pfemale,
  userIcon,
  locationIcon,
  monsterIcon,
  cardIcon,
  effectIcon,
  mute,
  unmute,
} from "../assets/assetPool";

//TODO - curses
//STUNNED
//lose location
//defeat monster
//win demo game
//end of turn, next turn
//card pool
//assigning damage to monsters

const MOUSELIMIT = 10;
let mouseCount = 0;
let keybinding = undefined;
let chatDiv;
let controller;

let roleMap = {
  [Roles.Barbarian]: {
    [Gender.Male]: bmale,
    [Gender.Female]: bfemale,
  },
  [Roles.Wizard]: {
    [Gender.Male]: wmale,
    [Gender.Female]: wfemale,
  },
  [Roles.Rogue]: {
    [Gender.Male]: rmale,
    [Gender.Female]: rfemale,
  },
  [Roles.Paladin]: {
    [Gender.Male]: pmale,
    [Gender.Female]: pfemale,
  },
};

export class State {
  state: any;

  constructor() {
    this.state = {
      playerData: {
        username: "",
        name: "",
        id: "",
      },
      gameData: {
        playerIndex: 1,
        Players: [],
        roundState: 0,
        activeMonsters: [],
        location: {},
        TDcard: {},
        cardPool: [],
        turn: 0,
        turnOrder: [],
        gameID: "",
      },
      myContainer: {
        myRoute: Router.Title,
        get isTitle() {
          return this.myRoute === Router.Title;
        },
        get isLobby() {
          return this.myRoute === Router.Lobby;
        },
        get isCharacter() {
          return this.myRoute === Router.Character;
        },
        get isGame() {
          return this.myRoute === Router.Game;
        },
        get isStaging() {
          return this.myRoute === Router.Staging;
        },
        screenSwitch: async (newScreen: Router) => {
          this.state.mySceneTransition.fadeIn();
          await utils.wait(900);
          this.state.myContainer.myRoute = newScreen;
          this.state.mySceneTransition.fadeOut();
          await utils.wait(900);
          this.state.mySceneTransition.reset();
        },
      },
      myTitle: {
        title: "DEMON SIEGE",
        subtitle: "PRESS LOGIN TO BEGIN",
        login: () => {
          utils.playSound("button");
          utils.login();
        },
      },
      mySceneTransition: {
        classString: "normal",
        fadeIn: () => (this.state.mySceneTransition.classString = "normal sceneTransition"),
        fadeOut: () => (this.state.mySceneTransition.classString = "normal sceneTransition fade-out"),
        reset: () => (this.state.mySceneTransition.classString = "normal"),
      },
      myLobby: {
        title: "Lobby",
        subtitle: "Choose to create game or join",
        isJoining: false,
        isDisabled: true,
        validationCSSstring: "joinGameText",
        get buttonEnable() {
          return this.isDisabled;
        },
        createGame: () => {
          utils.playSound("button");
          utils.createGame();
        },
        joinGame: (event, model) => {
          utils.playSound("button");
          if (model.myLobby.isJoining) {
            model.myLobby.isJoining = false;
          } else {
            model.myLobby.isJoining = true;
          }
        },
        findGame: () => {
          console.log("Finding Game");
          utils.findMatch();
        },
        logout: () => {
          utils.playSound("button");
          this.state.playerData.username = "";
          this.state.myContainer.screenSwitch(Router.Title);
        },
        validate: (event, model) => {
          const validateGameID = (id: string): boolean => {
            const regex = new RegExp("^[a-zA-Z0-9]{11,13}$");
            return regex.test(id);
          };

          //step one, read the input
          let mystring = this.state.gameData.gameID;
          //step two, qualify the input
          let valStatus = validateGameID(mystring);
          //step three, do something to the UI to indicate pass/fail
          if (valStatus) {
            //update UI
            model.myLobby.isDisabled = false;
            model.myLobby.validationCSSstring = "joinGameText goodData";
          } else {
            model.myLobby.isDisabled = true;
            model.myLobby.validationCSSstring = "joinGameText badData";
          }
        },
        connect: (_event, model) => {
          utils.joinGame(model.gameData.gameID);
        },
      },
      myCharscreen: {
        characterName: "Enter Character Name",
        selectText: (_event, _model, element) => {
          element.select();
        },
        selectRogue: (event, model) => {
          //gaurd conditions
          if (model.myCharscreen.characterName == "Enter Character Name") return;
          model.myCharscreen.role = Roles.Rogue;
          let gender;
          model.myCharscreen.isMale ? (gender = Gender.Male) : (gender = Gender.Female);
          if (model.myCharscreen.isMale) model.myCharscreen.imgSource = rmale;
          else model.myCharscreen.imgSource = rfemale;
          model.myCharscreen.isModalShowing = true;
          utils.playSound("button");
          utils.chooseChar(model.myCharscreen.characterName.toUpperCase(), model.myCharscreen.role, gender);
        },
        selectBarbarian: (event, model) => {
          //gaurd conditions
          if (model.myCharscreen.characterName == "Enter Character Name") return;
          model.myCharscreen.role = Roles.Barbarian;
          let gender;
          model.myCharscreen.isMale ? (gender = Gender.Male) : (gender = Gender.Female);
          if (model.myCharscreen.isMale) model.myCharscreen.imgSource = bmale;
          else model.myCharscreen.imgSource = bfemale;
          model.myCharscreen.isModalShowing = true;
          utils.playSound("button");
          utils.chooseChar(model.myCharscreen.characterName.toUpperCase(), model.myCharscreen.role, gender);
        },
        selectWizard: (event, model) => {
          //gaurd conditions
          if (model.myCharscreen.characterName == "Enter Character Name") return;
          model.myCharscreen.role = Roles.Wizard;
          let gender;
          model.myCharscreen.isMale ? (gender = Gender.Male) : (gender = Gender.Female);
          if (model.myCharscreen.isMale) model.myCharscreen.imgSource = wmale;
          else model.myCharscreen.imgSource = wfemale;
          model.myCharscreen.isModalShowing = true;
          utils.playSound("button");
          utils.chooseChar(model.myCharscreen.characterName.toUpperCase(), model.myCharscreen.role, gender);
        },
        selectPaladin: (event, model) => {
          //gaurd conditions
          if (model.myCharscreen.characterName == "Enter Character Name") return;
          model.myCharscreen.role = Roles.Paladin;
          let gender;
          model.myCharscreen.isMale ? (gender = Gender.Male) : (gender = Gender.Female);
          if (model.myCharscreen.isMale) model.myCharscreen.imgSource = pmale;
          else model.myCharscreen.imgSource = pfemale;
          model.myCharscreen.isModalShowing = true;
          utils.playSound("button");
          utils.chooseChar(model.myCharscreen.characterName.toUpperCase(), model.myCharscreen.role, gender);
        },
        goBack: () => {
          utils.playSound("button");
          utils.leaveRoom();
          this.state.myContainer.screenSwitch(Router.Lobby);
        },
        logout: () => {
          utils.leaveRoom();
          utils.playSound("button");
          this.state.playerData.username = "";
          this.state.myContainer.screenSwitch(Router.Title);
        },
        cancelSelection: (event, model) => {
          utils.playSound("button");
          model.myCharscreen.isModalShowing = false;
          model.myCharscreen.characterName = "Enter Character Name";
          model.myCharscreen.switchPosition = "left";
          model.myCharscreen.isMale = true;
        },
        enterGame: () => {
          utils.playSound("button");
          utils.enterGame();
          this.state.myContainer.screenSwitch(Router.Staging);
        },
        toggleGender: (event, model) => {
          utils.playSound("button");
          if (this.state.myCharscreen.isMale) {
            model.myCharscreen.switchPosition = "right";
            model.myCharscreen.isMale = false;
          } else {
            model.myCharscreen.isMale = true;
            model.myCharscreen.switchPosition = "left";
          }
        },
        isMale: true,
        isModalShowing: false,
        role: "barbarian",
        switchPosition: "left",
        imgSource: null,
      },
      myStaging: {
        isVisible: true,
        group: [],
        back: () => {
          utils.playSound("button");
          utils.leaveGame();
          this.state.myContainer.screenSwitch(Router.Character);
        },
        start: (_event, model) => {
          utils.playSound("button");
          model.myStaging.isVisible = false;
          utils.startGame();
          this.state.myContainer.screenSwitch(Router.Game);
        },
        logout: (event, model) => {
          model.myCharscreen.characterName = "Enter Character Name";
          model.myCharscreen.isModalShowing = false;
          utils.leaveRoom();
          utils.playSound("button");
          this.state.playerData.username = "";
          this.state.myContainer.screenSwitch(Router.Title);
        },
      },
      myGame: {
        showModal: false,
      },
      attributes: {
        icons:
          '<a href="https://www.flaticon.com/free-icons/card" title="card icons">Card icons created by Pixel perfect - Flaticon</a>',
        sounds: "Sound from Zapsplat.com",
      },
      myToast: {
        intervalID: null,
        messages: [],
        addToast: (icontype: "user" | "location" | "monster" | "card" | "effect", msg: string, event, model, element) => {
          console.trace("toast: where called?");
          let iconMap = {
            user: userIcon,
            location: locationIcon,
            monster: monsterIcon,
            card: cardIcon,
            effect: effectIcon,
          };

          let config = {
            msg: msg,
            img: iconMap[icontype],
            timeOut: 5000,
            close: (_event, model, _element, _at, context) => {
              context.$parent.$model.myToast.messages = context.$parent.$model.myToast.messages.filter(m => m !== model.msg);
            },
            hover: (_event, _model, element) => {
              const prnt = element.parentElement;
              prnt.classList.remove("bloom");
            },
          };
          this.state.myToast.messages.push(config);
        },
      },
      myChat: {
        messages: [],
        inputMessage: "enter chat here",
        isActive: false,
        numUnreadMessages: 0,
        selectText: (event, model, element) => {
          element.select();
        },
        sendMessage: (event, model, element) => {
          utils.playSound("mailSend");
          utils.sendChat(model.myChat.inputMessage);
          model.myChat.inputMessage = "";
        },
        toggleChat: (event, model) => {
          utils.playSound("button");
          if (model.myChat.isActive === true) {
            controller.abort();
            controller = null;
            model.myChat.isActive = false;
          } else {
            model.myChat.isActive = true;
            controller = new AbortController();
            keybinding = document.addEventListener(
              "keypress",
              e => {
                if (e.key == "Enter") {
                  utils.playSound("mailSend");
                  utils.sendChat(model.myChat.inputMessage);
                  model.myChat.inputMessage = "";
                }
              },
              { signal: controller.signal }
            );

            utils.seenChat(model.myChat.messages.length);
          }
        },
        get showPill() {
          return this.numUnreadMessages > 0;
        },
      },
      mypUI: {
        clear: (_event, model) => {
          if (
            this.state.gameData.roundState === RoundState.waitingOnPlayer ||
            this.state.gameData.roundState === RoundState.activeRunningPlayer
          )
            return;

          model.myHand.isVisible = false;
        },
        checkHover: (event, model) => {
          if (
            this.state.gameData.roundState === RoundState.waitingOnPlayer ||
            this.state.gameData.roundState === RoundState.activeRunningPlayer
          )
            return;
          mouseCount += 1;
          if (mouseCount >= MOUSELIMIT) {
            mouseCount = 0;
            model.myHand.hand = [];
            model.myHand.isVisible = false;

            model.mypUI.allPlayers.forEach((p, i) => {
              if (p.isHovered()) {
                switch (i) {
                  case 0:
                    model.myHand.hand = [...model.myHand.player1Hand];
                    model.myHand.footer = `${p.name.replace(/^\w/, c => c.toUpperCase())}'s Hand`;
                    break;
                  case 1:
                    model.myHand.hand = [...model.myHand.player2Hand];
                    model.myHand.footer = `${p.name.replace(/^\w/, c => c.toUpperCase())}'s Hand`;
                    break;
                  case 2:
                    model.myHand.hand = [...model.myHand.player3Hand];
                    model.myHand.footer = `${p.name.replace(/^\w/, c => c.toUpperCase())}'s Hand`;
                    break;
                  case 3:
                    model.myHand.hand = [...model.myHand.player4Hand];
                    model.myHand.footer = `${p.name.replace(/^\w/, c => c.toUpperCase())}'s Hand`;
                    break;
                }
              }
            });
            if (model.myHand.hand.length != 0) model.myHand.isVisible = true;
          }
        },
        turn: 1,
        showOptions: (event, model) => {
          utils.loadSettings();
          model.mySettings.showModal = true;
        },
        allPlayers: [],
      },
      myStatusEffect: {
        rotate: () => {
          console.log("fired load event");
        },
      },
      myHand: {
        isVisible: false,
        player1Hand: [],
        player2Hand: [],
        player3Hand: [],
        player4Hand: [],
        footer: "",
        hand: [],
        done: () => {
          utils.playerDone();
        },
        get isEmpty() {
          return this.hand.length == 0;
        },

        clickHandler: (event, model, element) => {
          const usr = this.state.gameData.Players.findIndex(p => {
            return this.state.gameData.turn === p.id;
          });

          const cardId = element.getAttribute("id");
          console.log(`card clicked: ${cardId}, roundstate: ${this.state.gameData.roundState} `);
          if (
            this.state.gameData.roundState == RoundState.activeRunningPlayer ||
            this.state.gameData.roundState == RoundState.waitingOnPlayer
          ) {
            console.log("player card being played", cardId);
            utils.playPcard(cardId);
            //remove card from myHand
            let cardindex = this.state.myHand.hand.findIndex(c => c.id === cardId);
            this.state.myHand.hand.splice(cardindex, 1);
            console.log("index of card in hand", cardindex);
            //remove card from PLAYERXHand
            switch (usr) {
              case 0:
                cardindex = this.state.myHand.player1Hand.findIndex(c => c.id === cardId);
                this.state.myHand.player1Hand.splice(cardindex, 1);
                break;
              case 1:
                cardindex = this.state.myHand.player2Hand.findIndex(c => c.id === cardId);
                this.state.myHand.player2Hand.splice(cardindex, 1);
                break;
              case 2:
                cardindex = this.state.myHand.player3Hand.findIndex(c => c.id === cardId);
                this.state.myHand.player3Hand.splice(cardindex, 1);
                break;
              case 3:
                cardindex = this.state.myHand.player4Hand.findIndex(c => c.id === cardId);
                this.state.myHand.player4Hand.splice(cardindex, 1);
                break;
            }
          }
          //if (this.state.myHand.hand.length == 0) this.state.myHand.isVisible = false;
          return;
        },
      },
      myLocation: {
        isVisible: false,
        level: 1,
        health: 6,
        damage: 0,
        title: "Cellar",
        sequence: 1,
        addPoint: (pts, model) => {
          if (model.myLocation.damage < model.myLocation.health) {
            model.myLocation.damage += pts;
            if (model.myLocation.damage == model.myLocation.health) alert("location lost"); //do something here
          }
        },
        removePoint: (pts, model) => {
          if (model.myLocation.damage - pts >= 0) {
            model.myLocation.damage -= pts;
          }
        },
        cssString: "",
      },
      myTowerD: {
        cssString: "",
        isVisible: false,
        id: "",
        title: "",
        level: 1,
        desc: "",
        clicked: (event, model, element) => {
          const usr = model.gameData.Players.findIndex(p => {
            return model.gameData.turn === p.id;
          });
          console.log("TD clicked: ", model.gameData.roundState);
          const myTurn = model.gameData.Players[usr].id == model.playerData.id;
          if (model.gameData.roundState == RoundState.waitingOnTD && myTurn) {
            //playTD Card
            console.log("state 631, playing card");
            utils.playTD(model.myTowerD.id);
          }
        },
      },
      myMonster: {
        isVisible: false,
        cssString: "",
        clickHandler: (event, model, element, object) => {
          console.log("monster click");
          const cardId = element.getAttribute("id");
          if (this.state.gameData.roundState == RoundState.activeRunningMonster) {
            utils.playMcard(cardId);
          }
          if (this.state.gameData.roundState == RoundState.activeApplyingDamage) {
          }
          return;
        },
      },
      mySettings: {
        showModal: false,
        beginningColor: "#2c34d6",
        endingColor: "#101f6b",
        gameSpeed: 5,
        bgmMute: false,
        sfxMute: false,
        bgmIcon: unmute,
        sfxIcon: unmute,
        sfxGain: 5,
        bgmGain: 5,
        chatUM: "#8BAE1F",
        chatSM: "008b8b",
        chatOM: "#be53f3",
        chatBG: "#000000",
        chatOP: 0.5,
        changeSFX: (_event, model) => {
          utils.updateSFXvolume(model.mySettings.sfxGain);
        },
        changeBGM: (_event, model) => {
          utils.updateBGMvolume(model.mySettings.bgmGain);
        },
        muteBGM: (_event, model) => {
          let muted = model.mySettings.bgmMute;
          if (muted) {
            model.mySettings.bgmMute = false;
            model.mySettings.bgmIcon = unmute;
            utils.muteBGM(false);
          } else {
            model.mySettings.bgmMute = true;
            model.mySettings.bgmIcon = mute;
            utils.muteBGM(true);
          }
        },
        muteSFX: (_event, model) => {
          let muted = model.mySettings.sfxMute;
          if (muted) {
            model.mySettings.sfxMute = false;
            model.mySettings.sfxIcon = unmute;
            utils.muteSFX(false);
          } else {
            model.mySettings.sfxMute = true;
            model.mySettings.sfxIcon = mute;
            utils.muteSFX(true);
          }
        },
        closeModal: (_event, model) => {
          utils.playSound("button");
          let tempObj = {
            chatOM: model.mySettings.chatOM,
            chatUM: model.mySettings.chatUM,
            chatOP: model.mySettings.chatOP,
            chatBG: model.mySettings.chatBG,
            chatSM: model.mySettings.chatSM,
            GS: model.mySettings.gameSpeed,
            sfx: model.mySettings.sfxGain,
            bgm: model.mySettings.bgmGain,
            bColor: model.mySettings.beginningColor,
            eColor: model.mySettings.endingColor,
          };

          localStorage.setItem("DSsettings", JSON.stringify(tempObj));
          model.mySettings.showModal = false;
        },
      },
      myHelp: {
        isVisible: false,
        pageNum: 1,
        numPages: 4,
        closeModal: (_event, model) => {
          utils.playSound("button");
          model.myHelp.isVisible = false;
        },
        showModal: (_event, model) => {
          utils.playSound("button");
          model.myHelp.pageNum = 1;
          model.myHelp.isVisible = true;
        },
        get page1() {
          return this.pageNum === 1;
        },
        get page2() {
          return this.pageNum === 2;
        },
        get page3() {
          return this.pageNum === 3;
        },
        get page4() {
          return this.pageNum === 4;
        },
        back: (_event, model) => {
          utils.playSound("button");
          if (model.myHelp.pageNum > 1) {
            model.myHelp.pageNum -= 1;
          }
        },
        next: (_event, model) => {
          utils.playSound("button");
          if (model.myHelp.pageNum < model.myHelp.numPages) {
            model.myHelp.pageNum += 1;
          }
        },
      },
      myNavBar: {
        showNavBar: true,
        globalstates: ["passives", "td", "monster", "player", "purchase", "damage", "endturn"],
        resetTimeline: () => {
          this.state.myNavBar.progressIndex = 0;
          this.state.myNavBar.timestamps.forEach((ts, index) => {
            ts.doneFlag = false;
            if (index == 0) ts.style = "NBpulse";
            else ts.style = "";
            ts.connStyle = "";
          });
        },
        timestamps: [
          {
            title: "Passives",
            done: "Passives Applied",
            style: "NBpulse",
            doneFlag: false,
            connector: true,
            data: "passives",
            connStyle: "",
          },
          {
            title: "Tower Defense",
            done: "TD Card Complete",
            style: "",
            doneFlag: false,
            connector: true,
            data: "td",
            connStyle: "",
          },
          {
            title: "Monster Card",
            done: "Monster Card Complete",
            style: "",
            doneFlag: false,
            connector: true,
            data: "monster",
            connStyle: "",
          },
          {
            title: "Player Card",
            done: "Player Hand Complete",
            style: "",
            doneFlag: false,
            connector: true,
            data: "player",
            connStyle: "",
          },
          {
            title: "Purchase Cards",
            done: "Card Pool Complete",
            style: "",
            doneFlag: false,
            connector: true,
            data: "purchase",
            connStyle: "",
          },
          {
            title: "Apply Damage",
            done: "Select Monster",
            style: "",
            doneFlag: false,
            connector: true,
            data: "damage",
            connStyle: "",
          },
          {
            data: "endturn",
            title: "End Turn",
            done: "Resetting Turn",
            style: "",
            doneFlag: false,
            connector: false,
            connStyle: "",
          },
        ],
        progressIndex: 0,
        increment: barstate => {
          //let elementStateLabel = element.getAttribute("data-state");
          let elementStateLabel = barstate;
          if (elementStateLabel == this.state.myNavBar.globalstates[this.state.myNavBar.progressIndex]) {
            this.state.myNavBar.timestamps[this.state.myNavBar.progressIndex].style = "NBcomplete NBglow";
            this.state.myNavBar.timestamps[this.state.myNavBar.progressIndex].doneFlag = true;
            this.state.myNavBar.timestamps[this.state.myNavBar.progressIndex].connStyle = "NBglow";
            this.state.myNavBar.progressIndex++;
            if (this.state.myNavBar.timestamps[this.state.myNavBar.progressIndex])
              this.state.myNavBar.timestamps[this.state.myNavBar.progressIndex].style = "NBpulse";
            if (elementStateLabel == "endturn") {
              setTimeout(() => {
                this.state.myNavBar.resetTimeline();
              }, 2000);
            }
          }
        },
      },
      myNavInput: {
        isVisible: false,
        contWidth: "190px",
        contTop: "55%",
        buttons: [
          {
            label: "click me",
            action: (event, model, element) => {
              model.button.label = "BOOM!";
              model.button.style = "NIclicked";
            },
            unaction: (event, model, element) => {
              model.button.style = "";
              model.button.label = "click me";
            },
            style: "",
          },
        ],
      },
      myMessageOverlay: {
        isVisible: false,
        mainMessage: "",
        subMessage: "",
        showMessage: (main: string, sub: string, timeout: number) => {
          this.state.myMessageOverlay.mainMessage = main;
          this.state.myMessageOverlay.subMessage = sub;
          this.state.myMessageOverlay.isVisble = true;
          setTimeout(() => {
            this.state.myMessageOverlay.isVisble = false;
          }, timeout);
        },
      },
    };
  }

  areArraysEqual = (a: Array<Record<string, any>>, b: MCard[]): boolean => {
    //if both empty, true
    if (a.length == 0 && b.length == 0) return true;
    if (a.length != b.length) return false;
    let failedtests = 0;
    if (a.length == b.length) {
      b.forEach((card, i) => {
        if ("id" in a[i]) {
          if (card.id != a[i].id) failedtests++;
        }
      });

      if (failedtests == 0) return true;
    }

    return false;
  };

  updateArgs = (update: UpdateArgs) => {
    if (this) {
      this.state.gameData.gameID = update.stateId;
      this.state.gameData.playerIndex = update.state.me;
      this.state.gameData.Players = update.state.players;
      this.state.gameData.roundState = update.state.roundState;
      this.state.gameData.cardPool = update.state.cardPool;
      this.state.gameData.turnOrder = update.state.turnOrder;
      this.state.gameData.turn = update.state.turn;
      if (!this.areArraysEqual(this.state.gameData.activeMonsters, update.state.activeMonsters)) {
        this.state.gameData.activeMonsters = [...update.state.activeMonsters];
      }

      this.state.gameData.location = update.state.location;

      this.state.gameData.TDCard = update.state.TDcard;
      if (this.state.gameData.TDCard) {
        this.state.myTowerD.desc = this.state.gameData.TDCard.effectString;
        this.state.myTowerD.level = this.state.gameData.TDCard.level;
        this.state.myTowerD.title = this.state.gameData.TDCard.title;
        this.state.myTowerD.id = this.state.gameData.TDCard.id;
      }

      let lastMessage = update.state.Messages.length;
      if (update.state.Messages.length != this.state.myChat.messages.length) {
        let lastindex = this.state.myChat.messages.length;
        const newArray = update.state.Messages.filter(elem => {
          return elem.id > lastindex;
        });

        newArray.forEach(msg => {
          let msgType;

          if (msg.sender == this.state.gameData.Players[this.state.gameData.playerIndex].id) msgType = "chat_user";
          else msgType = "chat_other";

          this.state.myChat.messages.push({
            type: msgType,
            message: `${msg.nickName}: ${msg.data}`,
            id: msg.id,
          });
        });

        setTimeout(() => {
          chatDiv = document.getElementById("chatdiv");
          if (chatDiv) {
            chatDiv.scrollTop = chatDiv.scrollHeight + 45;
          }
        }, 50);
      }

      if (update.state.me != undefined && this.state.gameData.Players.length > 0) {
        if (this.state.myChat.isActive === true) {
          this.state.myChat.numUnreadMessages = 0;
          if (this.state.gameData.Players[this.state.gameData.playerIndex].lastSeen != lastMessage)
            utils.seenChat(lastMessage);
        } else {
          this.state.myChat.numUnreadMessages =
            lastMessage - this.state.gameData.Players[this.state.gameData.playerIndex].lastSeen;
        }
      }

      //staging screen

      if (this.state.myContainer.myRoute == Router.Staging || this.state.myContainer.myRoute == Router.Character) {
        this.state.myStaging.group.length = 0;

        this.state.gameData.Players.forEach((player, index) => {
          this.state.myStaging.group.push({
            index: index + 1,
            name: player.name,
            img: roleMap[player.role][player.gender],
          });
        });
      }

      if (this.state.myContainer.myRoute == Router.Game || this.state.myContainer.myRoute == Router.Staging) {
        //PUI
        this.state.mypUI.allPlayers.forEach((p, i) => {
          p.coin = this.state.gameData.Players[i].coin;
          p.attack = this.state.gameData.Players[i].attack;
          //p.health = this.state.gameData.Players[i].health;
          if (this.state.gameData.Players[i].id == this.state.gameData.turn) p.bloomStatus = "playerBloom";
          else p.bloomStatus = "";
        });
      }
    }

    //events
    if (update.events.length) {
      console.log("SERVER EVENTS: ", update.events);
    }
    update.events.forEach(event => {
      switch (event) {
        case "START":
          if (this.state.myContainer.myRoute != Router.Game) {
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

          startEventSequence(startSetupSeq, this.state);
          startEventSequence(startSequence, this.state);

          break;
        case "START TURN":
          startEventSequence(startTurn, this.state);
          break;
        case "PASSIVES":
          startEventSequence(passives, this.state);
          break;
        case "STATUSEFFECT ADDED":
          startEventSequence(updateStatEffects, this.state);
          break;
        case "Lose1Health":
          startEventSequence(lowerHealth1, this.state);
          break;
        case "Lose2Health":
          startEventSequence(lowerHealth2, this.state);
          break;
        case "add1toLocation":
          startEventSequence(locDamage, this.state);
          this.state.myLocation.addPoint(1, this.state);
          break;
        case "hideTD":
          console.log("done with TD");
          startEventSequence(hideTD, this.state);
          break;
        case "ENABLE_Monster":
          console.log("enable monsters");
          startEventSequence(bloomMonsters, this.state);
          break;
        case "NO MONSTERS READY":
          console.log("skipping monsters");
          startEventSequence(skipMonsters, this.state);
          break;
        case "MONSTER_PLAYED":
          startEventSequence(MonsterPlayed, this.state);
          break;
        case "ENABLE_Player":
          startEventSequence(playerHandShow, this.state);
          break;
        case "PLAYERDONE":
          console.log("player done");
          startEventSequence(playerHandDone, this.state);
          break;
        case "STUNNED":
          //TODO - come up with Stunned practice
          break;
        case "+1Attack":
          startEventSequence(add1Attack, this.state);
          break;
        case "+1Health":
          startEventSequence(raiseHealth1, this.state);
          break;

        case "+2Coin":
          startEventSequence(add2Coin, this.state);
          break;

        case "+1Coin":
          startEventSequence(add1Coin, this.state);
          break;

        case "draw":
          startEventSequence(drawNewCard, this.state);
          break;

        case "+1HealthtoAllOthers":
          startEventSequence(healOthers1, this.state);
          break;

        case "remove1fromLocation":
          startEventSequence(remove1Location, this.state);
          break;

        case "chooseAttack1Ability1":
          startEventSequence(chooseAtk1Coin1, this.state);
          break;

        case "chooseHealth1Ability1":
          startEventSequence(chooseHealth1Coin1, this.state);
          break;

        case "chooseAttack1Draw1":
          startEventSequence(chooseAtk1Draw1, this.state);
          break;

        case "chooseAbility1Draw1":
          startEventSequence(chooseCoin1Draw1, this.state);
          break;
        case "discard":
          //TODO - develope discard routine
          break;
        case "chooseHealth1Draw1":
          startEventSequence(chooseHealth1Draw1, this.state);
          break;
        case "addHealth1anyPlayer":
          break;
        case "otherplayer+1Health":
          //TODO - develop this routine, based off previous
          break;
        case "":
          break;
      }
    });
  };

  onError(errorMessage) {
    console.log("message error", errorMessage);
  }
}
