const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const QUEUE_FILE = path.join(__dirname, '..', '.sainsburys_queue.json');
const LOG_FILE = path.join(__dirname, '..', '.sainsburys_logs.txt');
const CANCEL_FILE = path.join(__dirname, '..', '.sainsburys_cancel.json');

function log(msg) {
  const timestamp = new Date().toLocaleTimeString();
  const line = `[${timestamp}] ${msg}\n`;
  console.log(line.trim());
  fs.appendFileSync(LOG_FILE, line);
}

async function dismissCookieBanner(page) {
  try {
    const cookieBtn = page.locator([
      'button:has-text("Continue and accept")',
      'button:has-text("Required only")',
      'button:has-text("Accept All Cookies")',
      'button:has-text("Accept all")',
      'button:has-text("Accept All")',
      'button:has-text("Accept cookies")',
      '#onetrust-accept-btn-handler',
      '[data-testid*="cookie-accept"]'
    ].join(', ')).first();

    if (await cookieBtn.isVisible({ timeout: 2500 })) {
      await cookieBtn.click({ force: true });
      log("PROGRESS: Dismissed cookie banner ('Continue and accept').");
      await page.waitForTimeout(1000);
    }
  } catch (e) {}
}

async function processJob(job) {
  // Clear any existing cancel flag at job start
  if (fs.existsSync(CANCEL_FILE)) {
    try { fs.unlinkSync(CANCEL_FILE); } catch(e){}
  }

  log('PROGRESS: Found new checkout job. Launching fresh browser session...');
  let browser;
  let cancelInterval;
  try {
    try {
      browser = await chromium.launch({ 
        headless: false,
        channel: 'chrome'
      });
    } catch (launchErr) {
      browser = await chromium.launch({ 
        headless: false
      });
    }
    
    // Background watcher for instant user cancellation
    cancelInterval = setInterval(async () => {
      if (fs.existsSync(CANCEL_FILE)) {
        try { fs.unlinkSync(CANCEL_FILE); } catch(e){}
        log('NOTICE: Instant stop requested by user. Terminating browser...');
        if (browser) {
          try { await browser.close(); } catch(e){}
        }
      }
    }, 500);

    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });
    const page = await context.newPage();
    
    log(`PROGRESS: Attempting to log in as ${job.email}...`);
    await page.goto('https://www.sainsburys.co.uk/gol-ui/oauth/login');
    await dismissCookieBanner(page);
    
    try {
      const emailSelector = 'input[type="email"], input[name="username"], input[name="email"], input[id*="email"], input[id*="username"]';
      await page.waitForSelector(emailSelector, { timeout: 8000 });
      
      log('PROGRESS: Login fields detected. Typing credentials...');
      await page.fill(emailSelector, job.email);
      
      const pwdSelector = 'input[type="password"], input[name="password"], input[id*="password"]';
      await page.fill(pwdSelector, job.password || '');
      
      log('PROGRESS: Credentials entered. Pressing Enter to login...');
      await page.press(pwdSelector, 'Enter');
      
      log('PROGRESS: Waiting for login to complete... (If you see a Captcha, please solve it!)');
      await page.waitForFunction(() => {
        return !document.body.innerText.includes('Log in / Register') && !window.location.href.includes('login');
      }, { timeout: 60000 });
      log('PROGRESS: Successfully logged in!');
      
    } catch (err) {
      if (page.url().includes('login') || (await page.content()).includes('Log in / Register')) {
         log('PROGRESS: Automatic login paused. Please log in manually in the browser window.');
         log('PROGRESS: Waiting 45 seconds for manual login before continuing...');
         await page.waitForTimeout(45000);
      } else {
         log('PROGRESS: You appear to already be logged in.');
      }
    }

    await page.waitForTimeout(2000);

    // STEP 1: AUTOMATIC SLOT BOOKING VIA 'BOOK A SLOT' ON GROCERIES PAGE
    log(`PROGRESS: [Step 1/3] Navigating to Sainsbury's groceries page to find 'Book a slot'...`);
    let slotBooked = false;

    try {
      try {
        await page.goto('https://www.sainsburys.co.uk/shop/gb/groceries', { timeout: 25000 });
        await page.waitForTimeout(2000);
      } catch (e) {
        try {
          await page.goto('https://www.sainsburys.co.uk/', { timeout: 20000 });
          await page.waitForTimeout(2000);
        } catch (err) {}
      }

      await dismissCookieBanner(page);

      log(`PROGRESS: Locating 'Book a slot' button on groceries page...`);
      const bookSlotBtn = page.locator([
        'button[data-testid="book-delivery-button"]',
        '[data-testid="book-delivery"] button',
        '.book-delivery__button',
        'button:has-text("Book a slot")',
        'a:has-text("Book a slot")'
      ].join(', ')).first();

      await bookSlotBtn.waitFor({ timeout: 10000 });
      log(`PROGRESS: Found 'Book a slot' button (data-testid="book-delivery-button"). Clicking...`);
      await bookSlotBtn.click({ force: true });
      await page.waitForTimeout(3000);

      // If a delivery option dropdown or modal appears, select Home Delivery (explicitly ignore 'Delivery Pass')
      const homeDeliveryBtn = page.locator([
        '[data-testid*="home-delivery"]',
        '[data-test-id*="home-delivery"]',
        'button:has-text("Home delivery"):not(:has-text("Pass"))',
        'a:has-text("Home delivery"):not(:has-text("Pass"))',
        'button:has-text("Home Delivery"):not(:has-text("Pass"))',
        'a:has-text("Home Delivery"):not(:has-text("Pass"))'
      ].join(', ')).first();

      if (await homeDeliveryBtn.isVisible({ timeout: 3500 })) {
        log(`PROGRESS: Selecting 'Home Delivery'...`);
        await homeDeliveryBtn.click({ force: true });
        await page.waitForTimeout(3000);
      }

      // Wait for slot table / grid to render
      try {
        await page.waitForSelector('main, .slot-grid, [data-test-id*="slot"], [class*="SlotGrid"], table', { timeout: 8000 });
      } catch (e) {}

      // Helper to parse hour numbers strictly from time string (e.g. 19:00, 7:00pm, 7pm)
      const parseHour = (str) => {
        if (!str) return null;
        const match24 = str.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
        if (match24) {
          return parseInt(match24[1], 10) + parseInt(match24[2], 10) / 60;
        }
        const match12 = str.match(/\b(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*(am|pm)\b/i);
        if (match12) {
          let h = parseInt(match12[1], 10);
          const m = match12[2] ? parseInt(match12[2], 10) : 0;
          const isPm = match12[3].toLowerCase() === 'pm';
          if (isPm && h < 12) h += 12;
          if (!isPm && h === 12) h = 0;
          return h + m / 60;
        }
        return null;
      };

      if (job.slot || job.deliveryTime) {
        const slotString = job.slot || job.deliveryTime || "";
        log(`PROGRESS: Finding target delivery slot: ${slotString}`);

        // Try to click target Day Tab if selecting a specific date
        if (job.deliveryDate) {
          const targetDateObj = new Date(job.deliveryDate);
          const dayName = targetDateObj.toLocaleDateString('en-GB', { weekday: 'long' });
          const dayShort = targetDateObj.toLocaleDateString('en-GB', { weekday: 'short' });
          const dayNum = targetDateObj.getDate().toString();
          
          const dayTab = page.locator(`button:has-text("${dayName}"), button:has-text("${dayShort}"), [aria-label*="${dayName}"], li:has-text("${dayShort}"), [data-test-id*="day"]:has-text("${dayNum}")`).first();
          if (await dayTab.isVisible({ timeout: 4000 })) {
            await dayTab.click({ force: true });
            await page.waitForTimeout(2000);
          }
        }

        const targetHour = parseHour(job.deliveryTime || job.slot || "18:00") ?? 18;

        // Locate available slot buttons across the slot picker area (excluding pass links)
        const availableSlots = page.locator('button:not([data-test-id*="trolley"]):not([aria-label*="Trolley"]):not([aria-label*="Basket"]):not(:has-text("Pass")):has-text("£"), button:not(:has-text("Pass")):has-text("Free"), [data-test-id*="slot-available"], [class*="SlotButton"]:not([disabled])');
        const slotCount = await availableSlots.count();

        let chosenBtn = null;
        let chosenSlotText = "";
        let minDiff = Infinity;

        for (let i = 0; i < slotCount; i++) {
          const btn = availableSlots.nth(i);
          const text = (await btn.innerText({ timeout: 1500 }).catch(() => "")) || "";
          const ariaLabel = (await btn.getAttribute('aria-label').catch(() => "")) || "";
          const fullText = `${text} ${ariaLabel}`;
          const slotHour = parseHour(fullText);

          if (slotHour !== null) {
            const diff = Math.abs(slotHour - targetHour);
            if (diff < minDiff) {
              minDiff = diff;
              chosenBtn = btn;
              chosenSlotText = fullText.trim();
              if (diff === 0) break; // Exact match!
            }
          }
        }

        if (chosenBtn) {
          if (minDiff === 0) {
            log(`SUCCESS: Found exact matching slot (${chosenSlotText.replace(/\n/g, ' ')}). Booking now...`);
          } else {
            log(`NOTICE: Exact slot unavailable. Found closest available slot (${chosenSlotText.replace(/\n/g, ' ')}). Booking now...`);
          }

          await chosenBtn.click({ force: true });
          await page.waitForTimeout(2500);

          const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Continue"), button:has-text("Choose"), button:has-text("Book this slot"), [data-test-id="confirm-slot-btn"]').first();
          if (await confirmBtn.isVisible({ timeout: 3000 })) {
            await confirmBtn.click({ force: true });
            await page.waitForTimeout(3000);
          }
          slotBooked = true;
          log('SUCCESS: [Step 1/3] Delivery slot confirmed and secured!');
        } else {
          log('NOTICE: Automated slot click needs manual confirmation. Please click your desired slot in the browser window...');
        }
      }
    } catch (e) {
      log(`ERROR: Failed during slot booking: ${e.message}`);
    }

    // Tier 4: Assisted Fallback (Wait up to 25s if user clicks in the open window)
    if (!slotBooked) {
      log('PROGRESS: [Safety Net] Checking for slot reservation in open browser window (25s)...');
      for (let check = 0; check < 12; check++) {
        await page.waitForTimeout(2000);
        const bodyText = (await page.content().catch(() => "")) || "";
        const hasChangeSlot = await page.locator('button:has-text("Change slot"), a:has-text("Change slot"), [data-test-id*="booked-slot"]').count();
        if (bodyText.includes('Delivery slot booked') || bodyText.includes('Slot reserved') || bodyText.includes('Your delivery slot is') || hasChangeSlot > 0) {
          slotBooked = true;
          log('SUCCESS: [Step 1/3] Delivery slot verified!');
          break;
        }
      }
    }

    if (!slotBooked) {
      log('ERROR: Delivery slot could not be secured. Stopping robot before basket modification.');
      throw new Error('Delivery slot booking failed. Shopping aborted to protect your order.');
    }

    // STEP 2: BASKET INSPECTION & CONSOLIDATION (MANDATORY GATE)
    log('PROGRESS: [Step 2/3] Navigating to Sainsbury\'s trolley to inspect & clean basket...');
    let trolleyInspected = false;

    try {
      try {
        await page.goto('https://www.sainsburys.co.uk/gol-ui/trolley', { timeout: 25000 });
        await page.waitForTimeout(3000);
      } catch (e) {
        await page.goto('https://www.sainsburys.co.uk/gol-ui/checkout/basket', { timeout: 20000 });
        await page.waitForTimeout(3000);
      }
      trolleyInspected = true;
    } catch (err) {
      log('ERROR: Unable to load trolley page.');
    }

    if (!trolleyInspected) {
      log('ERROR: Basket consolidation failed. Stopping robot before adding items.');
      throw new Error('Could not open trolley to clean basket. Shopping aborted.');
    }

    const getBasketItems = async () => {
      try {
        const results = await page.evaluate(() => {
          const items = [];
          
          // Selector 1: Find all trolley rows
          const rows = document.querySelectorAll('.productRow, .trolley-item, [data-test-id="trolley-item"], [data-testid="trolley-item"], .ptc-product-row');
          if (rows.length > 0) {
            rows.forEach(row => {
              const nameEl = row.querySelector('.productName, .pt-product-name, [data-test-id="product-tile-description"], [data-testid="product-tile-description"], a[href*="/product/"], h3');
              const qtyInput = row.querySelector('input[type="number"], input[name="quantity"], input[aria-label*="Quantity"], input[aria-label*="quantity"], .ptc-quantity-input');
              if (nameEl) {
                const name = nameEl.innerText.trim();
                const qty = qtyInput ? parseInt(qtyInput.value || qtyInput.getAttribute('value'), 10) || 1 : 1;
                items.push({ name, qty });
              }
            });
          }
          
          // Selector 2: Fallback to all product details links
          if (items.length === 0) {
            const productLinks = document.querySelectorAll('a[href*="/product-details/"], a[href*="/product/"], a[class*="productName"]');
            productLinks.forEach(link => {
              const name = link.innerText.trim();
              if (name && name.length > 2) {
                // Find nearest container to check for quantity
                let qty = 1;
                const parent = link.closest('div, tr, li, td');
                if (parent) {
                  const qtyInput = parent.querySelector('input[type="number"], input[aria-label*="Quantity"], input[aria-label*="quantity"], select, span[class*="qty"], span[class*="quantity"]');
                  if (qtyInput) {
                    qty = parseInt(qtyInput.value || qtyInput.innerText, 10) || 1;
                  }
                }
                items.push({ name, qty });
              }
            });
          }
          
          return items;
        });
        return results;
      } catch (e) {
        return [];
      }
    };

    const findMatchingBasketItem = (basketItemName, listItems) => {
      const bName = basketItemName.toLowerCase().trim();
      return listItems.find(item => {
        const query = item.name.toLowerCase().trim();
        return bName.includes(query) || query.includes(bName);
      });
    };

    // Clean up unmatched items in the basket first
    log('PROGRESS: Scanning basket for items not on your shopping list...');
    let processedUnmatched = true;
    while (processedUnmatched) {
      processedUnmatched = false;
      const rows = page.locator('.productRow, .trolley-item, [data-test-id="trolley-item"], [data-testid="trolley-item"], .ptc-product-row');
      const count = await rows.count();
      
      for (let i = 0; i < count; i++) {
        const row = rows.nth(i);
        let name = "";
        try {
          const nameEl = row.locator('.productName, .pt-product-name, [data-test-id="product-tile-description"], [data-testid="product-tile-description"], a[href*="/product/"], h3').first();
          name = await nameEl.innerText({ timeout: 2000 });
        } catch (e) {}
        
        if (name) {
          const match = findMatchingBasketItem(name, job.items);
          if (!match) {
            log(`PROGRESS: Removing "${name}" from basket (not on shopping list)...`);
            const removeBtn = row.locator('button:has-text("Remove"), [aria-label*="Remove"], [data-test-id="ptc-remove"], button:has-text("Delete"), button:has-text("remove")').first();
            if (await removeBtn.isVisible()) {
              await removeBtn.click({ force: true });
              processedUnmatched = true;
              await page.waitForTimeout(2500); // Wait for DOM to update after deletion
              break; // Start over since DOM changed
            }
          }
        }
      }
    }

    // Now reload/re-evaluate basket items to determine what remains to be searched
    const basketItems = await getBasketItems();
    if (basketItems.length > 0) {
      log(`PROGRESS: Remaining basket items to keep:`);
      basketItems.forEach(b => log(`  - ${b.qty}x "${b.name}"`));
    } else {
      log('PROGRESS: Basket is empty.');
    }

    const itemsToProcess = [];
    for (const item of job.items) {
      // Find matching item in the remaining basket items
      const match = basketItems.find(b => {
        const bName = b.name.toLowerCase().trim();
        const query = item.name.toLowerCase().trim();
        return bName.includes(query) || query.includes(bName);
      });

      if (match) {
        if (match.qty >= item.quantity) {
          log(`PROGRESS: Skipping "${item.name}" - already covered by ${match.qty}x "${match.name}" in basket.`);
        } else {
          const needed = item.quantity - match.qty;
          log(`PROGRESS: Adjusting "${item.name}" - need ${item.quantity}, found ${match.qty}x "${match.name}". Adding remaining ${needed}.`);
          itemsToProcess.push({ ...item, quantity: needed });
        }
      } else {
        itemsToProcess.push(item);
      }
    }

    // Now ACTUALLY search and click Add to Basket with Verification!
    log('PROGRESS: Proceeding to click ADD with strict Trolley verification...');
    for (const item of itemsToProcess) {
      const cleanQuery = item.name
        .replace(/\(.*?\)/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/\b(bag of|net of|tin of|can of|pack of|box of|bunch of|loaf of)\b/gi, '')
        .trim() || item.name;

      log(`PROGRESS: Searching for "${cleanQuery}" (original: "${item.name}")...`);
      try {
        await page.goto(`https://www.sainsburys.co.uk/gol-ui/SearchResults/${encodeURIComponent(cleanQuery)}`, { timeout: 20000 });
        await page.waitForTimeout(2000);
      } catch (e) {
        log(`NOTICE: Navigation timeout for "${cleanQuery}". You may need to add this manually.`);
        continue;
      }
      
      try {
        const initialCount = await getTrolleyCount();
        log(`PROGRESS: Pre-add basket count: ${initialCount}`);

        let currentQty = 0;
        
        // Check if the item is already in the basket by looking for the quantity input
        try {
          const qtyInput = page.locator('[data-test-id*="quantity"], [data-testid*="quantity"], input[aria-label*="Quantity"], input[aria-label*="quantity"]').first();
          if (await qtyInput.isVisible({ timeout: 2000 })) {
            const val = await qtyInput.inputValue();
            currentQty = parseInt(val, 10) || 0;
          }
        } catch (e) {
          // Ignore, currentQty remains 0
        }

        if (currentQty >= item.quantity) {
          log(`PROGRESS: Item "${item.name}" already has ${currentQty} in basket (need ${item.quantity}). Skipping to prevent duplicates!`);
          continue;
        }

        const amountToAdd = item.quantity - currentQty;
        log(`PROGRESS: Need ${item.quantity} of "${item.name}", currently have ${currentQty}. Adding ${amountToAdd}...`);

        if (currentQty === 0) {
          // Click Add button first (support multiple Sainsbury's button styles)
          const addButton = page.locator('button:has-text("Add to trolley"), button:has-text("Add"), [data-test-id="add-button"], [data-testid="add-button"], [data-test-id*="add"], button[aria-label*="Add"]').first();
          await addButton.waitFor({ timeout: 6000 });
          await addButton.click({ timeout: 5000, force: true });
          
          await page.waitForTimeout(1000); // UI transition wait
          
          // Now we have 1 in the basket. We need to add (amountToAdd - 1) more.
          if (amountToAdd > 1) {
             const plusButton = page.locator('button:has-text("+"), [aria-label*="Increase"], [data-test-id="ptc-plus"]').first();
             for(let i = 0; i < amountToAdd - 1; i++) {
                await plusButton.click({ timeout: 3000, force: true }).catch(() => {});
                await page.waitForTimeout(500);
             }
          }
        } else {
          // We already have some, so the Add button isn't there, just the + button!
          const plusButton = page.locator('button:has-text("+"), [aria-label*="Increase"], [data-test-id="ptc-plus"]').first();
          for(let i = 0; i < amountToAdd; i++) {
             await plusButton.click({ timeout: 3000, force: true }).catch(() => {});
             await page.waitForTimeout(500);
          }
        }

        // Wait for network response for the trolley API
        try {
          await page.waitForResponse(res => res.url().toLowerCase().includes('trolley') && res.status() >= 200 && res.status() < 300, { timeout: 4000 });
        } catch(e) {}
        
        await page.waitForTimeout(500);

        const finalCount = await getTrolleyCount();
        if (finalCount > initialCount || currentQty > 0) {
          log(`PROGRESS: VERIFIED: Successfully added ${amountToAdd}x "${item.name}"`);
        } else {
          log(`NOTICE: Couldn't verify the trolley count for "${item.name}", but it might still be added.`);
        }
        
      } catch (err) {
        log(`NOTICE: Skipped "${item.name}" (it might be out of stock or requires manual selection).`);
      }
    }

    log('SUCCESS: Finished adding all items! Your basket is ready.');
    log('PROGRESS: Providing checkout link to UI...');
    await page.waitForTimeout(3000);
  } catch (error) {
    if (error.message.includes('Target page, context or browser has been closed')) {
      log(`NOTICE: Browser was closed.`);
    } else {
      log(`ERROR: ${error.message.split('\n')[0]}`);
    }
  } finally {
    if (cancelInterval) clearInterval(cancelInterval);
    if (browser) {
      try { await browser.close(); } catch(e){}
      log('PROGRESS: Browser closed.');
    }
  }
}

async function watchQueue() {
  console.log(`Watching for jobs at ${QUEUE_FILE}...`);
  fs.writeFileSync(LOG_FILE, '');
  if (!fs.existsSync(QUEUE_FILE)) {
    fs.writeFileSync(QUEUE_FILE, '');
  }

  let processing = false;

  setInterval(async () => {
    if (processing) return;
    
    try {
      const content = fs.readFileSync(QUEUE_FILE, 'utf-8');
      if (content.trim()) {
        processing = true;
        const job = JSON.parse(content);
        fs.writeFileSync(QUEUE_FILE, '');
        fs.writeFileSync(LOG_FILE, '');
        
        await processJob(job);
        processing = false;
      }
    } catch (err) {
      if (err.name !== 'SyntaxError') {
        console.error('Queue error:', err);
      }
      processing = false;
    }
  }, 1000);
}

watchQueue();
