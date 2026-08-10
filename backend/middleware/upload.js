const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'memon-cloth-store',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPG, PNG, WebP) are allowed'));
    }
};

module.exports = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter
});