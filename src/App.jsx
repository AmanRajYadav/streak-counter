import React, { useState, useEffect, useRef } from 'react'
import './App.css'

const App = () => {
  const [streak, setStreak] = useState(0)
  const [showFireworks, setShowFireworks] = useState(false)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [celebrationMessage, setCelebrationMessage] = useState('')
  // Always use animated background
  const [isPresentationMode, setIsPresentationMode] = useState(false)
  const [musicVolume, setMusicVolume] = useState(0.2)
  const [effectsVolume, setEffectsVolume] = useState(0.4)
  const audioRef = useRef(null)
  const celebrationSoundRef = useRef(null)
  const appRef = useRef(null)

  const getAnimalIndex = (streakCount) => {
    if (streakCount === 0) return 'sad'
    
    // 20 animals for streaks 1-100, changing every 5 streaks
    const animals = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 
                     'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x']
    
    // Calculate which animal to show (changes every 5 streaks)
    const animalIndex = Math.floor((streakCount - 1) / 5) % animals.length
    return animals[animalIndex]
  }

  const isMilestone = (streakCount) => {
    return streakCount > 0 && (streakCount % 5 === 0)
  }

  // Presentation Remote Support - Based on research of Logitech, Kensington, and Universal remotes
  const PRESENTATION_REMOTE_KEYS = {
    // Keys that increment streak (Next slide actions)
    increment: [
      'PageDown',     // Most common - Page Down
      'ArrowRight',   // Right arrow
      'ArrowDown',    // Down arrow
      'Space',        // Space bar
      'KeyN'          // N key (some remotes)
    ],
    // Keys that reset streak (Previous slide/exit actions)
    reset: [
      'PageUp',       // Most common - Page Up
      'ArrowLeft',    // Left arrow
      'ArrowUp',      // Up arrow
      'Backspace',    // Backspace
      'Escape',       // Escape
      'KeyP'          // P key (some remotes)
    ]
  }

  const incrementStreak = React.useCallback(() => {
    setStreak(prevStreak => {
      const newStreak = prevStreak + 1
      console.log('✅ Incrementing streak from', prevStreak, 'to', newStreak)
      
      if (isMilestone(newStreak)) {
        setTimeout(() => triggerCelebration(newStreak), 0)
      }
      
      return newStreak
    })
  }, [])
  
  const resetStreak = React.useCallback(() => {
    console.log('🔄 Resetting streak to 0')
    setStreak(0)
    setCelebrationMessage('')
  }, [])
  
  const handlePresentationRemoteInput = React.useCallback((event) => {
    const keyInfo = {
      key: event.key,
      code: event.code,
      keyCode: event.keyCode,
      type: event.type
    }
    console.log('🎮 Remote input detected:', keyInfo)
    
    // Check if this is a presentation remote key
    const isIncrementKey = PRESENTATION_REMOTE_KEYS.increment.includes(event.code) ||
                          (event.keyCode === 34) || // PageDown keyCode
                          (event.keyCode === 39) || // ArrowRight keyCode
                          (event.keyCode === 40) || // ArrowDown keyCode
                          (event.keyCode === 32)    // Space keyCode
    
    const isResetKey = PRESENTATION_REMOTE_KEYS.reset.includes(event.code) ||
                      (event.keyCode === 33) || // PageUp keyCode
                      (event.keyCode === 37) || // ArrowLeft keyCode
                      (event.keyCode === 38) || // ArrowUp keyCode
                      (event.keyCode === 8) ||  // Backspace keyCode
                      (event.keyCode === 27)    // Escape keyCode
    
    if (isIncrementKey) {
      // Prevent browser navigation/scrolling
      event.preventDefault()
      event.stopPropagation()
      console.log('🔥 Presentation remote: INCREMENT')
      incrementStreak()
    } else if (isResetKey) {
      // Prevent browser navigation/scrolling
      event.preventDefault()
      event.stopPropagation()
      console.log('🔄 Presentation remote: RESET')
      resetStreak()
    }
  }, [incrementStreak, resetStreak])

  const triggerCelebration = (streakCount) => {
    setShowFireworks(true)
    setCelebrationMessage(`Amazing! ${streakCount} streak! 🎉`)
    
    if (celebrationSoundRef.current) {
      celebrationSoundRef.current.currentTime = 0
      celebrationSoundRef.current.play().catch(e => console.log('Audio play failed:', e))
    }

    setTimeout(() => {
      setShowFireworks(false)
      setCelebrationMessage('')
    }, 3000)
  }

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e))
      }
      setIsMusicPlaying(!isMusicPlaying)
    }
  }

  // Update audio volumes when they change
  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume
    }
  }, [musicVolume])

  React.useEffect(() => {
    if (celebrationSoundRef.current) {
      celebrationSoundRef.current.volume = effectsVolume
    }
  }, [effectsVolume])

  // Background toggle removed - always animated

  useEffect(() => {
    let lastKeyTime = 0
    const DEBOUNCE_DELAY = 150 // ms - Prevent rapid-fire from held keys
    
    const handleGlobalKeyInput = (event) => {
      const currentTime = Date.now()
      
      // Debounce to prevent double-firing from presentation remotes
      if (currentTime - lastKeyTime < DEBOUNCE_DELAY) {
        console.log('⏱️ Debounced duplicate key event')
        event.preventDefault()
        event.stopPropagation()
        return
      }
      
      lastKeyTime = currentTime
      handlePresentationRemoteInput(event)
    }

    // Listen for keydown events (most reliable for remotes)
    document.addEventListener('keydown', handleGlobalKeyInput, {
      capture: true,
      passive: false // Allow preventDefault
    })
    
    // Also listen for keyup to catch remotes that send different events
    document.addEventListener('keyup', handleGlobalKeyInput, {
      capture: true, 
      passive: false
    })
    
    // Ensure the document can receive focus for presentation mode
    document.body.tabIndex = -1
    document.body.style.outline = 'none'
    document.body.setAttribute('role', 'application') // Screen reader compatibility
    
    // Focus the document to ensure key events are captured
    document.body.focus()
    
    // Prevent F5 refresh during presentations
    const preventF5Refresh = (event) => {
      if (event.key === 'F5' && !event.ctrlKey) {
        event.preventDefault()
        console.log('🚫 Prevented F5 refresh during presentation')
      }
    }
    
    window.addEventListener('keydown', preventF5Refresh)
    
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyInput, { capture: true })
      document.removeEventListener('keyup', handleGlobalKeyInput, { capture: true })
      window.removeEventListener('keydown', preventF5Refresh)
    }
  }, [handlePresentationRemoteInput])

  const currentAnimal = getAnimalIndex(streak)
  const animalGifPath = currentAnimal === 'sad' ? '/assets/gifs/sad.gif' : `/assets/gifs/${currentAnimal}.gif`
  const backgroundImage = currentAnimal === 'sad' ? '/assets/backgrounds/sad-bg.jpg' : `/assets/backgrounds/${currentAnimal}-bg.jpg`

  return (
    <div 
      ref={appRef}
      className={`app animated-bg ${isPresentationMode ? 'presentation-mode' : ''}`}
      tabIndex="-1"
    >
      <audio ref={audioRef} loop>
        <source src="/assets/sounds/background-music.mp3" type="audio/mpeg" />
      </audio>
      
      <audio ref={celebrationSoundRef}>
        <source src="/assets/sounds/celebration.mp3" type="audio/mpeg" />
      </audio>

      <div className="controls">
        <button onClick={toggleMusic} className="music-btn">
          {isMusicPlaying ? '🔇 Pause Music' : '🎵 Play Music'}
        </button>
        
        <div className="volume-controls">
          <div className="volume-control">
            <label>🎵 Music: {Math.round(musicVolume * 100)}%</label>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={musicVolume}
              onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
              className="volume-slider"
            />
          </div>
          
          <div className="volume-control">
            <label>🎉 Effects: {Math.round(effectsVolume * 100)}%</label>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={effectsVolume}
              onChange={(e) => setEffectsVolume(parseFloat(e.target.value))}
              className="volume-slider"
            />
          </div>
        </div>

        <button 
          onClick={() => {
            setIsPresentationMode(!isPresentationMode)
            if (!isPresentationMode) {
              // Enter presentation mode - ensure focus
              setTimeout(() => {
                if (appRef.current) {
                  appRef.current.focus()
                } else {
                  document.body.focus()
                }
              }, 100)
            }
          }} 
          className={`presentation-btn ${isPresentationMode ? 'active' : ''}`}
        >
          {isPresentationMode ? '🎯 Exit Presentation' : '🎮 Presentation Mode'}
        </button>
      </div>

      <div className="streak-display">
        <h1 className="streak-number">{streak}</h1>
        <p className="streak-label">Streak Count</p>
      </div>

      <div className="animal-container">
        <img 
          src={animalGifPath} 
          alt={`Animal ${currentAnimal}`}
          className={`animal-gif ${streak === 0 ? 'sad' : 'happy'}`}
          style={{ 
            display: 'block',
            maxWidth: '400px',
            maxHeight: '400px',
            zIndex: 10
          }}
          onError={(e) => {
            console.log(`Could not load image: ${animalGifPath}`)
            // Don't hide, show placeholder instead
            e.target.alt = `Missing: ${currentAnimal} animal`
            e.target.style.border = '3px dashed #ccc'
            e.target.style.padding = '20px'
            e.target.style.backgroundColor = 'rgba(255,255,255,0.8)'
          }}
        />
      </div>

      {celebrationMessage && (
        <div className="celebration-message">
          {celebrationMessage}
        </div>
      )}

      {showFireworks && <Fireworks />}
      
      <AnimatedBackground streak={streak} />

      <div className="instructions">
        <p>📊 Next: → ↓ PageDown Space</p>
        <p>🔄 Reset: ← ↑ PageUp Backspace Esc</p>
        <p>🎮 {isPresentationMode ? 'PRESENTATION MODE ACTIVE' : 'Click Presentation Mode for remotes'}</p>
        <p className="branding">Powered By Fluence</p>
      </div>
    </div>
  )
}

const Fireworks = () => {
  return (
    <div className="fireworks-container">
      {[...Array(6)].map((_, i) => (
        <div key={i} className={`firework firework-${i + 1}`}>
          <div className="explosion">
            {[...Array(12)].map((_, j) => (
              <div key={j} className="spark" style={{
                transform: `rotate(${j * 30}deg)`
              }}></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const AnimatedBackground = ({ streak }) => {
  return (
    <div className="animated-background-container">
      {/* Background Gradient */}
      {streak > 0 && <div className="purple-gradient-background"></div>}
      
      {/* Weather Effects */}
      {streak === 0 ? (
        <RainEffect />
      ) : (
        <SunEffect />
      )}
      
      {/* Fireflies - only show when streak > 0 */}
      {streak > 0 && [...Array(15)].map((_, i) => (
        <Firefly key={`firefly-${i}`} index={i} />
      ))}
      
      {/* Incandescent particles */}
      {[...Array(25)].map((_, i) => (
        <div key={`particle-${i}`} className={`particle particle-${i + 1}`}></div>
      ))}
      
      {/* Floating dust motes */}
      {[...Array(20)].map((_, i) => (
        <div key={`mote-${i}`} className={`dust-mote mote-${i + 1}`}></div>
      ))}
    </div>
  )
}

const RainEffect = () => {
  return (
    <>
      <div className="cloudy-background"></div>
      <div className="clouds-container">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`cloud cloud-${i + 1}`}>
            <div className="cloud-part cloud-part-1"></div>
            <div className="cloud-part cloud-part-2"></div>
            <div className="cloud-part cloud-part-3"></div>
            <div className="cloud-part cloud-part-4"></div>
          </div>
        ))}
      </div>
      <div className="rain-container">
        {[...Array(100)].map((_, i) => (
          <div key={i} className={`raindrop raindrop-${i + 1}`}></div>
        ))}
      </div>
    </>
  )
}

const SunEffect = () => {
  return (
    <div className="sun-container">
      <div className="sun">
        <div className="sun-core"></div>
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`sun-ray sun-ray-${i + 1}`} style={{
            transform: `rotate(${i * 30}deg)`
          }}></div>
        ))}
      </div>
    </div>
  )
}

const Firefly = ({ index }) => {
  const [position, setPosition] = React.useState({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight
  })
  const [glowIntensity, setGlowIntensity] = React.useState(0.5 + Math.random() * 0.5)
  const [targetPosition, setTargetPosition] = React.useState({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight
  })
  
  React.useEffect(() => {
    const moveFirefly = () => {
      setPosition(prev => {
        const dx = targetPosition.x - prev.x
        const dy = targetPosition.y - prev.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < 50) {
          setTargetPosition({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight
          })
        }
        
        const speed = 0.5 + Math.random() * 0.5
        const wanderX = (Math.random() - 0.5) * 2
        const wanderY = (Math.random() - 0.5) * 2
        
        return {
          x: prev.x + (dx / distance) * speed + wanderX,
          y: prev.y + (dy / distance) * speed + wanderY
        }
      })
    }
    
    const glowCycle = () => {
      setGlowIntensity(Math.random() * 0.8 + 0.2)
    }
    
    const moveInterval = setInterval(moveFirefly, 50)
    const glowInterval = setInterval(glowCycle, 1000 + Math.random() * 2000)
    
    return () => {
      clearInterval(moveInterval)
      clearInterval(glowInterval)
    }
  }, [targetPosition])
  
  const handleClick = () => {
    // Create sparkle burst on click
    setGlowIntensity(1)
    setTimeout(() => setGlowIntensity(0.5), 200)
    
    // Teleport to new position
    setPosition({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight
    })
  }
  
  return (
    <div 
      className="interactive-firefly"
      style={{
        left: position.x,
        top: position.y,
        opacity: glowIntensity,
        boxShadow: `0 0 ${20 + glowIntensity * 30}px rgba(255, 255, 0, ${glowIntensity})`
      }}
      onClick={handleClick}
    >
      <div className="firefly-glow" style={{
        opacity: glowIntensity * 0.5
      }}></div>
    </div>
  )
}

export default App