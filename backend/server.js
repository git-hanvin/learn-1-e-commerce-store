// const express = require("express");
import express from "express"; // for const app and func app.listen | this syntax can be use because u use type: module on package.json
import dotenv from "dotenv"; // for running the PORT that connect to .env

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
// console.log(process.env.PORT);

app.listen(PORT, () => {
    console.log("Server is running on http://localhost" + PORT);
});