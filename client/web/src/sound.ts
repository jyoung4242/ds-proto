import { bgMusic, gmMusic, buttonWav } from "./assets/assetPool";

import { Howl } from "howler";

export class SFX {
  sfxGain = 0.8;

  buttonClick = new Howl({
    src: [buttonWav],
    volume: this.sfxGain,
  });

  gameSfx = {
    button: this.buttonClick,
  };

  constructor() {}

  play(sfx) {
    this.gameSfx[sfx].play();
  }

  updateVolume(newLevel: number) {
    this.sfxGain = newLevel;
    Object.values(this.gameSfx).forEach(entry => {
      entry.volume(newLevel);
    });
  }

  mute(muted: boolean) {
    Object.values(this.gameSfx).forEach(entry => {
      entry.mute(muted);
    });
  }
}

export class BGM {
  currentSong: Howl;
  bgmGain: number = 0.3;

  gamesong = new Howl({
    src: [gmMusic], //C:\programming\ds proto\client\web\src\assets\audio\POL-power-man-short.wav
    loop: true,
    volume: this.bgmGain,
  });

  titlesong = new Howl({
    src: [bgMusic], //C:\programming\ds proto\client\web\src\assets\audio\POL-power-man-short.wav
    loop: true,
    volume: this.bgmGain,
  });

  gameMusic = {
    title: this.titlesong,
    game: this.gamesong,
  };

  constructor() {}

  play(song: string) {
    if (this.currentSong) {
      this.currentSong.fade(this.bgmGain, 0, 0.25);
    }
    this.currentSong = this.gameMusic[song];
    this.updateVolume(this.bgmGain);
    this.gameMusic[song].play();
  }

  updateVolume(newLevel: number) {
    this.bgmGain = newLevel;
    Object.values(this.gameMusic).forEach(entry => {
      entry.volume(newLevel);
    });
  }

  mute(muted: boolean) {
    Object.values(this.gameMusic).forEach(entry => {
      entry.mute(muted);
    });
  }
}
