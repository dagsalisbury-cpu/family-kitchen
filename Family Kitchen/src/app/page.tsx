"use client";

import { useState, useMemo, DragEvent, useRef, useEffect } from "react";
import { Plus, Play, Loader2, Sparkles, ChefHat, CalendarDays, ShoppingBag, X, GripVertical, Coffee, Sun, Moon, Lock, CheckCircle2, Cookie, Trash2, Edit2, Users, User, Baby, PackageOpen, AlertCircle, Search, Info, BookOpen, Calendar, ShoppingCart } from "lucide-react";
import { useStore, Ingredient, Recipe } from "@/lib/store";
import WanderingAvatar from "@/components/WanderingAvatar";
import ChefSelector from "@/components/planner/ChefSelector";
import BundleLibrary from "@/components/library/BundleLibrary";
import RecipeLibrary from "@/components/library/RecipeLibrary";
import MealCalendar from "@/components/planner/MealCalendar";
import GroceryDrawer from "@/components/grocery/GroceryDrawer";
import { getChefAnimal } from "@/lib/utils";
import { groceryKnowledgeBase } from "@/lib/knowledgeBase";
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from "@dnd-kit/core";
import { verifyPin, checkIsHost, logout } from "@/app/actions/auth";
import { supabase } from "@/lib/supabase";
import HostPinModal from "@/components/modals/HostPinModal";
import LoginModal from "@/components/modals/LoginModal";
import ProgressModal from "@/components/modals/ProgressModal";
import EditItemModal, { ModalData } from "@/components/modals/EditItemModal";








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
    const handleNav = (e: any) => {
      if (e.detail === 'planner') setMobileTab('planner');
      if (e.detail === 'list') setMobileTab('list');
      if (e.detail === 'library') setIsMobileLibraryOpen(true);
    };
    window.addEventListener('nav-mobile-tab', handleNav);
    
    checkIsHost().then(setIsHost);
    const interval = setInterval(() => {
      checkIsHost().then(setIsHost);
    }, 2000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('nav-mobile-tab', handleNav);
    };
  }, []);

  const [loading, setLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [cloudPuffs, setCloudPuffs] = useState<{ id: string; x: number; y: number }[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [progressLogs, setProgressLogs] = useState<string[]>([]);
  const [automationSuccess, setAutomationSuccess] = useState(false);
  const [mobileTab, setMobileTab] = useState<"planner" | "list">("planner");
  const [isMobileLibraryOpen, setIsMobileLibraryOpen] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const hasAlignedRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Edit/New State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editModalData, setEditModalData] = useState<ModalData | null>(null);
  const [newChefName, setNewChefName] = useState("");

  const handleAddChef = () => {
    if (!newChefName.trim()) return;
    addChef(newChefName);
    setNewChefName("");
  };

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
      const existing = existingDays.find(ed => ed.date === dateStr);
      
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

  const startAutomation = async (userEmail: string, userPass: string) => {
    setIsLoginModalOpen(false);
    setIsProgressModalOpen(true);
    setProgressLogs(["Sending job to local Mac daemon..."]);
    setAutomationSuccess(false);
    setLoading(true);

    try {
      const payload = { 
        items: generatedList, 
        email: userEmail, 
        password: userPass, 
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
  const [activeDragItem, setActiveDragItem] = useState<{ id: string, type: string, data: any } | null>(null);

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
    setEditModalData({ id: null, type, name: "", ingredients: [] });
    setIsEditModalOpen(true);
  };

  const openEditModal = (id: string, type: 'recipe' | 'bundle') => {
    const list = type === 'recipe' ? data?.recipes : data?.bundles;
    const item = list?.find(r => r.id === id);
    if (!item) return;
    setEditModalData({ id: item.id, type, name: item.name, ingredients: [...item.ingredients] });
    setIsEditModalOpen(true);
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

  
  const onDragStart = (event: DragStartEvent) => {
    if (event.active?.data?.current) {
      setActiveDragItem({ id: event.active.id as string, type: event.active.data.current.type, data: event.active.data.current });
      setIsMobileLibraryOpen(false);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveDragItem(null);
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
    <div className="flex items-center justify-center min-h-screen bg-[#F9F9F9]">
      <div className="animate-bounce flex flex-col items-center">
        <ChefHat className="w-16 h-16 text-[#5AA9E6] mb-4" />
        <p className="text-slate-800 font-bold text-xl">Warming up the kitchen...</p>
      </div>
    </div>
  );

  return (
    <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
    <div 
      className="flex-1 bg-gradient-to-br from-[#7FC8F8]/40 via-[#F9F9F9] to-[#5AA9E6]/20 dark:from-[#5AA9E6]/20 dark:to-slate-900 font-sans flex flex-col overflow-hidden text-slate-800"
    >
      
      <WanderingAvatar />



      <div className="flex-1 flex overflow-x-auto">
        
        
        {/* LEFT SIDEBAR */}
        {/* Mobile overlay background */}
        {isMobileLibraryOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/20 z-40" onClick={() => setIsMobileLibraryOpen(false)} />
        )}
        <div className={`absolute lg:relative left-0 top-0 bottom-0 z-50 lg:z-10 w-[300px] flex-shrink-0 border-r-4 border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md flex flex-col h-full overflow-hidden shadow-[5px_0_15px_-3px_rgba(0,0,0,0.05)] transition-transform duration-300 ${isMobileLibraryOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

          <ChefSelector />
          <div className="flex-1 overflow-y-auto flex flex-col">
            <BundleLibrary openNewModal={openNewModal} openEditModal={openEditModal} />
            <RecipeLibrary openNewModal={openNewModal} openEditModal={openEditModal} />
          </div>
        
        </div>

        {/* CENTER COLUMN */}
        <MealCalendar 
          className={`${mobileTab === 'planner' ? 'flex' : 'hidden'} lg:flex`} 
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
          className={`${mobileTab === 'list' ? 'flex w-full' : 'hidden'} lg:flex lg:w-[300px]`} 
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


      <EditItemModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        initialData={editModalData} 
      />

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onStart={(email, pass) => startAutomation(email, pass)} 
      />

      <HostPinModal 
        isOpen={isHostPinModalOpen} 
        onClose={() => setIsHostPinModalOpen(false)} 
        onSuccess={() => setIsHost(true)} 
      />

      <ProgressModal 
        isOpen={isProgressModalOpen} 
        onClose={() => setIsProgressModalOpen(false)} 
        onCancel={cancelAutomation} 
        loading={loading} 
        progressLogs={progressLogs} 
        automationSuccess={automationSuccess} 
      />

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
    
      <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeDragItem ? (
          <div className="bg-white/95 dark:bg-slate-800 rounded-xl p-3 shadow-2xl border-2 border-[#5AA9E6] opacity-90 scale-105 pointer-events-none min-w-[200px] flex items-center gap-2">
            <span className="font-bold text-sm text-slate-800 dark:text-slate-100 flex-1 truncate">
              {activeDragItem.type === 'chef' ? '👨‍🍳 ' + activeDragItem.data.name : 
               activeDragItem.type === 'bundle' ? '📦 ' + activeDragItem.data.name : '🍲 ' + activeDragItem.data.name}
            </span>
          </div>
        ) : null}
      </DragOverlay>
      
    </DndContext>
  );
}
