const http = require('http');
const util = require('util');
const servicename = 'localhost:9000:';
const keepAliveAgent = new http.Agent({
    keepAlive: true,
    keepAliveMsecs: 1000,
    maxSockets: 5,
    maxFreeSockets: 5
});

keepAliveAgent.on('free', (socket) => {
    console.log('FREE: agent socket freed');
    if (socket._startTimer) {
        let aliveTime = process.hrtime(socket._startTimer);
        aliveTime = Math.round((aliveTime[0] * 1e9 + aliveTime[1]) / 1e6)
        console.log("Socket has been alive for time = ", aliveTime);
        if (aliveTime > 50000) {
            console.log("Socket destroyed after alive time = ", aliveTime);
            socket.destroy();
            return;
        }
    }

    //Destroy the Socket if its been used more than 5 times
    if (socket._counter > 5) {
        console.log("Socket destroyed after usage count = ", socket._counter);
        socket.destroy();
    }

});

const options = {
  hostname: 'localhost',
  port: 9000,
  path: '/',
  method: 'GET',
  agent: keepAliveAgent
};



const requester = (i, path) => {
    console.log(' ');
    console.log(`Request ${i}`);
    console.log('\n---> Before Request');
    if (keepAliveAgent.freeSockets[servicename]) {
        console.log(`freeSockets : ${keepAliveAgent.freeSockets[servicename].length}`);
    }
    if (keepAliveAgent.sockets[servicename]) {
        console.log(`sockets : ${(keepAliveAgent.sockets[servicename].length)}`);
    }
    console.log('<--- Before Request\n');
    console.log('REQUEST: send request : path = ', path);
    const req = http.request(Object.assign(options, {
        path: path ? path : '/'
    }), (res) => {
      console.log(`STATUS: ${res.statusCode}`);
      console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        //console.log('DATA: Data chunk');
      });
      res.on('end', () => {
        console.log('END: No more data in response.');
        console.log('\n---> response end');
        if (keepAliveAgent.freeSockets[servicename]) {
            console.log(`freeSockets : ${keepAliveAgent.freeSockets[servicename].length}`);
        }
        if (keepAliveAgent.requests[servicename]) {
            console.log(`requests : ${keepAliveAgent.requests[servicename].length}`);
        }
        if (keepAliveAgent.sockets[servicename]) {
            console.log(`sockets : ${(keepAliveAgent.sockets[servicename].length)}`);
        }
        console.log('<--- response end\n');

        process.nextTick(() => {
            console.log('\n---> next tick');
            if (keepAliveAgent.freeSockets[servicename]) {
                console.log(`freeSockets : ${keepAliveAgent.freeSockets[servicename].length}`);
            }
            if (keepAliveAgent.sockets[servicename]) {
                console.log(`sockets : ${(keepAliveAgent.sockets[servicename].length)}`);
            }
            console.log('<--- next tick\n');
        });
      });
    });

    req.once('socket', (socket) => {
        if (socket._counter === undefined) {
            socket._counter = 0;
        }
        if (socket._startTimer === undefined) {
            socket._startTimer = process.hrtime();
        }
        socket._counter++;
        console.log('SOCKET: Socket allocated', ' Counter = ', socket._counter);

        socket.once('lookup', () => {
            console.log('LOOKUP: lookup done');
        });

        socket.once('connect', () => {
            if (socket._connectcounter === undefined) {
                socket._connectcounter = 0;
            }
            socket._connectcounter++;
            console.log('CONNECT: tcp connect done', ' Connect Count = ', socket._connectcounter);
        });

        socket.once('free', (socket) => {
            console.log('FREE: socket freed');
        });
    });

    req.on('error', (e) => {
      console.error(`ERROR: problem with request: ${e.message}`);
    });

    req.end();
};

module.exports = requester;
