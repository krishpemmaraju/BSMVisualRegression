import test, { chromium, expect, firefox } from "@playwright/test"
import { TIMEOUT } from "dns/promises";
import * as path from 'path';
import * as fs from 'fs';

let page;

test.beforeAll("Open the Order Capture URL", async () => {
  const browser = await firefox.launch({
  });
  const context = await browser.newContext({
    storageState: undefined
  });
  page = await context.newPage();

  await page.goto("https://vb04.wolseleyuk.com/ic/builder/rt/wol-order-capture/live/webApps/wol-order-capture/vp/");
  await page.getByRole('button').filter({ hasText: 'SSO' }).click();
  await page.getByPlaceholder('first.last@domain.com').fill(Buffer.from('a3Jpc2huYS5wZW1tYXJhanVAd29sc2VsZXkuY28udWs=','base64').toString('utf-8'));
  await page.locator("input[value='Next']").click();
  await page.getByPlaceholder('Password').fill(Buffer.from('VmFyYWhpYmFiYTE2JA==','base64').toString('utf-8'));
  await page.locator("input[value='Sign in']").click();
  // await page.pause()
  // await page.locator("input[value='Yes']").waitFor({ state: 'visible', timeout: 10000 })
  await page.locator("input[value='Yes']").click({force: true});
  await page.getByRole('heading').filter({ hasText: 'Order Capture' }).waitFor({ state: 'visible', timeout: 10000 })
})

test("Order Capture - Full Page Screenshot", async () => {
  await expect(page).toHaveScreenshot(["OrderCapture", "OrderCaptureFullScreenshot.png"], { fullPage: true });
})

test("Validate Order Capture Header Text", async () => {
  expect(await page.locator("#ojHeader_pageTitle").textContent()).toMatchSnapshot(["OrderCapture/HeaderTexts", "OrderCapturePageHeader.txt"]);
  expect(await page.locator("#ojHeader_pageSubtitle").textContent()).toMatchSnapshot(["OrderCapture/HeaderTexts", "OrderCapturePageSubHeader.txt"]);
})

test("Validate Product search input is present", async () => {
  const getSearchBarElement = page.getByRole('textbox', { name: 'Product Search' })
  await expect(getSearchBarElement).toHaveAttribute('aria-label', 'Product Search')
})

test("Validate Submit button", async () => {
  const submitButton = page.locator("button[aria-label='Submit']");
  await expect(submitButton).toHaveScreenshot(["OrderCapture/SubmitButton", "SubmitBtnOnOrderCapturePage.png"])
})

test("Validate Product List slot", async () => {
  await page.locator("input[aria-label='Product Search']").waitFor({timeout:5000})
    await page.locator("input[aria-label='Product Search']").fill("219500")
    const productSearchSlot = page.getByRole('gridcell').filter({ has: page.locator("wol-product-card") , timeout: 25000})
    await expect(productSearchSlot).toBeVisible()
    await expect(productSearchSlot).toHaveScreenshot(["OrderCapture/ProductListSlotSection", "ProductListContentSlotSection.png"], { maxDiffPixels: 100, maxDiffPixelRatio: 0.02 })
})

test("Validate filter buttons on Order Capture Page", async () => {
  const getSearchBarElement = page.getByRole('textbox', { name: 'Product Search' })
  await getSearchBarElement.click();
  const gridView = page.locator("span[role='toolbar']").filter({ has: page.getByLabel('Grid View') })
  await expect(gridView).toHaveScreenshot(["OrderCapture/ContentSlotSection", "GridViewButtonOnContentSlotSection.png"])
})

test("Validate Select Customer section info Slot", async () => {
  const customerTextAvailable = page.locator("span[title='Customer']");
  const selectCustomerText = page.locator("div[title='Select Customer...']");
  const clickToSelectCustomer = page.locator("span[title='Click to select a customer']");
  const customerContentSlotSelection = page.locator("oj-sp-scoreboard-metric-card[card-title='Customer']");
  const searchInputAvailableAfterClickCustomer = page.locator("oj-sp-general-drawer-template[drawer-title='Customer Details']");
  const getTextOfCustomerDetailsSection = page.locator("div[title='Customer Details']")
  const customerSearchInputAvailable = page.locator("input[aria-label='Customer Search']");
  const customerSearchResultsAvailable = page.locator('oj-c-list-view.customer-list');
  const selectCustomerListed = page.getByText('SMITH AND BYFORD LTD')
  const isSelectedCustomerVisible = page.locator("div[title='SMITH AND BYFORD LTD']")

  await expect(customerContentSlotSelection).toBeEnabled();
  await expect(customerContentSlotSelection).toHaveScreenshot(["OrderCapture/CustomerContentSlot", "CustomerContentSlotClickable.png"])
  await expect(customerTextAvailable).toHaveText("Customer")
  await expect(selectCustomerText).toHaveText("Select Customer...")
  await expect(clickToSelectCustomer).toHaveText("Click to select a customer")
  await customerContentSlotSelection.click()
  await expect(searchInputAvailableAfterClickCustomer).toHaveScreenshot(["OrderCapture/CustomerContentSlot", "CustomerDetailsPanel.png"])
  await expect(getTextOfCustomerDetailsSection).toHaveText('Customer Details');
  await expect(customerSearchInputAvailable).toBeVisible({timeout:10000});
  await expect(customerSearchInputAvailable).toBeEnabled();
  await customerSearchInputAvailable.fill('SMITH AND BYFORD LTD')
  await expect(customerSearchResultsAvailable).toBeVisible({timeout: 20000});
  await selectCustomerListed.click();
  await expect(isSelectedCustomerVisible).toBeVisible();
})

test("Validate Account Status Section", async () => {
    const isAccountStatusVisible = page.locator("oj-sp-scoreboard-metric-card[card-title='Account Status']");
    const isAccountStatusPanelAvailable = page.locator("oj-sp-general-drawer-template[drawer-title='Account Status']");
    const isAccoutnStatusHeadingAvailable = page.locator("div[title='Account Status']")


    await expect(isAccountStatusVisible).toBeVisible();
    await isAccountStatusVisible.click();
    await expect(isAccountStatusPanelAvailable).toBeVisible();
    await expect(isAccoutnStatusHeadingAvailable).toHaveText('Account Status');
    await page.locator("button[aria-label='Close']").scrollIntoViewIfNeeded();
    await page.locator("button[aria-label='Close']").click({force: true});
})

test("Validate Available Balance Section", async() => {
    const isAvailableBalanceVisible = page.locator("oj-sp-scoreboard-metric-card[card-title='Available Balance']");
    const isAvailableBalancePanelAvailable = page.locator("oj-sp-general-drawer-template[drawer-title='Transaction History']");
    const isAvailableBalanceHeadingAvailable = page.locator("div[title='Transaction History']")
    const closeBtn = page.locator("button[aria-label='Close']")

    await expect(isAvailableBalanceVisible).toBeVisible();
    await isAvailableBalanceVisible.click()
    await expect(isAvailableBalancePanelAvailable).toBeVisible();
    await expect(isAvailableBalanceHeadingAvailable).toHaveText('Transaction History')
    await closeBtn.scrollIntoViewIfNeeded();
    await closeBtn.click({force: true});
})

test("Validate Required Section", async() => {
        const isRequiredVisible = page.locator("oj-sp-scoreboard-metric-card[card-title='Required']");
        
        await expect(isRequiredVisible).toBeVisible();
})


test("Validate Customer PO section info Slot", async () => {
  const customerPOTextAvailable = page.locator("span[title='Customer PO #']");
  const customerPOContentSlotSelection = page.locator("oj-sp-scoreboard-metric-card[card-title='Customer PO #']");
  const customerPOPanelAvailable =  page.locator("oj-sp-general-drawer-template[drawer-title='Order Details']");
  const isCustomerPOHeadingAvailable = page.locator("div[title='Order Details']")
  const customerOrderInputTextAvailable = page.getByLabel("Customer Order Number")
  const isCustomerOrderNumberTextBoxAvailable = page.locator("oj-c-input-text[label-hint='Customer Order Number'] input");
  const isCancelBtnAvailableUnderCustPOSection = page.getByRole('button', {name:'Cancel'})
  const isContinueBtnAvailableUnderCustPOSection = page.getByRole('button', {name:'Continue'})
  const closeBtn = page.locator("button[aria-label='Close']")

  await expect(customerPOTextAvailable).toHaveText("Customer PO #")
  await expect(customerPOContentSlotSelection).toBeEnabled();
  await expect(customerPOContentSlotSelection).toHaveScreenshot(["OrderCapture/CustomerPOContentSlot", "CustomerPOContentSlotClickable.png"])
  await customerPOContentSlotSelection.click();
  await expect(customerPOPanelAvailable).toBeVisible()
  expect(await isCustomerPOHeadingAvailable.textContent()).toContain("Order Details")
  await expect(customerOrderInputTextAvailable).toBeVisible();
  await expect(isCustomerOrderNumberTextBoxAvailable).toBeVisible();
  await expect(isCustomerOrderNumberTextBoxAvailable).toBeEnabled();
  await expect(isCancelBtnAvailableUnderCustPOSection).toBeVisible();
  await expect(isCancelBtnAvailableUnderCustPOSection).toBeEnabled();
  await expect(isContinueBtnAvailableUnderCustPOSection).toBeVisible();
  await expect(isContinueBtnAvailableUnderCustPOSection).toBeEnabled();
  await closeBtn.scrollIntoViewIfNeeded();
  await closeBtn.click({force: true});

})

test("Validate Loyalty Program Section", async() => {
    const isLoyaltyProgramTextVisible = page.locator("oj-sp-scoreboard-metric-card[card-title='Loyalty Program']");
    await expect(isLoyaltyProgramTextVisible).toBeVisible();
})



test("Validate Product Details page", async()=> {
    await page.locator("input[aria-label='Product Search']").waitFor({timeout: 6000});
    await page.locator("input[aria-label='Product Search']").fill("219500")
    await page.locator("#searchInputContainer_tbProductSearch").click()
    await page.locator("wol-product-card[id*='219500']").click();
    const getQuantityLabel = page.getByLabel("Quantity");
    const addBtnOnProdDetailsPage = page.getByRole('button',{name:'Add to Basket'});
    const productDetailsText = page.locator("div.oj-flex.oj-sm-flex-direction-column   div.oj-typography-body-md.oj-flex-item.oj-sm-flex-initial");
    const getAlternateProductLink = page.locator("div.oj-collapsible-header-wrapper").nth(0);
    const getRelatedProducts = page.locator("div.oj-collapsible-header-wrapper").nth(1);
    await expect(getAlternateProductLink).toHaveText("Alternate Products");
    await expect(getRelatedProducts).toHaveText("Related Products");
    await page.locator("button[aria-label='Back']").click()
})



test("Validate Add button on Product Search Page section", async () => {
    // await page.locator("input[aria-label='Product Search']").waitFor({timeout:5000})
    // await page.locator("input[aria-label='Product Search']").fill('');
    // await page.locator("input[aria-label='Product Search']").fill("D53216")
    const isAtpDateVisible = page.locator('span.oj-flex-item.oj-badge.custom-badge-atp');
    const isAvailableStockVisible = page.locator('span.oj-badge.oj-badge-sm.custom-badge');
    const productSearchAddBtn = page.locator("button[aria-label='Add']")
    await productSearchAddBtn.scrollIntoViewIfNeeded()
    await productSearchAddBtn.waitFor({state:'visible',timeout: 8000});
    await expect(productSearchAddBtn).toBeVisible({timeout:8000})
    await expect(isAtpDateVisible).toBeVisible();
    await expect(isAvailableStockVisible).toBeVisible();
    await expect(page.locator('wol-stock-quantity.oj-complete')).toHaveCount(1);
})

// test("Validate Add product to basket section", async ({ page }) => {
//     await page.locator("input[aria-label='Product Search']").fill("219500")
//     const productSearchAddBtn = page.getByRole('button', { name: 'Add' })
//     await productSearchAddBtn.click()
//     await page.waitForSelector("[class*='oj-listview-item']", { state: 'visible', timeout: 15000 })
//     const productSelAddToBsktList = page.locator("[class='oj-listview-cell-element']")
//     await expect(productSelAddToBsktList).toBeVisible()
//     await expect(productSelAddToBsktList).toHaveScreenshot(["OrderCapture/AddToProductBasketSlotSection", "AddToProductBasketSlotSection.png"])
// })

test("Validate Add product to basket layout and Validate Auto populate fields", async () => {
    // await page.locator("input[aria-label='Product Search']").fill("D53216")
    await page.locator("button[aria-label='Add']").waitFor({ state: 'visible', timeout: 9000 })
    const productSearchAddBtn = page.locator("button[aria-label='Add']")
    await productSearchAddBtn.click()
    await page.waitForSelector("[class*='oj-listview-item']", { state: 'visible', timeout: 15000 })
    await expect(page.locator("button[aria-label='Save']")).toBeVisible({timeout: 15000});
    const isCustomerAutoPopulated = await page.locator("oj-sp-scoreboard-metric-card[card-title='Customer'] div.oj-sp-scoreboard-metric-card-metric").textContent();
    expect(isCustomerAutoPopulated).not.toBeNull();
    // const isBillToAutoPopulated = await page.locator("oj-sp-scoreboard-metric-card[card-title='Bill to'] div.oj-sp-scoreboard-metric-card-metric").textContent();
    // expect(isBillToAutoPopulated).not.toBeNull();
    const isRequiredPopulated = await page.locator("oj-sp-scoreboard-metric-card[card-title='Required'] div.oj-sp-scoreboard-metric-card-metric").textContent();
    expect(isRequiredPopulated).not.toBeNull();
    // const isShippingMethodPopulated = await page.locator("oj-sp-scoreboard-metric-card[card-title='Shipping Method'] div.oj-sp-scoreboard-metric-card-metric").textContent();
    // expect(isShippingMethodPopulated).not.toBeNull();
    const isClearAllVisible = await page.locator("button[aria-label='Clear All']")
    expect(isClearAllVisible).toBeVisible()
    const productSelAddToBsktList = page.locator("[class='oj-listview-cell-element']")
    await expect(productSelAddToBsktList).toBeVisible()
    const addToBsktDecreaseBtn = page.locator("div.oj-listview-cell-element button[aria-label='Decrease']")
    const addToBsktIncreaseBtn = page.locator("div.oj-listview-cell-element button[aria-label='Increase']")
    const addToBsktDeleteBtn = page.locator("button[aria-label='Delete']")
    const isSubTotalDisplayed =  page.getByText('Sub Total');
    const isVATDisplayed =  page.getByText('VAT');
    const isTotalDisplayed =  page.getByText('Total',{exact: true});
    await expect(isSubTotalDisplayed).toBeVisible();
    await expect(isVATDisplayed).toBeVisible();
    await expect(isTotalDisplayed).toBeVisible();
    await expect(addToBsktDecreaseBtn).toBeVisible();
    await expect(addToBsktIncreaseBtn).toBeVisible();
    await expect(addToBsktDeleteBtn).toBeVisible();
})

test("Validate Detail Slot (Add Basket Section) in Order Capture Page", async () => {
    const detailSlotSection = page.locator("oj-vb-fragment-slot[name='detail']")
    await expect(detailSlotSection).toHaveScreenshot(["OrderCapture/DetailSlotSection", "DetailSlotSectionOnOrderCapturePage.png"])
})


test("Validate Order Dialog pop up with Print and Edit Options", async () => {
    const customerContentSlotSelection = page.locator("oj-sp-scoreboard-metric-card[card-title='Customer']");
    const customerSearchInputAvailable = page.locator("input[aria-label='Customer Search']");
    const selectCustomerListed = page.getByText('7000D54')
    const customerSearchResultsAvailable = page.locator('oj-c-list-view.customer-list');
    const clickOnChangeButton =  page.locator('#btnChangeCustomer');
    const clickOnClearAllBtn = page.locator("button[aria-label='Clear All']");
    
    await clickOnClearAllBtn.click();
    await customerContentSlotSelection.click();
    await page.locator("div[title='Customer Details']").waitFor({timeout: 7000})
    if(await clickOnChangeButton.isVisible({timeout: 6000})){
      await clickOnChangeButton.click(); }
    await customerSearchInputAvailable.fill('7000D54')
    await selectCustomerListed.waitFor({state:'visible', timeout: 6000});
    await expect(customerSearchResultsAvailable).toBeVisible({timeout: 20000});
    await selectCustomerListed.click();
    await page.locator("input[aria-label='Product Search']").fill("508201")
    await page.locator("button[aria-label='Add']").waitFor({ state: 'visible', timeout: 15000 })
    const productSearchAddBtn = page.locator("button[aria-label='Add']")
    await productSearchAddBtn.click()
    await page.waitForSelector("div[class='oj-listview-cell-element']", { state: 'visible', timeout: 16000 })
    const productSelAddToBsktList = page.locator("div[class='oj-listview-cell-element']")
    await expect(productSelAddToBsktList).toBeVisible({ timeout: 12000 });
    const clickOnSubmitBtn = page.locator("button[aria-label='Submit']")
    await clickOnSubmitBtn.click({ force: true });
    await page.getByRole('heading', { name: 'Checkout', exact: true }).waitFor({ state: 'visible' });

    const waitForPickingNoteHeaderText = page.locator("//span[text()='Print picking note']");
    const waitForEditBsktItemChk = page.locator("//span[text()='Have you picked ALL stock items?']");
    await expect(waitForPickingNoteHeaderText).toBeVisible();
    await expect(waitForEditBsktItemChk).toBeVisible();
    const isPrintBtnAvailableOnOrderDialog = page.getByRole('button',{name:'Print'});
    await expect(isPrintBtnAvailableOnOrderDialog).toBeVisible();
    const isEditBtnAvailableOnOrderDialog = page.getByRole('button').filter({hasText:'Edit'});
    await expect(isEditBtnAvailableOnOrderDialog).toBeVisible();
    (await page.waitForSelector("//button[text()='Confirm']")).waitForElementState('enabled');
    await page.locator("//button[text()='Confirm']").click({timeout:5000});
    expect(await page.locator("#oj_gop1_h_pageTitle").textContent()).toMatchSnapshot(["OrderCapture/OrderConfirmation", "OrderConfirmationHeader.txt"]);
})

// test.skip("Validate Extended button under Detail Slot section", async ({ page }) => {
//     const extendedBtnOnDetailSlot = page.getByRole('button', { name: 'Extended' })
//     await expect(extendedBtnOnDetailSlot).toHaveScreenshot(["OrderCapture/DetailSlotSection", "ExtendedBtnDetailSlotSectionOnOrderCapturePage.png"])
// })

