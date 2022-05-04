import express from "express";
import createResponse from "../utils/BaseResponse.js";
import {eNotEnoughParametersMess, successMessage} from "../utils/Const.js";
import jwt from "jsonwebtoken"

const router = express.Router()

// middleware that is specific to this router
router.use((req, res, next) => {
    next()
})

// define the home page route
router.post('/login', (req, res) => {
    const { username, password } = req.body
    if(!username || !password) {
        res.status(400).json(createResponse(eNotEnoughParametersMess))
        return
    }
    const token = jwt.sign(username, process.env.SECRET_KEY)
    res.json(createResponse(successMessage, {
        token
    }))
})

export default router
