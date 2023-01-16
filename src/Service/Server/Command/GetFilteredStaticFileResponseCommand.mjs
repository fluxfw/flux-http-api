import { HttpResponse } from "../../../Adapter/Response/HttpResponse.mjs";
import { join } from "node:path/posix";
import { STATUS_400 } from "../../../Adapter/Status/STATUS.mjs";

/** @typedef {import("../../../Adapter/Request/HttpRequest.mjs").HttpRequest} HttpRequest */
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
     * @param {HttpRequest} request
     * @param {string | null} mime_type
     * @returns {Promise<HttpResponse>}
     */
    async getFilteredStaticFileResponse(root, path, request, mime_type = null) {
        if (path.includes("..") || path.includes("//") || path.includes("\\")) {
            return HttpResponse.new(
                null,
                STATUS_400
            );
        }

        return this.#server_service.getStaticFileResponse(
            join(root, path.startsWith("/") ? path.substring(1) : path),
            request,
            mime_type
        );
    }
}
