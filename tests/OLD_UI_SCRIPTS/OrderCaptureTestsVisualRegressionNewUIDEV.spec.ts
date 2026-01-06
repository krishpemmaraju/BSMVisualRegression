import { test, chromium, expect, Browser, BrowserContext, FrameLocator, Page } from "@playwright/test"
import { firefox } from 'playwright'


let page_vbcs: Page;
let vbcs_url: string, vbcs_user: string, vbcs_password: string;

test.beforeAll(async () => {
  test.setTimeout(300000);
  let browser_vbcs: Browser, browser_scm: Browser;
  let context_vbcs: BrowserContext, context_scm: BrowserContext;

  browser_vbcs = await firefox.launch({
    slowMo: 2000
  });
  context_vbcs = await browser_vbcs.newContext({
  });
  page_vbcs = await context_vbcs.newPage();
  if (process.env.ENV == "stg") {
    vbcs_url = "https://vb02.wolseleyuk.com/ic/builder/rt/wol-order-capture/live/webApps/wol-order-capture/vp/";
    vbcs_user = Buffer.from('a3Jpc2huYS5wZW1tYXJhanVAd29sc2VsZXkuY28udWs=', 'base64').toString('utf-8');
    vbcs_password = Buffer.from('SmF5YXZhcmFoaTE2JA==', 'base64').toString('utf-8');
  }
  if (process.env.ENV == "tst") {
    vbcs_url = "https://vb03.wolseleyuk.com/ic/builder/rt/wol-order-capture/live/webApps/wol-order-capture/vp/";
    vbcs_user = Buffer.from('a3Jpc2huYS5wZW1tYXJhanVAd29sc2VsZXkuY28udWs=', 'base64').toString('utf-8');
    vbcs_password = Buffer.from('SmF5YXZhcmFoaTE2JA==', 'base64').toString('utf-8');
  }
  if (process.env.ENV == "dev") {
    vbcs_url = "https://ocdevinteg-vb-1-vb-lru5gzgtyr9l.builder.uk-london-1.ocp.oraclecloud.com:443/ic/builder/rt/wol-order-capture/vbshare_982/webApps/wol-order-capture";
    // vbcs_url = "https://vb04.wolseleyuk.com/ic/builder/rt/wol-order-capture/live/webApps/wol-order-capture/vp/";
    vbcs_user = Buffer.from('a3Jpc2huYS5wZW1tYXJhanVAd29sc2VsZXkuY28udWs=', 'base64').toString('utf-8');
    vbcs_password = Buffer.from('SmF5YXZhcmFoaTE2JA==', 'base64').toString('utf-8');
  }
  await page_vbcs.goto(vbcs_url);
  await page_vbcs.waitForLoadState('networkidle');
  await expect(page_vbcs.getByRole('button').filter({ hasText: 'SSO' })).toBeVisible({ timeout: 35000 })
  await page_vbcs.getByRole('button').filter({ hasText: 'SSO' }).click();
  await page_vbcs.getByPlaceholder('first.last@domain.com').fill(vbcs_user);
  await page_vbcs.locator("input[value='Next']").click();
  await page_vbcs.getByPlaceholder('Password').fill(vbcs_password);
  await page_vbcs.locator("input[value='Sign in']").click();
  await page_vbcs.locator("input[value='Yes']").click({ force: true });
  await page_vbcs.waitForLoadState('networkidle');
  await page_vbcs.getByRole('heading').filter({ hasText: 'Order Capture' }).waitFor({ state: 'visible', timeout: 50000 })
});

test("Getting Order Capture", async () => {
  await page_vbcs.locator('#ojHeader_pageTitle').waitFor({ state: 'visible', timeout: 16000 });
  //       await page_scm.locator('#ojHeader_pageTitle').waitFor({state:'visible',timeout:16000})
  console.log(await page_vbcs.locator('#ojHeader_pageTitle').textContent())
})



test("Order Capture - Full Page Screenshot", async () => {
  await expect(page_vbcs).toHaveScreenshot(["OrderCapture", "OrderCaptureFullScreenshot.png"], { fullPage: true });
})

test("Validate Order Capture Header Text", async () => {
  expect(await page_vbcs.locator("#ojHeader_pageTitle").textContent()).toMatchSnapshot(["OrderCapture/HeaderTexts", "OrderCapturePageHeader.txt"]);
  expect(await page_vbcs.locator("#ojHeader_pageSubtitle").textContent()).toMatchSnapshot(["OrderCapture/HeaderTexts", "OrderCapturePageSubHeader.txt"]);
})

test.skip("Validate Requested Date and Requested Quantity", async () => {
  const IsRequestedDateAvailable = page_vbcs.locator('#requestedDate');
  const IsRequestedQuantityAvailable = page_vbcs.locator('#quantity');
  const IsDatePickerAvailable = page_vbcs.locator("span[title='Select Date Time.']");
  await expect(IsRequestedDateAvailable).toBeVisible({ timeout: 7000 })
  await expect(IsRequestedQuantityAvailable).toBeVisible({ timeout: 7000 })
  await expect(IsDatePickerAvailable).toBeVisible({ timeout: 7000 })
  await IsDatePickerAvailable.click();
  await expect(page_vbcs.locator('.oj-datepicker-popup')).toBeVisible({ timeout: 4000 });
  await page_vbcs.getByRole('button', { name: 'Done' }).scrollIntoViewIfNeeded();
  await page_vbcs.getByRole('button', { name: 'Done' }).click();
})

test("Validate Product search input is present", async () => {
  const getSearchBarElement = page_vbcs.locator("input[aria-label='Product Search']");
  await expect(getSearchBarElement).toHaveAttribute('aria-label', 'Product Search')
})

test("Validate Submit button", async () => {
  const submitButton = page_vbcs.locator("button[aria-label='Submit']");
  await expect(submitButton).toHaveScreenshot(["OrderCapture/SubmitButton", "SubmitBtnOnOrderCapturePage.png"])
})

test("Validate Product List slot", async () => {
  const prodSearchInputSlot = page_vbcs.locator("input[aria-label='Product Search']");
  await prodSearchInputSlot.waitFor({ timeout: 5000 })
  await prodSearchInputSlot.scrollIntoViewIfNeeded();
  await prodSearchInputSlot.fill("R40003")
  const productSearchSlot = page_vbcs.getByRole('gridcell').filter({ has: page_vbcs.locator("wol-product-card") })
  await expect(productSearchSlot).toBeVisible({ timeout: 5000 })
  await expect(productSearchSlot).toHaveScreenshot(["OrderCapture/ProductListSlotSection", "ProductListContentSlotSection.png"], { maxDiffPixels: 100, maxDiffPixelRatio: 0.02 })
})

test("Validate filter buttons on Order Capture Page", async () => {
  const getSearchBarElement = page_vbcs.getByRole('textbox', { name: 'Product Search' })
  await getSearchBarElement.click();
  const gridView = page_vbcs.locator("span[role='toolbar']").filter({ has: page_vbcs.getByLabel('Grid View') })
  await expect(gridView).toHaveScreenshot(["OrderCapture/ContentSlotSection", "GridViewButtonOnContentSlotSection.png"])
})

test("Validate Select Customer section info Slot", async () => {
  const customerTextAvailable = page_vbcs.locator("span[title='Customer']");
  const selectCustomerText = page_vbcs.locator("div[title='Select Customer...']");
  const clickToSelectCustomer = page_vbcs.locator("span[title='Click to select a customer']");
  const customerContentSlotSelection = page_vbcs.locator("oj-sp-scoreboard-metric-card[card-title='Customer']");
  const searchInputAvailableAfterClickCustomer = page_vbcs.locator("oj-sp-general-drawer-template[drawer-title='Customer Details']");
  const getTextOfCustomerDetailsSection = page_vbcs.locator("div[title='Customer Details']")
  // New Changes
  const isCustomerSelectCustomerAccountAvailable = page_vbcs.getByText("Select customer account");
  const clickOnCustomerDrpDwn = page_vbcs.locator("div[class='fake-dropdown oj-flex oj-sm-justify-content-space-between']").filter({ has: page_vbcs.locator("//span[text()='Customer']") });
  const customerSearchInputAvailable = page_vbcs.locator("input[aria-label='Customer Search']");
  const customerSearchResultsAvailable = page_vbcs.locator('oj-table.customer-table');
  const selectCustomerListed = page_vbcs.getByText('SMITH AND BYFORD LTD')
  const isSelectedCustomerVisible = page_vbcs.locator("div[title='SMITH AND BYFORD LTD']")
  const clickOnSaveOnSelectCusomter = page_vbcs.locator("button[aria-label='Save']");

  await expect(customerContentSlotSelection).toBeEnabled();
  await expect(customerContentSlotSelection).toHaveScreenshot(["OrderCapture/CustomerContentSlot", "CustomerContentSlotClickable.png"])
  await expect(customerTextAvailable).toHaveText("Customer")
  await expect(selectCustomerText).toHaveText("Select Customer...")
  await expect(clickToSelectCustomer).toHaveText("Click to select a customer")
  await customerContentSlotSelection.click()
  await expect(searchInputAvailableAfterClickCustomer).toHaveScreenshot(["OrderCapture/CustomerContentSlot", "CustomerDetailsPanel.png"])
  await expect(getTextOfCustomerDetailsSection).toHaveText('Customer Details');
  await expect(isCustomerSelectCustomerAccountAvailable).toBeVisible();

  await expect(clickOnCustomerDrpDwn).toBeVisible();
  await clickOnCustomerDrpDwn.click();
  await expect(customerSearchInputAvailable).toBeVisible({ timeout: 10000 });
  await expect(customerSearchInputAvailable).toBeEnabled();
  await customerSearchInputAvailable.fill('SMITH AND BYFORD LTD')
  await expect(customerSearchResultsAvailable).toBeVisible({ timeout: 20000 });
  await selectCustomerListed.click();
  await expect(clickOnSaveOnSelectCusomter).toBeEnabled({ timeout: 6000 });
  await clickOnSaveOnSelectCusomter.click();
  await expect(isSelectedCustomerVisible).toBeVisible();
})

test("Validate Account Status Section", async () => {
  const isAccountStatusVisible = page_vbcs.locator("oj-sp-scoreboard-metric-card[card-title='Account Status']");
  const isAccountStatusPanelAvailable = page_vbcs.locator("oj-sp-general-drawer-template[drawer-title='Account Status']");
  const isAccoutnStatusHeadingAvailable = page_vbcs.locator("div[title='Account Status']")


  await expect(isAccountStatusVisible).toBeVisible();
  await isAccountStatusVisible.click();
  await expect(isAccountStatusPanelAvailable).toBeVisible();
  await expect(isAccoutnStatusHeadingAvailable).toHaveText('Account Status');
  await page_vbcs.locator("button[aria-label='Close']").scrollIntoViewIfNeeded();
  await page_vbcs.locator("button[aria-label='Close']").click({ force: true });
})

test("Validate Available Balance Section", async () => {
  const isAvailableBalanceVisible = page_vbcs.locator("oj-sp-scoreboard-metric-card[card-title='Available Balance']");
  const isAvailableBalancePanelAvailable = page_vbcs.locator("oj-sp-general-drawer-template[drawer-title='Transaction History']");
  const isAvailableBalanceHeadingAvailable = page_vbcs.locator("div[title='Transaction History']")
  const closeBtn = page_vbcs.locator("button[aria-label='Close']")

  await expect(isAvailableBalanceVisible).toBeVisible();
  await isAvailableBalanceVisible.click()
  await expect(isAvailableBalancePanelAvailable).toBeVisible();
  await expect(isAvailableBalanceHeadingAvailable).toHaveText('Transaction History')
  await closeBtn.scrollIntoViewIfNeeded();
  await closeBtn.click({ force: true });
})

test("Validate Required Section", async () => {
  const isRequiredVisible = page_vbcs.locator("oj-sp-scoreboard-metric-card[card-title='Required']");
  await expect(isRequiredVisible).toBeVisible();
})


test("Validate Customer PO section info Slot", async () => {
  const customerPOTextAvailable = page_vbcs.locator("span[title='Customer PO #']");
  const customerPOContentSlotSelection = page_vbcs.locator("oj-sp-scoreboard-metric-card[card-title='Customer PO #']");
  const customerPOPanelAvailable = page_vbcs.locator("oj-sp-general-drawer-template[drawer-title='Order Details']");
  const isCustomerPOHeadingAvailable = page_vbcs.locator("div[title='Order Details']")
  const customerOrderInputTextAvailable = page_vbcs.getByLabel("Customer Order Number")
  const isCustomerOrderNumberTextBoxAvailable = page_vbcs.locator("oj-c-input-text[label-hint='Customer Order Number'] input");
  const isCancelBtnAvailableUnderCustPOSection = page_vbcs.getByRole('button', { name: 'Cancel' })
  const isContinueBtnAvailableUnderCustPOSection = page_vbcs.getByRole('button', { name: 'Continue' })
  const closeBtn = page_vbcs.locator("button[aria-label='Close']")

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
  await closeBtn.click({ force: true });

})

// test.skip("Validate Loyalty Program Section", async() => {
//     const isLoyaltyProgramTextVisible = page.locator("oj-sp-scoreboard-metric-card[card-title='Loyalty Program']");
//     await expect(isLoyaltyProgramTextVisible).toBeVisible();
// })



test("Validate Product Details page", async () => {
  await page_vbcs.locator("input[aria-label='Product Search']").waitFor({ timeout: 6000 });
  await page_vbcs.locator("input[aria-label='Product Search']").fill("R40003")
  await page_vbcs.locator("#searchInputContainer_tbProductSearch").click()
  await page_vbcs.locator("wol-product-card[id*='R40003']").click();
  const getQuantityLabel = page_vbcs.getByLabel("Quantity");
  const addBtnOnProdDetailsPage = page_vbcs.getByRole('button', { name: 'Add to Basket' });
  const productDetailsText = page_vbcs.locator("div.oj-flex.oj-sm-flex-direction-column   div.oj-typography-body-md.oj-flex-item.oj-sm-flex-initial");
  const getAlternateProductLink = page_vbcs.locator("div.oj-collapsible-header-wrapper").nth(0);
  const getRelatedProducts = page_vbcs.locator("div.oj-collapsible-header-wrapper").nth(1);
  await expect(getAlternateProductLink).toHaveText("Alternate Products");
  await expect(getRelatedProducts).toHaveText("Related Products");
  await page_vbcs.locator("#btnBack").click()
})



test("Validate Add button on Product Search Page section", async () => {
  //  const isAtpDateVisible = page_vbcs.locator('span.oj-flex-item.oj-badge.custom-badge-atp');
  const isAvailableStockVisible = page_vbcs.locator('span.oj-badge.oj-badge-sm.custom-badge');
  const productSearchAddBtn = page_vbcs.locator("button[aria-label='Add']")
  await productSearchAddBtn.scrollIntoViewIfNeeded()
  await productSearchAddBtn.waitFor({ state: 'visible', timeout: 8000 });
  await expect(productSearchAddBtn).toBeVisible({ timeout: 8000 })
  await page_vbcs.locator("wol-product-card[id*='R40003']").click();
  //temporary fix 
  // await expect(page_vbcs.locator('oj-c-button.atp-button button[aria-label]:not([aria-label=""])')).toBeVisible({ timeout: 7000 })
  await page_vbcs.locator("#btnBack").click()
  await expect(isAvailableStockVisible).toBeVisible({ timeout: 12000 });
  await expect(page_vbcs.locator('wol-stock-quantity.oj-complete')).toHaveCount(1);
})

test("Validate Add product to basket layout and Validate Auto populate fields", async () => {
  await page_vbcs.locator("button[aria-label='Add']").waitFor({ state: 'visible', timeout: 9000 })
  await page_vbcs.locator("button[aria-label='Add']").click()
  await page_vbcs.locator("[class*='oj-listview-item']").waitFor({ state: 'visible', timeout: 40000 })
  //changes related to Save and Exit 
  const isMoreActionsAvailable = "button[aria-label='More Actions']"
  const isMoreActionsMenuAvailable = "div[aria-label='More Actions']"
  await expect(page_vbcs.locator(isMoreActionsAvailable)).toBeVisible({ timeout: 3000 });
  await page_vbcs.locator(isMoreActionsAvailable).click();
  await expect(page_vbcs.locator(isMoreActionsMenuAvailable)).toBeVisible({ timeout: 9000 })
  await expect(page_vbcs.getByText('Save', { exact: true })).toBeVisible({ timeout: 6000 })
  await expect(page_vbcs.getByText('Save and Exit', { exact: true })).toBeVisible({ timeout: 3000 })
  await page_vbcs.locator(isMoreActionsAvailable).click();
  const isCustomerAutoPopulated = await page_vbcs.locator("oj-sp-scoreboard-metric-card[card-title='Customer'] div.oj-sp-scoreboard-metric-card-metric").textContent();
  expect(isCustomerAutoPopulated).not.toBeNull();
  // const isBillToAutoPopulated = await page.locator("oj-sp-scoreboard-metric-card[card-title='Bill to'] div.oj-sp-scoreboard-metric-card-metric").textContent();
  // expect(isBillToAutoPopulated).not.toBeNull();
  const isRequiredPopulated = await page_vbcs.locator("oj-sp-scoreboard-metric-card[card-title='Required'] div.oj-sp-scoreboard-metric-card-metric").textContent();
  expect(isRequiredPopulated).not.toBeNull();
  // const isShippingMethodPopulated = await page.locator("oj-sp-scoreboard-metric-card[card-title='Shipping Method'] div.oj-sp-scoreboard-metric-card-metric").textContent();
  // expect(isShippingMethodPopulated).not.toBeNull();
  const isClearAllVisible = await page_vbcs.locator("button[aria-label='Clear All']")
  expect(isClearAllVisible).toBeVisible()
  const productSelAddToBsktList = page_vbcs.locator("[class='oj-listview-cell-element']")
  await expect(productSelAddToBsktList).toBeVisible()
  const addToBsktDecreaseBtn = page_vbcs.locator("div.oj-listview-cell-element button[aria-label='Decrease']")
  const addToBsktIncreaseBtn = page_vbcs.locator("div.oj-listview-cell-element button[aria-label='Increase']")
  const addToBsktDeleteBtn = page_vbcs.locator("button[aria-label='Delete']")
  const isSubTotalDisplayed = page_vbcs.getByText('Sub Total');
  const isVATDisplayed = page_vbcs.getByText('VAT');
  const isTotalDisplayed = page_vbcs.getByText('Total', { exact: true });
  await expect(isSubTotalDisplayed).toBeVisible();
  await expect(isVATDisplayed).toBeVisible();
  await expect(isTotalDisplayed).toBeVisible();
  await expect(addToBsktDecreaseBtn).toBeVisible();
  await expect(addToBsktIncreaseBtn).toBeVisible();
  await expect(addToBsktDeleteBtn).toBeVisible();
})

test("Validate Detail Slot (Add Basket Section) in Order Capture Page", async () => {
  const detailSlotSection = page_vbcs.locator("oj-vb-fragment-slot[name='detail']")
  await expect(detailSlotSection).toHaveScreenshot(["OrderCapture/DetailSlotSection", "DetailSlotSectionOnOrderCapturePage.png"])
})


test("Validate Order Dialog pop up with Print and Edit Options", async () => {
  const customerContentSlotSelection = page_vbcs.locator("oj-sp-scoreboard-metric-card[card-title='Customer']");
  const customerSearchInputAvailable = page_vbcs.locator("input[aria-label='Customer Search']");
  const selectCustomerListed = page_vbcs.getByText('7000D54')
  const customerSearchResultsAvailable = page_vbcs.locator('oj-c-list-view.customer-list');
  const clickOnChangeButton = page_vbcs.locator('#btnChangeCustomer');
  const clickOnClearAllBtn = page_vbcs.locator("button[aria-label='Clear All']");

  await expect(page_vbcs.locator("button[aria-label='Clear All']")).toBeVisible({ timeout: 7000 })
  await expect(page_vbcs.locator("button[aria-label='Clear All']")).toBeEnabled({ timeout: 7000 })

  // await page_vbcs.locator("input[aria-label='Product Search']").fill("R40003")
  // await page_vbcs.locator("button[aria-label='Add']").waitFor({ state: 'visible', timeout: 15000 })
  // await page_vbcs.locator("button[aria-label='Add']").click({ timeout: 4000 })
  // await page_vbcs.locator("div[class='oj-listview-cell-element']").waitFor({ state: 'visible', timeout: 16000 })
  // await expect(page_vbcs.locator("div[class='oj-listview-cell-element']")).toBeVisible({ timeout: 6000 });
  // await expect(page_vbcs.locator("button[aria-label='Submit']")).toBeEnabled({ timeout: 25000 })
  // await clickOnSubmitBtn.waitFor({state:'visible',timeout:20000});
  // await page.waitForFunction(async (clickOnSubmitBtn) => {
  //        return await clickOnSubmitBtn.isEnabled();
  // }, clickOnSubmitBtn)
  await page_vbcs.locator("button[aria-label='Submit']").click({ force: true });
  await page_vbcs.getByRole('heading', { name: 'Checkout', exact: true }).waitFor({ state: 'visible' });

  const waitForPickingNoteHeaderText = page_vbcs.locator("//span[text()='Print picking note']");
  const waitForEditBsktItemChk = page_vbcs.locator("//span[text()='Have you picked ALL stock items?']");
  await expect(waitForPickingNoteHeaderText).toBeVisible();
  await expect(waitForEditBsktItemChk).toBeVisible();
  const isPrintBtnAvailableOnOrderDialog = page_vbcs.getByRole('button', { name: 'Print' });
  await expect(isPrintBtnAvailableOnOrderDialog).toBeVisible();
  const isEditBtnAvailableOnOrderDialog = page_vbcs.getByRole('button').filter({ hasText: 'Edit' });
  await expect(isEditBtnAvailableOnOrderDialog).toBeVisible();
  await expect(page_vbcs.locator("//button[text()='Confirm']")).toBeEnabled({ timeout: 30000 })   //     await page_vbcs.locator("//button[text()='Confirm']").click({timeout:5000});
  await (page_vbcs.locator("//button[text()='Confirm']")).click();
  expect(await page_vbcs.locator("#oj_gop1_h_pageTitle").textContent({ timeout: 8000 })).toMatchSnapshot(["OrderCapture/OrderConfirmation", "OrderConfirmationHeader.txt"]);
})



