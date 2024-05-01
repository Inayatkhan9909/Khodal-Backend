const jwt = require("jsonwebtoken")
require('dotenv').config();
const secretkey = process.env.SECRET_KEY
const cloudinary = require("../Utils/Cloudinary");
const Reel = require("../Models/ReelsModel");
const User = require("../Models/UserModel")


const CreatereelController = async (req, res) => {

    try {

        const { caption, token } = req.body;
         const video = req.file.path;
        const decoded = await jwt.decode(token, secretkey);
        console.log('File path:', req.file.path);

        const userId = decoded.userId;
        const author = decoded.username;

        const upload = await cloudinary.uploader.upload(video, {
            folder: "TheView ReelUploads",
            resource_type: "video"
        });
        
        if (upload && upload.secure_url) {

            const videourl = upload.secure_url;
            const newReel = new Reel({ author, caption, videourl, user: userId })
            const reeldone = await newReel.save();

            if (reeldone) {

                const reelId = reeldone._id;
                // const zer = await User.findById(userId)

                const userreel = await User.findByIdAndUpdate(userId, { $push: { Reels: reelId } });

                if (userreel) {

                    const populated = await Reel.findById(reelId).populate('user').exec();
                    if (populated) {
                        res.json({ message: "Item Added", reeldone });
                    }
                    else {
                        res.json({ message: "not populated" });
                    }
                }

            }
            else {
                res.json({ message: "item not save due to some error" });
            }
        }
        else {
            res.json({ message: "video upload failed" });
        }

    }
    catch (error) {
        console.log(error);
        res.json({ Message: "Something went wrong" });
    }
}


const getReels = async(req,res) =>{
    try {
        
        
        const reels = await Reel.find();
        if (reels) {
            res.json({ message: "data avaliable", reels })
        }
        else {
            res.json({ message: "no post avaliable" });
        }
    }
     catch (error) {
        console.log(error)
        res.json({ Message: "Something went wrong" });
    }
}


module.exports = {CreatereelController,getReels}