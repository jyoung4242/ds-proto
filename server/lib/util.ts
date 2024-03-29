import { ABCard, IJoinGameRequest, IStartGameRequest, LCard, MCard, Player, Roles, TDCard, UserId } from "../../api/types";
import { Context } from "../.hathora/methods";
import { barbarianCardDeck, InternalState, paladinCardDeck, rogueCardDeck, wizardCardDeck } from "../impl";

export const setupMonsterDeck = (library: MCard[], level: number, c: Context): MCard[] => {
  let tempDeck = library.filter(card => card.level <= level);
  return c.chance.shuffle(tempDeck);
};

export const asyncAwait = (time: number): Promise<void> => {
  return new Promise<void>(resolve =>
    setTimeout(() => {
      resolve();
    }, time)
  );
};

export const setupLocationDeck = (library: LCard[], level: number): LCard[] => {
  let tempDeck = library.filter(card => card.level === level);
  tempDeck.sort((a, b): number => {
    return b.sequence - a.sequence;
  });
  return tempDeck;
};

export const setupTowerDefenseDeck = (library: TDCard[], level: number, c: Context): TDCard[] => {
  let tempDeck = library.filter(card => card.level <= level);

  return c.chance.shuffle(tempDeck);
};

export const setupAbilityCardDeck = (library: ABCard[], level: number, c: Context): ABCard[] => {
  let tempDeck = library.filter(card => card.level <= level);
  return c.chance.shuffle(tempDeck);
};

export const setupNewPlayer = (id: UserId, request: IJoinGameRequest): Player => {
  let newPlayer: Player = {
    id: id,
    name: request.name,
    health: 10,
    attack: 0,
    coin: 0,
    hand: [],
    deck: [],
    discard: [],
    role: request.role,
    gender: request.gender,
    statusEffects: [],
    lastSeen: 0,
  };
  return newPlayer;
};

export const setTurnOrder = (players: Player[], c: Context): UserId[] => {
  let arrayOfIDs: UserId[] = players.map(p => p.id);
  arrayOfIDs = c.chance.shuffle(arrayOfIDs);
  return arrayOfIDs;
};

export const setupActiveMonsters = (n: number, m: MCard[]): MCard[] => {
  let tempArray: MCard[] = [];
  for (let index = 0; index < n; index++) {
    const myCard = m.pop()!; //Monster Cards
    tempArray.push(myCard);
  }
  return tempArray;
};

export const setupCardPool = (a: ABCard[]): ABCard[] => {
  let tempArray: ABCard[] = [];
  for (let index = 0; index < 6; index++) {
    const myCard = a.pop()!; //Monster Cards
    tempArray.push(myCard);
  }
  return tempArray;
};

export const setPlayerDeckbyRole = (role: Roles, c: Context): ABCard[] => {
  let tempArray: ABCard[] = [];
  switch (role) {
    case Roles.Barbarian:
      tempArray = c.chance.shuffle(barbarianCardDeck);
      break;
    case Roles.Wizard:
      tempArray = c.chance.shuffle(wizardCardDeck);
      break;
    case Roles.Paladin:
      tempArray = c.chance.shuffle(paladinCardDeck);
      break;
    case Roles.Rogue:
      tempArray = c.chance.shuffle(rogueCardDeck);
      break;
  }
  return tempArray;
};

export const dealPlayerCardsFromDeck = (numCards: number, deck: ABCard[]): ABCard[] => {
  let tempArray: ABCard[] = [];
  for (let cd = 0; cd < numCards; cd++) {
    let myCard = deck.pop();
    if (myCard) tempArray.push(myCard);
  }
  return tempArray;
};

export const getActivePlayerName = (players: Player[], turn: UserId): string => {
  let index = players.findIndex(p => p.id === turn);
  return players[index].name;
};

export const getNumberOfActiveMonstersWithActiveEvents = (monsters: MCard[]): number => {
  let tempNumber = 0;
  monsters.forEach(m => {
    if (m.ActiveEffect != undefined) tempNumber += 1;
  });
  return tempNumber;
};

export const reshuffleDeck = (ctx: Context, deck: ABCard[], discard: ABCard[]) => {
  console.log("reshuffle routine: before");
  console.log(discard);
  console.log(deck);
  deck.push(...ctx.chance.shuffle([...deck.splice(0), ...discard.splice(0)]));
  /* deck = [...discard];
  discard = [];
  deck = ctx.chance.shuffle(deck); */
  console.log("reshuffle routine: after");
  console.log(discard);
  console.log(deck);
};
