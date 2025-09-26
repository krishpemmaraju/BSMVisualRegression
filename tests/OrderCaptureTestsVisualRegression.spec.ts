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

test("test the data ", async ({ page }) => {
    console.log("sample test");
    console.log("Good Test data")
});

test("Validate Submit button", async ({ page }) => {
    const submitButton = page.getByRole("button", { name: 'Submit' });
    await expect(submitButton).toHaveScreenshot(["OrderCapture/SubmitButton", "SubmitBtnOnOrderCapturePage.png"])
})

test("Validate Buttons on info Slot", async ({ page }) => {
    const productListBtn = page.getByRole("button", { name: 'Product List' });
    const customerBtn = page.getByRole("button", { name: 'Customer' });
    const paymentBtn = page.getByRole("button", { name: 'Payment' });
    const shippingBtn = page.getByRole("button", { name: 'Shipping' });
    const orderDetailsBtn = page.getByRole("button", { name: 'Order Details' });

    await expect(productListBtn).toHaveScreenshot(["OrderCapture/InfoSlotButtons", "ProductListBtnOrderCapturePage.png"])
    await expect(customerBtn).toHaveScreenshot(["OrderCapture/InfoSlotButtons", "CustomerBtnOnOrderCapturePage.png"])
    await expect(paymentBtn).toHaveScreenshot(["OrderCapture/InfoSlotButtons", "PaymentBtnOnOrderCapturePage.png"])
    await expect(shippingBtn).toHaveScreenshot(["OrderCapture/InfoSlotButtons", "ShippingBtnOnOrderCapturePage.png"])
    await expect(orderDetailsBtn).toHaveScreenshot(["OrderCapture/InfoSlotButtons", "OrderDetailsBtnOnOrderCapturePage.png"])
})

test("Validate Buttons text on info Slot", async ({ page }) => {
    const productListBtn = page.getByRole("button", { name: 'Product List' });
    const customerBtn = page.getByRole("button", { name: 'Customer' });
    const paymentBtn = page.getByRole("button", { name: 'Payment' });
    const shippingBtn = page.getByRole("button", { name: 'Shipping' });
    const orderDetailsBtn = page.getByRole("button", { name: 'Order Details' });

    await expect(productListBtn).toHaveText("Product List")
    await expect(customerBtn).toHaveText("Customer")
    await expect(paymentBtn).toHaveText("Payment")
    await expect(shippingBtn).toHaveText("Shipping")
    await expect(orderDetailsBtn).toHaveText("Order Details")
})

test("Validate Buttons enable and visible info Slot", async ({ page }) => {
    const productListBtn = page.getByRole("button", { name: 'Product List' });
    const customerBtn = page.getByRole("button", { name: 'Customer' });
    const paymentBtn = page.getByRole("button", { name: 'Payment' });
    const shippingBtn = page.getByRole("button", { name: 'Shipping' });
    const orderDetailsBtn = page.getByRole("button", { name: 'Order Details' });

    await expect(productListBtn).toBeVisible()
    await expect(productListBtn).toBeEnabled()
    await expect(customerBtn).toBeVisible()
    await expect(customerBtn).toBeEnabled()
    await expect(paymentBtn).toBeVisible()
    await expect(paymentBtn).toBeEnabled()
    await expect(shippingBtn).toBeVisible()
    await expect(shippingBtn).toBeEnabled()
    await expect(orderDetailsBtn).toBeVisible()
    await expect(orderDetailsBtn).toBeEnabled()
})

test("Validate Content Slot in Order Capture Page", async ({ page }) => {
    const contentSlotSection = page.locator("[id*='contentt_slot']")
    await expect(contentSlotSection).toHaveScreenshot(["OrderCapture/ContentSlotSection", "ContentSlotSectionOnOrderCapturePage.png"])
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