import { METHOD_GET } from "../Method/METHOD.mjs";
import { NodeBodyImplementation } from "../BodyImplementation/NodeBodyImplementation.mjs";

/** @typedef {import("../BodyImplementation/BodyImplementation.mjs").BodyImplementation} BodyImplementation */
/** @typedef {import("node:http").ServerResponse} ServerResponse */

export class HttpServerRequest {
    /**
     * @type {BodyImplementation}
     */
    #body_implementation;
    /**
     * @type {{[key: string]: string}}
     */
    #cookies;
    /**
     * @type {{[key: string]: string | string[]}}
     */
    #headers;
    /**
     * @type {string}
     */
    #method;
    /**
     * @type {ServerResponse | null}
     */
    #_res;
    /**
     * @type {URL}
     */
    #url;
    /**
     * @type {string[]}
     */
    #url_path_parts;

    /**
     * @param {URL} url
     * @param {BodyImplementation | null} body_implementation
     * @param {string | null} method
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {{[key: string]: string} | null} cookies
     * @param {string[] | null} url_path_parts
     * @param {ServerResponse | null} _res
     * @returns {HttpServerRequest}
     */
    static new(url, body_implementation = null, method = null, headers = null, cookies = null, url_path_parts = null, _res = null) {
        return new this(
            url,
            body_implementation ?? NodeBodyImplementation.new(),
            method ?? METHOD_GET,
            headers ?? {},
            cookies ?? {},
            url_path_parts ?? url.pathname.substring(1).split("/"),
            _res
        );
    }

    /**
     * @param {URL} url
     * @param {BodyImplementation} body_implementation
     * @param {string} method
     * @param {{[key: string]: string | string[]}} headers
     * @param {{[key: string]: string}} cookies
     * @param {string[]} url_path_parts
     * @param {ServerResponse | null} _res
     * @private
     */
    constructor(url, body_implementation, method, headers, cookies, url_path_parts, _res) {
        this.#url = url;
        this.#body_implementation = body_implementation;
        this.#method = method;
        this.#headers = headers;
        this.#cookies = cookies;
        this.#url_path_parts = url_path_parts;
        this.#_res = _res;
    }

    /**
     * @returns {BodyImplementation}
     */
    get body() {
        return this.#body_implementation;
    }

    /**
     * @returns {{[key: string]: string}}
     */
    get cookies() {
        return structuredClone(this.#cookies);
    }

    /**
     * @param {string} name
     * @returns {string | null}
     */
    cookie(name) {
        return Object.entries(this.#cookies).find(([
            _name
        ]) => _name === name)?.[1] ?? null;
    }

    /**
     * @returns {{[key: string]: string | string[]}}
     */
    get headers() {
        return structuredClone(this.#headers);
    }

    /**
     * @param {string} key
     * @returns {string | null}
     */
    header(key) {
        return this.headerAll(
            key
        )[0] ?? null;
    }

    /**
     * @param {string} key
     * @returns {string[]}
     */
    headerAll(key) {
        const value = Object.entries(this.#headers).find(([
            _key
        ]) => _key.toLowerCase() === key.toLowerCase())?.[1] ?? [];

        if (!Array.isArray(value)) {
            return [
                value
            ];
        }

        return value;
    }

    /**
     * @returns {string}
     */
    get method() {
        return this.#method;
    }

    /**
     * @returns {ServerResponse | null}
     */
    get _res() {
        return this.#_res;
    }

    /**
     * @returns {URL}
     */
    get url() {
        return this.#url;
    }

    /**
     * @returns {string[]}
     */
    get url_path_parts() {
        return this.#url_path_parts;
    }
}
