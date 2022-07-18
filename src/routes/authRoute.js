import express from "express";
import createResponse from "../utils/BaseResponse.js";
import {
  eNotEnoughParametersMess,
  eNotUniqueName,
  errorBadRequestMessage,
  errorMessage,
  errorUnAuthorizeMessage,
  successMessage
} from "../utils/Const.js";
import jwt from "jsonwebtoken"
import {v4} from 'uuid';

import bcrypt from "bcrypt"
import UserModel from "../models/UserModel.js";
import {pickPropertyUser} from "../utils/utils.js";
import {authenticationMiddle} from "../middleware/authenticationMiddle.js";

const router = express.Router()

async function createUser(username, password) {
  const hashPwd = await bcrypt.hash(password, 10)
  return {
    username,
    pass: hashPwd
  }
}

router.get('/', async (req, res) => {
  const users = await UserModel.find({})
  res.json(createResponse(successMessage, users?.map((item) => pickPropertyUser(item))))
})

router.get('/profile', authenticationMiddle, async (req, res) => {
  const user = req.user
  res.json(createResponse(successMessage, pickPropertyUser(user)))
})

router.delete('/', async (req, res) => {
  try {
    await UserModel.deleteMany({})
    res.json(createResponse(successMessage))
  } catch (e) {
    res.status(400).json(createResponse(e.message))
  }
})

router.post('/login', async (req, res) => {
  const {username, password} = req.body
  if (!username || !password) {
    res.status(400).json(createResponse(eNotEnoughParametersMess))
    return
  }

  const user = await UserModel.findOne({
    username: username
  })

  if (user) {
    if (await bcrypt.compare(password, user.pass)) {
      const token = jwt.sign(user.username, process.env.SECRET_KEY)
      res.json(createResponse(successMessage, {
        token,
        user: pickPropertyUser(user)
      }))
    } else {
      res.status(401).json(createResponse(errorUnAuthorizeMessage))
    }
  } else {
    res.status(401).json(createResponse(errorUnAuthorizeMessage))
  }
})

router.post('/register', async (req, res) => {
  const {username, password, rePassword, avatar, description} = req.body
  if (!username || !password || !rePassword) {
    res.status(400).json(createResponse(eNotEnoughParametersMess))
    return
  }

  if (password !== rePassword) {
    res.status(400).json(createResponse(errorBadRequestMessage))
    return
  }

  const usersConflictCount = await UserModel.count({
    username: username
  })

  if(usersConflictCount > 0) {
    res.status(400).json(createResponse(eNotUniqueName))
    return
  }

  const newUser = {
    ... await createUser(username, password),
    avatar,
    description
  }

  UserModel.create(newUser, (err, _) => {
    if (err) {
      console.error(err)
      res.status(400).json(createResponse(errorMessage))
      return
    }

    const token = jwt.sign(newUser.username, process.env.SECRET_KEY)
    res.json(createResponse(successMessage, {
      token,
      user: pickPropertyUser(newUser)
    }))
  })
})

export default router
