import type { ReactNode } from 'react'

/** Generador pseudoaleatorio determinista: el bowl siempre se ve igual para la misma selección. */
export function rng(seed: number) {
  let s = seed >>> 0 || 1
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}
export const hash = (str: string) => [...str].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)

const Grp = ({ cx, cy, children, delay = 0 }: { cx: number; cy: number; children: ReactNode; delay?: number }) => (
  <g transform={`translate(${cx} ${cy})`}>
    <g className="animate-pop" style={{ transformBox: 'fill-box', transformOrigin: 'center', animationDelay: `${delay}ms` }}>{children}</g>
  </g>
)

/** Dibuja un montoncito de ingrediente centrado en (0,0) con radio ~ r. */
function pieces(id: string, r: number) {
  const R = rng(hash(id))
  const out: ReactNode[] = []
  const pt = () => { const a = R() * Math.PI * 2, d = Math.sqrt(R()) * r; return [Math.cos(a) * d, Math.sin(a) * d, R() * 180] as const }
  const n = (k: number, f: (x: number, y: number, rot: number, i: number) => ReactNode) => { for (let i = 0; i < k; i++) { const [x, y, rot] = pt(); out.push(f(x, y, rot, i)) } }

  switch (id) {
    case 'zanahoria': n(16, (x, y, rot, i) => <rect key={i} x={x - 7} y={y - 1.4} width="14" height="2.8" rx="1.4" fill={i % 2 ? '#f08a24' : '#f4a23c'} transform={`rotate(${rot} ${x} ${y})`} />); break
    case 'pepino': n(7, (x, y, _r, i) => <g key={i}><circle cx={x} cy={y} r="7.5" fill="#6aa84f" /><circle cx={x} cy={y} r="5.6" fill="#cfe6b0" /><circle cx={x} cy={y} r="2" fill="#b7d68f" /></g>); break
    case 'elote': n(20, (x, y, rot, i) => <ellipse key={i} cx={x} cy={y} rx="3.6" ry="3" fill={i % 3 ? '#f7c93b' : '#fbd95f'} transform={`rotate(${rot} ${x} ${y})`} />); break
    case 'col': n(11, (x, y, rot, i) => <path key={i} d={`M${x - 8} ${y} q4 -6 8 0 t8 0`} stroke={i % 2 ? '#7a3b8f' : '#a05cb3'} strokeWidth="3" fill="none" strokeLinecap="round" transform={`rotate(${rot} ${x} ${y})`} />); break
    case 'manzana': n(8, (x, y, rot, i) => <g key={i} transform={`rotate(${rot} ${x} ${y})`}><rect x={x - 5.5} y={y - 5.5} width="11" height="11" rx="2.5" fill="#fff3e0" /><rect x={x - 5.5} y={y - 5.5} width="11" height="4" rx="2" fill="#c8323c" /><rect x={x - 5.5} y={y - 5.5} width="4" height="11" rx="2" fill="#d9444d" /></g>); break
    case 'uvas': n(8, (x, y, _r, i) => <g key={i}><circle cx={x} cy={y} r="6.5" fill="#9ccc65" /><circle cx={x - 2} cy={y - 2} r="2" fill="#e4f5c8" opacity=".85" /></g>); break
    case 'pina': n(8, (x, y, rot, i) => <g key={i} transform={`rotate(${rot} ${x} ${y})`}><rect x={x - 5.5} y={y - 5.5} width="11" height="11" rx="2.5" fill="#fbd94d" /><rect x={x - 3} y={y - 3} width="6" height="6" rx="1.5" fill="#fde98b" /></g>); break
    case 'ajonjoli': n(22, (x, y, rot, i) => <ellipse key={i} cx={x} cy={y} rx="2.4" ry="1.4" fill="#f3e6c4" stroke="#d7c18a" strokeWidth=".4" transform={`rotate(${rot} ${x} ${y})`} />); break
    case 'girasol': n(14, (x, y, rot, i) => <ellipse key={i} cx={x} cy={y} rx="3.4" ry="1.9" fill="#9a8c7c" stroke="#5c5146" strokeWidth=".6" transform={`rotate(${rot} ${x} ${y})`} />); break
    case 'pepitas': n(12, (x, y, rot, i) => <ellipse key={i} cx={x} cy={y} rx="3.8" ry="2.4" fill="#5f8f3a" stroke="#3e6425" strokeWidth=".6" transform={`rotate(${rot} ${x} ${y})`} />); break
    case 'rice': n(26, (x, y, rot, i) => <ellipse key={i} cx={x} cy={y} rx="5" ry="2.1" fill="#fff" stroke="#e0d3b4" strokeWidth=".6" transform={`rotate(${rot} ${x} ${y})`} />); break
    case 'pasta': n(9, (x, y, rot, i) => <rect key={i} x={x - 8} y={y - 3.4} width="16" height="6.8" rx="3.4" fill="#f6df8f" stroke="#d9b64f" strokeWidth=".8" transform={`rotate(${rot} ${x} ${y})`} />); break
    case 'lettuce': n(7, (x, y, rot, i) => <path key={i} d={`M${x} ${y} q12 -16 24 0 q-12 16 -24 0z`} fill={i % 2 ? '#7fbf5a' : '#a6d97f'} stroke="#5a9a3c" strokeWidth=".6" transform={`rotate(${rot} ${x} ${y})`} />); break
    case 'pollo': n(10, (x, y, rot, i) => <g key={i} transform={`rotate(${rot} ${x} ${y})`}><rect x={x - 6} y={y - 6} width="12" height="12" rx="3" fill="#e8c78c" /><rect x={x - 6} y={y - 6} width="12" height="5" rx="2.5" fill="#c9954f" /><rect x={x - 6} y={y + 3} width="12" height="3" rx="1.5" fill="#f3dfb4" /></g>); break
    default: n(10, (x, y, _r, i) => <circle key={i} cx={x} cy={y} r="5" fill={`hsl(${hash(id) % 360} 55% 60%)`} />)
  }
  return out
}

export const Patch = ({ id, cx, cy, r, delay }: { id: string; cx: number; cy: number; r: number; delay?: number }) => (
  <Grp cx={cx} cy={cy} delay={delay}>{pieces(id, r)}</Grp>
)

/** Miniatura ilustrada de un ingrediente (se usa en las tarjetas). */
export function IngredientArt({ id, size = 64 }: { id: string; size?: number }) {
  return (
    <svg viewBox="-34 -34 68 68" width={size} height={size} aria-hidden>
      <circle r="32" fill="#fbf8f1" />
      <g>{pieces(id, 20)}</g>
    </svg>
  )
}

export const BASE_ART: Record<string, string> = { rice: 'Arroz', pasta: 'Pasta', lettuce: 'Lechuga' }

/** Relleno de una parte de la base dentro de un clip. */
export function BaseFill({ item, seed }: { item: 'rice' | 'pasta' | 'lettuce'; seed: number }) {
  const R = rng(seed)
  const els: ReactNode[] = []
  const bg = item === 'rice' ? '#fffaf0' : item === 'pasta' ? '#f1d98a' : '#9fcf7e'
  for (let i = 0; i < 110; i++) {
    const x = (R() - 0.5) * 230, y = (R() - 0.5) * 230, rot = R() * 180
    if (item === 'rice') els.push(<ellipse key={i} cx={x} cy={y} rx="5" ry="2.1" fill="#fff" stroke="#e8dcc0" strokeWidth=".5" transform={`rotate(${rot} ${x} ${y})`} />)
    if (item === 'pasta') els.push(<g key={i} transform={`rotate(${rot} ${x} ${y})`}><rect x={x - 9} y={y - 3.6} width="18" height="7.2" rx="3.6" fill="#f6df8f" stroke="#d9b64f" strokeWidth=".7" /><ellipse cx={x + 7} cy={y} rx="1.5" ry="2.2" fill="#d9b64f" opacity=".6" /></g>)
    if (item === 'lettuce' && i < 30) els.push(<path key={i} d={`M${x} ${y} q14 -18 28 0 q-14 18 -28 0z`} fill={i % 2 ? '#7fbf5a' : '#a6d97f'} stroke="#5a9a3c" strokeWidth=".6" transform={`rotate(${rot} ${x} ${y})`} />)
  }
  return <g><rect x="-130" y="-130" width="260" height="260" fill={bg} />{els}</g>
}
