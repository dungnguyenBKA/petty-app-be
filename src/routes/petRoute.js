import express from "express";
import createResponse from "../utils/BaseResponse.js";
import PetModel from "../models/PetModel.js";
import {authenticationMiddle} from "../middleware/authenticationMiddle.js";
import {errorMessage} from "../utils/Const.js";
import UserModel from "../models/UserModel.js";
import ChannelModel from "../models/ChannelModel.js";

const router = express.Router()

router.get('/', authenticationMiddle, async (req, res) => {
  const pets = await PetModel.find({})
  res.json(createResponse("success", {
    pets: pets
  }))
})

router.get('/my', authenticationMiddle, async (req, res) => {
  const user = req.user
  if (!user._id) {
    res.status(400).json(createResponse(errorMessage))
  }

  const pets = await PetModel.find({
    owner_id: user._id
  })
  res.json(createResponse("success", {pets}))
})

router.get('/detail', authenticationMiddle, async (req, res) => {
  const {pet_id} = req.query
  const {user} = req

  const pet = await PetModel.findOne({
    _id: pet_id
  }).lean()

  try {
    const owner = await UserModel.findOne({
      _id: pet.owner_id
    }).lean()

    if (owner._id.equals(user._id)) {
      res.json(createResponse("success", {
        ...pet, owner
      }))
      return
    }

    const channel = await ChannelModel.findOne({
      userIds: {$all: [user._id.toString(), owner._id.toString()]}
    }).lean()

    res.json(createResponse("success", {
      ...pet, owner: {
        ...owner,
        channel_id: channel?._id
      }
    }))
  } catch (e) {
    console.error(e)
    res.json(createResponse("success", pet))
  }
})

router.post('/create', authenticationMiddle, async (req, res) => {
  const {
    name, dob, avatar, description, images,
  } = req.body

  const {user} = req

  const conflictCount = await PetModel.count({
    owner_id: user._id, name: name
  })

  if (conflictCount > 0) {
    res.status(400).json(createResponse("Already have pet's name"))
    return
  }

  await PetModel.create({
    name, dob, avatar, description, images, owner_id: user._id
  }, (error, result) => {
    if (error) {
      res.status(400).json(createResponse(errorMessage))
      return
    }

    res.json(createResponse("success", result))
  })
})

router.post('/update', authenticationMiddle, async (req, res) => {
  const {
    name, dob, avatar, description, images, id
  } = req.body
  const {user} = req

  const pet = await PetModel.findOne({
    owner_id: user._id, _id: id
  })

  if (!pet) {
    res.status(404).json(createResponse(errorMessage))
    return
  }

  console.log({pet})

  try {
    PetModel.findOneAndUpdate({
      owner_id: user._id, _id: id
    }, {
      $set: {
        "name": name || pet.name,
        "dob": dob || pet.dob,
        "avatar": avatar || pet.avatar,
        "description": description || pet.description,
        "images": images || pet.images
      }
    }, {
      new: true
    }, (error, result) => {
      if (error) {
        res.status(400).json(createResponse(errorMessage))
        return
      }
      res.json(createResponse("success", result))
    })
  } catch (e) {
    res.status(400).json(createResponse(errorMessage))
  }
})

router.delete('/', async (req, res) => {
  try {
    PetModel.deleteMany({})
    res.json(createResponse("success", {}))
  } catch (e) {
    res.status(400).json(createResponse(errorMessage))
  }
})

export default router
