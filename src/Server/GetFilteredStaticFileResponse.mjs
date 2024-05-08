import { HttpServerResponse } from "./HttpServerResponse.mjs";
import { join } from "node:path";
import { STATUS_CODE_400 } from "../Status/STATUS_CODE.mjs";

/** @typedef {import("../Http.mjs").Http} Http */
/** @typedef {import("./HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */

export class GetFilteredStaticFileResponse {
    /**
     * @type {Http}
     */
    #http;

    /**
     * @param {Http} http
     * @returns {Promise<GetFilteredStaticFileResponse>}
     */
    static async new(http) {
        return new this(
            http
        );
    }

    /**
     * @param {Http} http
     * @private
     */
    constructor(http) {
        this.#http = http;
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

        return this.#http.getStaticFileResponse(
            join(root, path.startsWith("/") ? path.substring(1) : path),
            request,
            content_type,
            headers
        );
    }
}
