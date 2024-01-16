import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist

    const playlist = await Playlist.create({
        name,
        description,
        videos: [],
        owner: req.user._id
    })

    return res.status(201).json(
        new ApiResponse(200, playlist, "playlist created.")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    const playlists = await Playlist.find({
        owner: userId
    })

    return res.status(200).json(
        new ApiResponse(200,playlists,"playlists fetched successfully.")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    const playlist = await Playlist.findById(playlistId);

    if(!playlistId){
        throw new ApiError(404,"No playlist found")
    }

    return res.status(200).json(
        new ApiResponse(200,playlist,"playlist fetched successfully.")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    const playlist = await Playlist.findByIdAndUpdate(playlistId,
        {
            $push: {
                "videos": videoId
            }
        }
    )

    return res.status(201).json(
        new ApiResponse(200, playlist,"video added to playlist")
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    const playlist = await Playlist.findByIdAndUpdate(playlistId,
        {
            $pull: {
                "videos": videoId
            }
        }
    )

    return res.status(201).json(
        new ApiResponse(200, playlist,"video removed from playlist")
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    await Playlist.findByIdAndDelete(playlistId);

    return res.status(200).json(
        new ApiResponse(200,{},"playlist deleted successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    const playlist = await Playlist.findByIdAndUpdate(playlistId, {
        $set: {
            name: name,
            description:description
        }
    },{
        new: true
    })

    return res.status(200).json(
        new ApiResponse(200, playlist, "playlist name & description updated successfully")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
