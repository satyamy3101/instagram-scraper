const puppeteer = require("puppeteer");

async function fetchInstagramPost(username = "bbcnews") {
  try {
    // Launching headless browser
    const browser = await puppeteer.launch({ headless: "false" });
    const page = await browser.newPage();

    // Open Instagram profile
    const url = `https://www.instagram.com/${username}/`;
    await page.goto(url, { waitUntil: "networkidle2" });

    // Wait for script tag that contains JSON data
    // await page.waitForSelector('script[type="application/ld+json"]');
    await page.waitForSelector('meta[property="og:description"]', { timeout: 60000 });

    // Extract JSON Data
    const jsonData = await page.evaluate(() => {
      const script = document.querySelector('script[type="application/ld+json"]');
      return script ? JSON.parse(script.innerText) : null;
    });

    if (!jsonData) {
      console.error("❌ Failed to fetch data!");
      await browser.close();
      return null;
    }

    // Extracting latest post data
    const latestPost = jsonData.mainEntityOfPage[0];
    // const caption = latestPost.caption;
    const caption = await page.$eval('meta[property="og:description"]', el => el.content);

    const imageUrl = latestPost.image;

    console.log("✅ Latest Post Fetched Successfully!");
    console.log(`📌 Caption: ${caption}`);
    console.log(`🖼️ Image URL: ${imageUrl}`);

    await browser.close();
    return { caption, imageUrl };
  } catch (error) {
    console.error("❌ Error Fetching Post:", error);
    return null;
  }
}

// Run function
fetchInstagramPost();
