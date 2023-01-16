import { HEADER_ALLOW } from "../../../Adapter/Header/HEADER.mjs";
import { HttpResponse } from "../../../Adapter/Response/HttpResponse.mjs";
import { METHOD_OPTIONS } from "../../../Adapter/Method/METHOD.mjs";
import { STATUS_204, STATUS_405 } from "../../../Adapter/Status/STATUS.mjs";

/** @typedef {import("../../../Adapter/Request/HttpRequest.mjs").HttpRequest} HttpRequest */

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
     * @param {HttpRequest} request
     * @param {string[]} methods
     * @returns {Promise<HttpResponse | null>}
     */
    async validateMethods(request, methods) {
        if (!methods.includes(request.method)) {
            return HttpResponse.new(
                null,
                STATUS_405,
                {
                    [HEADER_ALLOW]: methods.join(", ")
                }
            );
        }

        if (request.method === METHOD_OPTIONS) {
            return HttpResponse.new(
                null,
                STATUS_204,
                {
                    [HEADER_ALLOW]: methods.join(", ")
                }
            );
        }

        return null;
    }
}
