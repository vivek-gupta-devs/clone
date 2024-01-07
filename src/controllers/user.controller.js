import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler( async (req,res) => {


    const {username, email, fullName, password} = req.body;

    if([username, email, fullName, password].some((anyField) => anyField?.trim() === "")){
        throw new ApiError(400, "Please fill all necessary fields.")
    }

    const existinguser = await User.findOne({
        $or : [{ username }, { email }]
    })

    if(existinguser){
        throw new ApiError(409, "User detail already exist with username & email");
    }

    const avatarPath = req.files?.avatar[0]?.path;
    const coverImagePath = req.files?.coverImage[0]?.path;

    if(!avatarPath){
        throw new ApiError(400, "Avatar file is required.")
    }

    const avatar = await uploadOnCloudinary(avatarPath);
    const coverImage = await uploadOnCloudinary(coverImagePath);


    if(!avatar){
        throw new ApiError(400, "Avatar file is required.")
    }

    const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowercase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken" 
    );

    if(!createdUser){
        throw new ApiError(500,"Error while registering user.");
    }


    return res.status(201).json(

        new ApiResponse(200, createdUser, "User register successfully.")
    )
})

/**
 *  Get User Input Details
 *  Validate user input details
 *  check user already exist : username , email
 *  check for images , avatar
 *  save it to the cloudnary first
 *  create user object & save it
 *  remove password & token from response.
 *  return res 
 */



export {
    registerUser
}