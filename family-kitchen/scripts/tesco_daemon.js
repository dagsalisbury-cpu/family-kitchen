const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const QUEUE_FILE  = path.join(__dirname, '..', '.tesco_queue.json');
const LOG_FILE    = path.join(__dirname, '..', '.tesco_logs.txt');
const CANCEL_FILE = path.join(__dirname, '..', '.tesco_cancel.json');

function log(msg) {
  const timestamp = new Date().toLocaleTimeString();
  fs.appendFileSync(LOG_FILE, `[${timestamp}] ${msg}\n`);
}

async function dismissCookieBanner(page) {
  try {
    const cookieBtn = page.locator([
      'button:has-text("Accept all cookies")',
      'button:has-text("Accept all")',
      '#onetrust-accept-btn-handler',
      'button[id*="accept"]',
      'button:has-text("Allow all")',
      'button:has-text("Continue without changing")'
    ].join(', ')).first();

    if (await cookieBtn.isVisible({ timeout: 2500 })) {
      await cookieBtn.click({ force: true });
      log("PROGRESS: Dismissed Tesco cookie banner.");
      await page.waitForTimeout(1000);
    }
  } catch (e) {}
}

async function processJob(job) {
  // Clear any existing cancel flag at job start
  if (fs.existsSync(CANCEL_FILE)) {
    try { fs.unlinkSync(CANCEL_FILE); } catch(e){}
  }

  log('PROGRESS: Found new checkout job. Launching fresh Tesco browser session...');
  let browser;
  let cancelInterval;
  try {
    const launchOptions = {
      headless: false,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-features=Crashpad'
      ],
      ignoreDefaultArgs: ['--enable-automation']
    };

    try {
      browser = await chromium.launch(launchOptions);
    } catch (launchErr) {
      log(`ERROR: Browser launch failed: ${launchErr.message}`);
      throw launchErr;
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
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      locale: 'en-GB',
      timezoneId: 'Europe/London'
    });

    await context.addInitScript(() => {
      // Overwrite navigator.webdriver
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      // Overwrite languages
      Object.defineProperty(navigator, 'languages', { get: () => ['en-GB', 'en-US', 'en'] });
      // Add fake chrome object
      window.chrome = { runtime: {}, app: {}, csi: () => {}, loadTimes: () => {} };
      // Overwrite permissions
      const originalQuery = window.navigator.permissions ? window.navigator.permissions.query : null;
      if (originalQuery) {
        window.navigator.permissions.query = (parameters) => (
          parameters.name === 'notifications' ?
            Promise.resolve({ state: Notification.permission }) :
            originalQuery(parameters)
        );
      }
    });

    const page = await context.newPage();
    
    // 1. ORGANIC NAVIGATION (Avoids Akamai Direct Referrer Trigger)
    log(`PROGRESS: Navigating to Tesco Groceries...`);
    await page.goto('https://www.tesco.com/groceries/en-GB/', { timeout: 30000 });
    await dismissCookieBanner(page);
    await page.waitForTimeout(1500);

    log(`PROGRESS: Clicking 'Sign in' link on Tesco...`);
    const signInBtn = page.locator('a:has-text("Sign in"), button:has-text("Sign in"), [data-auto="sign-in"]').first();
    if (await signInBtn.isVisible({ timeout: 4000 })) {
      await signInBtn.click({ force: true });
      await page.waitForTimeout(2500);
    } else {
      await page.goto('https://www.tesco.com/account/login/en-GB', { timeout: 20000 });
    }
    await dismissCookieBanner(page);
    
    try {
      const emailSelector = 'input[type="email"], input[name="username"], input[id*="username"], input[id*="email"]';
      await page.waitForSelector(emailSelector, { timeout: 8000 });
      
      log('PROGRESS: Login fields detected. Entering Tesco credentials...');
      await page.fill(emailSelector, job.email);
      
      const pwdSelector = 'input[type="password"], input[name="password"], input[id*="password"]';
      await page.fill(pwdSelector, job.password || '');
      
      log('PROGRESS: Credentials entered. Submitting login...');
      await page.press(pwdSelector, 'Enter');
      
      log('PROGRESS: Waiting for login to complete... (If you see a security verification, please complete it!)');
      await page.waitForFunction(() => {
        return !document.body.innerText.includes('Sign in') && 
               !document.body.innerText.includes('Log in') && 
               !window.location.href.includes('login') &&
               !window.location.href.includes('identity.tesco.com/v2');
      }, { timeout: 60000 });
      log('PROGRESS: Successfully logged in to Tesco!');
      
    } catch (err) {
      if (page.url().includes('login') || page.url().includes('identity') || (await page.content()).includes('Sign in')) {
         log('PROGRESS: Automatic login paused. Please log in manually in the browser window.');
         log('PROGRESS: Waiting 45 seconds for manual login before continuing...');
         await page.waitForTimeout(45000);
      } else {
         log('PROGRESS: You appear to already be logged in.');
      }
    }

    await page.waitForTimeout(2000);

    // 2. STEP 1: AUTOMATIC DELIVERY SLOT BOOKING (MANDATORY GATE)
    log(`PROGRESS: [Step 1/3] Securing Tesco delivery slot...`);
    let slotBooked = false;

    try {
      // Try direct Tesco slots page first
      try {
        await page.goto('https://www.tesco.com/groceries/en-GB/slots/delivery', { timeout: 20000 });
        await page.waitForTimeout(2000);
      } catch (e) {
        try {
          await page.goto('https://www.tesco.com/groceries/en-GB/slots', { timeout: 20000 });
          await page.waitForTimeout(2000);
        } catch (err) {}
      }

      await dismissCookieBanner(page);

      // If not on slots grid, click "Book a slot" on Tesco header
      const onSlotPage = page.url().includes('/slots') || (await page.locator('[data-auto*="slot"], .slot-selector, main').count()) > 0;
      if (!onSlotPage) {
        log(`PROGRESS: Clicking 'Book a slot' button on Tesco navigation bar...`);
        const bookSlotBtn = page.locator([
          'a[href*="/slots"]',
          'button:has-text("Book a slot")',
          'a:has-text("Book a slot")',
          '[data-auto="book-a-slot"]'
        ].join(', ')).first();

        if (await bookSlotBtn.isVisible({ timeout: 6000 })) {
          await bookSlotBtn.click({ force: true });
          await page.waitForTimeout(3000);
        }
      }

      // If prompted to pick Home Delivery vs Click+Collect, click Home Delivery
      const homeDeliveryOption = page.locator([
        'button:has-text("Home delivery")',
        'a:has-text("Home delivery")',
        'button:has-text("Delivery")',
        '[data-auto="home-delivery"]'
      ].join(', ')).first();

      if (await homeDeliveryOption.isVisible({ timeout: 3000 })) {
        log(`PROGRESS: Selecting Home Delivery mode...`);
        await homeDeliveryOption.click({ force: true });
        await page.waitForTimeout(3000);
      }

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

        // Try to click target Date Tab if specified
        if (job.deliveryDate) {
          const targetDateObj = new Date(job.deliveryDate);
          const dayName = targetDateObj.toLocaleDateString('en-GB', { weekday: 'long' });
          const dayShort = targetDateObj.toLocaleDateString('en-GB', { weekday: 'short' });
          const dayNum = targetDateObj.getDate().toString();
          
          const dayTab = page.locator(`button:has-text("${dayName}"), button:has-text("${dayShort}"), [aria-label*="${dayName}"], li:has-text("${dayShort}"), [data-auto*="day"]:has-text("${dayNum}")`).first();
          if (await dayTab.isVisible({ timeout: 4000 })) {
            await dayTab.click({ force: true });
            await page.waitForTimeout(2000);
          }
        }

        const targetHour = parseHour(job.deliveryTime || job.slot || "18:00") ?? 18;

        // Locate available slot buttons across Tesco slot table
        const availableSlots = page.locator([
          'button:not([data-auto*="trolley"]):not([aria-label*="Basket"]):not([aria-label*="Trolley"]):has-text("£")',
          'button:has-text("Free")',
          '[data-auto="slot-available"]',
          'button[class*="slot"]:not([disabled])',
          'button[aria-label*=":00"]'
        ].join(', '));

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
            log(`SUCCESS: Found exact matching Tesco slot (${chosenSlotText.replace(/\n/g, ' ')}). Booking now...`);
          } else {
            log(`NOTICE: Exact slot unavailable. Found closest slot (${chosenSlotText.replace(/\n/g, ' ')}). Booking now...`);
          }

          await chosenBtn.click({ force: true });
          await page.waitForTimeout(2500);

          const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Continue"), button:has-text("Book this slot"), [data-auto="confirm-slot"]').first();
          if (await confirmBtn.isVisible({ timeout: 3000 })) {
            await confirmBtn.click({ force: true });
            await page.waitForTimeout(3000);
          }
          slotBooked = true;
          log('SUCCESS: [Step 1/3] Tesco delivery slot confirmed and secured!');
        } else {
          log('NOTICE: Automated slot click needs manual confirmation. Please click your desired slot in the browser window...');
        }
      }
    } catch (e) {
      log(`ERROR: Failed during slot booking: ${e.message}`);
    }

    // Assisted Fallback (Wait up to 25s if user clicks in the open window)
    if (!slotBooked) {
      log('PROGRESS: [Safety Net] Checking for slot reservation in open browser window (25s)...');
      for (let check = 0; check < 12; check++) {
        await page.waitForTimeout(2000);
        const bodyText = (await page.content().catch(() => "")) || "";
        const hasChangeSlot = await page.locator('button:has-text("Change slot"), a:has-text("Change slot"), [data-auto*="booked-slot"]').count();
        if (bodyText.includes('Delivery slot booked') || bodyText.includes('Slot reserved') || bodyText.includes('Your delivery slot is') || hasChangeSlot > 0) {
          slotBooked = true;
          log('SUCCESS: [Step 1/3] Tesco delivery slot verified!');
          break;
        }
      }
    }

    if (!slotBooked) {
      log('ERROR: Delivery slot could not be secured. Stopping robot before basket modification.');
      throw new Error('Delivery slot booking failed. Shopping aborted to protect your order.');
    }

    // 3. STEP 2: BASKET INSPECTION & CONSOLIDATION (MANDATORY GATE)
    log('PROGRESS: [Step 2/3] Navigating to Tesco trolley to inspect & clean basket...');
    let trolleyInspected = false;

    try {
      try {
        await page.goto('https://www.tesco.com/groceries/en-GB/trolley', { timeout: 25000 });
        await page.waitForTimeout(3000);
      } catch (e) {
        await page.goto('https://www.tesco.com/groceries/en-GB/basket', { timeout: 20000 });
        await page.waitForTimeout(3000);
      }
      await dismissCookieBanner(page);
      trolleyInspected = true;
    } catch (err) {
      log('ERROR: Unable to load Tesco trolley page.');
    }

    if (!trolleyInspected) {
      log('ERROR: Basket consolidation failed. Stopping robot before adding items.');
      throw new Error('Could not open trolley to clean basket. Shopping aborted.');
    }

    // Inspect basket items
    const getBasketItems = async () => {
      try {
        const results = await page.evaluate(() => {
          const items = [];
          const rows = document.querySelectorAll('[data-auto="trolley-item"], .trolley-item, .product-list--list-item, li[class*="product"]');
          rows.forEach(row => {
            const nameEl = row.querySelector('[data-auto="product-title"], a[href*="/products/"], h3, .product-title');
            const qtyEl = row.querySelector('input[type="number"], [data-auto="quantity-input"], input[aria-label*="quantity"], input[aria-label*="Quantity"]');
            if (nameEl) {
              const name = nameEl.innerText.trim();
              const qty = qtyEl ? parseInt(qtyEl.value || qtyEl.getAttribute('value'), 10) || 1 : 1;
              items.push({ name, qty });
            }
          });
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
        const cleanItemName = item.name.toLowerCase().replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim();
        return bName.includes(cleanItemName) || cleanItemName.includes(bName);
      });
    };

    // Clean up unmatched items in the basket first
    log('PROGRESS: Scanning Tesco basket for items not on your shopping list...');
    let processedUnmatched = true;
    while (processedUnmatched) {
      processedUnmatched = false;
      const rows = page.locator('[data-auto="trolley-item"], .trolley-item, .product-list--list-item, li[class*="product"]');
      const count = await rows.count();
      
      for (let i = 0; i < count; i++) {
        const row = rows.nth(i);
        let name = "";
        try {
          const nameEl = row.locator('[data-auto="product-title"], a[href*="/products/"], h3, .product-title').first();
          name = await nameEl.innerText({ timeout: 2000 });
        } catch (e) {}
        
        if (name) {
          const match = findMatchingBasketItem(name, job.items);
          if (!match) {
            log(`PROGRESS: Removing "${name}" from basket (not on shopping list)...`);
            const removeBtn = row.locator('button:has-text("Remove"), [aria-label*="Remove"], [data-auto="remove-button"], button:has-text("Delete")').first();
            if (await removeBtn.isVisible()) {
              await removeBtn.click({ force: true });
              await page.waitForTimeout(2000);
              processedUnmatched = true;
              break; // Refresh row locator
            }
          }
        }
      }
    }

    // Check remaining items to deduce what is already covered
    const currentBasket = await getBasketItems();
    log('PROGRESS: Remaining Tesco basket items to keep:');
    currentBasket.forEach(b => log(`  - ${b.qty}x "${b.name}"`));

    const itemsToProcess = [];
    for (const item of job.items) {
      const match = findMatchingBasketItem(item.name, currentBasket);
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

    // 4. STEP 3: SEARCH & ADD REMAINING ITEMS
    log('PROGRESS: [Step 3/3] Searching Tesco and adding missing items...');
    for (const item of itemsToProcess) {
      const cleanQuery = item.name
        .replace(/\(.*?\)/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/\b(bag of|net of|tin of|can of|pack of|box of|bunch of|loaf of)\b/gi, '')
        .trim() || item.name;

      log(`PROGRESS: Searching Tesco for "${cleanQuery}" (original: "${item.name}")...`);
      try {
        await page.goto(`https://www.tesco.com/groceries/en-GB/search?query=${encodeURIComponent(cleanQuery)}`, { timeout: 20000 });
        await page.waitForTimeout(2000);
      } catch (e) {
        log(`NOTICE: Navigation timeout for "${cleanQuery}". You may need to add this manually.`);
        continue;
      }

      await dismissCookieBanner(page);
      
      try {
        let currentQty = 0;
        
        try {
          const qtyInput = page.locator('input[type="number"], [data-auto="quantity-input"], input[aria-label*="quantity"]').first();
          if (await qtyInput.isVisible({ timeout: 2000 })) {
            const val = await qtyInput.inputValue();
            currentQty = parseInt(val, 10) || 0;
          }
        } catch (e) {}

        if (currentQty >= item.quantity) {
          log(`PROGRESS: Item "${item.name}" already has ${currentQty} in basket. Skipping.`);
          continue;
        }

        const amountToAdd = item.quantity - currentQty;
        log(`PROGRESS: Need ${item.quantity} of "${item.name}". Adding ${amountToAdd}...`);

        if (currentQty === 0) {
          const addButton = page.locator([
            'button:has-text("Add")',
            '[data-auto="add-button"]',
            'button[aria-label*="Add"]',
            'form[action*="trolley"] button'
          ].join(', ')).first();

          await addButton.waitFor({ timeout: 6000 });
          await addButton.click({ timeout: 5000, force: true });
          await page.waitForTimeout(1500);

          if (amountToAdd > 1) {
            const plusButton = page.locator('button:has-text("+"), [aria-label*="Increase"], [data-auto="increase-quantity"]').first();
            for(let i = 0; i < amountToAdd - 1; i++) {
              await plusButton.click({ timeout: 3000, force: true }).catch(() => {});
              await page.waitForTimeout(500);
            }
          }
        } else {
          const plusButton = page.locator('button:has-text("+"), [aria-label*="Increase"], [data-auto="increase-quantity"]').first();
          for(let i = 0; i < amountToAdd; i++) {
            await plusButton.click({ timeout: 3000, force: true }).catch(() => {});
            await page.waitForTimeout(500);
          }
        }

        log(`PROGRESS: VERIFIED: Successfully added ${amountToAdd}x "${item.name}" to Tesco basket.`);
      } catch (err) {
        log(`NOTICE: Skipped "${item.name}" (might be out of stock or requires manual selection).`);
      }
    }

    log('SUCCESS: Finished adding all items to your Tesco basket!');
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
    log('NOTICE: Robot stopped.');
  }
}

async function watchQueue() {
  // Ensure queue file exists
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
        fs.writeFileSync(QUEUE_FILE, ''); // clear queue so it isn't re-processed
        await processJob(job);
        processing = false;
      }
    } catch (err) {
      if (err.name !== 'SyntaxError') {
        log(`ERROR: Queue error: ${err.message}`);
      }
      processing = false;
    }
  }, 1000);
}

watchQueue();

