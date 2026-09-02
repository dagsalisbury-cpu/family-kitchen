"use client";

import { ChefHat, GripVertical, Plus, Edit2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { DraggableItem } from "@/components/ui/DraggableItem";

export default function RecipeLibrary({
  openNewModal,
  openEditModal,
}: {
  openNewModal: (type: 'recipe' | 'bundle') => void;
  openEditModal: (id: string, type: 'recipe' | 'bundle') => void;
}) {
  const { data } = useStore();

  return (
    <>
      <div className="p-4 border-b border-t border-white/40 dark:border-slate-800 flex justify-between items-center bg-white/30 dark:bg-slate-800/30">
        <h2 className="text-sm font-black text-indigo-900 dark:text-indigo-100 flex items-center gap-2 uppercase tracking-wider">
          <ChefHat className="w-4 h-4 text-indigo-500" /> Dinners
        </h2>
        <button onClick={() => openNewModal('recipe')} className="p-1.5 bg-gradient-to-b from-indigo-400 to-indigo-600 text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-sm">
          <Plus className="w-4 h-4 font-bold" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {data?.recipes?.map((recipe, i) => (
          <DraggableItem
            key={recipe.id}
            id={`recipe-${recipe.id}`}
            type="recipe"
            data={{ id: recipe.id }}
            className="bg-white/90 dark:bg-slate-800 rounded-2xl p-3 border-2 border-transparent hover:border-indigo-300 shadow-sm cursor-grab active:cursor-grabbing group relative overflow-hidden flex flex-col gap-2"
          >
            <div className={`absolute top-0 right-0 w-12 h-12 rounded-bl-full opacity-10 bg-gradient-to-br ${i % 2 === 0 ? 'from-pink-500 to-rose-500' : 'from-emerald-500 to-teal-500'}`}></div>
            <div className="flex items-center gap-2 relative z-10 w-full">
              <div className="p-1 bg-slate-100 dark:bg-slate-700 rounded-lg group-hover:bg-indigo-100 transition-colors">
                <GripVertical className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
              </div>
              <div className="flex-1 z-10 truncate cursor-pointer" onClick={() => openEditModal(recipe.id, 'recipe')}>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate hover:text-indigo-600 transition-colors">{recipe.name}</h3>
              </div>
              <button onPointerDown={(e) => e.stopPropagation()} onClick={() => openEditModal(recipe.id, 'recipe')} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors z-10">
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
