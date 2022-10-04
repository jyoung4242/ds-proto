import { ABCard, AbilityCardTypes } from "../../api/types";
let AbilityLibrary: ABCard[] = [];
export default AbilityLibrary = [
  {
    id: "dagger",
    title: "Spirit Cleaver",
    level: 1,
    cost: 3,
    ActiveEffect: { callback: "addAttack1" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Weapon,
    effectString: "Attack +1",
  },
  {
    id: "sling",
    title: "Chromacloth",
    level: 1,
    cost: 3,
    ActiveEffect: { callback: "addAttack1Ability1" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Weapon,
    effectString: "Attack +1, Ability +1",
  },
  {
    id: "boradsword",
    title: "Spellsword",
    level: 1,
    cost: 3,
    ActiveEffect: { callback: "addAttack1" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Weapon,
    effectString: "Attack +1",
  },
  {
    id: "manapotion",
    title: "Djinn and Tonic",
    level: 1,
    cost: 4,
    ActiveEffect: { callback: "addHealth1Ability1" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Item,
    effectString: "Health +1, Ability +1",
  },
  {
    id: "bracelet",
    title: "Contingency Band",
    level: 1,
    cost: 3,
    ActiveEffect: { callback: "addAbility1" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Item,
    effectString: "Ability +1",
  },
  {
    id: "jewel",
    title: "Eye of the BookWurm",
    level: 1,
    cost: 3,
    ActiveEffect: { callback: "addAbility1" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Item,
    effectString: "Ability +1",
  },
  {
    id: "daydream",
    title: "Daydream",
    level: 1,
    cost: 2,
    ActiveEffect: { callback: "addAbility1" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Spell,
    effectString: "Ability +1",
  },
  {
    id: "awakening",
    title: "Blast of Awakening",
    level: 1,
    cost: 3,
    ActiveEffect: { callback: "addAbility1" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Spell,
    effectString: "Ability +1",
  },
  {
    id: "torrent",
    title: "Fiery Torrent",
    level: 1,
    cost: 4,
    ActiveEffect: { callback: "addAttack1Draw1", userPrompt: "Draw1" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Spell,
    effectString: "Attack +1, Draw One",
  },
  {
    id: "torment",
    title: "Torment",
    level: 1,
    cost: 4,
    ActiveEffect: { callback: "Draw1Discard1", userPrompt: "Draw1Discard1" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Spell,
    effectString: "Attack +1, Draw One",
  },
  {
    id: "acidhail",
    title: "Acid Hail",
    level: 1,
    cost: 2,
    ActiveEffect: { callback: "addAttack1" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Spell,
    effectString: "Attack +1",
  },
  {
    id: "solitude",
    title: "Solitude Bolt",
    level: 1,
    cost: 3,
    ActiveEffect: { callback: "addAttack1" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Spell,
    effectString: "Attack +1",
  },
  {
    id: "holytempest",
    title: "Holy Tempest",
    level: 1,
    cost: 4,
    ActiveEffect: { callback: "chooseHealth1Draw1", userPrompt: "choose_addHealth1_Draw1" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Spell,
    effectString: "Choose: Health +1 -or- Draw 1",
  },
  {
    id: "eviction",
    title: "Eviction",
    level: 1,
    cost: 5,
    ActiveEffect: { callback: "removeLocationPoint" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Spell,
    effectString: "Remove 1 location point",
  },
  {
    id: "imitation",
    title: "Imitation of Rituals",
    level: 1,
    cost: 3,
    ActiveEffect: {
      callback: "chooseAbility1Draw1",
      userPrompt: "choose_addAbility1_Draw1",
    },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Spell,
    effectString: "Choose: Ability +1 -or Draw 1",
  },
  {
    id: "duraina",
    title: "Duraina Serpentwind",
    level: 1,
    cost: 4,
    ActiveEffect: { callback: "addAttack1ToAHaddHealth1ToAll" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Friend,
    effectString: "Active Hero, add Attack 1, Health +1 to All",
  },
  {
    id: "jacqulyn",
    title: "Jacqulyn Cornwalis",
    level: 1,
    cost: 2,
    ActiveEffect: { callback: "addAttack1" },
    PassiveEffect: { callback: "addHealth1ifMonsterDefeated" },
    type: AbilityCardTypes.Friend,
    effectString: "Active Hero, Attack +1, if monster defeated, +1 Ability",
  },
];
