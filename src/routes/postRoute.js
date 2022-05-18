import express from "express";
import {authenticationMiddle} from "./authRoute.js";
import createResponse from "../utils/BaseResponse.js";
import {v4} from "uuid";

const router = express.Router()

export const posts = []

function createPost(title, body, userId) {
    return {
        id: v4(),
        title,
        body,
        userId
    }
}

router.get('/', authenticationMiddle, (req, res) => {
    let { limit, page } = req.query
    const _limit = parseInt(limit) || 3
    const _page = parseInt(page) || 0

    console.log({posts})
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
    console.log({user})
    posts.push(createPost(title, body, user.id))
    res.json(createResponse("success"))
})

export default router
