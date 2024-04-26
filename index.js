const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyparser = require("body-parser");
require('dotenv').config();
const multerMid = require("./Middlewears/Multer")
const multerReelMid = require("./Middlewears/ReelMulter")
const { RegisterHangle, LoginHandler, GetProfile,
    AddprofilePic, Addabout, CompleteProfile, EditProfile } = require("./Controllers/UserController");

const { CreatePost, getPosts, DeltePost, GetPostbyId
    , EditPost, AddLike, Addcomment } = require("./Controllers/PostController");

const { CreatereelController, getReels } = require("./Controllers/ReelsController");


const app = express();
app.use(cors());
app.use(bodyparser.json());
port = 4599;

const url = process.env.DB_Url;
if (mongoose.connect(url)) {
    console.log("Db connected")
}
else {
    console.log("Db not connected")
}


app.post("/user/register", RegisterHangle);
app.post("/user/login", LoginHandler);
app.post("/user/addprofilepic", multerMid, AddprofilePic);
app.post("/user/addabout", Addabout);
app.post("/user/completeprofile", CompleteProfile);

app.put("/user/editprofile", EditProfile)

// Post section
app.post("/post/CreatePost", multerMid, CreatePost);
app.post("/post/AddLike", AddLike);
app.post("/post/addcomment", Addcomment);

app.delete("/post/DeltePost", DeltePost);

app.put("/post/EditPost", multerMid, EditPost);

app.get("/post/getPosts", getPosts);
app.get("/post/GetPostbyId", GetPostbyId);
app.get("/user/GetProfile", GetProfile);


// Reels section
app.post("/reels/create", multerReelMid, CreatereelController)
app.get("/reels/getreels", getReels)



app.listen(port, console.log(`port started on ${port}`))