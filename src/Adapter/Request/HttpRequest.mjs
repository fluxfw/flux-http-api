import { HEADER_CONTENT_TYPE } from "../Header/HEADER.mjs";
import { Readable } from "node:stream";
import { arrayBuffer as bodyAsArrayBuffer, blob as bodyAsBlob, buffer as bodyAsBuffer, json as bodyAsJson, text as bodyAsString } from "node:stream/consumers";
import { CONTENT_TYPE_FORM_DATA_MULTIPART, CONTENT_TYPE_FORM_DATA_URL_ENCODED, CONTENT_TYPE_HTML, CONTENT_TYPE_JSON, CONTENT_TYPE_TEXT } from "../ContentType/CONTENT_TYPE.mjs";

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
     * @param {{[key: string]: string | string[]} | null} headers
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
            Object.entries(headers ?? {}).map(([
                key,
                values
            ]) => [
                    key,
                    Array.isArray(values) ? values : [
                        values
                    ]
                ]),
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
     * @returns {Promise<ArrayBuffer>}
     */
    async arrayBuffer() {
        if (this.#body === null) {
            throw new Error("No body");
        }

        return bodyAsArrayBuffer(this.#body);
    }

    /**
     * @returns {Promise<Blob>}
     */
    async blob() {
        if (this.#body === null) {
            throw new Error("No body");
        }

        const blob = await bodyAsBlob(this.#body);

        const content_type = this.header(
            HEADER_CONTENT_TYPE
        );

        if (content_type === null) {
            return blob;
        }

        return blob.slice(0, blob.size, content_type);
    }

    /**
     * @returns {Readable | null}
     */
    get body() {
        return this.#body;
    }

    /**
     * @returns {Promise<Buffer>}
     */
    async buffer() {
        if (this.#body === null) {
            throw new Error("No body");
        }

        return bodyAsBuffer(this.#body);
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
    cookie(key) {
        return this.#cookies.find(([
            _key
        ]) => _key === key)?.[1] ?? null;
    }

    /**
     * @returns {Promise<FormData>}
     */
    async formData() {
        if (this.#body === null) {
            throw new Error("No body");
        }

        const content_type = this.header(
            HEADER_CONTENT_TYPE
        );

        if (content_type === null || !(content_type.includes(CONTENT_TYPE_FORM_DATA_MULTIPART) || content_type.includes(CONTENT_TYPE_FORM_DATA_URL_ENCODED))) {
            throw new Error(`Header ${HEADER_CONTENT_TYPE} needs to be ${CONTENT_TYPE_FORM_DATA_MULTIPART} or ${CONTENT_TYPE_FORM_DATA_URL_ENCODED}, got ${content_type}`);
        }

        return this.webResponse().formData();
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
     * @returns {Promise<string>}
     */
    async html() {
        if (this.#body === null) {
            throw new Error("No body");
        }

        const content_type = this.header(
            HEADER_CONTENT_TYPE
        );

        if (!(content_type?.includes(CONTENT_TYPE_HTML) ?? false)) {
            throw new Error(`Header ${HEADER_CONTENT_TYPE} needs to be ${CONTENT_TYPE_HTML}, got ${content_type}`);
        }

        return this.string();
    }

    /**
     * @returns {Promise<*>}
     */
    async json() {
        if (this.#body === null) {
            throw new Error("No body");
        }

        const content_type = this.header(
            HEADER_CONTENT_TYPE
        );

        if (!(content_type?.includes(CONTENT_TYPE_JSON) ?? false)) {
            throw new Error(`Header ${HEADER_CONTENT_TYPE} needs to be ${CONTENT_TYPE_JSON}, got ${content_type}`);
        }

        return bodyAsJson(this.#body);
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
     * @returns {Promise<string>}
     */
    async string() {
        if (this.#body === null) {
            throw new Error("No body");
        }

        return bodyAsString(this.#body);
    }

    /**
     * @returns {Promise<string>}
     */
    async text() {
        if (this.#body === null) {
            throw new Error("No body");
        }

        const content_type = this.header(
            HEADER_CONTENT_TYPE
        );

        if (!(content_type?.includes(CONTENT_TYPE_TEXT) ?? false)) {
            throw new Error(`Header ${HEADER_CONTENT_TYPE} needs to be ${CONTENT_TYPE_TEXT}, got ${content_type}`);
        }

        return this.string();
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
     * @returns {Response}
     */
    webResponse() {
        const content_type = this.header(
            HEADER_CONTENT_TYPE
        );

        return new Response(this.webStream(), {
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
    webStream() {
        return this.#body !== null ? Readable.toWeb(this.#body) : null;
    }
}
