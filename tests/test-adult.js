const {chromium} = require('playwright');
(async () => {
  const browser = await chromium.launch({headless: true, executablePath: '/home/matangk/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell'});
  const page = await browser.newPage();
  await page.goto('http://localhost:8080/math-quest.html');
  
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(500);
  
  await page.fill('#pfName', 'Test');
  await page.click('.gopt:has(input[value=f])');
  await page.click('[data-pact=save]');
  await page.waitForTimeout(300);
  
  await page.click('#menuBtn');
  await page.waitForTimeout(100);
  await page.click('#topMenu .mitem:has-text("אזור הורים")');
  await page.waitForTimeout(200);
  
  const adultVisible = await page.locator('#adultOverlay').isVisible();
  console.log('Adult overlay visible:', adultVisible);
  
  await page.fill('#adultYear', '1984');
  await page.click('#adultSubmit');
  await page.waitForTimeout(300);
  
  const error = await page.locator('#adultError').textContent();
  console.log('Error message:', error);
  
  const profilesVisible = await page.locator('#profOverlay').isVisible();
  console.log('Profiles panel visible:', profilesVisible);
  
  await browser.close();
})();
