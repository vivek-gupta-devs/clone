import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    const video = await Like.findOne({video: videoId, likedBy: req.user._id});

    let status;

    if(video){
        status = await Like.deleteOne({
            video: videoId
           }) 
    }else{
        status = await Like.create({
            video: videoId,
            likedBy: req.user._id
        
        })
    }
    
    return res.status(200).json(
        new ApiResponse(200,status,"video like updated successfully")
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    const comment = await Like.findOne({comment: commentId, likedBy: req.user._id});

    let status;
    if(comment){
       status = await Like.deleteOne({
        comment: commentId
       }) 

       
    }else{
        status = await Like.create({
            comment: commentId,
            likedBy: req.user._id,
        
        })
    }

    return res.status(200).json(
        new ApiResponse(200,status,"comment like updated successfully")
    )


})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    const tweet = await Like.findOne({tweet: tweetId, likedBy: req.user._id});

    let status;
    if(tweet){
       status = await Like.deleteOne({
        tweet: tweetId
       }) 

       
    }else{
        status = await Like.create({
            tweet: tweetId,
            likedBy: req.user._id,
        
        })
    }

    return res.status(200).json(
        new ApiResponse(200,status,"comment like updated successfully")
    )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const likedVideo = await Like.aggregate(
        [
            {
              $match: {
                video: {
                  $exists: true
                }
              }
            },{
              $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "collection"
              }
            },{
              $project: {
                collection: 1,
                _id: 0
              }
            }
          ]
    )

    return res.status(200).json(
        new ApiResponse(200,likedVideo,"List of all liked vidoes")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}