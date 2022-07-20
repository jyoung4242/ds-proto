import { HathoraClient, HathoraConnection, UpdateArgs } from "../../.hathora/client";
import { AnonymousUserData } from "../../../api/base";
import { GameComponent, Router } from "./components/index";

/**********************************************************
 * Hathora Client variables
 *********************************************************/
const client = new HathoraClient();
let token: string;
let user: AnonymousUserData;
let myConnection: HathoraConnection;

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
    localState.playerData.username = user.name;
    localState.myContainer.screenSwitch(Router.Lobby);
  },
  emitEvent(name: string, detail: CustomEventInit) {
    console.log("now here");
    const event = new CustomEvent(name, {
      detail,
    });
    document.dispatchEvent(event);
  },
};
