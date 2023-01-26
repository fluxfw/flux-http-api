import { BodyImplementation } from "./BodyImplementation.mjs";
import { HEADER_CONTENT_TYPE } from "../Header/HEADER.mjs";
import { Readable } from "node:stream";
import { arrayBuffer as bodyAsArrayBuffer, blob as bodyAsBlob, buffer as bodyAsBuffer, json as bodyAsJson, text as bodyAsString } from "node:stream/consumers";
import { CONTENT_TYPE_CSS, CONTENT_TYPE_FORM_DATA_MULTIPART, CONTENT_TYPE_FORM_DATA_URL_ENCODED, CONTENT_TYPE_HTML, CONTENT_TYPE_JSON, CONTENT_TYPE_TEXT } from "../ContentType/CONTENT_TYPE.mjs";

export class NodeBodyImplementation extends BodyImplementation {
    /**
     * @type {string | null}
     */
    #content_type;
    /**
     * @type {Readable | ReadableStream | null}
     */
    #stream;

    /**
     * @param {ArrayBuffer} array_buffer
     * @param {string | null} content_type
     * @returns {NodeBodyImplementation}
     */
    static arrayBuffer(array_buffer, content_type = null) {
        return this.buffer(
            Buffer.from(array_buffer),
            content_type
        );
    }

    /**
     * @param {Blob} blob
     * @param {string | null} content_type
     * @returns {NodeBodyImplementation}
     */
    static blob(blob, content_type = null) {
        return this.new(
            blob.stream(),
            content_type ?? (blob.type !== "" ? blob.type : null)
        );
    }

    /**
     * @param {Buffer} buffer
     * @param {string | null} content_type
     * @returns {NodeBodyImplementation}
     */
    static buffer(buffer, content_type = null) {
        return this.new(
            Readable.from(buffer),
            content_type
        );
    }

    /**
     * @param {string} css
     * @param {string | null} content_type
     * @returns {NodeBodyImplementation}
     */
    static css(css, content_type = null) {
        return this.string(
            css,
            content_type ?? CONTENT_TYPE_CSS
        );
    }

    /**
     * @param {FormData} form_data
     * @param {string | null} content_type
     * @returns {NodeBodyImplementation}
     */
    static formData(form_data, content_type = null) {
        return this.webResponse(
            new Response(form_data),
            content_type
        );
    }

    /**
     * @param {string} html
     * @param {string | null} content_type
     * @returns {NodeBodyImplementation}
     */
    static html(html, content_type = null) {
        return this.string(
            html,
            content_type ?? CONTENT_TYPE_HTML
        );
    }

    /**
     * @param {*} json
     * @param {string | null} content_type
     * @returns {NodeBodyImplementation}
     */
    static json(json, content_type = null) {
        return this.string(
            JSON.stringify(json),
            content_type ?? CONTENT_TYPE_JSON
        );
    }

    /**
     * @param {string} string
     * @param {string | null} content_type
     * @returns {NodeBodyImplementation}
     */
    static string(string, content_type = null) {
        return this.new(
            Readable.from(string),
            content_type
        );
    }

    /**
     * @param {string} text
     * @param {string | null} content_type
     * @returns {NodeBodyImplementation}
     */
    static text(text, content_type = null) {
        return this.string(
            text,
            content_type ?? CONTENT_TYPE_TEXT
        );
    }

    /**
     * @param {Response} web_response
     * @param {string | null} content_type
     * @returns {NodeBodyImplementation}
     */
    static webResponse(web_response, content_type = null) {
        return this.new(
            web_response.body,
            content_type ?? web_response.headers.get(HEADER_CONTENT_TYPE)
        );
    }

    /**
     * @param {Readable | ReadableStream | null} stream
     * @param {string | null} content_type
     * @returns {NodeBodyImplementation}
     */
    static new(stream = null, content_type = null) {
        return new this(
            stream,
            content_type
        );
    }

    /**
     * @param {Readable | ReadableStream | null} stream
     * @param {string | null} content_type
     * @private
     */
    constructor(stream, content_type) {
        super();

        this.#stream = stream;
        this.#content_type = content_type;
    }

    /**
     * @returns {Promise<ArrayBuffer>}
     */
    async arrayBuffer() {
        if (this.#stream === null) {
            throw new Error("No stream");
        }

        return bodyAsArrayBuffer(this.#stream);
    }

    /**
     * @returns {Promise<Blob>}
     */
    async blob() {
        if (this.#stream === null) {
            throw new Error("No stream");
        }

        const blob = await bodyAsBlob(this.#stream);

        if (this.#content_type === null || blob.type === this.#content_type) {
            return blob;
        }

        return blob.slice(0, blob.size, this.#content_type);
    }

    /**
     * @returns {Promise<Buffer>}
     */
    async buffer() {
        if (this.#stream === null) {
            throw new Error("No stream");
        }

        return bodyAsBuffer(this.#stream);
    }

    /**
     * @returns {string | null}
     */
    contentType() {
        return this.#content_type;
    }

    /**
     * @returns {Promise<string>}
     */
    async css() {
        if (this.#stream === null) {
            throw new Error("No stream");
        }

        if (!(this.#content_type?.includes(CONTENT_TYPE_CSS) ?? false)) {
            throw new Error(`Content type needs to be ${CONTENT_TYPE_CSS}, got ${this.#content_type}`);
        }

        return this.string();
    }

    /**
     * @returns {Promise<FormData>}
     */
    async formData() {
        if (this.#stream === null) {
            throw new Error("No stream");
        }

        if (this.#content_type === null || !(this.#content_type.includes(CONTENT_TYPE_FORM_DATA_MULTIPART) || this.#content_type.includes(CONTENT_TYPE_FORM_DATA_URL_ENCODED))) {
            throw new Error(`Content type needs to be ${CONTENT_TYPE_FORM_DATA_MULTIPART} or ${CONTENT_TYPE_FORM_DATA_URL_ENCODED}, got ${this.#content_type}`);
        }

        return (await this.webResponse()).formData();
    }

    /**
     * @returns {Promise<string>}
     */
    async html() {
        if (this.#stream === null) {
            throw new Error("No stream");
        }

        if (!(this.#content_type?.includes(CONTENT_TYPE_HTML) ?? false)) {
            throw new Error(`Content type needs to be ${CONTENT_TYPE_HTML}, got ${this.#content_type}`);
        }

        return this.string();
    }

    /**
     * @returns {Promise<*>}
     */
    async json() {
        if (this.#stream === null) {
            throw new Error("No stream");
        }

        if (!(this.#content_type?.includes(CONTENT_TYPE_JSON) ?? false)) {
            throw new Error(`Content type needs to be ${CONTENT_TYPE_JSON}, got ${this.#content_type}`);
        }

        return bodyAsJson(this.#stream);
    }

    /**
     * @returns {Promise<Readable | null>}
     */
    async nodeStream() {
        return this.#stream !== null ? !(this.#stream instanceof ReadableStream) ? this.#stream : Readable.fromWeb(this.#stream) : null;
    }

    /**
     * @returns {Promise<Readable | ReadableStream | null>}
     */
    async stream() {
        return this.#stream;
    }

    /**
     * @returns {Promise<string>}
     */
    async string() {
        if (this.#stream === null) {
            throw new Error("No stream");
        }

        return bodyAsString(this.#stream);
    }

    /**
     * @returns {Promise<string>}
     */
    async text() {
        if (this.#stream === null) {
            throw new Error("No stream");
        }

        if (!(this.#content_type?.includes(CONTENT_TYPE_TEXT) ?? false)) {
            throw new Error(`Content type needs to be ${CONTENT_TYPE_TEXT}, got ${this.#content_type}`);
        }

        return this.string();
    }

    /**
     * @returns {Promise<Response>}
     */
    async webResponse() {
        return new Response(await this.webStream(), {
            headers: {
                ...this.#content_type !== null ? {
                    [HEADER_CONTENT_TYPE]: this.#content_type
                } : null
            }
        });
    }

    /**
     * @returns {Promise<ReadableStream | null>}
     */
    async webStream() {
        return this.#stream !== null ? this.#stream instanceof ReadableStream ? this.#stream : Readable.toWeb(this.#stream) : null;
    }
}
