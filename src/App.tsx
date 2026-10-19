import { useMemo, useState } from 'react'
import { BUSINESS, DEFAULT_CATALOG } from './lib/catalog'
import { cartCount, emptyBowl, mxn, sanitize } from './lib/pricing'
import { usePersisted } from './lib/storage'
import type { BowlConfig, CartItem } from './lib/types'
import Builder from './components/Builder'
import Cart from './components/Cart'
import BowlVisual from './components/BowlVisual'

type View = 'home' | 'builder' | 'cart'
interface Draft { bowl: BowlConfig; editingId: string | null; step: number }

const SAMPLE: BowlConfig = { baseId: 'arroz-lechuga', baseExtras: { rice: 0, pasta: 0 }, proteinExtra: 0, veggies: ['zanahoria', 'pepino', 'elote'], fruits: ['manzana'], seeds: ['ajonjoli'], dressings: ['chipotle'] }
const uid = () => Math.random().toString(36).slice(2, 10)

export default function App() {
  const catalog = DEFAULT_CATALOG
  const [saved, setSaved] = usePersisted()
  const [view, setView] = useState<View>(() => (saved.draft ? 'builder' : 'home'))

  const items = saved.items
  const draft: Draft = useMemo(() => {
    const d = saved.draft as Draft | null
    return d ? { ...d, bowl: sanitize(d.bowl, catalog) } : { bowl: emptyBowl(), editingId: null, step: 0 }
  }, [saved.draft, catalog])

  const setDraft = (d: Draft | null) => setSaved((s) => ({ ...s, draft: d }))
  const setItems = (fn: (i: CartItem[]) => CartItem[]) => setSaved((s) => ({ ...s, items: fn(s.items) }))

  const startNew = () => { setDraft({ bowl: emptyBowl(), editingId: null, step: 0 }); setView('builder') }
  const resume = () => { if (!saved.draft) setDraft({ bowl: emptyBowl(), editingId: null, step: 0 }); setView('builder') }

  const submit = () => {
    const bowl = sanitize(draft.bowl, catalog)
    if (draft.editingId) setItems((l) => l.map((i) => (i.id === draft.editingId ? { ...i, bowl } : i)))
    else setItems((l) => [...l, { id: uid(), bowl, qty: 1 }])
    setDraft(null)
    setView('cart')
    window.scrollTo({ top: 0 })
  }

  const count = cartCount(items)

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-sand bg-cream/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <button onClick={() => setView('home')} className="flex items-center gap-2 font-display text-xl font-extrabold text-forest-800">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-sage-500 text-base text-white">🥗</span>{BUSINESS.name}
          </button>
          <button onClick={() => setView('cart')} className="btn relative bg-forest-800 px-4 py-2 text-sm text-white" aria-label="Ver carrito">
            Carrito
            {count > 0 && <span className="ml-2 grid h-5 min-w-5 place-items-center rounded-full bg-peach-500 px-1 text-xs">{count}</span>}
          </button>
        </div>
      </header>

      {view === 'home' && (
        <main>
          <section className="mx-auto grid max-w-5xl items-center gap-6 px-5 pb-10 pt-8 md:grid-cols-2">
            <div className="animate-rise">
              <p className="mb-2 inline-block rounded-full bg-sage-100 px-3 py-1 text-xs font-bold text-forest-700">Bowls frescos para la uni</p>
              <h1 className="font-display text-5xl font-extrabold leading-[1.05] text-forest-900">{BUSINESS.tagline}</h1>
              <p className="mt-4 text-lg text-forest-700">Arma tu bowl con lo que más te gusta, mira cómo se va llenando y pídelo desde tu celular.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button className="btn bg-peach-500 px-7 py-4 text-lg text-white shadow-lg" onClick={startNew}>Arma tu bowl · {mxn(catalog.basePrice)}</button>
                {!!saved.draft && <button className="btn bg-sand text-forest-800" onClick={resume}>Continuar mi bowl</button>}
              </div>
            </div>
            <div className="mx-auto w-full max-w-sm animate-rise"><BowlVisual bowl={SAMPLE} catalog={catalog} /></div>
          </section>

          <section className="bg-sage-50 py-10">
            <div className="mx-auto grid max-w-5xl gap-4 px-5 sm:grid-cols-3">
              {[['1', 'Elige', 'Base, pollo, 3 vegetales, fruta, semillas y aderezo.'], ['2', 'Mira', 'Tu bowl se arma frente a ti con cada elección.'], ['3', 'Pide', 'Confirma tu pedido; el vendedor lo revisa y te lo confirma.']].map(([n, t, s]) => (
                <div key={n} className="rounded-3xl bg-white p-5 shadow-sm"><span className="grid h-9 w-9 place-items-center rounded-full bg-peach-400 font-extrabold text-white">{n}</span><h3 className="mt-3 font-display text-xl font-extrabold">{t}</h3><p className="mt-1 text-sm text-forest-700">{s}</p></div>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-5xl px-5 py-10">
            <h2 className="font-display text-3xl font-extrabold">{mxn(catalog.basePrice)} y todo incluido</h2>
            <p className="mt-2 max-w-xl text-forest-700">Personaliza sin pagar de más mientras respetes lo incluido. ¿Quieres algo extra? Lo ves en el precio al instante.</p>
            <p className="mt-6 rounded-2xl bg-sand p-4 text-xs text-forest-700">Los bowls con arroz y pollo deben mantenerse refrigerados a 4 °C o menos hasta su entrega si se venden fríos. Los pedidos quedan pendientes hasta que el vendedor los confirme.</p>
          </section>
        </main>
      )}

      {view === 'builder' && (
        <Builder
          bowl={draft.bowl} setBowl={(bowl) => setDraft({ ...draft, bowl })}
          step={draft.step} setStep={(step) => { setDraft({ ...draft, step }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          catalog={catalog} editing={!!draft.editingId} onSubmit={submit}
          onCancel={() => { setDraft(null); setView(count ? 'cart' : 'home') }}
        />
      )}

      {view === 'cart' && (
        <Cart
          items={items} notes={saved.notes} catalog={catalog}
          setNotes={(notes) => setSaved((s) => ({ ...s, notes }))}
          setQty={(id, qty) => setItems((l) => l.map((i) => (i.id === id ? { ...i, qty: Math.min(BUSINESS.maxQtyPerLine, Math.max(1, qty)) } : i)))}
          remove={(id) => setItems((l) => l.filter((i) => i.id !== id))}
          edit={(id) => { const it = items.find((i) => i.id === id); if (it) { setDraft({ bowl: it.bowl, editingId: id, step: 6 }); setView('builder') } }}
          clear={() => { setSaved({ items: [], notes: '', draft: null }); setView('home') }}
          onAdd={startNew}
        />
      )}
    </div>
  )
}
