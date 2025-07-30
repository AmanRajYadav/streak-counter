# Asset Guide for Streak Counter

## Required Assets

### GIFs (place in `/public/assets/gifs/`)
- `sad.gif` - Sad animal for streak count 0
- `a.gif` - Happy animal for streaks 1-5
- `b.gif` - Happy animal for streaks 6-10
- `c.gif` - Happy animal for streaks 11-15
- `d.gif` - Happy animal for streaks 16-20
- `e.gif` - Happy animal for streaks 21-25
- `f.gif` - Happy animal for streaks 26-30
- `g.gif` - Happy animal for streaks 31-35
- `h.gif` - Happy animal for streaks 36-40
- `i.gif` - Happy animal for streaks 41-45
- `j.gif` - Happy animal for streaks 46-50
- `o.gif` - Happy animal for streaks 51-55
- `p.gif` - Happy animal for streaks 56-60
- `q.gif` - Happy animal for streaks 61-65
- `r.gif` - Happy animal for streaks 66-70
- `s.gif` - Happy animal for streaks 71-75
- `t.gif` - Happy animal for streaks 76-80
- `u.gif` - Happy animal for streaks 81-85
- `v.gif` - Happy animal for streaks 86-90
- `w.gif` - Happy animal for streaks 91-95
- `x.gif` - Happy animal for streaks 96-100

### Backgrounds (place in `/public/assets/backgrounds/`)
*Note: Backgrounds are now animated! These are optional fallbacks.*
- `sad-bg.jpg` - Fallback background for sad animal
- `a-bg.jpg` through `x-bg.jpg` - Fallback backgrounds for each animal (a,b,c,d,e,f,g,h,i,j,o,p,q,r,s,t,u,v,w,x)

### Sounds (place in `/public/assets/sounds/`)
- `background-music.mp3` - Background music (looping)
- `celebration.mp3` - Celebration sound for milestones

## Notes
- **NEW**: Animals change every 5 streaks instead of 10!
- **NEW**: 20 different animals (a,b,c,d,e,f,g,h,i,j,o,p,q,r,s,t,u,v,w,x) for more variety
- The app cycles through animals repeatedly after reaching 100 streak
- **NEW**: Volume controls for music and sound effects
- **NEW**: Always-on animated backgrounds with rain/sun/fireflies
- Recommended GIF size: 400x400px or similar square ratio
- Audio files should be compressed for web (MP3, OGG formats supported)

## Controls
- Right Arrow, Up Arrow, PageDown, Space: Increase streak
- Left Arrow, Down Arrow, PageUp, Backspace, Escape: Reset streak to 0
- Music button: Toggle background music on/off
- Volume sliders: Control music and sound effects volume
- Presentation Mode: Optimized for presentation remotes

## Milestones
Fireworks and celebration sounds trigger at streaks: 5, 10, 15, 20, 25, 30, etc. (every 5 streaks)