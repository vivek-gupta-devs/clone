import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";
import { ApiError } from './ApiError.js';
import dotenv from "dotenv";
import { Console, log } from 'console';

dotenv.config({
  path: ".env"
});

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET
});


const uploadOnCloudinary = async(localFilePath) => {
    try {
        if(!localFilePath) {
          throw new ApiError(400,"FilePath is needed to load file on cloudnary")
        };
        // upload the file on cloudnary
        const response = await cloudinary.uploader.upload(
          localFilePath, 
          {
            resource_type: "auto"
          }
        )
        return response;

    } catch (error) {
        console.error("Error while uploading file to cloudnary : " , error)
    }finally {
      if(localFilePath){
        try {
          fs.unlinkSync(localFilePath)
        } catch (error) {
          console.error("Error while deleting file from local folder : " , error)

        }
      }
    }
}

const deleteOnCloudinary = async(path0, type) => {

  try {
    const path = path0.substring(path0.lastIndexOf("/") + 1, path0.lastIndexOf("."))
    const response = await cloudinary
          .api
          .delete_resources([path], 
              {  type: 'upload',resource_type: type }
            )

    return response;
                          
  } catch (err) {
    console.log(err)
      throw new ApiError(200,"Error occurred while deleting previous file on Cloudinary")
  }
}


export {
     uploadOnCloudinary,
     deleteOnCloudinary
}