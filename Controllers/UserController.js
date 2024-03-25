const User = require("../Models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const validator = require("email-validator");
const transporter = require("../Utils/Nodemailer");
require('dotenv').config();
const secretkey = process.env.SECRET_KEY;


const RegisterHangle = async (req, res) => {

    try {

        const { username, email, password } = req.body;


        if (username != "" && email != "" && password != "") {

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
                            const newuser = await new User({ username, email, password: hashpassword })
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

const GetProfile = async(req,res) =>{
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decode = await jwt.verify(token,secretkey);

        const userId = decode.userId;
        const user = await User.findById(userId);

        if(user)
        {
                res.json({message:"user found",user})
        }
        else{
            res.json({message:"User not found"});
        }
        
    }
     catch (error) {
        console.log(error);
        res.json({message:"something went wrong"});
    }
}

module.exports = { RegisterHangle, LoginHandler,GetProfile };



