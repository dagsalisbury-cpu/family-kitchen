const fs = require('fs');
const path = require('path');

const replaceInFile = (filePath, replacements) => {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [oldStr, newStr] of replacements) {
    content = content.replace(new RegExp(oldStr, 'g'), newStr);
  }
  fs.writeFileSync(filePath, content);
};

// 1. page.tsx background
const pagePath = path.join(__dirname, 'src', 'app', 'page.tsx');
replaceInFile(pagePath, [
  ['from-cyan-100 via-purple-100 to-pink-100', 'from-slate-200 via-indigo-100 to-purple-200'],
  ['from-violet-500 to-indigo-600', 'from-purple-500 to-indigo-600'],
  ['shadow-violet-500/25', 'shadow-purple-500/25'],
  ['from-violet-700 to-indigo-700', 'from-purple-700 to-indigo-700']
]);

// 2. BundleLibrary.tsx (Cyan -> Yellow/Amber)
const bundlePath = path.join(__dirname, 'src', 'components', 'library', 'BundleLibrary.tsx');
replaceInFile(bundlePath, [
  ['cyan', 'amber'],
  ['text-amber-800 dark:text-amber-200', 'text-amber-900 dark:text-amber-100'] // Make text readable on yellow
]);

// 3. RecipeLibrary.tsx (Pink -> Purple)
const recipePath = path.join(__dirname, 'src', 'components', 'library', 'RecipeLibrary.tsx');
replaceInFile(recipePath, [
  ['pink', 'purple'],
  ['rose', 'purple']
]);

// 4. GroceryDrawer.tsx (Fuchsia/Purple -> Indigo/Purple)
const groceryPath = path.join(__dirname, 'src', 'components', 'grocery', 'GroceryDrawer.tsx');
replaceInFile(groceryPath, [
  ['fuchsia', 'indigo'],
]);

// 5. MealCalendar.tsx (Pink -> Yellow/Amber or Purple)
const calendarPath = path.join(__dirname, 'src', 'components', 'planner', 'MealCalendar.tsx');
replaceInFile(calendarPath, [
  ['pink', 'amber'],
  ['rose', 'amber']
]);

console.log("Aligned to Silver/Purple/Yellow!");
