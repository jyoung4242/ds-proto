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
      sessionStorage.setItem("token", await client.loginAnonymous());
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
    roomID = await client.create(token, config);

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
    myConnection = await client.connect(token, roomID, localState.updateArgs, localState.onError);
    if (roomID != "") {
      localState.state.gameData.gameID = roomID;
      localState.state.myContainer.screenSwitch(Router.Character);
    }
  },
  async leaveRoom() {
    if (roomID == "") return;
    await myConnection.disconnect();
    roomID = "";
  },
  async findMatch() {
    console.log("here");
    let response = await client.findMatch(token, {}, 2, numPlayers => {
      console.log("Found", numPlayers);
    });
    console.log("result response: ", response);
  },
  async startGame() {
    await myConnection.startGame({});
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
    let rslt = await myConnection.joinGame({
      role: role,
      name: nickname,
      gender: gender,
      level: 1,
    });
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
    let m = await myConnection.sendMessage(message);
    console.log(`response from server :`, m);
  },
  async seenChat(msgID: number) {
    const message: ISeenMessageRequest = {
      msgID: msgID,
    };
    let m = await myConnection.seenMessage(message);
    console.log(`response from server :`, m);
  },
  setupGame() {},
  async startTurn() {
    let m = await myConnection.startTurn({});
    console.log("m is: ", m);
  },
  async passives() {
    let m = await myConnection.runMonsterPassives({});
    console.log(`response from server :`, m);
  },
  async playTD(cardID: string) {
    let m = await myConnection.playTD({ cardID: cardID });
    console.log(`response from server :`, m);
  },
  async enableM() {
    let m = await myConnection.enableMonsters({});
    console.log(`response from server :`, m);
  },
  async playMcard(cardID: string) {
    let m = await myConnection.playMonster({ cardID: cardID });
    console.log(`response from server :`, m);
  },
  async showPcard() {
    let m = await myConnection.enablePlayer({});
    console.log(`response from server :`, m);
  },
  async showCardPool() {
    let m = await myConnection.enableCardPool({});
    console.log(`response from server :`, m);
  },
  async buyCard(cardID: string) {
    let m = await myConnection.buyFromCardPool({ cardID: cardID });
    console.log(`response from server :`, m);
  },
  async doneBuyingCards() {
    let m = await myConnection.closeCardPool({});
    console.log(`response from server :`, m);
  },
  async endTurn() {
    let m = await myConnection.endRound({});
    console.log(`response from server :`, m);
  },
  async enableMonsterDamage() {
    let m = await myConnection.enableMonsterDamage({});
    console.log(`response from server :`, m);
  },
  async monsterDamageDone() {
    let m = await myConnection.disableMonsterDamage({});
    console.log(`response from server :`, m);
  },
  async applyDamage(cardID: string) {
    let m = await myConnection.applyMonsterDamage({ cardID: cardID });
    console.log(`response from server :`, m);
  },
  async playPcard(cardID: string) {
    let m = await myConnection.playPlayerCard({ cardID: cardID });
    console.log(`response from server :`, m);
  },
  async userResponse(response: any) {
    let resp: UserResponse = {
      Callback: response.Callback,
      Response: response.Response,
    };
    let m = await myConnection.userResponse({
      response: resp,
    });
    console.log(`response from server :`, m);
  },
  async playerDone() {
    let m = await myConnection.playerHandComplete({});
    console.log(`response from server :`, m);
  },
};
