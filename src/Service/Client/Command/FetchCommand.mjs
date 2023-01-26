import { HttpClientResponse } from "../../../Adapter/Client/HttpClientResponse.mjs";
import { WebBodyImplementation } from "../../../Adapter/BodyImplementation/WebBodyImplementation.mjs";
import { METHOD_GET, METHOD_HEAD } from "../../../Adapter/Method/METHOD.mjs";

/** @typedef {import("../../../Adapter/Client/HttpClientRequest.mjs").HttpClientRequest} HttpClientRequest */

export class FetchCommand {
    /**
     * @returns {FetchCommand}
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
     * @param {HttpClientRequest} request
     * @returns {Promise<HttpClientResponse>}
     */
    async fetch(request) {
        let body = null;
        if (request.method !== METHOD_GET && request.method !== METHOD_HEAD) {
            try {
                body = await request.body.blob();
            } catch (error) {
                if ((error?.message ?? null) !== "No stream") {
                    throw error;
                }
            }
        }

        const web_response = await fetch(request.url, {
            method: request.method,
            headers: request.headers,
            //body: request.method !== METHOD_GET && request.method !== METHOD_HEAD ? await request.body.webStream() : null,
            body,
            ...!request.follow_redirects ? {
                redirect: "manual"
            } : null
        });

        if (request.assert_status_code_is_ok && !web_response.ok && (!request.follow_redirects ? web_response.status < 300 && web_response.status > 399 : true)) {
            return Promise.reject(web_response);
        }

        return HttpClientResponse.new(
            web_response.status,
            web_response.ok,
            web_response.statusText,
            Object.entries(Object.fromEntries(web_response.headers)).map(([
                key,
                values
            ]) => [
                    key,
                    Array.isArray(values) ? values : [
                        values
                    ]
                ]),
            request.method !== METHOD_HEAD ? WebBodyImplementation.new(
                web_response
            ) : null
        );
    }
}
