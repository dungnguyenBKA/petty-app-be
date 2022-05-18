import express from "express";
import {authenticationMiddle} from "./authRoute.js";
import createResponse from "../utils/BaseResponse.js";
import {v4} from "uuid";
import PostModel from "../models/PostModel.js";
import {errorMessage} from "../utils/Const.js";

const router = express.Router()

function createPost(title, body, userId) {
    return {
        id: v4(),
        title,
        body,
        userId
    }
}

router.get('/', authenticationMiddle, async (req, res) => {
    let { limit, page } = req.query
    const _limit = parseInt(limit) || 3
    const _page = parseInt(page) || 0

    const posts = [...await PostModel.find({})]
    const startPos = _page*_limit
    const pagingPosts = posts.slice(startPos, startPos+_limit)
    const isNextPage = pagingPosts.length === _limit

    res.json(createResponse("success", {
        posts: pagingPosts,
        nextPage: isNextPage ? _page+1 : undefined
    }))
})

router.post('/', authenticationMiddle, (req, res) => {
    const { title, body } = req.body
    const user = req.user
    PostModel.create(createPost(title, body, user.id), (err) => {
        if(err) {
            res.status(400).json(createResponse(errorMessage))
            return
        }
        res.json(createResponse("success"))
    })
})

export default router
