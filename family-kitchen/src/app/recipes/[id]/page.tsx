"use client";

import { useStore } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Star, Clock, Users, ChefHat } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function RecipeDetail() {
  const { id } = useParams() as { id: string };
  const { data, toggleFavoriteRecipe } = useStore();
  const router = useRouter();
  
  // To avoid hydration mismatch if using client store heavily
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !data) return <div className="p-10 flex justify-center text-slate-500 font-bold animate-pulse">Loading recipe...</div>;

  const recipe = data.recipes.find(r => r.id === id);

  if (!recipe) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-200">Recipe not found</h2>
        <button onClick={() => router.push('/recipes')} className="mt-4 text-slate-800 font-bold">← Back to library</button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
      
      {/* Header Image Area */}
      <div className="h-64 md:h-96 relative bg-slate-900 w-full">
        <img 
          src={`/images/recipes/${recipe.name.toLowerCase().replace(/ /g, '-')}.jpg`} 
          alt={recipe.name}
          onError={(e) => { e.currentTarget.src = '/images/recipes/generic-meal.svg' }}
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
        
        <div className="absolute top-6 left-6">
          <Link href="/recipes" className="flex items-center gap-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 px-4 py-2 rounded-xl backdrop-blur-md transition-all font-bold text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Recipes
          </Link>
        </div>
        
        <div className="absolute bottom-6 md:bottom-10 left-6 md:left-12 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">{recipe.name}</h1>
            <div className="flex items-center gap-4 text-sm font-semibold text-slate-300 mt-4">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 30 Mins</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> Family Friendly</span>
              <span className="flex items-center gap-1.5"><ChefHat className="w-4 h-4" /> Easy</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => toggleFavoriteRecipe(recipe.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm backdrop-blur-md transition-all ${recipe.isFavorite ? 'bg-amber-400 text-amber-950 hover:bg-amber-300' : 'bg-white/20 text-white hover:bg-white/30'}`}
            >
              <Star className={`w-5 h-5 ${recipe.isFavorite ? 'fill-amber-950' : ''}`} />
              {recipe.isFavorite ? 'Favorited' : 'Add to Favorites'}
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto p-6 md:p-12">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-10 shadow-sm border-2 border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
            Ingredients <span className="bg-[#F9F9F9] text-slate-800 dark:bg-indigo-900 dark:text-indigo-300 px-2.5 py-1 rounded-lg text-sm">{recipe.ingredients.length} items</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recipe.ingredients.map((ing) => (
              <div key={ing.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-700 dark:text-slate-300">{ing.name}</span>
                <div className="text-right">
                  <div className="font-black text-slate-800 dark:text-[#5AA9E6]">
                    {ing.adultQty}{ing.unit} <span className="text-[10px] text-slate-400">(A)</span>
                  </div>
                  <div className="font-black text-[#7FC8F8] dark:text-[#7FC8F8]">
                    {ing.childQty}{ing.unit} <span className="text-[10px] text-slate-400">(C)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-10 pt-8 border-t-2 border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-4">Cooking Instructions</h2>
            <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-500 p-6 rounded-2xl font-medium border-2 border-amber-100 dark:border-amber-900/50">
              <p>Instructions would be fetched and displayed here for your family to follow along! For now, rely on your inner chef instincts.</p>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
