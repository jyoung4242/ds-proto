import { HathoraClient, HathoraConnection, StateId, UpdateArgs } from "../../.hathora/client";
import { AnonymousUserData } from "../../../api/base";
import { Router } from "./components/index";

import userIcon from "./assets/toast/whiteuser.png";
import locationIcon from "./assets/toast/whitebuilding.png";
import monsterIcon from "./assets/toast/whitemonster.png";
import cardIcon from "./assets/toast/whitecard.png";
import effectIcon from "./assets/toast/whiteeffect.png";
import { Gender, IInitializeRequest, Roles } from "../../../api/types";
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
  async joinGame(roomID: string) {
    const config: IInitializeRequest = {};
    myConnection = await client.connect(token, roomID, localState.updateArgs, localState.onError);
    if (roomID != "") localState.state.myContainer.screenSwitch(Router.Character);
  },
  async leaveRoom() {
    if (roomID == "") return;
    myConnection.disconnect();
    roomID = "";
  },
  async findMatch() {
    console.log("here");
    let response = await client.findMatch(token, {}, 2, numPlayers => {
      console.log("Found", numPlayers);
    });
    console.log("result response: ", response);
  },
  playGameMusic() {
    //titlesong.fade(0.5, 0, 0.25);
    //gamesong.play();
  },
  playSound(sound: string) {
    sfx.play(sound);
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
    console.log("joing game response ", rslt);
  },
};
