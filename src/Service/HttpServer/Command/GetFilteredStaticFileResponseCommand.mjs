import { join } from "node:path/posix";
import { STATUS_400 } from "../../../Adapter/Status/STATUS.mjs";

/** @typedef {import("../../../Adapter/Request/HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */
/** @typedef {import("../../../Adapter/Response/HttpServerResponse.mjs").HttpServerResponse} HttpServerResponse */
/** @typedef {import("../Port/HttpServerService.mjs").HttpServerService} HttpServerService */

export class GetFilteredStaticFileResponseCommand {
    /**
     * @type {HttpServerService}
     */
    #http_server_service;

    /**
     * @param {HttpServerService} http_server_service
     * @returns {GetFilteredStaticFileResponseCommand}
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
     * @param {string} root
     * @param {string} path
     * @param {HttpServerRequest} request
     * @param {string | null} mime_type
     * @returns {Promise<HttpServerResponse>}
     */
    async getFilteredStaticFileResponse(root, path, request, mime_type = null) {
        if (path.includes("..") || path.includes("//") || path.includes("\\")) {
            return new Response(null, {
                status: STATUS_400
            });
        }

        return this.#http_server_service.getStaticFileResponse(
            join(root, path.startsWith("/") ? path.substring(1) : path),
            request,
            mime_type
        );
    }
}
