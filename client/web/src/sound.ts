import {
  bgMusic,
  gmMusic,
  buttonWav,
  woosh,
  mail,
  dealcard,
  sad,
  damage1,
  damage2,
  damage3,
  attack1,
  attack2,
  attack3,
  mcry,
  defeat,
  buzzer,
  coindrop,
  gainAttack,
  building,
  heal,
  purchase,
  seffect,
} from "./assets/assetPool";

import { Howl } from "howler";

export class SFX {
  sfxGain = 0.8;

  buttonClick = new Howl({
    src: [buttonWav],
    volume: this.sfxGain,
  });

  Damage1 = new Howl({
    src: [damage1],
    volume: this.sfxGain,
  });
  Damage2 = new Howl({
    src: [damage2],
    volume: this.sfxGain,
  });
  Damage3 = new Howl({
    src: [damage3],
    volume: this.sfxGain,
  });

  Attack1 = new Howl({
    src: [attack1],
    volume: this.sfxGain,
  });
  Attack2 = new Howl({
    src: [attack2],
    volume: this.sfxGain,
  });
  Attack3 = new Howl({
    src: [attack3],
    volume: this.sfxGain,
  });

  sadtrombone = new Howl({
    src: [sad],
    volume: this.sfxGain,
    rate: 1.5,
  });

  cardPlayed = new Howl({
    src: [dealcard],
    volume: this.sfxGain,
  });

  mailSend = new Howl({
    src: [woosh],
    volume: this.sfxGain,
  });

  mailGet = new Howl({
    src: [mail],
    volume: this.sfxGain,
  });

  cry = new Howl({
    src: [mcry],
    volume: this.sfxGain,
  });

  die = new Howl({
    src: [defeat],
    volume: this.sfxGain,
  });

  buzzer = new Howl({
    src: [buzzer],
    volume: this.sfxGain,
  });

  coin = new Howl({
    src: [coindrop],
    volume: this.sfxGain * 1.2,
  });

  gainAttack = new Howl({
    src: [gainAttack],
    volume: this.sfxGain * 0.9,
    rate: 2,
  });

  crash = new Howl({
    src: [building],
    volume: this.sfxGain,
  });

  healing = new Howl({
    src: [heal],
    volume: this.sfxGain * 0.9,
    rate: 2,
  });

  buy = new Howl({
    src: [purchase],
    volume: this.sfxGain * 0.9,
    rate: 2,
  });

  statuseffect = new Howl({
    src: [seffect],
    volume: this.sfxGain * 0.9,
    rate: 2,
  });

  gameSfx = {
    button: this.buttonClick,
    mailSend: this.mailSend,
    mailGet: this.mailGet,
    playCard: this.cardPlayed,
    sadT: this.sadtrombone,
    dmg0: this.Damage1,
    dmg1: this.Damage2,
    dmg2: this.Damage3,
    atk0: this.Attack1,
    atk1: this.Attack2,
    atk2: this.Attack3,
    cry: this.cry,
    die: this.die,
    buzzer: this.buzzer,
    coin: this.coin,
    gainAtk: this.gainAttack,
    crash: this.crash,
    healing: this.healing,
    buy: this.buy,
    statuseffect: this.statuseffect,
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
      this.currentSong.stop();
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
