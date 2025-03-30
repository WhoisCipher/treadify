import type { Request, Response } from "express"
import { query } from "../../database/query.ts"

const getProductProgress = async (req: Request, res: Response) => {
    if (!req.session.User)
        res.status(401).json({ error: "Unauthorized Access" })

    try {
        const ProductID = req.session.User?.product

        if (!ProductID)
            res.status(400).json({ error: "Product ID is required" })


        const result = await query(
            `SELECT
                p.ProductID,
                p.Name AS ProductName,
                COUNT(f.FeatureID) AS TotalFeatures,
                SUM(CASE WHEN f.Status = 'completed' THEN 1 ELSE 0 END) AS CompletedFeatures,
                (SUM(CASE WHEN f.Status = 'completed' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(f.FeatureID), 0) AS ProgressPercentage
            FROM Products p
            LEFT JOIN Features f ON p.ProductID = f.ProductID
            WHERE p.ProductID = @ProductID
            GROUP BY p.ProductID, p.Name`,
            { ProductID }
        )

        if (!result.length)
            res.status(404).json({ error: "No progress found for this product" })

        res.json({ message: `Progress for product ${ProductID}`, data: result[0] })
    } catch (err: any) {
        console.error(err.message)
        res.status(500).json({ error: err.message })
    }
}

const getFeatureProgress = async (req: Request, res: Response) => {
    if (!req.session.User)
        res.status(401).json({ error: "Unauthorized Access" })

    try {
        const FeatureID = req.session.User?.feature

        if (!FeatureID)
            res.status(400).json({ error: "Feature ID is required" })


        const result = await query(
            `SELECT
                f.FeatureID,
                f.Name AS FeatureName,
                COUNT(g.GoalID) AS TotalGoals,
                SUM(CASE WHEN g.Status = 'completed' THEN 1 ELSE 0 END) AS CompletedGoals,
                (SUM(CASE WHEN g.Status = 'completed' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(g.GoalID), 0)) AS ProgressPercentage
            FROM Features f
            LEFT JOIN Goals g ON f.FeatureID = g.FeatureID
            WHERE f.FeatureID = @FeatureID
            GROUP BY f.FeatureID, f.Name`,
            { FeatureID }
        )

        if (!result.length)
            res.status(404).json({ error: "No progress found for this feature" })


        res.json({ message: `Progress for feature ${FeatureID}`, data: result[0] })
    } catch (error: any) {
        console.error(error.message)
        res.status(500).json({ error: error.message })
    }
}

const getCommitStatus = async (req: Request, res: Response) => {
    if (!req.session.User)
        res.status(401).json({ error: "Unauthorized Access" })

    try {
        const { goalID } = req.params

        if (!goalID)
            res.status(400).json({ error: "Goal ID is required" })


        const result = await query(
            "SELECT Status FROM Commits WHERE CommitID = @goalID",
            { goalID }
        )

        if (!result.length)
            res.status(404).json({ error: "No commit status found for this goal" })

        res.json({ message: `Commit status for goal ${goalID}`, data: result[0] })
    } catch (error: any) {
        console.error(error.message)
        res.status(500).json({ error: error.message })
    }
}

export default {
    getProductProgress,
    getFeatureProgress,
    getCommitStatus
}
