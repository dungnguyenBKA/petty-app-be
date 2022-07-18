import jwt from "jsonwebtoken";
import createResponse from "../utils/BaseResponse.js";
import {errorUnAuthorizeMessage} from "../utils/Const.js";
import UserModel from "../models/UserModel.js";
import {pickPropertyUser} from "../utils/utils.js"

export function authenticationMiddle(req, res, next) {
  try {
    const authorization = req.headers.authorization
    const token = authorization.split(' ')[1]
    console.log({token})
    jwt.verify(token, process.env.SECRET_KEY, async (err, username) => {
      if (err) {
        res.status(401).json(createResponse(errorUnAuthorizeMessage))
      }
      console.log({username})
      const user = await UserModel.findOne({
        username: username
      })
      console.log({user})
      if (user) {
        req.user = pickPropertyUser(JSON.parse(JSON.stringify(user)))

        next()
      } else {
        res.status(401).json(createResponse(errorUnAuthorizeMessage))
      }
    })
  } catch (e) {
    console.error(e)
    res.status(401).json(createResponse(errorUnAuthorizeMessage))
  }
}
