import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateToken = (userId) => {
    const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"});

    const refreshToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "7d"});

    return { accessToken, refreshToken }
};

const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refresh_token:${userId}`, refreshToken,"EX",7*24*60*60); // 7 days
}

export const signup = async (req, res) =>{
    // desktop app => postman
    const { email,password,name } = req.body
    try {
        const userExists = await User.findOne({ email });

        // if users exists
        if(userExists) {
            return res.status(400).json({message: "User already exists"});
        }
        const user = await User.create({name,email,password})

        // authenticate user
        const { accessToken, refreshToken } = generateToken(user._id);
        await storeRefreshToken(user._id, refreshToken);

        res.status(201).json({user, message: "User created successfully"});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
    // res.send("Sign up route called"); // only for testing
};

export const login = async (req, res) =>{
    res.send("login route called");
};

export const logout = async (req, res) =>{
    res.send("logout route called");
};