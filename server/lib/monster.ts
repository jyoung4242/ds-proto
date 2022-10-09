import { MCard } from "../../api/types";
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
      callback: "ifDiscardLose1Health",
    },
    rewardstring: "All players draw one",
    Rewards: {
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
      callback: "loseOneHealth",
    },
    PassiveEffect: undefined,
    rewardstring: " +1 Health",
    Rewards: {
      callback: "allHereosGain1Health",
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
      callback: "ifActiveHeroLosesOneHealthLocationCurse",
    },
    rewardstring: "Remove one location point",
    Rewards: {
      callback: "removeLocationPoint",
    },
    StatusEffects: [],
  },
];
