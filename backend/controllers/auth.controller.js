import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateToken = (userId) => {
    const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"});

    const refreshToken = jwt.sign({userId}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "7d"});

    return { accessToken, refreshToken }
};

const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refresh_token:${userId}`, refreshToken,"EX",7*24*60*60); // 7 days
}

const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true, // prevent XSS attacks, cross-site scripting attack
        secure: process.env.NODE_ENV === "production",
        sameSite: "none", // prevent CSRF attacks, cross-site request forgery
        maxAge: 15 * 60 * 1000 // 15 minutes
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true, // prevent XSS attacks, cross-site scripting attack
        secure: process.env.NODE_ENV === "production",
        sameSite: "none", // prevent CSRF attacks, cross-site request forgery
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
}

// SIGN IN FUNCTION
export const signup = async (req, res) =>{
    // desktop app => postman
    const { email,password,name } = req.body
    // this func is checking if theres a user with the same email or not, if not it will create a new user
    try {
        const userExists = await User.findOne({ email });

        if(userExists) {
            return res.status(400).json({message: "User already exists"});
        }
        const user = await User.create({name,email,password})

        // authenticate user
        const { accessToken, refreshToken } = generateToken(user._id);
        await storeRefreshToken(user._id, refreshToken);

        setCookies(res, accessToken, refreshToken);

        res.status(201).json({ 
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({message: error.message});
    }
    // res.send("Sign up route called"); // only for testing
};

export const login = async (req, res) =>{
    try {
        const {email,password} = req.body
        const user = await User.findOne({email});

        if (user && (await user.comparePassword(password))) {
            const { accessToken, refreshToken } = generateToken(user._id);

            await storeRefreshToken(user._id, refreshToken);
            setCookies(res, accessToken, refreshToken);

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            return res.status(401).json({message: "Invalid email or password"});
        }
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({message: error.message});
    }
    
    
    
    
    // res.send("login route called");
};

// LOGOUT FUNCTION
// the explain of code = if the user want to logout we get the refresh token from cookie and delete it from redis
export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken; // we need to add middleware to get refresh token from cookie (on file server.js)
        console.log("refreshToken from cookies:", refreshToken); // Log the refresh token
        
        if(refreshToken){
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET); // Verification should now match with generation
            // console.log("Decoded token:", decoded); // Log the decoded token
            await redis.del(`refresh_token:${decoded.userId}`);
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Error in logout controller", error.message);
        res.status(500).json({message: "Server error", error: error.message});
    }
    // res.send("logout route called");
};