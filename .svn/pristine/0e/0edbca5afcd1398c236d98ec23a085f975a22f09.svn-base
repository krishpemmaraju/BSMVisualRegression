import {test, expect} from "@playwright/test"

test.skip("Visual Regression test", async({page})=> {
    await page.goto("https://the-internet.herokuapp.com/tables"); 
    //await expect(page).toHaveScreenshot();
    //await expect(page).toHaveScreenshot("VisualTestingDashboard.png")
    //await expect(page).toHaveScreenshot(["visualSnapshot","Screenshot1.png"],{fullPage: true});
   // await expect(page).toHaveScreenshot("MaxDiffPixelPractice.png",{maxDiffPixels:900});
    //Ignore fail if the pixel size is less than 800 pixel
  //  await expect(page).toHaveScreenshot("MaxDiffPixelRatioPractice.png",{maxDiffPixelRatio:0.50});
   //   await expect(page).toHaveScreenshot("MaskingScreenshot.png",{mask:[page.locator("#table1 tr td:nth-child(4)")]});
   //   await expect(page).toHaveScreenshot("MaultiMaskingScreenshot.png",{mask:[page.locator("#table1 tr td:nth-child(4)"),page.locator("#table2")]});
   // await expect(page.locator("#table1")).toHaveScreenshot("tableVerification.png");  
   // await expect(page).toHaveScreenshot("IphoneTesting.png");
    //To update new UI screenshots
   // await expect(page).toHaveScreenshot("UpdateScreenshot.png");
    //--update--snapshots

})

test.skip("IFrame hiding application", async({page})=> {
   await page.goto("https://the-internet.herokuapp.com/tables");
   await expect(page).toHaveScreenshot("iframeHiding.png",{stylePath:"screenshot.css"})
})