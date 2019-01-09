// Two roles:  serve our manual test html page, and provide a server to handle websocket upgrades
const http = require('http');
const fs = require('fs');

const PORT = 3000;
const server = http.createServer((req, res) => {
   fs.readFile('index.html', (err, data) => {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
      res.end();
   });
}).listen(PORT);

module.exports = server;