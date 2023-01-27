import { HttpServerRequest } from "../../../Adapter/Server/HttpServerRequest.mjs";
import { NodeBodyImplementation } from "../../../Adapter/BodyImplementation/NodeBodyImplementation.mjs";
import { HEADER_CONTENT_TYPE, HEADER_COOKIE, HEADER_HOST } from "../../../Adapter/Header/HEADER.mjs";
import { METHOD_GET, METHOD_HEAD } from "../../../Adapter/Method/METHOD.mjs";

/** @typedef {import("node:http").IncomingMessage} IncomingMessage */
/** @typedef {import("node:http").ServerResponse} ServerResponse */

export class MapRequestCommand {
    /**
     * @returns {MapRequestCommand}
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
     * @param {IncomingMessage} req
     * @param {ServerResponse | null} _res
     * @returns {Promise<HttpServerRequest>}
     */
    async mapRequest(req, _res = null) {
        return HttpServerRequest.new(
            new URL(req.url, `${req.socket.encrypted ? "https" : "http"}://${req.headers[HEADER_HOST.toLowerCase()] ?? "host"}`),
            req.method !== METHOD_GET && req.method !== METHOD_HEAD ? NodeBodyImplementation.new(
                req,
                req.headers[HEADER_CONTENT_TYPE.toLowerCase()] ?? null
            ) : null,
            req.method,
            Object.entries(req.headers).map(([
                key,
                values
            ]) => [
                    key,
                    Array.isArray(values) ? values : [
                        values
                    ]
                ]),
            Object.entries(req.headers[HEADER_COOKIE.toLowerCase()]?.split(";")?.reduce((cookies, cookie) => {
                const [
                    key,
                    ...value
                ] = cookie.trim().split("=");

                cookies[key] = value.join("=");

                return cookies;
            }, {}) ?? {}),
            null,
            _res
        );
    }
}
