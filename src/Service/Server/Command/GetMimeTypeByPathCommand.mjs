import { extname } from "node:path/posix";

/** @typedef {import("../Port/ServerService.mjs").ServerService} ServerService */

export class GetMimeTypeByPathCommand {
    /**
     * @type {ServerService}
     */
    #server_service;

    /**
     * @param {ServerService} server_service
     * @returns {GetMimeTypeByPathCommand}
     */
    static new(server_service) {
        return new this(
            server_service
        );
    }

    /**
     * @param {ServerService} server_service
     * @private
     */
    constructor(server_service) {
        this.#server_service = server_service;
    }

    /**
     * @param {string} path
     * @returns {Promise<string | null>}
     */
    async getMimeTypeByPath(path) {
        return this.#server_service.getMimeTypeByExtension(
            extname(path).substring(1)
        );
    }
}
