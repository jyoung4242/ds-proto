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

type PlayerDiscard = {
  user: UserId;
  pile: ABCard[];
};
const playerDiscards: PlayerDiscard[] = [];

export class Impl implements Methods<InternalState> {
  initialize(ctx: Context, request: IInitializeRequest): InternalState {
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
    state.gameState = GameState.GameSetup;
    state.turn = state.players[0].id;

    //Deal starting cards
    for (let index = 0; index < numberMonstersActiveByLevel[gameLevel]; index++) {
      const myCard = monsterDeck.pop()!; //Monster Cards
      state.activeMonsters.push(myCard);
    }
    state.Location = locationDeck.pop(); //Location Cards

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

    return Response.ok();
  }

  startTurn(state: InternalState, userId: UserId, ctx: Context, request: IStartTurnRequest): Response {
    //gaurd conditions

    return Response.ok();
  }

  runPlayerPassives(state: InternalState, userId: UserId, ctx: Context, request: IRunPlayerPassivesRequest): Response {
    return Response.error("Not implemented");
  }
  runMonsterPassives(state: InternalState, userId: UserId, ctx: Context, request: IRunMonsterPassivesRequest): Response {
    return Response.error("Not implemented");
  }
  enableTD(state: InternalState, userId: UserId, ctx: Context, request: IEnableTDRequest): Response {
    return Response.error("Not implemented");
  }
  playTD(state: InternalState, userId: UserId, ctx: Context, request: IPlayTDRequest): Response {
    return Response.error("Not implemented");
  }
  enableMonsters(state: InternalState, userId: UserId, ctx: Context, request: IEnableMonstersRequest): Response {
    return Response.error("Not implemented");
  }
  playMonster(state: InternalState, userId: UserId, ctx: Context, request: IPlayMonsterRequest): Response {
    return Response.error("Not implemented");
  }
  enablePlayer(state: InternalState, userId: UserId, ctx: Context, request: IEnablePlayerRequest): Response {
    return Response.error("Not implemented");
  }
  playPlayerCard(state: InternalState, userId: UserId, ctx: Context, request: IPlayPlayerCardRequest): Response {
    return Response.error("Not implemented");
  }
  enableMonsterDamage(state: InternalState, userId: UserId, ctx: Context, request: IEnableMonsterDamageRequest): Response {
    return Response.error("Not implemented");
  }
  applyMonsterDamage(state: InternalState, userId: UserId, ctx: Context, request: IApplyMonsterDamageRequest): Response {
    return Response.error("Not implemented");
  }
  disableMonsterDamage(state: InternalState, userId: UserId, ctx: Context, request: IDisableMonsterDamageRequest): Response {
    return Response.error("Not implemented");
  }
  enableCardPool(state: InternalState, userId: UserId, ctx: Context, request: IEnableCardPoolRequest): Response {
    return Response.error("Not implemented");
  }
  buyFromCardPool(state: InternalState, userId: UserId, ctx: Context, request: IBuyFromCardPoolRequest): Response {
    return Response.error("Not implemented");
  }
  closeCardPool(state: InternalState, userId: UserId, ctx: Context, request: ICloseCardPoolRequest): Response {
    return Response.error("Not implemented");
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
      };
      return clientState;
    }
  }
}
