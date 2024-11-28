// initialize pupeteer
import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

import { createClient } from '@supabase/supabase-js';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the project root
const result = dotenv.config({ path: path.join(__dirname, '..', '.env') });


//saving to supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;


const supabase = createClient(supabaseUrl, supabaseKey);


//saving function
async function saveToSupabse(products){
  try{
    //insert new products
    const {data, error} = await supabase
    .from('products')
    .insert(products.map(product =>({
      title: product.title,
      price: product.price,
      image_url: product.image,
      created_at: new Date().toISOString()
    })));

    if(error) throw error;

    console.log('✅ Data saved to Supabase successfully');
    return data;
  }catch (error) {
    console.log('❌ Error saving to Supabase:', error)
    throw error;
  }  
}


async function scrapeJiji() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  try {
    console.log('🚀 Starting scraping process...');
    await page.goto("https://jiji.ug", { waitUntil: "networkidle2" });
    await page.waitForSelector(".b-listing-cards__item");

    const products = await page.evaluate(() => {
      const productElement = document.querySelectorAll(".b-listing-cards__item");
      
      return Array.from(productElement).map((product) => {
        const mediaElement = product.querySelector(".fw-card-media");
        const backgroundStyle = mediaElement ? mediaElement.style.backgroundImage : "";
        const image = backgroundStyle.replace(/^url\(['"](.+)['"]\)$/, '$1') || "No image";
        const title = product.querySelector(".b-trending-card__title")?.innerText || "No title";
        const price = product.querySelector(".b-trending-card__price")?.innerText || "No price";

        return { image, title, price };
      });
    });

    console.log(`📦 Found ${products.length} products`);
    
    // Save to Supabase
    await saveToSupabse(products);

  } catch (error) {
    console.error('❌ Error during scraping:', error);
  } finally {
    await browser.close();
    console.log('🏁 Scraping process completed');
  }
}

// Execute the script
scrapeJiji();
