import { HEADER_SET_COOKIE } from "../../../Adapter/Header/HEADER.mjs";
import { METHOD_HEAD } from "../../../Adapter/Method/METHOD.mjs";
import { SET_COOKIE_SAME_SITE_LAX } from "../../../Adapter/Cookie/SET_COOKIE_SAME_SITE.mjs";
import { Writable } from "node:stream";
import { SET_COOKIE_OPTION_EXPIRES, SET_COOKIE_OPTION_HTTP_ONLY, SET_COOKIE_OPTION_MAX_AGE, SET_COOKIE_OPTION_PATH, SET_COOKIE_OPTION_SAME_SITE, SET_COOKIE_OPTION_SECURE } from "../../../Adapter/Cookie/SET_COOKIE_OPTION.mjs";

/** @typedef {import("node:http")} http */
/** @typedef {import("../../../Adapter/Request/HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */
/** @typedef {import("../../../Adapter/Response/HttpServerResponse.mjs").HttpServerResponse} HttpServerResponse */

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
     * @param {http.ServerResponse} res
     * @param {HttpServerRequest | null} request
     * @returns {Promise<void>}
     */
    async mapResponseToServerResponse(response, res, request = null) {
        try {
            res.statusCode = response.status;
            res.statusMessage = response.statusMessage;

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

            if (response.body !== null && request.method !== METHOD_HEAD) {
                await response.body.pipeTo(Writable.toWeb(res));
            }
        } catch (error) {
            console.error(error);
        } finally {
            res.end();
        }
    }

    /**
     * @param {http.ServerResponse} res
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
     * @param {http.ServerResponse} res
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
     * @param {http.ServerResponse} res
     * @param {string} key
     * @param {string | string[]} value
     * @returns {void}
     */
    #setHeader(res, key, value) {
        const _value = res.getHeader(key) ?? null;

        res.setHeader(key, _value !== null ? (Array.isArray(_value) ? _value : [
            _value
        ]).concat(Array.isArray(value) ? value : [
            value
        ]) : value);
    }
}
