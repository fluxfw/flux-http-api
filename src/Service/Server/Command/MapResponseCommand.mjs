import { HEADER_SET_COOKIE } from "../../../Adapter/Header/HEADER.mjs";
import { METHOD_HEAD } from "../../../Adapter/Method/METHOD.mjs";
import { pipeline } from "node:stream/promises";
import { STATUS_CODE_500 } from "../../../Adapter/Status/STATUS_CODE.mjs";
import { SET_COOKIE_OPTION_DEFAULT_HTTP_ONLY, SET_COOKIE_OPTION_DEFAULT_MAX_AGE, SET_COOKIE_OPTION_DEFAULT_PATH, SET_COOKIE_OPTION_DEFAULT_PRIORITY, SET_COOKIE_OPTION_DEFAULT_SAME_SITE, SET_COOKIE_OPTION_DEFAULT_SECURE, SET_COOKIE_OPTION_EXPIRES, SET_COOKIE_OPTION_HTTP_ONLY, SET_COOKIE_OPTION_MAX_AGE, SET_COOKIE_OPTION_MAX_AGE_SESSION, SET_COOKIE_OPTION_PATH, SET_COOKIE_OPTION_PRIORITY, SET_COOKIE_OPTION_SAME_SITE, SET_COOKIE_OPTION_SECURE } from "../../../Adapter/Cookie/SET_COOKIE_OPTION.mjs";

/** @typedef {import("../../../Adapter/Server/HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */
/** @typedef {import("../../../Adapter/Server/HttpServerResponse.mjs").HttpServerResponse} HttpServerResponse */
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
     * @param {HttpServerResponse} response
     * @param {ServerResponse} res
     * @param {HttpServerRequest | null} request
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

            this.#setCookies(
                res,
                response.cookies
            );

            if (request?.method === METHOD_HEAD) {
                return;
            }

            const stream = response.body.stream();

            if (stream === null) {
                return;
            }

            await pipeline(stream, res);
        } catch (error) {
            console.error(error);

            if (!res.headersSent) {
                res.statusCode = STATUS_CODE_500;
                res.statusMessage = "";
            }
        } finally {
            res.end();
        }
    }

    /**
     * @param {ServerResponse} _res
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null}} cookies
     * @returns {Promise<void>}
     */
    async _setCookies(_res, cookies) {
        this.#setCookies(
            _res,
            cookies
        );
    }

    /**
     * @param {ServerResponse} res
     * @param {string} name
     * @param {{[key: string]: *} | null} options
     * @returns {void}
     */
    #deleteCookie(res, name, options = null) {
        this.#setCookie(
            res,
            name,
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
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null}} cookies
     * @returns {void}
     */
    #setCookies(res, cookies) {
        for (const [
            name,
            value
        ] of Object.entries(cookies)) {
            if (value === null) {
                this.#deleteCookie(
                    res,
                    name
                );
            } else {
                if (typeof value === "object") {
                    if (value.value === null) {
                        this.#deleteCookie(
                            res,
                            name,
                            value.options
                        );
                    } else {
                        this.#setCookie(
                            res,
                            name,
                            value.value,
                            value.options
                        );
                    }
                } else {
                    this.#setCookie(
                        res,
                        name,
                        value
                    );
                }
            }
        }
    }

    /**
     * @param {ServerResponse} res
     * @param {string} name
     * @param {*} value
     * @param {{[key: string]: *} | null} options
     * @returns {void}
     */
    #setCookie(res, name, value, options = null) {
        this.#setHeader(
            res,
            HEADER_SET_COOKIE,
            `${name}=${value}${Object.entries({
                [SET_COOKIE_OPTION_HTTP_ONLY]: SET_COOKIE_OPTION_DEFAULT_HTTP_ONLY,
                [SET_COOKIE_OPTION_MAX_AGE]: SET_COOKIE_OPTION_DEFAULT_MAX_AGE,
                [SET_COOKIE_OPTION_PATH]: SET_COOKIE_OPTION_DEFAULT_PATH,
                [SET_COOKIE_OPTION_PRIORITY]: SET_COOKIE_OPTION_DEFAULT_PRIORITY,
                [SET_COOKIE_OPTION_SAME_SITE]: SET_COOKIE_OPTION_DEFAULT_SAME_SITE,
                [SET_COOKIE_OPTION_SECURE]: SET_COOKIE_OPTION_DEFAULT_SECURE,
                ...options
            }).reduce((_options, [
                key,
                _value
            ]) => {
                if ((_value ?? null) === null) {
                    return _options;
                }

                if (typeof _value === "boolean") {
                    return _value ? `${_options}; ${key}` : _options;
                }

                if (key === SET_COOKIE_OPTION_MAX_AGE && _value === SET_COOKIE_OPTION_MAX_AGE_SESSION) {
                    return _options;
                }

                return `${_options}; ${key}=${_value instanceof Date ? _value.toUTCString() : _value}`;
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
