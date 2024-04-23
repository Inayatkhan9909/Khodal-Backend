const User = require("../Models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const validator = require("email-validator");
const transporter = require("../Utils/Nodemailer");
const cloudinary = require("../Utils/Cloudinary");
const { findByIdAndUpdate } = require("../Models/PostModel");
require('dotenv').config();
const secretkey = process.env.SECRET_KEY;


const RegisterHangle = async (req, res) => {

    try {

        const { fullname, username, email, password } = req.body;


        if (fullname != "" && username != "" && email != "" && password != "") {

            const valid = validator.validate(email);

            if (valid) {

                const emailexist = await User.findOne({ email });
                const usernameexist = await User.findOne({ username });

                if (!emailexist) {

                    if (!usernameexist) {
                        const hashpassword = await bcrypt.hash(password, 10);

                        const sendMail = await transporter.sendMail({
                            from: "rteja1230@gmail.com",
                            to: `${email}`,
                            subject: "Registation Successfull",
                            text: "Your account is successfully created on TheView congrations ",
                        });

                        if (sendMail) {
                            const newuser = await new User({ fullname, username, email, password: hashpassword })
                            const success = await newuser.save();
                            if (success) {
                                res.json({ message: "Registration successfull" });
                            }
                            else {
                                res.json({ message: "Registration failed" });
                            }
                        }
                        else {
                            res.json({ message: "email not found try again" });
                        }

                    }
                    else {
                        res.json({ message: "username not avalaible try new one" });
                    }
                }

                else {
                    res.json({ message: "email already exists" });
                }
            }
            else {
                res.json({ message: "Enter a valid email" });

            }



        }
        else {
            res.json({ message: "All fields required" });
        }

    }
    catch (error) {
        console.log(error)
        res.json({ message: "Something went wrong" });
    }
}


const LoginHandler = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (username != "" && password != "") {

            const exists = await User.findOne({ username });

            if (exists) {

                const passverify = await bcrypt.compare(password, exists.password);

                if (passverify) {

                    const token = jwt.sign(
                        {
                            userId: exists._id,
                            username: exists.username
                        }, secretkey
                    )

                    res.cookie("token", token)

                    res.json({ message: "logged in successfully", token });

                }

                else {
                    res.json({ message: "Password incorrect" });
                }
            }

            else {
                res.json({ message: "User not exists" });
            }

        }
        else {
            res.json({ message: "All fields required" });
        }

    }
    catch (error) {
        console.log(error)
        res.json({ message: "Something went wrong" });
    }

}

const GetProfile = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decode = await jwt.verify(token, secretkey);

        const userId = decode.userId;
        const user = await User.findById(userId);

        if (user) {
            res.json({ message: "user found", user })
        }
        else {
            res.json({ message: "User not found" });
        }

    }
    catch (error) {
        console.log(error);
        res.json({ message: "something went wrong" });
    }
}

const AddprofilePic = async (req, res) => {
    try {

        const { token, image } = req.body;
        // const image = req.file.path;
        if (token != "") {

            const decoded = await jwt.decode(token, secretkey)
            const userId = decoded.userId;


            if (image != null) {
                const upload = await cloudinary.uploader.upload(image, {
                    folder: "TheView ProfileImages"
                });

                if (upload) {

                    const profilepic = upload.secure_url;

                    const updateuser = await User.findByIdAndUpdate({ _id: userId },
                        { $set: { profilepic: profilepic } },
                        { new: true });

                    if (updateuser) {
                        res.json({ message: "profile updated successfully" });
                    }
                    else {
                        res.json({ message: "user not found" });
                    }
                }
            }
            else {
                res.json({ message: "image not found" });
            }

        }
        else {
            res.json({ message: "login first" });
        }

    }
    catch (error) {
        console.log(error);
        res.json({ message: "Something went wrong" });
    }
}

const Addabout = async (req, res) => {
    try {
        const { token, about } = req.body;
        if (token != "") {
            const decoded = await jwt.decode(token, secretkey)
            const userId = decoded.userId;
            if (about != "") {
                const updated = await User.findByIdAndUpdate({ _id: userId },
                    { $set: { about: about } },
                    { new: true })

                if (updated) {
                    res.json({ message: "About added successfully" });
                }
                else {
                    res.json({ message: "Can't update about" });
                }
            }
            else {
                res.json({ message: "about is null" });
            }

        }
        else {
            res.json({ message: "login problem" });
        }


    }
    catch (error) {
        console.log(error);
        res.json({ message: "somethingwent wrong" });
    }
}


const CompleteProfile = async (req, res) => {
    try {
        const { gender, phone, address, city, country } = req.body;
        if (gender !== "" && phone !== "" && address !== "" && city !== "" && country !== "") {
            const token = req.body.token;

            if (token != null && token != "") {
                const decoded = await jwt.decode(token, secretkey)
                const userId = decoded.userId;
                console.log(userId)
                const updated = await User.findByIdAndUpdate({ _id: userId },
                    {
                        $set: {
                            gender: gender,
                            phone: phone,
                            address: address,
                            city: city,
                            country: country
                        }
                    },
                    { new: true })

                if (updated) {
                    res.json({ message: "Details added successfully" });
                }
                else {
                    res.json({ message: "profile update failed" });
                }

            }
            else {
                res.json({ message: "login error" });
            }
        }
        else {
            res.json({ message: "All fields required" });
        }

    } catch (error) {
        console.log(error);
        res.json({ message: "something went wrong" });

    }
}

const EditProfile = async (req, res) => {
    try {

        const { token, fullname, username, email, gender, phone, address, city, country } = req.body;

        if (fullname !== "" && fullname !== undefined && username !== "" && username !== undefined &&
            email !== "" && email !== undefined && gender !== "" && gender !== undefined && phone !== "" && phone !== undefined &&
            address !== "" && address !== undefined && city !== "" && city !== undefined && country !== "" && country !== undefined) {


            if (token != null && token != "") {
                const decoded = await jwt.decode(token, secretkey)
                const userId = decoded.userId;

                const updated = await User.findByIdAndUpdate({ _id: userId },
                    {
                        $set: {
                            fullname: fullname,
                            email: email,
                            username: username,
                            gender: gender,
                            phone: phone,
                            address: address,
                            city: city,
                            country: country
                        }
                    },
                    { new: true })

                if (updated) {
                    res.json({ message: "Changes saved  successfully" });
                }
                else {
                    res.json({ message: "profile update failed" });
                }

            }
            else {
                res.json({ message: "login error" });
            }

        }
        else {
            res.json({ message: "All fields required" });
        }
    }
    catch (error) {
        console.log(error);
        res.json({ message: "Something went wrong" });
    }
}

module.exports = { RegisterHangle, LoginHandler, GetProfile, AddprofilePic, Addabout, CompleteProfile, EditProfile };



