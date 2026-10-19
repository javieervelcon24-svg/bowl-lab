export type CategoryId = 'veggies' | 'fruits' | 'seeds' | 'dressings'

export interface Ingredient {
  id: string
  name: string
  /** gramos (o ml en aderezos) de una porción incluida */
  amount: number
  unit: 'g' | 'ml'
  note?: string
  /** null = alérgenos aún por confirmar con la receta real */
  allergens: string[] | null
  available: boolean
}

export interface BaseOption {
  id: string
  name: string
  description: string
  parts: { item: 'rice' | 'pasta' | 'lettuce'; grams: number }[]
  available: boolean
}

export interface Catalog {
  basePrice: number
  baseExtra: { grams: number; price: number }
  protein: { id: string; name: string; description: string; grams: number; extraGrams: number; extraPrice: number; allergens: string[] | null; available: boolean }
  bases: BaseOption[]
  veggies: Ingredient[]
  fruits: Ingredient[]
  seeds: Ingredient[]
  dressings: Ingredient[]
  extras: Record<CategoryId, number>
  included: Record<CategoryId, number>
}

export interface BowlConfig {
  baseId: string | null
  baseExtras: { rice: number; pasta: number }
  proteinExtra: number
  veggies: string[]
  fruits: string[]
  seeds: string[]
  dressings: string[]
}

export interface CartItem {
  id: string
  bowl: BowlConfig
  qty: number
}

export interface PriceLine { label: string; amount: number }
export interface PriceBreakdown { base: number; lines: PriceLine[]; extrasTotal: number; total: number }
