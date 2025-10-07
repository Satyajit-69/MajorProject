const Listing = require("../models/listing.js");



//index route
module.exports.index = async (req, res) => {
  const listings = await Listing.find({});
  res.render("listings/index", { allListings: listings });
};


//new route
module.exports.new = (req, res) => {
  res.render("listings/new");
};


//create listing
module.exports.createListing = async (req, res, next) => {
  let url = req.file ? req.file.path : "/default.avif";
  let filename = req.file ? req.file.filename : "default";

  const newlisting = new Listing(req.body.listing);
  newlisting.owner = req.user._id;
  newlisting.image = { filename, url };
  newlisting.geometry = {
    type: "Point",
    coordinates: [85.8414, 20.4625]
  };
  await newlisting.save();
  req.flash("success", "new listing created");
  res.redirect("/listings");
};


//show route
module.exports.showListing = async (req, res, next) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing does not exist");
    return res.redirect("/listings"); 
  }

  res.render("listings/show", { listing });
};


//edit route
module.exports.editRoute = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }
  let originalImage = listing.image.url ;
  originalImage.replace("/upload" , "/upload/h_300,w_250")
  res.render("listings/edit", { listing });
};


//update route
module.exports.updateRoute  = async (req, res, next) => {
  const { id } = req.params;
  let listing =  await Listing.findByIdAndUpdate( id ,{...req.body.listing }) ;

  if(typeof req.file !== "undefined") {
    let url = req.file.path ;
    let filename = req.file.filename ;
    listing.image = { filename, url };
    await listing.save();
  }

  req.flash("success","listing updated") ;
  res.redirect(`/listings/${id}`);
};


//deleteRoute 
module.exports.deleteRoute =async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findByIdAndDelete(id);
  req.flash("success" ,"listing deleted !") ;
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }
  res.redirect("/listings");
};

