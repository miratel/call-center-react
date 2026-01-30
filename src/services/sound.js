// src/services/sound.js
import { Howl } from 'howler';

const sounds = {
    ringtone: new Howl({
        src: ['/sounds/ringtone.mp3'],
        loop: true,
        volume: 0.5,
    }),
    busy: new Howl({
        src: ['/sounds/busy.mp3'],
        volume: 0.5,
    }),
    dialtone: new Howl({
        src: ['/sounds/dialtone.mp3'],
        loop: true,
        volume: 0.3,
    }),
    beep: new Howl({
        src: ['/sounds/beep.mp3'],
        volume: 0.3,
    }),
    message: new Howl({
        src: ['/sounds/message.mp3'],
        volume: 0.5,
    }),
};

export const playSound = (soundName) => {
    if (sounds[soundName]) {
        sounds[soundName].play();
    }
};

export const stopSound = (soundName) => {
    if (sounds[soundName]) {
        sounds[soundName].stop();
    }
};

export const setVolume = (soundName, volume) => {
    if (sounds[soundName]) {
        sounds[soundName].volume(volume);
    }
};

export default sounds;