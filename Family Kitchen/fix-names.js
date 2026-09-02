const fs = require('fs');
const path = require('path');

const replaceInFile = (filePath, replacements) => {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [oldStr, newStr] of replacements) {
    content = content.replace(new RegExp(oldStr, 'g'), newStr);
  }
  fs.writeFileSync(filePath, content);
};

// 1. page.tsx
const pagePath = path.join(__dirname, 'src', 'app', 'page.tsx');
replaceInFile(pagePath, [
  [
    `{activeDragItem.type === 'chef' ? '👨‍🍳 ' + activeDragItem.id : 
               activeDragItem.type === 'bundle' ? '📦 Bundle' : '🍲 Recipe'}`,
    `{activeDragItem.type === 'chef' ? '👨‍🍳 ' + activeDragItem.data.name : 
               activeDragItem.type === 'bundle' ? '📦 ' + activeDragItem.data.name : '🍲 ' + activeDragItem.data.name}`
  ]
]);

// 2. RecipeLibrary.tsx
const recipePath = path.join(__dirname, 'src', 'components', 'library', 'RecipeLibrary.tsx');
replaceInFile(recipePath, [
  ['data={{ id: recipe.id }}', 'data={{ id: recipe.id, name: recipe.name }}']
]);

// 3. BundleLibrary.tsx
const bundlePath = path.join(__dirname, 'src', 'components', 'library', 'BundleLibrary.tsx');
replaceInFile(bundlePath, [
  ['data={{ id: bundle.id }}', 'data={{ id: bundle.id, name: bundle.name }}']
]);

// 4. ChefSelector.tsx
const chefPath = path.join(__dirname, 'src', 'components', 'planner', 'ChefSelector.tsx');
replaceInFile(chefPath, [
  ['data={{ id: chef }}', 'data={{ id: chef, name: chef }}']
]);

// 5. MealCalendar.tsx
const calendarPath = path.join(__dirname, 'src', 'components', 'planner', 'MealCalendar.tsx');
replaceInFile(calendarPath, [
  ['data={{ id: bundle.id, source', 'data={{ id: bundle.id, name: bundle.name, source'],
  ['data={{ id: slot.chef!, source', 'data={{ id: slot.chef!, name: slot.chef!, source'],
  ['data={{ id: recipe!.id, source', 'data={{ id: recipe!.id, name: recipe!.name, source'],
  ['data={{ id: secondRecipe!.id, source', 'data={{ id: secondRecipe!.id, name: secondRecipe!.name, source'],
  ['data={{ id: recipe.id, source', 'data={{ id: recipe.id, name: recipe.name, source']
]);

console.log("Fixed DraggableItem names!");
