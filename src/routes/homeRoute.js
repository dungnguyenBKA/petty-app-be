import express from "express";
import createResponse from "../utils/BaseResponse.js";
import {errorMessage, errorUnAuthorizeMessage, successMessage} from "../utils/Const.js";
import jwt from "jsonwebtoken"

const router = express.Router()

router.get('/', (req, res) => {
    try {
        const authorization = req.headers.authorization
        const token = authorization.split(' ')[1]
        if (jwt.verify(token, process.env.SECRET_KEY) !== "Dung") {
            res.status(401).json(createResponse(errorUnAuthorizeMessage))
            return
        }
        res.json(createResponse(successMessage))
    } catch (e) {
        console.error(e)
        res.status(400).json(createResponse(errorMessage))
    }
})

export default router
