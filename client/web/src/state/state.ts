import { utils } from "../utils";
import { Router } from "../components";
import bmale from "../assets/people/ff_barbarian.png";
import bfemale from "../assets/people/ff_barbarian_w.png";
import wmale from "../assets/people/ff_wizard.png";
import wfemale from "../assets/people/ff_wizard_w.png";
import rmale from "../assets/people/ff_rogue.png";
import rfemale from "../assets/people/ff_rogue_w.png";
import pmale from "../assets/people/ff_paladin.png";
import pfemale from "../assets/people/ff_paladin_w.png";

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
        activeMonsters: [],
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
        login: () => utils.login(),
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
        gameID: "",
        createGame: () => {
          console.log("Creating Game");
        },
        joinGame: () => {
          this.state.myLobby.isJoining = true;
        },
        logout: () => {
          this.state.playerData.username = "";
          this.state.myContainer.screenSwitch(Router.Title);
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
        interval: 3000,
        intervalID: null,
        messages: [],

        test: () => {
          let number = Math.floor(Math.random() * 5);
          switch (number) {
            case 0:
              utils.toastMessage("monster", "Monster Attacks Player");
              break;
            case 1:
              utils.toastMessage("user", "User 3 Turn to play");
              break;
            case 2:
              utils.toastMessage("location", "Location point added");
              break;
            case 3:
              utils.toastMessage("effect", "Passive Effect was triggered");
              break;
            case 4:
              utils.toastMessage("card", "Card was played");
              break;
          }
        },
      },
      myChat: {
        messages: [],
      },
    };
  }
}
