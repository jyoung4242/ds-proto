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
let barbarianCardDeck: ABCard[] = [];
let wizardCardDeck: ABCard[] = [];
let paladinCardDeck: ABCard[] = [];
let rogueCardDeck: ABCard[] = [];

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
    if (request.level < 1 || request.level > 8) return Response.error("Invalid Level submitted, must be between 1 and 8");

    if (state.players.length === 0) {
      gameLevel = request.level;
    }

    //Monster Deck
    monsterDeck = MonsterLibrary.filter(card => card.level <= gameLevel);
    monsterDeck = ctx.chance.shuffle(monsterDeck);

    //Locations Deck
    locationDeck = LocationLibrary.filter(card => card.level === gameLevel);
    //inverst order by sequence number
    locationDeck.sort((a, b): number => {
      return b.sequence - a.sequence;
    });

    //TD cards
    towerDefenseDeck = TDLibrary.filter(card => card.level <= gameLevel);
    towerDefenseDeck = ctx.chance.shuffle(towerDefenseDeck);

    //Ability Cards
    abilityCardDeck = AbilityLibrary.filter(card => card.level <= gameLevel);
    abilityCardDeck = ctx.chance.shuffle(abilityCardDeck);

    let newPlayer: Player = {
      id: userId,
      name: request.name,
      health: 10,
      attack: 0,
      ability: 0,
      hand: [],
      deck: [],
      discard: [],
      role: request.role,
      gender: request.gender,
      statusEffects: [],
    };
    state.players.push(newPlayer);
    return Response.ok();
  }

  startGame(state: InternalState, userId: UserId, ctx: Context, request: IStartGameRequest): Response {
    //gaurd conditions
    if (state.gameState != GameState.Lobby) return Response.error("Cannot Start game, its already started");
    if (state.players.length <= 0) return Response.error("No players are joined, cannot start");

    const setTurnOrder = (): UserId[] => {
      let arrayOfIDs: UserId[] = state.players.map(p => p.id);
      arrayOfIDs = ctx.chance.shuffle(arrayOfIDs);
      return arrayOfIDs;
    };

    //Setting State and turn order
    state.gameState = GameState.GameSetup;
    state.turnOrder = setTurnOrder();
    state.turn = state.turnOrder[0];

    //Deal starting cards
    for (let index = 0; index < numberMonstersActiveByLevel[gameLevel]; index++) {
      const myCard = monsterDeck.pop()!; //Monster Cards
      state.activeMonsters.push(myCard);
    }

    //Location Cards
    state.Location = locationDeck.pop(); //Location Cards

    //set the TD number in case there's an iteration
    if (state.Location) numberOfTDCardsForThisLocation = state.Location.td;

    //Ability Cards
    for (let index = 0; index < 6; index++) {
      const myCard = abilityCardDeck.pop()!; //Ability Card Pool
      state.cardPool.push(myCard);
    }

    //setup each users hands based on role
    for (const player of state.players) {
      switch (player.role) {
        case Roles.Barbarian:
          player.deck = ctx.chance.shuffle(barbarianCardDeck);
          break;
        case Roles.Wizard:
          player.deck = ctx.chance.shuffle(wizardCardDeck);
          break;
        case Roles.Paladin:
          player.deck = ctx.chance.shuffle(paladinCardDeck);
          break;
        case Roles.Rogue:
          player.deck = ctx.chance.shuffle(rogueCardDeck);
          break;
      }
      //deal first 5 cards to hand
      for (let cd = 0; cd < 5; cd++) {
        let myCard = player.deck.pop();
        if (myCard) player.hand.push(myCard);
      }
    }

    state.gameState = GameState.ReadyToStart;

    //get name of user
    let index = state.players.findIndex(p => p.id === state.turn);
    let playerName: string;
    if (index != -1) {
      playerName = state.players[index].name;
      ctx.broadcastEvent(`Ready To Start, its ${playerName}'s play`);
      return Response.ok();
    }

    return Response.error("Error finding Player in state");
  }

  startTurn(state: InternalState, userId: UserId, ctx: Context, request: IStartTurnRequest): Response {
    //gaurd conditions
    //not right gamestate
    if (state.roundState != RoundState.idle) return Response.error("Roundstate is not idle, cannot start turn");
    if (state.gameState != GameState.ReadyToStart) return Response.error("Cannot Start turn, game is not ready");
    if (userId != state.turn) return Response.error("You cannot start the turn, it is not your turn!");
    state.roundState = RoundState.waitingPlayerPassives;
    state.gameState = GameState.PlayersTurn;

    //show TD card
    state.TD = towerDefenseDeck.pop();

    //get name of user
    let index = state.players.findIndex(p => p.id === state.turn);
    let playerName: string;
    if (index != -1) {
      playerName = state.players[index].name;
      ctx.broadcastEvent(`${playerName} has started their turn`);
      return Response.ok();
    }
    return Response.error("Error finding Player in state");
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
    return Response.error("Not implemented");
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
