import type { Catalog } from './types'

/**
 * Catálogo inicial. Todo es editable: cuando exista el panel de administración
 * (Supabase) estos valores vendrán de la base de datos.
 * Alérgenos = null significa "por confirmar con tu receta real": no se inventan.
 */
export const DEFAULT_CATALOG: Catalog = {
  basePrice: 80,
  baseExtra: { grams: 100, price: 10 },
  protein: {
    id: 'pollo',
    name: 'Pechuga de pollo a la plancha',
    description: 'Sazonada y cortada en cubitos',
    grams: 90,
    extraGrams: 45,
    extraPrice: 20,
    allergens: null,
    available: true,
  },
  bases: [
    { id: 'arroz', name: 'Arroz blanco', description: '250 g cocidos', parts: [{ item: 'rice', grams: 250 }], available: true },
    { id: 'pasta', name: 'Pasta corta', description: '250 g cocidos', parts: [{ item: 'pasta', grams: 250 }], available: true },
    { id: 'lechuga', name: 'Lechuga fresca', description: '100 g', parts: [{ item: 'lettuce', grams: 100 }], available: true },
    { id: 'arroz-pasta', name: 'Mitad arroz, mitad pasta', description: '125 g de cada uno', parts: [{ item: 'rice', grams: 125 }, { item: 'pasta', grams: 125 }], available: true },
    { id: 'arroz-lechuga', name: 'Mitad arroz, mitad lechuga', description: '125 g de arroz y 50 g de lechuga', parts: [{ item: 'rice', grams: 125 }, { item: 'lettuce', grams: 50 }], available: true },
  ],
  veggies: [
    { id: 'zanahoria', name: 'Zanahoria rallada', amount: 30, unit: 'g', allergens: [], available: true },
    { id: 'pepino', name: 'Pepino', amount: 30, unit: 'g', allergens: [], available: true },
    { id: 'elote', name: 'Elote amarillo', amount: 30, unit: 'g', allergens: [], available: true },
    { id: 'col', name: 'Col morada', amount: 30, unit: 'g', allergens: [], available: true },
  ],
  fruits: [
    { id: 'manzana', name: 'Manzana roja', amount: 40, unit: 'g', allergens: [], available: true },
    { id: 'uvas', name: 'Uvas verdes', amount: 40, unit: 'g', allergens: [], available: true },
    { id: 'pina', name: 'Piña', amount: 40, unit: 'g', allergens: [], available: true },
  ],
  seeds: [
    { id: 'ajonjoli', name: 'Ajonjolí tostado', amount: 10, unit: 'g', allergens: ['ajonjolí'], available: true },
    { id: 'girasol', name: 'Semillas de girasol', amount: 10, unit: 'g', allergens: [], available: true },
    { id: 'pepitas', name: 'Pepitas de calabaza', amount: 10, unit: 'g', allergens: [], available: true },
  ],
  dressings: [
    { id: 'chipotle', name: 'Chipotle cremoso', amount: 30, unit: 'ml', allergens: null, available: true },
    { id: 'jalapeno', name: 'Jalapeño cremoso', amount: 30, unit: 'ml', allergens: null, available: true },
    { id: 'cilantro', name: 'Cilantro con limón', amount: 30, unit: 'ml', allergens: null, available: true },
    { id: 'mostaza', name: 'Mostaza con miel', amount: 30, unit: 'ml', allergens: null, available: true },
  ],
  extras: { veggies: 7, fruits: 10, seeds: 8, dressings: 8 },
  included: { veggies: 3, fruits: 1, seeds: 1, dressings: 1 },
}

/** Configuración del negocio (se moverá al panel de administración). */
export const BUSINESS = {
  name: 'Bowl Lab',
  tagline: 'Tu bowl, tus reglas.',
  /** Horarios provisionales: el vendedor los define desde el panel. */
  deliverySlots: ['Primer receso', 'Segundo receso', 'Antes de la última clase'],
  maxQtyPerLine: 10,
  maxBowlsPerOrder: 20,
}
