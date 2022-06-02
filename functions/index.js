const functions = require("firebase-functions");
const admin = require("firebase-admin");
const puppeteer = require("puppeteer");
const { document } = require("firebase-functions/v1/firestore");
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

exports.screenShot = functions.https.onRequest(async (request, response) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  if(request.body.html){
    await page.setContent(request.body.html)
  }else{await page.goto(request.body.url)}
 
  await page.evaluate(() => document.querySelectorAll("iframe").forEach((pub)=> {
      pub.style.display = "none";
  }));
  const imgBuffer = await page.screenshot({ fullPage: true });
  response.set("Content-Type", "image/png");
  response.status(200).send(imgBuffer);
});

exports.toPdf = functions.https.onRequest(async (request, response) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  if(request.body.html){
    await page.setContent(request.body.html)
  }else{await page.goto(request.body.url)}
  const pdfBuffer = await page.pdf({ printBackground: true });
  response.set("Content-Type", "application/pdf");
  response.status(200).send(pdfBuffer);
});
