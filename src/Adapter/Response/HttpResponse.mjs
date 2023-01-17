import { Readable } from "node:stream";
import { CONTENT_TYPE_HTML, CONTENT_TYPE_JSON, CONTENT_TYPE_TEXT } from "../ContentType/CONTENT_TYPE.mjs";
import { HEADER_CONTENT_TYPE, HEADER_LOCATION } from "../Header/HEADER.mjs";
import { STATUS_200, STATUS_302 } from "../Status/STATUS.mjs";

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
    static newFromArrayBuffer(array_buffer, status_code = null, headers = null, cookies = null, status_message = null) {
        return this.newFromBuffer(
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
     * @returns {Promise<HttpResponse>}
     */
    static async newFromBlob(blob, status_code = null, headers = null, cookies = null, status_message = null) {
        return this.newFromArrayBuffer(
            await blob.arrayBuffer(),
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
    static newFromBuffer(buffer, status_code = null, headers = null, cookies = null, status_message = null) {
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
    static newFromHtml(html, status_code = null, headers = null, cookies = null, status_message = null) {
        return this.newFromString(
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
     * @param {*} data
     * @param {number | null} status_code
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null}} cookies
     * @param {string | null} status_message
     * @returns {HttpResponse}
     */
    static newFromJson(data, status_code = null, headers = null, cookies = null, status_message = null) {
        return this.newFromString(
            JSON.stringify(data),
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
     * @param {string} url
     * @param {number | null} status_code
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null}} cookies
     * @param {string | null} status_message
     * @returns {HttpResponse}
     */
    static newFromRedirect(url, status_code = null, headers = null, cookies = null, status_message = null) {
        return this.new(
            null,
            status_code ?? STATUS_302,
            {
                [HEADER_LOCATION]: url,
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
    static newFromString(string, status_code = null, headers = null, cookies = null, status_message = null) {
        return this.newFromBuffer(
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
    static newFromText(text, status_code = null, headers = null, cookies = null, status_message = null) {
        return this.newFromString(
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
    static newFromWebResponse(response) {
        return this.newFromWebStream(
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
    static newFromWebStream(body = null, status_code = null, headers = null, cookies = null, status_message = null) {
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
