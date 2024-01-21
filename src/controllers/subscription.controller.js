import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription

    const sub_channel = await Subscription.findOne(
        {
            channel: channelId,
            subscriber: req.user._id
        }
    )


    let status;

    if(sub_channel){
        status = await Subscription.deleteOne(sub_channel._id);    
    }else{
        status = await Subscription.create(
            {
                channel: channelId,
                subscriber: req.user._id
            }
        )
    }

    return res.status(200).json(
        new ApiResponse(200,status,"subscription status got updated.")
    )
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    
    const subscriber = await Subscription.aggregate(
        [
            {
              $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
              }
            },
          
            {
              $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channels",
               
              }
            },
          
            {
              $project: {
                channels: 1,
                _id: 0
              }
            }
          
            
          ]
    )

    return res.status(200).json(
        new ApiResponse(200,subscriber,"All channels")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {

    const {channelId} = req.params

    const subscribers = await Subscription.aggregate(
        [
            {
              $match: {
                channel: new mongoose.Types.ObjectId(channelId),
              }
            },
          
            {
              $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline:[
                  {
                          $project: {
                              fullName: 1,
                              username: 1,
                              email: 1,
                            _id: 0
          
                          }
                      }
                ]
              }
            },
          
            {
              $project: {
                    subscriber: 1,
                    _id: 0
                }
            
            }
          ]
    )

    return res.status(200).json(
        new ApiResponse(200,subscribers,"Subscriber for channel")
    )

   
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}