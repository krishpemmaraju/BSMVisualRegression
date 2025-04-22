import test, { expect } from "@playwright/test"


test.beforeEach("Open the Order Capture URL", async ({ page }) => {
    await page.goto("https://egvh-dev1.fa.em3.oraclecloud.com/fscmUI/redwood/wol-order-capture/main");
    await page.getByPlaceholder("User ID").fill("ABB7375");
    await page.getByPlaceholder("Password").fill("Varahi16$$");
    await page.getByRole("button").filter({ hasText: 'Sign In ' }).click();
    await page.waitForSelector("a[title='Home']");
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
    const paymentTextAvailable = page.locator("span[title='Payment Method']");
    const paymentContentSlotSelection = page.locator("oj-sp-scoreboard-metric-card[card-title='Payment Method']");
    const paymentContentHeaderAfterPaymentClick = page.locator("oj-vb-fragment-slot[name='content'] h1");
    

    await expect(paymentTextAvailable).toHaveText("Payment Method")
    await expect(paymentContentSlotSelection).toBeEnabled();
    await expect(paymentContentSlotSelection).toHaveScreenshot(["OrderCapture/PaymentContentSlot", "PaymentContentSlotClickable.png"])
    await paymentContentSlotSelection.click();
    await expect(paymentContentHeaderAfterPaymentClick).toHaveText("Payment")
})

test("Validate Customer PO section info Slot", async ({ page }) => {
    const customerPOTextAvailable = page.locator("span[title='Customer PO #']");
    const customerPOContentSlotSelection = page.locator("oj-sp-scoreboard-metric-card[card-title='Customer PO #']");
    const customerPOContentHeaderAfterClick = page.locator("oj-vb-fragment-slot[name='content'] h1");
    

    await expect(customerPOTextAvailable).toHaveText("Customer PO #")
    await expect(customerPOContentSlotSelection).toBeEnabled();
    await expect(customerPOContentSlotSelection).toHaveScreenshot(["OrderCapture/CustomerPOContentSlot", "CustomerPOContentSlotClickable.png"])
    await customerPOContentSlotSelection.click();
    await expect(customerPOContentHeaderAfterClick).toHaveText("Order Details")
})


test("Validate filter buttons on Order Capture Page", async({page}) => {
    const gridView =  page.locator("span[role='toolbar']").filter({has: page.getByLabel('Grid View')})

    await expect(gridView).toHaveScreenshot(["OrderCapture/ContentSlotSection", "GridViewButtonOnContentSlotSection.png"])
})

test("Validate Cancel and Save buttons on Content Slot Page", async ({ page }) => {
    const cancelBtnOnContentSlot = page.getByRole('button', { name: 'Cancel' })
    const saveBtnOnContentSlot = page.getByRole('button', { name: 'Save' })
    await expect(cancelBtnOnContentSlot).toHaveScreenshot(["OrderCapture/ContentSlotSection", "CancelButtonOnContentSlotSection.png"])
    await expect(saveBtnOnContentSlot).toHaveScreenshot(["OrderCapture/ContentSlotSection", "SaveButtonOnContentSlotSection.png"])
})

test("Validate Detail Slot (Add Basket Section) in Order Capture Page", async ({ page }) => {
    const detailSlotSection = page.locator("[id*='detail_slot']")
    await expect(detailSlotSection).toHaveScreenshot(["OrderCapture/DetailSlotSection", "DetailSlotSectionOnOrderCapturePage.png"])
})

test("Validate Extended button under Detail Slot section", async({page}) => {
    const extendedBtnOnDetailSlot = page.getByRole('button', { name: 'Extended' })
    await expect(extendedBtnOnDetailSlot).toHaveScreenshot(["OrderCapture/DetailSlotSection", "ExtendedBtnDetailSlotSectionOnOrderCapturePage.png"])
})

test.afterEach("Sign Out from application", async ({ page }) => {
    await page.locator("a[title='Settings and Actions']").click()
    await page.locator("a[title='Sign Out']").click()
    await page.waitForSelector('#Confirm', { state: 'visible' })
    await page.locator('#Confirm').click()
})