import { HttpServerRequest } from "../../../Adapter/Server/HttpServerRequest.mjs";
import { NodeBodyImplementation } from "../../../Adapter/BodyImplementation/NodeBodyImplementation.mjs";
import { SERVER_DEFAULT_FORWARDED_HEADERS } from "../../../Adapter/Server/SERVER.mjs";
import { HEADER_CONTENT_TYPE, HEADER_COOKIE, HEADER_HOST, HEADER_X_FORWARDED_HOST, HEADER_X_FORWARDED_PROTO } from "../../../Adapter/Header/HEADER.mjs";
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
     * @param {boolean | null} forwarded_headers
     * @returns {Promise<HttpServerRequest>}
     */
    async mapRequest(req, _res = null, forwarded_headers = null) {
        const _forwarded_headers = forwarded_headers ?? SERVER_DEFAULT_FORWARDED_HEADERS;

        return HttpServerRequest.new(
            new URL(req.url, `${(_forwarded_headers ? req.headers[HEADER_X_FORWARDED_PROTO.toLowerCase()] : null) ?? (req.socket.encrypted ? PROTOCOL_HTTPS : PROTOCOL_HTTP)}://${(_forwarded_headers ? req.headers[HEADER_X_FORWARDED_HOST.toLowerCase()] : null) ?? req.headers[HEADER_HOST.toLowerCase()] ?? "host"}`),
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
