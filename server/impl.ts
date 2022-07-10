import { Methods, Context } from "./.hathora/methods";
import { Response } from "../api/base";
import {
  AbilityCardTypes,
  Roles,
  Gender,
  RoundState,
  GameState,
  StatusEffects,
  Targets,
  Effect,
  EffectType,
  MCard,
  TDCard,
  ABCard,
  LCard,
  player,
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

type InternalState = {
  roundState: RoundState;
  gameState: GameState;
  activeMonsters: MCard[];
  turn?: UserId;
  players: player[];
  TD?: TDCard;
  Location?: LCard;
  cardPool: ABCard[];
};

//nonstate variables
const monsterDeck: MCard[] = [];
const towerDefenseDeck: TDCard[] = [];
const locationDeck: LCard[] = [];

const abilityCardDeck: ABCard[] = [];
const barbarianStarterDeck: ABCard[] = [];
const wizardStarterDeck: ABCard[] = [];
const rogueStarterDeck: ABCard[] = [];
const paladinStarterDeck: ABCard[] = [];

type PlayerDiscard = {
  user: UserId;
  pile: ABCard[];
};
const playerDiscards: PlayerDiscard[] = [];

export class Impl implements Methods<InternalState> {
  initialize(ctx: Context, request: IInitializeRequest): InternalState {
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
    if (state.players.find((player) => player.id === userId) !== undefined) return Response.error("Already joined");

    let newPlayer: player = {
      id: userId,
      name: request.name,
      health: 10,
      attack: 0,
      ability: 0,
      hand: [],
      role: request.role,
      gender: request.gender,
      statusEffects: [],
    };
    state.players.push(newPlayer);
    return Response.ok();
  }

  startGame(state: InternalState, userId: UserId, ctx: Context, request: IStartGameRequest): Response {
    return Response.error("Not implemented");
  }
  startTurn(state: InternalState, userId: UserId, ctx: Context, request: IStartTurnRequest): Response {
    return Response.error("Not implemented");
  }
  runPlayerPassives(state: InternalState, userId: UserId, ctx: Context, request: IRunPlayerPassivesRequest): Response {
    return Response.error("Not implemented");
  }
  runMonsterPassives(
    state: InternalState,
    userId: UserId,
    ctx: Context,
    request: IRunMonsterPassivesRequest
  ): Response {
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
  enableMonsterDamage(
    state: InternalState,
    userId: UserId,
    ctx: Context,
    request: IEnableMonsterDamageRequest
  ): Response {
    return Response.error("Not implemented");
  }
  applyMonsterDamage(
    state: InternalState,
    userId: UserId,
    ctx: Context,
    request: IApplyMonsterDamageRequest
  ): Response {
    return Response.error("Not implemented");
  }
  disableMonsterDamage(
    state: InternalState,
    userId: UserId,
    ctx: Context,
    request: IDisableMonsterDamageRequest
  ): Response {
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
    let userIndex = state.players.findIndex((p) => p.id === userId);
    if (userIndex != -1) {
      const clientState: UserState = {
        me: state.players[userIndex],
        others: state.players.filter((p) => p.id != userId),
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
