const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({ 
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
  api_key:process.env.CLOUDINARY_APIKEY , 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary= async(file)=>{
    try {
        const result=await cloudinary.uploader.upload(file)
        fs.unlinkSync(file)  // Use sync version and add error handling
        return result
    } catch (error) {
        // Clean up file even if upload fails
        if(fs.existsSync(file)){
            fs.unlinkSync(file)
        }
        console.error("Cloudinary upload error:", error);
        throw error
    }
}

module.exports= uploadOnCloudinary