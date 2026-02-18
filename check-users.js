const mongoose = require("mongoose");
const User = require("./models/user.js");
require("dotenv").config();

const mongo_url = process.env.ATLASDB_URL;

async function main() {
    try {
        await mongoose.connect(mongo_url);
        console.log("✅ Connected to the cloud database");

        const users = await User.find({});
        console.log(`📊 Total users in DB: ${users.length}`);
        console.log("📋 Users:");
        users.forEach(u => {
            console.log(`  - ID: ${u._id}, Username: ${u.username}, Email: ${u.email}`);
        });

        mongoose.connection.close();
    } catch (err) {
        console.log("❌ Error:", err.message);
    }
}

main();
