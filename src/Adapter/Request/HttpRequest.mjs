import { HEADER_CONTENT_TYPE } from "../Header/HEADER.mjs";
import { Readable } from "node:stream";
import { arrayBuffer as bodyToArrayBuffer, blob as bodyToBlob, buffer as bodyToBuffer, json as bodyToJson, text as bodyToString } from "node:stream/consumers";
import { CONTENT_TYPE_FORM_DATA, CONTENT_TYPE_FORM_DATA_2, CONTENT_TYPE_HTML, CONTENT_TYPE_JSON, CONTENT_TYPE_TEXT } from "../ContentType/CONTENT_TYPE.mjs";

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
     * @returns {Promise<ArrayBuffer>}
     */
    async bodyAsArrayBuffer() {
        if (this.#body === null) {
            throw new Error("No body");
        }

        return bodyToArrayBuffer(this.#body);
    }

    /**
     * @returns {Promise<Blob>}
     */
    async bodyAsBlob() {
        if (this.#body === null) {
            throw new Error("No body");
        }

        const blob = await bodyToBlob(this.#body);

        const content_type = this.getHeader(
            HEADER_CONTENT_TYPE
        );

        if (content_type === null) {
            return blob;
        }

        return blob.slice(0, blob.size, content_type);
    }

    /**
     * @returns {Promise<Buffer>}
     */
    async bodyAsBuffer() {
        if (this.#body === null) {
            throw new Error("No body");
        }

        return bodyToBuffer(this.#body);
    }

    /**
     * @returns {Promise<FormData>}
     */
    async bodyAsFormData() {
        if (this.#body === null) {
            throw new Error("No body");
        }

        const content_type = this.getHeader(
            HEADER_CONTENT_TYPE
        );

        if (content_type === null || !(content_type.includes(CONTENT_TYPE_FORM_DATA) || content_type.includes(CONTENT_TYPE_FORM_DATA_2))) {
            throw new Error(`Header ${HEADER_CONTENT_TYPE} needs to be ${CONTENT_TYPE_FORM_DATA} or ${CONTENT_TYPE_FORM_DATA_2}, got ${content_type}`);
        }

        return this.bodyAsWebResponse().formData();
    }

    /**
     * @returns {Promise<string>}
     */
    async bodyAsHtml() {
        if (this.#body === null) {
            throw new Error("No body");
        }

        const content_type = this.getHeader(
            HEADER_CONTENT_TYPE
        );

        if (!(content_type?.includes(CONTENT_TYPE_HTML) ?? false)) {
            throw new Error(`Header ${HEADER_CONTENT_TYPE} needs to be ${CONTENT_TYPE_HTML}, got ${content_type}`);
        }

        return this.bodyAsString();
    }

    /**
     * @returns {Promise<*>}
     */
    async bodyAsJson() {
        if (this.#body === null) {
            throw new Error("No body");
        }

        const content_type = this.getHeader(
            HEADER_CONTENT_TYPE
        );

        if (!(content_type?.includes(CONTENT_TYPE_JSON) ?? false)) {
            throw new Error(`Header ${HEADER_CONTENT_TYPE} needs to be ${CONTENT_TYPE_JSON}, got ${content_type}`);
        }

        return bodyToJson(this.#body);
    }

    /**
     * @returns {Promise<string>}
     */
    async bodyAsString() {
        if (this.#body === null) {
            throw new Error("No body");
        }

        return bodyToString(this.#body);
    }

    /**
     * @returns {Promise<string>}
     */
    async bodyAsText() {
        if (this.#body === null) {
            throw new Error("No body");
        }

        const content_type = this.getHeader(
            HEADER_CONTENT_TYPE
        );

        if (!(content_type?.includes(CONTENT_TYPE_TEXT) ?? false)) {
            throw new Error(`Header ${HEADER_CONTENT_TYPE} needs to be ${CONTENT_TYPE_TEXT}, got ${content_type}`);
        }

        return this.bodyAsString();
    }

    /**
     * @returns {Response}
     */
    bodyAsWebResponse() {
        const content_type = this.getHeader(
            HEADER_CONTENT_TYPE
        );

        return new Response(this.bodyAsWebStream(), {
            headers: {
                ...content_type !== null ? {
                    [HEADER_CONTENT_TYPE]: content_type
                } : null
            }
        });
    }

    /**
     * @returns {ReadableStream | null}
     */
    bodyAsWebStream() {
        return this.#body !== null ? Readable.toWeb(this.#body) : null;
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
}
