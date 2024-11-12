// initialize pupeteer
import puppeteer from 'puppeteer';

async function scrapeJiji() {
  //launch a new browser instance (Opens a headless browser (a browser without a visual interface).)

  const browser = await puppeteer.launch({ headless: "new" });

  //Creates a new tab (page) for browsing.
  const page = await browser.newPage();

  //Access the jiji page ( Navigates to the specified URL. networkidle2 tells Puppeteer to wait until there are no more than 2 network requests for at least 500ms, ensuring the page is fully loaded.)

  await page.goto("https://jiji.ug", { waitUntil: "networkidle2" });

  //wait for section to load

  await page.waitForSelector(".b-listing-cards__item");

  //scrap the data
  //page.evaluate gives direct access to the dom

  const Jijiproducts = await page.evaluate(() => {
    //select all listed items with the listed classname
    const productElement = document.querySelectorAll(".b-listing-cards__item");

    //map each element to an object holding  imageUrl, title, price

    const productArray = Array.from(productElement).map((product) => {
       // Get the background image URL from the style property
       const mediaElement = product.querySelector(".fw-card-media");
       const backgroundStyle = mediaElement ? mediaElement.style.backgroundImage : "";
       // Extract URL from the background-image style (format: url("URL"))
       const image = backgroundStyle.replace(/^url\(['"](.+)['"]\)$/, '$1') || "No image";
      const title =
        product.querySelector(".b-trending-card__title")?.innerText ||
        "No title";
      const price =
        product.querySelector(".b-trending-card__price")?.innerText ||
        "No price";

      return { image, title, price };
    });

    return productArray;
  });
  console.log("Trending Ads for you:", Jijiproducts);

  //close browser
  await browser.close();
}

// Run the scraper function
scrapeJiji();
