import { Methods, Context } from "./.hathora/methods";
import { Response } from "../api/base";
import {
  AbilityCardTypes,
  Roles,
  Gender,
  RoundState,
  GameState,
  StatusEffects,
  Effect,
  EffectType,
  MCard,
  TDCard,
  ABCard,
  LCard,
  Player,
  UserState,
  UserId,
  IInitializeRequest,
  IJoinGameRequest,
  IStartGameRequest,
  IStartTurnRequest,
  IRunPlayerPassivesRequest,
  IRunMonsterPassivesRequest,
  IEnableTDRequest,
  IPlayTDRequest,
  IEnableMonstersRequest,
  IPlayMonsterRequest,
  IEnablePlayerRequest,
  IPlayPlayerCardRequest,
  IEnableMonsterDamageRequest,
  IApplyMonsterDamageRequest,
  IDisableMonsterDamageRequest,
  IEnableCardPoolRequest,
  IBuyFromCardPoolRequest,
  ICloseCardPoolRequest,
  IEndRoundRequest,
  ILeaveGameRequest,
  Message,
  ISendMessageRequest,
  ISeenMessageRequest,
  IUserResponseRequest,
  IPlayerHandCompleteRequest,
  HathoraEventTypes,
  BCAST,
} from "../api/types";

//importing decks
import MonsterLibrary from "./lib/monster";
import LocationLibrary from "./lib/locations";
import TDLibrary from "./lib/towerDefense";
import AbilityLibrary from "./lib/ability";
import BarbarianLibrary from "./lib/barbarian";
import WizardLibrary from "./lib/wizard";
import PaladinLibrary from "./lib/paladin";
import RogueLibrary from "./lib/rogue";
import {
  asyncAwait,
  dealPlayerCardsFromDeck,
  getNumberOfActiveMonstersWithActiveEvents,
  setPlayerDeckbyRole,
  setTurnOrder,
  setupAbilityCardDeck,
  setupActiveMonsters,
  setupCardPool,
  setupLocationDeck,
  setupMonsterDeck,
  setupNewPlayer,
  setupTowerDefenseDeck,
} from "./lib/util";
import { executeCallback, resetUserResponse } from "./lib/effects";

export type InternalState = {
  roundState: RoundState;
  gameState: GameState;
  activeMonsters: MCard[];
  turn?: UserId;
  players: Player[];
  TD?: TDCard;
  Location?: LCard;
  cardPool: ABCard[];
  turnOrder: UserId[];
  Messages: Message[];
  responseData: {
    response: string | undefined;
  };
};

//nonstate variables
let gameLevel: number;
let monsterDeck: MCard[] = [];
let towerDefenseDeck: TDCard[] = [];
export let locationDeck: LCard[] = [];
let abilityCardDeck: ABCard[] = [];
export let barbarianCardDeck: ABCard[] = [];
export let wizardCardDeck: ABCard[] = [];
export let paladinCardDeck: ABCard[] = [];
export let rogueCardDeck: ABCard[] = [];

const numberMonstersActiveByLevel: Array<number> = [1, 1, 2, 2, 3, 3, 3, 3];
let numberOfTDCardsForThisLocation: number = 0;
let numberOfActiveMonstersThatHaveActiveEvents: number = 0;

type PlayerDiscard = {
  user: UserId;
  pile: ABCard[];
};
const playerDiscards: PlayerDiscard[] = [];

const checkForValidHand = (hand: ABCard[]) => {
  //look through array for undefined cards
  hand.forEach(c => {
    if (!c) {
      console.trace("FAILED HAND CHECK");
      console.table(hand);
    }
  });
};

export class Impl implements Methods<InternalState> {
  initialize(ctx: Context, request: IInitializeRequest): InternalState {
    barbarianCardDeck = ctx.chance.shuffle(BarbarianLibrary);
    wizardCardDeck = ctx.chance.shuffle(WizardLibrary);
    paladinCardDeck = ctx.chance.shuffle(PaladinLibrary);
    rogueCardDeck = ctx.chance.shuffle(RogueLibrary);

    return {
      roundState: RoundState.idle,
      gameState: GameState.Lobby,
      activeMonsters: [],
      turn: undefined,
      players: [],
      TD: undefined,
      Location: undefined,
      cardPool: [],
      turnOrder: [],
      Messages: [],
      responseData: {
        response: undefined,
      },
    };
  }

  userResponse(state: InternalState, userId: UserId, ctx: Context, request: IUserResponseRequest): Response {
    const callback = request.response.Callback;
    let card = undefined;
    let response = undefined;
    const playerIndex = state.players.findIndex(p => p.id === userId);

    if (request.response.Response) response = request.response.Response;
    state.responseData = {
      response: response,
    };
    executeCallback(callback, state, playerIndex, ctx);
    return Response.ok();
  }

  sendMessage(state: InternalState, userId: UserId, ctx: Context, request: ISendMessageRequest): Response {
    const playerIndex = state.players.findIndex(p => p.id === userId);
    const nextID = state.Messages.length + 1;
    const nickname = state.players[playerIndex].name;

    const message: Message = {
      id: nextID,
      sender: userId,
      nickName: nickname,
      data: request.msg,
    };
    state.Messages.push(message);

    return Response.ok();
  }

  seenMessage(state: InternalState, userId: UserId, ctx: Context, request: ISeenMessageRequest): Response {
    const playerIndex = state.players.findIndex(p => p.id === userId);
    state.players[playerIndex].lastSeen = request.msgID;
    return Response.ok();
  }

  leaveGame(state: InternalState, userId: UserId, ctx: Context, request: ILeaveGameRequest): Response {
    if (state.gameState != GameState.Lobby) return Response.error("Joining game is now closed, game has started");
    const playerIndex = state.players.findIndex(p => p.id === userId);
    if (playerIndex == -1) return Response.error("Player not found");
    state.players.splice(playerIndex, 1);
    return Response.ok();
  }

  joinGame(state: InternalState, userId: UserId, ctx: Context, request: IJoinGameRequest): Response {
    //guard conditions
    if (state.players.length >= 4) return Response.error("Too many users, cannot join");
    if (state.gameState != GameState.Lobby) return Response.error("Joining game is now closed, game has started");
    if (state.players.find(player => player.id === userId) !== undefined) return Response.error("Already joined");
    if ((request.level < 1 || request.level > 8) && state.players.length == 0)
      return Response.error("Invalid Level submitted, must be between 1 and 8");

    //level param ONLY matters on first submission, afterwards ignore param
    if (state.players.length === 0) {
      gameLevel = request.level;
      //Setup Decks, should only be done on first player joined
      monsterDeck = setupMonsterDeck(MonsterLibrary, gameLevel, ctx);
      locationDeck = setupLocationDeck(LocationLibrary, gameLevel);
      towerDefenseDeck = setupTowerDefenseDeck(TDLibrary, gameLevel, ctx);
      abilityCardDeck = setupAbilityCardDeck(AbilityLibrary, gameLevel, ctx);
    }

    //add player
    state.players.push(setupNewPlayer(userId, request));
    return Response.ok();
  }

  startGame(state: InternalState, userId: UserId, ctx: Context, request: IStartGameRequest): Response {
    //gaurd conditions
    if (state.gameState != GameState.Lobby) return Response.error("Cannot Start game, its already started");
    if (state.players.length <= 0) return Response.error("No players are joined, cannot start");
    ctx.broadcastEvent(HathoraEventTypes.default, "SETUP");
    ctx.broadcastEvent(HathoraEventTypes.default, "START");

    //Setting State and turn order
    state.gameState = GameState.GameSetup;
    state.turnOrder = setTurnOrder(state.players, ctx);

    state.turn = state.turnOrder[0];

    //Deal starting cards - clearing out monster damage
    monsterDeck.forEach(m => (m.damage = 0));
    state.activeMonsters = setupActiveMonsters(numberMonstersActiveByLevel[gameLevel], monsterDeck);

    state.Location = locationDeck.pop(); //Location Cards
    if (state.Location) {
      numberOfTDCardsForThisLocation = state.Location.td; //set the TD number in case there's an iteration
      state.Location.damage = 0;
    }

    state.cardPool = setupCardPool(abilityCardDeck); //Ability Cards - cardpool

    //setup each users hands based on role
    for (const player of state.players) {
      player.health = 10;
      player.deck = setPlayerDeckbyRole(player.role, ctx);
      player.hand = dealPlayerCardsFromDeck(5, player.deck);
    }

    state.gameState = GameState.ReadyToStart;
    return Response.ok();
  }

  startTurn(state: InternalState, userId: UserId, ctx: Context, request: IStartTurnRequest): Response {
    //gaurd conditions
    if (state.roundState != RoundState.idle) return Response.error("Roundstate is not idle, cannot start turn");
    if (state.gameState != GameState.ReadyToStart) return Response.error("Cannot Start turn, game is not ready");
    if (userId != state.turn) return Response.error("You cannot start the turn, it is not your turn!");
    //state.roundState = RoundState.waitingPlayerPassives;
    //bypassing player passives, cuz there arent' any for demo
    state.roundState = RoundState.waitingMonsterPassives;
    state.gameState = GameState.PlayersTurn;

    //show TD card
    state.TD = towerDefenseDeck.pop();

    ctx.broadcastEvent(HathoraEventTypes.default, `START TURN`);
    return Response.ok();
  }

  runPlayerPassives(state: InternalState, userId: UserId, ctx: Context, request: IRunPlayerPassivesRequest): Response {
    //gaurd conditions
    if (state.roundState != RoundState.waitingPlayerPassives)
      return Response.error("Cannot process this command, the round isn't at this step");
    if (state.gameState != GameState.PlayersTurn) return Response.error("Cannot process this command, game is not ready");
    if (userId != state.turn) return Response.error("You cannot run this command, it is not your turn!");
    state.roundState = RoundState.activeRunningPlayerPassives;

    //cycle through user's passive status effects when that system is implemented
    //FOR PROTO, there are no player passives...
    state.roundState = RoundState.waitingMonsterPassives;

    return Response.ok();
  }
  runMonsterPassives(state: InternalState, userId: UserId, ctx: Context, request: IRunMonsterPassivesRequest): Response {
    //gaurd conditions
    if (state.roundState != RoundState.waitingMonsterPassives)
      return Response.error("Cannot process this command, the round isn't at this step");
    if (state.gameState != GameState.PlayersTurn) return Response.error("Cannot process this command, game is not ready");
    if (userId != state.turn) return Response.error("You cannot run this command, it is not your turn!");
    state.roundState = RoundState.activeRunningMonsterPassives;
    const playerIndex = state.players.findIndex(p => p.id === userId);
    //console.log("line 283", state.players[playerIndex].hand);
    state.activeMonsters.forEach((monster, index) => {
      if (monster.PassiveEffect != undefined) {
        executeCallback(monster.PassiveEffect.callback, state, playerIndex, ctx);
        ctx.broadcastEvent(HathoraEventTypes.default, "STATUSEFFECT ADDED");
      }
    });

    ctx.broadcastEvent(HathoraEventTypes.default, `PASSIVES`);
    state.roundState = RoundState.waitingOnTD;
    return Response.ok();
  }

  enableTD(state: InternalState, userId: UserId, ctx: Context, request: IEnableTDRequest): Response {
    //gaurd conditions
    if (state.roundState != RoundState.waitingOnTD)
      return Response.error("Cannot process this command, the round isn't at this step");
    if (state.gameState != GameState.PlayersTurn) return Response.error("Cannot process this command, game is not ready");
    if (userId != state.turn) return Response.error("You cannot run this command, it is not your turn!");
    ctx.broadcastEvent(HathoraEventTypes.default, "ENABLE_TD");
    return Response.ok();
  }

  playTD(state: InternalState, userId: UserId, ctx: Context, request: IPlayTDRequest): Response {
    //gaurd conditions
    if (state.roundState != RoundState.waitingOnTD)
      return Response.error("Cannot process this command, the round isn't at this step");
    if (state.gameState != GameState.PlayersTurn) return Response.error("Cannot process this command, game is not ready");
    if (userId != state.turn) return Response.error("You cannot run this command, it is not your turn!");
    state.roundState = RoundState.activeRunningTDEffects;

    let pIndex = state.players.findIndex(p => {
      return p.id == userId;
    });

    if (state.TD?.ActiveEffect) executeCallback(state.TD?.ActiveEffect.callback, state, pIndex, ctx);
    if (state.TD?.PassiveEffect) {
      executeCallback(state.TD?.PassiveEffect.callback, state, pIndex, ctx);
      ctx.broadcastEvent(HathoraEventTypes.default, "STATUSEFFECT ADDED");
    }

    if (numberOfTDCardsForThisLocation > 1) {
      numberOfTDCardsForThisLocation -= 1;
      state.roundState = RoundState.waitingOnTD;
      state.TD = towerDefenseDeck.pop();
      ctx.broadcastEvent(HathoraEventTypes.default, "updateTD");
    } else {
      state.roundState = RoundState.waitingOnMonster;
      //discard TD
      state.TD = undefined;
      ctx.broadcastEvent(HathoraEventTypes.default, "hideTD");
    }

    //check if TD needs reshuffled
    if (towerDefenseDeck.length == 0) {
      //reset towerDefense deck
      towerDefenseDeck = setupTowerDefenseDeck(TDLibrary, gameLevel, ctx);
    }

    return Response.ok();
  }

  enableMonsters(state: InternalState, userId: UserId, ctx: Context, request: IEnableMonstersRequest): Response {
    //gaurd conditions
    if (state.roundState != RoundState.waitingOnMonster)
      return Response.error("Cannot process this command, the round isn't at this step");
    if (state.gameState != GameState.PlayersTurn) return Response.error("Cannot process this command, game is not ready");
    if (userId != state.turn) return Response.error("You cannot run this command, it is not your turn!");

    numberOfActiveMonstersThatHaveActiveEvents = 0;
    numberOfActiveMonstersThatHaveActiveEvents = getNumberOfActiveMonstersWithActiveEvents(state.activeMonsters);
    if (numberOfActiveMonstersThatHaveActiveEvents == 0) {
      ctx.broadcastEvent(HathoraEventTypes.default, "NO MONSTERS READY");
      state.roundState = RoundState.waitingOnPlayer;
      return Response.ok();
    }

    ctx.broadcastEvent(HathoraEventTypes.default, "ENABLE_Monster");
    state.roundState = RoundState.activeRunningMonster;
    return Response.ok();
  }

  playMonster(state: InternalState, userId: UserId, ctx: Context, request: IPlayMonsterRequest): Response {
    //gaurd conditions
    if (state.roundState != RoundState.activeRunningMonster)
      return Response.error("Cannot process this command, the round isn't at this step");
    if (state.gameState != GameState.PlayersTurn) return Response.error("Cannot process this command, game is not ready");
    if (userId != state.turn) return Response.error("You cannot run this command, it is not your turn!");

    let pIndex = state.players.findIndex(p => {
      return p.id == userId;
    });

    if (state.activeMonsters[0].ActiveEffect)
      executeCallback(state.activeMonsters[0].ActiveEffect.callback, state, pIndex, ctx);

    ctx.broadcastEvent(HathoraEventTypes.default, "MONSTER_PLAYED");

    //Decrement counter until all monsters played
    numberOfActiveMonstersThatHaveActiveEvents -= 1;
    if (numberOfActiveMonstersThatHaveActiveEvents == 0) {
      state.roundState = RoundState.waitingOnPlayer;
      ctx.broadcastEvent(HathoraEventTypes.default, "MONSTER_DONE");
      return Response.ok();
    }

    ctx.broadcastEvent(HathoraEventTypes.default, "NEXT_MONSTER");
    return Response.ok();
  }

  enablePlayer(state: InternalState, userId: UserId, ctx: Context, request: IEnablePlayerRequest): Response {
    //gaurd conditions
    if (state.roundState != RoundState.waitingOnPlayer)
      return Response.error("Cannot process this command, the round isn't at this step");
    if (state.gameState != GameState.PlayersTurn) return Response.error("Cannot process this command, game is not ready");
    if (userId != state.turn) return Response.error("You cannot run this command, it is not your turn!");

    ctx.broadcastEvent(HathoraEventTypes.default, "ENABLE_Player");
    return Response.ok();
  }

  playPlayerCard(state: InternalState, userId: UserId, ctx: Context, request: IPlayPlayerCardRequest): Response {
    //guard conditions
    if (state.roundState != RoundState.waitingOnPlayer && state.roundState != RoundState.activeRunningPlayer)
      return Response.error("Cannot process this command, the round isn't at this step");
    if (state.gameState != GameState.PlayersTurn) return Response.error("Cannot process this command, game is not ready");
    if (userId != state.turn) return Response.error("You cannot run this command, it is not your turn!");
    state.roundState = RoundState.activeRunningPlayer;

    let cardPlayed = request.cardID;
    const playerIndex = state.players.findIndex(p => p.id === userId);
    const cardindex = state.players[playerIndex].hand.findIndex(c => c.id === cardPlayed);
    // console.log("line 410", state.players[playerIndex].hand);
    resetUserResponse();
    if (state.players[playerIndex].hand[cardindex].ActiveEffect) {
      //console.log("a callback: ", state.players[playerIndex].hand[cardindex].ActiveEffect?.callback);
      executeCallback(state.players[playerIndex].hand[cardindex].ActiveEffect?.callback!, state, playerIndex, ctx);
    }
    if (state.players[playerIndex].hand[cardindex].PassiveEffect) {
      //console.log("p callback: ", state.players[playerIndex].hand[cardindex].PassiveEffect?.callback);
      executeCallback(state.players[playerIndex].hand[cardindex].PassiveEffect?.callback!, state, playerIndex, ctx);
    }
    playerIndex;

    //remove card from hand and discard
    //console.log(`card index: ${cardindex}`);
    //console.log("line 421", state.players[playerIndex].hand);
    const moveCard = state.players[playerIndex].hand[cardindex];
    //console.log("before", state.players[playerIndex].hand);
    state.players[playerIndex].discard.push(moveCard);
    state.players[playerIndex].hand.splice(cardindex, 1);
    // console.log("after", state.players[playerIndex].hand);
    checkForValidHand(state.players[playerIndex].hand);
    state.players[playerIndex].hand = state.players[playerIndex].hand.filter(function (x) {
      return x !== undefined;
    });
    return Response.ok();
  }

  playerHandComplete(state: InternalState, userId: string, ctx: Context, request: IPlayerHandCompleteRequest): Response {
    //guard conditions
    if (state.roundState != RoundState.activeRunningPlayer)
      return Response.error("Cannot process this command, the round isn't at this step");
    if (state.gameState != GameState.PlayersTurn) return Response.error("Cannot process this command, game is not ready");
    if (userId != state.turn) return Response.error("You cannot run this command, it is not your turn!");
    state.roundState = RoundState.activeRunningPlayer;

    const playerIndex = state.players.findIndex(p => p.id === userId);

    //if cards remain, wait on next player card to be played
    if (state.players[playerIndex].hand.length) {
      state.roundState = RoundState.waitingOnPlayer;
    } else {
      ctx.broadcastEvent(HathoraEventTypes.default, "PLAYERDONE");
      state.roundState = RoundState.waitingToBuyCard;
    }
    return Response.ok();
  }

  enableCardPool(state: InternalState, userId: UserId, ctx: Context, request: IEnableCardPoolRequest): Response {
    //guard conditions
    if (state.roundState != RoundState.waitingToBuyCard)
      return Response.error("Cannot process this command, the round isn't at this step");
    if (state.gameState != GameState.PlayersTurn) return Response.error("Cannot process this command, game is not ready");
    if (userId != state.turn) return Response.error("You cannot run this command, it is not your turn!");
    state.roundState = RoundState.activeBuyingCard;
    ctx.broadcastEvent(HathoraEventTypes.default, "Show Card Pool");
    return Response.ok();
  }

  buyFromCardPool(state: InternalState, userId: UserId, ctx: Context, request: IBuyFromCardPoolRequest): Response {
    //guard conditions
    if (state.roundState != RoundState.activeBuyingCard)
      return Response.error("Cannot process this command, the round isn't at this step");
    if (state.gameState != GameState.PlayersTurn) return Response.error("Cannot process this command, game is not ready");
    if (userId != state.turn) return Response.error("You cannot run this command, it is not your turn!");
    //if player can afford card
    const cardPurchased = request.cardID;
    const cardIndex = state.cardPool.findIndex(c => c.id === cardPurchased);
    const playerIndex = state.players.findIndex(p => p.id === userId);

    if (state.players[playerIndex].coin < state.cardPool[cardIndex].cost)
      return Response.error("Cost of selected card exceeds players ability points");

    //we got the card and player, and they can afford it,
    //move card from pool to players discard

    //reduce player coins by cost of card
    state.players[playerIndex].coin -= state.cardPool[cardIndex].cost;

    let cardToMove = state.cardPool.splice(cardIndex, 1);
    if (cardToMove == undefined) {
      console.log("bad card bought: ", cardToMove);
    }
    state.players[playerIndex].discard.push(cardToMove[0]);
    //replace that card in pool form ability deck
    let cardToDeal = abilityCardDeck.pop();
    if (cardToDeal) state.cardPool.push(cardToDeal);

    checkForValidHand(state.players[playerIndex].discard);

    ctx.broadcastEvent(HathoraEventTypes.default, "card purchased");
    return Response.ok();
  }

  closeCardPool(state: InternalState, userId: UserId, ctx: Context, request: ICloseCardPoolRequest): Response {
    //guard conditions
    if (state.roundState != RoundState.activeBuyingCard && state.roundState != RoundState.waitingToBuyCard)
      return Response.error("Cannot process this command, the round isn't at this step");
    if (state.gameState != GameState.PlayersTurn) return Response.error("Cannot process this command, game is not ready");
    if (userId != state.turn) return Response.error("You cannot run this command, it is not your turn!");
    state.roundState = RoundState.waitingOnApplyingDamage;
    ctx.broadcastEvent(HathoraEventTypes.default, "Close Card Pool");
    return Response.ok();
  }

  enableMonsterDamage(state: InternalState, userId: UserId, ctx: Context, request: IEnableMonsterDamageRequest): Response {
    //guard conditions
    if (state.roundState != RoundState.waitingOnApplyingDamage)
      return Response.error("Cannot process this command, the round isn't at this step");
    if (state.gameState != GameState.PlayersTurn) return Response.error("Cannot process this command, game is not ready");
    if (userId != state.turn) return Response.error("You cannot run this command, it is not your turn!");
    ctx.broadcastEvent(HathoraEventTypes.default, "Ready to apply damage");
    state.roundState = RoundState.activeApplyingDamage;
    return Response.ok();
  }
  applyMonsterDamage(state: InternalState, userId: UserId, ctx: Context, request: IApplyMonsterDamageRequest): Response {
    //guard conditions
    if (state.roundState != RoundState.activeApplyingDamage)
      return Response.error("Cannot process this command, the round isn't at this step");
    if (state.gameState != GameState.PlayersTurn) return Response.error("Cannot process this command, game is not ready");
    if (userId != state.turn) return Response.error("You cannot run this command, it is not your turn!");

    let cardPlayed = request.cardID;
    const cardIndex = state.activeMonsters.findIndex(m => m.id === cardPlayed);
    const playerIndex = state.players.findIndex(p => p.id === userId);

    if (state.players[playerIndex].attack == 0) return Response.error("You have no damage to apply");

    //we have monster card, players has attack to give

    //apply damage
    state.activeMonsters[cardIndex].damage += 1;

    //if monster damage reached zero, monster defeated
    if (state.activeMonsters[cardIndex].damage == state.activeMonsters[cardIndex].health) {
      //monster defeated
      console.log("monster defeated");
      ctx.broadcastEvent(HathoraEventTypes.default, "monsterdefeated");

      //issue reward to players
      if (state.activeMonsters[0].ActiveEffect)
        executeCallback(state.activeMonsters[0].Rewards.callback, state, playerIndex, ctx);

      //check for monster bonus
      const isBonuseActive = state.players[playerIndex].statusEffects.findIndex(se => se == StatusEffects.MonsterBonus);
      if (isBonuseActive != -1) {
        executeCallback("addAttack1", state, playerIndex, ctx);
      }

      //if this monster had a status effect tied to it, remove from players
      if (state.activeMonsters[0].PassiveEffect) {
        executeCallback("removeStatuseffect", state, playerIndex, ctx);
      }

      //show next monster
      const nextMonster = monsterDeck.pop();

      //test for no more monsters
      if (nextMonster != undefined) state.activeMonsters[0] = nextMonster as MCard;
      else {
        //game over - you win
        console.log("GAME OVER YOU WIN");
        ctx.broadcastEvent(HathoraEventTypes.default, "VICTORY");
        state.roundState = RoundState.idle;
        state.gameState = GameState.GameOver;
        return Response.ok();
      }

      //if monster has passives, play
      if (state.activeMonsters[0].PassiveEffect != undefined) {
        executeCallback(state.activeMonsters[0].PassiveEffect.callback, state, playerIndex, ctx);
        ctx.broadcastEvent(HathoraEventTypes.default, "STATUSEFFECT ADDED");
      }
    }

    //reduce hero's attack
    state.players[playerIndex].attack -= 1;
    ctx.broadcastEvent(HathoraEventTypes.default, "Applying Damage");
    return Response.ok();
  }

  disableMonsterDamage(state: InternalState, userId: UserId, ctx: Context, request: IDisableMonsterDamageRequest): Response {
    //guard conditions
    if (state.roundState != RoundState.activeApplyingDamage)
      return Response.error("Cannot process this command, the round isn't at this step");
    if (state.gameState != GameState.PlayersTurn) return Response.error("Cannot process this command, game is not ready");
    if (userId != state.turn) return Response.error("You cannot run this command, it is not your turn!");
    const playerIndex = state.players.findIndex(p => p.id === userId);
    if (state.players[playerIndex].attack > 0) return Response.error("You still have damage left");

    ctx.broadcastEvent(HathoraEventTypes.default, "Ready to End Turn");
    state.roundState = RoundState.waitingOnEndTurn;
    return Response.ok();
  }

  endRound(state: InternalState, userId: UserId, ctx: Context, request: IEndRoundRequest): Response {
    if (state.roundState != RoundState.waitingOnEndTurn)
      return Response.error("Cannot process this command, the round isn't at this step");
    if (state.gameState != GameState.PlayersTurn) return Response.error("Cannot process this command, game is not ready");
    if (userId != state.turn) return Response.error("You cannot run this command, it is not your turn!");
    const playerIndex = state.players.findIndex(p => p.id === userId);

    //if player stunned, reset health to 10
    const seIndex = state.players[playerIndex].statusEffects.findIndex(se => se == StatusEffects.Stunned);
    if (seIndex != -1) {
      console.log("resetting player health");
      //ctx.broadcastEvent(HathoraEventTypes.userEventType, { command: "RESETPLAYER", index: playerIndex });
      switch (playerIndex) {
        case 0:
          ctx.broadcastEvent(HathoraEventTypes.userEventType, { command: "RESETPLAYER0" });
          break;
        case 1:
          ctx.broadcastEvent(HathoraEventTypes.userEventType, { command: "RESETPLAYER1" });
          break;
        case 2:
          ctx.broadcastEvent(HathoraEventTypes.userEventType, { command: "RESETPLAYER2" });
          break;
        case 3:
          ctx.broadcastEvent(HathoraEventTypes.userEventType, { command: "RESETPLAYER3" });
          break;
      }
      state.players[playerIndex].health = 10;
    }

    //clear all status effects
    state.players[playerIndex].statusEffects = [];
    //ctx.broadcastEvent(HathoraEventTypes.userEventType, { command: "CLEARSE", index: playerIndex });
    switch (playerIndex) {
      case 0:
        ctx.broadcastEvent(HathoraEventTypes.userEventType, { command: "CLEARSE0" });
        break;
      case 1:
        ctx.broadcastEvent(HathoraEventTypes.userEventType, { command: "CLEARSE1" });
        break;
      case 2:
        ctx.broadcastEvent(HathoraEventTypes.userEventType, { command: "CLEARSE2" });
        break;
      case 3:
        ctx.broadcastEvent(HathoraEventTypes.userEventType, { command: "CLEARSE3" });
        break;
    }
    //redeal hand for user
    //test to see if 5 cards in deck, if not... reshuffle discard

    if (state.players[playerIndex].deck.length < 5)
      state.players[playerIndex].deck.push(
        ...ctx.chance.shuffle([
          ...state.players[playerIndex].deck.splice(0),
          ...state.players[playerIndex].discard.splice(0),
        ])
      );

    //deal 5 cards to hand
    for (let cd = 0; cd < 5; cd++) {
      let myCard = state.players[playerIndex].deck.pop();
      if (myCard) state.players[playerIndex].hand.push(myCard);
    }

    //clear attack and coins
    state.players[playerIndex].coin = 0;
    state.players[playerIndex].attack = 0;

    //shift turn via turn order
    let numberOfPlayers = state.players.length;
    let turnIndex = state.turnOrder.findIndex(u => u == userId);

    if (turnIndex + 1 == numberOfPlayers) turnIndex = 0; //next player is turnOrder 0
    else turnIndex += 1; //next player is next index
    state.turn = state.turnOrder[turnIndex];

    ctx.broadcastEvent(HathoraEventTypes.userEventType, { command: "Ready for next player" });

    state.roundState = RoundState.idle;
    state.gameState = GameState.ReadyToStart;
    return Response.ok();
  }

  getUserState(state: InternalState, userId: UserId): UserState {
    let userIndex = state.players.findIndex(p => p.id === userId);
    state.players.forEach(p => {
      //console.log(`${p.name}'s hand`);
      //p.hand.forEach(c => console.log(c));
    });
    if (userIndex != -1) {
      const clientState: UserState = {
        me: userIndex,
        players: state.players,
        roundState: state.roundState,
        activeMonsters: state.activeMonsters,
        location: state.Location,
        TDcard: state.TD,
        cardPool: state.cardPool,
        turn: state.turn,
        turnOrder: state.turnOrder,
        Messages: state.Messages,
      };
      return clientState;
    } else {
      const clientState: UserState = {
        me: userIndex,
        players: [],
        roundState: state.roundState,
        activeMonsters: state.activeMonsters,
        location: state.Location,
        TDcard: state.TD,
        cardPool: state.cardPool,
        turn: state.turn,
        turnOrder: state.turnOrder,
        Messages: state.Messages,
      };
      return clientState;
    }
  }
}
