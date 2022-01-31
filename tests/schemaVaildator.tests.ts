'use strict';



/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as assert from 'assert';
import * as fs from 'fs';
import * as url from 'url';
import * as path from 'path';
import { getLanguageService, JSONSchema, SchemaRequestService, TextDocument, MatchingSchema } from 'vscode-json-languageservice';
import { DiagnosticSeverity, SchemaConfiguration } from 'vscode-json-languageservice';
import axios from 'axios';


// import { as3ExampleDec } from '../src/bigip/as3Models';
import { atcMetaData, as3ExampleDec, injectSchema } from 'f5-conx-core';

// let as3Schema;

import as3Schema from '../as3Schema.json'

const as3SchemaURL = "https://raw.githubusercontent.com/F5Networks/f5-appsvcs-extension/master/schema/latest/as3-schema.json";


// format json document with vscode code:  https://github.com/microsoft/monaco-editor/issues/32


async function validate(dec: unknown, schema: string) {

    // stringify and format the json declaration into lines
    const decString = JSON.stringify(dec, undefined, 4)

    // create test document with declaration
    const textDocument = TextDocument.create('f5://server/f5.data.json', 'json', 1, decString);

    const jsonLanguageService = getLanguageService({
        schemaRequestService: (uri) => {
            if (uri === "f5://server/f5.schema.json") {
                return Promise.resolve(schema);
            }
            return Promise.reject(`Unabled to load schema at ${uri}`);
        }
    });
    // associate `*.data.json` with the `foo://server/f5.schema.json` schema
    jsonLanguageService.configure({ allowComments: false, schemas: [{ fileMatch: ["*.data.json"], uri: "f5://server/f5.schema.json" }] });

    const jsonDocument = jsonLanguageService.parseJSONDocument(textDocument);

    const diagnostics = await jsonLanguageService.doValidation(textDocument, jsonDocument);
    console.log('Validation results:', diagnostics.map(d => `[line ${d.range.start.line}] ${d.message}`));

    return diagnostics;
}

describe('JSON Schema', function () {

    this.beforeEach( function () {
        delete as3['$schema']
    })

    it('good as3 dec', async function () {
        // delete as3['$schema']
        const results = await validate(as3, JSON.stringify(as3Schema, undefined, 4))
        assert.ok(results.length === 0)
    });


    it('bad as3 dec', async function () {
        const results = await validate(as3_bad, JSON.stringify(as3Schema, undefined, 4))
        assert.ok(results.length > 0)
    });

    it('good as3 dec w/injected schema reference', async function () {

        // delete as3['$schema']

        const as3_wS = await injectSchema(as3)
        const results = await validate(as3, JSON.stringify(as3Schema, undefined, 4))
        assert.ok(results.length === 0)
    });
});


const as3_bad =
{
    "class": "AS3",
    "action": "ded",
    "persist": true,
}

const as3 =
{
    "$schema": "https://raw.githubusercontent.com/F5Networks/f5-appsvcs-extension/master/schema/latest/as3-schema.json",
    "class": "AS3",
    "action": "deploy",
    "persist": true,
    "declaration": {
        "class": "ADC",
        "schemaVersion": "3.0.0",
        "id": "urn:uuid:33045210-3ab8-4636-9b2a-c98d22ab915d",
        "label": "Sample 1",
        "remark": "Simple HTTP application with RR pool",
        "Sample_01": {
            "class": "Tenant",
            "A1": {
                "class": "Application",
                "template": "http",
                "serviceMain": {
                    "class": "Service_HTTP",
                    "virtualAddresses": [
                        "10.0.1.10"
                    ],
                    "pool": "web_pool"
                },
                "web_pool": {
                    "class": "Pool",
                    "monitors": [
                        "http"
                    ],
                    "members": [
                        {
                            "servicePort": 80,
                            "serverAddresses": [
                                "192.0.1.10",
                                "192.0.1.11"
                            ]
                        }
                    ]
                }
            }
        }
    }
}
//   )