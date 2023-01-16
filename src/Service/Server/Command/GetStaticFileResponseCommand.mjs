import { HttpResponse } from "../../../Adapter/Response/HttpResponse.mjs";
import { join } from "node:path/posix";
import { METHOD_HEAD } from "../../../Adapter/Method/METHOD.mjs";
import { RANGE_UNIT_BYTES } from "../../../Adapter/Range/RANGE_UNIT.mjs";
import { stat } from "node:fs/promises";
import { createReadStream, existsSync } from "node:fs";
import { HEADER_CONTENT_LENGTH, HEADER_CONTENT_RANGE, HEADER_CONTENT_TYPE } from "../../../Adapter/Header/HEADER.mjs";
import { STATUS_206, STATUS_404 } from "../../../Adapter/Status/STATUS.mjs";

/** @typedef {import("../../../Adapter/Request/HttpRequest.mjs").HttpRequest} HttpRequest */
/** @typedef {import("../Port/ServerService.mjs").ServerService} ServerService */

export class GetStaticFileResponseCommand {
    /**
     * @type {ServerService}
     */
    #server_service;

    /**
     * @param {ServerService} server_service
     * @returns {GetStaticFileResponseCommand}
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
     * @param {HttpRequest} request
     * @param {string | null} mime_type
     * @param {{[key: string]: string | string[]} | null} headers
     * @returns {Promise<HttpResponse>}
     */
    async getStaticFileResponse(path, request, mime_type = null, headers = null) {
        if (!existsSync(path)) {
            return HttpResponse.newFromTextBody(
                "File not found",
                STATUS_404
            );
        }

        const _stat = await stat(path);

        if (!_stat.isFile()) {
            if (mime_type !== null || !_stat.isDirectory()) {
                return HttpResponse.newFromTextBody(
                    "File not found",
                    STATUS_404
                );
            }

            if (!request.url.pathname.endsWith("/")) {
                return HttpResponse.newFromRedirect(
                    `${request.url.origin}${request.url.pathname}/${request.url.search}`
                );
            }

            return this.getStaticFileResponse(
                join(path, "index.html"),
                request,
                mime_type
            );
        }

        const range = await this.#server_service.validateRanges(
            request,
            [
                {
                    name: RANGE_UNIT_BYTES,
                    total_length: _stat.size
                }
            ]
        );

        if (range instanceof HttpResponse) {
            return range;
        }

        const _mime_type = mime_type ?? await this.#server_service.getMimeTypeByPath(
            path
        );

        return HttpResponse.new(
            request.method !== METHOD_HEAD ? createReadStream(path, {
                ...range !== null ? {
                    start: range.start,
                    end: range.end
                } : {}
            }) : null,
            range !== null ? STATUS_206 : null,
            {
                ...range !== null ? {
                    [HEADER_CONTENT_LENGTH]: range.length,
                    [HEADER_CONTENT_RANGE]: range.range
                } : {
                    [HEADER_CONTENT_LENGTH]: _stat.size
                },
                ..._mime_type !== null ? {
                    [HEADER_CONTENT_TYPE]: _mime_type
                } : {},
                ...headers ?? {}
            }
        );
    }
}
