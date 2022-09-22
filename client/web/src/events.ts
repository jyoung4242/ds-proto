type GameEventType = {
  type: string;
  message?: string;
  timeout?: number;
  //add optional
};

let log1: GameEventType = {
  type: "log",
  message: "log message 1",
};
let log2: GameEventType = {
  type: "log",
  message: "log message 2",
};
let log3: GameEventType = {
  type: "log",
  message: "log message 3",
};

let alert: GameEventType = {
  type: "alert",
  message: "alert message",
};

let longdelay: GameEventType = {
  type: "delay",
  timeout: 5000,
};

let shortdelay: GameEventType = {
  type: "delay",
  timeout: 1000,
};

type GameEventSequence = {
  sequence: GameEventType[];
};

export let startSequence: GameEventSequence = { sequence: [log1, log2, log3] };

class GameEvent {
  event: GameEventType;
  constructor(event: GameEventType) {
    this.event = event;
  }

  log(resolve) {
    console.log(this.event.message);
    resolve();
  }

  alert(resolve) {
    window.alert(this.event.message);
    resolve();
  }

  delay(resolve) {
    console.log("delay");
    setTimeout(() => {
      resolve();
    }, this.event.timeout);
  }

  init() {
    return new Promise(resolve => {
      this[this.event.type](resolve);
    });
  }
}

export const startEventSequence = async (events: GameEventSequence) => {
  for (let i = 0; i < events.sequence.length; i++) {
    const eventHandler = new GameEvent(events.sequence[i]);
    await eventHandler.init();
  }
};
