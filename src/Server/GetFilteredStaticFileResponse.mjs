import { HttpServerResponse } from "./HttpServerResponse.mjs";
import { join } from "node:path";
import { STATUS_CODE_400 } from "../Status/STATUS_CODE.mjs";

/** @typedef {import("../FluxHttp.mjs").FluxHttp} FluxHttp */
/** @typedef {import("./HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */

export class GetFilteredStaticFileResponse {
    /**
     * @type {FluxHttp}
     */
    #flux_http;

    /**
     * @param {FluxHttp} flux_http
     * @returns {Promise<GetFilteredStaticFileResponse>}
     */
    static async new(flux_http) {
        return new this(
            flux_http
        );
    }

    /**
     * @param {FluxHttp} flux_http
     * @private
     */
    constructor(flux_http) {
        this.#flux_http = flux_http;
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
                "Invalid path!",
                STATUS_CODE_400
            );
        }

        return this.#flux_http.getStaticFileResponse(
            join(root, path.startsWith("/") ? path.substring(1) : path),
            request,
            content_type,
            headers
        );
    }
}
