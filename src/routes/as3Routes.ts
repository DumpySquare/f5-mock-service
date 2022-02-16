/* eslint-disable @typescript-eslint/no-unused-vars */
'use strict';

import Router from 'koa-router';
import {
    As3TaskItemType,
    As3TaskType,
    atcMetaData,
} from 'f5-conx-core';
import { log } from '../testService';

import { As3Server } from '../as3Server';

export const as3Server = new As3Server(log);


const router = new Router();

// export const decs: AdcDeclaration[] = [];
// export const tasks: As3TaskType = {
//     items: []
// };

/**
 * AS3 INFO
 * 
 * GET /mgmt/shared/appsvcs/info
 * 
 */
router.get(atcMetaData.as3.endPoints.info, async (ctx, next) => {
    ctx.response.body = as3Server.info
    await next();
})


/**
 * AS3 TASKS
 * 
 * GET /mgmt/shared/appsvcs/task/<task-ID>
 * 
 */
router.get(`${atcMetaData.as3.endPoints.tasks}/:id`, async (ctx, next) => {

    // get the task ID
    const id = ctx.params.id;

    // get task details
    const task = as3Server.getTask(id)

    // assing task details to response body
    ctx.response.body = task;

    // set rest response status code to task status code
    if(task?.results) {

    }
    ctx.response.status = task.results[0].code

    await next();
})


/**
 * GET AS3 DECLARE
 * 
 * GET /mgmt/shared/appsvcs/declare
 */
router.get(`${atcMetaData.as3.endPoints.declare}/:tenant`, async (ctx, next) => {

    // get the task ID
    const tenant = ctx.params.tenant;

    // return declaration(s)
    ctx.response.body = as3Server.getDec(tenant);

    await next();
})


/**
 * 
 * POST AS3 DECLARE
 * 
 * POST /mgmt/shared/appsvcs/declare
 * 
 */
router.post(atcMetaData.as3.endPoints.declare, async (ctx, next) => {

    // get as3 async parameter
    //      POST /mgmt/shared/appsvcs/declare?async=true
    const async = ctx.request.query.async === 'true' ? true : false;
    log.info(`as3 post async => ${async}`)


    // capture incoming POST body/declaration
    // is it 'AS3' class or 'ADC' class?
    const dec = ctx.request.body.class === 'AS3' ? ctx.request.body.declaration : ctx.request.body;

    // process declaration
    const resp = await as3Server.addDec(dec, async)

    ctx.response.body = resp;

    // continue flow and respond to client
    await next();

})

export const as3Routes = router.routes();