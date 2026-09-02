const fs = require('fs');
const path = require('path');

// --- Refactor MealCalendar.tsx ---
const calendarPath = path.join(__dirname, 'src', 'components', 'planner', 'MealCalendar.tsx');
let calendarContent = fs.readFileSync(calendarPath, 'utf8');

// Add imports
calendarContent = calendarContent.replace(
  'import { getChefAnimal } from "@/lib/utils";',
  'import { getChefAnimal } from "@/lib/utils";\nimport { DraggableItem } from "@/components/ui/DraggableItem";\nimport { DroppableZone } from "@/components/ui/DroppableZone";'
);

// Remove old drag props
calendarContent = calendarContent.replace('handleDropWeekly,\n  handleDragOver,\n  handleDragStart,\n', '');
calendarContent = calendarContent.replace('handleDropDinner,\n', '');

// Weekly Drop zones
calendarContent = calendarContent.replace(
  /<div \n                  key=\{type\}\n                  onDrop=\{\(e\) => handleDropWeekly\(e, type\)\}\n                  onDragOver=\{handleDragOver\}/g,
  '<DroppableZone\n                  key={type}\n                  id={`weekly-${type}`}\n                  data={{ section: "weekly", weeklyType: type }}\n                  activeClassName="bg-white/50 dark:bg-slate-800/50"'
);
calendarContent = calendarContent.replace(/<\/div>\n              \);\n            \}\)}\n          <\/div>/g, '</DroppableZone>\n              );\n            })}\n          </div>');

// Weekly draggables
calendarContent = calendarContent.replace(
  /<div \n                            key=\{idx\} \n                            draggable\n                            onDragStart=\{\(e\) => handleDragStart\(e, 'bundle', bundle\.id, \{ section: 'weekly', weeklyType: type, index: idx \}\)\}/g,
  '<DraggableItem \n                            key={idx} \n                            id={`weekly-${type}-${idx}`}\n                            type="bundle"\n                            data={{ id: bundle.id, source: { section: "weekly", weeklyType: type, index: idx } }}'
);
calendarContent = calendarContent.replace(/<\/button>\n                          <\/div>/g, '</button>\n                          </DraggableItem>');

// Dinner Drop zones
calendarContent = calendarContent.replace(
  /<div \n                    onDrop=\{\(e\) => handleDropDinner\(e, day\.dayName\)\}\n                    onDragOver=\{handleDragOver\}\n                    className="flex-1 p-2\.5 flex flex-col gap-2 relative group justify-between"\n                  >/g,
  '<DroppableZone \n                    id={`dinner-${day.dayName}`}\n                    data={{ section: "dinner", dayName: day.dayName }}\n                    className="flex-1 p-2.5 flex flex-col gap-2 relative group justify-between"\n                    activeClassName="bg-indigo-50/50 dark:bg-slate-800/50"\n                  >'
);
calendarContent = calendarContent.replace(/<\/div>\n                <\/div>\n              \);\n            \}\)}\n          <\/div>/g, '</DroppableZone>\n                </div>\n              );\n            })}\n          </div>');

// Dinner Chef draggables
calendarContent = calendarContent.replace(
  /<div \n                          draggable\n                          onDragStart=\{\(e\) => handleDragStart\(e, 'chef', slot\.chef!, \{ section: 'dinner', dayName: day\.dayName \}\)\}/g,
  '<DraggableItem \n                          id={`dinner-chef-${day.dayName}`}\n                          type="chef"\n                          data={{ id: slot.chef!, source: { section: "dinner", dayName: day.dayName } }}'
);
calendarContent = calendarContent.replace(
  /<\/button>\n                        <\/div>\n                      \) : \(/g,
  '</button>\n                        </DraggableItem>\n                      ) : ('
);

// Dinner Recipe 1 draggables
calendarContent = calendarContent.replace(
  /<div \n                            draggable\n                            onDragStart=\{\(e\) => handleDragStart\(e, 'recipe', recipe!\.id, \{ section: 'dinner', dayName: day\.dayName, slotIndex: 0 \}\)\}/g,
  '<DraggableItem \n                            id={`dinner-recipe-0-${day.dayName}`}\n                            type="recipe"\n                            data={{ id: recipe!.id, source: { section: "dinner", dayName: day.dayName, slotIndex: 0 } }}'
);
calendarContent = calendarContent.replace(
  /<\/button>\n                                  <\/div>\n                                <\/div>\n                              <\/div>\n\n                              {\/\* Dinner 2/g,
  '</button>\n                                  </div>\n                                </div>\n                              </DraggableItem>\n\n                              {/* Dinner 2'
);

// Dinner Recipe 2 draggables
calendarContent = calendarContent.replace(
  /<div \n                            draggable\n                            onDragStart=\{\(e\) => handleDragStart\(e, 'recipe', secondRecipe!\.id, \{ section: 'dinner', dayName: day\.dayName, slotIndex: 1 \}\)\}/g,
  '<DraggableItem \n                            id={`dinner-recipe-1-${day.dayName}`}\n                            type="recipe"\n                            data={{ id: secondRecipe!.id, source: { section: "dinner", dayName: day.dayName, slotIndex: 1 } }}'
);
calendarContent = calendarContent.replace(
  /<\/button>\n                                  <\/div>\n                                <\/div>\n                              <\/div>\n                            <\/div>\n                      \) : hasRecipe \? \(/g,
  '</button>\n                                  </div>\n                                </div>\n                              </DraggableItem>\n                            </div>\n                      ) : hasRecipe ? ('
);

// Fallback Dinner draggables
calendarContent = calendarContent.replace(
  /<div \n                          draggable\n                          onDragStart=\{\(e\) => handleDragStart\(e, 'recipe', recipe\.id, \{ section: 'dinner', dayName: day\.dayName, slotIndex: 0 \}\)\}/g,
  '<DraggableItem \n                          id={`dinner-recipe-fallback-${day.dayName}`}\n                          type="recipe"\n                          data={{ id: recipe.id, source: { section: "dinner", dayName: day.dayName, slotIndex: 0 } }}'
);
calendarContent = calendarContent.replace(
  /<\/button>\n                        <\/div>\n                      \) : \(\n                        <div className="w-full h-full min-h-\[135px\]/g,
  '</button>\n                        </DraggableItem>\n                      ) : (\n                        <div className="w-full h-full min-h-[135px]'
);

fs.writeFileSync(calendarPath, calendarContent);


// --- Refactor page.tsx ---
const pagePath = path.join(__dirname, 'src', 'app', 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// Add DndContext imports
pageContent = pageContent.replace(
  'import { getChefAnimal, groceryKnowledgeBase } from "@/lib/utils";',
  'import { getChefAnimal, groceryKnowledgeBase } from "@/lib/utils";\nimport { DndContext, DragEndEvent } from "@dnd-kit/core";'
);

// Replace handleDragStart, handleDropBackground, handleDropDinner, handleDropWeekly, handleDragOver with unified onDragEnd
const dragHandlersRegex = /const handleDragStart = [\s\S]*?const handleDragOver = [^\n]*\n/m;
const unifiedDragEnd = `
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
`;
pageContent = pageContent.replace(dragHandlersRegex, unifiedDragEnd);

// Wrap main app in DndContext
pageContent = pageContent.replace(
  /<div \n      onDragOver=\{handleDragOver\}\n      onDrop=\{handleDropBackground\}\n      className="min-h-screen/g,
  '<DndContext onDragEnd={onDragEnd}>\n    <div \n      className="min-h-screen'
);
pageContent = pageContent.replace(
  /<\/div>\n\n      {\/\* MODAL \(CREATE OR EDIT\) \*\/}/g,
  '</div>\n    </DndContext>\n\n      {/* MODAL (CREATE OR EDIT) */}'
);

// Remove drag handlers from MealCalendar props
pageContent = pageContent.replace(/handleDropWeekly=\{handleDropWeekly\}\n          handleDragOver=\{handleDragOver\}\n          handleDragStart=\{handleDragStart\}\n          /g, '');
pageContent = pageContent.replace(/handleDropDinner=\{handleDropDinner\}\n          /g, '');


fs.writeFileSync(pagePath, pageContent);
console.log("Successfully refactored MealCalendar.tsx and page.tsx for dnd-kit");
