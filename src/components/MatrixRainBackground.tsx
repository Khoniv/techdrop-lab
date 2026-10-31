import { useEffect, useRef } from 'react'

/**
 * Decorative full-viewport Matrix rain: sparse blue glyph streams falling
 * behind the site on a deep navy foundation, with a gentle localised
 * brightening/displacement around the pointer. One Canvas 2D layer,
 * pointer-events disabled, hidden from assistive technology, and fully
 * static under prefers-reduced-motion. All animation state lives outside
 * React; a single delta-timed rAF loop drives it and is cancelled on
 * unmount or while the page is hidden.
 */

const GLYPHS = '01ABCDEFXYZ<>+-*/#'
const HEAD_COLOR = '#4DABF7'
const MID_COLOR = '#3185DA'
const DIM_COLOR = '#2164B1'
const POINTER_RADIUS = 150

interface Stream {
  x: number
  y: number
  speed: number
  len: number
  chars: string[]
  wait: number
}

const randChar = () => GLYPHS[(Math.random() * GLYPHS.length) | 0]
const rand = (min: number, max: number) => min + Math.random() * (max - min)

export default function MatrixRainBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)')
    let width = 0
    let height = 0
    let fontSize = 13
    let streams: Stream[] = []
    let raf = 0
    let running = false
    let last = 0

    // Pointer state, consumed by the frame loop (never React state).
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, energy: 0, lastMove: 0 }

    const newStream = (x: number, initial: boolean): Stream => {
      const len = Math.round(rand(6, 17))
      return {
        x,
        y: initial ? rand(-height * 0.4, height) : rand(-320, -40),
        speed: rand(34, 92),
        len,
        chars: Array.from({ length: len }, randChar),
        wait: 0,
      }
    }

    const buildStreams = () => {
      const mobile = width < 768
      const gap = mobile ? 38 : 30
      const activeFraction = mobile ? 0.5 : 0.7
      fontSize = mobile ? 11 : 13
      streams = []
      for (let x = gap / 2; x < width; x += gap) {
        if (Math.random() > activeFraction) continue
        streams.push(newStream(x + rand(-5, 5), true))
      }
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      buildStreams()
      if (reducedMq.matches) drawStatic()
    }

    const drawGlyph = (ch: string, gx: number, gy: number, alpha: number, color: string) => {
      let a = alpha
      let ox = 0
      let oy = 0
      if (pointer.energy > 0.01 && pointer.x > -1000) {
        const dx = gx - pointer.x
        const dy = gy - pointer.y
        const dist2 = dx * dx + dy * dy
        if (dist2 < POINTER_RADIUS * POINTER_RADIUS) {
          const dist = Math.sqrt(dist2) || 1
          const fall = 1 - dist / POINTER_RADIUS
          const influence = fall * fall * pointer.energy
          a += influence * 0.3
          ox = (dx / dist) * influence * 13
          oy = (dy / dist) * influence * 7
        }
      }
      ctx.globalAlpha = Math.min(a, 0.85)
      ctx.fillStyle = color
      ctx.fillText(ch, gx + ox, gy + oy)
    }

    const paint = (advance: number) => {
      ctx.clearRect(0, 0, width, height)
      ctx.font = `${fontSize}px "IBM Plex Mono", monospace`
      ctx.textAlign = 'center'
      const step = fontSize * 1.12
      for (const s of streams) {
        if (s.wait > 0) {
          s.wait -= advance
          continue
        }
        s.y += s.speed * advance
        // Recycle once the whole trail has left the canvas.
        if (s.y - s.len * step > height + 30) {
          Object.assign(s, newStream(s.x, false))
          if (Math.random() < 0.3) s.wait = rand(0.8, 3.6)
          continue
        }
        for (let i = 0; i < s.len; i++) {
          const gy = s.y - i * step
          if (gy < -fontSize || gy > height + fontSize) continue
          if (advance > 0 && Math.random() < 0.012) s.chars[i] = randChar()
          const alpha = i === 0 ? 0.5 : Math.max(0.1, 0.36 * Math.exp(-i * 0.24))
          const color = i === 0 ? HEAD_COLOR : i < 6 ? MID_COLOR : DIM_COLOR
          drawGlyph(s.chars[i], s.x, gy, alpha, color)
        }
      }
      ctx.globalAlpha = 1
    }

    const drawStatic = () => {
      // Reduced motion: one still frame of sparse, faint glyphs.
      pointer.energy = 0
      paint(0)
    }

    const frame = (now: number) => {
      if (!running) return
      const dt = Math.min((now - last) / 1000 || 0.016, 0.05)
      last = now
      // Pointer smoothing + energy: rises while the pointer moves,
      // decays smoothly once it stops so no halo is left behind.
      const target = now - pointer.lastMove < 140 ? 1 : 0
      pointer.energy += (target - pointer.energy) * Math.min(1, dt * 5)
      if (pointer.energy < 0.005 && target === 0) pointer.energy = 0
      if (pointer.tx > -1000) {
        if (pointer.x < -1000) {
          pointer.x = pointer.tx
          pointer.y = pointer.ty
        } else {
          const k = Math.min(1, dt * 11)
          pointer.x += (pointer.tx - pointer.x) * k
          pointer.y += (pointer.ty - pointer.y) * k
        }
      }
      paint(dt)
      raf = requestAnimationFrame(frame)
    }

    const start = () => {
      if (running || reducedMq.matches || document.hidden) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    const onPointerMove = (e: PointerEvent) => {
      pointer.tx = e.clientX
      pointer.ty = e.clientY
      pointer.lastMove = performance.now()
    }
    const onPointerLeave = () => {
      pointer.tx = -9999
      pointer.ty = -9999
      pointer.lastMove = 0
    }
    const onVisibility = () => {
      if (document.hidden) stop()
      else start()
    }
    const onReducedChange = () => {
      if (reducedMq.matches) {
        stop()
        drawStatic()
      } else {
        resize()
        start()
      }
    }

    resize()
    if (reducedMq.matches) drawStatic()
    else start()

    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointerLeave)
    document.addEventListener('visibilitychange', onVisibility)
    reducedMq.addEventListener('change', onReducedChange)

    return () => {
      stop()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      reducedMq.removeEventListener('change', onReducedChange)
    }
  }, [])

  return (
    <>
      {/* Permanent deep navy atmosphere: subtle tonal gradient + blueprint grid.
          The base color itself lives on the --color-bg token (body, shell,
          header), so the page stays navy even if this layer never paints. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'linear-gradient(135deg, #031838 0%, #061D3F 55%, #09244A 100%)',
        }}
      >
        <div className="blueprint-grid absolute inset-0 opacity-60" />
      </div>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1] h-full w-full"
      />
    </>
  )
}
