import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body
    
    if(!content){
        throw new ApiError(404, "Please provide some textfull content.")
    }

    const tweet = await Tweet.create( {
        content,
        owner: req.user._id
    } )

    return res.status(201).json(
        new ApiResponse(200,tweet,"tweet created successfully.")
    )

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params

    validateBasedOnId(userId)

    const tweets = await Tweet.find({
        owner: userId
    },
    {
        "content": 1,
        "createdAt": 1,
        "updatedAt": 1,
        "_id": 0
    })

    return res.status(200).json(
        new ApiResponse(200, tweets, "tweets fetched successfully")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    const { content } = req.body
    
    validateBasedOnId(tweetId);

    const tweet = await Tweet.findByIdAndUpdate(tweetId, {
        $set: {
            content: content
        }
    },{
        new: true
    })

    return res.status(200).json(
        new ApiResponse(200,tweet,"tweet updated successfully.")
    )


})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params
  
    validateBasedOnId(tweetId);

    await Tweet.findByIdAndDelete(tweetId)

    return res.status(200).json(
        new ApiResponse(200,{},"tweet deleted successfully.")
    )

})

const validateBasedOnId = (id) => {

    const validateId = isValidObjectId(id);

    if(!validateId){
        throw new ApiError(400,"please provide valid videoId.")
    }

}

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
