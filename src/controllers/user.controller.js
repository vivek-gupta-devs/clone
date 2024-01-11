import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

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
    // const coverImagePath = req.files?.coverImage[0]?.path;

    let coverImagePath;
    let coverImage;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImagePath = req.files.coverImage[0].path
        coverImage = await uploadOnCloudinary(coverImagePath);

    }

    

    if(!avatarPath){
        throw new ApiError(400, "Avatar file is required.")
    }

    const avatar = await uploadOnCloudinary(avatarPath);


    if(!avatar){
        throw new ApiError(400, "Avatar file uploading not happen.")
    }

    const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
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


const loginUser = asyncHandler( async(req,res) => {
    const {email,username,password} = req.body;

    if(!username && !email){
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or : [
            {email}, {username}
        ]
    });

    if(!user){
        throw new ApiError(404, "user not found!");
    }


    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "invalid password credential")
    }

    const {
        acccessToken,
        refreshToken
    } = await generateAccessAndRefreshTokens(user._id);

  

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    };


    return res
                .status(200)
                .cookie("accessToken", acccessToken, options)
                .cookie("refreshToken", refreshToken, options)
                .json(
                    new ApiResponse(
                        200,
                        {
                            user: loggedInUser,
                            acccessToken,
                            refreshToken
                        },
                        "user logged in succesfully"
                    )
                )

});

const logoutUser = asyncHandler( async(req,res) => {
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken: undefined
            }
        },{
            new : true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    };


    return res
            .status(200)
            .clearCookie("accessToken",options)
            .clearCookie("refreshToken",options)
            .json(new ApiResponse(200, {}, "user logged out."))
})

 const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        console.log(userId);
        const user =  await User.findById(userId);
        const acccessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();


        user.refreshToken = refreshToken;

        await user.save({
            validateBeforeSave: false
        })


        return {
            acccessToken,
            refreshToken
        }

    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating tokens");
    }
 };

 const refreshAccessToken = asyncHandler( async(req,res) => {
    try {
        const incomingToken = req.cookies.refreshToken || req.body.refreshToken;
        
        if(!incomingToken){
            throw new ApiError(401,"unauthorized request")
        }
    
        const decodedToken = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }
    
    
        if(incomingToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh token expired or used.")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {
            acccessToken,newRefreshToken
        }
          =
        await generateAccessAndRefreshTokens(user._id);
    
        return res
            .status(200)
            .cookie("accessToken",acccessToken,options)
            .cookie("refreshToken",newRefreshToken,options)
            .json(
                new ApiResponse(
                    200,
                    {
                        acccessToken,
                        refreshToken : newRefreshToken
                    },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401,"Something goes wrong while generating token.")
    }
    
    }
 )

 const updatePassword = asyncHandler( async(req,res) => {
    
    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user._id);

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordValid){
        throw new ApiError(400,"Old password is not matching. Please correct it")
    }


    user.password = newPassword;

    await user.save({
        validateBeforeSave: false
    })
    return res.status(200).json(new ApiResponse(200, {}, "password updated"))
 })

 const getCurrentUser = asyncHandler( async(req,res) => {
    const user = req.user;
    return res.status(200).json(new ApiResponse(200, user, "This is current user. Loged in"))
 })

 const updateAccountDetail = asyncHandler( async(req,res) => {
    const {fullName,email} = req.body

    if(!fullName || !email){
        throw new ApiError(400,"All fields are required")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set : {
                email: email,
                fullName: fullName
            }
        },
        {
            new: true
        }).select("-password");


    return res.status(200)
                .json(
                    new ApiResponse(200, user,"User details are updated.")
                )
 })

 const updateUserAvatar = asyncHandler( async(req,res) => {

    
    const updatedAvatarPath = req.file?.path;

    
    if(!updatedAvatarPath){
        throw new ApiError(400, "Avatar file is required.")
    }

    const avatar = await uploadOnCloudinary(updatedAvatarPath);


    if(!avatar.url){
        throw new ApiError(400, "Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set : {
             avatar : avatar?.url
            }
        },
        {
            new: true
        }).select("-password");


    return res.status(200).json( new ApiResponse(200, {user}, "Avatar file is updated."))



 })

 const updateUserCoverImage = asyncHandler( async(req,res) => {

    
    const updatedCoverImage = req.file?.path;

    
    if(!updatedCoverImage){
        throw new ApiError(400, "Cover Image file is required.")
    }

    const coverImage = await uploadOnCloudinary(updatedCoverImage);


    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading cover image")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set : {
             coverImage : coverImage?.url
            }
        },
        {
            new: true
        }).select("-password");


    return res.status(200).json( new ApiResponse(200, {user}, "Cover image file is updated."))



 })

 const getUserChannelProfile = asyncHandler( async(req,res) => {
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(400,"username is missing")
    }

    const channel = await User.aggregate(
        [
            {
                $match: {
                  username: username?.toLowerCase()
                }
            },

            {
                $lookup: {
                  from: "Subscription",
                  localField: "_id",
                  foreignField: "channel",
                  as: "subscribers"
                }
            },

            {
                $lookup: {
                  from: "Subscription",
                  localField: "_id",
                  foreignField: "subscriber",
                  as: "subscribedTo"
                }
            },

            {
                $addFields: {
                    subscribersCount: {
                        $size: "$subscribers"
                    },
                    channelsSubscribedToCount: {
                        $size: "$subscribedTo"
                    },
                    isSubscribed: {
                        $cond: {
                            if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                            then: true,
                            else: false
                        }
                    }
                }
            },

            {
                $project: {
                    fullName: 1,
                    username: 1,
                    subscribersCount: 1,
                    channelsSubscribedToCount: 1,
                    isSubscribed: 1,
                    avatar: 1,
                    coverImage: 1,
                    email: 1

                }
            }



        ]
    )
    if(!channel?.length){
        throw new ApiError(404,"channel does not exists")
     }
    
     return res.status(200).json( new ApiResponse(200, channel[0], "User channel fetched successfully"))
    
 })


 const getWatchHistory = asyncHandler( async(req,res) => {

    const user = await User.aggregate(
        [
            {
                $match: {
                    _id : new mongoose.Types.ObjectId(req.user._id)
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchHistory",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                    {
                                        $project: {
                                            username: 1,
                                            avatar: 1,
                                            fullName: 1,

                                        }
                                    }
                                ]
                            }
                        },

                        {
                            $addFields: {
                                owner: {
                                    $first: "$owner"
                                }
                            }
                        }
                    ]
                }
            },     
        ]
    )

    return res.status(200).json(
        new ApiResponse(200,user[0].watchHistory,"watch history fetched successfully.")
    )


 })

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updatePassword,
    getCurrentUser,
    updateAccountDetail,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}