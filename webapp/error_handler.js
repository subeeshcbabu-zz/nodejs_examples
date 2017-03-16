const express = require('express');

const App = express();

App.use('/error', (req, res, next) => {
    throw new Error('Sync error');
});

App.use('/', (req, res, next) => {
    res.status(200).send('Hi from a Node.js express app');
});

App.use(function (err, req, res, next){
    console.log('Hi from error hanlder 1');
    next(err);
});

App.use(function (err, req, res, next){
    console.log('Hi from error hanlder 2');
    next(err);
});

App.listen(8000, () => {
    console.log("started app on " + 8000);
});
