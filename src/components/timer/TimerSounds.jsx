import React from 'react';

// Sound URLs
const SOUND_URLS = {
  digital: '/sounds/digital-alarm.mp3',
  bell: '/sounds/bell.mp3',
  chime: '/sounds/chime.mp3'
};

// Sound context for managing timer sounds
const TimerSounds = {
  play: (sound = 'digital') => {
    try {
      const audio = new Audio(SOUND_URLS[sound] || SOUND_URLS.digital);
      audio.play().catch(error => {
        console.log('Error playing sound:', error);
      });
      return audio;
    } catch (error) {
      console.log('Sound playback not supported');
      return null;
    }
  },
  
  getAvailableSounds: () => {
    return Object.keys(SOUND_URLS);
  }
};

export default TimerSounds;
