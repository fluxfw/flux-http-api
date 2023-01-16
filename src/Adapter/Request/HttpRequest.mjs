import { Readable } from "node:stream";

/** @typedef {import("node:http").ServerResponse} ServerResponse */

export class HttpRequest {
    /**
     * @type {Readable | null}
     */
    #body;
    /**
     * @type {[string, string][]}
     */
    #cookies;
    /**
     * @type {[string, string[]][]}
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
     * @param {string} method
     * @param {URL} url
     * @param {[string, string[]][] | null} headers
     * @param {[string, string][] | null} cookies
     * @param {Readable | null} body
     * @param {ServerResponse | null} _res
     * @returns {HttpRequest}
     */
    static new(method, url, headers = null, cookies = null, body = null, _res = null) {
        return new this(
            method,
            url,
            url.pathname.substring(1).split("/"),
            headers ?? [],
            cookies ?? [],
            body,
            _res
        );
    }

    /**
     * @param {string} method
     * @param {URL} url
     * @param {string[]} url_path_parts
     * @param {[string, string[]][]} headers
     * @param {[string, string][]} cookies
     * @param {Readable | null} body
     * @param {ServerResponse | null} _res
     * @private
     */
    constructor(method, url, url_path_parts, headers, cookies, body, _res) {
        this.#method = method;
        this.#url = url;
        this.#url_path_parts = url_path_parts;
        this.#headers = headers;
        this.#cookies = cookies;
        this.#body = body;
        this.#_res = _res;
    }

    /**
     * @returns {Readable | null}
     */
    get body() {
        return this.#body;
    }

    /**
     * @returns {{[key: string]: string}}
     */
    get cookies() {
        return structuredClone(Object.fromEntries(this.#cookies));
    }

    /**
     * @param {string} key
     * @returns {string | null}
     */
    getCookie(key) {
        return this.#cookies.find(([
            _key
        ]) => _key === key)?.[1] ?? null;
    }

    /**
     * @param {string} key
     * @returns {string | null}
     */
    getHeader(key) {
        return this.getHeaderAll(
            key
        )[0] ?? null;
    }

    /**
     * @param {string} key
     * @returns {string[]}
     */
    getHeaderAll(key) {
        return this.#headers.find(([
            _key
        ]) => _key.toLowerCase() === key.toLowerCase())?.[1] ?? [];
    }

    /**
     * @param {string} key
     * @returns {boolean}
     */
    hasCookie(key) {
        return this.#cookies.some(([
            _key
        ]) => _key === key);
    }

    /**
     * @param {string} key
     * @returns {boolean}
     */
    hasHeader(key) {
        return this.#headers.some(([
            _key
        ]) => _key.toLowerCase() === key.toLowerCase());
    }

    /**
     * @returns {{[key: string]: string[]}}
     */
    get headers() {
        return structuredClone(Object.fromEntries(this.#headers));
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

    /**
     * @returns {ReadableStream | null}
     */
    get web_body() {
        return this.#body !== null ? Readable.toWeb(this.#body) : null;
    }

    /**
     * @returns {Response}
     */
    get web_body_parse() {
        return new Response(this.web_body);
    }
}
