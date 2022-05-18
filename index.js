import express from 'express'
import 'dotenv/config'
import mongoose from 'mongoose'
import authRoute from "./src/routes/authRoute.js";
import postRoute from "./src/routes/postRoute.js";

// await connectDb()

const app = express()
app.use(express.json())

app.use("/api/auth", authRoute)
app.use("/api/post", postRoute)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`[${process.env.DB_USERNAME}]: Server start at port ${PORT}`)
})

async function connectDb() {
    try {
        const dbUserName = process.env.DB_USERNAME
        const dbPwd = process.env.DB_PWD
        await mongoose.connect(`mongodb+srv://${dbUserName}:${dbPwd}@learn-mern.aaq5u.mongodb.net/learn-mern?retryWrites=true&w=majority`)
        console.log("Connected to database")
    } catch (e) {
        console.log("Cannot connect to database, exit")
        process.exit(1)
    }
}
