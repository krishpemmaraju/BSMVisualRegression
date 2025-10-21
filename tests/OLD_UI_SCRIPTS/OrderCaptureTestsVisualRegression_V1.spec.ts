import test, { expect } from "@playwright/test"
import { TIMEOUT } from "dns/promises";


test.beforeEach("Open the Order Capture URL", async ({ page }) => {
    //fscmUI/redwood/wol-order-capture/main
    await page.goto("https://egvh-dev1.fa.em3.oraclecloud.com/");
    await page.getByPlaceholder("User ID").fill("ABB7375");
    await page.getByPlaceholder("Password").fill("Varahi$$16");
    await page.getByRole("button").filter({ hasText: 'Sign In ' }).click();
    await page.waitForSelector("a[title='Home']");
    await page.locator("a[title='Home']").click();
    await page.waitForSelector("#groupNode_order_management",{timeout:6000});
    await page.locator("#groupNode_order_management").click();
    await page.getByRole('link',{name:'Wolseley Order Capture'}).waitFor({state:'visible',timeout:7000});
    await expect(page).toHaveScreenshot(["OrderCapture", "OrderCaptureUnderOrderMgmtFullScreenshot.png"], { fullPage: true });
    const orderCaptureLink = page.getByRole('link',{name:'Wolseley Order Capture'});
    await expect(orderCaptureLink).toBeVisible();
    await page.getByRole('link',{name:'Wolseley Order Capture'}).click();
    await page.locator("#ojHeader_pageTitle").filter({hasText:'Order Capture'}).waitFor({state:'visible',timeout:9000})
})

test("Order Capture - Full Page Screenshot", async ({ page }) => {
    await expect(page).toHaveScreenshot(["OrderCapture", "OrderCaptureFullScreenshot.png"], { fullPage: true });
})

test("Validate Order Capture Header Text", async ({ page }) => {
    expect(await page.locator("#ojHeader_pageTitle").textContent()).toMatchSnapshot(["OrderCapture/HeaderTexts", "OrderCapturePageHeader.txt"]);
    expect(await page.locator("#ojHeader_pageSubtitle").textContent()).toMatchSnapshot(["OrderCapture/HeaderTexts", "OrderCapturePageSubHeader.txt"]);
})

test("Validate Product search input is present", async ({ page }) => {
    const getSearchBarElement = page.getByRole('textbox', { name: 'Product Search' })
    await expect(getSearchBarElement).toHaveAttribute('aria-label', 'Product Search')
})

test("Validate Submit button", async ({ page }) => {
    const submitButton = page.getByRole("button", { name: 'Submit' });
    await expect(submitButton).toHaveScreenshot(["OrderCapture/SubmitButton", "SubmitBtnOnOrderCapturePage.png"])
})

test("Validate Select Customer section info Slot", async ({ page }) => {
    const customerTextAvailable = page.locator("span[title='Customer']");
    const selectCustomerText = page.locator("div[title='Select Customer...']");
    const clickToSelectCustomer = page.locator("span[title='Click to select a customer']");
    const customerContentSlotSelection = page.locator("oj-sp-scoreboard-metric-card[card-title='Customer']");
    const searchInputAvailableAfterClickCustomer = page.locator("input[aria-label='Customer Search']")


    await expect(customerTextAvailable).toHaveText("Customer")
    await expect(selectCustomerText).toHaveText("Select Customer...")
    await expect(clickToSelectCustomer).toHaveText("Click to select a customer")
    await expect(customerContentSlotSelection).toBeEnabled();
    await customerContentSlotSelection.click();
    await expect(searchInputAvailableAfterClickCustomer).toBeVisible()
    await expect(searchInputAvailableAfterClickCustomer).toHaveScreenshot(["OrderCapture/CustomerContentSlot", "CustomerSearchInputTextBox.png"])
    await expect(customerContentSlotSelection).toHaveScreenshot(["OrderCapture/CustomerContentSlot", "CustomerContentSlotClickable.png"])
})

test("Validate Payment section info Slot", async ({ page }) => {
    const clickOnPaymentBtn = page.locator("span[title='Payment Method']");
    const paymentTextAvailable = page.locator("span[title='Payment Method']");
    const paymentContentSlotSelection = page.locator("oj-vb-fragment[name='wol-oc-payment']");
    const paymentAccountButton = page.getByRole('button', {name:'Account'});

    await clickOnPaymentBtn.click();
    await expect(paymentTextAvailable).toHaveText("Payment Method")
    await expect(paymentContentSlotSelection).toBeVisible();
    await expect(paymentContentSlotSelection).toHaveScreenshot(["OrderCapture/PaymentContentSlot", "PaymentContentSlotClickable.png"])
    await expect(paymentAccountButton).toBeVisible();
})

test("Validate Shipment method section layout", async({page})=> {
    const shipmentMethodSection = page.locator("oj-sp-scoreboard-metric-card[card-title='Shipping Method']")
    const shipmentContentAvaialble = page.locator("oj-vb-fragment[name='wol-oc-shipping']")
    const getTextOfShippingDelivery = page.locator("oj-vb-fragment[name='wol-oc-shipping']").filter({has: page.locator("oj-vb-fragment-slot[name='content']")}).
      filter({has:page.locator("div[class*='oj-flex']")}).filter({has:page.locator("span")});
  
    await expect(shipmentMethodSection).toBeVisible();
    await shipmentMethodSection.click();
    await expect(shipmentContentAvaialble).toBeVisible();
    expect(await getTextOfShippingDelivery.textContent()).toContain("Shipping and Delivery")
   
})

test("Validate Customer PO section info Slot", async ({ page }) => {
    const customerPOTextAvailable = page.locator("span[title='Customer PO #']");
    const customerPOContentSlotSelection = page.locator("oj-sp-scoreboard-metric-card[card-title='Customer PO #']");
    const customerPOContentHeaderAfterClick = page.locator("oj-vb-fragment[name='wol-oc-order-details']").filter({has: page.locator("oj-vb-fragment-slot[name='content']")}).
    filter({has:page.locator("div[class*='oj-flex']")}).filter({has:page.locator("span")});
    const customerOrderInputTextAVailable = page.getByLabel("Customer Order Number")
    const requiredByDateInputAvailable = page.locator("div[class*='oj-inputdatetime-input-container']").filter({has: page.getByRole('combobox')})

    await expect(customerPOTextAvailable).toHaveText("Customer PO #")
    await expect(customerPOContentSlotSelection).toBeEnabled();
    await expect(customerPOContentSlotSelection).toHaveScreenshot(["OrderCapture/CustomerPOContentSlot", "CustomerPOContentSlotClickable.png"])
    await customerPOContentSlotSelection.click();
    expect(await customerPOContentHeaderAfterClick.textContent()).toContain("Order Details")
    await expect(customerOrderInputTextAVailable).toBeVisible();
    await expect(requiredByDateInputAvailable).toBeVisible();
})


test("Validate filter buttons on Order Capture Page", async ({ page }) => {
    const gridView = page.locator("span[role='toolbar']").filter({ has: page.getByLabel('Grid View') })

    await expect(gridView).toHaveScreenshot(["OrderCapture/ContentSlotSection", "GridViewButtonOnContentSlotSection.png"])
})

test.skip("Validate Cancel and Save buttons on Payment Slot Page", async ({ page }) => {
    await page.locator("oj-sp-scoreboard-metric-card[card-title='Payment Method']").click({ timeout: 2000 })
    const cancelBtnOnContentSlot = page.getByRole('button', { name: 'Cancel' })
    const saveBtnOnContentSlot = page.getByRole('button', { name: 'Save' })
    await expect(cancelBtnOnContentSlot).toHaveScreenshot(["OrderCapture/PaymentContentSlotSection", "CancelButtonOnPaymentContentSlotSection.png"])
    await expect(saveBtnOnContentSlot).toHaveScreenshot(["OrderCapture/PaymentContentSlotSection", "SaveButtonOnPaymentContentSlotSection.png"])
})

test("Validate Cancel and Save buttons on Customer PO Slot Page", async ({ page }) => {
    await page.locator("oj-sp-scoreboard-metric-card[card-title='Customer PO #']").click()
    const cancelBtnOnContentSlot = page.getByRole('button', { name: 'Cancel' })
    const saveBtnOnContentSlot = page.getByRole('button', { name: 'Save' })
    await expect(cancelBtnOnContentSlot).toHaveScreenshot(["OrderCapture/CustomerPOContentSlotSection", "CancelButtonOnCustomerPOContentSlotSection.png"])
    await expect(saveBtnOnContentSlot).toHaveScreenshot(["OrderCapture/CustomerPOContentSlotSection", "SaveButtonOnCustomerPOContentSlotSection.png"])
})


test("Validate Product List slot", async ({ page }) => {
    await page.locator("input[aria-label='Product Search']").fill("219500")
    const productSearchSlot = page.getByRole('grid').filter({ has: page.locator("wol-product-card") })
    await expect(productSearchSlot).toBeVisible()
    await expect(productSearchSlot).toHaveScreenshot(["OrderCapture/ProductListSlotSection", "ProductListContentSlotSection.png"], { maxDiffPixels: 100, maxDiffPixelRatio: 0.02 })
})

test("Validate Product Details page", async({page})=> {
    await page.locator("input[aria-label='Product Search']").fill("219500")
    await page.locator("wol-product-card[id*='219500']").click();
    const getQuantityLabel = page.getByLabel("Quantity");
    const addBtnOnProdDetailsPage = page.getByRole('button',{name:'Add'});
    const productDetailsText = page.locator("//span[text()='Product Details']");
    const getProductDetailsText = page.locator(".oj-flex-item h4").nth(0);
    const getProductFeaturesText = page.locator(".oj-flex-item h4").nth(1);

    await expect(getQuantityLabel).toBeVisible();
    await expect(addBtnOnProdDetailsPage).toBeVisible();
    await expect(productDetailsText).toHaveText("Product Details");
    await expect(getProductDetailsText).toHaveText("Product details");
    await expect(getProductFeaturesText).toHaveText("Product features");
})

test("Validate Add button on Product List section", async ({ page }) => {
    await page.locator("input[aria-label='Product Search']").fill("219500")
    const productSearchAddBtn = page.getByRole('button', { name: 'Add' })
    await expect(productSearchAddBtn).toBeVisible()
})

test("Validate Add product to basket section", async ({ page }) => {
    await page.locator("input[aria-label='Product Search']").fill("219500")
    const productSearchAddBtn = page.getByRole('button', { name: 'Add' })
    await productSearchAddBtn.click()
    await page.waitForSelector("[class*='oj-listview-item']", { state: 'visible', timeout: 15000 })
    const productSelAddToBsktList = page.locator("[class='oj-listview-cell-element']")
    await expect(productSelAddToBsktList).toBeVisible()
    await expect(productSelAddToBsktList).toHaveScreenshot(["OrderCapture/AddToProductBasketSlotSection", "AddToProductBasketSlotSection.png"])
})

test("Validate Add product to basket layout", async ({ page }) => {
    await page.locator("input[aria-label='Product Search']").fill("D53216")
    await page.getByRole('button', { name: 'Add' }).waitFor({ state: 'visible', timeout: 9000 })
    const productSearchAddBtn = page.getByRole('button', { name: 'Add' })
    await productSearchAddBtn.click()
    await page.waitForSelector("[class*='oj-listview-item']", { state: 'visible', timeout: 15000 })
    const productSelAddToBsktList = page.locator("[class='oj-listview-cell-element']")
    await expect(productSelAddToBsktList).toBeVisible()
    const addToBsktDecreaseBtn = page.locator("button[aria-label='Decrease']")
    const addToBsktIncreaseBtn = page.locator("button[aria-label='Increase']")
    const addToBsktDeleteBtn = page.locator("button[aria-label='Delete']")
    await expect(addToBsktDecreaseBtn).toBeVisible();
    await expect(addToBsktIncreaseBtn).toBeVisible();
    await expect(addToBsktDeleteBtn).toBeVisible();

})

test("Validate Detail Slot (Add Basket Section) in Order Capture Page", async ({ page }) => {
    const detailSlotSection = page.locator("oj-vb-fragment-slot[name='detail']")
    await expect(detailSlotSection).toHaveScreenshot(["OrderCapture/DetailSlotSection", "DetailSlotSectionOnOrderCapturePage.png"])
})

test("validate Customer Selection panel", async ({ page }) => {
    await page.locator("span[title='Customer']").click()
    const isCustomerSearchDisplayed = page.locator("input[aria-label='Customer Search']")
    await expect(isCustomerSearchDisplayed).toBeVisible()
    await page.locator("input[aria-label='Customer Search']").fill("Swales")
    const isListOfCustomersDisplayed = page.locator("css=div[class*='ListStyles_listStyles']")
    await expect(isListOfCustomersDisplayed).toBeVisible()

})

test("Validate Order Dialog pop up with Print and Edit Options", async ({ page }) => {
    await page.locator("input[aria-label='Product Search']").fill("D53216")
    await page.getByRole('button', { name: 'Add' }).waitFor({ state: 'visible', timeout: 15000 })
    const productSearchAddBtn = page.getByRole('button', { name: 'Add' })
    await productSearchAddBtn.click()
    await page.waitForSelector("div[class='oj-listview-cell-element']", { state: 'visible', timeout: 16000 })
    const productSelAddToBsktList = page.locator("div[class='oj-listview-cell-element']")
    await expect(productSelAddToBsktList).toBeVisible({ timeout: 12000 });
    const clickOnSubmitBtn = page.getByRole('button', { name: 'Submit' });
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

test.skip("Validate Extended button under Detail Slot section", async ({ page }) => {
    const extendedBtnOnDetailSlot = page.getByRole('button', { name: 'Extended' })
    await expect(extendedBtnOnDetailSlot).toHaveScreenshot(["OrderCapture/DetailSlotSection", "ExtendedBtnDetailSlotSectionOnOrderCapturePage.png"])
})


test.afterEach("Sign Out from application", async ({ page }) => {
    await page.locator("a[title='Settings and Actions']").click()
    await page.locator("a[title='Sign Out']").click()
    await page.waitForSelector('#Confirm', { state: 'visible' })
    await page.locator('#Confirm').click()
})