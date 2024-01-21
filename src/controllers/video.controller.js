import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    const { title, description } = req.body;

    if(!title || !description){
        throw new ApiError(400,"title or description is required")
    }

    const videoFile = req.files?.videoFile[0]?.path

    const thumbnailFile = req.files?.thumbnail[0]?.path

    if (!videoFile || !thumbnailFile) {
        throw new ApiError(404, "videofile or thumbnail are required");
    }

    const uploadVideo = await uploadOnCloudinary(videoFile)
    const uploadThumbnail = await uploadOnCloudinary(thumbnailFile)



    const user = await User.findById(req.user._id).select(
        " -password -avatar -coverImage -watchHistory -password -refreshToken -createdAt -updatedAt "
    )

 

    const video = await Video.create({
        videoFile: uploadVideo?.url || "",
        thumbnail: uploadThumbnail?.url || "",
        title,
        description,
        duration: uploadVideo.duration,
        owner: user

    })

    return res.status(201).json(
        new ApiResponse(200, video, "video uploaded succesfully")
    )


    
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    validateBasedOnId(videoId)
    
    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404,"No video found with videoId")
    }

    return res.status(200).json(
        new ApiResponse(200, video, "video found successfully.")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId} = req.params
    
    //TODO: update video details like title, description, thumbnail

    const {title, description} = req.body;

    validateBasedOnId(videoId)
    
    if([title, description].some((anyField) => anyField?.trim() === "")){
        throw new ApiError(400, "title & description is required.")
    }

    const thumbnail = req.file?.path

    if(!thumbnail){
        throw new ApiError(400, "Thumbnail file required.")
    }
   
    const updateThumbnail = await uploadOnCloudinary(thumbnail);
    
    const video = await Video.findByIdAndUpdate(videoId,
        {
            $set : {
                title: title,
                description : description,
                thumbnail: updateThumbnail.url
            }
        },
        {
        new: true
        }
    )


    return res.status(200).json(
        new ApiResponse(200, video, "video details are updated succesfully")
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    validateBasedOnId(videoId);

    await Video.findByIdAndDelete(videoId);

    return res.status(200).json(
        new ApiResponse(200,{},"video deleted succesfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {

    const { videoId } = req.params
    //TODO: get video by id

    validateBasedOnId(videoId)

    const video = await Video.findById(videoId).select("-createdAt -updatedAt");

    if(!video){
        throw new ApiError(404,"No video found with videoId")
    }

    video.isPublished = !video.isPublished

    await video.save({
        validateBeforeSave: false
    })

    return res.status(200).json(
        new ApiResponse(200, video, "video ispublished upated!")
    )

})

const validateBasedOnId = (id) => {

    const validateId = isValidObjectId(id);

    if(!validateId){
        throw new ApiError(400,"please provide valid videoId.")
    }

}

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
