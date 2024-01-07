import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";
          
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET
});

const uploadOnCloudinary = async(localFilePath) => {
    try {
        if(!localFilePath) return null;
        // upload the file on cloudnary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        // file uploading done
        console.log("file is uploaded on cloudnary", response.url);
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the local saved temporary file as the upload operation got failed.
        return null;
    }
}

/** 

cloudinary.v2.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
  { public_id: "olympic_flag" }, 
  function(error, result) {console.log(result); });

*/
export {
     uploadOnCloudinary
}