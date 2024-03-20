import { HttpServerResponse } from "./HttpServerResponse.mjs";
import { HEADER_AUTHORIZATION, HEADER_WWW_AUTHENTICATE } from "../Header/HEADER.mjs";
import { STATUS_CODE_400, STATUS_CODE_401 } from "../Status/STATUS_CODE.mjs";

/** @typedef {import("./HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */

export class GetAuthorizationParameters {
    /**
     * @returns {Promise<GetAuthorizationParameters>}
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
     * @param {string} schema
     * @param {string | null} parameters
     * @returns {Promise<string | HttpServerResponse>}
     */
    async getAuthorizationParameters(request, schema, parameters = null) {
        const authorization = request.header(
            HEADER_AUTHORIZATION
        );

        if (authorization === null) {
            return HttpServerResponse.text(
                "Authorization needed",
                STATUS_CODE_401,
                {
                    [HEADER_WWW_AUTHENTICATE]: `${schema}${parameters !== null ? ` ${parameters}` : ""}`
                }
            );
        }

        if (!authorization.startsWith(`${schema} `)) {
            return HttpServerResponse.text(
                "Invalid authorization schema",
                STATUS_CODE_400
            );
        }

        const authorization_parameters = authorization.split(" ").splice(1).join(" ");

        if (authorization_parameters === "") {
            return HttpServerResponse.text(
                "Invalid authorization parameters",
                STATUS_CODE_400
            );
        }

        return authorization_parameters;
    }
}
