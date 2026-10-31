import { useRef, type ReactNode, type MouseEvent } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from 'motion/react'
import { cn } from '../../lib/utils'

/**
 * Adapted from the official Aceternity UI CometCard registry component
 * (ui.aceternity.com/registry/comet-card.json), which tracks the pointer
 * with motion values and springs so the card tilts in 3D without any React
 * re-render. Tuned down for TechDrop Lab per the refinement spec:
 * rotation 5 degrees (registry default 17.5), translation 5px (default 20),
 * hover scale 1.01 (default 1.05), the white glare replaced with a faint
 * cyan tint at 10% peak opacity, the registry's oversized shadow stack
 * replaced with one subtle layer, and square corners left to the caller.
 * The tilt is inert on coarse pointers and when `disabled` (reduced motion).
 */
export const CometCard = ({
  rotateDepth = 5,
  translateDepth = 5,
  disabled = false,
  className,
  children,
}: {
  rotateDepth?: number
  translateDepth?: number
  disabled?: boolean
  className?: string
  children: ReactNode
}) => {
  const ref = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 260, damping: 24 })
  const mouseYSpring = useSpring(y, { stiffness: 260, damping: 24 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [`-${rotateDepth}deg`, `${rotateDepth}deg`])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [`${rotateDepth}deg`, `-${rotateDepth}deg`])
  const translateX = useTransform(mouseXSpring, [-0.5, 0.5], [`-${translateDepth}px`, `${translateDepth}px`])
  const translateY = useTransform(mouseYSpring, [-0.5, 0.5], [`${translateDepth}px`, `-${translateDepth}px`])

  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], [0, 100])
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], [0, 100])
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(134, 216, 255, 0.10) 0%, rgba(134, 216, 255, 0) 65%)`

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (disabled || !ref.current) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    const rect = ref.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    x.set(mouseX / rect.width - 0.5)
    y.set(mouseY / rect.height - 0.5)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  if (disabled) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={cn('perspective-distant transform-3d', className)}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          translateX,
          translateY,
          boxShadow: 'rgba(2, 6, 16, 0.35) 0px 12px 28px 0px',
        }}
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
        className="relative h-full"
      >
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ background: glareBackground }}
          aria-hidden="true"
        />
        {children}
      </motion.div>
    </div>
  )
}
