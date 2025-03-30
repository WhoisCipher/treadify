import type { Request, Response } from "express"
import { query } from "../../database/query.ts"

const getUserProfile = async (req: Request, res: Response) => {
    try {
        const UserID = req.session.User?.id

        if (!UserID)
            return res.status(400).json({ error: "Username is required" })

        const result = await query(
            `SELECT * FROM users WHERE UserID = @UserID`,
            { UserID }
        )

        if (!result.length)
            return res.status(404).json({ error: "User not found" })

        res.json({ message: `User profile for ${UserID}`, data: result[0] })
    } catch (err: any) {
        console.error(err.message)
        res.status(500).json({ error: err.message })
    }
}

// Update user profile
const updateUserProfile = async (req: Request, res: Response) => {
    try {
        const UserID = req.session.User?.id
        const { Email, ProfileImgPath } = req.body

        if (!UserID || !Email) {
            return res.status(400).json({ error: "Username and email are required" })
        }

        const result = await query(
            `UPDATE Users SET Email = @Email, ProfileImgPath = @ProfileImgPath WHERE UserID = @UserID `,
            { Email, ProfileImgPath }
        )

        res.json({ message: `User profile updated for ${UserID}`, data: result })
    } catch (err: any) {
        console.error(err.message)
        res.status(500).json({ error: err.message })
    }
}

export default {
    getUserProfile,
    updateUserProfile,
}

