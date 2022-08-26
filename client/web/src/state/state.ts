import { utils } from "../utils";
import { Router, Card } from "../components";
import { Character } from "../components/character";
import bmale from "../assets/people/ff_barbarian.png";
import bfemale from "../assets/people/ff_barbarian_w.png";
import wmale from "../assets/people/ff_wizard.png";
import wfemale from "../assets/people/ff_wizard_w.png";
import rmale from "../assets/people/ff_rogue.png";
import rfemale from "../assets/people/ff_rogue_w.png";
import pmale from "../assets/people/ff_paladin.png";
import pfemale from "../assets/people/ff_paladin_w.png";
import { Gender, Roles } from "../../../../api/types";
import { UpdateArgs } from "../../../.hathora/client";
import userIcon from "../assets/toast/whiteuser.png";
import locationIcon from "../assets/toast/whitebuilding.png";
import monsterIcon from "../assets/toast/whitemonster.png";
import cardIcon from "../assets/toast/whitecard.png";
import effectIcon from "../assets/toast/whiteeffect.png";

const MOUSELIMIT = 10;
let mouseCount = 0;
export class State {
  state: any;

  constructor() {
    this.state = {
      playerData: {
        username: "",
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
      },
      gameData: {
        otherPlayers: [],
        roundState: 0,
        activeMonsters: [
          {
            id: "kobalt",
            title: "Kobalt",
            health: 5,
            damage: 0,
            desc: "Active Hero: -1 Health",
            reward: "All Hereos: +1 Health",
            level: 1,
          },
        ],
        location: {},
        TDcard: {},
        cardPool: [],
        turn: 0,
        turnOrder: [],
      },
      myContainer: {
        myRoute: Router.Game,
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
          console.log(this.state.myContainer.myRoute);
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
        gameID: "",
        get buttonEnable() {
          return this.isDisabled;
        },
        createGame: () => {
          utils.playSound("button");
          console.log("Creating Game");
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
        logout: () => {
          utils.playSound("button");
          this.state.playerData.username = "";
          this.state.myContainer.screenSwitch(Router.Title);
        },
        validate: (event, model) => {
          const validateGameID = (id: string): boolean => {
            const regex = new RegExp("^[a-zA-Z0-9]{11,12}$");
            return regex.test(id);
          };

          //step one, read the input
          let mystring = this.state.myLobby.gameID;
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
        connect: () => {},
      },
      myCharscreen: {
        characterName: "Enter Character Name",
        selectRogue: (event, model) => {
          //gaurd conditions
          if (model.myCharscreen.characterName == "Enter Character Name") return;
          model.myCharscreen.role = "rogue";
          if (model.myCharscreen.isMale) model.myCharscreen.imgSource = rmale;
          else model.myCharscreen.imgSource = rfemale;
          model.myCharscreen.isModalShowing = true;
        },
        selectBarbarian: (event, model) => {
          //gaurd conditions
          if (model.myCharscreen.characterName == "Enter Character Name") return;
          model.myCharscreen.role = "barbarian";
          if (model.myCharscreen.isMale) model.myCharscreen.imgSource = bmale;
          else model.myCharscreen.imgSource = bfemale;
          model.myCharscreen.isModalShowing = true;
        },
        selectWizard: (event, model) => {
          //gaurd conditions
          if (model.myCharscreen.characterName == "Enter Character Name") return;
          model.myCharscreen.role = "wizard";
          if (model.myCharscreen.isMale) model.myCharscreen.imgSource = wmale;
          else model.myCharscreen.imgSource = wfemale;
          model.myCharscreen.isModalShowing = true;
        },
        selectPaladin: (event, model) => {
          //gaurd conditions
          if (model.myCharscreen.characterName == "Enter Character Name") return;
          model.myCharscreen.role = "paladin";
          if (model.myCharscreen.isMale) model.myCharscreen.imgSource = pmale;
          else model.myCharscreen.imgSource = pfemale;
          model.myCharscreen.isModalShowing = true;
        },
        goBack: () => {},
        logout: () => {},
        cancelSelection: (event, model) => {
          model.myCharscreen.isModalShowing = false;
          model.myCharscreen.characterName = "Enter Character Name";
          model.myCharscreen.switchPosition = "left";
          model.myCharscreen.isMale = true;
        },
        toggleGender: (event, model) => {
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
        group: [
          { index: 1, name: "short", img: bmale },
          { index: 2, name: "mediumnam", img: wfemale },
          { index: 3, name: "longnameeeee", img: rmale },
          { index: 4, name: "OMG this is redicio", img: pfemale },
        ],
        back: () => {
          console.log("clicked back");
        },
        start: () => {
          utils.playGameMusic();
          console.log("clicked start");
        },
        logout: () => {
          console.log("clicked logout");
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
        messages: [
          {
            type: "chat_system",
            message: "System Messages Here",
            messageID: 0,
          },
          {
            type: "chat_user",
            message: "User:  Messages Here",
            messageID: 1,
          },
          {
            type: "chat_other",
            message: "Other: Messages Here",
            messageID: 2,
          },
        ],
        isActive: false,
        numUnreadMessages: 2,
        sendMessage: () => {},
        toggleChat: (event, model) => {
          console.log("clicked", model.myChat.isActive);
          if (model.myChat.isActive === true) model.myChat.isActive = false;
          else model.myChat.isActive = true;
        },
        get showPill() {
          return this.numUnreadMessages > 0;
        },
      },
      mypUI: {
        clear: (event, model) => (model.myHand.isVisible = false),
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
          model.mySettings.showModal = true;
        },

        allPlayers: [
          new Character({
            name: "conan",
            role: Roles.Barbarian,
            index: 1,
            gender: Gender.Male,
            bloomStatus: "playerBloom",
          }),
          new Character({
            name: "regis",
            role: Roles.Rogue,
            index: 2,
            gender: Gender.Male,
            bloomStatus: "",
          }),
          new Character({
            name: "merla",
            role: Roles.Wizard,
            gender: Gender.Female,
            index: 3,
            bloomStatus: "",
          }),
          new Character({
            name: "daryl",
            role: Roles.Paladin,
            gender: Gender.Male,
            index: 4,
            bloomStatus: "",
          }),
        ],
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
        sfxGain: 5,
        bgmGain: 5,
        chatUM: "#8BAE1F",
        chatSM: "008b8b",
        chatOM: "#be53f3",
        chatBG: "#000000",
        chatOP: 0.5,
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

          console.log(tempObj);
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

  updateArgs(update: UpdateArgs) {
    console.log("");
  }

  onError() {
    console.log("");
  }
}
