import { MCard, Targets } from "../../api/types";
let MonsterLibrary: MCard[] = [];
export default MonsterLibrary = [
  {
    id: "goblin",
    title: "Goblin",
    health: 5,
    damage: 0,
    level: 1,
    effectstring: "When player discards, Health -1",
    ActiveEffect: undefined,
    PassiveEffect: {
      target: Targets.ActiveHero,
      callback: "discardLose1Health",
    },
    rewardstring: "All players draw one",
    Rewards: {
      target: Targets.AllHereos,
      callback: "allHereosDrawOne",
      userPrompt: "DrawOne",
    },
    StatusEffects: [],
  },
  {
    id: "kobalt",
    title: "Kobalt",
    health: 6,
    damage: 0,
    level: 1,
    effectstring: "Active Hero, -1 Health",
    ActiveEffect: {
      target: Targets.ActiveHero,
      callback: "loseOneHealth",
    },
    PassiveEffect: undefined,
    rewardstring: "All players +1 Ability, +1 Health",
    Rewards: {
      target: Targets.AllHereos,
      callback: "allHereosGain1Ability1Health",
    },
    StatusEffects: [],
  },
  {
    id: "skeleton",
    title: "Skeleton",
    health: 6,
    damage: 0,
    level: 1,
    effectstring: "-1 Health, when location token added",
    ActiveEffect: undefined,
    PassiveEffect: {
      target: Targets.ActiveHero,
      callback: "activeHeroLosesOneHealthLocationCurse",
    },
    rewardstring: "Remove one location point",
    Rewards: {
      target: Targets.AllHereos,
      callback: "removeOneLocationPoint",
    },
    StatusEffects: [],
  },
];
