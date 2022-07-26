import { HathoraClient, HathoraConnection, UpdateArgs } from "../../.hathora/client";
import { AnonymousUserData } from "../../../api/base";
import { Router } from "./components/index";

import userIcon from "./assets/toast/whiteuser.png";
import locationIcon from "./assets/toast/whitebuilding.png";
import monsterIcon from "./assets/toast/whitemonster.png";
import cardIcon from "./assets/toast/whitecard.png";
import effectIcon from "./assets/toast/whiteeffect.png";

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
    //if (sessionStorage.getItem("token") === null) {
    //sessionStorage.setItem("token", await client.loginAnonymous());
    //}
    //token = sessionStorage.getItem("token");
    //user = HathoraClient.getUserFromToken(token);
    localState.playerData.username = "testname"; //user.name;
    localState.myContainer.screenSwitch(Router.Lobby);
  },
  emitEvent(name: string, detail: CustomEventInit) {
    console.log("now here");
    const event = new CustomEvent(name, {
      detail,
    });
    document.dispatchEvent(event);
  },
  toastMessage(icontype: "user" | "location" | "monster" | "card" | "effect", msg: string) {
    let icon: string;

    let iconMap = {
      user: userIcon,
      location: locationIcon,
      monster: monsterIcon,
      card: cardIcon,
      effect: effectIcon,
    };

    localState.state.myToast.messages.push({
      message: msg,
      icon: iconMap[icontype],
      timeout: 5000,
      timerID: null,
      close: (event, model) => {
        console.log("event: ", event);
        console.log("model: ", model);

        let elem = event.target;
        let id = elem.dataset.id;
        let containerElem = document.querySelector(`[data-sid=\"${id}\"]`);
        containerElem.classList.add("toast_entry_close");
        let responseArray = id.split("msg-");
        let msgIndex = parseInt(responseArray[1]);
        setTimeout(() => {
          localState.state.myToast.messages.splice(msgIndex, 1);
        }, 750);
      },
      hover: (event, model) => {
        let elem = event.target;
        elem.classList.remove("bloom");
        let id = elem.dataset.id;
        let nextElem = document.querySelector(`[data-tid=\"${id}\"]`);
        nextElem.classList.add("wide");
        model.timerID = setTimeout(() => {
          let spanElem = document.querySelector(`[data-sid=\"${id}\"]`);
          spanElem.classList.remove("hidden");
          model.timerID = null;
        }, 200);
      },
      leave: (event, model) => {
        let elem = event.target;
        let id = elem.dataset.id;
        let nextElem = document.querySelector(`[data-tid=\"${id}\"]`);
        nextElem.classList.remove("wide");
        let spanElem = document.querySelector(`[data-sid=\"${id}\"]`);
        if (model.timerID) {
          clearTimeout(model.timerID);
          model.timerID = null;
        }
        spanElem.classList.add("hidden");
      },
    });
  },
};
