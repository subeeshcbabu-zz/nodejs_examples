const express = require('express');
const domain = require('domain');
const fs = require('fs');
const App = express();

App.use((req, res, next) => {
    const d = domain.create();
    d.add(req);
    d.add(res);
    d.run(function () {
        next();
    });
    /**
     * error handling with context
     */
    d.on('error', error => {
        console.error('DOMAIN error ', error.stack ? error.stack : error);
        /**
         * Graceful shutdown goes in here
         */
        /*
         * Below code is from Node.js Domain API docs
         * https://nodejs.org/dist/latest-v6.x/docs/api/domain.html
         */
        // make sure we close down within 30 seconds
        var killtimer = setTimeout(() => {
          process.exit(1);
        }, 30000);
        // But don't keep the process open just for that!
        killtimer.unref();
        // stop taking new requests.
        server.close();
        //Pass the error to any error handler middlewares.
        next(error);
    });
});

App.use('/error', (req, res, next) => {
    fs.stat('/tmp/world', (err, stats) => {
        throw err;
    });

    res.status(200).send('Error page');
});

App.use('/', (req, res, next) => {
    res.status(200).send('Hi from a Node.js express app');
});

/**
 * The uncaughtException handler will not be executed if the error
 * is already caught by domain `error` handler.
 */
process.on('uncaughtException', (error) => {
    console.error('UNCAUGHT error ', error.stack ? error.stack : error);
});

App.listen(8000, () => {
    console.log("started app on " + 8000);
});
