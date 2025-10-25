if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const cloudinary = require('cloudinary').v2;

// Check environment variables
console.log('Checking environment variables...');
const required = ['CLOUD_NAME', 'CLOUD_API_KEY', 'CLOUD_API_SECRET'];
const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    process.exit(1);
}

// Configure Cloudinary
console.log('Configuring Cloudinary...');
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

// Test connection
async function testConnection() {
    try {
        console.log('Testing Cloudinary connection...');
        console.log('Using configuration:', {
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.CLOUD_API_KEY ? '****' + process.env.CLOUD_API_KEY.slice(-4) : undefined,
            api_secret: process.env.CLOUD_API_SECRET ? '****' + process.env.CLOUD_API_SECRET.slice(-4) : undefined
        });
        
        const result = await cloudinary.api.ping();
        console.log('✅ Cloudinary connection successful!');
        return result;
    } catch (error) {
        console.error('❌ Cloudinary connection failed:', error.message);
        throw error;
    }
}

testConnection().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});