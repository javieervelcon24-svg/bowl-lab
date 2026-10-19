import { useState } from 'react'
import type { CartItem, Catalog } from '../lib/types'
import { BUSINESS } from '../lib/catalog'
import { cartCount, cartTotal, describeBowl, mxn, priceBowl } from '../lib/pricing'
import BowlVisual from './BowlVisual'

interface Props {
  items: CartItem[]
  notes: string
  catalog: Catalog
  setNotes: (s: string) => void
  setQty: (id: string, qty: number) => void
  remove: (id: string) => void
  edit: (id: string) => void
  clear: () => void
  onAdd: () => void
}

export default function Cart({ items, notes, catalog, setNotes, setQty, remove, edit, clear, onAdd }: Props) {
  const [name, setName] = useState('')
  const [slot, setSlot] = useState('')
  const [extra, setExtra] = useState('')
  const [sent, setSent] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [touched, setTouched] = useState(false)

  const total = cartTotal(items, catalog)
  const count = cartCount(items)
  const tooMany = count > BUSINESS.maxBowlsPerOrder
  const valid = name.trim().length >= 2 && slot !== '' && items.length > 0 && !tooMany

  const confirm = async () => {
    setTouched(true)
    setError('')
    if (!valid || sending || sent) return
    setSending(true)
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ items: items.map((i) => ({ bowl: i.bowl, qty: i.qty })), notes, name, slot, extra }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) throw new Error(data.error || 'No pudimos enviar tu pedido.')
      setSent(data.id as string)
    } catch (e) {
      setError(e instanceof Error && e.message !== 'Failed to fetch' ? e.message : 'No pudimos enviar tu pedido. Revisa tu conexión e intenta de nuevo.')
    } finally {
      setSending(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-sage-100 text-4xl">🥗</div>
        <h2 className="font-display text-2xl font-extrabold">Tu carrito está vacío</h2>
        <p className="mt-2 text-forest-700/80">Arma tu primer bowl en menos de un minuto.</p>
        <button className="btn mt-6 bg-peach-500 text-white" onClick={onAdd}>Armar mi bowl</button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-4">
      <h2 className="mb-4 font-display text-3xl font-extrabold">Tu pedido</h2>

      <ul className="space-y-3">
        {items.map((it, i) => {
          const d = describeBowl(it.bowl, catalog)
          const p = priceBowl(it.bowl, catalog)
          return (
            <li key={it.id} className="flex gap-3 rounded-3xl border border-sand bg-white p-3">
              <div className="w-24 shrink-0"><BowlVisual bowl={it.bowl} catalog={catalog} /></div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-bold">Bowl {i + 1}</p>
                <p className="text-xs text-forest-700/80">{d.base} · {d.veggies} · {d.fruits} · {d.seeds} · {d.dressings}</p>
                {p.lines.length > 0 && <p className="mt-1 text-xs font-medium text-peach-500">Extras: {p.lines.map((l) => `${l.label} ${mxn(l.amount)}`).join(', ')}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <button aria-label="Menos" className="h-8 w-8 rounded-full bg-sand font-bold" onClick={() => setQty(it.id, it.qty - 1)}>−</button>
                    <span className="w-5 text-center font-bold">{it.qty}</span>
                    <button aria-label="Más" className="h-8 w-8 rounded-full bg-sage-500 font-bold text-white disabled:opacity-30" disabled={it.qty >= BUSINESS.maxQtyPerLine} onClick={() => setQty(it.id, it.qty + 1)}>+</button>
                  </div>
                  <button className="text-xs font-bold text-forest-700 underline" onClick={() => edit(it.id)}>Editar</button>
                  <button className="text-xs font-bold text-red-700 underline" onClick={() => remove(it.id)}>Eliminar</button>
                  <span className="ml-auto font-extrabold">{mxn(p.total * it.qty)}</span>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <button className="btn mt-3 w-full border-2 border-dashed border-sage-300 text-forest-700" onClick={onAdd}>+ Agregar otro bowl</button>

      <label className="mt-5 block text-sm font-bold">Observaciones del pedido (opcional)
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300} rows={2} placeholder="Ej. sin picante" className="mt-1 w-full rounded-2xl border border-sand bg-white p-3 font-normal" />
      </label>

      <div className="mt-5 space-y-1 rounded-3xl bg-sage-50 p-4 text-sm">
        <div className="flex justify-between"><span>Subtotal ({count} {count === 1 ? 'bowl' : 'bowls'})</span><span>{mxn(total)}</span></div>
        <div className="flex justify-between text-lg font-extrabold"><span>Total</span><span>{mxn(total)}</span></div>
      </div>

      <section className="mt-6 space-y-3 rounded-3xl border border-sand bg-white p-4">
        <h3 className="font-display text-xl font-extrabold">Datos para tu entrega</h3>
        <label className="block text-sm font-bold">Tu nombre
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name" className="mt-1 w-full rounded-2xl border border-sand p-3 font-normal" />
          {touched && name.trim().length < 2 && <span className="text-xs text-red-700">Escribe tu nombre.</span>}
        </label>
        <label className="block text-sm font-bold">Horario de entrega
          <select value={slot} onChange={(e) => setSlot(e.target.value)} className="mt-1 w-full rounded-2xl border border-sand bg-white p-3 font-normal">
            <option value="">Elige un horario</option>
            {BUSINESS.deliverySlots.map((s) => <option key={s}>{s}</option>)}
          </select>
          {touched && !slot && <span className="text-xs text-red-700">Elige un horario.</span>}
        </label>
        <label className="block text-sm font-bold">Indicaciones de entrega (opcional)
          <input value={extra} onChange={(e) => setExtra(e.target.value)} maxLength={120} placeholder="Ej. edificio, salón" className="mt-1 w-full rounded-2xl border border-sand p-3 font-normal" />
        </label>
        {tooMany && <p className="text-sm font-bold text-red-700">Máximo {BUSINESS.maxBowlsPerOrder} bowls por pedido.</p>}
      </section>

      <p className="mt-4 rounded-2xl bg-sage-50 p-3 text-xs text-forest-700">Los bowls con arroz y pollo deben mantenerse refrigerados a 4 °C o menos hasta su entrega si se venden fríos.</p>

      <button onClick={confirm} disabled={sending || !!sent} className="btn mt-4 w-full bg-forest-800 py-4 text-lg text-white shadow-lg">
        {sending ? 'Enviando…' : sent ? 'Pedido enviado' : 'Confirmar pedido'}
      </button>
      {error && <p role="alert" className="mt-3 rounded-2xl bg-red-100 p-3 text-sm font-medium text-red-800">{error}</p>}

      {sent && (
        <div role="status" className="mt-4 rounded-3xl border-2 border-peach-400 bg-peach-400/15 p-4 animate-rise">
          <p className="font-extrabold">⏳ Pedido #{sent} recibido, pendiente de confirmación</p>
          <p className="mt-1 text-sm">Ya le avisamos al vendedor. Tu pedido <b>aún no está confirmado</b>: queda confirmado cuando el vendedor lo acepte.</p>
          <button className="mt-2 text-xs font-bold underline" onClick={clear}>Hacer otro pedido</button>
        </div>
      )}
    </div>
  )
}
