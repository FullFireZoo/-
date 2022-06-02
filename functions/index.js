const functions = require("firebase-functions");
const admin = require("firebase-admin");
const puppeteer = require("puppeteer");
admin.initializeApp();

exports.screenShotElement = functions.https.onRequest(
  async (request, response) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(request.body.url);
    await page.waitForSelector(request.body.selector);
    const element = await page.$(request.body.selector);
    const elementBuffer = await element.screenshot({ fullPage: false });
    response.set("Content-Type", "image/png");
    response.status(200).send(elementBuffer);
  }
);
// function
exports.screenShot = functions.https.onRequest(async (request, response) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(request.body.url);
  const imgBuffer = await page.screenshot({ fullPage: true });
  response.set("Content-Type", "image/png");
  response.status(200).send(imgBuffer);
});

exports.toPdf = functions.https.onRequest(async (request, response) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(request.body.url);
  const pdfBuffer = await page.pdf({ printBackground: true });
  response.set("Content-Type", "application/pdf");
  response.status(200).send(pdfBuffer);
});
