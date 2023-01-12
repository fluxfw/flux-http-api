import { extname } from "node:path/posix";

/** @typedef {import("../Port/HttpServerService.mjs").HttpServerService} HttpServerService */

export class GetMimeTypeByPathCommand {
    /**
     * @type {HttpServerService}
     */
    #http_server_service;

    /**
     * @param {HttpServerService} http_server_service
     * @returns {GetMimeTypeByPathCommand}
     */
    static new(http_server_service) {
        return new this(
            http_server_service
        );
    }

    /**
     * @param {HttpServerService} http_server_service
     * @private
     */
    constructor(http_server_service) {
        this.#http_server_service = http_server_service;
    }

    /**
     * @param {string} path
     * @returns {Promise<string | null>}
     */
    async getMimeTypeByPath(path) {
        return this.#http_server_service.getMimeTypeByExtension(
            extname(path).substring(1)
        );
    }
}
