const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");


const checkVideoDuration = (file) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(file.path, (err, metadata) => {
            if (err) {
                reject(err);
            } else {
                const durationInSeconds = metadata.format.duration;
                if (durationInSeconds <= 60) {
                    resolve(true); 
                } else {
                    resolve(false); 
                }
            }
        });
    });
};


const uploadVideo = multer({
    dest: "Reels/",
    limits: {
        fileSize: 1024 * 1024 * 50, 
    },
    fileFilter: (req, file, cb) => {
       
        if (!file.originalname.match(/\.(mp4|avi|mkv|mov)$/)) {
            return cb(new Error("Only video files are allowed!"), false);
        }
        cb(null, true);
    },
}).single("video");

// Middleware function to handle the upload and duration check
const multerReelMid = (req, res, next) => {
    uploadVideo(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
         
            return res.status(400).json({ error: err.message });
        } else if (err) {
         
            return res.status(500).json({ error: "Something went wrong!" });
        }

        try {
            const isValidDuration = await checkVideoDuration(req.file);
            if (!isValidDuration) {
                return res.status(400).json({ error: "Video duration should not exceed one minute!" });
            }
          
            next();
        } catch (error) {
            return res.status(500).json({ error: "Failed to check video duration!" });
        }
    });
};

module.exports = multerReelMid;
