import { HEADER_CONTENT_TYPE } from "../Header/HEADER.mjs";
import { METHOD_GET } from "../Method/METHOD.mjs";
import { WebBodyImplementation } from "../BodyImplementation/WebBodyImplementation.mjs";

/** @typedef {import("../BodyImplementation/BodyImplementation.mjs").BodyImplementation} BodyImplementation */
/** @typedef {import("node:stream").Readable} Readable */

export class HttpClientRequest {
    /**
     * @type {boolean}
     */
    #assert_status_code_is_ok;
    /**
     * @type {BodyImplementation}
     */
    #body_implementation;
    /**
     * @type {boolean}
     */
    #follow_redirects;
    /**
     * @type {{[key: string]: string | string[]}}
     */
    #headers;
    /**
     * @type {string}
     */
    #method;
    /**
     * @type {string | null}
     */
    #server_certificate;
    /**
     * @type {URL}
     */
    #url;

    /**
     * @param {URL} url
     * @param {ArrayBuffer} array_buffer
     * @param {string | null} method
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {boolean | null} follow_redirects
     * @param {boolean | null} assert_status_code_is_ok
     * @param {string | null} server_certificate
     * @returns {HttpClientRequest}
     */
    static arrayBuffer(url, array_buffer, method = null, headers = null, follow_redirects = null, assert_status_code_is_ok = null, server_certificate = null) {
        return this.new(
            url,
            WebBodyImplementation.arrayBuffer(
                array_buffer,
                headers?.[HEADER_CONTENT_TYPE] ?? null
            ),
            method,
            headers,
            follow_redirects,
            assert_status_code_is_ok,
            server_certificate
        );
    }

    /**
     * @param {URL} url
     * @param {Blob} blob
     * @param {string | null} method
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {boolean | null} follow_redirects
     * @param {boolean | null} assert_status_code_is_ok
     * @param {string | null} server_certificate
     * @returns {HttpClientRequest}
     */
    static blob(url, blob, method = null, headers = null, follow_redirects = null, assert_status_code_is_ok = null, server_certificate = null) {
        return this.new(
            url,
            WebBodyImplementation.blob(
                blob,
                headers?.[HEADER_CONTENT_TYPE] ?? null
            ),
            method,
            headers,
            follow_redirects,
            assert_status_code_is_ok,
            server_certificate
        );
    }

    /**
     * @param {URL} url
     * @param {Buffer} buffer
     * @param {string | null} method
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {boolean | null} follow_redirects
     * @param {boolean | null} assert_status_code_is_ok
     * @param {string | null} server_certificate
     * @returns {HttpClientRequest}
     */
    static buffer(url, buffer, method = null, headers = null, follow_redirects = null, assert_status_code_is_ok = null, server_certificate = null) {
        return this.new(
            url,
            WebBodyImplementation.buffer(
                buffer,
                headers?.[HEADER_CONTENT_TYPE] ?? null
            ),
            method,
            headers,
            follow_redirects,
            assert_status_code_is_ok,
            server_certificate
        );
    }

    /**
     * @param {URL} url
     * @param {string} css
     * @param {string | null} method
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {boolean | null} follow_redirects
     * @param {boolean | null} assert_status_code_is_ok
     * @param {string | null} server_certificate
     * @returns {HttpClientRequest}
     */
    static css(url, css, method = null, headers = null, follow_redirects = null, assert_status_code_is_ok = null, server_certificate = null) {
        return this.new(
            url,
            WebBodyImplementation.css(
                css,
                headers?.[HEADER_CONTENT_TYPE] ?? null
            ),
            method,
            headers,
            follow_redirects,
            assert_status_code_is_ok,
            server_certificate
        );
    }

    /**
     * @param {URL} url
     * @param {FormData} form_data
     * @param {string | null} method
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {boolean | null} follow_redirects
     * @param {boolean | null} assert_status_code_is_ok
     * @param {string | null} server_certificate
     * @returns {HttpClientRequest}
     */
    static formData(url, form_data, method = null, headers = null, follow_redirects = null, assert_status_code_is_ok = null, server_certificate = null) {
        return this.new(
            url,
            WebBodyImplementation.formData(
                form_data,
                headers?.[HEADER_CONTENT_TYPE] ?? null
            ),
            method,
            headers,
            follow_redirects,
            assert_status_code_is_ok,
            server_certificate
        );
    }

    /**
     * @param {URL} url
     * @param {string} html
     * @param {string | null} method
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {boolean | null} follow_redirects
     * @param {boolean | null} assert_status_code_is_ok
     * @param {string | null} server_certificate
     * @returns {HttpClientRequest}
     */
    static html(url, html, method = null, headers = null, follow_redirects = null, assert_status_code_is_ok = null, server_certificate = null) {
        return this.new(
            url,
            WebBodyImplementation.html(
                html,
                headers?.[HEADER_CONTENT_TYPE] ?? null
            ),
            method,
            headers,
            follow_redirects,
            assert_status_code_is_ok,
            server_certificate
        );
    }

    /**
     * @param {URL} url
     * @param {*} json
     * @param {string | null} method
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {boolean | null} follow_redirects
     * @param {boolean | null} assert_status_code_is_ok
     * @param {string | null} server_certificate
     * @returns {HttpClientRequest}
     */
    static json(url, json, method = null, headers = null, follow_redirects = null, assert_status_code_is_ok = null, server_certificate = null) {
        return this.new(
            url,
            WebBodyImplementation.json(
                json,
                headers?.[HEADER_CONTENT_TYPE] ?? null
            ),
            method,
            headers,
            follow_redirects,
            assert_status_code_is_ok,
            server_certificate
        );
    }

    /**
     * @param {URL} url
     * @param {Readable | null} node_stream
     * @param {string | null} method
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {boolean | null} follow_redirects
     * @param {boolean | null} assert_status_code_is_ok
     * @param {string | null} server_certificate
     * @returns {Promise<HttpClientRequest>}
     */
    static async nodeStream(url, node_stream = null, method = null, headers = null, follow_redirects = null, assert_status_code_is_ok = null, server_certificate = null) {
        return this.new(
            url,
            await WebBodyImplementation.nodeStream(
                node_stream,
                headers?.[HEADER_CONTENT_TYPE] ?? null
            ),
            method,
            headers,
            follow_redirects,
            assert_status_code_is_ok,
            server_certificate
        );
    }

    /**
     * @param {URL} url
     * @param {string} string
     * @param {string | null} method
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {boolean | null} follow_redirects
     * @param {boolean | null} assert_status_code_is_ok
     * @param {string | null} server_certificate
     * @returns {HttpClientRequest}
     */
    static string(url, string, method = null, headers = null, follow_redirects = null, assert_status_code_is_ok = null, server_certificate = null) {
        return this.new(
            url,
            WebBodyImplementation.string(
                string,
                headers?.[HEADER_CONTENT_TYPE] ?? null
            ),
            method,
            headers,
            follow_redirects,
            assert_status_code_is_ok,
            server_certificate
        );
    }

    /**
     * @param {URL} url
     * @param {string} text
     * @param {string | null} method
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {boolean | null} follow_redirects
     * @param {boolean | null} assert_status_code_is_ok
     * @param {string | null} server_certificate
     * @returns {HttpClientRequest}
     */
    static text(url, text, method = null, headers = null, follow_redirects = null, assert_status_code_is_ok = null, server_certificate = null) {
        return this.new(
            url,
            WebBodyImplementation.text(
                text,
                headers?.[HEADER_CONTENT_TYPE] ?? null
            ),
            method,
            headers,
            follow_redirects,
            assert_status_code_is_ok,
            server_certificate
        );
    }

    /**
     * @param {URL} url
     * @param {Response} web_response
     * @param {string | null} method
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {boolean | null} follow_redirects
     * @param {boolean | null} assert_status_code_is_ok
     * @param {string | null} server_certificate
     * @returns {HttpClientRequest}
     */
    static webResponse(url, web_response, method = null, headers = null, follow_redirects = null, assert_status_code_is_ok = null, server_certificate = null) {
        return this.new(
            url,
            WebBodyImplementation.new(
                web_response,
                headers?.[HEADER_CONTENT_TYPE] ?? null
            ),
            method,
            {
                ...Object.fromEntries(web_response.headers),
                ...headers
            },
            follow_redirects,
            assert_status_code_is_ok,
            server_certificate
        );
    }

    /**
     * @param {URL} url
     * @param {ReadableStream | null} web_stream
     * @param {string | null} method
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {boolean | null} follow_redirects
     * @param {boolean | null} assert_status_code_is_ok
     * @param {string | null} server_certificate
     * @returns {HttpClientRequest}
     */
    static webStream(url, web_stream = null, method = null, headers = null, follow_redirects = null, assert_status_code_is_ok = null, server_certificate = null) {
        return this.new(
            url,
            WebBodyImplementation.webStream(
                web_stream,
                headers?.[HEADER_CONTENT_TYPE] ?? null
            ),
            method,
            headers,
            follow_redirects,
            assert_status_code_is_ok,
            server_certificate
        );
    }

    /**
     * @param {URL} url
     * @param {BodyImplementation | null} body_implementation
     * @param {string | null} method
     * @param {{[key: string]: string | string[]} | null} headers
     * @param {boolean | null} follow_redirects
     * @param {boolean | null} assert_status_code_is_ok
     * @param {string | null} server_certificate
     * @returns {HttpClientRequest}
     */
    static new(url, body_implementation = null, method = null, headers = null, follow_redirects = null, assert_status_code_is_ok = null, server_certificate = null) {
        return new this(
            url,
            body_implementation ?? WebBodyImplementation.webStream(),
            method ?? METHOD_GET,
            headers ?? {},
            follow_redirects ?? true,
            assert_status_code_is_ok ?? true,
            server_certificate
        );
    }

    /**
     * @param {URL} url
     * @param {BodyImplementation} body_implementation
     * @param {string} method
     * @param {{[key: string]: string | string[]}} headers
     * @param {boolean} follow_redirects
     * @param {boolean} assert_status_code_is_ok
     * @param {string | null} server_certificate
     * @private
     */
    constructor(url, body_implementation, method, headers, follow_redirects, assert_status_code_is_ok, server_certificate) {
        this.#url = url;
        this.#body_implementation = body_implementation;
        this.#method = method;
        this.#headers = headers;
        this.#follow_redirects = follow_redirects;
        this.#assert_status_code_is_ok = assert_status_code_is_ok;
        this.#server_certificate = server_certificate;
    }

    /**
     * @returns {boolean}
     */
    get assert_status_code_is_ok() {
        return this.#assert_status_code_is_ok;
    }

    /**
     * @returns {BodyImplementation}
     */
    get body() {
        return this.#body_implementation;
    }

    /**
     * @returns {boolean}
     */
    get follow_redirects() {
        return this.#follow_redirects;
    }

    /**
     * @returns {{[key: string]: string[]}}
     */
    get headers() {
        const content_type = this.#body_implementation.contentType();

        return {
            ...content_type !== null ? {
                [HEADER_CONTENT_TYPE]: content_type
            } : null,
            ...structuredClone(this.#headers)
        };
    }

    /**
     * @returns {string}
     */
    get method() {
        return this.#method;
    }

    /**
     * @returns {string | null}
     */
    get server_certificate() {
        return this.#server_certificate;
    }

    /**
     * @returns {URL}
     */
    get url() {
        return this.#url;
    }
}
