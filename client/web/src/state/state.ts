import { utils } from "../utils";
import { Router, Card } from "../components";
import { Character } from "../components/character";
import { Gender, Roles } from "../../../../api/types";
import { UpdateArgs } from "../../../.hathora/client";
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
  discard,
  nodraw,
  location,
} from "../assets/assetPool";

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
        health: 10,
        attack: 0,
        ability: 0,
        hand: [],
        deck: [],
        discard: [],
        role: 0,
        gender: 0,
        statusEffects: [],
        lastSeen: 0,
      },
      gameData: {
        otherPlayers: [],
        roundState: 0,
        activeMonsters: [
          /* {
            id: "kobalt",
            title: "Kobalt",
            health: 5,
            damage: 0,
            desc: "Active Hero: -1 Health",
            reward: "All Hereos: +1 Health",
            level: 1,
          }, */
        ],
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
          utils.chooseChar(model.myCharscreen.characterName, model.myCharscreen.role, gender);
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
          utils.chooseChar(model.myCharscreen.characterName, model.myCharscreen.role, gender);
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
          utils.chooseChar(model.myCharscreen.characterName, model.myCharscreen.role, gender);
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
          utils.chooseChar(model.myCharscreen.characterName, model.myCharscreen.role, gender);
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
        group: [],
        back: () => {
          utils.playSound("button");
          utils.leaveGame();
          this.state.myContainer.screenSwitch(Router.Character);
        },
        start: () => {
          utils.playGameMusic();
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
      },
      myToast: {
        intervalID: null,
        messages: [],
        addToast: (icontype: "user" | "location" | "monster" | "card" | "effect", msg: string, event, model, element) => {
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
        test: () => {
          let number = Math.floor(Math.random() * 5);
          switch (number) {
            case 0:
              this.state.myToast.addToast("monster", "Monster Attacks Player");
              break;
            case 1:
              this.state.myToast.addToast("user", "User 3 Turn to play");
              break;
            case 2:
              this.state.myToast.addToast("location", "Location point added");
              break;
            case 3:
              this.state.myToast.addToast("effect", "Passive Effect was triggered");
              break;
            case 4:
              this.state.myToast.addToast("card", "Card was played");
              break;
          }
          console.log("test: ", this.state.myToast.messages);
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
          console.log("click chat");
          utils.sendChat(model.myChat.inputMessage);
          model.myChat.inputMessage = "";
        },
        toggleChat: (event, model) => {
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
                  console.log("keypress chat");
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
        addSE: (_event, model) => {
          switch (model.mypUI.allPlayers[0].statusEffects.length) {
            case 0:
              model.mypUI.allPlayers[0].addStatusMessage({ text: "Lose 1 Health if Discard", img: discard, angle: 0 });
              break;
            case 1:
              model.mypUI.allPlayers[0].addStatusMessage({
                text: "Lose 1 Health if Location point added",
                img: location,
                angle: 0,
              });
              break;
            case 2:
              model.mypUI.allPlayers[0].addStatusMessage({ text: "Cannot Draw this round", img: nodraw, angle: 0 });
              break;
            default:
              break;
          }
        },
        clear: (_event, model) => (model.myHand.isVisible = false),
        checkHover: (event, model) => {
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

        allPlayers: [
          new Character({
            name: "conan",
            role: Roles.Barbarian,
            index: 1,
            gender: Gender.Male,
            bloomStatus: "playerBloom",
            statusEffects: [],
          }),
          new Character({
            name: "regis",
            role: Roles.Rogue,
            index: 2,
            gender: Gender.Male,
            bloomStatus: "",
            statusEffects: [],
          }),
          new Character({
            name: "merla",
            role: Roles.Wizard,
            gender: Gender.Female,
            index: 3,
            bloomStatus: "",
            statusEffects: [],
          }),
          new Character({
            name: "daryl",
            role: Roles.Paladin,
            gender: Gender.Male,
            index: 4,
            bloomStatus: "",
            statusEffects: [],
          }),
        ],
      },
      myStatusEffect: {
        rotate: () => {
          console.log("fired load event");
        },
      },
      myHand: {
        isVisible: false,
        player1Hand: [
          new Card({
            state: this.state,
            type: "ability",
            title: "TestCard",
            level: 1,
            description: "my test card",
          }),
          new Card({
            state: this.state,
            type: "ability",
            title: "TestCard",
            level: 1,
            description: "my test card",
          }),
          new Card({
            state: this.state,
            type: "ability",
            title: "TestCard",
            level: 1,
            description: "my test card",
          }),
          new Card({
            state: this.state,
            type: "ability",
            title: "TestCard",
            level: 1,
            description: "my test card",
          }),
          new Card({
            state: this.state,
            type: "ability",
            title: "TestCard",
            level: 1,
            description: "my test card",
          }),
        ],
        player2Hand: [
          new Card({
            state: this.state,
            type: "ability",
            title: "TestCard",
            level: 1,
            description: "my test card",
          }),
          new Card({
            state: this.state,
            type: "ability",
            title: "TestCard",
            level: 1,
            description: "my test card",
          }),
          new Card({
            state: this.state,
            type: "ability",
            title: "TestCard",
            level: 1,
            description: "my test card",
          }),
          new Card({
            state: this.state,
            type: "ability",
            title: "TestCard",
            level: 1,
            description: "my test card",
          }),
          new Card({
            state: this.state,
            type: "ability",
            title: "TestCard",
            level: 1,
            description: "my test card",
          }),
          new Card({
            state: this.state,
            type: "ability",
            title: "TestCard",
            level: 1,
            description: "my test card",
          }),
        ],
        player3Hand: [
          new Card({
            state: this.state,
            type: "ability",
            title: "TestCard",
            level: 1,
            description: "my test card",
          }),
          new Card({
            state: this.state,
            type: "ability",
            title: "TestCard",
            level: 1,
            description: "my test card",
          }),
          new Card({
            state: this.state,
            type: "ability",
            title: "TestCard",
            level: 1,
            description: "my test card",
          }),
          new Card({
            state: this.state,
            type: "ability",
            title: "TestCard",
            level: 1,
            description: "my test card",
          }),
          new Card({
            state: this.state,
            type: "ability",
            title: "TestCard",
            level: 1,
            description: "my test card",
          }),
          new Card({
            state: this.state,
            type: "ability",
            title: "TestCard",
            level: 1,
            description: "my test card",
          }),
          new Card({
            state: this.state,
            type: "ability",
            title: "TestCard",
            level: 1,
            description: "my test card",
          }),
        ],
        player4Hand: [
          new Card({
            state: this.state,
            type: "ability",
            title: "TestCard",
            level: 1,
            description: "my test card",
          }),
          new Card({
            state: this.state,
            type: "ability",
            title: "TestCard",
            level: 1,
            description: "my test card",
          }),
          new Card({
            state: this.state,
            type: "ability",
            title: "TestCard",
            level: 1,
            description: "my test card",
          }),
          new Card({
            state: this.state,
            type: "ability",
            title: "TestCard",
            level: 1,
            description: "my test card",
          }),
          new Card({
            state: this.state,
            type: "ability",
            title: "TestCard",
            level: 1,
            description: "my test card",
          }),
          new Card({
            state: this.state,
            type: "ability",
            title: "TestCard",
            level: 1,
            description: "my test card",
          }),
          new Card({
            state: this.state,
            type: "ability",
            title: "TestCard",
            level: 1,
            description: "my test card",
          }),
          new Card({
            state: this.state,
            type: "ability",
            title: "TestCard",
            level: 1,
            description: "my test card",
          }),
        ],
        footer: "Player 1 Hand",
        hand: [],
      },
      myLocation: {
        isVisible: true,
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
      },
      myTowerD: {
        isVisible: true,
        title: "Net Trap",
        level: 1,
        desc: "Add 1 influence point to location",
      },
      myMonster: {},

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
    };
  }

  updateArgs = (update: UpdateArgs) => {
    if (this) {
      console.log(update);
      this.state.gameData.gameID = update.stateId;
      this.state.gameData.otherPlayers = update.state.others;
      this.state.gameData.roundState = update.state.roundState;
      this.state.gameData.cardPool = update.state.cardPool;
      this.state.gameData.turnOrder = update.state.turnOrder;
      this.state.turn = update.state.turn;
      this.state.activeMonsters = update.state.activeMonsters;

      let lastMessage = update.state.Messages.length;
      if (update.state.Messages.length != this.state.myChat.messages.length) {
        let lastindex = this.state.myChat.messages.length;
        const newArray = update.state.Messages.filter(elem => {
          return elem.id > lastindex;
        });
        console.log("last index: ", lastindex, "new array: ", newArray);

        newArray.forEach(msg => {
          let msgType;
          console.log("here");
          if (msg.sender == this.state.playerData.id) msgType = "chat_user";
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

      if (update.state.me) {
        this.state.playerData.name = update.state.me.name;
        this.state.playerData.id = update.state.me.id;
        this.state.playerData.health = update.state.me.health;
        this.state.playerData.attack = update.state.me.attack;
        this.state.playerData.ability = update.state.me.ability;
        this.state.playerData.hand = update.state.me.hand;
        this.state.playerData.deck = update.state.me.deck;
        this.state.playerData.discard = update.state.me.discard;
        this.state.playerData.role = update.state.me.role;
        this.state.playerData.gender = update.state.me.gender;
        this.state.playerData.statusEffects = update.state.me.statusEffects;
        this.state.playerData.lastSeen = update.state.me.lastSeen;
        console.log("chat status: ", this.state.myChat.isActive);
        if (this.state.myChat.isActive === true) {
          console.log("here");
          this.state.myChat.numUnreadMessages = 0;
          if (this.state.playerData.lastSeen != lastMessage) utils.seenChat(lastMessage);
        } else this.state.myChat.numUnreadMessages = lastMessage - this.state.playerData.lastSeen;
        console.log(
          "numunread",
          this.state.myChat.numUnreadMessages,
          " last: ",
          lastMessage,
          " lastseen: ",
          this.state.playerData.lastSeen
        );
      }

      this.state.myStaging.group.length = 0;
      this.state.myStaging.group.push({
        index: 1,
        name: this.state.playerData.name,
        img: roleMap[this.state.playerData.role][this.state.playerData.gender],
      });

      this.state.gameData.otherPlayers.forEach((player, index) => {
        this.state.myStaging.group.push({
          index: index + 2,
          name: player.name,
          img: roleMap[player.role][player.gender],
        });
      });
    }

    //events
    update.events.forEach(event => {
      console.log(event);
      switch (event) {
        case "START":
          console.log("starting game");
          if (this.state.myContainer.myRoute != Router.Game) {
            this.state.myContainer.screenSwitch(Router.Game);
            utils.playGameMusic();
          }
          break;
      }
    });
  };

  onError(errorMessage) {
    console.log("message error", errorMessage);
  }
}
