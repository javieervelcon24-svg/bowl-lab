import { IngredientArt } from './art'
import { mxn } from '../lib/pricing'

export function AllergenTags({ allergens }: { allergens: string[] | null }) {
  if (allergens === null) return <span className="text-[11px] text-forest-700/60">Alérgenos: por confirmar</span>
  if (allergens.length === 0) return null
  return <span className="text-[11px] font-bold text-peach-500">Contiene: {allergens.join(', ')}</span>
}

interface Props {
  artId?: string
  name: string
  detail: string
  allergens?: string[] | null
  selected: boolean
  disabled?: boolean
  badge?: string
  onClick: () => void
}

/** Tarjeta de ingrediente con indicador de selección. */
export default function Choice({ artId, name, detail, allergens, selected, disabled, badge, onClick }: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={`relative flex flex-col items-center gap-1 rounded-3xl border-2 p-3 text-center transition active:scale-[.97] disabled:opacity-45 ${
        selected ? 'border-sage-500 bg-sage-100 shadow-md' : 'border-sand bg-white hover:border-sage-300'
      }`}
    >
      {artId ? <IngredientArt id={artId} size={64} /> : <div className="h-16 w-16 rounded-full bg-sand grid place-items-center text-2xl">∅</div>}
      <span className="text-sm font-bold leading-tight">{name}</span>
      <span className="text-xs text-forest-700/70">{disabled ? 'Agotado' : detail}</span>
      {allergens !== undefined && <AllergenTags allergens={allergens} />}
      {badge && !disabled && <span className={`mt-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${badge.startsWith('+') ? 'bg-peach-400/25 text-peach-500' : 'bg-sage-200 text-forest-700'}`}>{badge}</span>}
      <span className={`absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full text-xs font-bold transition ${selected ? 'bg-sage-500 text-white scale-100' : 'bg-sand text-transparent scale-90'}`}>✓</span>
    </button>
  )
}

export function Stepper({ label, hint, value, max, onChange }: { label: string; hint: string; value: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-3xl bg-white p-3 border border-sand">
      <div>
        <p className="text-sm font-bold">{label}</p>
        <p className="text-xs text-forest-700/70">{hint}</p>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Quitar" className="h-9 w-9 rounded-full bg-sand text-lg font-bold disabled:opacity-30" disabled={value <= 0} onClick={() => onChange(value - 1)}>−</button>
        <span className="w-5 text-center font-bold">{value}</span>
        <button type="button" aria-label="Agregar" className="h-9 w-9 rounded-full bg-sage-500 text-lg font-bold text-white disabled:opacity-30" disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
      </div>
    </div>
  )
}

export const extraBadge = (n: number) => `+${mxn(n)}`
