import { HathoraClient, HathoraConnection, StateId, UpdateArgs } from "../../.hathora/client";
import { AnonymousUserData } from "../../../api/base";
import { Router } from "./components/index";

import userIcon from "./assets/toast/whiteuser.png";
import locationIcon from "./assets/toast/whitebuilding.png";
import monsterIcon from "./assets/toast/whitemonster.png";
import cardIcon from "./assets/toast/whitecard.png";
import effectIcon from "./assets/toast/whiteeffect.png";
import { IInitializeRequest } from "../../../api/types";

/**********************************************************
 * Hathora Client variables
 *********************************************************/
const client = new HathoraClient();
let token: string;
let user: AnonymousUserData;
let myConnection: HathoraConnection;
let roomID: StateId;

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
    console.log("data: ", user, localState);
    localState.state.playerData.username = "testname"; //; //user.name
    localState.state.myContainer.screenSwitch(Router.Lobby);
  },
  emitEvent(name: string, detail: CustomEventInit) {
    console.log("now here");
    const event = new CustomEvent(name, {
      detail,
    });
    document.dispatchEvent(event);
  },
  async createGame() {
    const config: IInitializeRequest = {};
    roomID = "";
    roomID = await client.create(token, config);
    console.log("room: ", roomID);
    if (roomID != "") localState.state.myContainer.screenSwitch(Router.Character);
  },
  async joinGame(roomID: string) {
    const config: IInitializeRequest = {};
    client.connect(token, roomID, localState.updateArgs, localState.onError);
    if (roomID != "") localState.state.myContainer.screenSwitch(Router.Character);
  },
};
