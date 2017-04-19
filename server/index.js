const Koa = require('koa');
const Route = require('koa-route');
const fs = require('fs');
const csv = require('csv');
const Stringify = require('streaming-json-stringify');
const { PassThrough } = require('stream');
const JSONStream = require('JSONStream');

const app = new Koa();

app.use(async function (ctx, next) {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

app.use(async function (ctx, next) {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}`);
});

app.use(Route.get(`/api/trips/:stationId`, (ctx, stationId) => {
  stationId = parseInt(stationId);

  const stream = JSONStream.stringify();

  ctx.body = stream;
  ctx.type = 'application/json';

  fs.createReadStream(`./data/grouped-trips-data-2016-q3.json`)
    .pipe(JSONStream.parse(`${stationId}`))
    .pipe(stream);
}))

app.listen(8001);
