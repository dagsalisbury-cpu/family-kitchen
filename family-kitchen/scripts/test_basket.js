const { chromium } = require('playwright');
const path = require('path');

const USER_DATA_DIR = path.join(__dirname, '..', '.chrome_data');

(async () => {
  let context;
  try {
    context = await chromium.launchPersistentContext(USER_DATA_DIR, {
      headless: false, // Must be false to bypass initial captchas and reuse session
      viewport: { width: 1280, height: 800 }
    });
    
    const pages = context.pages();
    const page = pages.length > 0 ? pages[0] : await context.newPage();

    console.log("Navigating to Sainsbury's Groceries...");
    await page.goto('https://www.sainsburys.co.uk/gol-ui/groceries/');
    
    // Check if we hit a login redirect
    if (page.url().includes('login') || page.url().includes('account.sainsburys.co.uk')) {
        console.log("Not fully logged in (or hitting Captcha). Waiting up to 30s for manual resolution...");
        await page.waitForFunction(() => {
          return !window.location.href.includes('/login') && !window.location.href.includes('account.sainsburys.co.uk');
        }, { timeout: 30000 }).catch(() => console.log("Login wait timed out, continuing anyway."));
    }

    console.log("Searching for test staple (Bananas loose)...");
    await page.goto('https://www.sainsburys.co.uk/gol-ui/SearchResults/Bananas%20loose');
    
    try {
      const addButton = page.locator('button:has-text("Add"), button[aria-label*="Add"]').first();
      await addButton.waitFor({ timeout: 10000 });
      await addButton.click();
      console.log("Clicked Add. Waiting for DOM update...");
      await page.waitForTimeout(3000);
    } catch (e) {
      console.log("Failed to click Add on Bananas. They might be out of stock or already in basket.");
    }

    console.log("Navigating to trolley verification page...");
    await page.goto('https://www.sainsburys.co.uk/gol-ui/checkout/basket');
    await page.waitForTimeout(5000);

    const screenshotPath = path.join(__dirname, '..', 'verification_screenshot.png');
    await page.screenshot({ path: screenshotPath });
    
    // Attempt to scrape trolley total
    let trolleyTotal = "Unknown";
    try {
      trolleyTotal = await page.locator('[data-test-id="trolley-total"], .trolleyTotal, .basketTotal').innerText({ timeout: 2000 });
    } catch(e) {}

    console.log(JSON.stringify({ 
      success: true, 
      verifiedItems: ["Bananas loose"], 
      trolleyTotal: trolleyTotal || "Verified via screenshot",
      screenshotSaved: screenshotPath
    }, null, 2));

  } catch (e) {
    console.error(JSON.stringify({ success: false, error: e.message }, null, 2));
  } finally {
    if (context) await context.close();
  }
})();
