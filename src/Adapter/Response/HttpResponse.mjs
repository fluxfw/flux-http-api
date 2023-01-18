import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { CONTENT_TYPE_HTML, CONTENT_TYPE_JSON, CONTENT_TYPE_TEXT } from "../ContentType/CONTENT_TYPE.mjs";
import { HEADER_CONTENT_LENGTH, HEADER_CONTENT_RANGE, HEADER_CONTENT_TYPE, HEADER_LOCATION } from "../Header/HEADER.mjs";
import { STATUS_200, STATUS_206, STATUS_302 } from "../Status/STATUS.mjs";

/** @typedef {import("../Range/RangeValue.mjs").RangeValue} RangeValue */

export class HttpResponse {
    /**
     * @type {Readable | null}
     */
    #body;
    /**
     * @type {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null}}}
     */
    #cookies;
    /**
     * @type {{[key: string]: string | string[]}}
     */
    #headers;
    /**
     * @type {number}
     */
    #status_code;
    /**
     * @type {string | null}
     */
    #status_message;

    /**
     * @param {ArrayBuffer} array_buffer
     * @param {number | null} status_code
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null}} cookies
     * @param {string | null} status_message
     * @returns {HttpResponse}
     */
    static arrayBuffer(array_buffer, status_code = null, headers = null, cookies = null, status_message = null) {
        return this.buffer(
            Buffer.from(array_buffer),
            status_code,
            headers,
            cookies,
            status_message
        );
    }

    /**
     * @param {Blob} blob
     * @param {number | null} status_code
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null}} cookies
     * @param {string | null} status_message
     * @returns {HttpResponse}
     */
    static blob(blob, status_code = null, headers = null, cookies = null, status_message = null) {
        return this.webStream(
            blob.stream,
            status_code,
            {
                ...blob.type !== "" ? {
                    [HEADER_CONTENT_TYPE]: blob.type
                } : null,
                ...headers
            },
            cookies,
            status_message
        );
    }

    /**
     * @param {Buffer} buffer
     * @param {number | null} status_code
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null}} cookies
     * @param {string | null} status_message
     * @returns {HttpResponse}
     */
    static buffer(buffer, status_code = null, headers = null, cookies = null, status_message = null) {
        return this.new(
            Readable.from(buffer),
            status_code,
            headers,
            cookies,
            status_message
        );
    }

    /**
     * @param {string} html
     * @param {number | null} status_code
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null}} cookies
     * @param {string | null} status_message
     * @returns {HttpResponse}
     */
    static html(html, status_code = null, headers = null, cookies = null, status_message = null) {
        return this.string(
            html,
            status_code,
            {
                [HEADER_CONTENT_TYPE]: CONTENT_TYPE_HTML,
                ...headers
            },
            cookies,
            status_message
        );
    }

    /**
     * @param {*} json
     * @param {number | null} status_code
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null}} cookies
     * @param {string | null} status_message
     * @returns {HttpResponse}
     */
    static json(json, status_code = null, headers = null, cookies = null, status_message = null) {
        return this.string(
            JSON.stringify(json),
            status_code,
            {
                [HEADER_CONTENT_TYPE]: CONTENT_TYPE_JSON,
                ...headers
            },
            cookies,
            status_message
        );
    }

    /**
     * @param {string} location
     * @param {number | null} status_code
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null}} cookies
     * @param {string | null} status_message
     * @returns {HttpResponse}
     */
    static redirect(location, status_code = null, headers = null, cookies = null, status_message = null) {
        return this.new(
            null,
            status_code ?? STATUS_302,
            {
                [HEADER_LOCATION]: location,
                ...headers
            },
            cookies,
            status_message
        );
    }

    /**
     * @param {string | null} path
     * @param {string | null} content_type
     * @param {number | null} length
     * @param {RangeValue | null} range
     * @param {number | null} status_code
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null}} cookies
     * @param {string | null} status_message
     * @returns {HttpResponse}
     */
    static staticFile(path = null, content_type = null, length = null, range = null, status_code = null, headers = null, cookies = null, status_message = null) {
        return this.new(
            path !== null ? createReadStream(path, {
                ...range !== null ? {
                    start: range.start,
                    end: range.end
                } : null
            }) : null,
            status_code ?? (range !== null ? STATUS_206 : null),
            {
                ...range !== null ? {
                    [HEADER_CONTENT_LENGTH]: range.length,
                    [HEADER_CONTENT_RANGE]: range.range
                } : length !== null ? {
                    [HEADER_CONTENT_LENGTH]: length
                } : {},
                ...content_type !== null ? {
                    [HEADER_CONTENT_TYPE]: content_type
                } : null,
                ...headers
            },
            cookies,
            status_message
        );
    }

    /**
     * @param {string} string
     * @param {number | null} status_code
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null}} cookies
     * @param {string | null} status_message
     * @returns {HttpResponse}
     */
    static string(string, status_code = null, headers = null, cookies = null, status_message = null) {
        return this.buffer(
            Buffer.from(string),
            status_code,
            headers,
            cookies,
            status_message
        );
    }

    /**
     * @param {string} text
     * @param {number | null} status_code
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null}} cookies
     * @param {string | null} status_message
     * @returns {HttpResponse}
     */
    static text(text, status_code = null, headers = null, cookies = null, status_message = null) {
        return this.string(
            text,
            status_code,
            {
                [HEADER_CONTENT_TYPE]: CONTENT_TYPE_TEXT,
                ...headers
            },
            cookies,
            status_message
        );
    }

    /**
     * @param {Response} response
     * @returns {HttpResponse}
     */
    static webResponse(response) {
        return this.webStream(
            response.body,
            response.status,
            Object.fromEntries(response.headers),
            null,
            response.statusText
        );
    }

    /**
     * @param {ReadableStream | null} body
     * @param {number | null} status_code
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null}} cookies
     * @param {string | null} status_message
     * @returns {HttpResponse}
     */
    static webStream(body = null, status_code = null, headers = null, cookies = null, status_message = null) {
        return this.new(
            body !== null ? Readable.fromWeb(body) : null,
            status_code,
            headers,
            cookies,
            status_message
        );
    }

    /**
     * @param {Readable | null} body
     * @param {number | null} status_code
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null}} cookies
     * @param {string | null} status_message
     * @returns {HttpResponse}
     */
    static new(body = null, status_code = null, headers = null, cookies = null, status_message = null) {
        return new this(
            body,
            status_code ?? STATUS_200,
            headers ?? [],
            cookies ?? [],
            status_message
        );
    }

    /**
     * @param {Readable | null} body
     * @param {number} status_code
     * @param {{[key: string]: string | string[]}} headers
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null}}} cookies
     * @param {string | null} status_message
     * @private
     */
    constructor(body, status_code, headers, cookies, status_message) {
        this.#body = body;
        this.#status_code = status_code;
        this.#headers = headers;
        this.#cookies = cookies;
        this.#status_message = status_message;
    }

    /**
     * @returns {Readable | null}
     */
    get body() {
        return this.#body;
    }

    /**
     * @returns {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null}}}
     */
    get cookies() {
        return this.#cookies;
    }

    /**
     * @returns {{[key: string]: string | string[]}}
     */
    get headers() {
        return this.#headers;
    }

    /**
     * @returns {number}
     */
    get status_code() {
        return this.#status_code;
    }

    /**
     * @returns {string | null}
     */
    get status_message() {
        return this.#status_message;
    }
}
