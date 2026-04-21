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
    vbcs_password = Buffer.from('RGF0dGF2YXJhaGkxNiQk', 'base64').toString('utf-8');
    scm_user = Buffer.from('a2F0aGlyYXZhbi5z', 'base64').toString('utf-8');
    scm_password = Buffer.from('S2F0aGlyZGV2YUAyNTA3', 'base64').toString('utf-8');
  }
  if (process.env.ENV == "tst") {
    vbcs_url = "https://vb03.wolseleyuk.com/ic/builder/rt/wol-order-capture/live/webApps/wol-order-capture/vp/";
    scm_url = "https://egvh-dev2.fa.em3.oraclecloud.com/";
    vbcs_user = Buffer.from('a2F0aGlyYXZhbi5zQHdvbHNlbGV5LmNvLnVr', 'base64').toString('utf-8');
    vbcs_password = Buffer.from('QXByNTkwNyNA', 'base64').toString('utf-8');
    scm_user = Buffer.from('a2F0aGlyYXZhbi5z', 'base64').toString('utf-8')
    scm_password = Buffer.from('S2F0aGlyZGV2YUAyNTA3', 'base64').toString('utf-8')
    productWithStk = "R40001";
    productWithoutStk = "R40063"
  }
  if (process.env.ENV == "dev") {
    vbcs_url = "https://vb04.wolseleyuk.com/ic/builder/rt/wol-order-capture/live/webApps/wol-order-capture/vp/";
    scm_url = "https://egvh-dev1.fa.em3.oraclecloud.com/";
    vbcs_user = Buffer.from('a3Jpc2huYS5wZW1tYXJhanVAd29sc2VsZXkuY28udWs=', 'base64').toString('utf-8');
    vbcs_password = Buffer.from('RGF0dGF2YXJhaGkxNiQk', 'base64').toString('utf-8');
    scm_user = Buffer.from('QUJCNzM3NQ==', 'base64').toString('utf-8')
    scm_password = Buffer.from('SmF5YXZhcmFoaTE2JA==', 'base64').toString('utf-8')
    productWithStk = "508200";
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
  await page_vbcs.locator("input[value='Yes']").click({ force: true });
  await page_vbcs.waitForLoadState('networkidle');
  await page_vbcs.getByRole('heading').filter({ hasText: 'Order Capture' }).waitFor({ state: 'visible', timeout: 50000 })
  const storageState = await context_vbcs.storageState();
  //launching second browser 
  browser_scm = await firefox.launch({
    slowMo: 2000
  });
  context_scm = await browser_scm.newContext({ storageState });
  page_scm = await context_scm.newPage();
  await page_scm.goto(scm_url);
  await page_scm.getByText("Username").fill(scm_user);
await page_scm.locator('input[type="password"]').fill(scm_password);
  await page_scm.getByRole("button").filter({ hasText: 'Next ' }).click();
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
    await page_scm.locator("button[aria-label='Create Order']").nth(0).click();
    page_scm_vbcs_frame = page_scm.frameLocator('iframe[src*="wol-order-capture/live"]');
  }
});

test("Getting Order Capture", async () => {
  await expect(page_scm_vbcs_frame.getByText('Order Capture',{exact : true})).toBeVisible({timeout : 10000});
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
  await expect(page_scm_vbcs_frame.locator('[role="dialog"][aria-label="Date and Time Picker"]')).toBeVisible({ timeout: 4000 });
  await page_scm_vbcs_frame.getByRole('button', { name: 'Done' }).scrollIntoViewIfNeeded();
  await page_scm_vbcs_frame.getByRole('button', { name: 'Done' }).click();
})

test("Validate Product search input is present", async () => {
  const getSearchBarElement = page_scm_vbcs_frame.locator("//span[@id='tbProductSearch|hint']");
  await expect (getSearchBarElement).toBeVisible({timeout : 7000});
})

test("Validate Checkout button", async () => {
  const submitButton = page_scm_vbcs_frame.locator("button[aria-label='Checkout']").nth(0);
  await expect(submitButton).toHaveScreenshot(["OrderCapture/CheckoutButton", "CheckoutBtnOnOrderCapturePage.png"])
})

test("Validate Product List slot", async () => {
  const prodSearchInputSlot = page_scm_vbcs_frame.locator("//span[@id='tbProductSearch|hint']");
  await prodSearchInputSlot.waitFor({ timeout: 5000 })
  await prodSearchInputSlot.scrollIntoViewIfNeeded();
  await prodSearchInputSlot.fill(productWithStk)
  const productSearchSlot = page_scm_vbcs_frame.locator("wol-product-card__pointer-wrapper");
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

test("Validate Product Details page", async () => {
  await page_scm_vbcs_frame.locator("//span[@id='tbProductSearch|hint']").waitFor({ timeout: 6000 });
  await page_scm_vbcs_frame.locator("//span[@id='tbProductSearch|hint']").fill(productWithStk)
  await page_scm_vbcs_frame.locator("div.AvatarStyles_base__167n05h0.AvatarStyles_image__167n05h3").nth(0).click()
  const getAlternateProductLink = page_scm_vbcs_frame.locator("div.oj-collapsible-header-wrapper").nth(0);
  const getRelatedProducts = page_scm_vbcs_frame.locator("div.oj-collapsible-header-wrapper").nth(1);
  await expect(getAlternateProductLink).toHaveText("Alternate Products");
  await expect(getRelatedProducts).toHaveText("Related Products");
  await page_scm_vbcs_frame.locator('.oj-ux-ico-arrow-left').click();
    await page_scm_vbcs_frame.locator("//span[@id='tbProductSearch|hint']").waitFor({ timeout: 6000 });
  await page_scm_vbcs_frame.locator("//span[@id='tbProductSearch|hint']").fill(productWithStk)

})

test("Validate Add button on Product Search Page section for available product having stock", async () => {
  const isWolStockQtyAvailable = page_scm_vbcs_frame.locator('.oj-typography-body-xs oj-typography-bold oj-text-color-success');
  const productSearchAddBtn = page_scm_vbcs_frame.locator("button[aria-label='Add']").first();
  await productSearchAddBtn.scrollIntoViewIfNeeded();
  await productSearchAddBtn.click();
  await productSearchAddBtn.waitFor({ state: 'visible', timeout: 8000 });
  await expect(productSearchAddBtn).toBeVisible({ timeout: 8000 })
  const moveButton = page_scm_vbcs_frame.locator("button[aria-label='Actions for collect basket group']");
  await moveButton.click();
  await page_scm_vbcs_frame.locator("//a[@data-oj-label='Move']").click();
  await page_scm_vbcs_frame.getByRole('button', { name: 'Cancel' }).click();
  await page_scm_vbcs_frame.locator('#tbProductSearch\\|input').fill(productWithStk);
  await page_scm_vbcs_frame.locator("div.AvatarStyles_base__167n05h0.AvatarStyles_image__167n05h3").nth(0).click();
  await page_scm_vbcs_frame.locator("button[aria-label='Add to Basket']").nth(0).click();
  await page_scm_vbcs_frame.locator('.oj-ux-ico-arrow-left').click();
    await page_scm_vbcs_frame.locator("//span[@id='tbProductSearch|hint']").waitFor({ timeout: 6000 });
  await page_scm_vbcs_frame.locator("//span[@id='tbProductSearch|hint']").fill(productWithStk)

})

test("Validate Add button on Product Search Page section for product having 0 stock", async () => {
  const isWolStockQtyAvailable = page_scm_vbcs_frame.locator('span.oj-typography-body-xs.oj-typography-bold.oj-text-color-success');
  const isAvailableStockVisible = page_scm_vbcs_frame.locator('wol-icon-text > div:nth-child(1) > div > span');
  const isFeederDataVisible = page_scm_vbcs_frame.locator('wol-icon-text > div:nth-child(2) > div:nth-child(1) > span');
  const isAtpDataVisible = page_scm_vbcs_frame.locator('wol-icon-text > div:nth-child(2) > div:nth-child(2) > span');
  const isFutureStkDataVisible = page_scm_vbcs_frame.locator('wol-icon-text > div:nth-child(2) > div:nth-child(3) > span');
  const productSearchAddBtn = page_scm_vbcs_frame.locator("button[aria-label='Add']")
  await productSearchAddBtn.scrollIntoViewIfNeeded()
  await productSearchAddBtn.waitFor({ state: 'visible', timeout: 8000 });
  await expect(productSearchAddBtn).toBeVisible({ timeout: 8000 })
  await expect(isWolStockQtyAvailable).toBeVisible({ timeout: 10000 });
  await page_scm_vbcs_frame.locator('#tbProductSearch\\|input').fill(productWithoutStk);
  await expect(page_scm_vbcs_frame.locator("button[aria-label='Add']")).toHaveCount(1);

})

test("Validate Add product to basket layout and Validate Auto populate fields", async () => {
  await page_scm_vbcs_frame.locator("button[aria-label='Add']").waitFor({ state: 'visible', timeout: 9000 })
  await page_scm_vbcs_frame.locator("button[aria-label='Add']").click()
  await page_scm_vbcs_frame.locator("button[aria-label='OK']").click()
  await page_scm_vbcs_frame.locator("div.oj-md-padding-2x.basket-item-list").waitFor({ state: 'visible', timeout: 40000 })
  const isMoreActionsAvailable = "button[aria-label='More Actions']"
  const isClearAllVisible = page_scm_vbcs_frame.locator("button[aria-label='Clear All']")
  expect(isClearAllVisible).toBeVisible()
  const productSelAddToBsktList = page_scm_vbcs_frame.locator("div.oj-md-padding-2x.basket-item-list")
  await expect(productSelAddToBsktList).toBeVisible()
  const isCollectionPanelAvailable = page_scm_vbcs_frame.locator("//li[@class='wolPanel']//div[@aria-label='Collect basket group with 1 item']");
  const addToBsktDecreaseBtn = page_scm_vbcs_frame.locator("button[aria-label='Decrease']").first();
  const addToBsktIncreaseBtn = page_scm_vbcs_frame.locator("button[aria-label='Increase']").first();
  await expect(addToBsktDecreaseBtn).toBeVisible();
  await expect(addToBsktIncreaseBtn).toBeVisible();

})

test("Validate Detail Slot (Add Basket Section) in Order Capture Page", async () => {
  const detailSlotSection = page_scm_vbcs_frame.locator("oj-vb-fragment-slot[name='detail']")
  await expect(detailSlotSection).toHaveScreenshot(["OrderCapture/DetailSlotSection", "DetailSlotSectionOnOrderCapturePage.png"])
})

test("Validate Order Dialog pop up with Print and Edit Options", async () => {
  await expect(page_scm_vbcs_frame.locator("button[aria-label='Clear All']")).toBeVisible({ timeout: 7000 })
  await expect(page_scm_vbcs_frame.locator("button[aria-label='Clear All']")).toBeEnabled({ timeout: 7000 })
  await page_scm_vbcs_frame.locator("button[aria-label='Checkout']").nth(1).click({ timeout: 20000 });
  await page_scm_vbcs_frame.locator("span.oj-ux-ico-chevron-right").first().click({ timeout: 20000 });
  await expect(page_scm_vbcs_frame.locator("button[aria-label='Edit']")).toBeVisible({timeout : 30000});
  await expect(page_scm_vbcs_frame.locator('text=Method of Payment')).toBeVisible({ timeout: 8000 });
  const MoreActions = page_scm_vbcs_frame.locator("button[aria-label='More Actions']");
  await MoreActions.click();
  await expect(page_scm_vbcs_frame.getByText('Save and Exit', { exact: true })).toBeVisible({ timeout: 6000 })
  await expect(page_scm_vbcs_frame.getByText('New Order', { exact: true })).toBeVisible({ timeout: 3000 })  
  await expect(page_scm_vbcs_frame.locator('div.oj-bg-neutral-0.oj-flex').nth(0)).toBeVisible({ timeout: 8000 });
  await expect(page_scm_vbcs_frame.getByText('Customer', { exact: true }).locator('xpath=ancestor::div[contains(@class,"oj-bg-neutral-0")]')).toBeVisible({timeout: 8000});
  await expect(page_scm_vbcs_frame.locator("button[aria-label='Edit']")).toBeVisible({ timeout: 8000 });
  await expect(page_scm_vbcs_frame.getByText('Order Comments')).toBeVisible({ timeout: 5000 })
  await page_scm_vbcs_frame.locator("button[aria-label='Place Order']").click({ force: true });

})

test.skip("Validate Fulfillment Method Pop Up", async () => {
  await page_scm_vbcs_frame.locator("button[aria-label='Back']").click();
  await page_scm_vbcs_frame.locator("input[aria-label='Product Search']").fill(productWithStk)
  await page_scm_vbcs_frame.locator("#searchInputContainer_tbProductSearch").click()
  await page_scm_vbcs_frame.locator("[aria-label='Add']").click()
  await expect(page_scm_vbcs_frame.getByText('Amend Fulfillment method')).toBeVisible({ timeout: 5000 })
  await expect(page_scm_vbcs_frame.getByRole('button', { name: 'Cancel' })).toBeVisible({ timeout: 5000 })
  await expect(page_scm_vbcs_frame.getByRole('button', { name: 'Confirm' })).toBeVisible({ timeout: 5000 })
  await page_scm_vbcs_frame.getByRole('button', { name: 'Cancel' }).click()
})

test.skip("Validate Fufillment Method Changes in Basket Page", async () => {
  await page_scm_vbcs_frame.locator("input[aria-label='Product Search']").waitFor({ timeout: 6000 });
  console.log(await page_scm_vbcs_frame.locator("#requestedDate\\|input").inputValue())
  await page_scm_vbcs_frame.locator("input[aria-label='Product Search']").fill(productWithoutStk)
  await page_scm_vbcs_frame.locator("#searchInputContainer_tbProductSearch").click()
  await page_scm_vbcs_frame.locator("[aria-label='Add']").click()
})