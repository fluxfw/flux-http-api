import { HttpServerResponse } from "./HttpServerResponse.mjs";
import { join } from "node:path/posix";
import { STATUS_CODE_400 } from "../Status/STATUS_CODE.mjs";

/** @typedef {import("../FluxHttpApi.mjs").FluxHttpApi} FluxHttpApi */
/** @typedef {import("./HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */

export class GetFilteredStaticFileResponse {
    /**
     * @type {FluxHttpApi}
     */
    #flux_http_api;

    /**
     * @param {FluxHttpApi} flux_http_api
     * @returns {GetFilteredStaticFileResponse}
     */
    static new(flux_http_api) {
        return new this(
            flux_http_api
        );
    }

    /**
     * @param {FluxHttpApi} flux_http_api
     * @private
     */
    constructor(flux_http_api) {
        this.#flux_http_api = flux_http_api;
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

        return this.#flux_http_api.getStaticFileResponse(
            join(root, path.startsWith("/") ? path.substring(1) : path),
            request,
            content_type,
            headers
        );
    }
}
