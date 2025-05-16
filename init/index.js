const mongoose = require("mongoose") ;
const initData = require("./data.js") ;
const Listing = require("../models/listing.js") ;



//database connection
const mongo_url = 'mongodb://127.0.0.1:27017/wonderlust' ;

    main()
        .then(() =>{
            console.log("connected to the database");
        })
        .catch((err) =>{
            console.log(err) ;
        })

    async function main() {
            await mongoose.connect(mongo_url) ;
        }



        const initDB = async () =>{
            await Listing.deleteMany({}) ; //clean the datas
            await Listing.insertMany(initData.data) ; //insert new data
            console.log("data was initialized");
        }

        initDB() ;