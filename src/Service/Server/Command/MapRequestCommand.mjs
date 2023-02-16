import { HttpServerRequest } from "../../../Adapter/Server/HttpServerRequest.mjs";
import { NodeBodyImplementation } from "../../../Adapter/BodyImplementation/NodeBodyImplementation.mjs";
import { HEADER_CONTENT_TYPE, HEADER_COOKIE, HEADER_HOST } from "../../../Adapter/Header/HEADER.mjs";
import { METHOD_GET, METHOD_HEAD } from "../../../Adapter/Method/METHOD.mjs";
import { PROTOCOL_HTTP, PROTOCOL_HTTPS } from "../../../Adapter/Protocol/PROTOCOL.mjs";

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
            new URL(req.url, `${req.socket.encrypted ? PROTOCOL_HTTPS : PROTOCOL_HTTP}://${req.headers[HEADER_HOST.toLowerCase()] ?? "host"}`),
            req.method !== METHOD_GET && req.method !== METHOD_HEAD ? NodeBodyImplementation.new(
                req,
                req.headers[HEADER_CONTENT_TYPE.toLowerCase()] ?? null
            ) : null,
            req.method,
            req.headers,
            req.headers[HEADER_COOKIE.toLowerCase()]?.split(";")?.reduce((cookies, cookie) => {
                const [
                    name,
                    ...value
                ] = cookie.trim().split("=");

                cookies[name] = value.join("=");

                return cookies;
            }, {}) ?? null,
            null,
            _res
        );
    }
}
