import { HttpClientResponse } from "../Client/HttpClientResponse.mjs";
import { RequestImplementation } from "./RequestImplementation.mjs";
import { WebBodyImplementation } from "../BodyImplementation/WebBodyImplementation.mjs";
import { METHOD_GET, METHOD_HEAD } from "../Method/METHOD.mjs";

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
            } : null,
            signal: request.abort_signal
        });

        const response = HttpClientResponse.new(
            request.response_body && request.method !== METHOD_HEAD ? WebBodyImplementation.new(
                web_response
            ) : null,
            web_response.status,
            Object.fromEntries(web_response.headers),
            web_response.statusText
        );

        if (!request.response_body) {
            await web_response.body?.cancel();
        }

        if (request.assert_status_code_is_ok && !response.status_code_is_ok) {
            return Promise.reject(response);
        }

        return response;
    }
}
