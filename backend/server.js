// const express = require("express"); // ini adalah syntax lama
import express from "express"; // for const app and func app.listen | this syntax can be use because u use type: module on package.json
import dotenv from "dotenv"; // for running the PORT that connect to .env

// routes
import authRoutes from "./routes/auth.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
// console.log(process.env.PORT);

// authentification
app.use("/api/auth", authRoutes); // bacanya ketika kita masukan localhost:5000/api/auth, /signup akan pindah kesana (auth.route.js)

app.listen(PORT, () => {
    console.log("Server is running on http://localhost" + PORT);
});