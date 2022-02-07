/* eslint-disable @typescript-eslint/no-unused-vars */
'use strict';

import Router from 'koa-router';
import {
    AdcDeclaration,
    As3TaskType,
    atcMetaData,
    getRandomUUID, isArray
} from 'f5-conx-core';
import { log } from '../testService';
import deepmerge from 'deepmerge';


const router = new Router();

export const decs: AdcDeclaration[] = [];
export const tasks: As3TaskType = {
    items: []
};

/**
 * AS3 INFO
 * 
 * GET /mgmt/shared/appsvcs/info
 * 
 */
router.get(atcMetaData.as3.endPoints.info, async (ctx, next) => {
    ctx.response.body = {
        "version": "3.22.0",
        "message": "with this test mock framework, as3 version/schema does not matter",
        "release": "2",
        "schemaCurrent": "3.22.0",
        "schemaMinimum": "3.0.0"
    };
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

    const taskIndex = tasks.items.findIndex(task => task.id === id)

    log.info(`as3 get task ${id} => index=${taskIndex}`)

    ctx.response.body = tasks[taskIndex];
    await next();
})


/**
 * GET AS3 DECLARE
 * 
 * GET /mgmt/shared/appsvcs/declare
 */
router.get(atcMetaData.as3.endPoints.declare, async (ctx, next) => {
    ctx.response.body = decs;
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

    // 1. generate task ID
    const id = getRandomUUID(16)

    // 2. get as3 async parameter
    //      POST /mgmt/shared/appsvcs/declare?async=true
    const async = ctx.request.query.async === 'true' ? true : false;
    log.info(`as3 post async => ${async}`)

    // 3. build task details
    const task = {
        id,
        results: [{
            message: 'in progress'
        }],
        declaration: undefined
    }

    // capture incoming POST body/declaration
    const inboundDecs = ctx.request.body;


    // assign the task details to the response
    ctx.response.body = task


    // 3. validate incoming declarations
    //      if error => update task(async)/respond(sync)
    // 4. if valid -> merge incoming declarations with running config
    //      sync-sucess/fail -> respond
    //      async-success/fail -> update tast with status

    if (isArray(inboundDecs)) {
        // decs.push(...inboundDecs);
        // this should only come from bigiq?
        log.info(`as3 post body is array, Is this from bigiq?`)

    } else {

        log.info(`as3 post body NOT array typical as3 post?`)

        // decs.push(inboundDecs)
        // declaration we received is a single object
        // if it has a target, then it's bigiq, if no target, just merge the entire object as one giant as3 dec
        if (inboundDecs.target) {

            log.info(`as3 post body => TARGET PARAM DETECTED`)

            // look for target declaration, this should only happne when building a bigiq with an existing target
            decs.map(eDec => {

                if (eDec.target === inboundDecs.target) {

                    deepmerge(eDec, inboundDecs, { clone: false })
                    // since we successfully saved the declaration, like it got deployed, apply it to the post response
                    ctx.response.body.declaration = inboundDecs

                    log.info(`as3 post => existing target found => merging declarations`)

                } else {

                    log.info(`as3 post => existing target NOT found => adding full declaration/target to storage`)

                }
            })
        } else {

            log.info(`as3 post => Object, no target detected, merging declaration with exising`)

            // no target, merge with single dec
            decs[0] = deepmerge(decs[0], inboundDecs, { clone: false })

            // update task status for sync post response
            // mgmtClient.followAsync function will break when as3 status is no longer 'in progress'
            if (async === false) {
                task.results[0].message = 'COMPLETE'
            }

            // saved the declaration to tasks
            task.declaration = inboundDecs


            // return the response
            ctx.response.body = task

        }
    }

    // continue flow
    await next();

    if (async === true) {
        // update results after response has been returned
        task.results[0].message = 'COMPLETE'
    }

    // save the task
    tasks.items.unshift(task)

    debugger;
})

export const as3Routes = router.routes();