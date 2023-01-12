import { HEADER_SET_COOKIE } from "../../../Adapter/Header/HEADER.mjs";
import { METHOD_HEAD } from "../../../Adapter/Method/METHOD.mjs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { SET_COOKIE_SAME_SITE_LAX } from "../../../Adapter/Cookie/SET_COOKIE_SAME_SITE.mjs";
import { STATUS_500 } from "../../../Adapter/Status/STATUS.mjs";
import { SET_COOKIE_OPTION_EXPIRES, SET_COOKIE_OPTION_HTTP_ONLY, SET_COOKIE_OPTION_MAX_AGE, SET_COOKIE_OPTION_PATH, SET_COOKIE_OPTION_SAME_SITE, SET_COOKIE_OPTION_SECURE } from "../../../Adapter/Cookie/SET_COOKIE_OPTION.mjs";

/** @typedef {import("../../../Adapter/Request/HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */
/** @typedef {import("../../../Adapter/Response/HttpServerResponse.mjs").HttpServerResponse} HttpServerResponse */
/** @typedef {import("node:http").ServerResponse} ServerResponse */

export class MapResponseToServerResponseCommand {
    /**
     * @returns {MapResponseToServerResponseCommand}
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
     * @param {HttpServerResponse} response
     * @param {ServerResponse} res
     * @param {HttpServerRequest | null} request
     * @returns {Promise<void>}
     */
    async mapResponseToServerResponse(response, res, request = null) {
        try {
            res.statusCode = response.status;
            res.statusMessage = response.statusText;

            for (const [
                key,
                value
            ] of response.headers.entries()) {
                this.#setHeader(
                    res,
                    key,
                    value
                );
            }

            for (const [
                key,
                value
            ] of Object.entries(response._cookies ?? {})) {
                if (value === null) {
                    this.#deleteCookie(
                        res,
                        key
                    );
                } else {
                    if (typeof value === "object") {
                        if (value.value === null) {
                            this.#deleteCookie(
                                res,
                                key,
                                value.options
                            );
                        } else {
                            this.#setCookie(
                                res,
                                key,
                                value.value,
                                value.options
                            );
                        }
                    } else {
                        this.#setCookie(
                            res,
                            key,
                            value
                        );
                    }
                }
            }

            if (request?.method !== METHOD_HEAD) {
                if (response.body !== null) {
                    await pipeline(Readable.fromWeb(response.body), res);
                } else {
                    if ((response._bodyNode ?? null) !== null) {
                        await pipeline(response._bodyNode, res);
                    }
                }
            } else {
                response.body?.cancel();
                response._bodyNode?.destroy();
            }
        } catch (error) {
            console.error(error);

            if (!res.headersSent) {
                res.statusCode = STATUS_500;
                res.statusMessage = "";
            }
        } finally {
            res.end();
        }
    }

    /**
     * @param {ServerResponse} res
     * @param {string} key
     * @param {{[key: string]: *} | null} options
     * @returns {void}
     */
    #deleteCookie(res, key, options = null) {
        this.#setCookie(
            res,
            key,
            "",
            {
                ...options ?? {},
                [SET_COOKIE_OPTION_MAX_AGE]: -1,
                [SET_COOKIE_OPTION_EXPIRES]: null
            }
        );
    }

    /**
     * @param {ServerResponse} res
     * @param {string} key
     * @param {*} value
     * @param {{[key: string]: *} | null} options
     * @returns {void}
     */
    #setCookie(res, key, value, options = null) {
        this.#setHeader(
            res,
            HEADER_SET_COOKIE,
            `${key}=${value}${Object.entries({
                [SET_COOKIE_OPTION_HTTP_ONLY]: true,
                [SET_COOKIE_OPTION_PATH]: "/",
                [SET_COOKIE_OPTION_SAME_SITE]: SET_COOKIE_SAME_SITE_LAX,
                [SET_COOKIE_OPTION_SECURE]: true,
                ...options ?? {}
            }).reduce((_options, [
                _key,
                _value
            ]) => {
                if ((_value ?? null) === null) {
                    return _options;
                }

                if (typeof _value === "boolean") {
                    return _value ? `${_options}; ${_key}` : _options;
                }

                return `${_options}; ${_key}=${_value instanceof Date ? _value.toUTCString() : _value}`;
            }, "")}`
        );
    }

    /**
     * @param {ServerResponse} res
     * @param {string} key
     * @param {string | string[]} value
     * @returns {void}
     */
    #setHeader(res, key, value) {
        const _value = res.getHeader(key) ?? null;

        res.setHeader(key, _value !== null ? [
            ...Array.isArray(_value) ? _value : [
                _value
            ],
            ...Array.isArray(value) ? value : [
                value
            ]
        ] : value);
    }
}
