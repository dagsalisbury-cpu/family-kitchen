import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const groceryKnowledgeBase: Record<string, { packSize: number, packUnit: string, packName: string }> = {
  'bread': { packSize: 20, packUnit: 'slices', packName: 'Loaf of Bread' },
  'milk': { packSize: 2200, packUnit: 'ml', packName: '4-Pint Milk' },
  'eggs': { packSize: 6, packUnit: 'whole', packName: 'Box of 6 Eggs' },
  'chicken breast': { packSize: 500, packUnit: 'g', packName: 'Chicken Breasts (500g)' },
  'minced beef': { packSize: 500, packUnit: 'g', packName: 'Beef Mince (500g)' },
  'cheddar cheese': { packSize: 350, packUnit: 'g', packName: 'Block of Cheddar (350g)' },
  'spaghetti': { packSize: 500, packUnit: 'g', packName: 'Spaghetti Pasta (500g)' },
  'macaroni': { packSize: 500, packUnit: 'g', packName: 'Macaroni Pasta (500g)' },
  'penne': { packSize: 500, packUnit: 'g', packName: 'Penne Pasta (500g)' },
  'potatoes': { packSize: 1000, packUnit: 'g', packName: 'Bag of Potatoes (1kg)' },
  'carrots': { packSize: 500, packUnit: 'g', packName: 'Bag of Carrots (500g)' },
  'butter': { packSize: 250, packUnit: 'g', packName: 'Block of Butter (250g)' },
  'plain flour': { packSize: 1000, packUnit: 'g', packName: 'Bag of Plain Flour (1kg)' },
  'onion': { packSize: 3, packUnit: 'whole', packName: 'Net of Onions (3 pack)' },
  'bell peppers': { packSize: 3, packUnit: 'whole', packName: 'Mixed Peppers (3 pack)' },
  'apples': { packSize: 6, packUnit: 'whole', packName: 'Bag of Apples (6 pack)' },
  'basmati rice': { packSize: 1000, packUnit: 'g', packName: 'Bag of Basmati Rice (1kg)' },
  'lettuce': { packSize: 1, packUnit: 'head', packName: 'Iceberg Lettuce' },
  'tomato': { packSize: 6, packUnit: 'whole', packName: 'Pack of Tomatoes (6)' },
};

const chefAnimals = ["🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐙", "🐵", "🐰", "🐭", "🐹", "🦄", "🐥"];

export const getChefAnimal = (name: string) => {
  if (!name) return "🐱";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % chefAnimals.length;
  return chefAnimals[index];
};
