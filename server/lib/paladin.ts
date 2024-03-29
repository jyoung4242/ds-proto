import { ABCard, AbilityCardTypes } from "../../api/types";
let PaladinLibrary: ABCard[] = [];
export default PaladinLibrary = [
  {
    id: "starterchant",
    title: "Holy Chant",
    level: 1,
    cost: 0,
    ActiveEffect: { callback: "chooseHealth1Ability1", userPrompt: "chooseHealth1Ability1" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Spell,
    effectString: "Choose: Health +1 -or- Coin +1",
  },
  {
    id: "starterconcentration",
    title: "Concentration Aura",
    level: 1,
    cost: 0,
    ActiveEffect: { callback: "addAbility1" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Spell,
    effectString: "Coin +1",
  },
  {
    id: "starterdefense",
    title: "Celestial Defense",
    level: 1,
    cost: 0,
    ActiveEffect: { callback: "addCoin1anyPlayer" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Spell,
    effectString: "Coin +1, for any hero",
  },
  {
    id: "starterhammer",
    title: "Hammer of the church",
    level: 1,
    cost: 0,
    ActiveEffect: { callback: "addAttack1" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Weapon,
    effectString: "Attack +1",
  },
  {
    id: "starterhelmet",
    title: "Righteous Helm",
    level: 1,
    cost: 0,
    ActiveEffect: { callback: "addHealth1" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Item,
    effectString: "Health +1",
  },
  {
    id: "startermace",
    title: "Mace of the Gods",
    level: 1,
    cost: 0,
    ActiveEffect: { callback: "chooseAttack1Draw1", userPrompt: "chooseAttack1Draw1" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Weapon,
    effectString: "Choose: Attack +1 -or- Draw 1 card",
  },
  {
    id: "starterprayer",
    title: "Devine Prayer",
    level: 1,
    cost: 0,
    ActiveEffect: { callback: "addHealth1" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Spell,
    effectString: "Health +1",
  },
  {
    id: "starterredemption",
    title: "Holy Redemption",
    level: 1,
    cost: 0,
    ActiveEffect: { callback: "addHealth1anyPlayer" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Spell,
    effectString: "Health +1 for any one player",
  },
  {
    id: "starterpaladinsheild",
    title: "Sheild of the Devine",
    level: 1,
    cost: 0,
    ActiveEffect: { callback: "chooseHealth1Ability1", userPrompt: "chooseHealth1Ability1" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Item,
    effectString: "Choose: Health +1 -or- Coin +1",
  },
  {
    id: "startertalisman",
    title: "Brooch of the Almighty",
    level: 1,
    cost: 0,
    ActiveEffect: { callback: "draw2discard1", userPrompt: "draw2discard1" },
    PassiveEffect: undefined,
    type: AbilityCardTypes.Item,
    effectString: "Draw 2, Discard 1",
  },
];
