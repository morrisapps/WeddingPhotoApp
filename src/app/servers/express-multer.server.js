

// server.js
const express = require("express");
const multer = require("multer");
const path = require("node:path");
const app = express();
const sharp = require('sharp')
const fs = require("fs");
const cors = require('cors');
const https = require('https')


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
      cb(null, path.join(__dirname, "../../../photos/full"))
    },
    filename: (req, file, res) => {
    res(null, file.originalname);
  },
});

// Creating a Multer Instance
const file = multer({
    storage: storageConfig,
    fileFilter: multerFilter
});

// A Simple Middleware to add CORS functionality
app.use(cors());

const router = new express.Router
app.use(router)

router.get('/', (req, res) => {
    res.send('ok')
})

// Returns a salted hard coded password for the purpose of being decrypted to match user given pass.
router.get('/admin', (req, res) => {
  res.status(200).json("LgtkQm2GpwFG2evJjc1IGw==");
})

router.post('/upload', file.single('file') ,async (req, res) => {
   const { filename: image } = req.file

   await sharp(req.file.path)
    .resize(500)
    .jpeg({quality: 50})
    .toFile(
        path.resolve(__dirname, "../../../photos/",'thumbs',image)
    )
    res.status(200).json("Uploaded Successfully");
})


const remove = (req, res) => {
  const fileName = req.params.name;
  const directoryFullPath = path.join(__dirname, "../../../photos/full/" + fileName + ".jpg");
  const directoryThumbsPath = path.join(__dirname, "../../../photos/thumbs/" + fileName + ".jpg");
  const directoryRemovedFullPath = path.join(__dirname, "../../../photos/removed/full/" + fileName + ".jpg");
  const directoryRemovedThumbsPath = path.join(__dirname, "../../../photos/removed/thumbs/" + fileName + ".jpg");

  // Remove full image
  fs.rename(directoryFullPath, directoryRemovedFullPath, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not delete the file. " + err,
      });
    } else {
      fs.rename(directoryThumbsPath, directoryRemovedThumbsPath, (err) => {
        if (err) {
          res.status(500).send({
            message: "Could not delete the file. " + err,
          });
        } else {
          res.status(200).send({
            message: "File is deleted.",
          });
        }
      });
    }
  });
};
router.delete("/:name", remove);

// Start server using certificate
const keyFile = path.join(__dirname, 'cert.key');
const certFile = path.join(__dirname, 'cert.cer');
https
  .createServer(
    {
      key: fs.readFileSync(keyFile),
      cert: fs.readFileSync(certFile),
    },
    app
  )
  .listen(8080, () => {
    console.log(
      'Started https://localhost:8080/'
    );
  });

