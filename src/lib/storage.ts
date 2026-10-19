import { useEffect, useState } from 'react'
import type { CartItem } from './types'

const KEY = 'bowllab-cart-v1'
interface Saved { items: CartItem[]; notes: string; draft: unknown }

function load(): Saved {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Saved
  } catch { /* almacenamiento no disponible */ }
  return { items: [], notes: '', draft: null }
}

/** Persiste carrito, observaciones y bowl en edición para que no se pierdan al recargar. */
export function usePersisted() {
  const [saved, setSaved] = useState<Saved>(load)
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(saved)) } catch { /* ignorar */ }
  }, [saved])
  return [saved, setSaved] as const
}
