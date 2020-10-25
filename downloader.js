const readline = require('readline');
const puppeteer = require('puppeteer-core');

(async () => {
  console.log("Downloading resources (This may take a minute)");

  // Workround for pkg + puppet https://github.com/vercel/pkg/issues/204#issuecomment-529314210
  const download = require('download-chromium');
  const os = require('os');
  const tmp = os.tmpdir();

  const exec = await download({
      revision: 694644,
      installPath: `${tmp}/.local-chromium`})

  const browser = await puppeteer.launch({
      executablePath: exec
  });

  const page = await browser.newPage();

  var classURL = await askQuestion("Paste the url of your class (e.g. https://artofproblemsolving.com/class/2156-calculus) ");
  if(classURL.slice(-1) == "/")
    classURL = classURL.slice(0, -1);
  await page.goto(classURL, {waitUntil: 'networkidle2'});
  var saveTranscripts = await askQuestion("Save transcripts? (yes/no) ");
  if(saveTranscripts == "yes")
  var transcriptURL = await askQuestion("Paste the url of the first week's transcript ");
  if(transcriptURL.slice(-1) == "/")
    transcriptURL = transcriptURL.slice(0, -1);
  var saveHomework = await askQuestion("Save homework? (yes/no) ");
  var weeks = await askQuestion("How many weeks to save? ");
  var username = await askQuestion("Please enter your username ");
  var password = await askQuestion("Please enter your password ");
  var transcriptNum = parseInt(transcriptURL.split('/')[transcriptURL.split('/').length - 1]);
  await page.type('#login-username', username);
  await page.type('#login-password', password);
  await page.click('#login-button');
  await page.waitForNavigation({waitUntil: 'networkidle0'});
  if(saveTranscripts == "yes"){
    console.log("Saving transcripts");
    for(let i = 1; i < weeks + 1; i++){
      let transcript = classURL + '/transcript/' + (transcriptNum + i - 1);
      console.log(`Loading transcript for week ${i}`);
      await page.goto(transcript, {waitUntil: 'networkidle2'});
      console.log(`Saving transcript for week ${i}`);
      await page.pdf({path: `week${i}-transcript.pdf`, format: 'A4'});
    }
  }

  if(saveHomework == "yes"){
    console.log("Saving homework");
    for(let i = 1; i < weeks + 1; i++){
      let homework = classURL + '/homework/${i}'
      console.log(`Loading homework for week ${i}`);
      await page.goto(homework, {waitUntil: 'networkidle2'});
      console.log(`Saving homework for week ${i}`);
      await page.pdf({path: `week${i}-homework.pdf`, format: 'A4'});
    }
  }

  await browser.close();
})();

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
