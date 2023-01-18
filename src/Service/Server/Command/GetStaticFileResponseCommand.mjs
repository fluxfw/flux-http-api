import { existsSync } from "node:fs";
import { HttpResponse } from "../../../Adapter/Response/HttpResponse.mjs";
import { join } from "node:path/posix";
import { METHOD_HEAD } from "../../../Adapter/Method/METHOD.mjs";
import { RANGE_UNIT_BYTES } from "../../../Adapter/Range/RANGE_UNIT.mjs";
import { stat } from "node:fs/promises";
import { STATUS_404 } from "../../../Adapter/Status/STATUS.mjs";

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
     * @param {string | null} content_type
     * @param {{[key: string]: string | string[]} | null} headers
     * @returns {Promise<HttpResponse>}
     */
    async getStaticFileResponse(path, request, content_type = null, headers = null) {
        if (!existsSync(path)) {
            return HttpResponse.text(
                "File not found",
                STATUS_404
            );
        }

        const _stat = await stat(path);

        if (!_stat.isFile()) {
            if (content_type !== null || !_stat.isDirectory()) {
                return HttpResponse.text(
                    "File not found",
                    STATUS_404
                );
            }

            if (!request.url.pathname.endsWith("/")) {
                return HttpResponse.redirect(
                    `${request.url.origin}${request.url.pathname}/${request.url.search}`
                );
            }

            return this.getStaticFileResponse(
                join(path, "index.html"),
                request,
                content_type
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

        return HttpResponse.staticFile(
            request.method !== METHOD_HEAD ? path : null,
            content_type ?? await this.#server_service.getMimeTypeByPath(
                path
            ),
            _stat.size,
            range,
            null,
            headers
        );
    }
}
