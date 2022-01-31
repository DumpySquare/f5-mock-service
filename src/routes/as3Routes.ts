/* eslint-disable @typescript-eslint/no-unused-vars */
'use strict';

import Router from 'koa-router';
import { 
    AdcDeclaration,
    atcMetaData,
    getRandomUUID, isArray } from 'f5-conx-core';
import { log } from '../testService';
import deepmerge from 'deepmerge';


const router = new Router();

export const decs: AdcDeclaration[] = [];
export const tasks: {
    id: string;
    results: [{
        message: string;
    }]
}[] = []

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

router.get(atcMetaData.as3.endPoints.declare, async (ctx, next) => {
    ctx.response.body = decs;
    await next();
})

router.post(atcMetaData.as3.endPoints.declare, async (ctx, next) => {

    // 1. generate task ID
    const id = getRandomUUID(16)

    // 2. get as3 async parameter
    const async = ctx.request.query.async === 'true' ? true : false;

    // 3. build task details
    const task = {
        id,
        results: [{
            message: 'in progress'
        }]
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
    } else {
        // decs.push(inboundDecs)
        // declaration we received is a single object
        // if it has a target, then it's bigiq, if no target, just merge the entire object as one giant as3 dec
        if(inboundDecs.target) {
            // look for target declaration, this should only happne when building a bigiq with an existing target
            decs.map( eDec => {
                if(eDec.target === inboundDecs.target) {
                    deepmerge(eDec, inboundDecs, { clone: false })
                    // since we successfully saved the declaration, like it got deployed, apply it to the post response
                    ctx.response.body.declaration = inboundDecs
                } else  {
                    
                }
            })
        } else {
            // no target, merge with single dec
            deepmerge(decs[0], inboundDecs, { clone: false })
            // since we successfully saved the declaration, like it got deployed, apply it to the post response
            ctx.response.body.declaration = inboundDecs
        }
    }



    await next();
})






export const as3Routes = router.routes();