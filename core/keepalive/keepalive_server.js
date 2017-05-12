// Copyright Joyent, Inc. and other Node contributors.

const http = require('http');

const server = http.createServer(function(req, res) {
  if (req.url === '/error') {
    res.destroy();
    return;
  } else if (req.url === '/remote_close') {
      // cache the socket, close it after a short delay
    const socket = res.connection;
    setImmediate(function() {
      socket.end();
    });
  }
  res.end('Hi from Keep alive server');
});

server.listen(9000, () => {
    console.log("started Keep alive server on " + 9000);
});
