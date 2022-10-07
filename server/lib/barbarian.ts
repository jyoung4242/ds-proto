import { ABCard, AbilityCardTypes } from "../../api/types";
let BarbarianLibrary: ABCard[] = [];
export default BarbarianLibrary = [
  {
    id: "startersword",
    title: "Sword",
    level: 1,
    cost: 0,
    ActiveEffect: { callback: "addAttack1" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Weapon,
    effectString: "Attack +1",
  },
  {
    id: "starteraxe",
    title: "Axe",
    level: 1,
    cost: 0,
    ActiveEffect: { callback: "addAttack1" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Weapon,
    effectString: "Attack +1",
  },
  {
    id: "startersheild",
    title: "Sheild",
    level: 1,
    cost: 0,
    ActiveEffect: { callback: "addHealth1" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Weapon,
    effectString: "Health +1",
  },
  {
    id: "starterdagger",
    title: "Dagger",
    level: 1,
    cost: 0,
    ActiveEffect: { callback: "chooseAttack1Ability1", userPrompt: "chooseAttack1Ability1" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Weapon,
    effectString: "Choose: Attack +1 -or- Coin +1",
  },
  {
    id: "startermedkit",
    title: "Medkit",
    level: 1,
    cost: 0,
    ActiveEffect: { callback: "addHealth1" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Item,
    effectString: "Health +1",
  },
  {
    id: "starterhorse",
    title: "Steed",
    level: 1,
    cost: 0,
    ActiveEffect: { callback: "addAbility2" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Friend,
    effectString: "Coin +2",
  },
  {
    id: "startersteward",
    title: "Steward",
    level: 1,
    cost: 0,
    ActiveEffect: { callback: "chooseHealth1Ability1", userPrompt: "chooseHealth1Ability1" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Friend,
    effectString: "Choose: Health +1 -or- Coin +1",
  },
  {
    id: "starterrage",
    title: "Barbarian Rage",
    level: 1,
    cost: 0,
    ActiveEffect: { callback: "addAttack1Draw1" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Spell,
    effectString: "Attack +1, Draw 1",
  },
  {
    id: "starterbarbarianfocus",
    title: "Barbarian Focus",
    level: 1,
    cost: 0,
    ActiveEffect: { callback: "addAbility1" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Spell,
    effectString: "Coin +1",
  },
  {
    id: "starterbowarrow",
    title: "Bow and Arrow",
    level: 1,
    cost: 0,
    ActiveEffect: { callback: "chooseAttack1Ability1", userPrompt: "chooseAttack1Ability1" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Weapon,
    effectString: "Choose: Attack +1 -or- Coin +1",
  },
];
