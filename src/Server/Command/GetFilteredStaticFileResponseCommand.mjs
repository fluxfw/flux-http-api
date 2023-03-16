import { HttpServerResponse } from "../HttpServerResponse.mjs";
import { join } from "node:path/posix";
import { STATUS_CODE_400 } from "../../Status/STATUS_CODE.mjs";

/** @typedef {import("../HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */
/** @typedef {import("../Port/ServerService.mjs").ServerService} ServerService */

export class GetFilteredStaticFileResponseCommand {
    /**
     * @type {ServerService}
     */
    #server_service;

    /**
     * @param {ServerService} server_service
     * @returns {GetFilteredStaticFileResponseCommand}
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
     * @param {string} root
     * @param {string} path
     * @param {HttpServerRequest} request
     * @param {string | null} content_type
     * @param {{[key: string]: string | string[]} | null} headers
     * @returns {Promise<HttpServerResponse>}
     */
    async getFilteredStaticFileResponse(root, path, request, content_type = null, headers = null) {
        if (path.includes("..") || path.includes("//") || path.includes("\\")) {
            return HttpServerResponse.text(
                "Invalid path",
                STATUS_CODE_400
            );
        }

        return this.#server_service.getStaticFileResponse(
            join(root, path.startsWith("/") ? path.substring(1) : path),
            request,
            content_type,
            headers
        );
    }
}
