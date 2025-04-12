import { Howl } from 'howler';
import C from '../assets/audio/C_major.mp3';
import G from '../assets/audio/G_major.mp3';
import F from '../assets/audio/F_major.mp3';

const sounds: Record<string, Howl> = {
  C_major: new Howl({ src: [C] }),
  G_major: new Howl({ src: [G] }),
  F_major: new Howl({ src: [F] }),
};

export function playChord(chord: string): void {
  if (sounds[chord]) {
    sounds[chord].play();
  }
}
