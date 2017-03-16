/**
 * Copyright Node.js Website WG contributors. All rights reserved.
 */
// Code examples are from - https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/

const fs = require('fs');
const path = require('path');


//Example 1: Call timeout and immediate at a main cycle. Not part of any I/O Callback.
// nextTick will always be the first
// The order of execution of the `timeout` and `immediate` depends of the system. Its not not possible to conclusively define the order here.
console.log("Example 1:");
setTimeout(() => {
    console.log('timeout');
}, 0);

setImmediate(() => {
    console.log('immediate');
});

process.nextTick(() => {
    console.log('nextTick');
});

//Example 2: Call timeout and immediate as part of an I/O callback
// nextTick will always be the first
//For the below example, the `setImmediate` always get executed first when compared to `setTimeout`.
fs.readFile(path.resolve(__dirname, '..', 'package.json'), () => {
    console.log(' ');
    console.log("Example 2:");
    setTimeout(() => {
        console.log('timeout');
    }, 0);

    setImmediate(() => {
        console.log('immediate');
    });

    process.nextTick(() => {
        console.log('nextTick');
    });
});
