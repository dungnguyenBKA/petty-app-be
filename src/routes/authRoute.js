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
import NovelModel from "../models/NovelModel.js";
import PostModel from "../models/PostModel.js";

const router = express.Router()

async function createUser(username, password) {
  const hashPwd = await bcrypt.hash(password, 10)
  return {
    id: v4(),
    name: username,
    pass: hashPwd
  }
}

router.get('/', authenticationMiddle, async (req, res) => {
  const users = await UserModel.find({})
  res.json(createResponse(successMessage, users?.map((item) => pickPropertyUser(item))))
  // let { limit, page } = req.query
  // const _limit = Number(parseInt(limit) || 10)
  // const _page = Number(parseInt(page) || 0)
  //
  // const novels = await NovelModel.find({})
  // const startPos = Number(_page*_limit)
  // const pagingNovels = novels.slice(startPos, startPos+_limit)
  // const isNextPage = pagingNovels.length === _limit
  //
  // res.json(createResponse("success", {
  //   novels: pagingNovels,
  //   nextPage: isNextPage ? _page+1 : undefined
  // }))
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

  const query = await UserModel.find({
    name: username
  })

  if (query?.length === 1) {
    const user = query[0]
    if (await bcrypt.compare(password, user.pass)) {
      const token = jwt.sign(user.id, process.env.SECRET_KEY)
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
    if (err) {
      console.error(err)
      res.status(400).json(createResponse(errorMessage))
      return
    }

    const token = jwt.sign(newUser.id, process.env.SECRET_KEY)
    res.json(createResponse(successMessage, {
      token,
      user: pickPropertyUser(newUser)
    }))
  })
})

export default router
