'use strict';


import deepmerge from 'deepmerge';

import {
    AdcDeclaration,
    As3Info,
    as3InfoApiReponse,
    As3TaskItemType,
    As3TaskType,
    getRandomUUID,
    isArray
} from 'f5-conx-core';
import Logger from 'f5-conx-core/dist/logger';

import { declarationValidator } from './declarationValidator';

// import { log } from './testService'

export class As3Server {

    log: Logger;
    decs: AdcDeclaration[] = [];
    tasks: As3TaskType = {
        items: []
    };

    info: As3Info = as3InfoApiReponse

    constructor(logger: Logger) {
        // ...
        this.log = logger;
    }


    getTask(id: string): any {

        if(!id) {
            
            this.log.info(`as3 get task no task id => returning all tasks`)
            return this.tasks;

        } else {

            // find task index
            const taskIndex = this.tasks.items.findIndex(task => task.id === id)
    
            this.log.info(`as3 get task ${id} => index=${taskIndex}`)
    
            // use index to return specific task
            return this.tasks.items[taskIndex]

        }

    }

    getDec(tenant?: string): AdcDeclaration | AdcDeclaration[] {

        if (tenant) {

            // lookup and retur tenant declaration

        } else {

            // return single bigip dec or list of bigiq decs
            if (this.decs.length === 1) {
                // bigip should have a single declaration with all tenants
                return this.decs[0];
            } else {
                // bigiq should have a list of declarations, one for each target
                return this.decs;
            }
        }
    }

    /**
     * take posted 'ADC' class declaration, validate it and add it to storage -> respond with appropriate sync/async task details
     * 
     * @param dec ADC class as3 declaration
     * @param async process async or no?
     * @returns 
     */
    async addDec(dec: AdcDeclaration, async: boolean,): Promise<As3TaskItemType> {

        // 1. generate task ID
        const id = getRandomUUID(16)

        // 2. build task details
        // for now, we assume everything is async post
        // For async operations, and to not have to build a service worker, we will manage two different task responses.  The response task for the async response (responseTask), then the final post task response for the client follow-up(async) request (task)
        const asyncTaskResponse: As3TaskItemType = {
            id,
            results: [{
                code: 202,
                message: 'in progress'
            }],
            declaration: {}
        }

        // main task to get saved in tasks array
        const task: As3TaskItemType = {
            id,
            results: [{
                code: 202,
                message: 'in progress'
            }],
            declaration: undefined
        }


        // 3. validate incoming declaration
        const validDec = await declarationValidator(dec);

        if (!validDec) {



            if (async) {

                // respond with synthetic details for async
                // ctx.response.status = 202
                // ctx.response.body = {
                //     id,
                //     results: [{ message: 'in progress' }]
                // }
                // validation failed, so set appropriate details about the response task


                // set the end task results
                task.results[0].message = 'declaration is invalid'
                task.results[0].code = 422
                task.results[0].errors = ['some errors about invalid declaration']

            } else {

                // sync response, so return failed task details
                asyncTaskResponse.results[0].errors = ['f5-mock-service does not fully support syncronous as3 post yet!']
                // ctx.response.status = 200
                // ctx.response.body = task
            }
        } else {

            // 4. if valid -> merge incoming declarations with running config
            //      sync-sucess/fail -> respond
            //      async-success/fail -> update tast with status

            // declaration is valid, so attach to task
            task.declaration = dec

            if (isArray(dec)) {
                // decs.push(...inboundDecs);
                // this should only come from bigiq?
                this.log.info(`as3 post body is array, Is this from bigiq?`)

            } else {

                this.log.info(`as3 post body NOT array typical as3 post?`)

                // decs.push(inboundDecs)
                // declaration we received is a single object
                // if it has a target, then it's bigiq, if no target, just merge the entire object as one giant as3 dec
                if (dec?.target) {

                    this.log.info(`as3 post body => TARGET PARAM DETECTED`)

                    // look for target declaration, this should only happne when building a bigiq with an existing target
                    this.decs.map(eDec => {

                        if (eDec.target === dec.target) {

                            deepmerge(eDec, dec, { clone: false })
                            // since we successfully saved the declaration, like it got deployed, apply it to the post response
                            // ctx.response.body.declaration = dec

                            this.log.info(`as3 post => existing target found => merging declarations`)

                        } else {

                            this.log.info(`as3 post => existing target NOT found => adding full declaration/target to storage`)

                        }
                    })
                } else {

                    this.log.info(`as3 post => Object, no target detected, merging declaration with exising`)

                    // no target, merge with single dec
                    this.decs[0] = deepmerge(this.decs[0], dec, { clone: false })

                    // update task status for sync post response
                    // mgmtClient.followAsync function will break when as3 status is no longer 'in progress'
                    task.results[0].message = 'COMPLETE'
                    task.results[0].code = 200
                    task.declaration = dec

                }
            }
        }

        // save the task
        this.tasks.items.unshift(task)

        // return the response
        if (async) {
            return asyncTaskResponse;
        } else {
            return task;
        }

    }
}