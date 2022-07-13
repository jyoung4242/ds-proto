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
  dealPlayerCardsFromDeck,
  getActivePlayerName,
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

type InternalState = {
  roundState: RoundState;
  gameState: GameState;
  activeMonsters: MCard[];
  turn?: UserId;
  players: Player[];
  TD?: TDCard;
  Location?: LCard;
  cardPool: ABCard[];
  turnOrder: UserId[];
};

//nonstate variables
let gameLevel: number;
let monsterDeck: MCard[] = [];
let towerDefenseDeck: TDCard[] = [];
let locationDeck: LCard[] = [];
let abilityCardDeck: ABCard[] = [];
export let barbarianCardDeck: ABCard[] = [];
export let wizardCardDeck: ABCard[] = [];
export let paladinCardDeck: ABCard[] = [];
export let rogueCardDeck: ABCard[] = [];

const numberMonstersActiveByLevel: Array<number> = [1, 1, 2, 2, 3, 3, 3, 3];
let numberOfTDCardsForThisLocation: number = 0;
let numgerOfActiveMonstersThatHaveActiveEvents: number = 0;

type PlayerDiscard = {
  user: UserId;
  pile: ABCard[];
};
const playerDiscards: PlayerDiscard[] = [];

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
    };
  }

  joinGame(state: InternalState, userId: UserId, ctx: Context, request: IJoinGameRequest): Response {
    //guard conditions
    if (state.players.length >= 4) Response.error("Too many users, cannot join");
    if (state.gameState != GameState.Lobby) Response.error("Joining game is now closed, game has started");
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

    //Setting State and turn order
    state.gameState = GameState.GameSetup;
    state.turnOrder = setTurnOrder(state.players, ctx);
    state.turn = state.turnOrder[0];

    //Deal starting cards
    state.activeMonsters = setupActiveMonsters(numberMonstersActiveByLevel[gameLevel], monsterDeck);
    state.Location = locationDeck.pop(); //Location Cards
    if (state.Location) numberOfTDCardsForThisLocation = state.Location.td; //set the TD number in case there's an iteration
    state.cardPool = setupCardPool(AbilityLibrary); //Ability Cards - cardpool

    //setup each users hands based on role
    for (const player of state.players) {
      player.deck = setPlayerDeckbyRole(player.role, ctx);
      player.hand = dealPlayerCardsFromDeck(5, player.deck);
    }

    //get name of user
    let playerName = getActivePlayerName(state.players, state.turn);
    ctx.broadcastEvent(`Ready To Start, its ${playerName}'s play`);

    state.gameState = GameState.ReadyToStart;
    return Response.ok();
  }

  startTurn(state: InternalState, userId: UserId, ctx: Context, request: IStartTurnRequest): Response {
    //gaurd conditions
    if (state.roundState != RoundState.idle) return Response.error("Roundstate is not idle, cannot start turn");
    if (state.gameState != GameState.ReadyToStart) return Response.error("Cannot Start turn, game is not ready");
    if (userId != state.turn) return Response.error("You cannot start the turn, it is not your turn!");
    state.roundState = RoundState.waitingPlayerPassives;
    state.gameState = GameState.PlayersTurn;

    //show TD card
    state.TD = towerDefenseDeck.pop();

    //get name of user
    let playerName = getActivePlayerName(state.players, state.turn);
    ctx.broadcastEvent(`${playerName} has started their turn`);
    return Response.ok();
  }

  runPlayerPassives(state: InternalState, userId: UserId, ctx: Context, request: IRunPlayerPassivesRequest): Response {
    //gaurd conditions
    if (state.roundState != RoundState.waitingPlayerPassives)
      return Response.error("Cannot process this command, the round isn't at this step");
    if (state.gameState != GameState.PlayersTurn) return Response.error("Cannot process this command, game is not ready");
    if (userId != state.turn) return Response.error("You cannot run this command, it is not your turn!");
    state.roundState = RoundState.activeRunningPlayerPassives;

    //TODO - cycle through user's passive status effects when that system is implemented

    ctx.broadcastEvent(`Player Passives Complete`);
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

    //TODO - cycle through all active monsters and apply their passive effects

    state.roundState = RoundState.waitingOnTD;
    return Response.ok();
  }

  enableTD(state: InternalState, userId: UserId, ctx: Context, request: IEnableTDRequest): Response {
    //gaurd conditions
    if (state.roundState != RoundState.waitingOnTD)
      return Response.error("Cannot process this command, the round isn't at this step");
    if (state.gameState != GameState.PlayersTurn) return Response.error("Cannot process this command, game is not ready");
    if (userId != state.turn) return Response.error("You cannot run this command, it is not your turn!");
    ctx.broadcastEvent("ENABLE_TD");
    return Response.ok();
  }

  playTD(state: InternalState, userId: UserId, ctx: Context, request: IPlayTDRequest): Response {
    //gaurd conditions
    if (state.roundState != RoundState.waitingOnTD)
      return Response.error("Cannot process this command, the round isn't at this step");
    if (state.gameState != GameState.PlayersTurn) return Response.error("Cannot process this command, game is not ready");
    if (userId != state.turn) return Response.error("You cannot run this command, it is not your turn!");
    state.roundState = RoundState.activeRunningTDEffects;

    ctx.broadcastEvent("TD card played");
    let cardPlayed = request.cardID;

    //TODO - add both/all TD effects here

    if (numberOfTDCardsForThisLocation > 1) {
      numberOfTDCardsForThisLocation -= 1;
      state.roundState = RoundState.waitingOnTD;
      //TODO - discard TD and put next card there
    } else {
      state.roundState = RoundState.waitingOnMonster;
      //discard TD
      state.TD = undefined;
    }
    return Response.ok();
  }

  enableMonsters(state: InternalState, userId: UserId, ctx: Context, request: IEnableMonstersRequest): Response {
    //gaurd conditions
    if (state.roundState != RoundState.waitingOnMonster)
      return Response.error("Cannot process this command, the round isn't at this step");
    if (state.gameState != GameState.PlayersTurn) return Response.error("Cannot process this command, game is not ready");
    if (userId != state.turn) return Response.error("You cannot run this command, it is not your turn!");
    ctx.broadcastEvent("ENABLE_Monster");

    numgerOfActiveMonstersThatHaveActiveEvents = 0;
    //check for monsters that have active effects
    state.activeMonsters.forEach(m => {
      if (m.ActiveEffect) numgerOfActiveMonstersThatHaveActiveEvents += 1;
    });

    if (numgerOfActiveMonstersThatHaveActiveEvents === 0) {
      ctx.broadcastEvent("NO MONSTERS");
      state.roundState = RoundState.waitingOnPlayer;
    }

    return Response.ok();
  }
  playMonster(state: InternalState, userId: UserId, ctx: Context, request: IPlayMonsterRequest): Response {
    //gaurd conditions
    if (state.roundState != RoundState.waitingOnMonster)
      return Response.error("Cannot process this command, the round isn't at this step");
    if (state.gameState != GameState.PlayersTurn) return Response.error("Cannot process this command, game is not ready");
    if (userId != state.turn) return Response.error("You cannot run this command, it is not your turn!");
    state.roundState = RoundState.activeRunningMonster;

    ctx.broadcastEvent("Monster card played");
    let cardPlayed = request.cardID;

    //TODO - add both/all Monster effects here

    numgerOfActiveMonstersThatHaveActiveEvents -= 1;
    if (numgerOfActiveMonstersThatHaveActiveEvents > 0) {
      state.roundState = RoundState.waitingOnMonster;
      ctx.broadcastEvent("another monster card needs played");
    } else {
      state.roundState = RoundState.waitingOnPlayer;
      ctx.broadcastEvent("Ready for players cards");
    }
    return Response.ok();
  }

  enablePlayer(state: InternalState, userId: UserId, ctx: Context, request: IEnablePlayerRequest): Response {
    //gaurd conditions
    if (state.roundState != RoundState.waitingOnPlayer)
      return Response.error("Cannot process this command, the round isn't at this step");
    if (state.gameState != GameState.PlayersTurn) return Response.error("Cannot process this command, game is not ready");
    if (userId != state.turn) return Response.error("You cannot run this command, it is not your turn!");
    ctx.broadcastEvent("ENABLE_Player");
    return Response.ok();
  }

  playPlayerCard(state: InternalState, userId: UserId, ctx: Context, request: IPlayPlayerCardRequest): Response {
    //guard conditions
    if (state.roundState != RoundState.waitingOnPlayer)
      return Response.error("Cannot process this command, the round isn't at this step");
    if (state.gameState != GameState.PlayersTurn) return Response.error("Cannot process this command, game is not ready");
    if (userId != state.turn) return Response.error("You cannot run this command, it is not your turn!");
    state.roundState = RoundState.activeRunningPlayer;

    ctx.broadcastEvent("Player Card Played");
    let cardPlayed = request.cardID;
    const playerIndex = state.players.findIndex(p => p.id === userId);

    //TODO - Process active events of players cards

    //remove card from hand and discard
    const cardindex = state.players[playerIndex].hand.findIndex(c => c.id === cardPlayed);
    state.players[playerIndex].discard.push(state.players[playerIndex].hand[cardindex]);
    state.players[playerIndex].hand.splice(cardindex, 1);

    //if cards remain, wait on next player card to be played
    if (state.players[playerIndex].hand.length) {
      state.roundState = RoundState.waitingOnPlayer;
    } else {
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
    ctx.broadcastEvent("Show Card Pool");
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

    if (state.players[playerIndex].ability < state.cardPool[cardIndex].cost)
      return Response.error("Cost of selected card exceeds players ability points");

    ctx.broadcastEvent("card purchased");

    //we got the card and player, and they can afford it,
    //move card from pool to players discard
    let cardToMove = state.cardPool.splice(cardIndex, 1);
    state.players[playerIndex].discard.concat(cardToMove);
    //replace that card in pool form ability deck
    let cardToDeal = abilityCardDeck.pop();
    if (cardToDeal) state.cardPool.push(cardToDeal);

    return Response.ok();
  }

  closeCardPool(state: InternalState, userId: UserId, ctx: Context, request: ICloseCardPoolRequest): Response {
    //guard conditions
    if (state.roundState != RoundState.activeBuyingCard)
      return Response.error("Cannot process this command, the round isn't at this step");
    if (state.gameState != GameState.PlayersTurn) return Response.error("Cannot process this command, game is not ready");
    if (userId != state.turn) return Response.error("You cannot run this command, it is not your turn!");
    state.roundState = RoundState.waitingOnApplyingDamage;
    ctx.broadcastEvent("Close Card Pool");
    return Response.ok();
  }

  enableMonsterDamage(state: InternalState, userId: UserId, ctx: Context, request: IEnableMonsterDamageRequest): Response {
    //guard conditions
    if (state.roundState != RoundState.waitingOnApplyingDamage)
      return Response.error("Cannot process this command, the round isn't at this step");
    if (state.gameState != GameState.PlayersTurn) return Response.error("Cannot process this command, game is not ready");
    if (userId != state.turn) return Response.error("You cannot run this command, it is not your turn!");
    ctx.broadcastEvent("Ready to apply damage");
    state.roundState = RoundState.activeApplyingDamage;
    return Response.ok();
  }
  applyMonsterDamage(state: InternalState, userId: UserId, ctx: Context, request: IApplyMonsterDamageRequest): Response {
    //guard conditions
    if (state.roundState != RoundState.waitingOnApplyingDamage)
      return Response.error("Cannot process this command, the round isn't at this step");
    if (state.gameState != GameState.PlayersTurn) return Response.error("Cannot process this command, game is not ready");
    if (userId != state.turn) return Response.error("You cannot run this command, it is not your turn!");

    ctx.broadcastEvent("Applying Damage");
    let cardPlayed = request.cardID;
    const cardIndex = state.activeMonsters.findIndex(m => m.id === cardPlayed);
    const playerIndex = state.players.findIndex(p => p.id === userId);

    if (state.players[playerIndex].attack == 0) return Response.error("You have no damage to apply");

    //we have monster card, players has attack to give

    //apply damage
    state.activeMonsters[cardIndex].damage += 1;
    //if monster damage reached zero, monster defeated
    if (state.activeMonsters[cardIndex].damage == 0) {
      //TODO - Monster Defeated
      //TODO - End Game conditions
    }
    //reduce hero's attack
    state.players[playerIndex].attack -= 1;

    return Response.ok();
  }

  disableMonsterDamage(state: InternalState, userId: UserId, ctx: Context, request: IDisableMonsterDamageRequest): Response {
    //guard conditions
    if (state.roundState != RoundState.activeApplyingDamage)
      return Response.error("Cannot process this command, the round isn't at this step");
    if (state.gameState != GameState.PlayersTurn) return Response.error("Cannot process this command, game is not ready");
    if (userId != state.turn) return Response.error("You cannot run this command, it is not your turn!");
    ctx.broadcastEvent("Ready to End Turn");
    state.roundState = RoundState.waitingOnEndTurn;
    return Response.ok();
  }

  endRound(state: InternalState, userId: UserId, ctx: Context, request: IEndRoundRequest): Response {
    if (state.roundState != RoundState.waitingOnEndTurn)
      return Response.error("Cannot process this command, the round isn't at this step");
    if (state.gameState != GameState.PlayersTurn) return Response.error("Cannot process this command, game is not ready");
    if (userId != state.turn) return Response.error("You cannot run this command, it is not your turn!");
    const playerIndex = state.players.findIndex(p => p.id === userId);
    //redeal hand for user

    //test to see if 5 cards in deck, if not... reshuffle discard
    if (state.players[playerIndex].deck.length < 5) {
      state.players[playerIndex].deck = [
        ...state.players[playerIndex].deck,
        ...ctx.chance.shuffle(state.players[playerIndex].discard),
      ];
    }
    state.players[playerIndex].discard = [];

    //deal 5 cards to hand
    for (let cd = 0; cd < 5; cd++) {
      let myCard = state.players[playerIndex].deck.pop();
      if (myCard) state.players[playerIndex].hand.push(myCard);
    }

    //shift turn via turn order
    let numberOfPlayers = state.players.length;
    let turnIndex = state.turnOrder.findIndex(u => u == userId);
    if (turnIndex - 1 == numberOfPlayers) turnIndex = 0; //next player is turnOrder 0
    else turnIndex += 1; //next player is next index
    state.turn = state.turnOrder[turnIndex];

    ctx.broadcastEvent("Ready for next player");
    state.roundState = RoundState.idle;
    state.gameState = GameState.ReadyToStart;
    return Response.ok();
  }

  getUserState(state: InternalState, userId: UserId): UserState {
    let userIndex = state.players.findIndex(p => p.id === userId);
    if (userIndex != -1) {
      const clientState: UserState = {
        me: state.players[userIndex],
        others: state.players.filter(p => p.id != userId),
        roundState: state.roundState,
        activeMonsters: state.activeMonsters,
        location: state.Location,
        TDcard: state.TD,
        cardPool: state.cardPool,
        turn: state.turn,
        turnOrder: state.turnOrder,
      };
      return clientState;
    } else {
      const clientState: UserState = {
        me: undefined,
        others: [],
        roundState: state.roundState,
        activeMonsters: state.activeMonsters,
        location: state.Location,
        TDcard: state.TD,
        cardPool: state.cardPool,
        turn: state.turn,
        turnOrder: state.turnOrder,
      };
      return clientState;
    }
  }
}
