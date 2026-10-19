import type { BowlConfig, Catalog } from '../lib/types'
import { BaseFill, Patch } from './art'

const DRESSING_COLOR: Record<string, string> = { chipotle: '#c0623a', jalapeno: '#a7bf5e', cilantro: '#c2d98f', mostaza: '#e3ab2f' }

/** Bowl visto desde arriba. Cada selección aparece al instante con una animación suave. */
export default function BowlVisual({ bowl, catalog }: { bowl: BowlConfig; catalog: Catalog }) {
  const C = 150, CY = 160
  const base = catalog.bases.find((b) => b.id === bowl.baseId)
  const ring = (slot: number, rad = 70) => { const a = (slot / 8) * Math.PI * 2 - Math.PI / 2; return [Math.cos(a) * rad, Math.sin(a) * rad] as const }
  const idx = (list: { id: string }[], id: string) => Math.max(0, list.findIndex((x) => x.id === id))

  return (
    <svg viewBox="0 0 370 320" className="w-full h-auto drop-shadow-[0_18px_24px_rgba(36,58,40,.25)]" role="img" aria-label="Vista de tu bowl desde arriba">
      <defs>
        <clipPath id="inner"><circle cx={C} cy={CY} r="108" /></clipPath>
        <clipPath id="left"><rect x={C - 130} y={CY - 130} width={130 * 1.1} height="260" /></clipPath>
        <clipPath id="right"><rect x={C + 130 * 0.1} y={CY - 130} width={130 * 1.2} height="260" /></clipPath>
        <radialGradient id="rim" cx="50%" cy="40%"><stop offset="0%" stopColor="#ffffff" /><stop offset="100%" stopColor="#dfe8d8" /></radialGradient>
      </defs>

      {/* bowl */}
      <circle cx={C} cy={CY} r="134" fill="#c7d8bd" />
      <circle cx={C} cy={CY} r="128" fill="url(#rim)" />
      <circle cx={C} cy={CY} r="112" fill="#e9eee4" />
      <circle cx={C} cy={CY} r="108" fill="#f3efe4" />

      <g clipPath="url(#inner)">
        <g transform={`translate(${C} ${CY})`}>
          {!base && <text y="6" textAnchor="middle" fontSize="15" fill="#8aa97c" fontWeight="700">Elige tu base</text>}
          {base && base.parts.length === 1 && <g key={base.id} className="animate-pop" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}><BaseFill item={base.parts[0].item} seed={11} /></g>}
        </g>
        {base && base.parts.length === 2 && (
          <g key={base.id} className="animate-pop" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
            <g clipPath="url(#left)"><g transform={`translate(${C} ${CY})`}><BaseFill item={base.parts[0].item} seed={11} /></g></g>
            <g clipPath="url(#right)"><g transform={`translate(${C} ${CY})`}><BaseFill item={base.parts[1].item} seed={23} /></g></g>
            <line x1={C + 13} y1={CY - 110} x2={C + 13} y2={CY + 110} stroke="#fff" strokeOpacity=".5" strokeWidth="2" />
          </g>
        )}

        {base && (
          <>
            <Patch key="pollo" id="pollo" cx={C} cy={CY} r={Math.min(34 + bowl.proteinExtra * 3, 40)} />
            {bowl.veggies.map((id) => { const [x, y] = ring(idx(catalog.veggies, id) * 2); return <Patch key={id} id={id} cx={C + x} cy={CY + y} r={20} /> })}
            {bowl.fruits.map((id) => { const [x, y] = ring(idx(catalog.fruits, id) * 2 + 1); return <Patch key={id} id={id} cx={C + x} cy={CY + y} r={18} /> })}
            {bowl.seeds.map((id, k) => <Patch key={id} id={id} cx={C} cy={CY} r={96 - k * 6} />)}
          </>
        )}
      </g>
      <circle cx={C} cy={CY} r="108" fill="none" stroke="#d3dccb" strokeWidth="3" />

      {/* aderezos en recipientes aparte */}
      <text x="330" y="30" textAnchor="middle" fontSize="10" fontWeight="700" fill="#587449">ADEREZOS</text>
      {bowl.dressings.map((id, k) => {
        const cy = 62 + k * 62
        return (
          <g key={id} className="animate-pop" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
            <circle cx="330" cy={cy} r="25" fill="#fff" stroke="#c7d8bd" strokeWidth="3" />
            <circle cx="330" cy={cy} r="18" fill={DRESSING_COLOR[id] ?? '#d8c9a8'} />
            <ellipse cx="324" cy={cy - 6} rx="6" ry="3" fill="#fff" opacity=".35" />
          </g>
        )
      })}
    </svg>
  )
}
