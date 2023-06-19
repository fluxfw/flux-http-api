import { STATUS_CODE_MESSAGE } from "../Status/STATUS_CODE_MESSAGE.mjs";
import { WebBodyImplementation } from "../BodyImplementation/WebBodyImplementation.mjs";
import { STATUS_CODE_200, STATUS_CODE_300 } from "../Status/STATUS_CODE.mjs";

/** @typedef {import("../BodyImplementation/BodyImplementation.mjs").BodyImplementation} BodyImplementation */

export class HttpClientResponse {
    /**
     * @type {BodyImplementation}
     */
    #body_implementation;
    /**
     * @type {{[key: string]: string | string[]}}
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
     * @param {BodyImplementation | null} body_implementation
     * @param {number | null} status_code
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {string | null} status_message
     * @param {boolean | null} status_code_is_ok
     * @returns {HttpClientResponse}
     */
    static new(body_implementation = null, status_code = null, headers = null, status_message = null, status_code_is_ok = null) {
        const _status_code = status_code ?? STATUS_CODE_200;

        return new this(
            body_implementation ?? WebBodyImplementation.webStream(),
            _status_code,
            headers ?? {},
            status_message ?? STATUS_CODE_MESSAGE[_status_code] ?? "",
            status_code_is_ok ?? (_status_code >= STATUS_CODE_200 && _status_code < STATUS_CODE_300)
        );
    }

    /**
     * @param {BodyImplementation} body_implementation
     * @param {number} status_code
     * @param {{[key: string]: string | string[]}} headers
     * @param {string} status_message
     * @param {boolean} status_code_is_ok
     * @private
     */
    constructor(body_implementation, status_code, headers, status_message, status_code_is_ok) {
        this.#body_implementation = body_implementation;
        this.#status_code = status_code;
        this.#headers = headers;
        this.#status_message = status_message;
        this.#status_code_is_ok = status_code_is_ok;
    }

    /**
     * @returns {BodyImplementation}
     */
    get body() {
        return this.#body_implementation;
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

    /**
     * @returns {string}
     */
    [Symbol.for("nodejs.util.inspect.custom")]() {
        return `${this.constructor.name} ${JSON.stringify({
            body: this.#body_implementation,
            headers: this.#headers,
            status_code: this.#status_code,
            status_code_is_ok: this.#status_code_is_ok,
            status_message: this.#status_message
        }, null, 4)}`;
    }
}
