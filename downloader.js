const readline = require('readline');
const puppeteer = require('puppeteer-core');

(async () => {
  console.log("Downloading resources (This may take a few minutes)");

  // Workround for pkg + puppet https://github.com/vercel/pkg/issues/204#issuecomment-529314210
  const download = require('download-chromium');
  const os = require('os');
  const tmp = os.tmpdir();

  const exec = await download({
    revision: 694644,
    installPath: `${tmp}/.local-chromium`})

  const browser = await puppeteer.launch({
    executablePath: exec,
    headless: false
  });

  const page = await browser.newPage();

  // Ask questions
  var classURL = await askQuestion("Paste the url of your class (e.g. https://artofproblemsolving.com/class/2156-calculus)\n");
  if(classURL.slice(-1) == "/")
    classURL = classURL.slice(0, -1);
  await page.goto(classURL, {waitUntil: 'networkidle0'});
  var saveTranscripts = await askQuestion("Save transcripts? (yes/no)\n");
  var saveHomework = await askQuestion("Save homework? (yes/no)\n");
  var weeks = await askQuestion("How many weeks to save?\n");

  // Login
  var username = await askQuestion("Enter your username\n");
  await page.type('#login-username', username);
  var password = await askQuestion("Enter your password\n");
  await page.type('#login-password', password);
  await page.click('#login-button');
  await waitForNetworkIdle(page, 500, 0);
  while(await page.evaluate('document.querySelector(".error")') !== null && await page.evaluate('document.querySelector(".error").getAttribute("style") !== null')){
    console.log("Login failed");
    var username = await askQuestion("Please enter your username\n");
    await page.click('#login-username', {clickCount: 3})
    await page.type('#login-username', username);
    var password = await askQuestion("Please enter your password\n");
    await page.click('#login-password', {clickCount: 3})
    await page.type('#login-password', password);
    await page.click('#login-button');
    await waitForNetworkIdle(page, 500, 0);
  }
  console.log("Logged in successfully");

  // Save transcripts
  if(saveTranscripts == "yes"){
    console.log("Saving transcripts");
    var transcriptURL = await page.evaluate("document.evaluate(\"//span[text()='Week 1']\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.parentElement.href");
    var transcriptNum = parseInt(transcriptURL.split('/')[transcriptURL.split('/').length - 1]);
    for(let i = 1; i < parseInt(weeks) + 1; i++){
      let transcript = classURL + '/transcript/' + (transcriptNum + i - 1);
      console.log(`Loading transcript for week ${i}`);
      await page.goto(transcript, {waitUntil: 'networkidle0'});
      console.log(`Saving transcript for week ${i}`);
      await page.pdf({path: `week${i}-transcript.pdf`, format: 'A4'});
    }
  }

  // Save homework
  if(saveHomework == "yes"){
    console.log("Saving homework");
    for(let i = 1; i < parseInt(weeks) + 1; i++){
      let homework = classURL + `/homework/${i}`
      console.log(`Loading homework for week ${i}`);
      await page.goto(homework, {waitUntil: 'networkidle0'});
      console.log(`Saving homework for week ${i}`);
      await page.pdf({path: `week${i}-homework.pdf`, format: 'A4'});
    }
  }

  await browser.close();
})();

function waitForNetworkIdle(page, timeout, maxInflightRequests = 0) {
  page.on('request', onRequestStarted);
  page.on('requestfinished', onRequestFinished);
  page.on('requestfailed', onRequestFinished);

  let inflight = 0;
  let fulfill;
  let promise = new Promise(x => fulfill = x);
  let timeoutId = setTimeout(onTimeoutDone, timeout);
  return promise;

  function onTimeoutDone() {
    page.removeListener('request', onRequestStarted);
    page.removeListener('requestfinished', onRequestFinished);
    page.removeListener('requestfailed', onRequestFinished);
    fulfill();
  }

  function onRequestStarted() {
    ++inflight;
    if (inflight > maxInflightRequests)
      clearTimeout(timeoutId);
  }
  
  function onRequestFinished() {
    if (inflight === 0)
      return;
    --inflight;
    if (inflight === maxInflightRequests)
      timeoutId = setTimeout(onTimeoutDone, timeout);
  }
}

function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
