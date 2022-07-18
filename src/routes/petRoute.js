import express from "express";
import createResponse from "../utils/BaseResponse.js";
import {v4} from "uuid";
import PetModel from "../models/PetModel.js";
import {errorMessage} from "../utils/Const.js";
import {authenticationMiddle} from "../middleware/authenticationMiddle.js";

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
    const pets = await PetModel.find({})
    res.json(createResponse("success", {
        pets: pets
    }))
})

router.get('/my', authenticationMiddle, (req, res) => {
    const user = req.user
    res.json(createResponse("success", {}))
})

export default router
