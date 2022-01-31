'use strict';

import Router from 'koa-router';
import { log } from '../testService';
// import { socket } from './serverSocket';
// import { timer } from './timer';

const router = new Router();

router.get('/', async (ctx, next) => {
    log.info("routes", router.stack.map(el => el.path))
})


router.get('/status', async (ctx, next) => {
    log.info('status called')
    // ctx.body = `${JSON.stringify(ctx.body)}\n`
    // ctx.body = ctx.body
    await next();
})


router.get('/logs', async (ctx, next) => {
    ctx.body = log.journal;
    await next();
})
router.get('/logs/text', async (ctx, next) => {
    ctx.body = [
        log.journal.join('\n'),
        '\n'
    ].join();
    await next();
})


export const baseRoutes = router.routes();