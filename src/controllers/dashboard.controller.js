import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler( async(req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    
    const channelStats = await User.aggregate(
      
          [
            {
                $match:{
                    _id: req.user._id,
                }
            },
            
            {
                $lookup: {
                  from: "tweets",
                  localField: "_id",
                  foreignField: "owner",
                  as: "tweet"
                }
            },

            {
                $lookup: {
                  from: "likes",
                  localField: "_id",
                  foreignField: "likedBy",
                  as: "like"
                }
            },

            {
                $lookup: {
                  from: "comments",
                  localField: "_id",
                  foreignField: "owner",
                  as: "comment"
                }
            },

            {
                $project: {
                    tweet: 1,
                    comment: 1,
                    like: 1
                }
            }



        ]

    )


    return res.status(200).json(
        new ApiResponse(200, channelStats, "Channel stats for user")
    )

   

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const videos = await User.aggregate(
        [
            {
                $match: {
                    _id: req.user?._id
                }
            },


            {
                $lookup:{
                    from: "videos",
                    localField: "_id",
                    foreignField: "owner",
                    as: "videoList"
                  }
            },

            {
                $project: {
                    videoList: 1
                }
            }
        ]
    )

    return res.status(200).json(
        new ApiResponse(200, videos, "Uploaded video by user")
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }