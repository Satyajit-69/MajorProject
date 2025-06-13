const mongoose = require("mongoose") ;
const Schema = mongoose.Schema ;
const passportlocalMongoose = require("passport-local-mongoose");
const User = new Schema({});

//schema define

const userSchema = new Schema ({
    email :{
        type : String ,
        required : true ,
    }
})

//by default username , password , salting , hashing  (all works will be done)
 userSchema.plugin(passportlocalMongoose);
 module.exports = mongoose.model('User', userSchema);