const fs = require('fs');
const path = require('path');

const navPath = path.join(__dirname, 'src', 'components', 'Navigation.tsx');
let navContent = fs.readFileSync(navPath, 'utf8');

// Add Menu to lucide-react imports
navContent = navContent.replace(/ChefHat, Lock, X/, 'ChefHat, Lock, X, Menu');

// Replace the right side of the header (where the buttons are)
const rightSideRegex = /<div>\s*\{isHost \? \([\s\S]*?<\/div>\s*<\/header>/;
navContent = navContent.replace(rightSideRegex, `<div className="flex items-center gap-4">
          <div className="hidden lg:block">
            {isHost ? (
              <button 
                onClick={() => {
                  logout().then(() => setIsHost(false));
                }}
                className="flex items-center gap-2 bg-[#F9F9F9] text-slate-800 px-3 py-1.5 rounded-xl font-bold text-xs"
              >
                <Lock className="w-3.5 h-3.5" /> Host Mode
              </button>
            ) : (
              <button 
                onClick={() => setIsHostPinModalOpen(true)}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors"
              >
                <Lock className="w-3.5 h-3.5" /> Unlock Admin
              </button>
            )}
          </div>
          
          {/* Mobile Hamburger Menu */}
          <div className="lg:hidden relative">
            <button 
              onClick={() => {
                const el = document.getElementById('mobile-dropdown');
                if (el) el.classList.toggle('hidden');
              }}
              className="p-2 bg-slate-100 rounded-xl text-slate-600"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div id="mobile-dropdown" className="hidden absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border-2 border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden z-50">
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('nav-mobile-tab', { detail: 'planner' }));
                  document.getElementById('mobile-dropdown')?.classList.add('hidden');
                }}
                className="px-4 py-3 text-left font-bold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800"
              >
                Planner
              </button>
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('nav-mobile-tab', { detail: 'library' }));
                  document.getElementById('mobile-dropdown')?.classList.add('hidden');
                }}
                className="px-4 py-3 text-left font-bold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800"
              >
                Library / Recipes
              </button>
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('nav-mobile-tab', { detail: 'list' }));
                  document.getElementById('mobile-dropdown')?.classList.add('hidden');
                }}
                className="px-4 py-3 text-left font-bold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800"
              >
                Shopping List
              </button>
              <button 
                onClick={() => {
                  document.getElementById('mobile-dropdown')?.classList.add('hidden');
                  if (isHost) {
                    logout().then(() => setIsHost(false));
                  } else {
                    setIsHostPinModalOpen(true);
                  }
                }}
                className="px-4 py-3 text-left font-bold text-sm text-[#5AA9E6] hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {isHost ? "Logout Host" : "Unlock Admin"}
              </button>
            </div>
          </div>
        </div>
      </header>`);

// Also change desktop nav breakpoint to lg
navContent = navContent.replace(/hidden sm:flex/g, 'hidden lg:flex');

fs.writeFileSync(navPath, navContent);
console.log("Updated Navigation.tsx with mobile hamburger menu!");
