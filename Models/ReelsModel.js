const mongoose = require("mongoose");
const User = require("./UserModel");


const Reelschema = new mongoose.Schema({

    author: { type: String, required: true },
    caption: String,
    videourl: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    CreatedAt:{type:Date,default:Date.now},
    likedby: [{ type: mongoose.Schema.Types.ObjectId }, 'User'],
    dislikeedby: [{ type: mongoose.Schema.Types.ObjectId }, 'User'],
    comments: [{
        content: { type: String, required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username:{type:String,required:true},
        createdAt: { type: Date, default: Date.now }
    }]
})

module.exports = mongoose.model('Reel',Reelschema)