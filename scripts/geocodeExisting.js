// scripts/geocodeExisting.js
// Run once: node scripts/geocodeExisting.js
// This geocodes all listings that are missing geometry.coordinates

require("dotenv").config();
const mongoose = require("mongoose");
const Listing  = require("../models/listing.js");

const MONGO_URL = process.env.ATLASDB_URL || process.env.MONGO_URL || "mongodb://localhost:27017/wanderlust";

async function geocode(location, country) {
  try {
    const query = `${location}, ${country}`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "WanderlustApp/1.0 (your@email.com)" },
    });
    const data = await res.json();
    if (data && data.length > 0) {
      return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
    }
  } catch (err) {
    console.error(`  ✗ Fetch error: ${err.message}`);
  }
  return null;
}

// Nominatim rate limit: max 1 request/second
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  await mongoose.connect(MONGO_URL);
  console.log("✅ Connected to MongoDB\n");

  // Find all listings missing coordinates
  const listings = await Listing.find({
    $or: [
      { "geometry.coordinates": { $exists: false } },
      { "geometry.coordinates": { $size: 0 } },
      { geometry: { $exists: false } },
    ],
  });

  console.log(`Found ${listings.length} listings without coordinates\n`);

  let success = 0, failed = 0;

  for (const listing of listings) {
    process.stdout.write(`  → Geocoding: "${listing.location}, ${listing.country}" ... `);

    const coords = await geocode(listing.location, listing.country);

    if (coords) {
      listing.geometry = { type: "Point", coordinates: coords };
      await listing.save();
      console.log(`✓ [${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}]`);
      success++;
    } else {
      console.log(`✗ Failed`);
      failed++;
    }

    // Respect Nominatim's 1 req/sec rate limit
    await sleep(1100);
  }

  console.log(`\n── Done ──`);
  console.log(`✅ Geocoded: ${success}`);
  console.log(`❌ Failed:   ${failed}`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error("Script error:", err);
  process.exit(1);
});
