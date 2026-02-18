const mongoose = require("mongoose");
const Listing = require("./models/listing.js");

const mongo_url = 'mongodb://127.0.0.1:27017/wonderlust';

async function main() {
    try {
        await mongoose.connect(mongo_url);
        console.log("✅ Connected to the database");

        const count = await Listing.countDocuments();
        console.log(`📊 Total listings in DB: ${count}`);

        const listings = await Listing.find({}).limit(3);
        console.log("📋 First 3 listings:");
        console.log(JSON.stringify(listings, null, 2));

        mongoose.connection.close();
    } catch (err) {
        console.log("❌ Error:", err);
    }
}

main();
