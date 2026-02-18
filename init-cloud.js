const mongoose = require("mongoose");
const initData = require("./init/data.js");
const Listing = require("./models/listing.js");
require("dotenv").config();

const mongo_url = process.env.ATLASDB_URL;

async function main() {
    try {
        await mongoose.connect(mongo_url);
        console.log("✅ Connected to the cloud database");

        await Listing.deleteMany({}); // Clean old data
        console.log("🧹 Cleared old listings");
        
        // Use an existing user ID from the database
        const validOwnerId = "685f76a498c667b75ace3d82"; // SATYAJIT SAHOO
        
        initData.data = initData.data.map((obj) =>({
            ...obj,
            owner: validOwnerId,
        }));
        
        await Listing.insertMany(initData.data); // Insert new data
        console.log("✅ Data successfully seeded with valid owner!");
        console.log(`📊 ${initData.data.length} listings added with owner: SATYAJIT SAHOO`);

        mongoose.connection.close(); // Close connection
    } catch (err) {
        console.log("❌ Error:", err.message);
    }
}

main();
