import Redis from "ioredis"
import dotenv from "dotenv" 

dotenv.config();

// redis is key-value store 
export const redis = new Redis(process.env.UPSTASH_REDIS_URL);