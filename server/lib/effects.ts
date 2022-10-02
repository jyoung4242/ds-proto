import { StatusEffects } from "../../api/types";
import { Context } from "../.hathora/methods";
import { InternalState } from "../impl";

type Callbacks = typeof callbacks;
type CallbackName = keyof Callbacks;

export const executeCallback = (callback: string, state: InternalState, index: number, ctx: Context) => {
  console.log("effects 8, running callback: ", callback);
  callbacks[callback as CallbackName](state, index, ctx);
};

const noDraw = (state: InternalState, index: number, ctx: Context) => {
  //if noDraw doesn't current exist
  const isAlreadyThere = state.players[index].statusEffects.findIndex(s => {
    return s == StatusEffects.NoDraw;
  });
  if (isAlreadyThere != -1) return;
  state.players[index].statusEffects.push(StatusEffects.NoDraw);
  ctx.broadcastEvent("STATUSEFFECT ADDED");
};

const ifActiveHeroLosesOneHealthLocationCurse = (state: InternalState, index: number, ctx: Context) => {
  //if Location Curse doesn't current exist
  const isAlreadyThere = state.players[index].statusEffects.findIndex(s => {
    return s == StatusEffects.LocationCursed;
  });
  if (isAlreadyThere != -1) return;
  state.players[index].statusEffects.push(StatusEffects.LocationCursed);
};

const ifDiscardLose1Health = (state: InternalState, index: number, ctx: Context) => {
  //if Discard doesn't current exist
  const isAlreadyThere = state.players[index].statusEffects.findIndex(s => {
    return s == StatusEffects.DiscardCurse;
  });
  if (isAlreadyThere != -1) return;
  state.players[index].statusEffects.push(StatusEffects.DiscardCurse);
};

const stunned = (state: InternalState, index: number, ctx: Context) => {};
const noHeal = (state: InternalState, index: number, ctx: Context) => {};
const loseTwoHealth = (state: InternalState, index: number, ctx: Context) => {
  console.log("lose 2 health", index);
  if (state.players[index]) state.players[index].health -= 2;
  console.log("new health", state.players[index].health);
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

const callbacks = {
  stunned,
  noHeal,
  noDraw,
  ifActiveHeroLosesOneHealthLocationCurse,
  ifDiscardLose1Health,
  loseTwoHealth,
  addOneLocationPoint,
  loseOneHealth,
} as const;
