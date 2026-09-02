import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



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
