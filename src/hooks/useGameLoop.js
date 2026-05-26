import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { TICK_MS } from '../utils/constants'

export function useGameLoop() {
  const tick = useGameStore(s => s.tick)
  const ref  = useRef(Date.now())
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now()
      tick(now - ref.current)
      ref.current = now
    }, TICK_MS)
    return () => clearInterval(id)
  }, [tick])
}
