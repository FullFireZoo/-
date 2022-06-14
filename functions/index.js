const functions = require("firebase-functions");
const admin = require("firebase-admin");
const puppeteer = require("puppeteer");
const { document } = require("firebase-functions/v1/firestore");
const sendGridMail = require("@sendgrid/mail");
admin.initializeApp();
sendGridMail.setApiKey(`${process.env.KEY}`);
import {getStorage,ref,uploadBytes,uploadBytesResumable,getDownloadURL} from "firebase/storage"


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
  if (request.body.html) {
    await page.setContent(request.body.html);
  } else {
    await page.goto(request.body.url);
  }
  await page.evaluate(() =>
    document.querySelectorAll("iframe").forEach((pub) => {
      pub.style.display = "none";
    })
  );
  const imgBuffer = await page.screenshot({ fullPage: true });
  response.set("Content-Type", "image/png");
  response.status(200).send(imgBuffer);
});

const options = { memory: "1GB", timeoutSeconds: 30 };
exports.toPdf = functions
  .runWith(options)
  .https.onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Methods", "GET, PUT, POST, OPTIONS");
    response.set("Access-Control-Allow-Headers", "*");
    if (request.method === "OPTIONS") {
      response.end();
    }
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    if (request.body.html) {
      await page.setContent(request.body.html);
    } else {
      await page.goto(request.body.url);
    }
    const pdfBuffer = await page.pdf({ printBackground: true });
    response.set("Content-Type", "application/pdf");
    response.status(200).send(pdfBuffer);
  });

exports.sendMail = functions.https.onRequest(async (request, res) => {
  console.log(request.body.to);

  const msg = {
    to: request.body.to,
    from: `${process.env.MAIL}`,
    subject: request.body.subject,
    html: request.body.html,
  };
  console.log(msg);
  sendGridMail
    .send(msg)
    .then((response) => {
      res.send("mail envoyé");
      console.log(response[0].statusCode);
      console.log(response[0].headers);
    })
    .catch((error) => {
      res.send("mail pas envoyé 🚨");
      console.error(error);
    });
});




exports.uploadFile = functions.https.onRequest((req, res) => {
  const storage = getStorage();
  const storageRef = ref(storage, req.body.file);
  const uploadTask = uploadBytesResumable(storageRef, req.body.file);


  uploadTask.on('state_changed',
    (snapshot) => {

    },
    (error) => {

    },
    () => {
      // Handle successful uploads on complete
      // For instance, get the download URL: https://firebasestorage.googleapis.com/...
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        console.log('File available at', downloadURL)

      });
    }
  );
})
