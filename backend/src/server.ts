import express from "express"
import session from "express-session"
import https from "https"
import fs from "fs"
import dotenv from "dotenv"

import { Handlers } from "./handlers/HandlerPackage"

declare module "express-session" {
    interface SessionData {
        User: {
            id: number
            username: string
            email: string
        }
    }
}
const app = express()
const port = 3000

dotenv.config()

const keypath: string | undefined = process.env.KEY_PEM
const certpath: string | undefined = process.env.CERT_PEM
const secret: string | undefined = process.env.SECRET

if (!keypath || !certpath || !secret) {
    console.error("Missing Environment Variables.");
    process.exit(1);
}

const options = {
    key: fs.readFileSync(keypath),
    cert: fs.readFileSync(certpath)
}

app.use(express.json())
app.use(
    session({
        secret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 12, //valid for 12 hours
        },
    })
)

app.post("/signup", Handlers.signup)
app.post("/login", Handlers.login)

https.createServer(options, app).listen(port, () => {
    console.log(`[SERVER] server running at ${port}`)
})
