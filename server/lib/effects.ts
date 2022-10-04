import { StatusEffects } from "../../api/types";
import { Context } from "../.hathora/methods";
import { InternalState } from "../impl";
import { reshuffleDeck } from "./util";

type Callbacks = typeof callbacks;
type CallbackName = keyof Callbacks;

let userResponseFlag = false;

export const executeCallback = (callback: string, state: InternalState, index: number, ctx: Context) => {
  callbacks[callback as CallbackName](state, index, ctx);
};

const noDraw = (state: InternalState, index: number, ctx: Context) => {
  const isAlreadyThere = state.players[index].statusEffects.findIndex(s => {
    return s == StatusEffects.NoDraw;
  });

  if (isAlreadyThere != -1) return;
  state.players[index].statusEffects.push(StatusEffects.NoDraw);
  ctx.broadcastEvent("STATUSEFFECT ADDED");
};

const ifActiveHeroLosesOneHealthLocationCurse = (state: InternalState, index: number, ctx: Context) => {
  const isAlreadyThere = state.players[index].statusEffects.findIndex(s => {
    return s == StatusEffects.LocationCursed;
  });

  if (isAlreadyThere != -1) return;
  state.players[index].statusEffects.push(StatusEffects.LocationCursed);
  ctx.broadcastEvent("STATUSEFFECT ADDED");
};

const ifDiscardLose1Health = (state: InternalState, index: number, ctx: Context) => {
  const isAlreadyThere = state.players[index].statusEffects.findIndex(s => {
    return s == StatusEffects.DiscardCurse;
  });

  if (isAlreadyThere != -1) return;
  state.players[index].statusEffects.push(StatusEffects.DiscardCurse);
  ctx.broadcastEvent("STATUSEFFECT ADDED");
};

const stunned = (state: InternalState, index: number, ctx: Context) => {
  const isAlreadyThere = state.players[index].statusEffects.findIndex(s => {
    return s == StatusEffects.Stunned;
  });

  if (isAlreadyThere != -1) return;
  state.players[index].statusEffects.push(StatusEffects.Stunned);
  ctx.broadcastEvent("STUNNED");
};

const noHeal = (state: InternalState, index: number, ctx: Context) => {
  const isAlreadyThere = state.players[index].statusEffects.findIndex(s => {
    return s == StatusEffects.NoHeal;
  });
  if (isAlreadyThere != -1) return;
  state.players[index].statusEffects.push(StatusEffects.NoHeal);
  ctx.broadcastEvent("STATUSEFFECT ADDED");
};

const addHealth1ifMonsterDefeated = (state: InternalState, index: number, ctx: Context) => {
  const isAlreadyThere = state.players[index].statusEffects.findIndex(s => {
    return s == StatusEffects.MonsterBonus;
  });
  if (isAlreadyThere != -1) return;
  state.players[index].statusEffects.push(StatusEffects.MonsterBonus);
  ctx.broadcastEvent("STATUSEFFECT ADDED");
};

const loseTwoHealth = (state: InternalState, index: number, ctx: Context) => {
  if (state.players[index]) state.players[index].health -= 2;
  ctx.broadcastEvent("Lose2Health");
};
const addOneLocationPoint = (state: InternalState, index: number, ctx: Context) => {
  console.trace("add to location, old value", state.Location?.damage);
  if (state.Location) state.Location.damage += 1;
  console.log("new location damage", state.Location?.damage);
  ctx.broadcastEvent("add1toLocation");
};
const loseOneHealth = (state: InternalState, index: number, ctx: Context) => {
  console.log("lose 1 health", state.players[index].health);
  if (state.players[index]) state.players[index].health -= 1;
  console.log("new health", state.players[index].health);
  ctx.broadcastEvent("Lose1Health");
};

const addAttack1 = (state: InternalState, index: number, ctx: Context) => {
  if (state.players[index]) state.players[index].attack += 1;
  ctx.broadcastEvent("+1Attack");
};

const addHealth1 = (state: InternalState, index: number, ctx: Context) => {
  if (state.players[index]) state.players[index].health += 1;
  ctx.broadcastEvent("+1Health");
};

const addAbility2 = (state: InternalState, index: number, ctx: Context) => {
  if (state.players[index]) state.players[index].coin += 2;
  ctx.broadcastEvent("+2Coin");
};

const addAbility1 = (state: InternalState, index: number, ctx: Context) => {
  if (state.players[index]) state.players[index].coin += 1;
  ctx.broadcastEvent("+1Coin");
};

const addAttack1Ability1 = (state: InternalState, index: number, ctx: Context) => {
  if (state.players[index]) state.players[index].coin += 1;
  if (state.players[index]) state.players[index].attack += 1;
  ctx.broadcastEvent("+1Coin");
  ctx.broadcastEvent("+1Attack");
};

const addAbility1Draw1 = (state: InternalState, index: number, ctx: Context) => {
  if (state.players[index]) state.players[index].coin += 1;
  //draw from deck
  if (state.players[index].deck.length == 0) reshuffleDeck(ctx, state.players[index].deck, state.players[index].discard);
  const myCard = state.players[index].deck.pop()!; //Draw Card
  state.players[index].hand.push(myCard);

  ctx.broadcastEvent("+1Coin");
  ctx.broadcastEvent("draw");
};

const addAttack1Draw1 = (state: InternalState, index: number, ctx: Context) => {
  if (state.players[index]) state.players[index].attack += 1;
  //draw from deck
  if (state.players[index].deck.length == 0) reshuffleDeck(ctx, state.players[index].deck, state.players[index].discard);
  const myCard = state.players[index].deck.pop()!; //Draw Card
  state.players[index].hand.push(myCard);

  ctx.broadcastEvent("+1Attack");
  ctx.broadcastEvent("draw");
};

const addHealth1Ability1 = (state: InternalState, index: number, ctx: Context) => {
  if (state.players[index]) state.players[index].coin += 1;
  if (state.players[index]) state.players[index].health += 1;
  ctx.broadcastEvent("+1Coin");
  ctx.broadcastEvent("+1Health");
};

const addAttack1ToAHaddHealth1ToAll = (state: InternalState, index: number, ctx: Context) => {
  if (state.players[index]) state.players[index].attack += 1;
  ctx.broadcastEvent("+1Attack");
  state.players.forEach((p, i) => {
    if (i != index) p.health += 1;
  });
  ctx.broadcastEvent("+1HealthtoAllOthers");
};

const removeLocationPoint = (state: InternalState, index: number, ctx: Context) => {
  if (state.Location?.damage == 0) return;
  if (state.Location) state.Location.damage -= 1;
  ctx.broadcastEvent("remove1fromLocation");
};

const chooseAttack1Ability1 = (state: InternalState, index: number, ctx: Context) => {
  if (!userResponseFlag) {
    ctx.broadcastEvent("chooseAttack1Ability1");
    userResponseFlag = true;
  } else {
    userResponseFlag = false;
    if (state.responseData.response == "Attack") {
      if (state.players[index]) state.players[index].attack += 1;
      ctx.broadcastEvent("+1Attack");
    } else if (state.responseData.response == "Coin") {
      if (state.players[index]) state.players[index].coin += 1;
      ctx.broadcastEvent("+1Coin");
    }
  }
};

const chooseHealth1Ability1 = (state: InternalState, index: number, ctx: Context) => {
  if (!userResponseFlag) {
    ctx.broadcastEvent("chooseHealth1Ability1");
    userResponseFlag = true;
  } else {
    userResponseFlag = false;
    if (state.responseData.response == "Health") {
      if (state.players[index]) state.players[index].health += 1;
      ctx.broadcastEvent("+1Health");
    } else if (state.responseData.response == "Coin") {
      if (state.players[index]) state.players[index].coin += 1;
      ctx.broadcastEvent("+1Coin");
    }
  }
};
const chooseAttack1Draw1 = (state: InternalState, index: number, ctx: Context) => {
  if (!userResponseFlag) {
    ctx.broadcastEvent("chooseAttack1Draw1");
    userResponseFlag = true;
  } else {
    userResponseFlag = false;
    if (state.responseData.response == "Attack") {
      if (state.players[index]) state.players[index].attack += 1;
      ctx.broadcastEvent("+1Attack");
    } else if (state.responseData.response == "draw") {
      if (state.players[index].deck.length == 0) reshuffleDeck(ctx, state.players[index].deck, state.players[index].discard);
      const myCard = state.players[index].deck.pop()!; //Draw Card
      state.players[index].hand.push(myCard);
      ctx.broadcastEvent("draw");
    }
  }
};
const chooseAbility1Draw1 = (state: InternalState, index: number, ctx: Context) => {
  if (!userResponseFlag) {
    ctx.broadcastEvent("chooseAbility1Draw1");
    userResponseFlag = true;
  } else {
    userResponseFlag = false;
    if (state.responseData.response == "Coin") {
      if (state.players[index]) state.players[index].coin += 1;
      ctx.broadcastEvent("+1Coin");
    } else if (state.responseData.response == "draw") {
      if (state.players[index].deck.length == 0) reshuffleDeck(ctx, state.players[index].deck, state.players[index].discard);
      const myCard = state.players[index].deck.pop()!; //Draw Card
      state.players[index].hand.push(myCard);
      ctx.broadcastEvent("draw");
    }
  }
};

const draw2discard1 = (state: InternalState, index: number, ctx: Context) => {
  if (!userResponseFlag) {
    if (state.players[index].deck.length == 0) reshuffleDeck(ctx, state.players[index].deck, state.players[index].discard);
    let myCard = state.players[index].deck.pop()!; //Draw Card
    state.players[index].hand.push(myCard);
    ctx.broadcastEvent("draw");
    myCard = state.players[index].deck.pop()!; //Draw Card
    state.players[index].hand.push(myCard);
    ctx.broadcastEvent("draw");
    userResponseFlag = true;
  } else {
    userResponseFlag = false;
    const cardindex = state.players[index].hand.findIndex(c => c.id === state.responseData.response);
    state.players[index].hand.splice(cardindex, 1);
    ctx.broadcastEvent("discard");
  }
};

const Draw1Discard1 = (state: InternalState, index: number, ctx: Context) => {
  if (!userResponseFlag) {
    if (state.players[index].deck.length == 0) reshuffleDeck(ctx, state.players[index].deck, state.players[index].discard);
    let myCard = state.players[index].deck.pop()!; //Draw Card
    state.players[index].hand.push(myCard);
    ctx.broadcastEvent("draw");
    userResponseFlag = true;
  } else {
    userResponseFlag = false;
    const cardindex = state.players[index].hand.findIndex(c => c.id === state.responseData.response);
    state.players[index].hand.splice(cardindex, 1);
    ctx.broadcastEvent("discard");
  }
};

const chooseHealth1Draw1 = (state: InternalState, index: number, ctx: Context) => {
  if (!userResponseFlag) {
    ctx.broadcastEvent("chooseHealth1Draw1");
    userResponseFlag = true;
  } else {
    userResponseFlag = false;
    if (state.responseData.response == "Health") {
      if (state.players[index]) state.players[index].health += 1;
      ctx.broadcastEvent("+1Health");
    } else if (state.responseData.response == "draw") {
      if (state.players[index].deck.length == 0) reshuffleDeck(ctx, state.players[index].deck, state.players[index].discard);
      const myCard = state.players[index].deck.pop()!; //Draw Card
      state.players[index].hand.push(myCard);
      ctx.broadcastEvent("draw");
    }
  }
};

const addHealth1anyPlayer = (state: InternalState, index: number, ctx: Context) => {
  if (!userResponseFlag) {
    ctx.broadcastEvent("addHealth1anyPlayer");
    userResponseFlag = true;
  } else {
    userResponseFlag = false;
    let playerChosen = state.responseData.response;
    let pIndex = state.players.findIndex(p => p.name === playerChosen);
    state.players[pIndex].health += 1;
    ctx.broadcastEvent("otherplayer+1Health");
  }
};

const callbacks = {
  stunned,
  noHeal,
  noDraw,
  ifActiveHeroLosesOneHealthLocationCurse,
  ifDiscardLose1Health,
  addHealth1ifMonsterDefeated,
  loseTwoHealth,
  addOneLocationPoint,
  loseOneHealth,
  addAttack1,
  addHealth1,
  chooseAttack1Ability1,
  addAbility2,
  chooseHealth1Ability1,
  addAttack1Draw1,
  addAbility1,
  addAttack1Ability1,
  addAbility1Draw1,
  chooseAttack1Draw1,
  addHealth1Ability1,
  chooseAbility1Draw1,
  addHealth1anyPlayer,
  draw2discard1,
  Draw1Discard1,
  removeLocationPoint,
  chooseHealth1Draw1,
  addAttack1ToAHaddHealth1ToAll,
} as const;
