import { extname } from "node:path/posix";

/** @typedef {import("../FluxHttpApi.mjs").FluxHttpApi} FluxHttpApi */

export class GetMimeTypeByPath {
    /**
     * @type {FluxHttpApi}
     */
    #flux_http_api;

    /**
     * @param {FluxHttpApi} flux_http_api
     * @returns {GetMimeTypeByPath}
     */
    static new(flux_http_api) {
        return new this(
            flux_http_api
        );
    }

    /**
     * @param {FluxHttpApi} flux_http_api
     * @private
     */
    constructor(flux_http_api) {
        this.#flux_http_api = flux_http_api;
    }

    /**
     * @param {string} path
     * @returns {Promise<string | null>}
     */
    async getMimeTypeByPath(path) {
        return this.#flux_http_api.getMimeTypeByExtension(
            extname(path).substring(1)
        );
    }
}
