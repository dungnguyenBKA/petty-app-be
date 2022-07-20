import express from 'express'
import 'dotenv/config'
import mongoose from 'mongoose'
import authRoute from "./src/routes/authRoute.js";
import postRoute from "./src/routes/petRoute.js";
import Pusher from "pusher";
import chatRoute from "./src/routes/chatRoute.js";
import * as bodyParser from "express";

await connectDb()

const app = express()
app.use(express.json())

// route
app.use("/api/v1/auth", authRoute)
app.use("/api/v1/pets", postRoute)
app.use("/api/v1/chat", chatRoute)
app.use(bodyParser.urlencoded({
    extended: true
}));

export const AppPusher = new Pusher({
    appId: "1428876",
    key: "e9552b7412e7557ff7ef",
    secret: "e524302f3c596c748a1b",
    cluster: "ap1",
    useTLS: true
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`[${process.env.DB_USERNAME}]: Server start at port ${PORT}`)
})

async function connectDb() {
    try {
        const dbUserName = process.env.DB_USERNAME
        const dbPwd = process.env.DB_PWD
        console.log("Connecting to database")
        await mongoose.connect(`mongodb+srv://${dbUserName}:${dbPwd}@learn-mern.aaq5u.mongodb.net/learn-mern?retryWrites=true&w=majority`)
        console.log("Connected to database")
    } catch (e) {
        console.log("Cannot connect to database, exit")
        process.exit(1)
    }
}
