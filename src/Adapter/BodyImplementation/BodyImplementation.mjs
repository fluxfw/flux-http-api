/** @typedef {import("node:stream").Readable} Readable */

/**
 * @interface
 */
export class BodyImplementation {
    /**
     * @returns {Promise<ArrayBuffer>}
     * @abstract
     */
    arrayBuffer() { }

    /**
     * @returns {Promise<Blob>}
     * @abstract
     */
    blob() { }

    /**
     * @returns {Promise<Buffer>}
     * @abstract
     */
    buffer() { }

    /**
     * @returns {string | null}
     * @abstract
     */
    contentType() { }

    /**
     * @returns {Promise<string>}
     * @abstract
     */
    css() { }

    /**
     * @returns {Promise<FormData>}
     * @abstract
     */
    formData() { }

    /**
     * @returns {Promise<string>}
     * @abstract
     */
    html() { }

    /**
     * @returns {Promise<*>}
     * @abstract
     */
    json() { }

    /**
     * @returns {Promise<Readable | null>}
     * @abstract
     */
    nodeStream() { }

    /**
     * @returns {Promise<Readable | ReadableStream | null>}
     * @abstract
     */
    stream() { }

    /**
     * @returns {Promise<string>}
     * @abstract
     */
    string() { }

    /**
     * @returns {Promise<string>}
     * @abstract
     */
    text() { }

    /**
     * @returns {Promise<Response>}
     * @abstract
     */
    webResponse() { }

    /**
     * @returns {Promise<ReadableStream | null>}
     * @abstract
     */
    webStream() { }
}
