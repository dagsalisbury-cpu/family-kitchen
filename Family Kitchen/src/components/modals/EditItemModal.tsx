"use client";

import { useState, useEffect } from "react";
import { ChefHat, PackageOpen, Trash2, X, Plus, Edit2 } from "lucide-react";
import { useStore, Ingredient } from "@/lib/store";

export type ModalData = {
  id: string | null;
  type: 'recipe' | 'bundle';
  name: string;
  ingredients: Ingredient[];
};

export default function EditItemModal({
  isOpen,
  onClose,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialData: ModalData | null;
}) {
  const { addRecipe, updateRecipe, deleteRecipe, addBundle, updateBundle, deleteBundle } = useStore();

  const [newName, setNewName] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [ingName, setIngName] = useState("");
  const [ingQty, setIngQty] = useState("");
  const [ingAdultQty, setIngAdultQty] = useState("");
  const [ingChildQty, setIngChildQty] = useState("");
  const [ingUnit, setIngUnit] = useState("");

  useEffect(() => {
    if (isOpen && initialData) {
      setNewName(initialData.name);
      setIngredients(initialData.ingredients);
      setIngName(""); setIngQty(""); setIngAdultQty(""); setIngChildQty(""); setIngUnit("");
    }
  }, [isOpen, initialData]);

  if (!isOpen || !initialData) return null;

  const { id: editingId, type: modalType } = initialData;

  const handleAddIngredient = () => {
    if (!ingName.trim()) return;
    setIngredients([...ingredients, { 
      id: Date.now().toString(), 
      name: ingName.trim(), 
      quantity: ingQty ? parseFloat(ingQty) : 1,
      adultQty: ingAdultQty ? parseFloat(ingAdultQty) : 1,
      childQty: ingChildQty ? parseFloat(ingChildQty) : 1,
      unit: ingUnit.trim() || "pack" 
    }]);
    setIngName(""); setIngQty(""); setIngAdultQty(""); setIngChildQty(""); setIngUnit("");
  };

  const handleEditIngredient = (ing: Ingredient) => {
    setIngName(ing.name);
    setIngQty(ing.quantity ? ing.quantity.toString() : "");
    setIngAdultQty(ing.adultQty ? ing.adultQty.toString() : "");
    setIngChildQty(ing.childQty ? ing.childQty.toString() : "");
    setIngUnit(ing.unit);
    setIngredients(ingredients.filter(i => i.id !== ing.id));
  };

  const handleSaveItem = () => {
    if (!newName) return;
    const payload = { id: editingId || Date.now().toString(), name: newName, ingredients };
    if (modalType === 'recipe') {
      editingId ? updateRecipe(payload) : addRecipe(payload);
    } else {
      editingId ? updateBundle(payload) : addBundle(payload);
    }
    onClose();
  };

  const handleDeleteItem = () => {
    if (editingId && window.confirm(`Are you sure you want to delete this ${modalType}?`)) {
      modalType === 'recipe' ? deleteRecipe(editingId) : deleteBundle(editingId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-[110] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border-4 border-[#F9F9F9] dark:border-slate-700 transform transition-all">
        <div className="p-5 border-b-2 border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-[#F9F9F9] to-[#7FC8F8]/10 dark:from-indigo-950/50 dark:to-purple-950/50">
          <h2 className="font-black text-xl text-slate-800 dark:text-white flex items-center gap-2">
            {modalType === 'recipe' ? <ChefHat className="w-5 h-5 text-[#5AA9E6]" /> : <PackageOpen className="w-5 h-5 text-amber-500" />}
            {editingId ? `Edit ${modalType === 'recipe' ? 'Recipe' : 'Bundle'}` : `New ${modalType === 'recipe' ? 'Recipe' : 'Bundle'}`}
          </h2>
          <div className="flex gap-2">
            {editingId && (
              <button onClick={handleDeleteItem} className="text-rose-500 hover:text-rose-700 bg-white rounded-full p-1.5 shadow-sm" title="Delete"><Trash2 className="w-4 h-4 font-bold" /></button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 bg-white rounded-full p-1.5 shadow-sm"><X className="w-4 h-4 font-bold" /></button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto">
          <div className="mb-5">
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Name</label>
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full border-2 border-slate-200 focus:border-[#5AA9E6] rounded-xl p-2.5 bg-slate-50 font-semibold text-slate-800 outline-none text-sm" placeholder={modalType === 'recipe' ? "e.g. Yummy Tacos 🌮" : "e.g. Kids Packed Lunch"} />
          </div>
          <div className="mb-2">
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Ingredients</label>
            {modalType === 'recipe' && (
              <p className="text-xs text-slate-500 mb-3 font-medium">Input exact quantities needed per adult and per child.</p>
            )}
            {modalType === 'bundle' && (
              <p className="text-xs text-slate-500 mb-3 font-medium">Input exact raw quantities you need for the week.</p>
            )}
            <div className="flex gap-2 mb-3">
              <input type="text" placeholder="Item Name" value={ingName} onChange={e => setIngName(e.target.value)} className="flex-1 border-2 border-slate-200 focus:border-[#5AA9E6] rounded-xl p-2 font-semibold text-xs bg-slate-50 outline-none" onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()} />
              
              {modalType === 'recipe' ? (
                <>
                  <input type="number" placeholder="Per Adult" value={ingAdultQty} onChange={e => setIngAdultQty(e.target.value)} className="w-24 border-2 border-slate-200 focus:border-[#5AA9E6] rounded-xl p-2 font-semibold text-xs bg-slate-50 outline-none" onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()} />
                  <input type="number" placeholder="Per Child" value={ingChildQty} onChange={e => setIngChildQty(e.target.value)} className="w-24 border-2 border-slate-200 focus:border-[#5AA9E6] rounded-xl p-2 font-semibold text-xs bg-slate-50 outline-none" onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()} />
                </>
              ) : (
                <input type="number" placeholder="Total Qty" value={ingQty} onChange={e => setIngQty(e.target.value)} className="w-24 border-2 border-slate-200 focus:border-[#5AA9E6] rounded-xl p-2 font-semibold text-xs bg-slate-50 outline-none" onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()} />
              )}
              
              <input type="text" placeholder="Unit" value={ingUnit} onChange={e => setIngUnit(e.target.value)} className="w-16 border-2 border-slate-200 focus:border-[#5AA9E6] rounded-xl p-2 font-semibold text-xs bg-slate-50 outline-none" onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()} />
              <button onClick={handleAddIngredient} className="bg-slate-800 text-white p-2 rounded-xl hover:bg-slate-800"><Plus className="w-4 h-4 font-bold" /></button>
            </div>
            <ul className="space-y-1.5">
              {ingredients.map(ing => (
                <li key={ing.id} className="text-xs bg-white border-2 border-slate-100 p-2 rounded-xl flex justify-between items-center shadow-sm">
                  <span className="font-bold text-slate-700">{ing.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-800 bg-[#F9F9F9] px-2 py-0.5 rounded-lg">
                      {modalType === 'recipe' ? `${ing.adultQty}${ing.unit} (A) / ${ing.childQty}${ing.unit} (C)` : `${ing.quantity} ${ing.unit}`}
                    </span>
                    <div className="flex items-center gap-1 border-l-2 border-slate-100 pl-2 ml-1">
                      <button onClick={() => handleEditIngredient(ing)} className="text-slate-400 hover:text-[#5AA9E6] p-1">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button onClick={() => setIngredients(ingredients.filter(i => i.id !== ing.id))} className="text-slate-400 hover:text-rose-500 p-1">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="p-5 border-t-2 border-slate-100 dark:border-slate-800 bg-slate-50">
          <button onClick={handleSaveItem} disabled={!newName || ingredients.length === 0} className="w-full bg-gradient-to-r from-[#5AA9E6] to-[#7FC8F8] text-white font-black py-3 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 text-sm">
            Save {modalType === 'recipe' ? 'Recipe' : 'Bundle'}
          </button>
        </div>
      </div>
    </div>
  );
}
