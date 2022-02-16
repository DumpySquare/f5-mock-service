'use strict';

import { AdcDeclaration, tenantFromDec } from "f5-conx-core";




export async function declarationValidator(dec: AdcDeclaration): Promise<boolean> {

    // if (dec.class === 'AS3') {

    //     if (
    //         dec.declaration &&
    //         dec.declaration.class === 'ADC' &&
    //         dec.declaration.schemaVersion &&
    //         dec.declaration.id
    //     ) {
    //         return true;
    //     }
    // }

    // if (dec.class === 'ADC') {
    //     if (
    //         dec.schemaVersion 
    //     ) {
    //         return true
    //     }
    // }
    // return false;

    return await tenantFromDec(dec)
        .then(resp => {
            if(resp.schemaVersion && resp.tenant) {
                return true;
            } else {
                return false;
            }
        })
        .catch(err => {
            return false;
        })

}