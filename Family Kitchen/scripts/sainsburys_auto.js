const { chromium } = require('playwright');

async function runSainsburys() {
  const email = process.env.SAINSBURYS_EMAIL;
  const password = process.env.SAINSBURYS_PASSWORD;
  const itemsJson = process.env.ITEMS_JSON;
  
  if (!itemsJson) {
    console.log("ERROR: No items provided.");
    return;
  }

  const items = JSON.parse(itemsJson);
  
  console.log("PROGRESS: Launching browser...");
  // Launch visibly so user can intervene if Sainsbury's blocks the login
  // We use the system 'chrome' channel and disable crash reporters to avoid macOS Sandbox/Mach port permission errors
  const browser = await chromium.launch({ 
    headless: false,
    channel: 'chrome',
    args: ['--disable-crash-reporter', '--no-crash-upload']
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("PROGRESS: Navigating to Sainsbury's login...");
    await page.goto('https://www.sainsburys.co.uk/gol-ui/login');

    console.log("PROGRESS: Attempting to log in automatically...");
    
    // Wait for the cookie consent and accept if present
    try {
      const cookieBtn = await page.waitForSelector('button#onetrust-accept-btn-handler', { timeout: 3000 });
      if (cookieBtn) await cookieBtn.click();
    } catch (e) {
      // Ignore if no cookie banner
    }

    // Try to fill in login credentials
    try {
      await page.fill('[name="email"]', email);
      await page.fill('[name="password"]', password);
      await page.click('button[type="submit"]');
      console.log("PROGRESS: Credentials submitted. Waiting for login to process...");
      await page.waitForNavigation({ timeout: 15000 }).catch(() => {});
    } catch (e) {
      console.log("PROGRESS: Automatic login fields not found or blocked. Please log in manually in the browser window.");
    }

    console.log("PROGRESS: Waiting to detect main shopping page...");
    // Wait until the user is on a page that allows searching
    try {
      await page.waitForSelector('input[data-testid="search-input"], input#term', { timeout: 60000 }); // Wait up to 1 min for manual intervention
      console.log("PROGRESS: Successfully logged in and on the shopping page!");
    } catch (e) {
      console.log("ERROR: Timed out waiting for login/slot booking. Please try again.");
      await browser.close();
      return;
    }

    console.log("PROGRESS: Starting to add items to your basket...");
    
    // Iterate over items and add them
    let addedCount = 0;
    for (const item of items) {
      console.log(`PROGRESS: Searching for ${item.name}...`);
      try {
        const searchInput = await page.$('input[data-testid="search-input"], input#term');
        if (searchInput) {
          await searchInput.fill('');
          await searchInput.fill(item.name);
          await searchInput.press('Enter');
          
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(1500);
          
          // Find the first "Add" button
          const addButton = await page.$('button:has-text("Add")');
          if (addButton) {
            await addButton.click();
            console.log(`PROGRESS: + Added ${item.quantity} ${item.unit} of ${item.name}`);
            addedCount++;
            await page.waitForTimeout(2000); 
          } else {
            console.log(`PROGRESS: - Could not find an 'Add' button for ${item.name}.`);
          }
        }
      } catch (e) {
        console.log(`PROGRESS: Error with ${item.name}: ${e.message}`);
      }
    }

    console.log(`SUCCESS: Finished! Added ${addedCount} of ${items.length} items to the basket.`);
    console.log("PROGRESS: The browser will remain open so you can review your basket and checkout manually.");
    
    await browser.disconnect();

  } catch (error) {
    console.log(`ERROR: Fatal automation error: ${error.message}`);
    await browser.close();
  }
}

runSainsburys().catch(e => console.log(`ERROR: ${e.message}`));
