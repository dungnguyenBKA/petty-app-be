import jwt from "jsonwebtoken";
import createResponse from "../utils/BaseResponse.js";
import {errorUnAuthorizeMessage} from "../utils/Const.js";
import UserModel from "../models/UserModel.js";

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
        if (user.id !== userId) {
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
