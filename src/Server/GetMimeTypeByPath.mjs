import { extname } from "node:path/posix";

/** @typedef {import("../FluxHttp.mjs").FluxHttp} FluxHttp */

export class GetMimeTypeByPath {
    /**
     * @type {FluxHttp}
     */
    #flux_http;

    /**
     * @param {FluxHttp} flux_http
     * @returns {GetMimeTypeByPath}
     */
    static new(flux_http) {
        return new this(
            flux_http
        );
    }

    /**
     * @param {FluxHttp} flux_http
     * @private
     */
    constructor(flux_http) {
        this.#flux_http = flux_http;
    }

    /**
     * @param {string} path
     * @returns {Promise<string | null>}
     */
    async getMimeTypeByPath(path) {
        return this.#flux_http.getMimeTypeByExtension(
            extname(path).substring(1)
        );
    }
}
