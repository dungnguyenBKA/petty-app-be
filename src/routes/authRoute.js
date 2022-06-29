import express from "express";
import createResponse from "../utils/BaseResponse.js";
import {
    eNotEnoughParametersMess,
    eNotUniqueName,
    errorBadRequestMessage, errorMessage,
    errorUnAuthorizeMessage,
    successMessage
} from "../utils/Const.js";
import jwt from "jsonwebtoken"
import {v4} from 'uuid';

import bcrypt from "bcrypt"
import UserModel from "../models/UserModel.js";
import _ from "lodash";
import {pickPropertyUser} from "../utils/utils.js";

const router = express.Router()

async function createUser(username, password) {
    const hashPwd = await bcrypt.hash(password, 10)
    return {
        id: v4(),
        name: username,
        pass: hashPwd
    }
}

router.post('/login', async (req, res) => {
    const {username, password} = req.body
    if (!username || !password) {
        res.status(400).json(createResponse(eNotEnoughParametersMess))
        return
    }

    const usersDb = await UserModel.find({})
    // get user from list and do authenticate
    for (let i = 0; i < usersDb.length; i++) {
        const user = usersDb[i];
        if (user.name !== username) {
            continue;
        }

        if (await bcrypt.compare(password, user.pass)) {
            const token = jwt.sign(user.id, process.env.SECRET_KEY)
            res.json(createResponse(successMessage, {
                token,
                user: pickPropertyUser(user)
            }))
            return;
        }
    }

    res.status(401).json(createResponse(errorUnAuthorizeMessage))
})

router.post('/register', async (req, res) => {
    const {username, password, rePassword} = req.body
    if (!username || !password || !rePassword) {
        res.status(400).json(createResponse(eNotEnoughParametersMess))
        return
    }

    if (password !== rePassword) {
        res.status(400).json(createResponse(errorBadRequestMessage))
        return
    }

    const usersDb = await UserModel.find({})

    // check username unique
    for (let i = 0; i < usersDb.length; i++) {
        const user = usersDb[i];
        if (user.name === username) {
            res.status(400).json(createResponse(eNotUniqueName))
            return
        }
    }

    const newUser = await createUser(username, password)

    UserModel.create(newUser, (err, _) => {
        if(err) {
            console.error(err)
            res.status(500).json(createResponse(errorMessage))
            return
        }

        const token = jwt.sign(newUser.id, process.env.SECRET_KEY)
        res.json(createResponse(successMessage, {
            token,
            user: pickPropertyUser(newUser)
        }))
    })
})

export function authenticationMiddle(req, res, next) {
    try {
        const authorization = req.headers.authorization
        const token = authorization.split(' ')[1]
        jwt.verify(token, process.env.SECRET_KEY, async (err, userId) => {
            if (err) {
                res.status(401).json(createResponse(errorUnAuthorizeMessage))
            }
            const usersDb = await UserModel.find({})
            for (let i = 0; i < usersDb.length; i++) {
                const user = usersDb[i];
                if(user.id !== userId) {
                    continue;
                }
                req.user = user
                break;
            }
            next()
        })
    } catch (e) {
        console.error(e)
        res.status(401).json(createResponse(errorUnAuthorizeMessage))
    }
}

export default router
