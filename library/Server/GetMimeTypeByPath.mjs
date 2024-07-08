import { extname } from "node:path";

/** @typedef {import("../Http.mjs").Http} Http */

export class GetMimeTypeByPath {
    /**
     * @type {Http}
     */
    #http;

    /**
     * @param {Http} http
     * @returns {Promise<GetMimeTypeByPath>}
     */
    static async new(http) {
        return new this(
            http
        );
    }

    /**
     * @param {Http} http
     * @private
     */
    constructor(http) {
        this.#http = http;
    }

    /**
     * @param {string} path
     * @returns {Promise<string | null>}
     */
    async getMimeTypeByPath(path) {
        return this.#http.getMimeTypeByExtension(
            extname(path).substring(1)
        );
    }
}
