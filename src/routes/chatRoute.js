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

  if(!user._id) {
    res.status(400).json(createResponse(errorMessage))
    return
  }

  const {receiverId, message} = req.body
  // validate receiver
  const queryReceiverCount = await UserModel.count({
    _id: receiverId
  })

  if(queryReceiverCount <= 0) {
    res.status(400).json(createResponse("Receiver not found"))
    return
  }

  const queryChannels = await ChannelModel.find({
    userIds : { $all: [user._id, receiverId] }
  })

  let channel

  if(queryChannels?.length === 0) {
    console.log("Create new chat room !")
    await ChannelModel.create({
      userIds: [user._id, receiverId]
    }, async (error, result) => {
      if(error) {
        console.error(error)
        res.status(400).json(createResponse(errorMessage))
      }

      await sendMessageInChannel(res, message, result._id, user._id, receiverId)
    })
  } else {
    channel = queryChannels[0]
    console.log("old room", {channel})
    await sendMessageInChannel(res, message, channel._id, user._id, receiverId)
  }
})

async function sendMessageInChannel(res, message, channelID, senderId, receiverId) {
  await MessageModel.create({
    message,
    channel_id: channelID,
    sender_id: senderId
  }, (error, _) => {
    if(error) {
      res.status(400).json(createResponse(errorMessage))
    }
  })

  await AppPusher.trigger(`chat_channel_${channelID}`, "message_event", {
    message: message,
    senderId: senderId,
    receiverId,
  })

  res.json(createResponse(successMessage, {
    message,
  }))
}

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
    userIds: user._id
  })
  res.json(createResponse(successMessage, query.map(item => pickPropertyChannel(item))))
})

export default router
