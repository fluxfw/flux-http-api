import { HEADER_SET_COOKIE } from "../../../Adapter/Header/HEADER.mjs";
import { METHOD_HEAD } from "../../../Adapter/Method/METHOD.mjs";
import { pipeline } from "node:stream/promises";
import { SET_COOKIE_SAME_SITE_LAX } from "../../../Adapter/Cookie/SET_COOKIE_SAME_SITE.mjs";
import { STATUS_500 } from "../../../Adapter/Status/STATUS.mjs";
import { SET_COOKIE_OPTION_EXPIRES, SET_COOKIE_OPTION_HTTP_ONLY, SET_COOKIE_OPTION_MAX_AGE, SET_COOKIE_OPTION_PATH, SET_COOKIE_OPTION_SAME_SITE, SET_COOKIE_OPTION_SECURE } from "../../../Adapter/Cookie/SET_COOKIE_OPTION.mjs";

/** @typedef {import("../../../Adapter/Request/HttpRequest.mjs").HttpRequest} HttpRequest */
/** @typedef {import("../../../Adapter/Response/HttpResponse.mjs").HttpResponse} HttpResponse */
/** @typedef {import("node:http").ServerResponse} ServerResponse */

export class MapResponseCommand {
    /**
     * @returns {MapResponseCommand}
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
     * @param {HttpResponse} response
     * @param {ServerResponse} res
     * @param {HttpRequest | null} request
     * @returns {Promise<void>}
     */
    async mapResponse(response, res, request = null) {
        try {
            res.statusCode = response.status_code;
            res.statusMessage = response.status_message;

            for (const [
                key,
                value
            ] of Object.entries(response.headers)) {
                this.#setHeader(
                    res,
                    key,
                    value
                );
            }

            for (const [
                key,
                value
            ] of Object.entries(response.cookies)) {
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

            if (request?.method !== METHOD_HEAD && response.body !== null) {
                await pipeline(response.body, res);
            }
        } catch (error) {
            console.error(error);

            if (!res.headersSent) {
                res.statusCode = STATUS_500;
                res.statusMessage = "";
            }
        } finally {
            res.end();
            response.body?.destroy();
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
                ...options,
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
                ...options
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
        const values = res.getHeader(key) ?? null;

        res.setHeader(key, values !== null ? [
            ...Array.isArray(values) ? values : [
                values
            ],
            ...Array.isArray(value) ? value : [
                value
            ]
        ] : value);
    }
}
