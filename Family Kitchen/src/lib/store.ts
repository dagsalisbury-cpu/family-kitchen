
import { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from './supabase';

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  adultQty?: number;
  childQty?: number;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
}

export interface DinnerSlot {
  recipeId: string | null;
  chef?: string | null;
  adults: number;
  children: number;
}

export interface PlannerDay {
  date: string;
  dayName: string;
  dinner: DinnerSlot;
  secondDinner?: DinnerSlot | null;
}

export interface Planner {
  days: PlannerDay[];
  weeklyBreakfast: string[];
  weeklyLunch: string[];
  weeklySnacks: string[];
  deliveryDate?: string;
  deliveryTime?: string;
  daysCount?: number;
}

export interface AppData {
  recipes: Recipe[];
  bundles: Recipe[];
  planner: Planner;
  chefs: string[];
}

const calc = (qty: number) => ({
  quantity: qty,
  adultQty: Math.round((qty / 3) * 10) / 10,
  childQty: Math.round(((qty / 3) * 0.5) * 10) / 10
});

const defaultRecipes: Recipe[] = [
  { id: '1', name: 'Spaghetti Bolognese', ingredients: [{ id: 'i1', name: 'Minced Beef', ...calc(500), unit: 'g' }, { id: 'i2', name: 'Spaghetti', ...calc(400), unit: 'g' }, { id: 'i3', name: 'Pasta Sauce', ...calc(1), unit: 'jar' }, { id: 'i4', name: 'Onion', ...calc(1), unit: 'whole' }, { id: 'i5', name: 'Mushrooms', ...calc(200), unit: 'g' }] },
  { id: '2', name: 'Chicken Fajitas', ingredients: [{ id: 'i6', name: 'Chicken Breast', ...calc(500), unit: 'g' }, { id: 'i7', name: 'Fajita Kit', ...calc(1), unit: 'pack' }, { id: 'i8', name: 'Peppers', ...calc(2), unit: 'whole' }, { id: 'i9', name: 'Onion', ...calc(1), unit: 'whole' }, { id: 'i10', name: 'Sour Cream', ...calc(1), unit: 'tub' }] },
  { id: '3', name: 'Sausage and Mash', ingredients: [{ id: 'i11', name: 'Pork Sausages', ...calc(8), unit: 'pack' }, { id: 'i12', name: 'Potatoes', ...calc(1000), unit: 'g' }, { id: 'i13', name: 'Gravy Granules', ...calc(1), unit: 'tub' }, { id: 'i14', name: 'Peas', ...calc(300), unit: 'g' }] },
  { id: '4', name: 'Fish Pie', ingredients: [{ id: 'i15', name: 'Fish Pie Mix', ...calc(400), unit: 'g' }, { id: 'i16', name: 'Potatoes', ...calc(800), unit: 'g' }, { id: 'i17', name: 'Milk', ...calc(500), unit: 'ml' }, { id: 'i18', name: 'Butter', ...calc(50), unit: 'g' }, { id: 'i19', name: 'Cheddar Cheese', ...calc(100), unit: 'g' }] },
  { id: '5', name: 'Vegetable Stir Fry', ingredients: [{ id: 'i20', name: 'Stir Fry Veg', ...calc(1), unit: 'pack' }, { id: 'i21', name: 'Egg Noodles', ...calc(2), unit: 'pack' }, { id: 'i22', name: 'Soy Sauce', ...calc(1), unit: 'bottle' }, { id: 'i23', name: 'Tofu', ...calc(1), unit: 'pack' }, { id: 'i24', name: 'Sweet Chilli Sauce', ...calc(1), unit: 'bottle' }] },
  { id: '6', name: 'Macaroni Cheese', ingredients: [{ id: 'i25', name: 'Macaroni', ...calc(400), unit: 'g' }, { id: 'i26', name: 'Cheddar Cheese', ...calc(300), unit: 'g' }, { id: 'i27', name: 'Milk', ...calc(500), unit: 'ml' }, { id: 'i28', name: 'Butter', ...calc(50), unit: 'g' }, { id: 'i29', name: 'Flour', ...calc(50), unit: 'g' }] },
  { id: '7', name: 'Cottage Pie', ingredients: [{ id: 'i30', name: 'Minced Beef', ...calc(500), unit: 'g' }, { id: 'i31', name: 'Potatoes', ...calc(1000), unit: 'g' }, { id: 'i32', name: 'Carrots', ...calc(2), unit: 'whole' }, { id: 'i33', name: 'Beef Stock', ...calc(1), unit: 'cube' }] },
  { id: '8', name: 'Chicken Curry', ingredients: [{ id: 'i34', name: 'Chicken Breast', ...calc(500), unit: 'g' }, { id: 'i35', name: 'Curry Sauce', ...calc(1), unit: 'jar' }, { id: 'i36', name: 'Basmati Rice', ...calc(300), unit: 'g' }, { id: 'i37', name: 'Naan Bread', ...calc(2), unit: 'pack' }] },
  { id: '9', name: 'Tuna Pasta Bake', ingredients: [{ id: 'i38', name: 'Penne Pasta', ...calc(400), unit: 'g' }, { id: 'i39', name: 'Tinned Tuna', ...calc(2), unit: 'tins' }, { id: 'i40', name: 'Pasta Bake Sauce', ...calc(1), unit: 'jar' }, { id: 'i41', name: 'Cheddar Cheese', ...calc(150), unit: 'g' }] },
  { id: '10', name: 'Beef Burgers', ingredients: [{ id: 'i42', name: 'Beef Burgers', ...calc(4), unit: 'pack' }, { id: 'i43', name: 'Burger Buns', ...calc(4), unit: 'pack' }, { id: 'i44', name: 'Lettuce', ...calc(1), unit: 'head' }, { id: 'i45', name: 'Tomato', ...calc(2), unit: 'whole' }] },
];

const defaultBundles: Recipe[] = [
  { id: 'b1', name: 'Standard Kids Lunchbox', ingredients: [{ id: 'bi1', name: 'Ham', quantity: 1, unit: 'pack' }, { id: 'bi2', name: 'Bread', quantity: 1, unit: 'loaf' }, { id: 'bi3', name: 'Apples', quantity: 5, unit: 'whole' }, { id: 'bi4', name: 'Yogurt Tubes', quantity: 1, unit: 'pack' }] },
  { id: 'b2', name: 'Weekend Fry Up', ingredients: [{ id: 'bi5', name: 'Eggs', quantity: 6, unit: 'whole' }, { id: 'bi6', name: 'Bacon', quantity: 1, unit: 'pack' }, { id: 'bi7', name: 'Baked Beans', quantity: 1, unit: 'tin' }] },
];

function getNextWeekPlannerDays(): PlannerDay[] {
  const days: PlannerDay[] = [];
  const today = new Date();
  
  const daysUntilMonday = (1 - today.getDay() + 7) % 7;
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + (daysUntilMonday === 0 ? 7 : daysUntilMonday));

  for (let i = 0; i < 7; i++) {
    const d = new Date(nextMonday);
    d.setDate(nextMonday.getDate() + i);
    const dayName = d.toLocaleDateString('en-GB', { weekday: 'short' });
    const dateStr = d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
    days.push({
      date: dateStr,
      dayName,
      dinner: { recipeId: null, chef: null, adults: 2, children: 2 } 
    });
  }
  return days;
}


// ─── Context Setup ─────────────────────────────────────────────────────────────

type StoreReturn = ReturnType<typeof buildStore>;

export const StoreContext = createContext<StoreReturn | null>(null);

/** Call this in any component to access the shared store. Must be inside <StoreProvider>. */
export function useStore(): StoreReturn {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a <StoreProvider>');
  return ctx;
}

/** Internal: builds the store state+actions. Called once inside StoreProvider. */
export function buildStore() {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    // 1. Instantly load from local storage cache so UI doesn't blink
    const cached = localStorage.getItem('recipeAppDataV6');
    if (cached) {
      try { setData(JSON.parse(cached)); } catch(e) {}
    }

    // 2. Fetch truth from Supabase
    const fetchSupabase = async () => {
      const { data: dbData, error } = await supabase.from('family_state').select('data').eq('id', 'primary').single();
      
      let finalData = dbData?.data;
      
      // Check if we have legacy local storage to migrate/merge
      const savedLegacy = localStorage.getItem('recipeAppDataV5') || localStorage.getItem('recipeAppDataV4') || localStorage.getItem('recipeAppDataV3');
      
      if (savedLegacy) {
        try {
          const legacyData = JSON.parse(savedLegacy);
          if (legacyData.recipes && legacyData.recipes.length > 0) {
            // If Supabase is empty or only has 1 placeholder recipe (like 'spag bol'), merge legacy recipes
            if (!finalData || !finalData.recipes || finalData.recipes.length <= 1) {
              console.log("Migrating legacy recipes to Supabase:", legacyData.recipes);
              
              const mergedRecipes = [...(finalData?.recipes || [])];
              legacyData.recipes.forEach((legacyRec: any) => {
                if (!mergedRecipes.some(r => r.name.toLowerCase() === legacyRec.name.toLowerCase())) {
                  mergedRecipes.push({
                    ...legacyRec,
                    ingredients: (legacyRec.ingredients || []).map((ing: any) => ({
                      ...ing,
                      adultQty: ing.adultQty ?? Math.round((ing.quantity / 3) * 10) / 10,
                      childQty: ing.childQty ?? Math.round(((ing.quantity / 3) * 0.5) * 10) / 10
                    }))
                  });
                }
              });
              
              const mergedBundles = [...(finalData?.bundles || [])];
              if (legacyData.bundles) {
                legacyData.bundles.forEach((legacyBun: any) => {
                  if (!mergedBundles.some(b => b.name.toLowerCase() === legacyBun.name.toLowerCase())) {
                    mergedBundles.push(legacyBun);
                  }
                });
              }
              
              const mergedChefs = Array.from(new Set([...(finalData?.chefs || []), ...(legacyData.chefs || ["David", "Kerry"])]));
              
              finalData = {
                recipes: mergedRecipes.length > 0 ? mergedRecipes : defaultRecipes,
                bundles: mergedBundles.length > 0 ? mergedBundles : defaultBundles,
                planner: finalData?.planner || legacyData.planner || { days: getNextWeekPlannerDays(), weeklyBreakfast: [], weeklyLunch: [], weeklySnacks: [] },
                chefs: mergedChefs
              };
              
              // Push merged state back to Supabase
              await supabase.from('family_state').upsert({ id: 'primary', data: finalData, updated_at: new Date().toISOString() });
            }
          }
        } catch (e) {
          console.error("Failed to parse or merge legacy data:", e);
        }
      }

      if (finalData) {
        if (!finalData.planner) finalData.planner = { days: [], weeklyBreakfast: [], weeklyLunch: [], weeklySnacks: [] };
        if (!finalData.planner.days || finalData.planner.days.length === 0) {
          finalData.planner.days = getNextWeekPlannerDays();
          supabase.from('family_state').upsert({ id: 'primary', data: finalData, updated_at: new Date().toISOString() }).then();
        }
        setData(finalData);
        localStorage.setItem('recipeAppDataV6', JSON.stringify(finalData));
      } else {
        // Fallback if no Supabase data and no legacy data
        const freshData = { recipes: defaultRecipes, bundles: defaultBundles, planner: { days: getNextWeekPlannerDays(), weeklyBreakfast: [], weeklyLunch: [], weeklySnacks: [] }, chefs: ["David", "Kerry"] };
        setData(freshData);
        await supabase.from('family_state').upsert({ id: 'primary', data: freshData, updated_at: new Date().toISOString() });
      }
    };
    
    fetchSupabase();

    // 3. Single real-time subscription — lives here so it's created exactly once.
    const channel = supabase
      .channel('family-kitchen-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'family_state', filter: 'id=eq.primary' },
        (payload) => {
          if (payload.new && payload.new.data) {
            setData(payload.new.data);
            localStorage.setItem('recipeAppDataV6', JSON.stringify(payload.new.data));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const saveData = async (newData: AppData) => {
    // Optimistic UI update (instantly fast)
    setData(newData);
    localStorage.setItem('recipeAppDataV6', JSON.stringify(newData));

    // Background push to Supabase
    await supabase.from('family_state').upsert({ 
      id: 'primary', 
      data: newData, 
      updated_at: new Date().toISOString() 
    });
  };

  const addRecipe = (recipe: Recipe) => {
    if (!data) return;
    saveData({ ...data, recipes: [...data.recipes, recipe] });
  };

  const updateRecipe = (updatedRecipe: Recipe) => {
    if (!data) return;
    const newRecipes = data.recipes.map(r => r.id === updatedRecipe.id ? updatedRecipe : r);
    saveData({ ...data, recipes: newRecipes });
  };

  const deleteRecipe = (recipeId: string) => {
    if (!data) return;
    const newRecipes = data.recipes.filter(r => r.id !== recipeId);
    
    // Clean up from dinner planner (both primary and secondary)
    const newDays = data.planner.days.map(day => {
      let newDinner = { ...day.dinner };
      let newSecondDinner = day.secondDinner ? { ...day.secondDinner } : null;

      if (newDinner.recipeId === recipeId) {
        if (newSecondDinner?.recipeId) {
          newDinner = { 
            ...newDinner, 
            recipeId: newSecondDinner.recipeId, 
            adults: newSecondDinner.adults, 
            children: newSecondDinner.children 
          };
          newSecondDinner = null;
        } else {
          newDinner.recipeId = null;
        }
      } else if (newSecondDinner && newSecondDinner.recipeId === recipeId) {
        newSecondDinner = null;
      }

      return { ...day, dinner: newDinner, secondDinner: newSecondDinner };
    });
    
    saveData({ ...data, recipes: newRecipes, planner: { ...data.planner, days: newDays } });
  };

  const addBundle = (bundle: Recipe) => {
    if (!data) return;
    saveData({ ...data, bundles: [...data.bundles, bundle] });
  };

  const updateBundle = (updatedBundle: Recipe) => {
    if (!data) return;
    const newBundles = data.bundles.map(r => r.id === updatedBundle.id ? updatedBundle : r);
    saveData({ ...data, bundles: newBundles });
  };

  const deleteBundle = (bundleId: string) => {
    if (!data) return;
    const newBundles = data.bundles.filter(r => r.id !== bundleId);
    
    // Clean up from weekly lists
    saveData({ 
      ...data, 
      bundles: newBundles,
      planner: {
        ...data.planner,
        weeklyBreakfast: data.planner.weeklyBreakfast.filter(id => id !== bundleId),
        weeklyLunch: data.planner.weeklyLunch.filter(id => id !== bundleId),
        weeklySnacks: data.planner.weeklySnacks.filter(id => id !== bundleId)
      }
    });
  };

  const updateDinnerSlot = (dayName: string, recipeId: string | null, slotIndex: number = 0) => {
    if (!data) return;
    const newDays = data.planner.days.map(p => {
      if (p.dayName !== dayName) return p;

      if (slotIndex === 1) {
        // Clearing or updating secondary dinner
        if (recipeId === null) {
          return { ...p, secondDinner: null };
        } else {
          return {
            ...p,
            secondDinner: {
              recipeId,
              chef: p.secondDinner?.chef || null,
              adults: p.secondDinner?.adults !== undefined ? p.secondDinner.adults : 0,
              children: p.secondDinner?.children !== undefined ? p.secondDinner.children : 2
            }
          };
        }
      }

      // slotIndex === 0 (Primary dinner)
      if (recipeId === null) {
        if (p.secondDinner?.recipeId) {
          return {
            ...p,
            dinner: {
              recipeId: p.secondDinner.recipeId,
              chef: p.dinner.chef || p.secondDinner.chef || null,
              adults: p.secondDinner.adults,
              children: p.secondDinner.children
            },
            secondDinner: null
          };
        } else {
          return {
            ...p,
            dinner: { ...p.dinner, recipeId: null }
          };
        }
      } else {
        // Dropping a recipe into primary slot
        // If primary slot already has a recipe and no second dinner, split automatically!
        if (p.dinner.recipeId && p.dinner.recipeId !== recipeId && !p.secondDinner?.recipeId) {
          return {
            ...p,
            dinner: {
              ...p.dinner,
              adults: p.dinner.adults || 2,
              children: 0
            },
            secondDinner: {
              recipeId,
              chef: null,
              adults: 0,
              children: 2
            }
          };
        } else {
          return {
            ...p,
            dinner: { ...p.dinner, recipeId }
          };
        }
      }
    });

    saveData({ ...data, planner: { ...data.planner, days: newDays } });
  };

  const updateDinnerChef = (dayName: string, chef: string | null) => {
    if (!data) return;
    const newDays = data.planner.days.map(p => 
      p.dayName === dayName 
        ? { ...p, dinner: { ...p.dinner, chef } } 
        : p
    );
    saveData({ ...data, planner: { ...data.planner, days: newDays } });
  };

  const updateDinnerGuests = (dayName: string, adults: number, children: number, slotIndex: number = 0) => {
    if (!data) return;
    const newDays = data.planner.days.map(p => {
      if (p.dayName !== dayName) return p;
      if (slotIndex === 1 && p.secondDinner) {
        return {
          ...p,
          secondDinner: {
            ...p.secondDinner,
            adults: Math.max(0, adults),
            children: Math.max(0, children)
          }
        };
      }
      return {
        ...p,
        dinner: {
          ...p.dinner,
          adults: Math.max(0, adults),
          children: Math.max(0, children)
        }
      };
    });
    saveData({ ...data, planner: { ...data.planner, days: newDays } });
  };

  const addWeeklyItem = (type: 'breakfast' | 'lunch' | 'snacks', bundleId: string) => {
    if (!data) return;
    const key = type === 'breakfast' ? 'weeklyBreakfast' : type === 'lunch' ? 'weeklyLunch' : 'weeklySnacks';
    saveData({ 
      ...data, 
      planner: { ...data.planner, [key]: [...data.planner[key], bundleId] } 
    });
  };

  const removeWeeklyItem = (type: 'breakfast' | 'lunch' | 'snacks', index: number) => {
    if (!data) return;
    const key = type === 'breakfast' ? 'weeklyBreakfast' : type === 'lunch' ? 'weeklyLunch' : 'weeklySnacks';
    const newList = [...data.planner[key]];
    newList.splice(index, 1);
    saveData({ 
      ...data, 
      planner: { ...data.planner, [key]: newList } 
    });
  };

  const addChef = (chefName: string) => {
    if (!data || !chefName.trim()) return;
    const name = chefName.trim();
    if (data.chefs.includes(name)) return;
    saveData({ ...data, chefs: [...data.chefs, name] });
  };

  const deleteChef = (chefName: string) => {
    if (!data) return;
    const newChefs = data.chefs.filter(c => c !== chefName);
    const newDays = data.planner.days.map(day => {
      const newDinner = { ...day.dinner };
      if (newDinner.chef === chefName) newDinner.chef = null;
      return { ...day, dinner: newDinner };
    });
    saveData({ ...data, chefs: newChefs, planner: { ...data.planner, days: newDays } });
  };

  const moveDinnerSlot = (fromDayName: string, toDayName: string, fromSlotIndex: number = 0) => {
    if (!data) return;
    const sourceDay = data.planner.days.find(p => p.dayName === fromDayName);
    if (!sourceDay) return;
    
    const sourceDinner = fromSlotIndex === 1 && sourceDay.secondDinner ? sourceDay.secondDinner : sourceDay.dinner;
    if (!sourceDinner.recipeId) return;

    const newDays = data.planner.days.map(p => {
      let dayCopy = { ...p };

      // Clear from source
      if (p.dayName === fromDayName) {
        if (fromSlotIndex === 1) {
          dayCopy.secondDinner = null;
        } else {
          if (p.secondDinner?.recipeId) {
            dayCopy.dinner = {
              recipeId: p.secondDinner.recipeId,
              chef: p.dinner.chef || p.secondDinner.chef || null,
              adults: p.secondDinner.adults,
              children: p.secondDinner.children
            };
            dayCopy.secondDinner = null;
          } else {
            dayCopy.dinner = { ...p.dinner, recipeId: null, adults: 2, children: 2 };
          }
        }
      }

      // Add to destination
      if (p.dayName === toDayName) {
        if (toDayName === fromDayName) return dayCopy;

        if (dayCopy.dinner.recipeId && !dayCopy.secondDinner?.recipeId) {
          // Destination has a dinner, split it!
          dayCopy.secondDinner = {
            recipeId: sourceDinner.recipeId,
            adults: sourceDinner.adults,
            children: sourceDinner.children
          };
        } else {
          dayCopy.dinner = {
            ...dayCopy.dinner,
            recipeId: sourceDinner.recipeId,
            adults: sourceDinner.adults,
            children: sourceDinner.children
          };
        }
      }

      return dayCopy;
    });

    saveData({ ...data, planner: { ...data.planner, days: newDays } });
  };

  const moveDinnerChef = (fromDayName: string, toDayName: string) => {
    if (!data) return;
    const sourceDay = data.planner.days.find(p => p.dayName === fromDayName);
    if (!sourceDay || !sourceDay.dinner.chef) return;
    const chef = sourceDay.dinner.chef;
    
    const newDays = data.planner.days.map(p => {
      if (p.dayName === fromDayName) {
        return { ...p, dinner: { ...p.dinner, chef: null } };
      }
      if (p.dayName === toDayName) {
        return { ...p, dinner: { ...p.dinner, chef } };
      }
      return p;
    });
    
    saveData({ ...data, planner: { ...data.planner, days: newDays } });
  };

  const moveWeeklyItem = (fromType: 'breakfast' | 'lunch' | 'snacks', fromIndex: number, toType: 'breakfast' | 'lunch' | 'snacks') => {
    if (!data) return;
    const fromKey = fromType === 'breakfast' ? 'weeklyBreakfast' : fromType === 'lunch' ? 'weeklyLunch' : 'weeklySnacks';
    const toKey = toType === 'breakfast' ? 'weeklyBreakfast' : toType === 'lunch' ? 'weeklyLunch' : 'weeklySnacks';
    
    const bundleId = data.planner[fromKey][fromIndex];
    if (!bundleId) return;

    const newFromList = data.planner[fromKey].filter((_, idx) => idx !== fromIndex);
    
    let updatedPlanner = { ...data.planner, [fromKey]: newFromList };
    if (fromKey === toKey) {
      updatedPlanner[toKey] = [...newFromList, bundleId];
    } else {
      updatedPlanner[toKey] = [...data.planner[toKey], bundleId];
    }

    saveData({ ...data, planner: updatedPlanner });
  };

  return {
    data,
    addRecipe, updateRecipe, deleteRecipe,
    addBundle, updateBundle, deleteBundle,
    updateDinnerSlot, updateDinnerChef, updateDinnerGuests,
    moveDinnerSlot, moveDinnerChef, moveWeeklyItem,
    addWeeklyItem, removeWeeklyItem,
    addChef, deleteChef,
    saveData
  };
}
