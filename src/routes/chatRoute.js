import express from "express";
import {authenticationMiddle} from "../middleware/authenticationMiddle.js";
import createResponse from "../utils/BaseResponse.js";
import {errorMessage, successMessage} from "../utils/Const.js";
import {pickPropertyChannel, pickPropertyUser} from "../utils/utils.js";
import ChannelModel from "../models/ChannelModel.js";
import UserModel from "../models/UserModel.js";
import {AppPusher} from "../../index.js";
import MessageModel from "../models/MessageModel.js";

const router = express.Router()

router.post('/send_message', authenticationMiddle, async (req, res) => {
  // get params
  const {user} = req
  const {receiverId, message} = req.body
  // validate receiver
  const queryReceiver = await UserModel.find({
    id: receiverId
  })

  if(queryReceiver?.length !== 1 || !queryReceiver) {
    res.status(400).json(createResponse("Receiver not found"))
    return
  }

  const receiver = queryReceiver[0]

  const queryChannels = await ChannelModel.find({
    userIds : { $all: [user.id, receiverId] }
  })

  let channel


  if(queryChannels?.length === 0) {
    console.log("Create new chat room !")
    channel = await ChannelModel.create({
      userIds: [user.id, receiverId]
    }, (error, result) => {
      if(error) {
        console.error(error)
        res.status(400).json(createResponse(errorMessage))
      }
    })
  } else {
    channel = queryChannels[0]
  }

  // add message to database

  await MessageModel.create({
    message,
    channel_id: channel._id?.toString()
  }, (error, _) => {
    if(error) {
      res.status(400).json(createResponse(errorMessage))
    }
  })

  await AppPusher.trigger(`chat_channel_${channel._id?.toString()}`, "message_event", {
    message: message,
    senderId: user.id,
    receiverId,
  })

  res.json(createResponse(successMessage, {
    message,
  }))
})


router.get('/channel_detail', authenticationMiddle, async (req, res) => {
  const {channel_id} = req.body

  const queryMessages = await MessageModel.find(
    {
      channel_id: channel_id
    }
  )

  res.json(createResponse(successMessage, {
    messages: queryMessages
  }))
})

router.get('/list_channel', authenticationMiddle, async (req, res) => {
  const user = req.user
  const query = await ChannelModel.find({
    userIds: user.id
  })
  res.json(createResponse(successMessage, query.map(item => pickPropertyChannel(item))))
})

export default router
