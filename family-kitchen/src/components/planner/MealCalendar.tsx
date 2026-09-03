"use client";

import { CalendarDays, PackageOpen, Coffee, Sun, Cookie, GripVertical, X, Users, User, Baby, Moon } from "lucide-react";
import { useStore } from "@/lib/store";
import { getChefAnimal } from "@/lib/utils";
import { DraggableItem } from "@/components/ui/DraggableItem";
import { DroppableZone } from "@/components/ui/DroppableZone";

export default function MealCalendar({
  currentDeliveryDate,
  currentDeliveryTime,
  currentDaysCount,
  dateOptions,
  handleDeliveryDetailsChange,
    removeWeeklyItem,
    updateDinnerChef,
  updateDinnerSlot,
  updateDinnerGuests,
  className,
}: any) {
  const { data } = useStore();

  if (!data) return null;

  return (
    <div className={`flex-1 flex flex-col overflow-auto relative ${className || ""}`}>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      
      <div className="p-4 w-full h-full flex flex-col relative z-10 lg:min-w-[800px] min-w-0 gap-6">
        
        {/* DELIVERY SCHEDULE & TIME SLOT SETTINGS */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-[2rem] p-6 shadow-sm border border-white/50 dark:border-slate-700 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-[#F9F9F9] dark:bg-indigo-900/50 p-2 rounded-xl text-slate-600 dark:text-slate-400">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 leading-tight">Delivery Schedule</h2>
                <p className="text-xs font-semibold text-slate-500">Choose when you want the grocery shop to arrive</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Delivery Date</label>
                <select 
                  value={currentDeliveryDate} 
                  onChange={(e) => handleDeliveryDetailsChange(e.target.value, currentDeliveryTime, currentDaysCount)}
                  className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#5AA9E6]"
                >
                  {dateOptions.map((opt: any) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Time Slot</label>
                <select 
                  value={currentDeliveryTime} 
                  onChange={(e) => handleDeliveryDetailsChange(currentDeliveryDate, e.target.value, currentDaysCount)}
                  className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#5AA9E6]"
                >
                  <optgroup label="Morning">
                    <option value="07:00 - 08:00">07:00 - 08:00</option>
                    <option value="08:00 - 09:00">08:00 - 09:00</option>
                    <option value="09:00 - 10:00">09:00 - 10:00</option>
                    <option value="10:00 - 11:00">10:00 - 11:00</option>
                    <option value="11:00 - 12:00">11:00 - 12:00</option>
                  </optgroup>
                  <optgroup label="Afternoon">
                    <option value="12:00 - 13:00">12:00 - 13:00</option>
                    <option value="13:00 - 14:00">13:00 - 14:00</option>
                    <option value="14:00 - 15:00">14:00 - 15:00</option>
                    <option value="15:00 - 16:00">15:00 - 16:00</option>
                    <option value="16:00 - 17:00">16:00 - 17:00</option>
                  </optgroup>
                  <optgroup label="Evening">
                    <option value="17:00 - 18:00">17:00 - 18:00</option>
                    <option value="18:00 - 19:00">18:00 - 19:00</option>
                    <option value="19:00 - 20:00">19:00 - 20:00</option>
                    <option value="20:00 - 21:00">20:00 - 21:00</option>
                    <option value="21:00 - 22:00">21:00 - 22:00</option>
                    <option value="22:00 - 23:00">22:00 - 23:00</option>
                  </optgroup>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-150/50 dark:border-slate-800/50 pt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-350">Calendar Range:</span>
              <span className="bg-[#F9F9F9] dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 text-xs font-black px-2 py-0.5 rounded-md">
                {currentDaysCount} Days
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              {[7, 8, 9, 10, 11, 12, 13, 14].map((num) => (
                <button
                  key={num}
                  onClick={() => handleDeliveryDetailsChange(currentDeliveryDate, currentDeliveryTime, num)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    currentDaysCount === num
                      ? 'bg-slate-800 text-white shadow-sm scale-105'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {num === 7 ? "7 (Default)" : num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* WEEKLY BUNDLES */}
        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-[2rem] p-5 shadow-sm border border-white/50 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2 mb-4">
            <PackageOpen className="w-5 h-5 text-[#FFE45E]" /> Weekly Staples
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full ml-2">Drag Item Bundles here</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {(['breakfast', 'lunch', 'snacks'] as const).map(type => {
              const configs = {
                breakfast: { icon: Coffee, color: 'text-[#FFE45E]', bg: 'bg-[#FFE45E]/20', border: 'border-[#FFE45E]/50' },
                lunch: { icon: Sun, color: 'text-[#5AA9E6]', bg: 'bg-[#5AA9E6]/20', border: 'border-[#5AA9E6]/50' },
                snacks: { icon: Cookie, color: 'text-[#FFE45E]', bg: 'bg-[#FFE45E]/20', border: 'border-[#FFE45E]/50' }
              };
              const config = configs[type];
              const Icon = config.icon;
              const list = type === 'breakfast' ? data.planner.weeklyBreakfast : type === 'lunch' ? data.planner.weeklyLunch : data.planner.weeklySnacks;

              return (
                <DroppableZone
                  key={type}
                  id={`weekly-${type}`}
                  data={{ section: "weekly", weeklyType: type }}
                  activeClassName="bg-[#7FC8F8]/20 dark:bg-slate-800/50 ring-2 ring-[#7FC8F8]"
                  className={`flex flex-col gap-2 rounded-2xl border-2 border-dashed ${config.border} p-3 min-h-[120px] transition-all hover:bg-white/50 dark:hover:bg-slate-800/50`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className={`w-4 h-4 ${config.color}`} />
                    <h3 className={`font-black text-xs uppercase tracking-widest ${config.color}`}>{type}</h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {list.length === 0 ? (
                      <div className="w-full text-center py-4 text-xs font-bold opacity-40">Empty</div>
                    ) : (
                      list.map((bundleId, idx) => {
                        const bundle = data.bundles.find(b => b.id === bundleId);
                        if (!bundle) return null;
                        return (
                          <DraggableItem 
                            key={idx} 
                            id={`weekly-${type}-${idx}`}
                            type="bundle"
                            data={{ id: bundle.id, name: bundle.name, source: { section: "weekly", weeklyType: type, index: idx } }}
                            className="bg-white dark:bg-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-600 flex items-center gap-1.5 group cursor-grab active:cursor-grabbing hover:border-amber-300 hover:shadow-md transition-all"
                          >
                            <GripVertical className="w-3 h-3 text-slate-300 group-hover:text-[#FFE45E] shrink-0" />
                            <span>{bundle.name}</span>
                            <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); removeWeeklyItem(type, idx); }} className="text-slate-400 hover:text-[#FFE45E] ml-1"><X className="w-3 h-3" /></button>
                          </DraggableItem>
                        );
                      })
                    )}
                  </div>
                </DroppableZone>
              );
            })}
          </div>
        </div>

        {/* DINNERS GRID */}
        <div>
          <div className="mb-4 flex flex-col justify-start px-2">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#5AA9E6]" />
              Evening Dinners
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 pl-7 font-medium">
              Drag dinners and chefs here. Adults and children scale ingredient quantities.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
            {data.planner.days.map((day) => {
              const slot = day.dinner;
              const recipe = slot.recipeId ? data.recipes.find(r => r.id === slot.recipeId) : null;
              const hasRecipe = !!recipe;
              const secondRecipe = day.secondDinner?.recipeId ? data.recipes.find(r => r.id === day.secondDinner?.recipeId) : null;
              const hasSecondDinner = !!secondRecipe;
              const hasChef = !!slot.chef;
              
              return (
                <div key={day.dayName} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm border-2 border-slate-200 dark:border-slate-700 flex flex-col min-h-[250px] h-full">
                  
                  <div className="bg-gradient-to-b from-[#7FC8F8]/30 to-white dark:from-[#5AA9E6]/20 dark:to-slate-900 p-2 text-center border-b border-slate-200 dark:border-slate-700 shrink-0">
                    <h3 className="font-black text-sm text-slate-800 dark:text-white uppercase">{day.dayName.substring(0,3)}</h3>
                    <span className="text-[10px] font-bold text-[#5AA9E6]">{day.date}</span>
                  </div>
                  
                  <div className="flex-1 p-2.5 flex flex-col gap-2 relative group justify-between">
                    {/* TIER 1: DESIGNATED CHEF SLOT (Consistent top horizontal band across all days) */}
                    <DroppableZone 
                      id={`dinner-chef-${day.dayName}`} 
                      data={{ section: "dinner", dayName: day.dayName }}
                      className="w-full h-8 flex items-center justify-center shrink-0 rounded-full"
                      activeClassName="ring-2 ring-[#5AA9E6] bg-[#5AA9E6]/20 dark:bg-[#5AA9E6]/10"
                    >
                      {hasChef ? (
                        <DraggableItem 
                          id={`dinner-chef-${day.dayName}`}
                          type="chef"
                          data={{ id: slot.chef!, name: slot.chef!, source: { section: "dinner", dayName: day.dayName } }}
                          className="flex items-center gap-1.5 justify-center group/chef bg-[#F9F9F9] dark:bg-slate-800/30 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm cursor-grab active:cursor-grabbing hover:border-[#5AA9E6] hover:shadow-md transition-all w-full max-w-[95%]"
                        >
                          <span className="text-sm shrink-0">{getChefAnimal(slot.chef || '')}</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {slot.chef}
                          </span>
                          <button 
                            onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); updateDinnerChef(day.dayName, null); }}
                            className="opacity-0 group-hover/chef:opacity-100 text-[#FFE45E] hover:bg-[#FFE45E]/20 rounded-full p-0.5 ml-auto transition-all"
                            title={`Remove ${slot.chef}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </DraggableItem>
                      ) : (
                        <div className="w-full h-7 border border-dashed border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center gap-1 text-[10px] font-bold text-slate-350 dark:text-slate-600 transition-colors group-hover:border-slate-200 group-hover:text-slate-400">
                          <Users className="w-3 h-3 opacity-50" />
                          <span>Chef</span>
                        </div>
                      )}
                    </DroppableZone>

                    {/* TIER 2: DESIGNATED RECIPE SLOT (Consistent bottom area across all days) */}
                    <DroppableZone 
                      id={`dinner-recipe-${day.dayName}`} 
                      data={{ section: "dinner", dayName: day.dayName }}
                      className="flex-1 w-full flex flex-col justify-center items-center rounded-xl"
                      activeClassName="ring-2 ring-[#7FC8F8] bg-[#7FC8F8]/20 dark:bg-[#7FC8F8]/10"
                    >
                      {hasSecondDinner ? (
                        /* Split vertically into two separate dinners */
                        <div className="w-full flex flex-col gap-2 h-full justify-between">
                          {/* Dinner 1 (e.g. Adults Meal) */}
                          <DraggableItem 
                            id={`dinner-recipe-0-${day.dayName}`}
                            type="recipe"
                            data={{ id: recipe!.id, name: recipe!.name, source: { section: "dinner", dayName: day.dayName, slotIndex: 0 } }}
                            className="bg-white dark:bg-slate-700 p-2 rounded-xl shadow-sm border border-slate-200/70 w-full flex flex-col justify-between relative group/btn cursor-grab active:cursor-grabbing hover:border-[#5AA9E6] hover:shadow transition-all"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[9px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 bg-[#F9F9F9] dark:bg-indigo-900/50 px-1.5 py-0.5 rounded">
                                Meal 1
                              </span>
                              <button 
                                onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); updateDinnerSlot(day.dayName, null, 0); }}
                                className="text-slate-400 hover:text-[#FFE45E] p-0.5"
                                title="Remove Meal 1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 text-center leading-tight line-clamp-1 truncate my-1 pointer-events-none">
                              {recipe?.name}
                            </span>
                            <div className="flex items-center justify-center gap-1.5 border-t border-slate-100 dark:border-slate-600 pt-1.5 pointer-events-none">
                              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700 pointer-events-auto">
                                <User className="w-2.5 h-2.5 text-slate-400" />
                                <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); updateDinnerGuests(day.dayName, slot.adults - 1, slot.children, 0); }} className="text-slate-400 hover:text-slate-600 text-[10px] leading-none">-</button>
                                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{slot.adults}</span>
                                <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); updateDinnerGuests(day.dayName, slot.adults + 1, slot.children, 0); }} className="text-slate-400 hover:text-slate-600 text-[10px] leading-none">+</button>
                              </div>
                              <div className="flex items-center gap-1 bg-[#FFE45E]/20 dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700 pointer-events-auto">
                                <Baby className="w-2.5 h-2.5 text-slate-400" />
                                <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); updateDinnerGuests(day.dayName, slot.adults, slot.children - 1, 0); }} className="text-slate-400 hover:text-[#5AA9E6] text-[10px] leading-none">-</button>
                                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{slot.children}</span>
                                <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); updateDinnerGuests(day.dayName, slot.adults, slot.children + 1, 0); }} className="text-slate-400 hover:text-[#5AA9E6] text-[10px] leading-none">+</button>
                              </div>
                            </div>
                          </DraggableItem>

                          {/* Dinner 2 (e.g. Kids Meal) */}
                          <DraggableItem 
                            id={`dinner-recipe-1-${day.dayName}`}
                            type="recipe"
                            data={{ id: secondRecipe!.id, name: secondRecipe!.name, source: { section: "dinner", dayName: day.dayName, slotIndex: 1 } }}
                            className="bg-white dark:bg-slate-700 p-2 rounded-xl shadow-sm border border-slate-200 w-full flex flex-col justify-between relative group/btn cursor-grab active:cursor-grabbing hover:border-[#5AA9E6] hover:shadow transition-all"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[9px] font-black uppercase tracking-wider text-[#5AA9E6] dark:text-[#5AA9E6] bg-[#7FC8F8]/20 dark:bg-violet-900/30 px-1.5 py-0.5 rounded">
                                Meal 2
                              </span>
                              <button 
                                onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); updateDinnerSlot(day.dayName, null, 1); }}
                                className="text-slate-400 hover:text-[#FFE45E] p-0.5"
                                title="Remove Meal 2"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 text-center leading-tight line-clamp-1 truncate my-1 pointer-events-none">
                              {secondRecipe?.name}
                            </span>
                            <div className="flex items-center justify-center gap-1.5 border-t border-slate-100 dark:border-slate-600 pt-1.5 pointer-events-none">
                              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700 pointer-events-auto">
                                <User className="w-2.5 h-2.5 text-slate-400" />
                                <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); updateDinnerGuests(day.dayName, (day.secondDinner?.adults || 0) - 1, day.secondDinner?.children || 0, 1); }} className="text-slate-400 hover:text-slate-600 text-[10px] leading-none">-</button>
                                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{day.secondDinner?.adults || 0}</span>
                                <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); updateDinnerGuests(day.dayName, (day.secondDinner?.adults || 0) + 1, day.secondDinner?.children || 0, 1); }} className="text-slate-400 hover:text-slate-600 text-[10px] leading-none">+</button>
                              </div>
                              <div className="flex items-center gap-1 bg-[#FFE45E]/20 dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700 pointer-events-auto">
                                <Baby className="w-2.5 h-2.5 text-slate-400" />
                                <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); updateDinnerGuests(day.dayName, day.secondDinner?.adults || 0, (day.secondDinner?.children || 0) - 1, 1); }} className="text-slate-400 hover:text-[#5AA9E6] text-[10px] leading-none">-</button>
                                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{day.secondDinner?.children || 0}</span>
                                <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); updateDinnerGuests(day.dayName, day.secondDinner?.adults || 0, (day.secondDinner?.children || 0) + 1, 1); }} className="text-slate-400 hover:text-[#5AA9E6] text-[10px] leading-none">+</button>
                              </div>
                            </div>
                          </DraggableItem>
                        </div>
                      ) : hasRecipe ? (
                        <DraggableItem 
                          id={`dinner-recipe-fallback-${day.dayName}`}
                          type="recipe"
                          data={{ id: recipe.id, name: recipe.name, source: { section: "dinner", dayName: day.dayName, slotIndex: 0 } }}
                          className="bg-white dark:bg-slate-700 p-2.5 rounded-xl shadow-sm border border-slate-200/50 w-full flex flex-col justify-between h-full relative group/btn cursor-grab active:cursor-grabbing hover:border-[#5AA9E6] hover:shadow-md transition-all min-h-[135px]"
                        >
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 text-center leading-tight line-clamp-2 break-words pointer-events-none mt-1">
                            {recipe.name}
                          </span>
                          
                          <div className="flex items-center justify-center gap-2 border-t border-slate-100 dark:border-slate-600 pt-2 pointer-events-none mt-auto">
                            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-1.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 pointer-events-auto">
                              <User className="w-3 h-3 text-slate-400" />
                              <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); updateDinnerGuests(day.dayName, slot.adults - 1, slot.children, 0); }} className="text-slate-400 hover:text-slate-600 text-xs leading-none">-</button>
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{slot.adults}</span>
                              <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); updateDinnerGuests(day.dayName, slot.adults + 1, slot.children, 0); }} className="text-slate-400 hover:text-slate-600 text-xs leading-none">+</button>
                            </div>
                            <div className="flex items-center gap-1 bg-[#FFE45E]/20 dark:bg-slate-800 px-1.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 pointer-events-auto">
                              <Baby className="w-3 h-3 text-slate-400" />
                              <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); updateDinnerGuests(day.dayName, slot.adults, slot.children - 1, 0); }} className="text-slate-400 hover:text-[#5AA9E6] text-xs leading-none">-</button>
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{slot.children}</span>
                              <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); updateDinnerGuests(day.dayName, slot.adults, slot.children + 1, 0); }} className="text-slate-400 hover:text-[#5AA9E6] text-xs leading-none">+</button>
                            </div>
                          </div>

                          <button 
                            onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); updateDinnerSlot(day.dayName, null, 0); }}
                            className="absolute -top-2 -right-2 bg-[#FFE45E]/30 text-[#FFE45E] hover:bg-[#FFE45E]/200 hover:text-white p-1 rounded-full opacity-0 group-hover/btn:opacity-100 transition-all shadow-md pointer-events-auto"
                            title="Remove Dinner"
                          >
                            <X className="w-3 h-3 font-bold" />
                          </button>
                        </DraggableItem>
                      ) : (
                        <div className="w-full h-full min-h-[135px] rounded-xl border-2 border-dashed border-slate-200/80 dark:border-slate-700/60 flex flex-col items-center justify-center p-2 text-center group-hover:border-[#5AA9E6] transition-colors">
                          <Moon className="w-6 h-6 text-slate-300 dark:text-slate-600 mb-1 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 group-hover:text-[#5AA9E6] transition-colors">Dinner</span>
                        </div>
                      )}
                    </DroppableZone>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
      </div>
    </div>
  );
}
