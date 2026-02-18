const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../cloudConfig.js');





// File filter function
const fileFilter = (req, file, cb) => {
    console.log('Processing file upload:', file.originalname);
    
    // Allowed file types with extensions
    const allowedTypes = {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/avif': ['.avif']
    };
    
    // Check mime type
    if (!allowedTypes[file.mimetype]) {
        console.log('❌ Invalid file type:', file.mimetype);
        cb(new Error(`File type not supported. Please upload a JPEG, PNG, or AVIF image. Received: ${file.mimetype}`), false);
        return;
    }
    
    // Check file extension
    const ext = file.originalname.toLowerCase().split('.').pop();
    const validExtensions = allowedTypes[file.mimetype];
    if (!validExtensions.includes(`.${ext}`)) {
        console.log('❌ Invalid file extension:', ext);
        cb(new Error(`Invalid file extension. Expected ${validExtensions.join(' or ')}, got .${ext}`), false);
        return;
    }
    
    console.log('✅ File validation passed:', file.originalname);
    cb(null, true);
};

// Configure cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'wanderlust',
        allowed_formats: ['jpg', 'jpeg', 'png', 'avif'],
        transformation: [{
            width: 800,
            height: 500,
            crop: 'fill',
            gravity: 'center',
            quality: 'auto:good'
        }],
        format: 'jpg'
    }
});

// Configure multer with storage and file filter
const uploadMiddleware = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB in bytes
        files: 1 // Maximum number of files
    }
});

// Create single upload middleware
const upload = uploadMiddleware.single('image');

// Enhanced error handling middleware
const handleMulterError = (req, res, next) => {
    upload(req, res, function(err) {
        if (err) {
            console.error('❌ Upload error:', err);
            
            // Handle Multer errors
            if (err instanceof multer.MulterError) {
                switch (err.code) {
                    case 'LIMIT_FILE_SIZE':
                        req.flash('error', 'File size too large. Maximum size is 5MB.');
                        break;
                    case 'LIMIT_UNEXPECTED_FILE':
                        req.flash('error', 'Unexpected file field. Please use the image field.');
                        break;
                    default:
                        req.flash('error', `Upload error: ${err.message}`);
                }
            } 
            // Handle Cloudinary errors
            else if (err.http_code) {
                req.flash('error', `Cloudinary error: ${err.message}`);
            }
            // Handle other errors
            else {
                req.flash('error', err.message || 'Error uploading file');
            }
            
            return res.redirect(req.get('referer') || '/listings');
        }
        
        // If no file was uploaded and it's required
        if (!req.file && req.method === 'POST') {
            req.flash('error', 'Please select an image to upload');
            return res.redirect(req.get('referer') || '/listings');
        }
        
        next();
    });
};

module.exports = {
    uploadMiddleware,
    handleMulterError
};