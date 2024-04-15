

// server.js
const express = require("express");
const multer = require("multer");
const path = require("node:path");
const app = express();
const PORT = 8080;


const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) { // check if file is a image
    cb(null, true) // return callback if it is an image
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false) // throw error if it is not an image
  }
}

// Configuring multer storage like filename
// destination path for files
const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "../photos/"+req.body.subfolder))
    },
    filename: (req, file, res) => {
    res(null, file.originalname);
  },
});

// Creating a Multer Instance
const upload = multer({
    storage: storageConfig,
    fileFilter: multerFilter
});

// A Simple Middleware to add CORS functionality
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', '*');
    next();
});

// Upload functinality using POST method
// to support multiple file uploads using the upload.array()
// from multer object
app.post("/upload", upload.single('file'), (req, res) => {

  try {
    if (req.file == undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    }
    if (!req.file) {
      res
          .status(413)
          .send("File not uploaded!, Please attach jpeg file under 5 MB");
      return;
  }
    res.status(200).send({
      message: "Uploaded the file successfully: " + req.file.originalname,
    });
  } catch (err) {
    res.status(500).send({
      message: `Could not upload the file: ${req.file.originalname}. ${err}`,
    });
  }
});

app.listen(8080, function () {
    console.log(`server is started and listening at port: ${PORT}`);
});
