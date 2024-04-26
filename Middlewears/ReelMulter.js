const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");

// Function to check the duration of the video file
const checkVideoDuration = (file) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(file.path, (err, metadata) => {
            if (err) {
                reject(err);
            } else {
                const durationInSeconds = metadata.format.duration;
                if (durationInSeconds <= 60) {
                    resolve(true); // File duration is within the limit
                } else {
                    resolve(false); // File duration exceeds the limit
                }
            }
        });
    });
};

// Multer middleware for uploading video files with a maximum duration of one minute
const uploadVideo = multer({
    dest: "Reels/",
    limits: {
        fileSize: 1024 * 1024 * 50, // 50 MB max file size (adjust as needed)
    },
    fileFilter: (req, file, cb) => {
        // Check if file extension is in the allowed video formats
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
            // Multer error occurred
            return res.status(400).json({ error: err.message });
        } else if (err) {
            // Other errors occurred
            return res.status(500).json({ error: "Something went wrong!" });
        }

        try {
            const isValidDuration = await checkVideoDuration(req.file);
            if (!isValidDuration) {
                return res.status(400).json({ error: "Video duration should not exceed one minute!" });
            }
            // Video file is uploaded and duration is within the limit
            next();
        } catch (error) {
            return res.status(500).json({ error: "Failed to check video duration!" });
        }
    });
};

module.exports = multerReelMid;
