const multer = require("multer");


const upload = multer({dest:'uploads/',limits:{
    fieldSize: 1024 * 1024 * 5,
},})


const multerMid = upload.single("image")



module.exports = multerMid