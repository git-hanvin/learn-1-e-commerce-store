// const express = require("express"); // ini adalah syntax lama
import express from "express"; // for const app and func app.listen | this syntax can be use because u use type: module on package.json
import dotenv from "dotenv"; // for running the PORT that connect to .env
import cookieParser from "cookie-parser"; // for auth.controller so we can req the refresh cookie

// routes
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";

// database
import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
// console.log(process.env.PORT);

app.use(express.json()); // this allows you to parse body of the request (POSTMAN)
app.use(cookieParser());

// authentification
app.use("/api/auth", authRoutes); // bacanya ketika kita masukan localhost:5000/api/auth, /signup akan pindah kesana (auth.route.js)
app.use("/api/products", productRoutes);

app.listen(PORT, () => {
    console.log("Server is running on http://localhost" + PORT);
    // after success connect to DB
    connectDB();
});