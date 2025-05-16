const express = require("express") ;
const app = express() ;
const mongoose = require("mongoose");
const Listing = require("./models/listing.js") ;

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



//routes
app.get("/" , (req,res) =>{
    res.send("Hi ! I am root") ;
})

app.get("/testListing" , async(req,res) =>{
    let sample = new Listing ( {
        title : "New Banglo",
        description : "By the beach" ,
        price : 120 ,
        location : "Kolkata , West Bengal" ,
        country : "India"
        })

    await sample.save();
    console.log("sample was saved");
    res.send("successful testing") ;

})



app.listen(3000,() =>{
  console.log("listening on port 3000");
})