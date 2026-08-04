import { soundUrl } from './config'

// Small pools of <audio> clones so rapid-fire presses overlap instead of
// cutting each other off mid-chime.
const createPool = (name, size) => {
  let clips = null
  let cursor = 0

  const load = () => {
    if (!clips) {
      clips = Array.from({ length: size }, () => {
        const clip = new Audio(soundUrl(name))
        clip.preload = 'auto'
        return clip
      })
    }
    return clips
  }

  return {
    prime() {
      load()
    },
    setVolume(volume) {
      load().forEach((clip) => {
        clip.volume = volume
      })
    },
    play(volume, rate = 1) {
      const clip = load()[cursor]
      cursor = (cursor + 1) % size
      clip.volume = volume
      // Keep the tempo change from sounding like a chipmunk where supported.
      if ('preservesPitch' in clip) clip.preservesPitch = false
      if ('mozPreservesPitch' in clip) clip.mozPreservesPitch = false
      clip.playbackRate = rate
      try {
        clip.currentTime = 0
      } catch {
        /* not seekable yet — fine, it will start from 0 anyway */
      }
      clip.play().catch(() => {
        /* browser is still waiting for a user gesture; nothing to do */
      })
    },
  }
}

export const increment = createPool('increment', 5)
export const celebration = createPool('celebration', 3)
export const reset = createPool('reset', 2)

export const primeAll = () => {
  increment.prime()
  celebration.prime()
  reset.prime()
}
