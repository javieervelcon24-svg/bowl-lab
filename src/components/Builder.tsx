import { useState } from 'react'
import type { BowlConfig, Catalog, CategoryId, Ingredient } from '../lib/types'
import { describeBowl, missingSteps, priceBowl, mxn } from '../lib/pricing'
import BowlVisual from './BowlVisual'
import Choice, { Stepper, extraBadge } from './Choice'

const STEPS = ['Base', 'Proteína', 'Vegetales', 'Fruta', 'Semillas', 'Aderezo', 'Resumen']

interface Props {
  bowl: BowlConfig
  setBowl: (b: BowlConfig) => void
  catalog: Catalog
  editing: boolean
  step: number
  setStep: (n: number) => void
  onSubmit: () => void
  onCancel: () => void
}

export default function Builder({ bowl, setBowl, catalog, editing, step, setStep, onSubmit, onCancel }: Props) {
  const [warn, setWarn] = useState('')
  const price = priceBowl(bowl, catalog)
  const missing = missingSteps(bowl, catalog)
  const last = step === STEPS.length - 1

  const flash = (m: string) => { setWarn(m); window.setTimeout(() => setWarn(''), 2800) }

  const toggle = (cat: CategoryId, id: string) => {
    const cur = bowl[cat]
    const has = cur.includes(id)
    const next = has ? cur.filter((x) => x !== id) : [...cur, id]
    if (!has && cur.length >= catalog.included[cat]) {
      flash(`Ya elegiste las ${catalog.included[cat]} opciones incluidas; esta se cobra como extra (+${mxn(catalog.extras[cat])}).`)
    }
    setBowl({ ...bowl, [cat]: next })
  }

  const grid = (cat: CategoryId, list: Ingredient[], allowNone = false, noneLabel = '') => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {allowNone && <Choice name={noneLabel} detail="Sin costo extra" selected={bowl[cat].length === 0} onClick={() => setBowl({ ...bowl, [cat]: [] })} />}
      {list.map((it) => {
        const idx = bowl[cat].indexOf(it.id)
        const selected = idx >= 0
        const paid = selected ? idx >= catalog.included[cat] : bowl[cat].length >= catalog.included[cat]
        return (
          <Choice key={it.id} artId={it.id} name={it.name} detail={`${it.amount} ${it.unit}`} allergens={it.allergens}
            selected={selected} disabled={!it.available && !selected}
            badge={paid ? extraBadge(catalog.extras[cat]) : 'Incluido'} onClick={() => toggle(cat, it.id)} />
        )
      })}
    </div>
  )

  const counter = (cat: CategoryId) => {
    const n = bowl[cat].length, inc = catalog.included[cat]
    return <p className="mb-3 text-sm font-medium text-forest-700">{n}/{inc} incluidos{n > inc ? ` · ${n - inc} extra` : ''}</p>
  }

  const sectionTitle = (t: string, s: string) => (
    <div className="mb-3 animate-rise"><h2 className="font-display text-2xl font-extrabold">{t}</h2><p className="text-sm text-forest-700/80">{s}</p></div>
  )

  const d = describeBowl(bowl, catalog)

  return (
    <div className="mx-auto max-w-5xl px-4 pb-32 pt-4 md:grid md:grid-cols-2 md:gap-8">
      <div className="sticky top-14 z-10 -mx-4 bg-cream/95 px-4 pb-2 backdrop-blur md:top-20 md:h-fit md:bg-transparent">
        <div className="mx-auto max-w-[260px] md:max-w-none"><BowlVisual bowl={bowl} catalog={catalog} /></div>
      </div>

      <div>
        {/* progreso */}
        <div className="mb-5">
          <div className="mb-1 flex justify-between text-xs font-bold text-forest-700"><span>Paso {step + 1} de {STEPS.length}: {STEPS[step]}</span><span>{Math.round(((step + 1) / STEPS.length) * 100)}%</span></div>
          <div className="h-2.5 overflow-hidden rounded-full bg-sand"><div className="h-full rounded-full bg-gradient-to-r from-sage-400 to-peach-400 transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
            {STEPS.map((s, i) => (
              <button key={s} onClick={() => setStep(i)} className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold transition ${i === step ? 'bg-forest-800 text-white' : 'bg-white text-forest-700 border border-sand'}`}>{s}</button>
            ))}
          </div>
        </div>

        {warn && <div role="status" className="mb-3 rounded-2xl bg-peach-400/20 px-4 py-2 text-sm font-medium text-forest-800 animate-rise">{warn}</div>}

        <div key={step} className="animate-rise">
          {step === 0 && (<>
            {sectionTitle('Elige tu base', 'Incluida en los $80.')}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {catalog.bases.map((b) => (
                <Choice key={b.id} artId={b.parts[b.parts.length - 1].item} name={b.name} detail={b.description}
                  selected={bowl.baseId === b.id} disabled={!b.available} badge="Incluida" onClick={() => setBowl({ ...bowl, baseId: b.id })} />
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-sm font-bold">¿Con hambre? Porción extra ({catalog.baseExtra.grams} g por {mxn(catalog.baseExtra.price)})</p>
              <Stepper label="Arroz extra" hint={`${catalog.baseExtra.grams} g cada una`} value={bowl.baseExtras.rice} max={Math.max(0, 3 - bowl.baseExtras.pasta)} onChange={(n) => setBowl({ ...bowl, baseExtras: { ...bowl.baseExtras, rice: n } })} />
              <Stepper label="Pasta extra" hint={`${catalog.baseExtra.grams} g cada una`} value={bowl.baseExtras.pasta} max={Math.max(0, 3 - bowl.baseExtras.rice)} onChange={(n) => setBowl({ ...bowl, baseExtras: { ...bowl.baseExtras, pasta: n } })} />
            </div>
          </>)}

          {step === 1 && (<>
            {sectionTitle('Tu proteína', 'Por ahora solo tenemos pollo. Pronto habrá más.')}
            <Choice artId="pollo" name={catalog.protein.name} detail={`${catalog.protein.grams} g cocidos · ${catalog.protein.description}`} allergens={catalog.protein.allergens} selected badge="Incluida" onClick={() => {}} />
            <div className="mt-4"><Stepper label="Pollo extra" hint={`+${catalog.protein.extraGrams} g por ${mxn(catalog.protein.extraPrice)}`} value={bowl.proteinExtra} max={3} onChange={(n) => setBowl({ ...bowl, proteinExtra: n })} /></div>
          </>)}

          {step === 2 && (<>{sectionTitle('Elige tus vegetales', `${catalog.included.veggies} incluidos (30 g cada uno). Cada vegetal extra: ${mxn(catalog.extras.veggies)}.`)}{counter('veggies')}{grid('veggies', catalog.veggies)}</>)}
          {step === 3 && (<>{sectionTitle('Elige tu fruta', `1 incluida (40 g). Fruta extra: ${mxn(catalog.extras.fruits)}.`)}{counter('fruits')}{grid('fruits', catalog.fruits)}</>)}
          {step === 4 && (<>{sectionTitle('Elige tus semillas', `1 incluida (10 g). Porción extra: ${mxn(catalog.extras.seeds)}.`)}{counter('seeds')}{grid('seeds', catalog.seeds, true, 'Sin semillas')}</>)}
          {step === 5 && (<>{sectionTitle('Elige tu aderezo', `1 incluido (30 ml), en recipiente aparte. Extra: ${mxn(catalog.extras.dressings)}.`)}{counter('dressings')}{grid('dressings', catalog.dressings, true, 'Sin aderezo')}<p className="mt-3 text-xs text-forest-700/70">Los alérgenos de los aderezos se mostrarán cuando se confirmen las recetas reales.</p></>)}

          {last && (
            <div className="rounded-3xl border border-sand bg-white p-5">
              <h2 className="font-display text-2xl font-extrabold">Tu bowl</h2>
              <dl className="mt-3 space-y-2 text-sm">
                {([['Base', d.base], ['Proteína', d.chicken], ['Vegetales', d.veggies || '—'], ['Fruta', d.fruits || '—'], ['Semillas', d.seeds], ['Aderezo', d.dressings]] as const).map(([k, v]) => (
                  <div key={k} className="flex gap-3"><dt className="w-20 shrink-0 font-bold text-forest-700">{k}</dt><dd>{v}</dd></div>
                ))}
              </dl>
              <div className="mt-4 space-y-1 border-t border-sand pt-3 text-sm">
                <div className="flex justify-between"><span>Precio base</span><span>{mxn(price.base)}</span></div>
                {price.lines.map((l) => <div key={l.label} className="flex justify-between text-forest-700"><span>{l.label}</span><span>{mxn(l.amount)}</span></div>)}
                <div className="flex justify-between"><span>Extras</span><span>{mxn(price.extrasTotal)}</span></div>
                <div className="flex justify-between pt-1 text-lg font-extrabold"><span>Total</span><span>{mxn(price.total)}</span></div>
              </div>
              <p className="mt-3 rounded-2xl bg-sage-50 p-3 text-xs text-forest-700">Los bowls con arroz y pollo deben mantenerse refrigerados a 4 °C o menos hasta su entrega si se venden fríos.</p>
              {missing.length > 0 && <p className="mt-3 text-sm font-bold text-peach-500">Falta: {missing.join(' · ')}</p>}
            </div>
          )}
        </div>
      </div>

      {/* barra inferior */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-sand bg-cream/95 px-4 py-3 backdrop-blur" style={{ paddingBottom: 'max(.75rem, env(safe-area-inset-bottom))' }}>
        <div className="mx-auto flex max-w-5xl items-center gap-2">
          <button className="btn bg-sand text-forest-800" onClick={() => (step === 0 ? onCancel() : setStep(step - 1))}>{step === 0 ? 'Salir' : 'Atrás'}</button>
          <div className="flex-1 text-center leading-tight"><p className="text-[11px] text-forest-700/70">Total</p><p className="text-lg font-extrabold">{mxn(price.total)}</p></div>
          {last
            ? <button className="btn bg-peach-500 text-white" disabled={missing.length > 0} onClick={onSubmit}>{editing ? 'Guardar cambios' : 'Agregar al carrito'}</button>
            : <button className="btn bg-forest-800 text-white" onClick={() => setStep(step + 1)}>Siguiente</button>}
        </div>
      </div>
    </div>
  )
}
