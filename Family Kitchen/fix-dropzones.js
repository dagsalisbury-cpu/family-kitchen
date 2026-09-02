const fs = require('fs');
const path = require('path');

// 1. Update MealCalendar.tsx
const calendarPath = path.join(__dirname, 'src', 'components', 'planner', 'MealCalendar.tsx');
let calendarContent = fs.readFileSync(calendarPath, 'utf8');

// Replace the single DroppableZone with a normal div
calendarContent = calendarContent.replace(
  /<DroppableZone \n                    id={`dinner-\$\{day.dayName\}`}\n                    data=\{\{ section: "dinner", dayName: day.dayName \}\}\n                    className="flex-1 p-2.5 flex flex-col gap-2 relative group justify-between"\n                    activeClassName="bg-violet-50\/30 dark:bg-slate-800\/50 ring-2 ring-violet-200"\n                  >/,
  '<div className="flex-1 p-2.5 flex flex-col gap-2 relative group justify-between">'
);

// Close the div
calendarContent = calendarContent.replace(
  '                  </DroppableZone>\n                </div>\n              );\n            })}\n          </div>',
  '                  </div>\n                </div>\n              );\n            })}\n          </div>'
);

// Wrap TIER 1 (Chef slot) in a DroppableZone
calendarContent = calendarContent.replace(
  '                    {/* TIER 1: DESIGNATED CHEF SLOT (Consistent top horizontal band across all days) */}\n                    <div className="w-full h-8 flex items-center justify-center shrink-0">',
  `                    {/* TIER 1: DESIGNATED CHEF SLOT (Consistent top horizontal band across all days) */}
                    <DroppableZone 
                      id={\`dinner-chef-\${day.dayName}\`} 
                      data={{ section: "dinner", dayName: day.dayName }}
                      className="w-full h-8 flex items-center justify-center shrink-0 rounded-full"
                      activeClassName="ring-2 ring-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/30"
                    >`
);

calendarContent = calendarContent.replace(
  '                      )}\n                    </div>\n\n                    {/* TIER 2: DESIGNATED RECIPE SLOT (Consistent bottom area across all days) */}',
  '                      )}\n                    </DroppableZone>\n\n                    {/* TIER 2: DESIGNATED RECIPE SLOT (Consistent bottom area across all days) */}'
);

// Wrap TIER 2 (Recipe slot) in a DroppableZone
calendarContent = calendarContent.replace(
  '                    {/* TIER 2: DESIGNATED RECIPE SLOT (Consistent bottom area across all days) */}\n                    <div className="flex-1 w-full flex flex-col justify-center items-center">',
  `                    {/* TIER 2: DESIGNATED RECIPE SLOT (Consistent bottom area across all days) */}
                    <DroppableZone 
                      id={\`dinner-recipe-\${day.dayName}\`} 
                      data={{ section: "dinner", dayName: day.dayName }}
                      className="flex-1 w-full flex flex-col justify-center items-center rounded-xl"
                      activeClassName="ring-2 ring-purple-400 bg-purple-50/50 dark:bg-purple-900/30"
                    >`
);

calendarContent = calendarContent.replace(
  '                      )}\n                    </div>\n                  </div>\n                </div>',
  '                      )}\n                    </DroppableZone>\n                  </div>\n                </div>'
);

fs.writeFileSync(calendarPath, calendarContent);

console.log("Updated MealCalendar to use precise DroppableZones");
