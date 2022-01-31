/* eslint-disable @typescript-eslint/no-unused-vars */
'use strict';

import Router from 'koa-router';
import { deviceInfo, getFakeToken, getRandomInt, getRandomUUID, iControlEndpoints } from 'f5-conx-core';
import { log } from '../testService';


const router = new Router();

router.get(iControlEndpoints.tmosInfo, async (ctx, next) => {
    log.info(`${iControlEndpoints.tmosInfo}`)
    ctx.response.body = deviceInfo
    await next();
})

router.post(iControlEndpoints.login, async (ctx, next) => {
    // log.info("routes", router.stack.map(el => el.path))
    // confirm username/password
    //      optional loginProviderName

    if (ctx.request.body.username && ctx.request.body.password) {
        const name = ctx.request.body.username
        const passwd = ctx.request.body.password
        const provider = ctx.request.body.loginProviderName || 'local'
        const host = ctx.host;

        const token = getRandomUUID(8)
        const timeout = getRandomInt(300, 600);

        ctx.response.body = {
            "username": name,
            "loginReference": {
                "link": `https://${host}/mgmt/cm/system/authn/providers/local/login`
            },
            "loginProviderName": provider,
            "token": {
                "token": token,
                "name": token,
                "userName": name,
                "authProviderName": provider,
                "user": {
                    "link": `https://${host}/mgmt/shared/authz/users/admin`
                },
                "groupReferences": [],
                "timeout": timeout,
                "startTime": "2020-11-07T11:56:23.498-0600",
                "address": `${ctx.ip}`,
                "partition": "[All]",
                "generation": 1,
                "lastUpdateMicros": 1604771783497184,
                "expirationMicros": 1604772983498000,
                "kind": "shared:authz:tokens:authtokenitemstate",
                "selfLink": `https://${host}/mgmt/shared/authz/tokens/${token}`
            },
            "generation": 0,
            "lastUpdateMicros": 0
        }

    } else {

        ctx.response.status = 401
        ctx.response.body = {
            code: 401,
            message: "Authentication failed. Username/Password required"
        }
    }

    await next();
})






export const tmosRoutes = router.routes();