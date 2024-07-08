import { HEADER_ALLOW } from "../Header/HEADER.mjs";
import { HttpServerResponse } from "./HttpServerResponse.mjs";
import { METHOD_OPTIONS } from "../Method/METHOD.mjs";
import { STATUS_CODE_204, STATUS_CODE_405 } from "../Status/STATUS_CODE.mjs";

/** @typedef {import("./HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */

export class ValidateMethods {
    /**
     * @returns {Promise<ValidateMethods>}
     */
    static async new() {
        return new this();
    }

    /**
     * @private
     */
    constructor() {

    }

    /**
     * @param {HttpServerRequest} request
     * @param {string[]} methods
     * @returns {Promise<HttpServerResponse | null>}
     */
    async validateMethods(request, methods) {
        if (!methods.includes(request.method)) {
            return HttpServerResponse.new(
                null,
                STATUS_CODE_405,
                {
                    ...methods.includes(METHOD_OPTIONS) ? {
                        [HEADER_ALLOW]: methods.join(", ")
                    } : null
                }
            );
        }

        if (request.method === METHOD_OPTIONS) {
            return HttpServerResponse.new(
                null,
                STATUS_CODE_204,
                {
                    [HEADER_ALLOW]: methods.join(", ")
                }
            );
        }

        return null;
    }
}
