import { BUSINESS, DEFAULT_CATALOG } from '../../src/lib/catalog'
import { buildOrderMessage, cartCount, missingSteps, sanitize } from '../../src/lib/pricing'
import type { CartItem } from '../../src/lib/types'

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } })

/**
 * Recibe el pedido, lo valida y recalcula precios en el servidor (nunca confía en los
 * precios del navegador) y te avisa por Telegram.
 * Variables de entorno necesarias: TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID.
 */
export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405)

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return json({ error: 'El aviso al vendedor no está configurado.' }, 500)

  let body: any
  try { body = await req.json() } catch { return json({ error: 'Pedido inválido.' }, 400) }

  const catalog = DEFAULT_CATALOG
  const name = String(body?.name ?? '').trim().slice(0, 60)
  const slot = String(body?.slot ?? '')
  const extra = String(body?.extra ?? '').trim().slice(0, 120)
  const notes = String(body?.notes ?? '').trim().slice(0, 300)
  if (name.length < 2) return json({ error: 'Escribe tu nombre.' }, 400)
  if (!BUSINESS.deliverySlots.includes(slot)) return json({ error: 'Elige un horario válido.' }, 400)
  if (!Array.isArray(body?.items) || body.items.length === 0 || body.items.length > BUSINESS.maxBowlsPerOrder) return json({ error: 'Tu carrito está vacío o es demasiado grande.' }, 400)

  const items: CartItem[] = body.items.map((it: any, i: number) => ({
    id: String(i),
    bowl: sanitize(it?.bowl ?? {}, catalog),
    qty: Math.min(BUSINESS.maxQtyPerLine, Math.max(1, Math.floor(Number(it?.qty) || 1))),
  }))
  if (items.some((it) => missingSteps(it.bowl, catalog).length > 0)) return json({ error: 'Hay un bowl incompleto.' }, 400)
  if (cartCount(items) > BUSINESS.maxBowlsPerOrder) return json({ error: `Máximo ${BUSINESS.maxBowlsPerOrder} bowls por pedido.` }, 400)

  const id = Math.random().toString(36).slice(2, 7).toUpperCase()
  const when = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })
  const text = `NUEVO PEDIDO #${id} (${when})\n\n${buildOrderMessage(items, catalog, { name, slot, notes: extra }, notes).replace(/\*/g, '')}\n\nEstado: PENDIENTE de confirmar con el cliente.`

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })
  if (!res.ok) return json({ error: 'No pudimos avisar al vendedor. Intenta de nuevo.' }, 502)
  return json({ ok: true, id })
}

export const config = { path: '/api/order' }
