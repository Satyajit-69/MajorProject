const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Function to validate environment variables
function validateEnvVariables() {
    const required = ['CLOUD_NAME', 'CLOUD_API_KEY', 'CLOUD_API_SECRET'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:', missing.join(', '));
        console.error('\n👉 Please check your .env file and ensure these variables are set.');
        throw new Error('Missing required Cloudinary configuration');
    }

    // Log configuration (but hide sensitive data)
    console.log('Cloudinary Configuration:', {
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUD_API_KEY ? '****' + process.env.CLOUD_API_KEY.slice(-4) : undefined,
        api_secret: process.env.CLOUD_API_SECRET ? '****' + process.env.CLOUD_API_SECRET.slice(-4) : undefined
    });
}

// Validate environment variables
validateEnvVariables();

// Configure Cloudinary with error handling
try {
    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUD_API_KEY,
        api_secret: process.env.CLOUD_API_SECRET,
        secure: true // Force HTTPS
    });
} catch (error) {
    console.error('❌ Failed to configure Cloudinary:', error.message);
    throw error;
}

// Configure storage with robust error handling
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
        format: 'jpg',
        resource_type: 'auto'
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        let uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});

// Test connection function
async function testCloudinaryConnection() {
    try {
        console.log('Testing Cloudinary connection...');
        const result = await cloudinary.api.ping();
        console.log('✅ Cloudinary connection successful');
        return true;
    } catch (error) {
        console.error('❌ Cloudinary connection failed:', error.message);
        console.error('\n👉 Troubleshooting steps:');
        console.error('1. Check your internet connection');
        console.error('2. Verify your Cloudinary credentials');
        console.error('3. Ensure your Cloudinary account is active');
        console.error('4. Check if there are any Cloudinary service issues\n');
        throw error;
    }
}

// Perform initial connection test
testCloudinaryConnection().catch(error => {
    console.error('Initial connection test failed:', error.message);
});

module.exports = {
    cloudinary,
    storage,
    testCloudinaryConnection
};