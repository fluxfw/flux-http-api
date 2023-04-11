import { HttpClientRequest } from "../Client/HttpClientRequest.mjs";
import { HttpClientResponse } from "../Client/HttpClientResponse.mjs";
import { NodeBodyImplementation } from "../BodyImplementation/NodeBodyImplementation.mjs";
import { pipeline } from "node:stream/promises";
import { PROTOCOL_HTTPS } from "../Protocol/PROTOCOL.mjs";
import { request as requestHttp } from "node:http";
import { request as requestHttps } from "node:https";
import { HEADER_CONTENT_TYPE, HEADER_LOCATION } from "../Header/HEADER.mjs";
import { METHOD_GET, METHOD_HEAD } from "../Method/METHOD.mjs";
import { STATUS_CODE_300, STATUS_CODE_301, STATUS_CODE_302, STATUS_CODE_307, STATUS_CODE_308, STATUS_CODE_400 } from "../Status/STATUS_CODE.mjs";

/** @typedef {import("./RequestImplementation.mjs").RequestImplementation} RequestImplementation */

/**
 * @implements {RequestImplementation}
 */
export class NodeRequestImplementation {
    /**
     * @returns {NodeRequestImplementation}
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
    async request(request) {
        let resolve_promise, reject_promise;

        const promise = new Promise((resolve, reject) => {
            resolve_promise = resolve;
            reject_promise = reject;
        });

        const req = (request.url.protocol === `${PROTOCOL_HTTPS}:` ? requestHttps : requestHttp)(`${request.url}`, {
            method: request.method,
            headers: request.headers,
            ca: request.server_certificate !== null ? [
                request.server_certificate
            ] : null,
            signal: request.abort_signal
        }, res => {
            if (request.follow_redirects && res.statusCode >= STATUS_CODE_300 && res.statusCode < STATUS_CODE_400) {
                res.destroy();

                if (request.method !== METHOD_GET && request.method !== METHOD_HEAD) {
                    reject_promise(new Error(`Method needs to be ${METHOD_GET} or ${METHOD_HEAD}, got ${request.method}`));
                    return;
                }

                if (res.statusCode !== STATUS_CODE_301 && res.statusCode !== STATUS_CODE_302 && res.statusCode !== STATUS_CODE_307 && res.statusCode !== STATUS_CODE_308) {
                    reject_promise(new Error(`Status code needs to be ${STATUS_CODE_301} or ${STATUS_CODE_302} or ${STATUS_CODE_307} or ${STATUS_CODE_308}, got ${res.statusCode}`));
                    return;
                }

                const location = res.headers[HEADER_LOCATION.toLowerCase()] ?? null;

                if (location === null) {
                    reject_promise(new Error("Missing redirect location"));
                    return;
                }

                const url = new URL(location, request.url.origin);

                resolve_promise(this.request(
                    HttpClientRequest.new(
                        url,
                        null,
                        request.method,
                        request.headers,
                        request.assert_status_code_is_ok,
                        request.response_body,
                        request.follow_redirects,
                        url.hostname === request.url.hostname ? request.server_certificate : null,
                        request.abort_signal
                    )
                ));

                return;
            }

            const response = HttpClientResponse.new(
                request.response_body && request.method !== METHOD_HEAD ? NodeBodyImplementation.new(
                    res,
                    res.headers[HEADER_CONTENT_TYPE.toLowerCase()] ?? null
                ) : null,
                res.statusCode,
                res.headers,
                res.statusMessage
            );

            if (!request.response_body) {
                res.destroy();
            }

            if (request.assert_status_code_is_ok && !response.status_code_is_ok) {
                reject_promise(response);
                return;
            }

            resolve_promise(response);
        });

        try {
            let stream;
            if (request.method !== METHOD_GET && request.method !== METHOD_HEAD && (stream = request.body.stream()) !== null) {
                await pipeline(stream, req);
            } else {
                req.on("error", error => {
                    reject_promise(error);
                });
            }
        } finally {
            req.end();
        }

        return promise;
    }
}
