import express from "express";
import {authenticationMiddle} from "../middleware/authenticationMiddle.js";
import createResponse from "../utils/BaseResponse.js";
import {errorMessage, successMessage} from "../utils/Const.js";
import ChannelModel from "../models/ChannelModel.js";
import UserModel from "../models/UserModel.js";
import {AppPusher} from "../../index.js";
import MessageModel from "../models/MessageModel.js";
import {pickPropertyChannel} from "../utils/utils.js";

const router = express.Router()

router.post('/send_message', authenticationMiddle, async (req, res) => {
  // get params
  const {user} = req

  if (!user._id) {
    res.status(400).json(createResponse(errorMessage))
    return
  }

  const {receiverId, message} = req.body
  // validate receiver
  const queryReceiverCount = await UserModel.count({
    _id: receiverId
  })

  if (queryReceiverCount <= 0) {
    res.status(400).json(createResponse("Receiver not found"))
    return
  }

  const queryChannels = await ChannelModel.find({
    userIds: {$all: [user._id, receiverId]}
  })

  let channel

  if (queryChannels?.length === 0) {
    console.log("Create new chat room !")
    await ChannelModel.create({
      userIds: [user._id, receiverId]
    }, async (error, result) => {
      if (error) {
        console.error(error)
        res.status(400).json(createResponse(errorMessage))
      }
      await sendMessageInChannel(res, message, result._id, user._id, receiverId)
    })
  } else {
    channel = queryChannels[0]
    await sendMessageInChannel(res, message, channel._id, user._id, receiverId)
  }
})

async function sendMessageInChannel(res, message, channelID, senderId, receiverId) {
  await MessageModel.create({
    message, channel_id: channelID, sender_id: senderId
  }, async (error, result) => {
    if (error) {
      res.status(400).json(createResponse(errorMessage))
    }

    const msgObj = result?.toObject()

    await AppPusher.trigger(`chat_channel_${channelID}`, "message_event", {
      ...msgObj
    })

    res.json(createResponse(successMessage, {
      ...msgObj
    }))
  })
}

router.get('/channel_detail', authenticationMiddle, async (req, res) => {
  const {channel_id} = req.query
  const queryMessages = await MessageModel.find({
    channel_id: channel_id
  }).sort({ createdAt: -1 })

  res.json(createResponse(successMessage, {
    messages: queryMessages
  }))
})

router.get('/list_channel', authenticationMiddle, async (req, res) => {
  const user = req.user
  const query = await ChannelModel.find({
    userIds: user._id
  }).lean()

  const channels = []

  for (let i = 0; i < query.length; i++) {
    const channelInfo = query[i];
    const receiverId = channelInfo.userIds.find((_id) => {
      return _id !== user._id
    })

    if (!receiverId) {
      return undefined
    }

    const receiver = await UserModel.findOne({
      _id: receiverId
    })

    const messages = await MessageModel.find({
      channel_id: channelInfo._id
    }).lean()

    channels.push(pickPropertyChannel({
      ...channelInfo, receiver, last_message: messages.length > 0 ? messages[messages.length - 1] : undefined
    }))
  }

  res.json(createResponse(successMessage, channels))
})

export default router
