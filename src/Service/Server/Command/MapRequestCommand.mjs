import { HttpRequest } from "../../../Adapter/Request/HttpRequest.mjs";
import { HEADER_COOKIE, HEADER_HOST } from "../../../Adapter/Header/HEADER.mjs";
import { METHOD_GET, METHOD_HEAD } from "../../../Adapter/Method/METHOD.mjs";

/** @typedef {import("node:http")} http */
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
     * @returns {Promise<HttpRequest | null>}
     */
    async mapRequest(req, _res = null) {
        try {
            return HttpRequest.new(
                req.method,
                new URL(req.url, `${req.socket.encrypted ? "https" : "http"}://${req.headers[HEADER_HOST.toLowerCase()] ?? "host"}`),
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
                req.method !== METHOD_GET && req.method !== METHOD_HEAD ? req : null,
                _res
            );
        } catch (error) {
            console.error(error);

            return null;
        }
    }
}
