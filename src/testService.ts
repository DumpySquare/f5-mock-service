/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict';

import https from 'https';
import fs from 'fs';

import Koa from 'koa';
import koaBody from 'koa-body';
import logger from 'koa-logger';
import json from 'koa-json';

import Logger from 'f5-conx-core/dist/logger';

import { baseRoutes } from './routes/baseRoutes';
import { tmosRoutes } from './routes/tmosRoutes';
import { as3Routes } from './routes/as3Routes';

const port = 8843;
const appName = 'F5-CONX-CORE-MOCKING-SERVICE'
const app = new Koa();

export const log = new Logger(appName);

// middlewares
app.use(
    json({
        pretty: false,
        param: 'pretty'
    })
);

// inject logger and body parser into app
app.use(logger());
app.use(koaBody());

// add routes
app.use(baseRoutes);
app.use(tmosRoutes);
app.use(as3Routes);

// Generic error handling middleware.
app.use(async (ctx: Koa.Context, next: () => Promise<any>) => {
    try {
        await next();
    } catch (error: any) {
        ctx.status = error.statusCode || error.status;
        error.status = ctx.status;
        ctx.body = { error };
        ctx.app.emit('error', error, ctx);
    }
});


// SSL options
const options = {
    key: fs.readFileSync('src/certs/f5MockService.key'),
    cert: fs.readFileSync('src/certs/f5MockService.crt')
  }


// Application error logging.
app.on('error', err => console.error('koa-err: ', err));

// export const testServer = app.listen(port, () => {
//     log.info(`started ${appName} service on: ${port}`)
// })

export const testServer = https.createServer(options, app.callback()).listen(port, () => {
        log.info(`started ${appName} service on: ${port}`)
})