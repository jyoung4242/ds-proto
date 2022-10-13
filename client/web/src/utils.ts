import { HathoraClient, HathoraConnection, StateId } from "../../.hathora/client";
import { AnonymousUserData } from "../../../api/base";
import { Router } from "./components/index";
import {
  Gender,
  IInitializeRequest,
  ISeenMessageRequest,
  ISendMessageRequest,
  Roles,
  UserResponse,
} from "../../../api/types";
import { BGM, SFX } from "./sound";

/**********************************************************
 * Hathora Client variables
 *********************************************************/
const client = new HathoraClient();
let token: string;
let user: AnonymousUserData;
let myConnection: HathoraConnection;
let roomID: StateId;
let bgm = new BGM();
let sfx = new SFX();
let role: Roles;
let gender: Gender;
let nickname: string;
let localState;

export const utils = {
  init(state) {
    localState = state;
  },
  wait(ms) {
    return new Promise<void>(resolve =>
      setTimeout(() => {
        resolve();
      }, ms)
    );
  },
  async login() {
    if (sessionStorage.getItem("token") === null) {
      try {
        sessionStorage.setItem("token", await client.loginAnonymous());
      } catch (error) {
        console.log(`response from server :`, error);
      }
    }
    token = sessionStorage.getItem("token");
    user = HathoraClient.getUserFromToken(token);

    localState.state.playerData.username = user.name; //"testname"; //
    localState.state.playerData.id = user.id;

    bgm.play("title");
    localState.state.myContainer.screenSwitch(Router.Lobby);
  },
  emitEvent(name: string, detail: CustomEventInit) {
    const event = new CustomEvent(name, {
      detail,
    });
    document.dispatchEvent(event);
  },
  async createGame() {
    const config: IInitializeRequest = {};
    roomID = "";
    try {
      roomID = await client.create(token, config);
    } catch (error) {
      console.log(`response from server :`, error);
    }

    if (roomID != "") {
      localState.state.gameData.gameID = roomID;
      localState.state.myContainer.screenSwitch(Router.Character);
      myConnection = await client.connect(token, roomID, localState.updateArgs, localState.onError);
    }
  },
  leaveGame() {
    myConnection.leaveGame({});
  },
  async joinGame(roomID: string) {
    const config: IInitializeRequest = {};
    try {
      myConnection = await client.connect(token, roomID, localState.updateArgs, localState.onError);
    } catch (error) {
      console.log("server response: ", error);
    }

    if (roomID != "") {
      localState.state.gameData.gameID = roomID;
      localState.state.myContainer.screenSwitch(Router.Character);
    }
  },
  async leaveRoom() {
    if (roomID == "") return;
    try {
      await myConnection.disconnect();
    } catch (error) {
      console.log("result response: ", error);
    }
    roomID = "";
  },
  async findMatch() {
    console.log("here");
    //not used
    let response = await client.findMatch(token, {}, 2, numPlayers => {
      console.log("Found", numPlayers);
    });
    console.log("result response: ", response);
  },
  async startGame() {
    try {
      await myConnection.startGame({});
    } catch (error) {
      console.log("result response: ", error);
    }
  },
  playGameMusic() {
    bgm.play("game");
  },
  playSound(sound: string) {
    sfx.play(sound);
  },
  updateSFXvolume(newLevel) {
    sfx.updateVolume(newLevel);
  },
  updateBGMvolume(newLevel) {
    bgm.updateVolume(newLevel);
  },
  muteBGM(muted: boolean) {
    bgm.mute(muted);
  },
  muteSFX(muted: boolean) {
    sfx.mute(muted);
  },
  chooseChar(newname: string, newrole: Roles, newgender: Gender) {
    role = newrole;
    gender = newgender;
    nickname = newname;
  },
  async enterGame() {
    try {
      let rslt = await myConnection.joinGame({
        role: role,
        name: nickname,
        gender: gender,
        level: 1,
      });
    } catch (error) {
      console.log("result response: ", error);
    }
  },
  loadSettings() {
    let settings = JSON.parse(localStorage.getItem("DSsettings"));
    if (settings != undefined) {
      localState.state.mySettings.chatOM = settings.chatOM;
      localState.state.mySettings.chatOP = settings.chatOP;
      localState.state.mySettings.chatBG = settings.chatBG;
      localState.state.mySettings.chatSM = settings.chatSM;
      localState.state.mySettings.chatUM = settings.chatUM;
      localState.state.mySettings.beginningColor = settings.bColor;
      localState.state.mySettings.endingColor = settings.eColor;
      localState.state.mySettings.gameSpeed = settings.GS;
      localState.state.mySettings.sfxGain = settings.sfx;
      localState.state.mySettings.bgmGain = settings.bgm;
      this.updateBGMvolume(settings.bgm);
      this.updateSFXvolume(settings.sfx);
    }
  },
  async sendChat(msg: string) {
    const message: ISendMessageRequest = {
      msg: msg,
    };
    try {
      let m = await myConnection.sendMessage(message);
    } catch (error) {
      console.log("result response: ", error);
    }
  },
  async seenChat(msgID: number) {
    const message: ISeenMessageRequest = {
      msgID: msgID,
    };
    try {
      let m = await myConnection.seenMessage(message);
    } catch (error) {
      console.log(`response from server :`, error);
    }
  },
  setupGame() {},
  async startTurn() {
    try {
      let m = await myConnection.startTurn({});
    } catch (error) {
      console.log(`response from server :`, error);
    }
  },
  async passives() {
    try {
      let m = await myConnection.runMonsterPassives({});
    } catch (error) {
      console.log(`response from server :`, error);
    }
  },
  async playTD(cardID: string) {
    try {
      let m = await myConnection.playTD({ cardID: cardID });
    } catch (error) {
      console.log(`response from server :`, error);
    }
  },
  async enableM() {
    try {
      let m = await myConnection.enableMonsters({});
    } catch (error) {
      console.log(`response from server :`, error);
    }
  },
  async playMcard(cardID: string) {
    try {
      let m = await myConnection.playMonster({ cardID: cardID });
    } catch (error) {
      console.log(`response from server :`, error);
    }
  },
  async showPcard() {
    try {
      let m = await myConnection.enablePlayer({});
    } catch (error) {
      console.log(`response from server :`, error);
    }
  },
  async showCardPool() {
    try {
      let m = await myConnection.enableCardPool({});
    } catch (error) {
      console.log(`response from server :`, error);
    }
  },
  async buyCard(cardID: string) {
    try {
      let m = await myConnection.buyFromCardPool({ cardID: cardID });
    } catch (error) {
      console.log(`response from server :`, error);
    }
  },
  async doneBuyingCards() {
    try {
      let m = await myConnection.closeCardPool({});
    } catch (error) {
      console.log(`response from server :`, error);
    }
  },
  async endTurn() {
    try {
      let m = await myConnection.endRound({});
    } catch (error) {
      console.log(`response from server :`, error);
    }
  },
  async enableMonsterDamage() {
    try {
      let m = await myConnection.enableMonsterDamage({});
    } catch (error) {
      console.log(`response from server :`, error);
    }
  },
  async monsterDamageDone() {
    try {
      let m = await myConnection.disableMonsterDamage({});
    } catch (error) {
      console.log(`response from server :`, error);
    }
  },
  async applyDamage(cardID: string) {
    try {
      let m = await myConnection.applyMonsterDamage({ cardID: cardID });
    } catch (error) {
      console.log(`response from server :`, error);
    }
  },
  async playPcard(cardID: string) {
    try {
      let m = await myConnection.playPlayerCard({ cardID: cardID });
    } catch (error) {
      console.log(`response from server :`, error);
    }
  },
  async userResponse(response: any) {
    let resp: UserResponse = {
      Callback: response.Callback,
      Response: response.Response,
    };
    try {
      let m = await myConnection.userResponse({
        response: resp,
      });
    } catch (error) {
      console.log(`response from server :`, error);
    }
  },
  async playerDone() {
    try {
      let m = await myConnection.playerHandComplete({});
    } catch (error) {
      console.log(`response from server(229) :`, error);
    }
  },
  setWhatsNew() {
    setTimeout(() => {
      console.log(localState);
      localState.state.myHelp.pageNum = 5;
      localState.state.myHelp.isVisible = true;
      localStorage.setItem("DS_RELEASE", "read");
    }, 100);
  },
};
