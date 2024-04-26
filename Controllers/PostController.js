const jwt = require("jsonwebtoken")
require('dotenv').config();
const secretkey = process.env.SECRET_KEY
const cloudinary = require("../Utils/Cloudinary");
const Post = require("../Models/PostModel");
const User = require("../Models/UserModel")

const CreatePost = async (req, res) => {

    try {

        const { caption, image, token } = req.body;
        // const image = req.file.path;

        const decoded = await jwt.decode(token, secretkey)

        const userId = decoded.userId;
        const author = decoded.username;
         console.log("token "+token)
        const upload = await cloudinary.uploader.upload(image, {
            folder: "TheView imageUploads"
        });

        if (upload) {

            const imageurl = upload.secure_url;
            const newPost = new Post({ author, caption, imageurl,user:userId })
            const post = await newPost.save();
            if (post) {

                const postId = post._id;
                // const zer = await User.findById(userId)
               
                const userposted = await User.findByIdAndUpdate(userId, { $push: { posts: postId } });
                
                if (userposted) {
                   
                    const populated = await Post.findById(postId).populate('user').exec();
                    if (populated) {
                        res.json({ message: "Item Added", post });
                    }
                    else {
                        res.json({ message: "not populated", postId });
                    }
                }

            }
            else {
                res.json({ message: "item not save due to some error" });
            }
        }
        else {
            res.json({ message: "Cloudinary error" });
        }

    }
    catch (error) {
        console.log(error)
        res.json({ message: "something went wrong" });
    }
}

const getPosts = async (req, res) => {

    try {

        const posts = await Post.find();
        if (posts) {
            res.json({ message: "data avaliable", posts })
        }
        else {
            res.json({ message: "no post avaliable" });
        }

    }
    catch (error) {
        console.log(error);
        res.json({ message: "something went wrong" });
    }
}

const GetPostbyId = async (req, res) => {
    try {

        const { postId } = req.query;

        const post = await Post.findById(postId);
        if (post) {
            res.json({ message: "got it ", post });

        }
        else {
            res.json({ message: "post not found" })
        }

    }
    catch (error) {
        console.log(error);
    }
}


const DeltePost = async (req, res) => {

    try {
        const { postId, token } = req.body;

        if (token !== "" && postId !== "") {

            const decode = await jwt.decode(token, secretkey)
            const userId = decode.userId;

            const exists = await Post.findById(postId)
            if (exists) {

                const user = await User.findById(userId);
                if (exists.author === user.username) {

                    const deletePost = await Post.findByIdAndDelete(postId);
                    if (deletePost) {

                        res.json({ message: "post deleted succesfully" })
                    }
                    else {

                        res.json({ message: "post cant be deleted" })
                    }
                }
                else {

                    res.json({ message: "not your post" })
                }

            }
            else {

                res.json({ message: "post doesnot exists" })
            }

        }
        else {

            res.json({ message: "you are not logged in" })

        }

    }
    catch (error) {
        console.log(error);
        res.json({ message: "something went wrong" })

    }
}

const EditPost = async (req, res) => {

    try {

        const { postId, token, caption, image } = req.body;
        //  const image = req.file.path;
        if (postId != "" && token != "") {

            const post = await Post.findById(postId);

            if (post) {

                const decodedToken = await jwt.verify(token, secretkey);
                const userId = decodedToken.userId;

                const user = await User.findById(userId);
                if (post.author === user.username) {

                    const upload = await cloudinary.uploader.upload(image, {
                        folder: "TheView imageUploads"
                    });

                    if (upload) {
                        const imageurl = upload.secure_url;
                        const updatedpost = await Post.findByIdAndUpdate(postId,
                            { caption, imageurl },
                            { new: true }
                        )

                        if (updatedpost) {
                            res.json({ message: 'Post updated successfully', updatedpost });
                        }
                        else {
                            res.json({ message: 'Post update failed', });
                        }

                    }
                    else {
                        res.json({ message: "Cloudinary error" });
                    }



                }
                else {
                    res.json({ message: "Not authorized to update post" });
                }

            }
            else {
                res.json({ message: "post not found" });
            }
        }
        else {
            res.json({ message: "postid not found" });
        }


    }
    catch (error) {
        console.log(error);
        res.json({ message: "something went wrong" });
    }
}


const AddLike = async (req, res) => {
    try {

        const { postId, token } = req.body;

        const decoded = await jwt.verify(token, secretkey);
        const userId = decoded.userId;

        // const isValidObjectId = await new mongoose.Types.ObjectId(postId);

        const post = await Post.findById(postId);

        if (userId) {


            const alreadyLiked = await post.likedby.includes(userId);

            if (!alreadyLiked) {
                await post.likedby.push(userId);
                const liked = await post.save();
                if (liked) {

                    res.json({ message: "like done" })
                }
                else {
                    res.json({ message: "like failed" });
                }

            }
            else {
                const index = await post.likedby.indexOf(userId);

                // If the user ID is found, remove it
                if (index !== -1) {
                    await post.likedby.splice(index, 1);
                    await post.save();
                    res.json({ message: "like removed" });
                }
                else {
                    res.json({ message: "like remove failed" });
                }

            }


        }
        else {
            res.json({ message: "login first" });
        }

    }
    catch (error) {
        console.log(error);
        res.json({ message: "something went wrong" });

    }
}

const Addcomment = async (req, res) => {
    try {
        const { token, postId, content } = req.body;
        const post = await Post.findById(postId);

        if (post) {
            if (content != "" && token != "") {
                const decode = jwt.verify(token, secretkey);
                const userId = decode.userId;
                const user = await User.findById(userId);

                if (user) {
                    const newcomment = {
                        content: content,
                        user: user._id,
                        username: user.username
                    }

                    post.comments.push(newcomment);
                    const com = await post.save();
                    if (com) {
                        res.json({ message: "comment added",newcomment });
                    }
                    else {
                        res.json({ message: "comment failed" });
                    }

                }
                else {
                    res.json({ message: "can't add empty comment" })
                }
            }
            else {
                res.json({ message: "can't add empty comment" })
            }
        }
        else {
            res.json({ message: "Post not found" });
        }


    }
    catch (error) {
        console.log(error);
        res.json({ message: "something went wrong" })
    }
}






module.exports = { CreatePost, getPosts, DeltePost, GetPostbyId, EditPost, AddLike, Addcomment }