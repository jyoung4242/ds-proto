import { TDCard } from "../../api/types";
let TDLibrary: TDCard[] = [];
export default TDLibrary = [
  {
    id: "tripwire1",
    title: "Trip Wire",
    ActiveEffect: {
      callback: "loseTwoHealth",
    },
    PassiveEffect: undefined,
    level: 1,
    effectString: "-2 Health",
  },
  {
    id: "tripwire2",
    title: "Trip Wire",
    ActiveEffect: {
      callback: "loseTwoHealth",
    },
    PassiveEffect: undefined,
    level: 1,
    effectString: "-2 Health",
  },
  {
    id: "tripwire3",
    title: "Trip Wire",
    ActiveEffect: {
      callback: "loseTwoHealth",
    },
    PassiveEffect: undefined,
    level: 1,
    effectString: "-2 Health",
  },
  {
    id: "net1",
    title: "Net Trap",
    ActiveEffect: {
      callback: "addOneLocationPoint",
    },
    PassiveEffect: undefined,
    level: 1,
    effectString: "add one location point",
  },
  {
    id: "net2",
    title: "Net Trap",
    ActiveEffect: {
      callback: "addOneLocationPoint",
    },
    PassiveEffect: undefined,
    level: 1,
    effectString: "add one location point",
  },
  {
    id: "net3",
    title: "Net Trap",
    ActiveEffect: {
      callback: "addOneLocationPoint",
    },
    PassiveEffect: undefined,
    level: 1,
    effectString: "add one location point",
  },
  {
    id: "pit1",
    title: "Pit Trap",
    ActiveEffect: {
      callback: "loseOneHealth",
    },
    PassiveEffect: undefined,
    level: 1,
    effectString: "Active Hero, -1 Health",
  },
  {
    id: "pit2",
    title: "Pit Trap",
    ActiveEffect: {
      callback: "loseOneHealth",
    },
    PassiveEffect: undefined,
    level: 1,
    effectString: "Active Hero, -1 Health",
  },
  {
    id: "quicksand1",
    title: "Quick Sand Trap",
    ActiveEffect: undefined,
    PassiveEffect: {
      callback: "noDraw",
    },
    level: 1,
    effectString: "Unable to Draw Cards this turn",
  },
  {
    id: "quicksand2",
    title: "Quick Sand Trap",
    ActiveEffect: undefined,
    PassiveEffect: {
      callback: "noDraw",
    },
    level: 1,
    effectString: "Unable to Draw Cards this turn",
  },
];
