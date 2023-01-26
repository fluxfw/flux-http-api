import { WebBodyImplementation } from "../BodyImplementation/WebBodyImplementation.mjs";

/** @typedef {import("../BodyImplementation/BodyImplementation.mjs").BodyImplementation} BodyImplementation */

export class HttpClientResponse {
    /**
     * @type {BodyImplementation}
     */
    #body_implementation;
    /**
     * @type {[string, string[]][]}
     */
    #headers;
    /**
     * @type {number}
     */
    #status_code;
    /**
     * @type {boolean}
     */
    #status_code_is_ok;
    /**
     * @type {string}
     */
    #status_message;

    /**
     * @param {number} status_code
     * @param {boolean} status_code_is_ok
     * @param {string} status_message
     * @param {[string, string[]][] | null} headers
     * @param {BodyImplementation | null} body_implementation
     * @returns {HttpClientResponse}
     */
    static new(status_code, status_code_is_ok, status_message, headers = null, body_implementation = null) {
        return new this(
            status_code,
            status_code_is_ok,
            status_message,
            headers ?? [],
            body_implementation ?? WebBodyImplementation.webStream()
        );
    }

    /**
     * @param {number} status_code
     * @param {boolean} status_code_is_ok
     * @param {string} status_message
     * @param {[string, string[]][]} headers
     * @param {BodyImplementation} body_implementation
     * @private
     */
    constructor(status_code, status_code_is_ok, status_message, headers, body_implementation) {
        this.#status_code = status_code;
        this.#status_code_is_ok = status_code_is_ok;
        this.#status_message = status_message;
        this.#headers = headers;
        this.#body_implementation = body_implementation;
    }

    /**
     * @returns {BodyImplementation}
     */
    get body() {
        return this.#body_implementation;
    }

    /**
     * @returns {{[key: string]: string[]}}
     */
    get headers() {
        return structuredClone(Object.fromEntries(this.#headers));
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
        return this.#headers.find(([
            _key
        ]) => _key.toLowerCase() === key.toLowerCase())?.[1] ?? [];
    }

    /**
     * @returns {number}
     */
    get status_code() {
        return this.#status_code;
    }

    /**
     * @returns {boolean}
     */
    get status_code_is_ok() {
        return this.#status_code_is_ok;
    }

    /**
     * @returns {string}
     */
    get status_message() {
        return this.#status_message;
    }
}
