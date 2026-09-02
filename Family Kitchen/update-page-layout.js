const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// Remove the bottom nav bar completely
const bottomNavRegex = /\{\/\* MOBILE BOTTOM NAV \*\/\}.*?<\/div>/s;
pageContent = pageContent.replace(bottomNavRegex, '');

// Add custom event listeners to page.tsx
const useEffectRegex = /useEffect\(\(\) => \{\n    checkIsHost\(\)/;
pageContent = pageContent.replace(useEffectRegex, `useEffect(() => {
    const handleNav = (e: any) => {
      if (e.detail === 'planner') setMobileTab('planner');
      if (e.detail === 'list') setMobileTab('list');
      if (e.detail === 'library') setIsMobileLibraryOpen(true);
    };
    window.addEventListener('nav-mobile-tab', handleNav);
    
    checkIsHost()`);

const cleanupRegex = /return \(\) => clearInterval\(interval\);/;
pageContent = pageContent.replace(cleanupRegex, `return () => {
      clearInterval(interval);
      window.removeEventListener('nav-mobile-tab', handleNav);
    };`);

// Make sure lg is used instead of md so the sidebars stay hidden until lg breakpoint (1024px)
// This ensures that iPads/large phones don't accidentally get the squished desktop view.
// Replace all `md:` with `lg:` in page.tsx sidebars
pageContent = pageContent.replace(/md:hidden/g, 'lg:hidden');
pageContent = pageContent.replace(/md:relative/g, 'lg:relative');
pageContent = pageContent.replace(/md:z-10/g, 'lg:z-10');
pageContent = pageContent.replace(/md:translate-x-0/g, 'lg:translate-x-0');
pageContent = pageContent.replace(/md:flex/g, 'lg:flex');
pageContent = pageContent.replace(/md:w-\[300px\]/g, 'lg:w-[300px]');

fs.writeFileSync(pagePath, pageContent);
console.log("Updated page.tsx with custom event listeners and lg breakpoints!");
