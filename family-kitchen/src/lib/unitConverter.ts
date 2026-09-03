export type BaseUnit = 'g' | 'ml' | 'whole' | 'unknown';

export interface IngredientInput {
  name: string;
  quantity: number;
  unit: string;
}

export interface NormalizedIngredient extends IngredientInput {
  baseUnit: BaseUnit;
  baseQuantity: number;
}

/**
 * Normalizes common UK supermarket units into a standard base unit (g, ml, whole).
 */
export function normalizeUnit(unit: string): { baseUnit: BaseUnit; multiplier: number } {
  const u = (unit || '').toLowerCase().trim();
  switch (u) {
    case 'kg':
    case 'kilo':
    case 'kilogram':
    case 'kilograms':
      return { baseUnit: 'g', multiplier: 1000 };
    case 'g':
    case 'gram':
    case 'grams':
      return { baseUnit: 'g', multiplier: 1 };
    case 'l':
    case 'liter':
    case 'liters':
    case 'litre':
    case 'litres':
      return { baseUnit: 'ml', multiplier: 1000 };
    case 'ml':
    case 'milliliter':
    case 'milliliters':
      return { baseUnit: 'ml', multiplier: 1 };
    case 'cup':
    case 'cups':
      // Metric cup is often ~250ml in modern UK standard, though traditionally 1/2 pt
      return { baseUnit: 'ml', multiplier: 250 };
    case 'tbsp':
    case 'tbsps':
    case 'tablespoon':
    case 'tablespoons':
      return { baseUnit: 'ml', multiplier: 15 };
    case 'tsp':
    case 'tsps':
    case 'teaspoon':
    case 'teaspoons':
      return { baseUnit: 'ml', multiplier: 5 };
    case 'whole':
    case 'pack':
    case 'packs':
    case 'item':
    case 'items':
    case 'clove':
    case 'cloves':
    case 'pinch':
    case 'pinches':
    case 'can':
    case 'cans':
    case 'jar':
    case 'jars':
    case 'tin':
    case 'tins':
      return { baseUnit: 'whole', multiplier: 1 };
    default:
      return { baseUnit: 'unknown', multiplier: 1 };
  }
}

/**
 * Smart pack-rounding math.
 * e.g., 600g beef with 500g pack = 2 packs.
 * 510g beef with 500g pack = 1 pack (using a tolerance, default 5%).
 */
export function calculatePacksRequired(
  requiredQuantity: number,
  packSize: number,
  toleranceRatio: number = 0.05
): number {
  if (packSize <= 0) return 0;
  if (requiredQuantity <= 0) return 0;

  const packs = Math.floor(requiredQuantity / packSize);
  const remainder = requiredQuantity % packSize;

  if (remainder === 0) return packs;

  // If we already have at least 1 pack, check if the remainder falls within our tolerance.
  // E.g. required 510g, packSize 500g, tolerance 0.05 (5%).
  // packs * packSize = 500g. tolerance allowed = 500g * 1.05 = 525g.
  // 510g <= 525g -> return 1 pack.
  if (packs > 0 && requiredQuantity <= (packs * packSize) * (1 + toleranceRatio)) {
    return packs;
  }

  // Otherwise, we need an extra pack for the remainder.
  return packs + 1;
}

/**
 * Aggregates a list of ingredients, standardizing units and summing quantities.
 */
export function aggregateIngredients(ingredients: IngredientInput[]): NormalizedIngredient[] {
  const aggregated = new Map<string, NormalizedIngredient>();

  for (const ing of ingredients) {
    const { baseUnit, multiplier } = normalizeUnit(ing.unit);
    // Key by lowercased name and base unit to group properly
    const key = `${ing.name.toLowerCase().trim()}_${baseUnit}`;
    const baseQuantity = ing.quantity * multiplier;

    if (aggregated.has(key)) {
      const existing = aggregated.get(key)!;
      existing.baseQuantity += baseQuantity;
      // If we are summing mixed units (e.g. 1 tbsp + 10 ml), the original 'quantity' and 'unit' fields 
      // become less meaningful. We'll update the unit to the base unit to keep it consistent.
      existing.quantity = existing.baseQuantity;
      existing.unit = baseUnit;
    } else {
      aggregated.set(key, {
        name: ing.name.trim(),
        quantity: ing.quantity,
        unit: ing.unit,
        baseUnit,
        baseQuantity
      });
    }
  }

  return Array.from(aggregated.values());
}
