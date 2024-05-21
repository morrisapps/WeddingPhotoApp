

// server.js
const express = require("express");
const multer = require("multer");
const path = require("node:path");
const app = express();
const sharp = require('sharp')
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
      cb(null, path.join(__dirname, "../photos/full"))
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

const router = new express.Router
app.use(router)

router.get('/', (req, res) => {
    res.send('ok')
})
router.post('/upload',upload.single('file') ,async (req, res) => {
   const { filename: image } = req.file

   await sharp(req.file.path)
    .resize(500)
    .jpeg({quality: 50})
    .toFile(
        path.resolve(__dirname, "../photos/",'thumbs',image)
    )
    res.status(200).json("Uploaded Successfully");
})

app.listen(8080, function () {
    console.log(`server is started and listening at port: ${PORT}`);
});
