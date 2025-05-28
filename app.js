const express = require("express") ;
const app = express() ;
const mongoose = require("mongoose");
const Listing = require("./models/listing.js") ;
const method = require("method-override");
const path = require("path") ;
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js") ;

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

            
app.engine('ejs', ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(method('_method'));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")) ;
app.use(express.static(path.join(__dirname,"/public")))



//routes
app.get("/root" , (req,res) =>{
    res.render("listings/home.ejs") ;
})

// app.get("/testListing" , async(req,res) =>{
//     let sample = new Listing ( {
//         title : "New Banglo",
//         description : "By the beach" ,
//         price : 120 ,
//         location : "Kolkata , West Bengal" ,
//         country : "India"
//         })

//     await sample.save();
//     console.log("sample was saved");
//     res.send("successful testing") ;

// })


//index route
app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });

});

//New route 
app.get("/listings/new" ,   (req,res) =>{
      res.render("listings/new.ejs") ;
})


// Add route / Create Route
app.post("/listings", wrapAsync(async (req, res, next) => {
    const listingData = req.body.listing;
    // Ensure required fields
    if (!listingData.title || !listingData.image) {
        throw new Error("Title and Image are required!");
    }
    // Wrap image as object if it's a string
    if (typeof listingData.image === "string") {
        listingData.image = { url: listingData.image };
    }
    const newListing = new Listing(listingData);
    await newListing.save();
    res.redirect("/listings");
}));

//show route
app.get("/listings/:id" , async( req ,res ) => {
    let  { id } = req.params ;
    const listing = await Listing.findById(id) ;

    res.render("listings/show.ejs" ,{ listing } ) ;
})



//Edit route 
app.get("/listings/:id/edit" , async(req,res) => {
     const {id} = req.params ;
     const listing =  await Listing.findById(id) ;
     res.render("listings/edit.ejs" ,{listing}) ;
})

// Update route
app.put("/listings/:id", async (req, res) => {
    let { id } = req.params;
    const listingData = req.body.listing;
    if (listingData.image && typeof listingData.image === "string") {
        listingData.image = { url: listingData.image, filename: "listingimage" };
    }
    await Listing.findByIdAndUpdate(id, listingData);
    res.redirect(`/listings/${id}`);
})

//delete route
app.delete("/listings/:id" , async(req,res) =>{
       let {id} = req.params ;
      let deleted = await  Listing.findByIdAndDelete(id) ;
      console.log(deleted);
      res.redirect("/listings");
      
})



// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error for debugging
  res.status(500).send("Something went wrong! Please try again later.");
});

app.listen(3000,() =>{
  console.log("listening on port 3000");
})