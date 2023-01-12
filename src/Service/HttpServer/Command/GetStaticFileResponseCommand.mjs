import { join } from "node:path/posix";
import { METHOD_HEAD } from "../../../Adapter/Method/METHOD.mjs";
import { stat } from "node:fs/promises";
import { STATUS_302 } from "../../../Adapter/Status/STATUS.mjs";
import { createReadStream, existsSync } from "node:fs";
import { HEADER_CONTENT_LENGTH, HEADER_CONTENT_TYPE, HEADER_LOCATION } from "../../../Adapter/Header/HEADER.mjs";

/** @typedef {import("../../../Adapter/Request/HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */
/** @typedef {import("../../../Adapter/Response/HttpServerResponse.mjs").HttpServerResponse} HttpServerResponse */
/** @typedef {import("../Port/HttpServerService.mjs").HttpServerService} HttpServerService */

export class GetStaticFileResponseCommand {
    /**
     * @type {HttpServerService}
     */
    #http_server_service;

    /**
     * @param {HttpServerService} http_server_service
     * @returns {GetStaticFileResponseCommand}
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
     * @param {HttpServerRequest} request
     * @param {string | null} mime_type
     * @returns {Promise<HttpServerResponse | null>}
     */
    async getStaticFileResponse(path, request, mime_type = null) {
        if (!existsSync(path)) {
            return null;
        }

        const _stat = await stat(path);

        if (!_stat.isFile()) {
            if (mime_type !== null || !_stat.isDirectory()) {
                return null;
            }

            if (!request._urlObject.pathname.endsWith("/")) {
                return new Response(null, {
                    status: STATUS_302,
                    headers: {
                        [HEADER_LOCATION]: `${request._urlObject.href}/`
                    }
                });
            }

            return this.getStaticFileResponse(
                join(path, "index.html"),
                request,
                mime_type
            );
        }

        const _mime_type = mime_type ?? await this.#http_server_service.getMimeTypeByPath(
            path
        );

        const response = new Response(null, {
            headers: {
                ..._mime_type !== null ? {
                    [HEADER_CONTENT_TYPE]: _mime_type
                } : {},
                [HEADER_CONTENT_LENGTH]: _stat.size
            }
        });

        if (request.method !== METHOD_HEAD) {
            response._bodyNode = createReadStream(path);
        }

        return response;
    }
}
