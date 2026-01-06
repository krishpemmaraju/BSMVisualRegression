import { test, chromium, expect, Browser, BrowserContext, FrameLocator, Page } from "@playwright/test"
import { firefox } from 'playwright'


let page_scm_vbcs_frame: FrameLocator;
let page_scm: Page;
let vbcs_url: string, vbcs_user: string, vbcs_password: string;
let scm_url: string, scm_user: string, scm_password: string;
let productWithStk: string, productWithoutStk: string;
test.beforeAll(async () => {
  test.setTimeout(300000);
  let browser_vbcs: Browser, browser_scm: Browser;
  let context_vbcs: BrowserContext, context_scm: BrowserContext;

  browser_vbcs = await firefox.launch({
    slowMo: 2000
  });
  context_vbcs = await browser_vbcs.newContext({
  });
  const page_vbcs = await context_vbcs.newPage();
  if (process.env.ENV == "stg") {
    vbcs_url = "https://vb02.wolseleyuk.com/ic/builder/rt/wol-order-capture/live/webApps/wol-order-capture/vp/";
    scm_url = "https://egvh-tst.fa.em3.oraclecloud.com/";
    vbcs_user = Buffer.from('a3Jpc2huYS5wZW1tYXJhanVAd29sc2VsZXkuY28udWs=', 'base64').toString('utf-8');
    vbcs_password = Buffer.from('SmF5YXZhcmFoaTE2JA==', 'base64').toString('utf-8');
    scm_user = Buffer.from('QXV0b21hdGlvbg==', 'base64').toString('utf-8')
    scm_password = Buffer.from('QXV0b21hdGlvbjEyIQ==', 'base64').toString('utf-8')
  }
  if (process.env.ENV == "tst") {
    vbcs_url = "https://vb03.wolseleyuk.com/ic/builder/rt/wol-order-capture/live/webApps/wol-order-capture/vp/";
    scm_url = "https://egvh-dev2.fa.em3.oraclecloud.com/";
    vbcs_user = Buffer.from('a3Jpc2huYS5wZW1tYXJhanVAd29sc2VsZXkuY28udWs=', 'base64').toString('utf-8');
    vbcs_password = Buffer.from('SmF5YXZhcmFoaTE2JA==', 'base64').toString('utf-8');
    scm_user = Buffer.from('QXV0b21hdGlvbg==', 'base64').toString('utf-8')
    scm_password = Buffer.from('QXV0b21hdGlvbjEyIQ==', 'base64').toString('utf-8')
    productWithStk = "508200";
    productWithoutStk = "R40063"
  }
  if (process.env.ENV == "dev") {
    vbcs_url = "https://vb04.wolseleyuk.com/ic/builder/rt/wol-order-capture/live/webApps/wol-order-capture/vp/";
    scm_url = "https://egvh-dev1.fa.em3.oraclecloud.com/";
    vbcs_user = Buffer.from('a3Jpc2huYS5wZW1tYXJhanVAd29sc2VsZXkuY28udWs=', 'base64').toString('utf-8');
    vbcs_password = Buffer.from('SmF5YXZhcmFoaTE2JA==', 'base64').toString('utf-8');
    scm_user = Buffer.from('QUJCNzM3NQ==', 'base64').toString('utf-8')
    scm_password = Buffer.from('SmF5YXZhcmFoaTE2JA==', 'base64').toString('utf-8')
    productWithStk = "R40063";
    productWithoutStk = "R40001"
  }
  await page_vbcs.goto(vbcs_url);
  await page_vbcs.waitForLoadState('networkidle');
  await expect(page_vbcs.getByRole('button').filter({ hasText: 'SSO' })).toBeVisible({ timeout: 35000 })
  await page_vbcs.getByRole('button').filter({ hasText: 'SSO' }).click();
  await page_vbcs.getByPlaceholder('first.last@domain.com').fill(vbcs_user);
  await page_vbcs.locator("input[value='Next']").click();
  await page_vbcs.getByPlaceholder('Password').fill(vbcs_password);
  await page_vbcs.locator("input[value='Sign in']").click();
  // await page.pause()
  // await page.locator("input[value='Yes']").waitFor({ state: 'visible', timeout: 10000 })
  await page_vbcs.locator("input[value='Yes']").click({ force: true });
  await page_vbcs.waitForLoadState('networkidle');
  await page_vbcs.getByRole('heading').filter({ hasText: 'Order Capture' }).waitFor({ state: 'visible', timeout: 50000 })

  const storageState = await context_vbcs.storageState();

  //launching second browser 
  browser_scm = await chromium.launch({
    slowMo: 2000
  });
  context_scm = await browser_scm.newContext({ storageState });

  // Have another page object for SCM application
  page_scm = await context_scm.newPage();
  await page_scm.goto(scm_url);
  await page_scm.getByPlaceholder("User ID").fill(scm_user);
  await page_scm.getByPlaceholder("Password").fill(scm_password);
  await page_scm.getByRole("button").filter({ hasText: 'Sign In ' }).click();
  await page_scm.waitForSelector("a[title='Home']", { timeout: 30000 });
  await page_scm.locator("a[title='Home']").click();
  //Check for Order Management 
  await page_scm.locator('input[aria-label="Search:"]').waitFor({ state: 'attached', timeout: 30000 });
  const getNavMenuLinks = page_scm.locator("#navmenu-wrapper a");
  const rightHandNav = page_scm.locator("#clusters-right-nav");
  for (let i = 0; i < await getNavMenuLinks.count(); i++) {
    if (await getNavMenuLinks.nth(i).textContent({ timeout: 6000 }) == "Order Management") {
      console.log(await getNavMenuLinks.nth(i).textContent());
      await getNavMenuLinks.nth(i).click();
      break;
    }
    else {
      if (i == 7) {
        await rightHandNav.click();
      }
    }
  }


  // Switch to the new page
  if (process.env.ENV == "dev") {
    await page_scm.locator("div[title='Wolseley Order Capture']").click();
    page_scm_vbcs_frame = page_scm.frameLocator('iframe[src*="wol-order-capture/live"]');
  } else {
    // Change made as  per DEV requirement
    await page_scm.locator("#itemNode_order_management_OrderManagementNew_0").click()
    await page_scm.getByRole('heading', { name: 'Order Management' }).waitFor({ state: 'visible', timeout: 15000 });
    await page_scm.locator("#_oj18_navItem_order-new a").click()
    await page_scm.getByRole('heading', { name: 'Sales Orders' }).waitFor({ state: 'visible', timeout: 15000 })
    await page_scm.locator("button[aria-label='Create Order']").click();
    page_scm_vbcs_frame = page_scm.frameLocator('iframe[src*="wol-order-capture/live"]');
  }
});

test("Getting Order Capture", async () => {
  await page_scm_vbcs_frame.locator('#ojHeader_pageTitle').waitFor({ state: 'visible', timeout: 16000 });
  //       await page_scm.locator('#ojHeader_pageTitle').waitFor({state:'visible',timeout:16000})
})



test("Order Capture - Full Page Screenshot", async () => {
  await expect(page_scm).toHaveScreenshot(["OrderCapture", "OrderCaptureFullScreenshot.png"], { fullPage: true });
})

test("Validate Order Capture Header Text", async () => {
  console.log(await page_scm_vbcs_frame.locator("#ojHeader_pageTitle").textContent())
  await page_scm_vbcs_frame.locator('#ojHeader_pageTitle').waitFor({ state: 'visible', timeout: 16000 });
  expect(await page_scm_vbcs_frame.locator("#ojHeader_pageTitle").textContent()).toMatchSnapshot(["OrderCapture/HeaderTexts", "OrderCapturePageHeader.txt"]);
})

test("Validate Requested Date and Requested Quantity", async () => {
  const IsRequestedDateAvailable = page_scm_vbcs_frame.locator('#requestedDate');
  const IsRequestedQuantityAvailable = page_scm_vbcs_frame.locator('#quantity');
  const IsDatePickerAvailable = page_scm_vbcs_frame.locator("span[title='Select Date Time.']");
  await expect(IsRequestedDateAvailable).toBeVisible({ timeout: 7000 })
  await expect(IsRequestedQuantityAvailable).toBeVisible({ timeout: 7000 })
  await expect(IsDatePickerAvailable).toBeVisible({ timeout: 7000 })
  await IsDatePickerAvailable.click();
  await expect(page_scm_vbcs_frame.locator('.oj-datepicker-popup')).toBeVisible({ timeout: 4000 });
  await page_scm_vbcs_frame.getByRole('button', { name: 'Done' }).scrollIntoViewIfNeeded();
  await page_scm_vbcs_frame.getByRole('button', { name: 'Done' }).click();
})

test("Validate Product search input is present", async () => {
  const getSearchBarElement = page_scm_vbcs_frame.locator("input[aria-label='Product Search']");
  await expect(getSearchBarElement).toHaveAttribute('aria-label', 'Product Search')
})

test("Validate Checkout button", async () => {
  const submitButton = page_scm_vbcs_frame.locator("button[aria-label='Checkout']");
  await expect(submitButton).toHaveScreenshot(["OrderCapture/CheckoutButton", "CheckoutBtnOnOrderCapturePage.png"])
})

test("Validate Product List slot", async () => {
  const prodSearchInputSlot = page_scm_vbcs_frame.locator("input[aria-label='Product Search']");
  await prodSearchInputSlot.waitFor({ timeout: 5000 })
  await prodSearchInputSlot.scrollIntoViewIfNeeded();
  await prodSearchInputSlot.fill(productWithStk)
  const productSearchSlot = page_scm_vbcs_frame.getByRole('gridcell').filter({ has: page_scm_vbcs_frame.locator("wol-product-card") })
  await expect(productSearchSlot).toBeVisible({ timeout: 5000 })
  await expect(productSearchSlot).toHaveScreenshot(["OrderCapture/ProductListSlotSection", "ProductListContentSlotSection.png"], { maxDiffPixels: 100, maxDiffPixelRatio: 0.02 })
})

test("Validate filter buttons on Order Capture Page", async () => {
  const getSearchBarElement = page_scm_vbcs_frame.getByRole('textbox', { name: 'Product Search' })
  await getSearchBarElement.click();
  const gridView = page_scm_vbcs_frame.locator("span[role='toolbar']").filter({ has: page_scm_vbcs_frame.getByLabel('Grid View') })
  await expect(gridView).toHaveScreenshot(["OrderCapture/ContentSlotSection", "GridViewButtonOnContentSlotSection.png"])
})

test("Validate Select Customer section info Slot", async () => {
  const customerTextAvailable = page_scm_vbcs_frame.locator("span[title='Customer']");
  const selectCustomerText = page_scm_vbcs_frame.locator("div[title='Select Customer...']");
  const clickToSelectCustomer = page_scm_vbcs_frame.locator("span[title='Click to select a customer']");
  const customerContentSlotSelection = page_scm_vbcs_frame.locator("oj-sp-scoreboard-metric-card[card-title='Customer']");
  const searchInputAvailableAfterClickCustomer = page_scm_vbcs_frame.locator("oj-sp-general-drawer-template[drawer-title='Customer Details']");
  const getTextOfCustomerDetailsSection = page_scm_vbcs_frame.locator("div[title='Customer Details']")
  // New Changes
  const isCustomerSelectCustomerAccountAvailable = page_scm_vbcs_frame.getByText("Select customer account");
  const clickOnCustomerDrpDwn = page_scm_vbcs_frame.locator("div[class='fake-dropdown oj-flex oj-sm-justify-content-space-between']").filter({ has: page_scm_vbcs_frame.locator("//span[text()='Customer']") });
  const customerSearchInputAvailable = page_scm_vbcs_frame.locator("input[aria-label='Customer Search']");
  const customerSearchResultsAvailable = page_scm_vbcs_frame.locator('oj-table.customer-table');
  const selectCustomerListed = page_scm_vbcs_frame.getByText('SMITH AND BYFORD LTD')
  const isSelectedCustomerVisible = page_scm_vbcs_frame.locator("div[title='SMITH AND BYFORD LTD']")
  const clickOnSaveOnSelectCusomter = page_scm_vbcs_frame.locator("button[aria-label='Save']");

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
  const isAccountStatusVisible = page_scm_vbcs_frame.locator("oj-sp-scoreboard-metric-card[card-title='Account Status']");
  const isAccountStatusPanelAvailable = page_scm_vbcs_frame.locator("oj-sp-general-drawer-template[drawer-title='Account Status']");
  const isAccoutnStatusHeadingAvailable = page_scm_vbcs_frame.locator("div[title='Account Status']")
  const isCancelBtnOnAccountStatusAvailable = page_scm_vbcs_frame.locator('#btnCancel');
  const isContinueBtnOnAccountStatusAvailable = page_scm_vbcs_frame.locator('#btnContinue');

  await expect(isAccountStatusVisible).toBeVisible();
  await isAccountStatusVisible.click();
  await expect(isAccountStatusPanelAvailable).toBeVisible();
  await expect(isAccoutnStatusHeadingAvailable).toHaveText('Account Status');
  await expect(isCancelBtnOnAccountStatusAvailable).toBeVisible();
  await expect(isContinueBtnOnAccountStatusAvailable).toBeVisible();
  await page_scm_vbcs_frame.locator("div.oj-sm-align-self-flex-start button[aria-label='Close']").scrollIntoViewIfNeeded();
  await page_scm_vbcs_frame.locator("div.oj-sm-align-self-flex-start button[aria-label='Close']").click({ force: true });

})

test("Validate Available Balance Section", async () => {
  const isAvailableBalanceVisible = page_scm_vbcs_frame.locator("oj-sp-scoreboard-metric-card[card-title='Available Balance']");
  const isAvailableBalancePanelAvailable = page_scm_vbcs_frame.locator("oj-sp-general-drawer-template[drawer-title='Transaction History']");
  const isAvailableBalanceHeadingAvailable = page_scm_vbcs_frame.locator("div[title='Transaction History']")
  const closeBtn = page_scm_vbcs_frame.locator("div.oj-sm-align-self-flex-start button[aria-label='Close']")
  const isCancelBtnOnAccountStatusAvailable = page_scm_vbcs_frame.locator('#btnCancel');
  const isContinueBtnOnAccountStatusAvailable = page_scm_vbcs_frame.locator('#btnContinue');

  await expect(isAvailableBalanceVisible).toBeVisible();
  await isAvailableBalanceVisible.click()
  await expect(isAvailableBalancePanelAvailable).toBeVisible();
  await expect(isAvailableBalanceHeadingAvailable).toHaveText('Transaction History')
  await expect(isCancelBtnOnAccountStatusAvailable).toBeVisible();
  await expect(isContinueBtnOnAccountStatusAvailable).toBeVisible();
  await closeBtn.scrollIntoViewIfNeeded();
  await closeBtn.click({ force: true });
})

test.skip("Validate Required Section", async () => {
  const isRequiredVisible = page_scm_vbcs_frame.locator("oj-sp-scoreboard-metric-card[card-title='Required']");
  await expect(isRequiredVisible).toBeVisible();
})


test("Validate Customer PO section info Slot", async () => {
  const customerPOTextAvailable = page_scm_vbcs_frame.locator("span[title='Customer PO #']");
  const customerPOContentSlotSelection = page_scm_vbcs_frame.locator("oj-sp-scoreboard-metric-card[card-title='Customer PO #']");
  const customerPOPanelAvailable = page_scm_vbcs_frame.locator("oj-sp-general-drawer-template[drawer-title='Order Details']");
  const isCustomerPOHeadingAvailable = page_scm_vbcs_frame.locator("div[title='Order Details']")
  const customerOrderInputTextAvailable = page_scm_vbcs_frame.getByLabel("Customer Order Number")
  const isCustomerOrderNumberTextBoxAvailable = page_scm_vbcs_frame.locator("oj-c-input-text[label-hint='Customer Order Number'] input");
  const isCancelBtnAvailableUnderCustPOSection = page_scm_vbcs_frame.getByRole('button', { name: 'Cancel' })
  const isContinueBtnAvailableUnderCustPOSection = page_scm_vbcs_frame.getByRole('button', { name: 'Continue' })
  const closeBtn = page_scm_vbcs_frame.locator("div.oj-sm-align-self-flex-start button[aria-label='Close']")

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
  await page_scm_vbcs_frame.locator("input[aria-label='Product Search']").waitFor({ timeout: 6000 });
  await page_scm_vbcs_frame.locator("input[aria-label='Product Search']").fill(productWithStk)
  await page_scm_vbcs_frame.locator("#searchInputContainer_tbProductSearch").click()
  await page_scm_vbcs_frame.locator("wol-product-card[id*='" + productWithStk + "']").click();
  const getAlternateProductLink = page_scm_vbcs_frame.locator("div.oj-collapsible-header-wrapper").nth(0);
  const getRelatedProducts = page_scm_vbcs_frame.locator("div.oj-collapsible-header-wrapper").nth(1);
  await expect(getAlternateProductLink).toHaveText("Alternate Products");
  await expect(getRelatedProducts).toHaveText("Related Products");
  await page_scm_vbcs_frame.locator("#btnBack").click()
})



test("Validate Add button on Product Search Page section for available product having stock", async () => {
  //  const isAtpDateVisible = page_scm_vbcs_frame.locator('span.oj-flex-item.oj-badge.custom-badge-atp');
  const isWolStockQtyAvailable = page_scm_vbcs_frame.locator('wol-stock-quantity.oj-complete');
  const productSearchAddBtn = page_scm_vbcs_frame.locator("button[aria-label='Add']")
  await productSearchAddBtn.scrollIntoViewIfNeeded()
  await productSearchAddBtn.waitFor({ state: 'visible', timeout: 8000 });
  await expect(productSearchAddBtn).toBeVisible({ timeout: 8000 })
  await expect(isWolStockQtyAvailable).toBeVisible({ timeout: 10000 });
  await page_scm_vbcs_frame.locator("input[aria-label='Product Search']").fill(productWithStk)
  await page_scm_vbcs_frame.locator("#searchInputContainer_tbProductSearch").click()
  await page_scm_vbcs_frame.locator("wol-product-card[id*='" + productWithStk + "']").click();
  //temporary fix 
  // await expect(page_scm_vbcs_frame.locator('oj-c-button.atp-button button[aria-label]:not([aria-label=""])')).toBeVisible({ timeout: 7000 })
  await page_scm_vbcs_frame.locator("#btnBack").click()
  await expect(page_scm_vbcs_frame.locator('wol-stock-quantity.oj-complete')).toHaveCount(1);
})

test("Validate Add button on Product Search Page section for product having 0 stock", async () => {
  //  const isAtpDateVisible = page_scm_vbcs_frame.locator('span.oj-flex-item.oj-badge.custom-badge-atp');
  const isWolStockQtyAvailable = page_scm_vbcs_frame.locator('wol-stock-quantity.oj-complete');
  const isAvailableStockVisible = page_scm_vbcs_frame.locator('wol-icon-text > div:nth-child(1) > div > span');
  const isFeederDataVisible = page_scm_vbcs_frame.locator('wol-icon-text > div:nth-child(2) > div:nth-child(1) > span');
  const isAtpDataVisible = page_scm_vbcs_frame.locator('wol-icon-text > div:nth-child(2) > div:nth-child(2) > span');
  const isFutureStkDataVisible = page_scm_vbcs_frame.locator('wol-icon-text > div:nth-child(2) > div:nth-child(3) > span');

  const productSearchAddBtn = page_scm_vbcs_frame.locator("button[aria-label='Add']")
  await productSearchAddBtn.scrollIntoViewIfNeeded()
  await productSearchAddBtn.waitFor({ state: 'visible', timeout: 8000 });
  await expect(productSearchAddBtn).toBeVisible({ timeout: 8000 })
  await expect(isWolStockQtyAvailable).toBeVisible({ timeout: 10000 });
  await page_scm_vbcs_frame.locator("input[aria-label='Product Search']").fill(productWithoutStk)
  await page_scm_vbcs_frame.locator("#searchInputContainer_tbProductSearch").click()
  await page_scm_vbcs_frame.locator("wol-product-card[id*='" + productWithoutStk + "']").click();
  await page_scm_vbcs_frame.locator("#btnBack").click()
  await expect(isAvailableStockVisible).toBeVisible({ timeout: 12000 });
  await expect(isFeederDataVisible).toBeVisible({ timeout: 12000 });
  await expect(isAtpDataVisible).toBeVisible({ timeout: 12000 });
  await expect(isFutureStkDataVisible).toBeVisible({ timeout: 18000 });
  await expect(page_scm_vbcs_frame.locator('wol-stock-quantity.oj-complete')).toHaveCount(1);
})

test("Validate Add product to basket layout and Validate Auto populate fields", async () => {
  await page_scm_vbcs_frame.locator("button[aria-label='Add']").waitFor({ state: 'visible', timeout: 9000 })
  await page_scm_vbcs_frame.locator("button[aria-label='Add']").click()
  await page_scm_vbcs_frame.locator("div.product-lines div.product-line").waitFor({ state: 'visible', timeout: 40000 })
  //changes related to Save and Exit 
  const isMoreActionsAvailable = "button[aria-label='More Actions']"
  const isMoreActionsMenuAvailable = "div[aria-label='More Actions']"
  await expect(page_scm_vbcs_frame.locator(isMoreActionsAvailable)).toBeVisible({ timeout: 3000 });
  await page_scm_vbcs_frame.locator(isMoreActionsAvailable).click();
  await expect(page_scm_vbcs_frame.locator(isMoreActionsMenuAvailable)).toBeVisible({ timeout: 9000 })
  await expect(page_scm_vbcs_frame.getByText('Save', { exact: true })).toBeVisible({ timeout: 6000 })
  await expect(page_scm_vbcs_frame.getByText('Save and Exit', { exact: true })).toBeVisible({ timeout: 3000 })
  await page_scm_vbcs_frame.locator(isMoreActionsAvailable).click();
  const isClearAllVisible = page_scm_vbcs_frame.locator("button[aria-label='Clear All']")
  expect(isClearAllVisible).toBeVisible()
  const productSelAddToBsktList = page_scm_vbcs_frame.locator("div.product-lines div.product-line")
  await expect(productSelAddToBsktList).toBeVisible()
  const isCollectionPanelAvailable = page_scm_vbcs_frame.locator("li.wolPanel div.oj-sm-justify-content-space-between.oj-divider-bottom")
  const addToBsktDecreaseBtn = page_scm_vbcs_frame.locator("button[aria-label='Decrease']")
  const addToBsktIncreaseBtn = page_scm_vbcs_frame.locator("button[aria-label='Increase']")
  const addToBsktDeleteBtn = page_scm_vbcs_frame.locator("div.product-details oj-c-button[label='Delete'] button[aria-label='Delete']")
  const isSubTotalDisplayed = page_scm_vbcs_frame.getByText('Sub Total');
  const isVATDisplayed = page_scm_vbcs_frame.getByText('VAT');
  const isTotalDisplayed = page_scm_vbcs_frame.getByText('Total', { exact: true });
  const isDeleteBtnAvailableCollBtn = page_scm_vbcs_frame.locator("div.oj-divider-bottom  button[aria-label='Delete']");
  const isMoveBtnAvailableCollBtn = page_scm_vbcs_frame.locator("div.oj-divider-bottom  button[aria-label='Move']");
  await expect(isCollectionPanelAvailable).toBeVisible({ timeout: 5000 })
  await expect(isSubTotalDisplayed).toBeVisible();
  await expect(isVATDisplayed).toBeVisible();
  await expect(isTotalDisplayed).toBeVisible();
  await expect(addToBsktDecreaseBtn).toBeVisible();
  await expect(addToBsktIncreaseBtn).toBeVisible();
  await expect(addToBsktDeleteBtn).toBeVisible();
  await expect(isDeleteBtnAvailableCollBtn).toBeVisible();
  await expect(isMoveBtnAvailableCollBtn).toBeVisible();
})

test("Validate Detail Slot (Add Basket Section) in Order Capture Page", async () => {
  const detailSlotSection = page_scm_vbcs_frame.locator("oj-vb-fragment-slot[name='detail']")
  await expect(detailSlotSection).toHaveScreenshot(["OrderCapture/DetailSlotSection", "DetailSlotSectionOnOrderCapturePage.png"])
})

//nandini's code

// test.only("Validate Product List slot for R40063", async () => {
//   const prodSearchInputSlot = page_scm_vbcs_frame.locator("input[aria-label='Product Search']");
//   await prodSearchInputSlot.waitFor({ timeout: 5000 })
//   await prodSearchInputSlot.scrollIntoViewIfNeeded();
//   await prodSearchInputSlot.fill("R40063")
//   //const productSearchSlot = page_scm_vbcs_frame.getByRole('gridcell').filter({ has: page_scm_vbcs_frame.locator("wol-product-card") })
//   //await expect(productSearchSlot).toBeVisible({ timeout: 5000 })
//   //await expect(productSearchSlot).toHaveScreenshot(["OrderCapture/ProductListSlotSection", "ProductListContentSlotSection.png"], { maxDiffPixels: 100, maxDiffPixelRatio: 0.02 })
// })

// test.only("Validate Product Details page for R40063", async () => {
//   await page_scm_vbcs_frame.locator("input[aria-label='Product Search']").waitFor({ timeout: 6000 });
//   await page_scm_vbcs_frame.locator("input[aria-label='Product Search']").fill("R40063")
//   await page_scm_vbcs_frame.locator("#searchInputContainer_tbProductSearch").click()
//   await page_scm_vbcs_frame.locator("wol-product-card[id*='R40063']").click();
//   const getQuantityLabel = page_scm_vbcs_frame.getByLabel("Quantity");
//   const addBtnOnProdDetailsPage = page_scm_vbcs_frame.getByRole('button', { name: 'Add to Basket' });
//   const productDetailsText = page_scm_vbcs_frame.locator("div.oj-flex.oj-sm-flex-direction-column   div.oj-typography-body-md.oj-flex-item.oj-sm-flex-initial");
//   const getAlternateProductLink = page_scm_vbcs_frame.locator("div.oj-collapsible-header-wrapper").nth(0);
//   const getRelatedProducts = page_scm_vbcs_frame.locator("div.oj-collapsible-header-wrapper").nth(1);
//   await expect(getAlternateProductLink).toHaveText("Alternate Products");
//   await expect(getRelatedProducts).toHaveText("Related Products");
//   await page_scm_vbcs_frame.locator("#btnBack").click()
// })

// test.only("Validate Add button on Product Search Page section for R40063", async () => {
//   //  const isAtpDateVisible = page_scm_vbcs_frame.locator('span.oj-flex-item.oj-badge.custom-badge-atp');
//   const isWolStockQtyAvailable = page_scm_vbcs_frame.locator('wol-stock-quantity.oj-complete');
//   const isAvailableStockVisible = page_scm_vbcs_frame.locator('wol-icon-text > div:nth-child(1) > div > span');
//   //const isFeederDataVisible = page_scm_vbcs_frame.locator('wol-icon-text > div:nth-child(2) > div:nth-child(1) > span');
//   const isAtpDataVisible = page_scm_vbcs_frame.locator('wol-icon-text > div:nth-child(2) > div:nth-child(2) > span');
//   const isFutureStkDataVisible = page_scm_vbcs_frame.locator('wol-icon-text > div:nth-child(2) > div:nth-child(3) > span');

//   const productSearchAddBtn = page_scm_vbcs_frame.locator("button[aria-label='Add']")
//   await productSearchAddBtn.scrollIntoViewIfNeeded()
//   await productSearchAddBtn.waitFor({ state: 'visible', timeout: 8000 });
//   await expect(productSearchAddBtn).toBeVisible({ timeout: 8000 })
//   await expect(isWolStockQtyAvailable).toBeVisible({ timeout: 10000 });
//   await page_scm_vbcs_frame.locator("wol-product-card[id*='R40063']").click();
//   //temporary fix 
//   // await expect(page_scm_vbcs_frame.locator('oj-c-button.atp-button button[aria-label]:not([aria-label=""])')).toBeVisible({ timeout: 7000 })
//   await page_scm_vbcs_frame.locator("#btnBack").click()
//   await expect(isAvailableStockVisible).toBeVisible({ timeout: 12000 });
//   //await expect(isFeederDataVisible).toBeVisible({ timeout: 12000 });
//   // await expect(isAtpDataVisible).toBeVisible({ timeout: 12000 });
//   // await expect(isFutureStkDataVisible).toBeVisible({ timeout: 18000 });
//   await expect(page_scm_vbcs_frame.locator('wol-stock-quantity.oj-complete')).toHaveCount(1);
// })

// test.only("Validate Add product to basket layout and Validate Auto populate fields for R40063", async () => {
//   await page_scm_vbcs_frame.locator("button[aria-label='Add']").waitFor({ state: 'visible', timeout: 9000 })
//   await page_scm_vbcs_frame.locator("button[aria-label='Add']").click();
//   //const isPopForProduct ="";
//   //  await expect(page_scm_vbcs_frame.getByText('Save', { exact: true })).toBeVisible({ timeout: 6000 })

//   await expect(page_scm_vbcs_frame.getByText('Amend Fulfilment method', {exact : true})).toBeVisible({timeout: 3000 });
//   const dialog = page_scm_vbcs_frame.getByRole('dialog');

//   await dialog.locator('.wol-multi-column-dialog-column-items').first().locator('[role="button"]').first().click();
//   await page_scm_vbcs_frame.getByRole('button').filter({hasText: 'Confirm'}).click();
//   await page_scm_vbcs_frame.locator("div.product-lines div.product-line").waitFor({ state: 'visible', timeout: 40000 })
//   //changes related to Save and Exit 
//   // const isMoreActionsAvailable = "button[aria-label='More Actions']"
//   // const isMoreActionsMenuAvailable = "div[aria-label='More Actions']"
//   // await expect(page_scm_vbcs_frame.locator(isMoreActionsAvailable)).toBeVisible({ timeout: 3000 });
//   // await page_scm_vbcs_frame.locator(isMoreActionsAvailable).click();
//   // await expect(page_scm_vbcs_frame.locator(isMoreActionsMenuAvailable)).toBeVisible({ timeout: 9000 })
//   // await expect(page_scm_vbcs_frame.getByText('Save', { exact: true })).toBeVisible({ timeout: 6000 })
//   // await expect(page_scm_vbcs_frame.getByText('Save and Exit', { exact: true })).toBeVisible({ timeout: 3000 })
//   // await page_scm_vbcs_frame.locator(isMoreActionsAvailable).click();
//   // const isClearAllVisible = page_scm_vbcs_frame.locator("button[aria-label='Clear All']")
//   // expect(isClearAllVisible).toBeVisible()
//   // const productSelAddToBsktList = page_scm_vbcs_frame.locator("div.product-lines div.product-line")
//   // await expect(productSelAddToBsktList).toBeVisible()
//   // const isCollectionPanelAvailable = page_scm_vbcs_frame.locator("li.wolPanel div.oj-sm-justify-content-space-between.oj-divider-bottom")
//   // const addToBsktDecreaseBtn = page_scm_vbcs_frame.locator("button[aria-label='Decrease']")
//   // const addToBsktIncreaseBtn = page_scm_vbcs_frame.locator("button[aria-label='Increase']")
//   // const addToBsktDeleteBtn = page_scm_vbcs_frame.locator("div.product-details oj-c-button[label='Delete'] button[aria-label='Delete']")
//   // const isSubTotalDisplayed = page_scm_vbcs_frame.getByText('Sub Total');
//   // const isVATDisplayed = page_scm_vbcs_frame.getByText('VAT');
//   // const isTotalDisplayed = page_scm_vbcs_frame.getByText('Total', { exact: true });
//   // const isDeleteBtnAvailableCollBtn = page_scm_vbcs_frame.locator("div.oj-divider-bottom  button[aria-label='Delete']");
//   // const isMoveBtnAvailableCollBtn = page_scm_vbcs_frame.locator("div.oj-divider-bottom  button[aria-label='Move']");
//   // const isEditBtnAvailableCollBtn = page_scm_vbcs_frame.locator("div.oj-divider-bottom  button[aria-label='Edit']");
//   // await expect(isCollectionPanelAvailable).toBeVisible({ timeout: 5000 })
//   // await expect(isSubTotalDisplayed).toBeVisible();
//   // await expect(isVATDisplayed).toBeVisible();
//   // await expect(isTotalDisplayed).toBeVisible();
//   // await expect(addToBsktDecreaseBtn).toBeVisible();
//   // await expect(addToBsktIncreaseBtn).toBeVisible();
//   // await expect(addToBsktDeleteBtn).toBeVisible();
//   // await expect(isDeleteBtnAvailableCollBtn).toBeVisible();
//   // await expect(isMoveBtnAvailableCollBtn).toBeVisible();
//   //   await expect(page_scm_vbcs_frame.getByText('Amend Fulfilment method', {exact : true})).toBeVisible({timeout: 3000 });
//   // await page_scm_vbcs_frame.getByRole('button').filter({hasText: 'Confirm'}).click();
//   // await page_scm_vbcs_frame.locator("div.product-lines div.product-line").waitFor({ state: 'visible', timeout: 40000 })

//   //await expect(isEditBtnAvailableCollBtn).toBeVisible();
// })

// test.only("Validate the move button for both the products",async() => {

//     // await page_scm_vbcs_frame.getByRole('button').filter({hasText: 'Confirm'}).click();

//   const moveButton = page_scm_vbcs_frame.getByRole('button').filter({hasText: 'Move'});
//   const count = await moveButton.count();
//   for (let i = 0; i < count; i++) {


//   await moveButton.nth(i).click();

//   const movePopup = page_scm_vbcs_frame.getByRole('dialog');


//   await expect(movePopup).toBeVisible({ timeout: 10000 });


//   await expect(
//     movePopup.getByText('Choose the target bucket to move the lines to')).toBeVisible();

//   await movePopup.getByRole('button', { name: /close/i }).click();

//   await expect(movePopup).toBeHidden();
// }


// })

//till here


test("Validate Order Dialog pop up with Print and Edit Options", async () => {
  const customerContentSlotSelection = page_scm_vbcs_frame.locator("oj-sp-scoreboard-metric-card[card-title='Customer']");
  const customerSearchInputAvailable = page_scm_vbcs_frame.locator("input[aria-label='Customer Search']");
  const selectCustomerListed = page_scm_vbcs_frame.getByText('7000D54')
  const customerSearchResultsAvailable = page_scm_vbcs_frame.locator('oj-c-list-view.customer-list');
  const clickOnChangeButton = page_scm_vbcs_frame.locator('#btnChangeCustomer');
  const clickOnClearAllBtn = page_scm_vbcs_frame.locator("button[aria-label='Clear All']");

  await expect(page_scm_vbcs_frame.locator("button[aria-label='Clear All']")).toBeVisible({ timeout: 7000 })
  await expect(page_scm_vbcs_frame.locator("button[aria-label='Clear All']")).toBeEnabled({ timeout: 7000 })
  await page_scm_vbcs_frame.locator("button[aria-label='Checkout']").click({ force: true });
  //New Layout for Checkout Page
  await expect(page_scm_vbcs_frame.locator('h1', { hasText: 'Checkout' })).toBeVisible({ timeout: 8000 })
  await expect(page_scm_vbcs_frame.locator("oj-vb-fragment[name='wol-cp-customer-details']")).toBeVisible({ timeout: 8000 });
  await expect(page_scm_vbcs_frame.locator("oj-vb-fragment[name='wol-cp-payment-details']")).toBeVisible({ timeout: 8000 });
  await expect(page_scm_vbcs_frame.locator("li.wolPanel")).toBeVisible({ timeout: 8000 });
  await expect(page_scm_vbcs_frame.locator("  div.product-line")).toBeVisible({ timeout: 8000 });
  await page_scm_vbcs_frame.locator("button[aria-label='Submit']").click({ force: true });
  await expect(page_scm_vbcs_frame.locator("button[aria-label='Create Shipment']")).toBeVisible({ timeout: 20000 });
  await page_scm_vbcs_frame.locator("button[aria-label='Create Shipment']").click({ force: true });

  // const waitForPickingNoteHeaderText = page_scm_vbcs_frame.locator("//span[text()='Print picking note']");
  // const waitForEditBsktItemChk = page_scm_vbcs_frame.locator("//span[text()='Have you picked ALL stock items?']");
  // await expect(waitForPickingNoteHeaderText).toBeVisible();
  // await expect(waitForEditBsktItemChk).toBeVisible();
  // const isPrintBtnAvailableOnOrderDialog = page_scm_vbcs_frame.getByRole('button', { name: 'Print' });
  // await expect(isPrintBtnAvailableOnOrderDialog).toBeVisible();
  // const isEditBtnAvailableOnOrderDialog = page_scm_vbcs_frame.getByRole('button').filter({ hasText: 'Edit' });
  // await expect(isEditBtnAvailableOnOrderDialog).toBeVisible();
  // await expect(page_scm_vbcs_frame.locator("//button[text()='Confirm']")).toBeEnabled({ timeout: 30000 })   //     await page_scm_vbcs_frame.locator("//button[text()='Confirm']").click({timeout:5000});
  // await (page_scm_vbcs_frame.locator("//button[text()='Confirm']")).click();
  // expect(await page_scm_vbcs_frame.locator("#oj_gop1_h_pageTitle").textContent({ timeout: 8000 })).toMatchSnapshot(["OrderCapture/OrderConfirmation", "OrderConfirmationHeader.txt"]);
})

test("Validate Fulfillment Method Pop Up", async () => {
  await page_scm_vbcs_frame.locator("button[aria-label='Back']").click();
  // await page_scm_vbcs_frame.locator("button[aria-label='Clear All']").waitFor({timeout: 10000})
  // await page_scm_vbcs_frame.locator("button[aria-label='Clear All']").click();
  // await page_scm_vbcs_frame.locator("#clearAllConfirmation_layer button[aria-label='Continue']").waitFor({timeout: 10000});
  // await page_scm_vbcs_frame.locator("#clearAllConfirmation_layer button[aria-label='Continue']").click()
  // await page_scm_vbcs_frame.locator("input[aria-label='Product Search']").waitFor({state:'attached', timeout: 10000})
  // await expect( page_scm_vbcs_frame.locator("input[aria-label='Product Search']")).toBeEnabled({timeout : 5000})
  // await page_scm_vbcs_frame.locator("input[aria-label='Product Search']").waitFor({ timeout: 6000 });
  // await page_scm_vbcs_frame.locator("input[aria-label='Product Search']").fill(productWithoutStk)
  // await page_scm_vbcs_frame.locator("#searchInputContainer_tbProductSearch").click()
  // await page_scm_vbcs_frame.locator("[aria-label='Add']").click()
  await page_scm_vbcs_frame.locator("input[aria-label='Product Search']").fill(productWithStk)
  await page_scm_vbcs_frame.locator("#searchInputContainer_tbProductSearch").click()
  await page_scm_vbcs_frame.locator("[aria-label='Add']").click()
  await expect(page_scm_vbcs_frame.getByText('Amend Fulfilment method')).toBeVisible({ timeout: 5000 })
  await expect(page_scm_vbcs_frame.getByRole('button', { name: 'Cancel' })).toBeVisible({ timeout: 5000 })
  await expect(page_scm_vbcs_frame.getByRole('button', { name: 'Confirm' })).toBeVisible({ timeout: 5000 })
  await page_scm_vbcs_frame.getByRole('button', { name: 'Cancel' }).click()
})

test.skip("Validate Fufillment Method Changes in Basket Page", async () => {
  //  await page_scm_vbcs_frame.locator("aria-label='Clear All']").click();
  //  await expect(page_scm_vbcs_frame.getByRole('heading',{name:'Clear All'})).toBeVisible({timeout: 5000})
  //  await page_scm_vbcs_frame.locator("aria-label='Continue']").click()
  await page_scm_vbcs_frame.locator("input[aria-label='Product Search']").waitFor({ timeout: 6000 });
  console.log(await page_scm_vbcs_frame.locator("#requestedDate\\|input").inputValue())
  await page_scm_vbcs_frame.locator("input[aria-label='Product Search']").fill(productWithoutStk)
  await page_scm_vbcs_frame.locator("#searchInputContainer_tbProductSearch").click()
  await page_scm_vbcs_frame.locator("[aria-label='Add']").click()
})





