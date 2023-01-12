import { HEADER_ALLOW } from "../../../Adapter/Header/HEADER.mjs";
import { METHOD_OPTIONS } from "../../../Adapter/Method/METHOD.mjs";
import { STATUS_204, STATUS_405 } from "../../../Adapter/Status/STATUS.mjs";

/** @typedef {import("../../../Adapter/Request/HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */
/** @typedef {import("../../../Adapter/Response/HttpServerResponse.mjs").HttpServerResponse} HttpServerResponse */

export class ValidateMethodsCommand {
    /**
     * @returns {ValidateMethodsCommand}
     */
    static new() {
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
            return new Response(null, {
                status: STATUS_405,
                headers: {
                    [HEADER_ALLOW]: methods.join(", ")
                }
            });
        }

        if (request.method === METHOD_OPTIONS) {
            return new Response(null, {
                status: STATUS_204,
                headers: {
                    [HEADER_ALLOW]: methods.join(", ")
                }
            });
        }

        return null;
    }
}
