import { Gender, Roles } from "../../../../api/types";
import { bmale, bfemale, wmale, wfemale, rmale, rfemale, pmale, pfemale } from "../assets/assetPool";

export type iStatusMessage = {
  img: string;
  effect: string;
  angle: number;
  negAngle?: number;
};

export class Character {
  attack: number;
  health: number;
  coin: number;
  name: string;
  img: string;
  index: number;
  role: Roles;
  gender: Gender;
  bloomStatus: "";
  hovered: boolean;
  statusEffects: Array<iStatusMessage>;
  attackPlacard: any;
  coinPlacard: any;

  roleMap = {
    [Roles.Barbarian]: {
      [Gender.Male]: bmale,
      [Gender.Female]: bfemale,
    },
    [Roles.Wizard]: {
      [Gender.Male]: wmale,
      [Gender.Female]: wfemale,
    },
    [Roles.Rogue]: {
      [Gender.Male]: rmale,
      [Gender.Female]: rfemale,
    },
    [Roles.Paladin]: {
      [Gender.Male]: pmale,
      [Gender.Female]: pfemale,
    },
  };

  classMap = {
    1: "pui_meter-1",
    2: "pui_meter-2",
    3: "pui_meter-3",
    4: "pui_meter-4",
  };

  constructor(config) {
    this.attack = 0;
    this.coin = 0;
    this.health = 10;
    this.index = config.index + 1;
    this.name = config.name || "noman";
    this.role = config.role || Roles.Barbarian;
    this.gender = config.gender || Gender.Male;
    this.img = this.roleMap[this.role][this.gender];
    this.bloomStatus = config.bloomStatus;
    this.hovered = false;
    this.statusEffects = config.statusEffects;
    this.coinPlacard = {
      isVisible: false,
      text: "+1",
      offset: 0,
      color: "limegreen",
      opacity: 1,
    };
    this.attackPlacard = {
      isVisible: false,
      text: "+1",
      offset: 0,
      color: "limegreen",
      opacity: 1,
    };
  }

  addHealth(num: number) {
    this.health = this.health + num <= 10 ? this.health + num : 10;
    console.log(`${this.classMap[this.index]}`);
    let myUI: HTMLElement = document.querySelector(`.${this.classMap[this.index]}`);
    console.log(myUI);
    let newAngle = (10 - this.health) * 36;
    myUI.style.setProperty(`--angle${this.index}`, `${newAngle}`);
    if (this.health <= 4 && this.health > 2) myUI.style.stroke = "yellow";
    else if (this.health > 4) myUI.style.stroke = "lime";
  }
  lowerHealth(num: number) {
    this.health = this.health - num >= 0 ? this.health - num : 0;
    let myUI: HTMLElement = document.querySelector(`.${this.classMap[this.index]}`);
    console.log("character, 77, myUI: ", myUI);
    let newAngle = (10 - this.health) * 36;
    myUI.style.setProperty(`--angle${this.index}`, `${newAngle}`);
    if (this.health <= 4 && this.health > 2) myUI.style.stroke = "yellow";
    else if (this.health <= 2) myUI.style.stroke = "red";
  }
  resetHealth() {
    this.health = 10;
    let myUI: HTMLElement = document.querySelector(`.${this.classMap[this.index]}`);
    myUI.style.setProperty(`--angle${this.index}`, `${0}`);
    myUI.style.stroke = "lime";
  }
  clearHover = () => {
    this.hovered = false;
  };

  setHover = () => {
    this.hovered = true;
  };
  isHovered = () => {
    return this.hovered;
  };

  addStatusMessage(msg: iStatusMessage) {
    this.statusEffects.push(msg);

    //reset ALL the angles of each status
    this.statusEffects.forEach((se, index) => {
      const startingRotation = -90 - ((this.statusEffects.length - 1) * 25) / 2;
      const indexedRotation = index * 25;
      const rotation = startingRotation + indexedRotation;
      se.angle = rotation;
      se.negAngle = -rotation;
    });
  }

  removeStatusMessage(msg: iStatusMessage) {}
}
