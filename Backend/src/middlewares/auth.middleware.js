import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";


const authUser = async (req, res, next) => {
    const {token} = req.cookies;

    if(!token) {
        return res.status(401).json({ message: "Unauthorized"})
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.id)

        req.user = user;

        next()

    } catch (err) {
        res.status(401).json({ message: "Unauthorized" })
    }
}

export  {authUser}