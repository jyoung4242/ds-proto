import { Gender, Roles } from "../../../../api/types";
import bmale from "../assets/people/ff_barbarian.png";
import bfemale from "../assets/people/ff_barbarian_w.png";
import wmale from "../assets/people/ff_wizard.png";
import wfemale from "../assets/people/ff_wizard_w.png";
import rmale from "../assets/people/ff_rogue.png";
import rfemale from "../assets/people/ff_rogue_w.png";
import pmale from "../assets/people/ff_paladin.png";
import pfemale from "../assets/people/ff_paladin_w.png";

export class Character {
  attack: number;
  health: number;
  coin: number;
  name: string;
  img: string;
  index: number;
  role: Roles;
  gender: Gender;

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
    this.index = config.index || 1;
    this.name = config.name || "noman";
    this.role = config.role || Roles.Barbarian;
    this.gender = config.gender || Gender.Male;
    this.img = this.roleMap[this.role][this.gender];
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
}
