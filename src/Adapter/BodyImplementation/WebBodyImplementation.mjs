import { BodyImplementation } from "./BodyImplementation.mjs";
import { HEADER_CONTENT_TYPE } from "../Header/HEADER.mjs";
import { CONTENT_TYPE_CSS, CONTENT_TYPE_FORM_DATA_MULTIPART, CONTENT_TYPE_FORM_DATA_URL_ENCODED, CONTENT_TYPE_HTML, CONTENT_TYPE_JSON, CONTENT_TYPE_TEXT } from "../ContentType/CONTENT_TYPE.mjs";

/** @typedef {import("node:stream").Readable} Readable */

export class WebBodyImplementation extends BodyImplementation {
    /**
     * @type {string | null}
     */
    #content_type;
    /**
     * @type {Response}
     */
    #web_response;

    /**
     * @param {ArrayBuffer} array_buffer
     * @param {string | null} content_type
     * @returns {WebBodyImplementation}
     */
    static arrayBuffer(array_buffer, content_type = null) {
        return this.new(
            new Response(array_buffer, {
                headers: {
                    ...content_type !== null ? {
                        [HEADER_CONTENT_TYPE]: content_type
                    } : null
                }
            }),
            content_type
        );
    }

    /**
     * @param {Blob} blob
     * @param {string | null} content_type
     * @returns {WebBodyImplementation}
     */
    static blob(blob, content_type = null) {
        return this.webStream(
            blob.stream(),
            content_type ?? (blob.type !== "" ? blob.type : null)
        );
    }

    /**
     * @param {Buffer} buffer
     * @param {string | null} content_type
     * @returns {WebBodyImplementation}
     */
    static buffer(buffer, content_type = null) {
        return this.arrayBuffer(
            buffer.buffer,
            content_type
        );
    }

    /**
     * @param {string} css
     * @param {string | null} content_type
     * @returns {WebBodyImplementation}
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
     * @returns {WebBodyImplementation}
     */
    static formData(form_data, content_type = null) {
        return this.new(
            new Response(form_data, {
                headers: {
                    ...content_type !== null ? {
                        [HEADER_CONTENT_TYPE]: content_type
                    } : null
                }
            }),
            content_type
        );
    }

    /**
     * @param {string} html
     * @param {string | null} content_type
     * @returns {WebBodyImplementation}
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
     * @returns {WebBodyImplementation}
     */
    static json(json, content_type = null) {
        const _content_type = content_type ?? CONTENT_TYPE_JSON;

        const init = {
            headers: {
                [HEADER_CONTENT_TYPE]: _content_type
            }
        };

        return this.new(
            "json" in Response ? Response.json(json, init) : new Response(JSON.stringify(json), init),
            _content_type
        );
    }

    /**
     * @param {Readable | null} node_stream
     * @param {string | null} content_type
     * @returns {Promise<WebBodyImplementation>}
     */
    static async nodeStream(node_stream = null, content_type = null) {
        return this.webStream(
            node_stream !== null ? (await import("node:stream")).Readable.toWeb(node_stream) : null,
            content_type
        );
    }

    /**
     * @param {URLSearchParams} search_params
     * @param {string | null} content_type
     * @returns {WebBodyImplementation}
     */
    static searchParams(search_params, content_type = null) {
        return this.new(
            new Response(search_params, {
                headers: {
                    ...content_type !== null ? {
                        [HEADER_CONTENT_TYPE]: content_type
                    } : null
                }
            }),
            content_type
        );
    }

    /**
     * @param {string} string
     * @param {string | null} content_type
     * @returns {WebBodyImplementation}
     */
    static string(string, content_type = null) {
        return this.new(
            new Response(string, {
                headers: {
                    ...content_type !== null ? {
                        [HEADER_CONTENT_TYPE]: content_type
                    } : null
                }
            }),
            content_type
        );
    }

    /**
     * @param {string} text
     * @param {string | null} content_type
     * @returns {WebBodyImplementation}
     */
    static text(text, content_type = null) {
        return this.string(
            text,
            content_type ?? CONTENT_TYPE_TEXT
        );
    }

    /**
     * @param {ReadableStream | null} web_stream
     * @param {string | null} content_type
     * @returns {WebBodyImplementation}
     */
    static webStream(web_stream = null, content_type = null) {
        return this.new(
            new Response(web_stream, {
                headers: {
                    ...content_type !== null ? {
                        [HEADER_CONTENT_TYPE]: content_type
                    } : null
                }
            }),
            content_type
        );
    }

    /**
     * @param {Response} web_response
     * @param {string | null} content_type
     * @returns {WebBodyImplementation}
     */
    static new(web_response, content_type = null) {
        if (content_type !== null) {
            web_response.headers.set(HEADER_CONTENT_TYPE, content_type);
        }

        return new this(
            web_response,
            content_type ?? web_response.headers.get(HEADER_CONTENT_TYPE)
        );
    }

    /**
     * @param {Response} web_response
     * @param {string | null} content_type
     * @private
     */
    constructor(web_response, content_type) {
        super();

        this.#web_response = web_response;
        this.#content_type = content_type;
    }

    /**
     * @returns {Promise<ArrayBuffer>}
     */
    async arrayBuffer() {
        if (this.#web_response.body === null) {
            throw new Error("No stream");
        }

        return this.#web_response.arrayBuffer();
    }

    /**
     * @returns {Promise<Blob>}
     */
    async blob() {
        if (this.#web_response.body === null) {
            throw new Error("No stream");
        }

        const blob = await this.#web_response.blob();

        if (this.#content_type === null || blob.type === this.#content_type) {
            return blob;
        }

        return blob.slice(0, blob.size, this.#content_type);
    }

    /**
     * @returns {Promise<Buffer>}
     */
    async buffer() {
        if (this.#web_response.body === null) {
            throw new Error("No stream");
        }

        return Buffer.from(await this.arrayBuffer());
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
        if (this.#web_response.body === null) {
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
        if (this.#web_response.body === null) {
            throw new Error("No stream");
        }

        if (this.#content_type === null || !(this.#content_type.includes(CONTENT_TYPE_FORM_DATA_MULTIPART) || this.#content_type.includes(CONTENT_TYPE_FORM_DATA_URL_ENCODED))) {
            throw new Error(`Content type needs to be ${CONTENT_TYPE_FORM_DATA_MULTIPART} or ${CONTENT_TYPE_FORM_DATA_URL_ENCODED}, got ${this.#content_type}`);
        }

        return this.#web_response.formData();
    }

    /**
     * @returns {Promise<string>}
     */
    async html() {
        if (this.#web_response.body === null) {
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
        if (this.#web_response.body === null) {
            throw new Error("No stream");
        }

        if (!(this.#content_type?.includes(CONTENT_TYPE_JSON) ?? false)) {
            throw new Error(`Content type needs to be ${CONTENT_TYPE_JSON}, got ${this.#content_type}`);
        }

        return this.#web_response.json();
    }

    /**
     * @returns {Promise<Readable | null>}
     */
    async nodeStream() {
        return this.#web_response.body !== null ? (await import("node:stream")).Readable.fromWeb(this.#web_response.body) : null;
    }

    /**
     * @returns {Readable | ReadableStream | null}
     */
    stream() {
        return this.#web_response.body;
    }

    /**
     * @returns {Promise<string>}
     */
    async string() {
        if (this.#web_response.body === null) {
            throw new Error("No stream");
        }

        return this.#web_response.text();
    }

    /**
     * @returns {Promise<string>}
     */
    async text() {
        if (this.#web_response.body === null) {
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
        return this.#web_response.clone();
    }

    /**
     * @returns {Promise<ReadableStream | null>}
     */
    async webStream() {
        return this.stream();
    }
}
