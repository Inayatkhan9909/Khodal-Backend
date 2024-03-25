const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport(
    {
        service: "gmail",
        secure: false,
        auth: {
            user: `rteja1230@gmail.com`,
            pass : "aqva zpxl rzdh ywcr"
        }
    }
)

module.exports = transporter