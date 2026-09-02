"use client";

import { useState } from "react";
import { ChefHat, GripVertical, Plus, Edit2, Star } from "lucide-react";
import { useStore } from "@/lib/store";
import { DraggableItem } from "@/components/ui/DraggableItem";

export default function RecipeLibrary({
  openNewModal,
  openEditModal,
}: {
  openNewModal: (type: 'recipe' | 'bundle') => void;
  openEditModal: (id: string, type: 'recipe' | 'bundle') => void;
}) {
  const { data, toggleFavoriteRecipe } = useStore();
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const displayRecipes = showFavoritesOnly 
    ? data?.recipes?.filter(r => r.isFavorite) 
    : data?.recipes;

  return (
    <>
      <div className="p-4 border-b border-t border-white/40 dark:border-slate-800 flex justify-between items-center bg-[#7FC8F8]/20 dark:bg-[#7FC8F8]/20">
        <h2 className="text-sm font-black text-[#7FC8F8] dark:text-[#7FC8F8] flex items-center gap-2 uppercase tracking-wider">
          <ChefHat className="w-4 h-4 text-[#7FC8F8]" /> Dinners
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)} 
            className={`p-1.5 rounded-xl transition-all shadow-sm ${showFavoritesOnly ? 'bg-amber-100 text-amber-500 border border-amber-300' : 'bg-white/50 text-slate-400 hover:text-slate-600'}`}
            title="Toggle Favorites"
          >
            <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-amber-500' : ''}`} />
          </button>
          <button onClick={() => openNewModal('recipe')} className="p-1.5 bg-gradient-to-b from-[#5AA9E6] to-[#5AA9E6] text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-sm">
            <Plus className="w-4 h-4 font-bold" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {displayRecipes?.map((recipe, i) => (
          <DraggableItem
            key={recipe.id}
            id={`recipe-${recipe.id}`}
            type="recipe"
            data={{ id: recipe.id, name: recipe.name }}
            className="bg-white/90 dark:bg-slate-800 rounded-2xl p-3 border-2 border-transparent hover:border-[#7FC8F8] shadow-sm cursor-grab active:cursor-grabbing group relative overflow-hidden flex flex-col gap-2"
          >
            
            <div className="flex items-center gap-2 relative z-10 w-full">
              <div className="p-1 bg-slate-100 dark:bg-slate-700 rounded-lg group-hover:bg-[#7FC8F8]/20 transition-colors">
                <GripVertical className="w-4 h-4 text-slate-400 group-hover:text-[#7FC8F8]" />
              </div>
              <div className="flex-1 z-10 truncate cursor-pointer" onClick={() => openEditModal(recipe.id, 'recipe')}>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate hover:text-[#7FC8F8] transition-colors">{recipe.name}</h3>
              </div>
              <button 
                onPointerDown={(e) => e.stopPropagation()} 
                onClick={() => toggleFavoriteRecipe(recipe.id)} 
                className={`p-1.5 rounded-lg transition-colors z-10 ${recipe.isFavorite ? 'text-amber-500 hover:text-amber-600' : 'text-slate-300 hover:text-amber-400'}`}
              >
                <Star className={`w-4 h-4 ${recipe.isFavorite ? 'fill-amber-500' : ''}`} />
              </button>
              <button onPointerDown={(e) => e.stopPropagation()} onClick={() => openEditModal(recipe.id, 'recipe')} className="p-1.5 text-slate-400 hover:text-[#7FC8F8] hover:bg-[#7FC8F8]/20 rounded-lg transition-colors z-10">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] font-semibold text-slate-500 px-1 truncate relative z-10">{recipe.ingredients.length} items</p>
          </DraggableItem>
        ))}
      </div>
    </>
  );
}
