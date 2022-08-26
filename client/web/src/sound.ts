import bgMusic from "./assets/audio/main.wav";
import gmMusic from "./assets/audio/ingame.wav";
import buttonWav from "./assets/audio/button.wav";

import { Howl, Howler } from "howler";

let sfxGain = 0.8;
let bgmGain = 0.3;

let titlesong = new Howl({
  src: [bgMusic], //C:\programming\ds proto\client\web\src\assets\audio\POL-power-man-short.wav
  loop: true,
  volume: bgmGain,
});

let gamesong = new Howl({
  src: [gmMusic], //C:\programming\ds proto\client\web\src\assets\audio\POL-power-man-short.wav
  loop: true,
  volume: bgmGain,
});

let buttonClick = new Howl({
  src: [buttonWav],
  volume: sfxGain,
});

let gameMusic = {
  title: titlesong,
  game: gamesong,
};

let gameSfx = {
  button: buttonClick,
};

export class SFX {
  constructor() {}

  play(sfx) {
    gameSfx[sfx].play();
  }
}

export class BGM {
  currentSong: any = undefined;
  constructor() {}

  play(song: string) {
    if (this.currentSong) {
      this.currentSong.fade(bgmGain, 0, 0.25);
    }
    this.currentSong = gameMusic[song];
    gameMusic[song].play();
  }
}
