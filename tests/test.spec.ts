import { test, expect } from "@playwright/test";
import fs from "fs";
import { difference } from "lodash";

// Read url.txt contents and put in in an array per line
const data = fs.readFileSync("./tests/urls.txt", "utf8");
let urls = data.split(/\r?\n/);
const dataProcessed = fs.readFileSync("./tests/processed.txt", "utf8");
const urlsProcessed = dataProcessed.split(/\r?\n/);
urls = difference(urls, urlsProcessed);
for (let i = 0; i < urls.length; i++) {
  test(`Page ${urls[i]}...`, async ({ page }) => {
    await page.goto(urls[i], { waitUntil: "networkidle" });
    const counter = await page.locator(".lr_track").count();
    const title = await page.locator("h1.title").innerText();
    console.log(title);
    for (let j = 0; j < counter; j++) {
      const track = page.locator(".lr_track").nth(j).locator("td").nth(2);
      await track.click();
    }
    const buttonDownload = page.locator("div.button", {
      hasText: "Download All",
    });
    const downloadPromise = page.waitForEvent("download");
    await buttonDownload.click({ timeout: 5000 });
    await page.locator(".download_format_description").click({ timeout: 5000 });
    const download = await downloadPromise;
    await download.saveAs(`./downloads/${title.replace("/", "-")}.zip`);
    // append url variable to a file
    fs.appendFileSync("./tests/processed.txt", urls[i] + "\n");
  });
}
