import { join } from "node:path/posix";
import { METHOD_HEAD } from "../../../Adapter/Method/METHOD.mjs";
import { RANGE_UNIT_BYTES } from "../../../Adapter/Range/RANGE_UNIT.mjs";
import { stat } from "node:fs/promises";
import { createReadStream, existsSync } from "node:fs";
import { HEADER_CONTENT_LENGTH, HEADER_CONTENT_RANGE, HEADER_CONTENT_TYPE, HEADER_LOCATION } from "../../../Adapter/Header/HEADER.mjs";
import { STATUS_206, STATUS_302, STATUS_404 } from "../../../Adapter/Status/STATUS.mjs";

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
     * @returns {Promise<HttpServerResponse>}
     */
    async getStaticFileResponse(path, request, mime_type = null) {
        if (!existsSync(path)) {
            return new Response(null, {
                status: STATUS_404
            });
        }

        const _stat = await stat(path);

        if (!_stat.isFile()) {
            if (mime_type !== null || !_stat.isDirectory()) {
                return new Response(null, {
                    status: STATUS_404
                });
            }

            if (!request._urlObject.pathname.endsWith("/")) {
                return new Response(null, {
                    status: STATUS_302,
                    headers: {
                        [HEADER_LOCATION]: `${request._urlObject.origin}${request._urlObject.pathname}/${request._urlObject.search}`
                    }
                });
            }

            return this.getStaticFileResponse(
                join(path, "index.html"),
                request,
                mime_type
            );
        }

        const range_response = await this.#http_server_service.validateRanges(
            request,
            [
                {
                    name: RANGE_UNIT_BYTES,
                    total_length: _stat.size
                }
            ]
        );

        if (range_response instanceof Response) {
            return range_response;
        }

        const _mime_type = mime_type ?? await this.#http_server_service.getMimeTypeByPath(
            path
        );

        const response = new Response(null, {
            ...range_response !== null ? {
                status: STATUS_206
            } : {},
            headers: {
                ...range_response !== null ? {
                    [HEADER_CONTENT_LENGTH]: range_response.length,
                    [HEADER_CONTENT_RANGE]: range_response.range
                } : {
                    [HEADER_CONTENT_LENGTH]: _stat.size
                },
                ..._mime_type !== null ? {
                    [HEADER_CONTENT_TYPE]: _mime_type
                } : {}
            }
        });

        if (request.method !== METHOD_HEAD) {
            response._bodyNode = createReadStream(path, {
                ...range_response !== null ? {
                    start: range_response.start,
                    end: range_response.end
                } : {}
            });
        }

        return response;
    }
}
