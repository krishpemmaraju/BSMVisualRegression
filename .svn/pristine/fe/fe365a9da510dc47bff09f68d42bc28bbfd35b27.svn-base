import test, { expect} from "@playwright/test"


test.beforeEach("Open the URL", async({page})=> {
    await page.goto("https://simple-html-lime.vercel.app/");
})

test.skip("Visual Regression Test - Full Page Screenshot", async({page}) => {
    await expect(page).toHaveScreenshot(["VisualTest","InitalUIPageScreenshot.png"],{fullPage: true});
});

test.skip("Visual Regression Test - Max Diff Pixels Allowed", async({page}) => {
    await expect(page).toHaveScreenshot(["VisualTest","InitalUIPageScreenshot.png"],{fullPage: true , maxDiffPixels:2000});
});

test.skip("Visual Regression Test - Max Diff Pixels ratio Allowed", async({page}) => {
    await expect(page).toHaveScreenshot(["VisualTest","InitalUIPageScreenshot.png"],{fullPage: true , maxDiffPixelRatio:0.20});
});

test.skip("Visual Regression Test - Masking the Image", async({page}) => {
   await expect(page).toHaveScreenshot(["VisualTest","InitalUIPageMaskingScreenshot.png"],{fullPage: true,mask:[ page.locator('table tr td:nth-child(5)')]});
});

test.skip("Visual Regression Test - Validate with the Header Text", async({page}) => {
   expect(await page.locator(".header1").textContent()).toMatchSnapshot(["VisualTest","headingText.txt"]);

});

test.skip("Visual Regression Test - Validate with the CSS File", async({page}) => {
     await expect(page).toHaveScreenshot(["VisualTest","cssImageData.png"],{mask:[ page.locator('table tr td:nth-child(5)')],stylePath:"visualTest.css"});
});

test.skip("Visual Testing with CSS", async({page})=> {
    const buttonCls =  page.locator('.btn');
    await expect(buttonCls).toHaveCSS('width', '100px'); 
    await expect(buttonCls).toHaveCSS('height', '40px');
    await expect(buttonCls).toHaveCSS('font-size', '50px');
    // Optional: Combine with visual testing
    await expect(buttonCls).toHaveScreenshot(["VisualCSSTesting","CSSVisualTesting.png"]);
});

test.skip("Validate Login Page", async({page}) =>{
    await page.getByRole('button',{name:'Submit',exact:true}).click();
 //   await expect(page).toHaveScreenshot(["VisualTest","LoginPageScreenshot.png"],{fullPage:true,mask:[ page.locator('table tr td:nth-child(5)')]});
    await page.waitForSelector('.userid',{state:'visible'});
    const inputUserNameCls = page.locator('.userid');
    await expect(inputUserNameCls).toHaveCSS('width','90px');
    await expect(inputUserNameCls).toHaveCSS('font-size','1rem'); 
    await expect(inputUserNameCls).toHaveAttribute('placeholder','Username');
    await expect(inputUserNameCls).toHaveScreenshot(["VisualTestLoginPage","LoginPageUserNameInput.png"]);

    const inputPasswordCls = page.locator('.password');
    await expect(inputPasswordCls).toHaveCSS('width','90px');
    await expect(inputPasswordCls).toHaveCSS('font-size','1rem'); 
    await expect(inputPasswordCls).toHaveAttribute('placeholder','Please enter Password');
    await expect(inputUserNameCls).toHaveScreenshot(["VisualTestLoginPage","LoginPagePasswordInput.png"]);

});





