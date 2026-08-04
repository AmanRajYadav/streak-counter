import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import * as sfx from './audio'
import {
  ANIMALS,
  BIG_CHEERS,
  GOAL,
  INPUT_COOLDOWN_MS,
  RECORD_KEY,
  SETTINGS_KEY,
  SMALL_CHEERS,
  STREAK_PER_ANIMAL,
  animalFor,
  gifUrl,
  milestoneTier,
  soundUrl,
  starsFor,
  worldFor,
} from './config'

const INCREMENT_CODES = new Set(['PageDown', 'ArrowRight', 'ArrowDown', 'Space', 'Enter', 'KeyN'])
const RESET_CODES = new Set(['PageUp', 'ArrowLeft', 'ArrowUp', 'Backspace', 'Escape', 'KeyP'])
const STEP_BACK_CODES = new Set(['KeyZ', 'Minus', 'NumpadSubtract'])

// Some presentation remotes report only the legacy keyCode.
const INCREMENT_KEYCODES = new Set([34, 39, 40, 32])
const RESET_KEYCODES = new Set([33, 37, 38, 8, 27])

const pick = (list) => list[Math.floor(Math.random() * list.length)]

const readNumber = (key) => {
  const raw = Number(window.localStorage.getItem(key))
  return Number.isFinite(raw) && raw > 0 ? raw : 0
}

const readSettings = () => {
  try {
    return JSON.parse(window.localStorage.getItem(SETTINGS_KEY)) || {}
  } catch {
    return {}
  }
}

const App = () => {
  const saved = useMemo(readSettings, [])

  const [streak, setStreak] = useState(0)
  const [record, setRecord] = useState(() => readNumber(RECORD_KEY))
  const [celebration, setCelebration] = useState(null)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [isPresentationMode, setIsPresentationMode] = useState(false)
  const [musicVolume, setMusicVolume] = useState(saved.musicVolume ?? 0.2)
  const [effectsVolume, setEffectsVolume] = useState(saved.effectsVolume ?? 0.5)
  const [liteMode, setLiteMode] = useState(saved.liteMode ?? false)
  const [isCoarsePointer, setIsCoarsePointer] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const musicRef = useRef(null)
  const appRef = useRef(null)
  const streakRef = useRef(0)
  const recordRef = useRef(record)
  const lastInputRef = useRef(0)
  const celebrationTimer = useRef(null)
  const celebrationId = useRef(0)

  const world = worldFor(streak)
  const animal = animalFor(streak)
  const stars = starsFor(streak)
  const stepsIntoAnimal = streak % STREAK_PER_ANIMAL
  const stepsToNextAnimal = STREAK_PER_ANIMAL - stepsIntoAnimal
  const lapProgress = streak % GOAL
  const isRecord = streak > 0 && streak >= record && record > 0

  // --- persistence ---------------------------------------------------------

  useEffect(() => {
    window.localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ musicVolume, effectsVolume, liteMode }),
    )
  }, [musicVolume, effectsVolume, liteMode])

  useEffect(() => {
    if (musicRef.current) musicRef.current.volume = musicVolume
  }, [musicVolume])

  useEffect(() => {
    sfx.increment.setVolume(effectsVolume)
    sfx.celebration.setVolume(effectsVolume)
    sfx.reset.setVolume(effectsVolume)
  }, [effectsVolume])

  // --- core actions --------------------------------------------------------

  const runCelebration = useCallback(
    (value, tier) => {
      const text =
        tier === 3
          ? `WORLD ${worldFor(value).number} UNLOCKED`
          : tier === 2
            ? pick(BIG_CHEERS)
            : pick(SMALL_CHEERS)

      celebrationId.current += 1
      setCelebration({ id: celebrationId.current, tier, value, text })

      sfx.celebration.play(effectsVolume, tier === 1 ? 1 : 0.92)
      if (tier === 3) {
        window.setTimeout(() => sfx.celebration.play(effectsVolume, 0.82), 650)
      }

      window.clearTimeout(celebrationTimer.current)
      celebrationTimer.current = window.setTimeout(
        () => setCelebration(null),
        tier === 3 ? 3400 : tier === 2 ? 2400 : 1700,
      )
    },
    [effectsVolume],
  )

  // One gate for every input source — remote, keyboard, mouse and touch all
  // funnel through here, so nothing can ever count a single press twice.
  const step = useCallback(
    (delta) => {
      const now = performance.now()
      if (now - lastInputRef.current < INPUT_COOLDOWN_MS) return
      lastInputRef.current = now

      const previous = streakRef.current
      const next = Math.max(0, previous + delta)
      if (next === previous) return

      streakRef.current = next
      setStreak(next)

      if (delta > 0) {
        // Rising pitch through each block of five, so the ear hears the
        // milestone coming before the eyes see it.
        const rate = 1 + (next % STREAK_PER_ANIMAL) * 0.045
        sfx.increment.play(effectsVolume, rate)

        const tier = milestoneTier(next)
        if (tier) runCelebration(next, tier)

        if (next > recordRef.current) {
          recordRef.current = next
          setRecord(next)
          window.localStorage.setItem(RECORD_KEY, String(next))
        }
      }
    },
    [effectsVolume, runCelebration],
  )

  const resetStreak = useCallback(() => {
    const now = performance.now()
    if (now - lastInputRef.current < INPUT_COOLDOWN_MS) return
    lastInputRef.current = now

    if (streakRef.current === 0) return
    streakRef.current = 0
    setStreak(0)
    setCelebration(null)
    window.clearTimeout(celebrationTimer.current)
    sfx.reset.play(effectsVolume)
  }, [effectsVolume])

  const clearRecord = useCallback(() => {
    recordRef.current = 0
    setRecord(0)
    window.localStorage.removeItem(RECORD_KEY)
  }, [])

  // --- input ---------------------------------------------------------------

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    } else {
      document.documentElement.requestFullscreen().catch(() => {})
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event) => {
      // Auto-repeat from a held-down button must not machine-gun the counter.
      if (event.repeat) return

      const target = event.target
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return
      }

      if (INCREMENT_CODES.has(event.code) || INCREMENT_KEYCODES.has(event.keyCode)) {
        event.preventDefault()
        step(1)
      } else if (RESET_CODES.has(event.code) || RESET_KEYCODES.has(event.keyCode)) {
        event.preventDefault()
        resetStreak()
      } else if (STEP_BACK_CODES.has(event.code)) {
        event.preventDefault()
        step(-1)
      } else if (event.code === 'KeyF') {
        event.preventDefault()
        toggleFullscreen()
      } else if (event.code === 'KeyM') {
        event.preventDefault()
        setIsPresentationMode((value) => !value)
      } else if (event.key === 'F5' && !event.ctrlKey) {
        event.preventDefault()
      }
    }

    document.addEventListener('keydown', onKeyDown, { capture: true })
    document.body.tabIndex = -1
    document.body.style.outline = 'none'
    document.body.setAttribute('role', 'application')
    document.body.focus()

    return () => document.removeEventListener('keydown', onKeyDown, { capture: true })
  }, [step, resetStreak, toggleFullscreen])

  // pointerdown only. Mixing onTouchStart with onClick is what made a single
  // phone tap jump the counter by two.
  const onStagePointerDown = useCallback(
    (event) => {
      if (event.target.closest('.no-tap')) return
      event.preventDefault()
      step(1)
    },
    [step],
  )

  useEffect(() => {
    const query = window.matchMedia('(pointer: coarse)')
    const update = () => setIsCoarsePointer(query.matches || window.innerWidth <= 768)
    update()
    query.addEventListener('change', update)
    window.addEventListener('resize', update)
    return () => {
      query.removeEventListener('change', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  // --- assets --------------------------------------------------------------

  // Warm the next two reveals so the surprise lands instantly on the projector.
  useEffect(() => {
    for (let ahead = 1; ahead <= 2; ahead += 1) {
      const image = new Image()
      image.src = gifUrl(animalFor(streakRef.current + ahead * STREAK_PER_ANIMAL))
    }
  }, [animal])

  useEffect(() => {
    const warmEverything = () => {
      sfx.primeAll()
      ANIMALS.forEach((name) => {
        const image = new Image()
        image.src = gifUrl(name)
      })
    }
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(warmEverything, { timeout: 4000 })
      : window.setTimeout(warmEverything, 2000)
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle)
      else window.clearTimeout(idle)
    }
  }, [])

  useEffect(() => () => window.clearTimeout(celebrationTimer.current), [])

  const toggleMusic = () => {
    const music = musicRef.current
    if (!music) return
    if (isMusicPlaying) {
      music.pause()
      setIsMusicPlaying(false)
    } else {
      music.volume = musicVolume
      music
        .play()
        .then(() => setIsMusicPlaying(true))
        .catch(() => {})
    }
  }

  const themeVars = {
    '--w1': world.colors[0],
    '--w2': world.colors[1],
    '--w3': world.colors[2],
    '--w4': world.colors[3],
    '--w5': world.colors[4],
    '--accent': world.accent,
  }

  return (
    <div
      ref={appRef}
      className={`app ${isPresentationMode ? 'presentation-mode' : ''} ${
        streak === 0 ? 'is-idle' : 'is-running'
      } ${isCoarsePointer ? 'touch' : ''}`}
      style={themeVars}
      tabIndex="-1"
      onPointerDown={onStagePointerDown}
      onContextMenu={(event) => event.preventDefault()}
    >
      <audio ref={musicRef} loop preload="none">
        <source src={soundUrl('background-music')} type="audio/mpeg" />
      </audio>

      <Scenery streak={streak} lite={liteMode} accent={world.accent} />

      {isCoarsePointer && (
        <button
          className="hamburger no-tap"
          onPointerDown={(event) => {
            event.stopPropagation()
            setMenuOpen((open) => !open)
          }}
          aria-label="Settings"
        >
          <span />
          <span />
          <span />
        </button>
      )}

      <div
        className={`controls no-tap ${isCoarsePointer ? 'as-sheet' : ''} ${menuOpen ? 'open' : ''}`}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <button onClick={toggleMusic} className="pill music">
          {isMusicPlaying ? '🔇 Pause Music' : '🎵 Play Music'}
        </button>

        <label className="slider">
          <span>🎵 Music {Math.round(musicVolume * 100)}%</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={musicVolume}
            onChange={(event) => setMusicVolume(parseFloat(event.target.value))}
          />
        </label>

        <label className="slider">
          <span>🎉 Effects {Math.round(effectsVolume * 100)}%</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={effectsVolume}
            onChange={(event) => setEffectsVolume(parseFloat(event.target.value))}
          />
        </label>

        <button
          onClick={() => setIsPresentationMode((value) => !value)}
          className={`pill presentation ${isPresentationMode ? 'active' : ''}`}
        >
          {isPresentationMode ? '🎯 Exit Clean View' : '🎮 Clean View'}
        </button>

        <button onClick={toggleFullscreen} className="pill ghost">
          ⛶ Fullscreen <kbd>F</kbd>
        </button>

        <button onClick={() => setLiteMode((value) => !value)} className="pill ghost">
          ✨ Effects: {liteMode ? 'Lite' : 'Full'}
        </button>

        <button onClick={clearRecord} className="pill ghost danger">
          🏆 Clear record
        </button>
      </div>

      <div className={`record-chip no-tap ${isRecord ? 'beaten' : ''}`}>
        {isRecord ? '🏆 NEW RECORD' : `🏆 Best ${record}`}
        {stars > 0 && <span className="stars">{'⭐'.repeat(Math.min(stars, 5))}</span>}
      </div>

      <div className="scoreboard">
        <div className="world-chip">
          <span className="world-badge">{world.badge}</span>
          World {world.number} · {world.name}
        </div>

        <h1 key={streak} className={`streak-number digits-${String(streak).length}`}>
          {streak}
        </h1>
        <p className="streak-label">Streak</p>

        <div className="reveal-track" aria-label={`${stepsToNextAnimal} to the next friend`}>
          {Array.from({ length: STREAK_PER_ANIMAL }, (_, index) => (
            <span key={index} className={`pip ${index < stepsIntoAnimal ? 'lit' : ''}`} />
          ))}
        </div>
        <p className="reveal-hint">
          {streak === 0 ? 'Answer right to wake the streak' : `New friend in ${stepsToNextAnimal}`}
        </p>

        <div className="goal-bar">
          <div className="goal-fill" style={{ width: `${(lapProgress / GOAL) * 100}%` }} />
        </div>
        <p className="goal-text">
          {lapProgress} / {GOAL}
          {stars > 0 && ` · lap ${stars + 1}`}
        </p>
      </div>

      <div className="animal-stage">
        <img
          key={animal}
          src={gifUrl(animal)}
          alt={streak === 0 ? 'Sleepy animal' : `Animal ${animal}`}
          className={`animal ${streak === 0 ? 'sad' : 'happy'}`}
          draggable="false"
          onError={(event) => {
            event.target.classList.add('missing')
            event.target.alt = `Missing GIF: ${animal}.gif`
          }}
        />
      </div>

      {celebration && (
        <>
          <div className={`cheer tier-${celebration.tier}`} key={celebration.id}>
            <span className="cheer-count">{celebration.value}</span>
            <span className="cheer-text">{celebration.text}</span>
            {celebration.tier === 3 && (
              <span className="cheer-world">
                {world.badge} {world.name}
              </span>
            )}
          </div>
          <Fireworks key={`fw-${celebration.id}`} tier={celebration.tier} lite={liteMode} />
        </>
      )}

      {isCoarsePointer && (
        <div className="touch-bar no-tap" onPointerDown={(event) => event.stopPropagation()}>
          <button className="touch-btn small" onPointerDown={() => step(-1)} aria-label="Step back">
            −
          </button>
          <button className="touch-btn big" onPointerDown={() => step(1)} aria-label="Add one">
            +
          </button>
          <button className="touch-btn small" onPointerDown={resetStreak} aria-label="Reset">
            ↻
          </button>
        </div>
      )}

      {!isCoarsePointer && (
        <div className="footer no-tap">
          <p>
            <b>Next:</b> → ↓ PageDown Space &nbsp;·&nbsp; <b>Reset:</b> ← ↑ PageUp Esc
            &nbsp;·&nbsp; <b>Undo:</b> Z &nbsp;·&nbsp; <b>Fullscreen:</b> F
          </p>
          <p className="branding">Powered By Fluence.ac</p>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------

const Scenery = ({ streak, lite, accent }) => {
  const raining = streak === 0
  const raindrops = lite ? 30 : 90
  const motes = lite ? 8 : 20

  return (
    <div className="scenery" aria-hidden="true">
      {!raining && <div className="world-wash" />}

      {raining ? (
        <>
          <div className="grey-sky" />
          <div className="clouds">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className={`cloud cloud-${index + 1}`}>
                <i />
                <i />
                <i />
                <i />
              </div>
            ))}
          </div>
          <div className="rain">
            {Array.from({ length: raindrops }, (_, index) => (
              <span
                key={index}
                className="drop"
                style={{
                  left: `${(index * 97) % 100}%`,
                  animationDuration: `${1.1 + ((index * 7) % 9) / 10}s`,
                  animationDelay: `${((index * 13) % 20) / 10}s`,
                }}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="sun">
          <div className="sun-core" />
          {Array.from({ length: 12 }, (_, index) => (
            <div key={index} className="sun-ray" style={{ transform: `rotate(${index * 30}deg)` }} />
          ))}
        </div>
      )}

      {!raining && !lite && <Fireflies count={14} color={accent} />}

      {!lite &&
        Array.from({ length: motes }, (_, index) => (
          <span
            key={index}
            className="mote"
            style={{
              left: `${(index * 53) % 100}%`,
              top: `${60 + ((index * 17) % 40)}%`,
              animationDuration: `${14 + ((index * 5) % 12)}s`,
              animationDelay: `${(index * 3) % 15}s`,
            }}
          />
        ))}
    </div>
  )
}

// Driven by one requestAnimationFrame loop writing transforms directly, rather
// than 15 components each running a 50ms setInterval through React.
const Fireflies = ({ count, color }) => {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const nodes = Array.from(container.children)
    const bugs = nodes.map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      tx: Math.random() * window.innerWidth,
      ty: Math.random() * window.innerHeight,
      speed: 18 + Math.random() * 26,
      phase: Math.random() * Math.PI * 2,
    }))

    let frame = 0
    let previous = performance.now()

    const tick = (now) => {
      const delta = Math.min(0.064, (now - previous) / 1000)
      previous = now

      for (let index = 0; index < bugs.length; index += 1) {
        const bug = bugs[index]
        const dx = bug.tx - bug.x
        const dy = bug.ty - bug.y
        const distance = Math.hypot(dx, dy) || 1

        if (distance < 40) {
          bug.tx = Math.random() * window.innerWidth
          bug.ty = Math.random() * window.innerHeight
        }

        bug.x += (dx / distance) * bug.speed * delta
        bug.y += (dy / distance) * bug.speed * delta

        const node = nodes[index]
        node.style.transform = `translate3d(${bug.x.toFixed(1)}px, ${bug.y.toFixed(1)}px, 0)`
        node.style.opacity = (
          0.35 +
          0.45 * (0.5 + 0.5 * Math.sin(now * 0.002 + bug.phase))
        ).toFixed(2)
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [count])

  return (
    <div className="fireflies" ref={containerRef} style={{ '--firefly': color }}>
      {Array.from({ length: count }, (_, index) => (
        <span key={index} className="firefly" />
      ))}
    </div>
  )
}

const Fireworks = ({ tier, lite }) => {
  const bursts = lite ? tier + 1 : tier * 3
  const sparks = lite ? 10 : 16

  return (
    <div className="fireworks" aria-hidden="true">
      {Array.from({ length: bursts }, (_, index) => {
        const delay = Math.random() * (tier === 1 ? 0.15 : 0.7)
        return (
          <div
            key={index}
            className="burst"
            style={{
              left: `${12 + Math.random() * 76}%`,
              top: `${16 + Math.random() * 54}%`,
            }}
          >
            {Array.from({ length: sparks }, (_, spark) => (
              <span
                key={spark}
                className="spark"
                style={{
                  '--angle': `${spark * (360 / sparks)}deg`,
                  '--distance': `${70 + Math.random() * 90}px`,
                  animationDelay: `${delay}s`,
                }}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}

export default App
