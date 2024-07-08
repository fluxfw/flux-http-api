import { Body } from "./Body.mjs";
import { STATUS_CODE_MESSAGE } from "../Status/STATUS_CODE_MESSAGE.mjs";
import { HEADER_CONTENT_TYPE, HEADER_LOCATION } from "../Header/HEADER.mjs";
import { STATUS_CODE_200, STATUS_CODE_302 } from "../Status/STATUS_CODE.mjs";

/** @typedef {import("../Range/RangeValue.mjs").RangeValue} RangeValue */
/** @typedef {import("node:stream").Readable} Readable */

export class HttpServerResponse {
    /**
     * @type {Body}
     */
    #body;
    /**
     * @type {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null}}
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
     * @type {string}
     */
    #status_message;

    /**
     * @param {ArrayBuffer} array_buffer
     * @param {number | null} status_code
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null} | null} cookies
     * @param {string | null} status_message
     * @returns {HttpServerResponse}
     */
    static arrayBuffer(array_buffer, status_code = null, headers = null, cookies = null, status_message = null) {
        return this.new(
            Body.arrayBuffer(
                array_buffer,
                headers?.[HEADER_CONTENT_TYPE] ?? null
            ),
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
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null} | null} cookies
     * @param {string | null} status_message
     * @returns {HttpServerResponse}
     */
    static blob(blob, status_code = null, headers = null, cookies = null, status_message = null) {
        return this.new(
            Body.blob(
                blob,
                headers?.[HEADER_CONTENT_TYPE] ?? null
            ),
            status_code,
            headers,
            cookies,
            status_message
        );
    }

    /**
     * @param {Buffer} buffer
     * @param {number | null} status_code
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null} | null} cookies
     * @param {string | null} status_message
     * @returns {HttpServerResponse}
     */
    static buffer(buffer, status_code = null, headers = null, cookies = null, status_message = null) {
        return this.new(
            Body.buffer(
                buffer,
                headers?.[HEADER_CONTENT_TYPE] ?? null
            ),
            status_code,
            headers,
            cookies,
            status_message
        );
    }

    /**
     * @param {string} css
     * @param {number | null} status_code
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null} | null} cookies
     * @param {string | null} status_message
     * @returns {HttpServerResponse}
     */
    static css(css, status_code = null, headers = null, cookies = null, status_message = null) {
        return this.new(
            Body.css(
                css,
                headers?.[HEADER_CONTENT_TYPE] ?? null
            ),
            status_code,
            headers,
            cookies,
            status_message
        );
    }

    /**
     * @param {FormData} form_data
     * @param {number | null} status_code
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null} | null} cookies
     * @param {string | null} status_message
     * @returns {HttpServerResponse}
     */
    static formData(form_data, status_code = null, headers = null, cookies = null, status_message = null) {
        return this.new(
            Body.formData(
                form_data,
                headers?.[HEADER_CONTENT_TYPE] ?? null
            ),
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
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null} | null} cookies
     * @param {string | null} status_message
     * @returns {HttpServerResponse}
     */
    static html(html, status_code = null, headers = null, cookies = null, status_message = null) {
        return this.new(
            Body.html(
                html,
                headers?.[HEADER_CONTENT_TYPE] ?? null
            ),
            status_code,
            headers,
            cookies,
            status_message
        );
    }

    /**
     * @param {*} json
     * @param {number | null} status_code
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null} | null} cookies
     * @param {string | null} status_message
     * @returns {HttpServerResponse}
     */
    static json(json, status_code = null, headers = null, cookies = null, status_message = null) {
        return this.new(
            Body.json(
                json,
                headers?.[HEADER_CONTENT_TYPE] ?? null
            ),
            status_code,
            headers,
            cookies,
            status_message
        );
    }

    /**
     * @param {string} location
     * @param {number | null} status_code
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null} | null} cookies
     * @param {string | null} status_message
     * @returns {HttpServerResponse}
     */
    static redirect(location, status_code = null, headers = null, cookies = null, status_message = null) {
        return this.new(
            null,
            status_code ?? STATUS_CODE_302,
            {
                [HEADER_LOCATION]: location,
                ...headers
            },
            cookies,
            status_message
        );
    }

    /**
     * @param {Readable | ReadableStream | null} stream
     * @param {number | null} status_code
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null} | null} cookies
     * @param {string | null} status_message
     * @returns {HttpServerResponse}
     */
    static stream(stream = null, status_code = null, headers = null, cookies = null, status_message = null) {
        return this.new(
            Body.new(
                stream,
                headers?.[HEADER_CONTENT_TYPE] ?? null
            ),
            status_code,
            headers,
            cookies,
            status_message
        );
    }

    /**
     * @param {string} string
     * @param {number | null} status_code
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null} | null} cookies
     * @param {string | null} status_message
     * @returns {HttpServerResponse}
     */
    static string(string, status_code = null, headers = null, cookies = null, status_message = null) {
        return this.new(
            Body.string(
                string,
                headers?.[HEADER_CONTENT_TYPE] ?? null
            ),
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
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null} | null} cookies
     * @param {string | null} status_message
     * @returns {HttpServerResponse}
     */
    static text(text, status_code = null, headers = null, cookies = null, status_message = null) {
        return this.new(
            Body.text(
                text,
                headers?.[HEADER_CONTENT_TYPE] ?? null
            ),
            status_code,
            headers,
            cookies,
            status_message
        );
    }

    /**
     * @param {URLSearchParams} url_search_params
     * @param {number | null} status_code
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null} | null} cookies
     * @param {string | null} status_message
     * @returns {HttpServerResponse}
     */
    static urlSearchParams(url_search_params, status_code = null, headers = null, cookies = null, status_message = null) {
        return this.new(
            Body.urlSearchParams(
                url_search_params,
                headers?.[HEADER_CONTENT_TYPE] ?? null
            ),
            status_code,
            headers,
            cookies,
            status_message
        );
    }

    /**
     * @param {Response} web_response
     * @param {number | null} status_code
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null} | null} cookies
     * @param {string | null} status_message
     * @returns {HttpServerResponse}
     */
    static webResponse(web_response, status_code = null, headers = null, cookies = null, status_message = null) {
        return this.new(
            Body.webResponse(
                web_response,
                headers?.[HEADER_CONTENT_TYPE] ?? null
            ),
            status_code ?? web_response.status,
            {
                ...Object.fromEntries(web_response.headers),
                ...headers
            },
            cookies,
            status_message ?? web_response.statusText
        );
    }

    /**
     * @param {Body | null} body
     * @param {number | null} status_code
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null} | null} cookies
     * @param {string | null} status_message
     * @returns {HttpServerResponse}
     */
    static new(body = null, status_code = null, headers = null, cookies = null, status_message = null) {
        const _status_code = status_code ?? STATUS_CODE_200;

        return new this(
            body ?? Body.new(),
            _status_code,
            headers ?? {},
            cookies ?? {},
            status_message ?? STATUS_CODE_MESSAGE[_status_code] ?? ""
        );
    }

    /**
     * @param {Body} body
     * @param {number} status_code
     * @param {{[key: string]: string | string[]}} headers
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null}} cookies
     * @param {string} status_message
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
     * @returns {Body}
     */
    get body() {
        return this.#body;
    }

    /**
     * @returns {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null}}
     */
    get cookies() {
        return this.#cookies;
    }

    /**
     * @returns {{[key: string]: string | string[]}}
     */
    get headers() {
        const content_type = this.#body.contentType();

        return {
            ...content_type !== null ? {
                [HEADER_CONTENT_TYPE]: content_type
            } : null,
            ...structuredClone(this.#headers)
        };
    }

    /**
     * @returns {number}
     */
    get status_code() {
        return this.#status_code;
    }

    /**
     * @returns {string}
     */
    get status_message() {
        return this.#status_message;
    }
}
