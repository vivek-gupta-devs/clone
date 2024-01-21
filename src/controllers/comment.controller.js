import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 2} = req.query

    const skipcount = page * limit

    const comments = await Comment.find(
        {
            video: videoId
        }
    )
    .skip(skipcount)
    .limit(limit);

    return res.status(200).json(
        new ApiResponse(200, comments, "comments fetched successfully.")
    )
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const { content } = req.body

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "No video found with this videoId")
    }

    const comment = await Comment.create(
        {
            content,
            video : video._id,
            owner: req.user._id
        }
    )

    return res.status(201).json(
        new ApiResponse(200, comment, "comment on video added successfully.")
    )

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const { content } = req.body

    if(!content){
        throw new ApiError(200,"content is required")
    }

    const comment = await Comment.findByIdAndUpdate(commentId, {
        $set: {
            content : content
        }
    },{
        new: true
    });

    return res.status(200).json(
        new ApiResponse(200,comment, "comment on video updated successfully.")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params

    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json(
        new ApiResponse(200, {},"comment on video deleted successfully.")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }
