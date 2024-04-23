const mongoose = require("mongoose");
const Post = require("./PostModel")


const userschema = new mongoose.Schema( {

    fullname:String,
    username: {type:String, unique:true,required:true},
    email:{type:String, unique:true,required:true},
    password:String,
    profilepic:String,
    about:String,
    gender:String,
    phone:String,
    address:String,
    city:String,
    country:String,
    followers:[{type:mongoose.Schema.Types.ObjectId,ref :'User'}],
    following:[{type:mongoose.Schema.Types.ObjectId,ref :'User'}],
    posts:[{type:mongoose.Schema.Types.ObjectId,ref :'Post'}]

});

module.exports = mongoose.model('User',userschema)