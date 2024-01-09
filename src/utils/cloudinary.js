import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";
import { ApiError } from './ApiError.js';
          
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME || "samplename", 
  api_key: process.env.API_KEY || "435539781257569", 
  api_secret: process.env.API_SECRET || "G-pH00lvhXOhR-ez-Gg0LiATyCk"
});

const uploadOnCloudinary = async(localFilePath) => {
    try {
      console.log(localFilePath)
        if(!localFilePath) {
          throw new ApiError(400,"FilePath is needed to load file on cloudnary")
        };
        // upload the file on cloudnary
        const response = await cloudinary.uploader.upload(
          localFilePath, {
            resource_type: "auto"
          }
        )
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the local saved temporary file as the upload operation got failed.
        return null;
    }
}


export {
     uploadOnCloudinary
}