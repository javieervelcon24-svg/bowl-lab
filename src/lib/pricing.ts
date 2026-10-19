import type { BowlConfig, Catalog, CartItem, CategoryId, PriceBreakdown } from './types'

export const emptyBowl = (): BowlConfig => ({
  baseId: null,
  baseExtras: { rice: 0, pasta: 0 },
  proteinExtra: 0,
  veggies: [],
  fruits: [],
  seeds: [],
  dressings: [],
})

export const mxn = (n: number) => `$${n.toLocaleString('es-MX', { maximumFractionDigits: 2 })}`

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, Math.floor(Number.isFinite(n) ? n : min)))

/** Garantiza que la configuración sea válida: sin negativos, sin ids repetidos o inexistentes. */
export function sanitize(b: BowlConfig, c: Catalog): BowlConfig {
  const pick = (ids: string[], list: { id: string }[]) => [...new Set(ids)].filter((id) => list.some((x) => x.id === id))
  return {
    baseId: c.bases.some((x) => x.id === b.baseId) ? b.baseId : null,
    baseExtras: { rice: clamp(b.baseExtras.rice, 0, 3), pasta: clamp(b.baseExtras.pasta, 0, 3) },
    proteinExtra: clamp(b.proteinExtra, 0, 3),
    veggies: pick(b.veggies, c.veggies),
    fruits: pick(b.fruits, c.fruits),
    seeds: pick(b.seeds, c.seeds),
    dressings: pick(b.dressings, c.dressings),
  }
}

const CATS: { id: CategoryId; label: string }[] = [
  { id: 'veggies', label: 'Vegetal extra' },
  { id: 'fruits', label: 'Fruta extra' },
  { id: 'seeds', label: 'Semillas extra' },
  { id: 'dressings', label: 'Aderezo extra' },
]

export function priceBowl(raw: BowlConfig, c: Catalog): PriceBreakdown {
  const b = sanitize(raw, c)
  const lines: PriceBreakdown['lines'] = []

  const riceExtra = b.baseExtras.rice
  const pastaExtra = b.baseExtras.pasta
  if (riceExtra) lines.push({ label: `Arroz extra ×${riceExtra} (${c.baseExtra.grams} g)`, amount: riceExtra * c.baseExtra.price })
  if (pastaExtra) lines.push({ label: `Pasta extra ×${pastaExtra} (${c.baseExtra.grams} g)`, amount: pastaExtra * c.baseExtra.price })
  if (b.proteinExtra) lines.push({ label: `Pollo extra ×${b.proteinExtra} (${c.protein.extraGrams} g)`, amount: b.proteinExtra * c.protein.extraPrice })

  for (const cat of CATS) {
    const over = Math.max(0, b[cat.id].length - c.included[cat.id])
    if (over) lines.push({ label: `${cat.label}${over > 1 ? ` ×${over}` : ''}`, amount: over * c.extras[cat.id] })
  }

  const extrasTotal = lines.reduce((s, l) => s + l.amount, 0)
  return { base: c.basePrice, lines, extrasTotal, total: c.basePrice + extrasTotal }
}

/** ¿Está completo? Devuelve los pasos pendientes (mensajes para el usuario). */
export function missingSteps(b: BowlConfig, c: Catalog): string[] {
  const out: string[] = []
  if (!b.baseId) out.push('Elige tu base')
  if (b.veggies.length === 0) out.push('Elige al menos un vegetal')
  if (b.fruits.length === 0) out.push('Elige una fruta')
  return out
}

export const cartTotal = (items: CartItem[], c: Catalog) => items.reduce((s, i) => s + priceBowl(i.bowl, c).total * i.qty, 0)
export const cartCount = (items: CartItem[]) => items.reduce((s, i) => s + i.qty, 0)

const names = (ids: string[], list: { id: string; name: string }[]) => ids.map((id) => list.find((x) => x.id === id)?.name ?? id)

/** Descripción en texto de un bowl (para el resumen y el aviso al vendedor). */
export function describeBowl(raw: BowlConfig, c: Catalog) {
  const b = sanitize(raw, c)
  const base = c.bases.find((x) => x.id === b.baseId)
  const baseTxt = base ? `${base.name} (${base.description})` : 'Sin base'
  const extraBase = [b.baseExtras.rice ? `+${b.baseExtras.rice * c.baseExtra.grams} g arroz` : '', b.baseExtras.pasta ? `+${b.baseExtras.pasta * c.baseExtra.grams} g pasta` : ''].filter(Boolean)
  const chicken = c.protein.grams + b.proteinExtra * c.protein.extraGrams
  const amt = (list: { id: string; amount: number; unit: string }[], ids: string[]) => (ids.length ? `${list.find((x) => x.id === ids[0])?.amount} ${list.find((x) => x.id === ids[0])?.unit} c/u` : '')
  return {
    base: baseTxt + (extraBase.length ? ` ${extraBase.join(', ')}` : ''),
    chicken: `${c.protein.name}: ${chicken} g cocidos`,
    veggies: names(b.veggies, c.veggies).join(', ') + (b.veggies.length ? ` (${amt(c.veggies, b.veggies)})` : ''),
    fruits: names(b.fruits, c.fruits).join(', ') + (b.fruits.length ? ` (${amt(c.fruits, b.fruits)})` : ''),
    seeds: b.seeds.length ? names(b.seeds, c.seeds).join(', ') + ` (${amt(c.seeds, b.seeds)})` : 'Sin semillas',
    dressings: b.dressings.length ? names(b.dressings, c.dressings).join(', ') + ` (${amt(c.dressings, b.dressings)}, en recipiente aparte)` : 'Sin aderezo',
  }
}

export interface OrderInfo { name: string; slot: string; notes: string }

export function buildOrderMessage(items: CartItem[], c: Catalog, info: OrderInfo, cartNotes: string): string {
  const L: string[] = []
  L.push('*Pedido Bowl Lab*', `Cliente: ${info.name.trim()}`, `Horario solicitado: ${info.slot}`, '')
  items.forEach((it, i) => {
    const d = describeBowl(it.bowl, c)
    const p = priceBowl(it.bowl, c)
    L.push(`*Bowl ${i + 1}* ×${it.qty}`)
    L.push(`• Base: ${d.base}`, `• ${d.chicken}`, `• Vegetales: ${d.veggies}`, `• Fruta: ${d.fruits}`, `• Semillas: ${d.seeds}`, `• Aderezo: ${d.dressings}`)
    if (p.lines.length) L.push(`• Extras: ${p.lines.map((l) => `${l.label} ${mxn(l.amount)}`).join('; ')}`)
    L.push(`• Precio por bowl: ${mxn(p.total)}${it.qty > 1 ? ` → ${mxn(p.total * it.qty)}` : ''}`, '')
  })
  const notes = [cartNotes.trim(), info.notes.trim()].filter(Boolean).join(' | ')
  if (notes) L.push(`Observaciones: ${notes}`, '')
  L.push(`*Total: ${mxn(cartTotal(items, c))}*`)
  return L.join('\n')
}

