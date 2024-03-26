

// server.js
const express = require("express");
const multer = require("multer");
const path = require("node:path");
const app = express();
const PORT = 8080;

// Configuring multer storage like filename
// destination path for files
const storageConfig = multer.diskStorage({
    destination: path.join(__dirname, "../photos"),
    filename: (req, file, res) => {
    res(null, file.originalname);
  },
});

// Creating a Multer Instance
const upload = multer({
    storage: storageConfig
});

// A Simple Middleware to add CORS functionality
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});

// Upload functinality using POST method
// to support multiple file uploads using the upload.array()
// from multer object
app.post("/upload", upload.array("file"), (req, res) => {
    if (!req.files) {
        res
            .status(413)
            .send("File not uploaded!, Please attach jpeg file under 5 MB");
        return;
    }
    res.status(201).send({ msg: "Files uploaded successfully" });
});

app.listen(8080, function () {
    console.log(`server is started and listening at port: ${PORT}`);
});
