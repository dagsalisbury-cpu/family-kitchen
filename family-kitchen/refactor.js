const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Add imports
const imports = `
import ChefSelector from "@/components/planner/ChefSelector";
import BundleLibrary from "@/components/library/BundleLibrary";
import RecipeLibrary from "@/components/library/RecipeLibrary";
import MealCalendar from "@/components/planner/MealCalendar";
import GroceryDrawer from "@/components/grocery/GroceryDrawer";
import { getChefAnimal } from "@/lib/utils";
`;

content = content.replace('import WanderingAvatar from "@/components/WanderingAvatar";', 'import WanderingAvatar from "@/components/WanderingAvatar";' + imports);

// We need to replace the Left Sidebar, Center Column, and Right Sidebar with our components.
// The left sidebar starts at: {/* LEFT SIDEBAR */}
// The right sidebar ends at: </div>\n      </div>\n\n      {/* MODAL (CREATE OR EDIT) */}

const startMarker = '{/* LEFT SIDEBAR */}';
const endMarker = '{/* MODAL (CREATE OR EDIT) */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `
        {/* LEFT SIDEBAR */}
        <div className="w-[300px] flex-shrink-0 border-r-4 border-white/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md flex flex-col h-full overflow-hidden shadow-[5px_0_15px_-3px_rgba(0,0,0,0.05)] z-10">
          <ChefSelector handleDragStart={handleDragStart} handleDragEnd={handleDragEnd} />
          <div className="flex-1 overflow-y-auto flex flex-col">
            <BundleLibrary handleDragStart={handleDragStart} handleDragEnd={handleDragEnd} openNewModal={openNewModal} openEditModal={openEditModal} />
            <RecipeLibrary handleDragStart={handleDragStart} handleDragEnd={handleDragEnd} openNewModal={openNewModal} openEditModal={openEditModal} />
          </div>
        </div>

        {/* CENTER COLUMN */}
        <MealCalendar 
          currentDeliveryDate={currentDeliveryDate}
          currentDeliveryTime={currentDeliveryTime}
          currentDaysCount={currentDaysCount}
          dateOptions={dateOptions}
          handleDeliveryDetailsChange={handleDeliveryDetailsChange}
          handleDropWeekly={handleDropWeekly}
          handleDragOver={handleDragOver}
          handleDragStart={handleDragStart}
          removeWeeklyItem={removeWeeklyItem}
          handleDropDinner={handleDropDinner}
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
        />
      </div>

      `;
  
  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  
  // also remove the old groceryKnowledgeBase and chefAnimals and getChefAnimal from page.tsx to avoid duplication and errors
  content = content.replace(/const groceryKnowledgeBase: Record.*?};/s, '');
  content = content.replace(/const chefAnimals = \[.*?\];/s, '');
  content = content.replace(/const getChefAnimal = \(.*?};/s, '');

  fs.writeFileSync(pagePath, content);
  console.log("Successfully refactored page.tsx");
} else {
  console.log("Markers not found");
}
