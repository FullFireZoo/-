const functions = require("firebase-functions");
const admin = require('firebase-admin')
const puppeteer = require("puppeteer")
admin.initializeApp()

    
    exports.screenShot = functions.https.onRequest( async (request, response) => {
    
        
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(request.body.url);
        const pdfBuffer = await page.pdf({ printBackground: true });
        response.set("Content-Type", "application/pdf");
        response.status(200).send(pdfBuffer);
        // await page.waitForSelector(selector);
        // const element = await page.$(selector)
        // await page.setViewport({ width: 1400, height: 900 });
        // await element.screenshot({ path:nom });
        // await browser.close();

        
    })