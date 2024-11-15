import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// first we called protect function
export const protectRoute = async(req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;

        if(!accessToken) {
            return res.status(401).json({ message: "Unauthorized - No access token provided" });
        }

            try {
                const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
                const user = await User.findById(decoded.userId).select ("-password");

            if(!user) {
                return res.status(401).json({ message: "User not found" });
            }

            req.user = user;

            next();
            } catch (error) {
                if(error.name === "TokenExpiredError") {
                    return res.status(401).json({ message: "Access token expired" });
                }
                throw error;
            }

    } catch (error) {
        console.log("Error in protectRoute middleware", error.message);
        return res.status(401).json({ message: "Unauthorized - Invalid access token" });
    }
};

// after the func next() | we need to check if the user is an admin or not | if its admin we next() to getAllProducts
export const adminRoute = (req, res, next) => {
    console.log("User in adminRoute:", req.user);
    console.log("User role:", req.user ? req.user.role : "No user role found");
    if(req.user && req.user.role === "admin"){
        next();
    } else {
        return res.status(403).json({ message: "Access denied - Admin only" });
    }
};