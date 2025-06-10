import NotificationManager from '../../utils/NotificationManager';

// Sound file paths relative to public directory
const SOUNDS = {
  digital: '/sounds/digital-alarm.mp3',
  bell: '/sounds/bell.mp3',
  chime: '/sounds/chime.mp3',
  complete: '/sounds/bell.mp3' // Reusing bell sound for complete
};

// Cache for preloaded audio elements
const _audioCache = new Map();

/**
 * TimerSounds - Enhanced sound utility for the timer component
 * Provides sound playback, preloading, and error handling
 */
class TimerSounds {
  /**
   * Get the URL for a sound
   * @param {string} sound - Sound name
   * @returns {string} - Sound URL
   */
  static getSoundUrl(sound) {
    return SOUNDS[sound] || SOUNDS.digital;
  }

  /**
   * Create a fallback audio element
   * @private
   * @returns {HTMLAudioElement|Object} - Fallback audio element or mock
   */
  static _createFallbackAudio() {
    try {
      const audio = new Audio();
      audio.volume = 0; // Silent fallback
      return audio;
    } catch (e) {
      console.warn('Could not create fallback audio:', e);
      // Return a dummy object that mimics the Audio interface
      return {
        play: () => Promise.resolve(),
        pause: () => {},
        volume: 0,
        currentTime: 0,
        cloneNode: () => this._createFallbackAudio()
      };
    }
  }

  /**
   * Preload a sound file
   * @param {string} sound - Sound name to preload
   * @returns {Promise<HTMLAudioElement>} - Promise resolving to the audio element
   */
  static preload(sound) {
    // If already in cache, return cached version
    if (_audioCache.has(sound)) {
      return Promise.resolve(_audioCache.get(sound));
    }

    return new Promise((resolve) => {
      try {
        const url = this.getSoundUrl(sound);
        const audio = new Audio(url);
        
        const onLoad = () => {
          cleanup();
          _audioCache.set(sound, audio);
          console.log(`✅ Preloaded sound: ${sound}`);
          resolve(audio);
        };
        
        const onError = (e) => {
          cleanup();
          console.error(`❌ Error preloading sound ${sound}:`, e);
          const fallback = this._createFallbackAudio();
          _audioCache.set(sound, fallback);
          resolve(fallback);
        };

        const cleanup = () => {
          audio.removeEventListener('canplaythrough', onLoad);
          audio.removeEventListener('error', onError);
        };
        
        audio.addEventListener('canplaythrough', onLoad, { once: true });
        audio.addEventListener('error', onError, { once: true });
        
        // Start loading the audio
        audio.load();
      } catch (e) {
        console.error(`❌ Error creating audio for ${sound}:`, e);
        const fallback = this._createFallbackAudio();
        _audioCache.set(sound, fallback);
        resolve(fallback);
      }
    });
  }

  /**
   * Preload all sounds
   * @returns {Promise<Array<string>>} - Array of preloaded sound names
   */
  static async preloadAll() {
    console.log('Preloading sounds:', Object.keys(SOUNDS));
    try {
      await Promise.all(Object.keys(SOUNDS).map(sound => this.preload(sound)));
      console.log('All sounds preloaded');
      return Object.keys(SOUNDS);
    } catch (error) {
      console.error('Error preloading sounds:', error);
      return [];
    }
  }

  /**
   * Play a sound
   * @param {string} sound - Sound name to play
   * @param {number} volume - Volume level (0-1)
   * @returns {Promise<HTMLAudioElement>}
   */
  static async play(sound = 'digital', volume = 1.0) {
    try {
      // Get or preload the audio
      let audio = _audioCache.get(sound);
      if (!audio) {
        console.log(`Sound ${sound} not in cache, preloading...`);
        audio = await this.preload(sound);
      }
      
      // Clone the audio element to allow multiple plays
      const audioClone = audio.cloneNode();
      audioClone.volume = Math.min(1, Math.max(0, volume));
      
      // Play the sound and handle any errors
      try {
        const playPromise = audioClone.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(error => {
            console.error(`Error playing sound ${sound}:`, error);
          });
        }
      } catch (playError) {
        console.error(`Error starting playback for ${sound}:`, playError);
      }
      
      return audioClone;
    } catch (error) {
      console.error('Sound playback error:', error);
      // Use logError only if it exists
      if (typeof NotificationManager?.logError === 'function') {
        NotificationManager.logError('Sound playback error', error);
      }
      // Return a fallback audio element
      return this._createFallbackAudio();
    }
  }
}

// Preload sounds when the module is imported
if (typeof window !== 'undefined') {
  TimerSounds.preloadAll().catch(console.error);
}

export default TimerSounds;
