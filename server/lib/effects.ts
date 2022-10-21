import { ABCard, GameState, HathoraEventTypes, RoundState, StatusEffects } from "../../api/types";
import { Context } from "../.hathora/methods";
import { InternalState, locationDeck } from "../impl";
import { reshuffleDeck } from "./util";

type Callbacks = typeof callbacks;
type CallbackName = keyof Callbacks;

let userResponseFlag = false;

export const resetUserResponse = () => {
  userResponseFlag = false;
};

export const executeCallback = (callback: string, state: InternalState, index: number, ctx: Context) => {
  callbacks[callback as CallbackName](state, index, ctx);
};

const noDraw = (state: InternalState, index: number, ctx: Context) => {
  const isAlreadyThere = state.players[index].statusEffects.findIndex(s => {
    return s == StatusEffects.NoDraw;
  });

  if (isAlreadyThere != -1) return;
  state.players[index].statusEffects.push(StatusEffects.NoDraw);
};

const ifActiveHeroLosesOneHealthLocationCurse = (state: InternalState, index: number, ctx: Context) => {
  const isAlreadyThere = state.players[index].statusEffects.findIndex(s => {
    return s == StatusEffects.LocationCursed;
  });

  if (isAlreadyThere != -1) return;
  state.players[index].statusEffects.push(StatusEffects.LocationCursed);
};

const ifDiscardLose1Health = (state: InternalState, index: number, ctx: Context) => {
  const isAlreadyThere = state.players[index].statusEffects.findIndex(s => {
    return s == StatusEffects.DiscardCurse;
  });

  if (isAlreadyThere != -1) return;
  state.players[index].statusEffects.push(StatusEffects.DiscardCurse);
};

const removeStatuseffect = (state: InternalState, index: number, ctx: Context) => {
  //get callback
  let curseIndex;
  switch (state.activeMonsters[0].PassiveEffect?.callback) {
    case "ifDiscardLose1Health":
      curseIndex = state.players[index].statusEffects.findIndex(se => se == StatusEffects.DiscardCurse);
      if (curseIndex != -1) state.players[index].statusEffects.splice(curseIndex, 1);
      break;
    case "ifActiveHeroLosesOneHealthLocationCurse":
      curseIndex = state.players[index].statusEffects.findIndex(se => se == StatusEffects.LocationCursed);
      if (curseIndex != -1) state.players[index].statusEffects.splice(curseIndex, 1);
      break;
  }
  ctx.broadcastEvent(HathoraEventTypes.default, "STATUSEFFECT ADDED");
};

const noHeal = (state: InternalState, index: number, ctx: Context) => {
  const isAlreadyThere = state.players[index].statusEffects.findIndex(s => {
    return s == StatusEffects.NoHeal;
  });
  if (isAlreadyThere != -1) return;
  state.players[index].statusEffects.push(StatusEffects.NoHeal);
};

const addAttack1ifMonsterDefeated = (state: InternalState, index: number, ctx: Context) => {
  const isAlreadyThere = state.players[index].statusEffects.findIndex(s => {
    return s == StatusEffects.MonsterBonus;
  });
  if (isAlreadyThere != -1) return;
  state.players[index].statusEffects.push(StatusEffects.MonsterBonus);
};

const loseOneHealth = (state: InternalState, index: number, ctx: Context) => {
  //check if stunned
  const isStunned = state.players[index].statusEffects.findIndex(se => se == StatusEffects.Stunned);
  if (isStunned != -1) return;

  //check if need to stun
  console.log("player health: ", state.players[index].health);
  if (state.players[index].health <= 1) {
    //player will be stunned
    console.log("stunning player");
    stunPlayer(state, index, ctx);
  } else {
    if (state.players[index]) state.players[index].health -= 1;
    ctx.broadcastEvent(HathoraEventTypes.default, "Lose1Health");
  }
};

const loseTwoHealth = (state: InternalState, index: number, ctx: Context) => {
  //check if stunned
  const isStunned = state.players[index].statusEffects.findIndex(se => se == StatusEffects.Stunned);
  if (isStunned != -1) return;

  //check if need to stun
  console.log("player health: ", state.players[index].health);
  if (state.players[index].health <= 2) {
    //player will be stunned
    console.log("stunning player");
    stunPlayer(state, index, ctx);
  } else {
    if (state.players[index]) state.players[index].health -= 2;
    ctx.broadcastEvent(HathoraEventTypes.default, "Lose2Health");
  }
};

export const addOneLocationPoint = (state: InternalState, index: number, ctx: Context) => {
  if (state.Location) state.Location.damage += 1;
  ctx.broadcastEvent(HathoraEventTypes.default, "add1toLocation");
  if (
    state.players[index].statusEffects.some(se => {
      return se == StatusEffects.LocationCursed;
    })
  ) {
    //found location curse
    ctx.broadcastEvent(HathoraEventTypes.default, "locationCurseEffect");
    state.players[index].health -= 1;
    ctx.broadcastEvent(HathoraEventTypes.default, "Lose1Health");
  }

  //check for lost location
  if (state.Location?.damage == state.Location?.health) {
    //location lost
    ctx.broadcastEvent(HathoraEventTypes.default, "LocationLost");

    //next location check
    if (locationDeck.length > 0) {
      state.Location = locationDeck.pop(); //Location Cards
      ctx.broadcastEvent(HathoraEventTypes.default, "newlocation");
    } else {
      ctx.broadcastEvent(HathoraEventTypes.default, "LOST");
      state.roundState = RoundState.idle;
      state.gameState = GameState.GameOver;
    }
  }
};

const addAttack1 = (state: InternalState, index: number, ctx: Context) => {
  if (state.players[index]) state.players[index].attack += 1;
  ctx.broadcastEvent(HathoraEventTypes.default, "+1Attack");
};

const addHealth1 = (state: InternalState, index: number, ctx: Context) => {
  //check if stunned
  const isStunned = state.players[index].statusEffects.findIndex(se => se == StatusEffects.Stunned);
  if (isStunned != -1) return;

  if (state.players[index].health < 10) state.players[index].health += 1;
  ctx.broadcastEvent(HathoraEventTypes.default, "+1Health");
};

const addAbility2 = (state: InternalState, index: number, ctx: Context) => {
  if (state.players[index]) state.players[index].coin += 2;
  ctx.broadcastEvent(HathoraEventTypes.default, "+2Coin");
};

const addAbility1 = (state: InternalState, index: number, ctx: Context) => {
  if (state.players[index]) state.players[index].coin += 1;
  ctx.broadcastEvent(HathoraEventTypes.default, "+1Coin");
};

const addAttack1Ability1 = (state: InternalState, index: number, ctx: Context) => {
  if (state.players[index]) state.players[index].coin += 1;
  if (state.players[index]) state.players[index].attack += 1;
  ctx.broadcastEvent(HathoraEventTypes.default, "+1Coin");
  ctx.broadcastEvent(HathoraEventTypes.default, "+1Attack");
};

const addAbility1Draw1 = (state: InternalState, index: number, ctx: Context) => {
  if (state.players[index]) state.players[index].coin += 1;
  ctx.broadcastEvent(HathoraEventTypes.default, "+1Coin");

  //check for draw curse
  const isCurseActive = state.players[index].statusEffects.findIndex(se => se == StatusEffects.NoDraw);
  if (isCurseActive == -1) {
    //draw from deck
    if (state.players[index].deck.length == 0)
      state.players[index].deck.push(
        ...ctx.chance.shuffle([...state.players[index].deck.splice(0), ...state.players[index].discard.splice(0)])
      ); //reshuffleDeck(ctx, state.players[index].deck, state.players[index].discard);

    const myCard = state.players[index].deck.pop()!; //Draw Card
    state.players[index].hand.push(myCard);
    ctx.broadcastEvent(HathoraEventTypes.default, "draw");
  } else {
    ctx.broadcastEvent(HathoraEventTypes.default, "drawBlocked");
  }
};

const addAttack1Draw1 = (state: InternalState, index: number, ctx: Context) => {
  if (state.players[index]) state.players[index].attack += 1;
  ctx.broadcastEvent(HathoraEventTypes.default, "+1Attack");

  //check for draw curse
  const isCurseActive = state.players[index].statusEffects.findIndex(se => se == StatusEffects.NoDraw);
  if (isCurseActive == -1) {
    //draw from deck
    if (state.players[index].deck.length == 0)
      state.players[index].deck.push(
        ...ctx.chance.shuffle([...state.players[index].deck.splice(0), ...state.players[index].discard.splice(0)])
      ); //reshuffleDeck(ctx, state.players[index].deck, state.players[index].discard);

    const myCard = state.players[index].deck.pop()!; //Draw Card
    state.players[index].hand.push(myCard);
    ctx.broadcastEvent(HathoraEventTypes.default, "draw");
  } else {
    ctx.broadcastEvent(HathoraEventTypes.default, "drawBlocked");
  }
};

const addHealth1Ability1 = (state: InternalState, index: number, ctx: Context) => {
  if (state.players[index]) state.players[index].coin += 1;
  ctx.broadcastEvent(HathoraEventTypes.default, "+1Coin");

  //check if stunned
  const isStunned = state.players[index].statusEffects.findIndex(se => se == StatusEffects.Stunned);
  if (isStunned == -1 && state.players[index].health < 10) {
    if (state.players[index]) state.players[index].health += 1;
    ctx.broadcastEvent(HathoraEventTypes.default, "+1Health");
  }
};

const addAttack1ToAHaddHealth1ToAll = (state: InternalState, index: number, ctx: Context) => {
  if (state.players[index]) state.players[index].attack += 1;
  ctx.broadcastEvent(HathoraEventTypes.default, "+1Attack");
  state.players.forEach((p, i) => {
    if (i != index && p.health < 10) p.health += 1;
  });
  ctx.broadcastEvent(HathoraEventTypes.default, "+1HealthtoAllOthers");
};

const removeLocationPoint = (state: InternalState, index: number, ctx: Context) => {
  if (state.Location?.damage == 0) return;
  if (state.Location) state.Location.damage -= 1;
  ctx.broadcastEvent(HathoraEventTypes.default, "remove1fromLocation");
};

const chooseAttack1Ability1 = (state: InternalState, index: number, ctx: Context) => {
  if (!userResponseFlag) {
    ctx.broadcastEvent(HathoraEventTypes.default, "chooseAttack1Ability1");
    userResponseFlag = true;
  } else {
    userResponseFlag = false;
    if (state.responseData.response == "Attack") {
      if (state.players[index]) state.players[index].attack += 1;
      ctx.broadcastEvent(HathoraEventTypes.default, "+1Attack");
    } else if (state.responseData.response == "Coin") {
      if (state.players[index]) state.players[index].coin += 1;
      ctx.broadcastEvent(HathoraEventTypes.default, "+1Coin");
    }
  }
};

const chooseHealth1Ability1 = (state: InternalState, index: number, ctx: Context) => {
  if (!userResponseFlag) {
    ctx.broadcastEvent(HathoraEventTypes.default, "chooseHealth1Ability1");
    userResponseFlag = true;
  } else {
    userResponseFlag = false;
    if (state.responseData.response == "Health") {
      //check if stunned
      const isStunned = state.players[index].statusEffects.findIndex(se => se == StatusEffects.Stunned);
      if (isStunned != -1) return;
      if (state.players[index].health < 10) state.players[index].health += 1;
      ctx.broadcastEvent(HathoraEventTypes.default, "+1Health");
    } else if (state.responseData.response == "Coin") {
      if (state.players[index]) state.players[index].coin += 1;
      ctx.broadcastEvent(HathoraEventTypes.default, "+1Coin");
    }
  }
};
const chooseAttack1Draw1 = (state: InternalState, index: number, ctx: Context) => {
  if (!userResponseFlag) {
    ctx.broadcastEvent(HathoraEventTypes.default, "chooseAttack1Draw1");
    userResponseFlag = true;
  } else {
    userResponseFlag = false;
    if (state.responseData.response == "Attack") {
      if (state.players[index]) state.players[index].attack += 1;
      ctx.broadcastEvent(HathoraEventTypes.default, "+1Attack");
    } else if (state.responseData.response == "draw") {
      //check for draw curse
      const isCurseActive = state.players[index].statusEffects.findIndex(se => se == StatusEffects.NoDraw);
      if (isCurseActive == -1) {
        //draw from deck
        if (state.players[index].deck.length == 0)
          state.players[index].deck.push(
            ...ctx.chance.shuffle([...state.players[index].deck.splice(0), ...state.players[index].discard.splice(0)])
          ); //reshuffleDeck(ctx, state.players[index].deck, state.players[index].discard);

        const myCard = state.players[index].deck.pop()!; //Draw Card
        state.players[index].hand.push(myCard);
        ctx.broadcastEvent(HathoraEventTypes.default, "draw");
      } else {
        ctx.broadcastEvent(HathoraEventTypes.default, "drawBlocked");
      }
    }
  }
};
const chooseAbility1Draw1 = (state: InternalState, index: number, ctx: Context) => {
  if (!userResponseFlag) {
    ctx.broadcastEvent(HathoraEventTypes.default, "chooseAbility1Draw1");
    userResponseFlag = true;
  } else {
    userResponseFlag = false;
    if (state.responseData.response == "Coin") {
      if (state.players[index]) state.players[index].coin += 1;
      ctx.broadcastEvent(HathoraEventTypes.default, "+1Coin");
    } else if (state.responseData.response == "draw") {
      const isCurseActive = state.players[index].statusEffects.findIndex(se => se == StatusEffects.NoDraw);
      if (isCurseActive == -1) {
        //draw from deck
        if (state.players[index].deck.length == 0)
          state.players[index].deck.push(
            ...ctx.chance.shuffle([...state.players[index].deck.splice(0), ...state.players[index].discard.splice(0)])
          ); //reshuffleDeck(ctx, state.players[index].deck, state.players[index].discard);

        const myCard = state.players[index].deck.pop()!; //Draw Card
        state.players[index].hand.push(myCard);
        ctx.broadcastEvent(HathoraEventTypes.default, "draw");
      } else {
        ctx.broadcastEvent(HathoraEventTypes.default, "drawBlocked");
      }
    }
  }
};

const draw2discard1 = (state: InternalState, index: number, ctx: Context) => {
  const isCurseActive = state.players[index].statusEffects.findIndex(se => se == StatusEffects.NoDraw);
  if (isCurseActive == -1) {
    //draw from deck
    if (state.players[index].deck.length == 0)
      state.players[index].deck.push(
        ...ctx.chance.shuffle([...state.players[index].deck.splice(0), ...state.players[index].discard.splice(0)])
      ); //reshuffleDeck(ctx, state.players[index].deck, state.players[index].discard);

    let myCard = state.players[index].deck.pop()!; //Draw Card
    state.players[index].hand.push(myCard);
    if (state.players[index].deck.length == 0)
      state.players[index].deck.push(
        ...ctx.chance.shuffle([...state.players[index].deck.splice(0), ...state.players[index].discard.splice(0)])
      ); //reshuffleDeck(ctx, state.players[index].deck, state.players[index].discard);

    myCard = state.players[index].deck.pop()!; //Draw Card
    state.players[index].hand.push(myCard);
    ctx.broadcastEvent(HathoraEventTypes.default, "draw2");
  } else {
    ctx.broadcastEvent(HathoraEventTypes.default, "drawBlocked");
  }
  ctx.broadcastEvent(HathoraEventTypes.default, "discard");
};

const Draw1Discard1 = (state: InternalState, index: number, ctx: Context) => {
  const isCurseActive = state.players[index].statusEffects.findIndex(se => se == StatusEffects.NoDraw);
  if (isCurseActive == -1) {
    //draw from deck
    if (state.players[index].deck.length == 0)
      state.players[index].deck.push(
        ...ctx.chance.shuffle([...state.players[index].deck.splice(0), ...state.players[index].discard.splice(0)])
      ); //reshuffleDeck(ctx, state.players[index].deck, state.players[index].discard);

    const myCard = state.players[index].deck.pop()!; //Draw Card
    state.players[index].hand.push(myCard);
    ctx.broadcastEvent(HathoraEventTypes.default, "draw");
  } else {
    ctx.broadcastEvent(HathoraEventTypes.default, "drawBlocked");
  }
  ctx.broadcastEvent(HathoraEventTypes.default, "discard");
};

const chooseHealth1Draw1 = (state: InternalState, index: number, ctx: Context) => {
  if (!userResponseFlag) {
    ctx.broadcastEvent(HathoraEventTypes.default, "chooseHealth1Draw1");
    userResponseFlag = true;
  } else {
    userResponseFlag = false;
    if (state.responseData.response == "Health") {
      //check if stunned
      const isStunned = state.players[index].statusEffects.findIndex(se => se == StatusEffects.Stunned);
      if (isStunned != -1) return;
      if (state.players[index].health < 10) state.players[index].health += 1;
      ctx.broadcastEvent(HathoraEventTypes.default, "+1Health");
    } else if (state.responseData.response == "draw") {
      const isCurseActive = state.players[index].statusEffects.findIndex(se => se == StatusEffects.NoDraw);
      if (isCurseActive == -1) {
        //draw from deck
        if (state.players[index].deck.length == 0)
          state.players[index].deck.push(
            ...ctx.chance.shuffle([...state.players[index].deck.splice(0), ...state.players[index].discard.splice(0)])
          ); //reshuffleDeck(ctx, state.players[index].deck, state.players[index].discard);

        const myCard = state.players[index].deck.pop()!; //Draw Card
        state.players[index].hand.push(myCard);
        ctx.broadcastEvent(HathoraEventTypes.default, "draw");
      } else {
        ctx.broadcastEvent(HathoraEventTypes.default, "drawBlocked");
      }
    }
  }
};

const addHealth1anyPlayer = (state: InternalState, index: number, ctx: Context) => {
  if (!userResponseFlag) {
    ctx.broadcastEvent(HathoraEventTypes.default, "addHealth1anyPlayer");
    userResponseFlag = true;
  } else {
    userResponseFlag = false;
    let playerChosen = state.responseData.response;
    let pIndex = state.players.findIndex(p => p.name == playerChosen);

    //check if stunned
    const isStunned = state.players[pIndex].statusEffects.findIndex(se => se == StatusEffects.Stunned);
    if (isStunned != -1) return;

    if (state.players[pIndex].health < 10) {
      state.players[pIndex].health += 1;
      switch (pIndex) {
        case 0:
          ctx.broadcastEvent(HathoraEventTypes.default, "player1health");
          break;
        case 1:
          ctx.broadcastEvent(HathoraEventTypes.default, "player2health");
          break;
        case 2:
          ctx.broadcastEvent(HathoraEventTypes.default, "player3health");
          break;
        case 3:
          ctx.broadcastEvent(HathoraEventTypes.default, "player4health");
          break;
      }
    }
  }
};

const addCoin1anyPlayer = (state: InternalState, index: number, ctx: Context) => {
  if (!userResponseFlag) {
    ctx.broadcastEvent(HathoraEventTypes.default, "addCoin1anyPlayer");
    userResponseFlag = true;
  } else {
    userResponseFlag = false;
    let playerChosen = state.responseData.response;

    let pIndex = state.players.findIndex(p => p.name == playerChosen);
    state.players[pIndex].coin += 1;

    switch (pIndex) {
      case 0:
        ctx.broadcastEvent(HathoraEventTypes.default, "player1coin");
        break;
      case 1:
        ctx.broadcastEvent(HathoraEventTypes.default, "player2coin");
        break;
      case 2:
        ctx.broadcastEvent(HathoraEventTypes.default, "player3coin");
        break;
      case 3:
        ctx.broadcastEvent(HathoraEventTypes.default, "player4coin");
        break;
    }
  }
};

const allHereosGain1Health = (state: InternalState, index: number, ctx: Context) => {
  state.players.forEach(p => {
    if (p.health < 10) addHealth1(state, index, ctx);
  });
};

const allHereosDrawOne = (state: InternalState, index: number, ctx: Context) => {
  state.players.forEach(p => {
    const isCurseActive = p.statusEffects.findIndex(se => se == StatusEffects.NoDraw);
    if (isCurseActive == -1) {
      //draw from deck
      if (p.deck.length == 0) p.deck.push(...ctx.chance.shuffle([...p.deck.splice(0), ...p.discard.splice(0)]));

      const myCard = p.deck.pop()!; //Draw Card
      p.hand.push(myCard);
      ctx.sendEvent(HathoraEventTypes.default, "draw", p.id);
    } else {
      ctx.sendEvent(HathoraEventTypes.default, "drawblocked", p.id);
    }
  });
};

const discard = (state: InternalState, index: number, ctx: Context) => {
  let cardToRemove = state.responseData.response;

  //check for discard curse
  const isCurseActive = state.players[index].statusEffects.findIndex(se => se == StatusEffects.DiscardCurse);
  if (isCurseActive != -1) {
    ctx.broadcastEvent(HathoraEventTypes.default, "discardcurse");
    loseOneHealth(state, index, ctx);
  }

  let CIndex = state.players[index].hand.findIndex(c => c.id === cardToRemove);
  if (CIndex != -1) {
    state.players[index].hand.splice(CIndex, 1);
    ctx.broadcastEvent(HathoraEventTypes.default, "discarded");
  }
};

const stunPlayer = (state: InternalState, index: number, ctx: Context) => {
  state.players[index].health = 0;
  addOneLocationPoint(state, index, ctx);
  //lose half your cards
  const numCardsToLose = Math.ceil(state.players[index].hand.length / 2);
  for (let x = 0; x < numCardsToLose; x++) {
    let cardIndex = Math.floor(Math.random() * state.players[index].hand.length);
    state.players[index].hand.splice(cardIndex, 1);
  }
  state.players[index].statusEffects.push(StatusEffects.Stunned);
  ctx.broadcastEvent(HathoraEventTypes.default, "STUNNED");
};

const callbacks = {
  noHeal,
  noDraw,
  ifActiveHeroLosesOneHealthLocationCurse,
  ifDiscardLose1Health,
  addAttack1ifMonsterDefeated,
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
  addCoin1anyPlayer,
  draw2discard1,
  Draw1Discard1,
  removeLocationPoint,
  chooseHealth1Draw1,
  addAttack1ToAHaddHealth1ToAll,
  discard,
  allHereosDrawOne,
  allHereosGain1Health,
  removeStatuseffect,
} as const;
