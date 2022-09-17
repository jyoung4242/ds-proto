export type GameEventType{
    type: string
}

export type GameEventSequence{
    sequence: GameEventType[]
}

class GameEvents {
  event: GameEventType;
  constructor(event:GameEventType) {
    this.event = event;
  }

  init(resolve) {
    this[this.event.type](resolve);
  }
}
