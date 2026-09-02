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
  ['from-amber-100 via-rose-100 to-fuchsia-100', 'from-cyan-100 via-purple-100 to-pink-100']
]);

// 2. GroceryDrawer.tsx (was Emerald, make it Purple/Fuchsia)
const groceryPath = path.join(__dirname, 'src', 'components', 'grocery', 'GroceryDrawer.tsx');
replaceInFile(groceryPath, [
  ['emerald', 'purple'],
  ['teal', 'fuchsia'],
]);

// 3. BundleLibrary.tsx (was Amber, make it Cyan/Teal)
const bundlePath = path.join(__dirname, 'src', 'components', 'library', 'BundleLibrary.tsx');
replaceInFile(bundlePath, [
  ['amber', 'cyan'],
]);

// 4. RecipeLibrary.tsx (was Rose, make it Pink/Fuchsia)
const recipePath = path.join(__dirname, 'src', 'components', 'library', 'RecipeLibrary.tsx');
replaceInFile(recipePath, [
  ['rose', 'pink'],
]);

// 5. ChefSelector.tsx (was Indigo, keep it Indigo/Purple but ensure it matches)
// It is already using indigo.

console.log("Aligned color profile to cyan/purple/pink!");
