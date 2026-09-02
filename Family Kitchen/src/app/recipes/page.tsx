"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Star, Search, Clock, Users } from "lucide-react";

export default function RecipesPage() {
  const { data } = useStore();
  const [search, setSearch] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  if (!data) return <div className="p-10 flex justify-center text-slate-500 font-bold animate-pulse">Loading recipes...</div>;

  const filteredRecipes = data.recipes.filter(r => {
    if (showFavoritesOnly && !r.isFavorite) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100">Recipe Library</h1>
            <p className="text-slate-500 font-medium mt-1">Discover, manage, and favorite your family meals.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search recipes..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#5AA9E6] font-semibold text-sm w-full md:w-64"
              />
            </div>
            <button 
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm border-2 transition-colors ${showFavoritesOnly ? 'bg-amber-100 border-amber-300 text-amber-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'}`}
            >
              <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-amber-500' : ''}`} />
              Favorites
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map((recipe) => (
            <Link href={`/recipes/${recipe.id}`} key={recipe.id} className="group">
              <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-800 transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="h-40 bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                  <img 
                    src={`/images/recipes/${recipe.name.toLowerCase().replace(/ /g, '-')}.jpg`} 
                    alt={recipe.name} 
                    onError={(e) => { e.currentTarget.src = '/images/recipes/generic-meal.svg' }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {recipe.isFavorite && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm text-amber-500">
                      <Star className="w-4 h-4 fill-amber-500" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-2 group-hover:text-slate-800 transition-colors line-clamp-1">{recipe.name}</h3>
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 30m</span>
                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Family</span>
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{recipe.ingredients.length} items</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {filteredRecipes.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-400 font-bold">
              No recipes found. Try adjusting your search!
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
