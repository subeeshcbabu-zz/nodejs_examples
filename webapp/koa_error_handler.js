const Koa = require('koa');
const Fs = require('fs');
const App = new Koa();

//ERROR Handler. Define this middleware first
//This catches all the sync errors 
App.use(async function(ctx, next) {
    try {
        //All the following middleware executions are bound to a try/catch block
        await next();
    } catch(error) {
        ctx.status = error.status || 500;
        ctx.app.emit('error', error, ctx);
    }
});

// x-response-time
App.use(async function (ctx, next) {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

// logger
App.use(async function (ctx, next) {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}`);
});

App.use(async (ctx, next) => {
    function readFile() {
        return new Promise((resolve, reject) => {
            //This will throw an error because this tries to read
            // a file that does not exist.
            Fs.stat('/tmp/world', (err, stats) => {
              if (err) {
                reject(err);
                return;
              }
              resolve(stats);
            });
        });
    };
    let fileStats = await readFile();
    await next();
});

// response
App.use(ctx => {
  ctx.body = 'Hello World';
});

App.listen(8000, () => {
    console.log("started app on " + 8000);
});
