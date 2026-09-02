"use client";

import { useState, useMemo, DragEvent, useRef, useEffect } from "react";
import { Plus, Play, Loader2, Sparkles, ChefHat, CalendarDays, ShoppingBag, X, GripVertical, Coffee, Sun, Moon, Lock, CheckCircle2, Cookie, Trash2, Edit2, Users, User, Baby, PackageOpen, AlertCircle, Search, Info } from "lucide-react";
import { useStore, Ingredient, Recipe } from "@/lib/store";
import WanderingAvatar from "@/components/WanderingAvatar";
import ChefSelector from "@/components/planner/ChefSelector";
import BundleLibrary from "@/components/library/BundleLibrary";
import RecipeLibrary from "@/components/library/RecipeLibrary";
import MealCalendar from "@/components/planner/MealCalendar";
import GroceryDrawer from "@/components/grocery/GroceryDrawer";
import { getChefAnimal, groceryKnowledgeBase } from "@/lib/utils";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { verifyPin, checkIsHost, logout } from "@/app/actions/auth";
import { supabase } from "@/lib/supabase";








export default function Dashboard() {
  const { 
    data, 
    addRecipe, updateRecipe, deleteRecipe, 
    addBundle, updateBundle, deleteBundle,
    updateDinnerSlot, updateDinnerChef, updateDinnerGuests,
    moveDinnerSlot, moveDinnerChef, moveWeeklyItem,
    addWeeklyItem, removeWeeklyItem,
    addChef, deleteChef,
    saveData
  } = useStore();

  const [isHost, setIsHost] = useState(false);
  const [isHostPinModalOpen, setIsHostPinModalOpen] = useState(false);
  const [hostPinInput, setHostPinInput] = useState("");

  useEffect(() => {
    checkIsHost().then(setIsHost);
  }, []);

  const [loading, setLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [cloudPuffs, setCloudPuffs] = useState<{ id: string; x: number; y: number }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'recipe' | 'bundle'>('recipe');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [progressLogs, setProgressLogs] = useState<string[]>([]);
  const [automationSuccess, setAutomationSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const logsEndRef = useRef<HTMLDivElement>(null);
  const hasAlignedRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Edit/New State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newChefName, setNewChefName] = useState("");

  const handleAddChef = () => {
    if (!newChefName.trim()) return;
    addChef(newChefName);
    setNewChefName("");
  };
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [ingName, setIngName] = useState("");
  const [ingQty, setIngQty] = useState(""); // For bundles
  const [ingAdultQty, setIngAdultQty] = useState(""); // For recipes
  const [ingChildQty, setIngChildQty] = useState(""); // For recipes
  const [ingUnit, setIngUnit] = useState("");

  // Automation State
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");

  const dateOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const value = d.toISOString().split('T')[0];
      const weekday = d.toLocaleDateString('en-GB', { weekday: 'short' });
      const month = d.toLocaleDateString('en-GB', { month: 'short' });
      const dayNum = d.getDate();
      
      let label = `${weekday}, ${dayNum} ${month}`;
      if (i === 0) label = `Today (${label})`;
      if (i === 1) label = `Tomorrow (${label})`;
      
      options.push({ value, label });
    }
    return options;
  }, []);

  const currentDeliveryDate = data?.planner?.deliveryDate || dateOptions[0].value;
  const currentDeliveryTime = data?.planner?.deliveryTime || "18:00 - 19:00";
  const currentDaysCount = data?.planner?.daysCount || 7;

  // Helper to generate dates starting from a specific date
  const generateDatesFrom = (startDateStr: string, count: number, existingDays: any[] = []) => {
    const start = new Date(startDateStr);
    const days: any[] = [];
    
    for (let i = 0; i < count; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dayName = d.toLocaleDateString('en-GB', { weekday: 'short' });
      const dateStr = d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
      
      // Try to find if we already have plans for this date in existingDays
      const existing = existingDays.find(ed => ed.date === dateStr || (i < existingDays.length && existingDays[i].date === dateStr));
      
      days.push({
        dayName,
        date: dateStr,
        dinner: existing?.dinner || { recipeId: null, chef: null, adults: 2, children: 2 },
        secondDinner: existing?.secondDinner || null
      });
    }
    return days;
  };

  const handleDeliveryDetailsChange = (newDate: string, newTime: string, newCount: number) => {
    if (!data) return;
    const newDays = generateDatesFrom(newDate, newCount, data.planner.days);
    saveData({
      ...data,
      planner: {
        ...data.planner,
        deliveryDate: newDate,
        deliveryTime: newTime,
        daysCount: newCount,
        days: newDays
      }
    });
  };

  useEffect(() => {
    if (!data || hasAlignedRef.current) return;
    
    const defaultDate = data.planner.deliveryDate || dateOptions[0].value;
    const defaultTime = data.planner.deliveryTime || "18:00 - 19:00";
    const defaultCount = data.planner.daysCount || 7;
    
    const start = new Date(defaultDate);
    const expectedFirstDateStr = start.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
    
    const needsAlignment = 
      data.planner.days.length !== defaultCount || 
      data.planner.days[0]?.date !== expectedFirstDateStr ||
      !data.planner.deliveryDate ||
      !data.planner.deliveryTime ||
      !data.planner.daysCount;
      
    if (needsAlignment) {
      hasAlignedRef.current = true;
      handleDeliveryDetailsChange(defaultDate, defaultTime, defaultCount);
    }
  }, [data, dateOptions]);

  const getAutomationSlotString = () => {
    const today = new Date();
    const target = new Date(currentDeliveryDate);
    
    // Simple checks for Today / Tomorrow
    const tempToday = new Date(today);
    const tempTom = new Date(today);
    tempTom.setDate(today.getDate() + 1);
    
    let dayLabel = target.toLocaleDateString('en-GB', { weekday: 'long' });
    if (target.toISOString().split('T')[0] === tempToday.toISOString().split('T')[0]) {
      dayLabel = "Today";
    } else if (target.toISOString().split('T')[0] === tempTom.toISOString().split('T')[0]) {
      dayLabel = "Tomorrow";
    }
    
    return `${dayLabel} - ${currentDeliveryTime}`;
  };

  const startCheckoutFlow = () => {
    if (generatedList.length === 0) return alert("Your list is empty! Please gather your list first.");
    setIsLoginModalOpen(true);
  };

  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  const cancelAutomation = async () => {
    try {
      if (currentJobId) {
        await supabase.from('checkout_jobs').update({ status: 'cancelled' }).eq('id', currentJobId);
      }
      setProgressLogs(prev => [...prev, "🛑 Robot stopped by user."]);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
      setCurrentJobId(null);
    }
  };

  const startAutomation = async () => {
    setIsLoginModalOpen(false);
    setIsProgressModalOpen(true);
    setProgressLogs(["Sending job to local Mac daemon..."]);
    setAutomationSuccess(false);
    setLoading(true);

    try {
      const payload = { 
        items: generatedList, 
        email, 
        password, 
        slot: getAutomationSlotString(),
        deliveryDate: currentDeliveryDate,
        deliveryTime: currentDeliveryTime
      };

      const { data: insertedData, error } = await supabase
        .from('checkout_jobs')
        .insert([{ payload }])
        .select()
        .single();

      if (error || !insertedData) {
        throw new Error("Failed to insert job into Supabase: " + (error?.message || ""));
      }

      const jobId = insertedData.id;
      setCurrentJobId(jobId);

      // Subscribe to log updates
      const channel = supabase.channel(`job-${jobId}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'checkout_jobs', filter: `id=eq.${jobId}` },
          (payload) => {
            const row = payload.new;
            if (row.logs) {
              const lines = row.logs.split('\n').filter((l: string) => l.trim() !== '');
              setProgressLogs(lines);
              
              if (row.logs.includes('SUCCESS:')) setAutomationSuccess(true);
              if (row.logs.includes('Robot stopped') || row.logs.includes('daemon is not running')) setLoading(false);
            }
            if (row.status === 'completed' || row.status === 'error' || row.status === 'cancelled') {
              setLoading(false);
            }
          }
        )
        .subscribe();
      
      // Cleanup happens on unmount or next start, but we can just let it live for the session since it's filtered to jobId
      
    } catch (e: any) { 
      setProgressLogs(prev => [...prev, `CRITICAL ERROR: ${e.message}`]); 
      setLoading(false); 
    }
  };

  const [generatedList, setGeneratedList] = useState<any[]>([]);
  const [isCalculated, setIsCalculated] = useState(false);

  const generateList = () => {
    if (!data) return;
    
    setIsCalculating(true);
    
    setTimeout(() => {
      const rawTotals: Record<string, { name: string, quantity: number, unit: string }> = {};
      
      // Process and normalize a single ingredient
      const processIngredient = (ing: Ingredient, finalQuantity: number) => {
        let { name, unit } = ing;
        let nName = name.toLowerCase().trim();
        let nUnit = unit.toLowerCase().trim();
        let nQty = finalQuantity;

        // Standardize common units
        if (nUnit === 'kg') { nQty *= 1000; nUnit = 'g'; }
        if (nUnit === 'l' || nUnit === 'liter' || nUnit === 'liters') { nQty *= 1000; nUnit = 'ml'; }
        if (nName.includes('bread') && (nUnit === 'loaf' || nUnit === 'loaves')) { nQty *= 20; nUnit = 'slices'; }
        
        const key = `${nName}_${nUnit}`;
        if (!rawTotals[key]) {
          rawTotals[key] = { name, quantity: nQty, unit: nUnit };
        } else {
          rawTotals[key].quantity += nQty;
        }
      };

      // Add Dinners with precise per-person scaling (supporting split/multiple dinners per day)
      data.planner.days.forEach(day => {
        const processDinnerSlot = (slot: { recipeId: string | null; adults: number; children: number }) => {
          if (slot.recipeId) {
            const recipe = data.recipes.find(r => r.id === slot.recipeId);
            if (recipe) {
              const adults = slot.adults || 0;
              const children = slot.children || 0;
              
              recipe.ingredients.forEach(ing => {
                const aQty = ing.adultQty !== undefined ? ing.adultQty : (ing.quantity / 3);
                const cQty = ing.childQty !== undefined ? ing.childQty : (ing.quantity / 3) * 0.5;
                const totalQty = (aQty * adults) + (cQty * children);
                
                if (totalQty > 0) {
                  processIngredient(ing, totalQty);
                }
              });
            }
          }
        };

        processDinnerSlot(day.dinner);
        if (day.secondDinner) {
          processDinnerSlot(day.secondDinner);
        }
      });

      // Add Weekly bundles
      const addWeekly = (ids: string[]) => {
        ids.forEach(id => {
          const bundle = data.bundles.find(b => b.id === id);
          if (bundle) {
            bundle.ingredients.forEach(ing => processIngredient(ing, ing.quantity));
          }
        });
      };

      addWeekly(data.planner.weeklyBreakfast);
      addWeekly(data.planner.weeklyLunch);
      addWeekly(data.planner.weeklySnacks);

      // Smart Consolidation: Map raw totals to actual purchasable grocery packs
      const smartList = Object.values(rawTotals).map((item, index) => {
        const nName = item.name.toLowerCase().trim();
        
        // Find a match in our smart grocery knowledge base
        let kbMatch = null;
        for (const [key, value] of Object.entries(groceryKnowledgeBase)) {
          if (nName.includes(key)) {
            kbMatch = value;
            break;
          }
        }

        if (kbMatch && kbMatch.packUnit === item.unit) {
          // Calculate the minimum number of packs needed to cover the raw quantity
          const packsNeeded = Math.ceil(item.quantity / kbMatch.packSize);
          return {
            id: `gen_${index}_${Date.now()}`,
            name: kbMatch.packName,
            originalName: item.name,
            quantity: packsNeeded,
            unit: 'pack(s)',
            rawQuantity: Math.round(item.quantity * 10) / 10,
            rawUnit: item.unit,
            isConsolidated: true
          };
        }

        return {
          id: `gen_${index}_${Date.now()}`,
          name: item.name,
          quantity: Math.round(item.quantity * 10) / 10, // Round to 1 decimal
          unit: item.unit
        };
      }).sort((a, b) => a.name.localeCompare(b.name));

      setGeneratedList(smartList);
      setIsCalculated(true);
      setIsCalculating(false);
    }, 1500);
  };

  const removeGeneratedItem = (id: string) => {
    setGeneratedList(generatedList.filter(item => item.id !== id));
  };

  const openNewModal = (type: 'recipe' | 'bundle') => {
    setModalType(type);
    setEditingId(null);
    setNewName("");
    setIngredients([]);
    setIngName(""); setIngQty(""); setIngAdultQty(""); setIngChildQty(""); setIngUnit("");
    setIsModalOpen(true);
  };

  const openEditModal = (id: string, type: 'recipe' | 'bundle') => {
    const list = type === 'recipe' ? data?.recipes : data?.bundles;
    const item = list?.find(r => r.id === id);
    if (!item) return;
    setModalType(type);
    setEditingId(item.id);
    setNewName(item.name);
    setIngredients([...item.ingredients]);
    setIngName(""); setIngQty(""); setIngAdultQty(""); setIngChildQty(""); setIngUnit("");
    setIsModalOpen(true);
  };

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
    setIsModalOpen(false);
  };

  const handleDeleteItem = () => {
    if (editingId && window.confirm(`Are you sure you want to delete this ${modalType}?`)) {
      modalType === 'recipe' ? deleteRecipe(editingId) : deleteBundle(editingId);
      setIsModalOpen(false);
    }
  };

  const triggerCloudPuff = (x: number, y: number) => {
    const id = Math.random().toString();
    setCloudPuffs(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
      setCloudPuffs(prev => prev.filter(p => p.id !== id));
    }, 500);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.dataTransfer.dropEffect === "none") {
      triggerCloudPuff(e.clientX, e.clientY);
    }
  };

  
  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active) return;
    
    // Always puff cloud on drop for feedback
    const rect = document.body.getBoundingClientRect(); // Simplified position
    triggerCloudPuff(rect.width / 2, rect.height / 2);

    const payload = active.data.current as { type: string, id: string, source?: any };
    if (!payload) return;

    if (!over) {
      // Dropped on background, remove from source if applicable
      if (payload.source) {
        if (payload.source.section === 'dinner' && payload.source.dayName) {
          if (payload.type === 'recipe') updateDinnerSlot(payload.source.dayName, null, payload.source.slotIndex || 0);
          else if (payload.type === 'chef') updateDinnerChef(payload.source.dayName, null);
        } else if (payload.source.section === 'weekly' && payload.source.weeklyType && typeof payload.source.index === 'number') {
          removeWeeklyItem(payload.source.weeklyType, payload.source.index);
        }
      }
      return;
    }

    const target = over.data.current as { section?: string, dayName?: string, weeklyType?: 'breakfast' | 'lunch' | 'snacks' };
    if (!target) return;

    if (target.section === 'dinner' && target.dayName) {
      if (payload.type === 'recipe') {
        if (payload.source?.section === 'dinner' && payload.source.dayName) {
          if (payload.source.dayName !== target.dayName) moveDinnerSlot(payload.source.dayName, target.dayName, payload.source.slotIndex || 0);
        } else {
          updateDinnerSlot(target.dayName, payload.id);
        }
      } else if (payload.type === 'chef') {
        if (payload.source?.section === 'dinner' && payload.source.dayName) {
          if (payload.source.dayName !== target.dayName) moveDinnerChef(payload.source.dayName, target.dayName);
        } else {
          updateDinnerChef(target.dayName, payload.id);
        }
      } else {
        // Invalid item for dinner (e.g. bundle)
        if (payload.source?.section === 'weekly' && payload.source.weeklyType && typeof payload.source.index === 'number') {
          removeWeeklyItem(payload.source.weeklyType, payload.source.index);
        }
      }
    } else if (target.section === 'weekly' && target.weeklyType) {
      if (payload.type === 'bundle') {
        if (payload.source?.section === 'weekly' && payload.source.weeklyType && typeof payload.source.index === 'number') {
          moveWeeklyItem(payload.source.weeklyType, payload.source.index, target.weeklyType);
        } else {
          addWeeklyItem(target.weeklyType, payload.id);
        }
      } else {
        // Invalid item for weekly staples (e.g. recipe or chef)
        if (payload.source?.section === 'dinner' && payload.source.dayName) {
          if (payload.type === 'recipe') updateDinnerSlot(payload.source.dayName, null);
          if (payload.type === 'chef') updateDinnerChef(payload.source.dayName, null);
        }
      }
    }
  };

  useEffect(() => {
    if (logsEndRef.current) logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [progressLogs]);



  if (!data) return (
    <div className="flex items-center justify-center min-h-screen bg-indigo-50">
      <div className="animate-bounce flex flex-col items-center">
        <ChefHat className="w-16 h-16 text-indigo-500 mb-4" />
        <p className="text-indigo-600 font-bold text-xl">Warming up the kitchen...</p>
      </div>
    </div>
  );

  return (
    <DndContext onDragEnd={onDragEnd}>
    <div 
      className="min-h-screen bg-gradient-to-br from-cyan-100 via-purple-100 to-pink-100 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900 font-sans flex flex-col h-screen overflow-hidden text-slate-800"
    >
      
      <WanderingAvatar />

      <header className="flex-shrink-0 h-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b-4 border-white/50 dark:border-slate-800 flex items-center px-6 justify-between z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 text-white p-2.5 rounded-2xl shadow-lg shadow-pink-500/25 transform -rotate-3 hover:rotate-0 transition-transform flex items-center justify-center">
            <ChefHat className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 tracking-tight">
            Family Kitchen
          </h1>
        </div>
        <div>
          {isHost ? (
            <button 
              onClick={() => {
                logout().then(() => setIsHost(false));
              }}
              className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-xl font-bold text-xs"
            >
              <Lock className="w-3.5 h-3.5" /> Host Mode
            </button>
          ) : (
            <button 
              onClick={() => setIsHostPinModalOpen(true)}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors"
            >
              <Lock className="w-3.5 h-3.5" /> Unlock Admin
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        
        {/* LEFT SIDEBAR */}
        <div className="w-[300px] flex-shrink-0 border-r-4 border-white/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md flex flex-col h-full overflow-hidden shadow-[5px_0_15px_-3px_rgba(0,0,0,0.05)] z-10">
          <ChefSelector />
          <div className="flex-1 overflow-y-auto flex flex-col">
            <BundleLibrary openNewModal={openNewModal} openEditModal={openEditModal} />
            <RecipeLibrary openNewModal={openNewModal} openEditModal={openEditModal} />
          </div>
        </div>

        {/* CENTER COLUMN */}
        <MealCalendar 
          currentDeliveryDate={currentDeliveryDate}
          currentDeliveryTime={currentDeliveryTime}
          currentDaysCount={currentDaysCount}
          dateOptions={dateOptions}
          handleDeliveryDetailsChange={handleDeliveryDetailsChange}
          removeWeeklyItem={removeWeeklyItem}
          updateDinnerChef={updateDinnerChef}
          updateDinnerSlot={updateDinnerSlot}
          updateDinnerGuests={updateDinnerGuests}
        />

        {/* RIGHT SIDEBAR */}
        <GroceryDrawer 
          isCalculating={isCalculating}
          isCalculated={isCalculated}
          generatedList={generatedList}
          generateList={generateList}
          removeGeneratedItem={removeGeneratedItem}
          startCheckoutFlow={startCheckoutFlow}
          loading={loading}
          isHost={isHost}
        />
      </div>


      {/* MODAL (CREATE OR EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border-4 border-indigo-100 dark:border-slate-700 transform transition-all">
            <div className="p-5 border-b-2 border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50">
              <h2 className="font-black text-xl text-slate-800 dark:text-white flex items-center gap-2">
                {modalType === 'recipe' ? <ChefHat className="w-5 h-5 text-indigo-500" /> : <PackageOpen className="w-5 h-5 text-amber-500" />}
                {editingId ? `Edit ${modalType === 'recipe' ? 'Recipe' : 'Bundle'}` : `New ${modalType === 'recipe' ? 'Recipe' : 'Bundle'}`}
              </h2>
              <div className="flex gap-2">
                {editingId && (
                  <button onClick={handleDeleteItem} className="text-rose-500 hover:text-rose-700 bg-white rounded-full p-1.5 shadow-sm" title="Delete"><Trash2 className="w-4 h-4 font-bold" /></button>
                )}
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 bg-white rounded-full p-1.5 shadow-sm"><X className="w-4 h-4 font-bold" /></button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="mb-5">
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Name</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full border-2 border-slate-200 focus:border-indigo-500 rounded-xl p-2.5 bg-slate-50 font-semibold text-slate-800 outline-none text-sm" placeholder={modalType === 'recipe' ? "e.g. Yummy Tacos 🌮" : "e.g. Kids Packed Lunch"} />
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
                  <input type="text" placeholder="Item Name" value={ingName} onChange={e => setIngName(e.target.value)} className="flex-1 border-2 border-slate-200 focus:border-indigo-500 rounded-xl p-2 font-semibold text-xs bg-slate-50 outline-none" onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()} />
                  
                  {modalType === 'recipe' ? (
                    <>
                      <input type="number" placeholder="Per Adult" value={ingAdultQty} onChange={e => setIngAdultQty(e.target.value)} className="w-24 border-2 border-slate-200 focus:border-indigo-500 rounded-xl p-2 font-semibold text-xs bg-slate-50 outline-none" onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()} />
                      <input type="number" placeholder="Per Child" value={ingChildQty} onChange={e => setIngChildQty(e.target.value)} className="w-24 border-2 border-slate-200 focus:border-indigo-500 rounded-xl p-2 font-semibold text-xs bg-slate-50 outline-none" onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()} />
                    </>
                  ) : (
                    <input type="number" placeholder="Total Qty" value={ingQty} onChange={e => setIngQty(e.target.value)} className="w-24 border-2 border-slate-200 focus:border-indigo-500 rounded-xl p-2 font-semibold text-xs bg-slate-50 outline-none" onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()} />
                  )}
                  
                  <input type="text" placeholder="Unit" value={ingUnit} onChange={e => setIngUnit(e.target.value)} className="w-16 border-2 border-slate-200 focus:border-indigo-500 rounded-xl p-2 font-semibold text-xs bg-slate-50 outline-none" onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()} />
                  <button onClick={handleAddIngredient} className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700"><Plus className="w-4 h-4 font-bold" /></button>
                </div>
                <ul className="space-y-1.5">
                  {ingredients.map(ing => (
                    <li key={ing.id} className="text-xs bg-white border-2 border-slate-100 p-2 rounded-xl flex justify-between items-center shadow-sm">
                      <span className="font-bold text-slate-700">{ing.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                          {modalType === 'recipe' ? `${ing.adultQty}${ing.unit} (A) / ${ing.childQty}${ing.unit} (C)` : `${ing.quantity} ${ing.unit}`}
                        </span>
                        <div className="flex items-center gap-1 border-l-2 border-slate-100 pl-2 ml-1">
                          <button onClick={() => handleEditIngredient(ing)} className="text-slate-400 hover:text-indigo-500 p-1">
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
              <button onClick={handleSaveItem} disabled={!newName || ingredients.length === 0} className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black py-3 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 text-sm">
                Save {modalType === 'recipe' ? 'Recipe' : 'Bundle'}
              </button>
            </div>
          </div>
        </div>
      )}



      {/* LOGIN & SESSION PROMPT MODAL */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border-4 border-indigo-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center border-b-2 border-slate-100 dark:border-slate-800 bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/30 dark:to-slate-900 relative">
              <div className="mx-auto bg-gradient-to-tr from-indigo-500 to-purple-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-md">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="font-black text-xl text-slate-800 dark:text-white">Secure Login</h2>
              <p className="text-xs font-semibold text-slate-500 mt-1">Credentials are used only for this session and never saved.</p>
              <button 
                onClick={() => setIsLoginModalOpen(false)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wide">Tesco Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="w-full border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-100 outline-none text-xs" 
                  placeholder="your@email.com" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wide">Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-100 outline-none text-xs" 
                  placeholder="••••••••" 
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setIsLoginModalOpen(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs">
                  Cancel
                </button>
                <button 
                  onClick={() => startAutomation()} 
                  disabled={!email || !password} 
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black py-3 rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 text-xs"
                >
                  Start Tesco Robot 🤖
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HOST PIN MODAL */}
      {isHostPinModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border-4 border-slate-100 dark:border-slate-700">
            <div className="p-6 text-center relative border-b-2 border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto flex items-center justify-center mb-3 text-slate-600 dark:text-slate-300">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="font-black text-xl text-slate-800 dark:text-white">Host Access</h2>
              <p className="text-xs font-semibold text-slate-500 mt-1">Enter PIN to unlock checkout actions.</p>
              <button 
                onClick={() => setIsHostPinModalOpen(false)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <input 
                  type="password" 
                  value={hostPinInput} 
                  onChange={e => setHostPinInput(e.target.value)} 
                  className="w-full border-2 border-slate-200 dark:border-slate-700 focus:border-slate-500 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 font-black text-center tracking-[0.5em] text-slate-800 dark:text-slate-100 outline-none text-xl" 
                  placeholder="••••" 
                  maxLength={10}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={async () => {
                    const res = await verifyPin(hostPinInput);
                    if (res.success) {
                      setIsHost(true);
                      setIsHostPinModalOpen(false);
                      setHostPinInput("");
                    } else {
                      alert("Invalid PIN");
                    }
                  }} 
                  disabled={!hostPinInput} 
                  className="flex-1 bg-slate-800 text-white font-black py-3 rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 text-xs"
                >
                  Unlock Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AUTOMATION PROGRESS MODAL */}
      {isProgressModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[130] flex items-center justify-center p-4">
          <div className="bg-slate-50 dark:bg-slate-900 border-4 border-indigo-100 dark:border-slate-700 rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 border-b-2 border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-800">
              <div className="flex items-center gap-4">
                 {loading ? (
                   <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shadow-inner">
                      <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                   </div>
                 ) : (
                   <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shadow-inner">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                   </div>
                 )}
                 <div>
                   <h2 className="font-black text-xl text-slate-800 dark:text-white">
                     {loading ? "Tesco Robot is shopping..." : automationSuccess ? "Shopping Complete!" : "Automation Stopped"}
                   </h2>
                   <p className="text-xs font-bold text-slate-500">
                     {loading ? "You can cancel or close the browser at any time." : "Your grocery list has been fully processed."}
                   </p>
                 </div>
              </div>
              <button 
                onClick={loading ? cancelAutomation : () => setIsProgressModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-full p-2 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                title={loading ? "Cancel Robot" : "Close"}
              >
                <X className="w-5 h-5 font-bold" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-3">
              {progressLogs.map((log, i) => {
                const isDaemonError = log.includes('daemon is not running');
                const isError = log.includes("ERROR:");
                const isSuccess = log.includes("SUCCESS:") || log.includes("VERIFIED:");
                const isNotice = log.includes("NOTICE:") || log.includes("WARNING:") || log.includes("🛑");
                
                // Clean up the string to remove prefixes and timestamps
                let cleanText = log.replace(/^\[.*?\]\s*/, '').replace(/^(PROGRESS|ERROR|SUCCESS|NOTICE):\s*/, '').trim();
                
                // Filter out boring/noisy logs to keep the UI clean
                if (cleanText.includes("Pre-add basket") || cleanText.includes("Proceeding to click")) return null;

                // Special render: daemon not running
                if (isDaemonError) {
                  return (
                    <div key={i} className="flex flex-col gap-3 p-4 rounded-xl border-2 border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-black text-sm">
                        <X className="w-4 h-4 shrink-0" /> Tesco daemon is not running
                      </div>
                      <p className="text-xs text-rose-700 dark:text-rose-300 font-semibold">Open a new Terminal tab in the Family Kitchen folder and run:</p>
                      <code className="block bg-slate-900 text-emerald-400 text-xs font-mono px-4 py-3 rounded-lg select-all">
                        node scripts/tesco_daemon.js
                      </code>
                      <p className="text-xs text-rose-600 dark:text-rose-400">Then click <strong>Shop Now</strong> again once the daemon is running.</p>
                    </div>
                  );
                }

                let Icon = Info;
                let colorTheme = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200";
                let iconTheme = "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400";
                
                if (isError) {
                   Icon = X;
                   colorTheme = "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300";
                   iconTheme = "bg-rose-200 dark:bg-rose-800 text-rose-600 dark:text-rose-200";
                } else if (isSuccess) {
                   Icon = CheckCircle2;
                   colorTheme = "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-medium";
                   iconTheme = "bg-emerald-200 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-200";
                } else if (isNotice) {
                   Icon = AlertCircle;
                   colorTheme = "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300";
                   iconTheme = "bg-amber-200 dark:bg-amber-800 text-amber-600 dark:text-amber-200";
                } else if (cleanText.includes("Searching") || cleanText.includes("Navigating")) {
                   Icon = Search;
                   colorTheme = "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300";
                   iconTheme = "bg-blue-200 dark:bg-blue-800 text-blue-600 dark:text-blue-200";
                } else if (cleanText.includes("log in") || cleanText.includes("Credentials") || cleanText.includes("logged in")) {
                   Icon = Lock;
                   colorTheme = "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300";
                   iconTheme = "bg-indigo-200 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-200";
                } else {
                   Icon = Loader2;
                   iconTheme = "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400";
                   // Only spin the last non-specific item if still loading
                   if (i === progressLogs.length - 1 && loading) {
                      iconTheme += " animate-spin";
                   }
                }

                return (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border-2 shadow-sm animate-in fade-in slide-in-from-bottom-2 ${colorTheme}`}>
                    <div className={`p-1.5 rounded-lg shrink-0 ${iconTheme}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-sm font-semibold leading-tight pt-1">
                      {cleanText}
                    </div>
                  </div>
                );
              })}
              <div ref={logsEndRef} />
            </div>

            {loading && (
              <div className="p-4 bg-slate-100 dark:bg-slate-800/90 border-t-2 border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                <p className="text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Supervising browser...
                </p>
                <button
                  onClick={cancelAutomation}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 font-black text-xs px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-800 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <X className="w-3.5 h-3.5 stroke-[2.5]" /> Stop & Cancel Robot
                </button>
              </div>
            )}
            
            {automationSuccess && (
              <div className="p-6 bg-white dark:bg-slate-800 border-t-2 border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-3">
                <a 
                  href="https://www.tesco.com/groceries/en-GB/trolley" 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full justify-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black py-4 px-8 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                >
                  <ShoppingBag className="w-6 h-6" /> Review Tesco Trolley & Checkout
                </a>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Cloud Puff Animation Overlay */}

      {cloudPuffs.map(puff => (
        <div 
          key={puff.id}
          className="fixed pointer-events-none z-[999] flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
          style={{ left: puff.x, top: puff.y }}
        >
          <div className="relative w-16 h-16 flex items-center justify-center animate-puff">
            <div className="absolute w-8 h-8 bg-white/95 dark:bg-slate-200/90 rounded-full filter blur-[1px] shadow-sm transform -translate-x-3 -translate-y-1"></div>
            <div className="absolute w-10 h-10 bg-white/95 dark:bg-slate-200/90 rounded-full filter blur-[1px] shadow-sm transform translate-x-1 -translate-y-3"></div>
            <div className="absolute w-8 h-8 bg-white/95 dark:bg-slate-200/90 rounded-full filter blur-[1px] shadow-sm transform translate-x-4 translate-y-1"></div>
            <div className="absolute w-6 h-6 bg-white/95 dark:bg-slate-200/90 rounded-full filter blur-[1px] shadow-sm transform translate-y-3"></div>
            <div className="absolute w-8 h-8 bg-white/95 dark:bg-slate-200/90 rounded-full filter blur-[1px] shadow-sm transform -translate-y-1"></div>
            <span className="absolute text-amber-300 text-xs transform -translate-x-6 -translate-y-6">✨</span>
            <span className="absolute text-pink-300 text-xs transform translate-x-7 -translate-y-5">✨</span>
          </div>
        </div>
      ))}
        </div>
    </DndContext>
  );
}
