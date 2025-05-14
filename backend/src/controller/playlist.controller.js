import {db} from "../libs/db.js";

export const createPlaylist = async (req, res) => {

    const {name, description} = req.body;
    const userId = req.user.id;

    try {
        
        const playlist = await db.playlist.create({
            data:{
                name,
                description,
                userId
            }
        })

        res.status(201).json({
            success: true,
            message: "Playlist created successfully",
            playlist
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error creating playlist",
            error: error.message
        })
    }
}


export const getAllListDetails = async (req, res) => {

    try {
        
        const playlists = await db.playlist.findMany({
            where:{
                userId: req.user.id
            },
            include:{
                problems: {
                    include:{
                        problem: true
                    }
                }
            }
        })

        res.status(200).json({
            success: true,
            message: "Playlists fetched successfully",
            playlists
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error fetching playlists",
            error: error.message
        })
    }
}

export const getPlaylistDetails = async (req, res) => {
    const {playlistId} = req.params;

    try {
       const playlists = await db.playlist.findUniue({
            where:{
                userId: req.user.id,
                id: playlistId
            },
            include:{
                problems: {
                    include:{
                        problem: true
                    }
                }
            }
        })

        res.status(200).json({
            success: true,
            message: "Playlists fetched successfully",
            playlists
        }) 

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error fetching playlist",
            error: error.message
        })
        
    }

}

export const addProblemToPlaylist = async (req, res) => {

    const playlistId = req.params.playlistId;
    const {problemIds} = req.body;

    try {
        
        if(!Array.isArray(problemIds) || problemIds.length == 0){
            return res.status(400).json({
                success: false,
                message: "invalid or missing problem ids"
            })
        }

        // create a record in the playlistProblem table for each problemId
        const problemsInPlaylist = await db.ProblemInPlaylist.createMany({
            data: problemIds.map((problemId) => {
                playlistId,
                problemId
            })
        })

        res.status(201).json({
            success: true,
            message: "Problems added to playlist successfully",
            problemsInPlaylist
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error adding problems to playlist",
            error: error.message
        })
    }

}

export const deletePlaylist = async (req, res) => {
    const {playlistId} = req.params;

    try {
        
        const playlist = await db.playlist.delete({
            where:{
                id: playlistId,
                userId: req.user.id
            }
        })

        res.status(200).json({
            success: true,
            message: "Playlist deleted successfully",
            playlist
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error deleting playlist",
            error: error.message
        })
    }
}

export const removeProblemFromPlaylist = async (req, res) => {
    const {playlistId} = req.params;

    const {problemIds} = req.body;

    try {
        if(!Array.isArray(problemIds) || problemIds.length == 0){
            return res.status(400).json({
                success: false,
                message: "invalid or missing problem ids"
            })
        }
        const problemInPlaylist = await db.ProblemInPlaylist.deleteMany({
            where:{
                playlistId_problemId: {
                    playlistId,
                    problemId: {
                        in: problemIds
                    }
                }
            }
        })

        res.status(200).json({
            success: true,
            message: "Problem removed from playlist successfully",
            problemInPlaylist
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error removing problem from playlist",
            error: error.message
        })
    }
}