const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const mongo_url = 'mongodb://127.0.0.1:27017/wonderlust';

async function main() {
    try {
        await mongoose.connect(mongo_url);
        console.log("Connected to the database");

        await Listing.deleteMany({}); // Clean the data
        initData.data = initData.data.map((obj) =>({
            ...obj,
            owner : "684fb32e4c22b604454e5f49" ,
        }));
        await Listing.insertMany(initData.data); // Insert new data
        console.log("Data was initialized");

        mongoose.connection.close(); // Optional: close connection after seeding
    } catch (err) {
        console.log(err);
    }
}

main();