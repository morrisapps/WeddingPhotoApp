// https-json-server.js
const jsonServer = require('json-server')
const https = require('https')
const http = require('http')
const path = require('path')
const fs = require('fs')
const cors = require('cors');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));

const keyFile = path.join(__dirname, 'cert.key');
const certFile = path.join(__dirname, 'cert.cer');

server.use(cors());
server.use(router);
server.use(jsonServer.defaults())

https
  .createServer(
    {
      key: fs.readFileSync(keyFile),
      cert: fs.readFileSync(certFile),
    },
    server
  )
  .listen(3000, () => {
    console.log(
      'Started https://localhost:3000/'
    );
  });
