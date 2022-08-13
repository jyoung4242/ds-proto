type cardConfig = {
  state: any;
  type: "ability" | "monster" | "tower" | "location";
  health?: number;
  activeEffect?: object;
  passiveEffect?: object;
  rewardEffect?: object;
  description: string;
  title: string;
  cost?: number;
  level: number;
};

export class Card {
  type: "ability" | "monster" | "tower" | "location";
  health: number | undefined;
  activeEffect: object | undefined;
  passiveEffect: object | undefined;
  rewardEffect: object | undefined;
  description: string;
  title: string;
  cost: number | undefined;
  level: number;
  componentName: string = "myCard";
  template: string;
  localState: any;

  constructor(config: cardConfig) {
    this.localState = config.state;
    this.type = config.type;
    this.title = config.title;
    this.level = config.level;
    this.description = config.description;

    this.health = config.health ? config.health : undefined;
    this.activeEffect = config.activeEffect ? config.activeEffect : undefined;
    this.passiveEffect = config.passiveEffect ? config.passiveEffect : undefined;
    this.rewardEffect = config.rewardEffect ? config.rewardEffect : undefined;
    this.cost = config.cost ? config.cost : undefined;
  }
}
