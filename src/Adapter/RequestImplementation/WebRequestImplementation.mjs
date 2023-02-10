import { HttpClientResponse } from "../Client/HttpClientResponse.mjs";
import { RequestImplementation } from "./RequestImplementation.mjs";
import { WebBodyImplementation } from "../BodyImplementation/WebBodyImplementation.mjs";
import { METHOD_GET, METHOD_HEAD } from "../Method/METHOD.mjs";
import { STATUS_CODE_300, STATUS_CODE_400 } from "../Status/STATUS_CODE.mjs";

/** @typedef {import("../Client/HttpClientRequest.mjs").HttpClientRequest} HttpClientRequest */

export class WebRequestImplementation extends RequestImplementation {
    /**
     * @returns {WebRequestImplementation}
     */
    static new() {
        return new this();
    }

    /**
     * @private
     */
    constructor() {
        super();
    }

    /**
     * @param {HttpClientRequest} request
     * @returns {Promise<HttpClientResponse>}
     */
    async request(request) {
        if (request.server_certificate !== null) {
            throw new Error("Server certificate is not supported");
        }

        const web_response = await fetch(`${request.url}`, {
            method: request.method,
            headers: request.headers,
            body: request.method !== METHOD_GET && request.method !== METHOD_HEAD && request.body.stream() !== null ? await request.body.blob() : null,
            ...!request.follow_redirects ? {
                redirect: "manual"
            } : null
        });

        const response = HttpClientResponse.new(
            request.method !== METHOD_HEAD ? WebBodyImplementation.new(
                web_response
            ) : null,
            web_response.status,
            Object.fromEntries(web_response.headers),
            web_response.statusText
        );

        if (request.assert_status_code_is_ok && !response.ok && (!request.follow_redirects ? response.status_code < STATUS_CODE_300 && response.status_code >= STATUS_CODE_400 : true)) {
            return Promise.reject(response);
        }

        return response;
    }
}
