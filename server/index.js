const Koa = require('koa');
const Route = require('koa-route');
const fs = require('fs');
const csv = require('csv');
const Stringify = require('streaming-json-stringify');
const { PassThrough } = require('stream');

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

app.use(Route.get('/data/:stationId', (ctx, stationId) => {
  stationId = parseInt(stationId);

  const reader = fs.createReadStream('./data/trips-data-2016-q3.csv');
  const parser = csv.parse({
    auto_parse: true,
    auto_parse_date: true,
    columns: true
  });
  const transformer = csv.transform(record => {
    return record.from_station_id === stationId ? record : null;
  });
  const stream = new PassThrough();

  ctx.body = stream;
  ctx.type = 'text/event-stream';

  ctx.req.on('close', ctx.res.end);
  ctx.req.on('finish', ctx.res.end);
  ctx.req.on('error', ctx.res.end);

  reader.on('data', data => parser.write(data));
  parser.on('readable', () => {
    while (data = parser.read()) {
      transformer.write(data);
    }
  });
  transformer.on('readable', () => {
    while (data = transformer.read()) {
      stream.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  });

  // fs.createReadStream('./data/trips-data-2016-q3.csv')
  //   .pipe(csv.parse({
  //     auto_parse: true,
  //     auto_parse_date: true,
  //     columns: true
  //   }))
  //   .pipe(csv.transform(record => {
  //     return record.from_station_id === stationId ? record : null;
  //     // return record;
  //   }))
  //   .pipe(Stringify())
  //   .pipe(stream);
}));

app.listen(8001);
