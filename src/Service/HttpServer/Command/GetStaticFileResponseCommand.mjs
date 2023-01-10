import { extname } from "node:path/posix";
import { HEADER_CONTENT_LENGTH, HEADER_CONTENT_TYPE } from "../../../Adapter/Header/HEADER.mjs";
import MIME_DB from "../../../../../mime-db/db.json" assert {type: "json"};
import { Readable } from "node:stream";
import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { METHOD_HEAD } from "../../../Adapter/Method/METHOD.mjs";

/** @typedef {import("../../../Adapter/Request/HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */
/** @typedef {import("../../../Adapter/Response/HttpServerResponse.mjs").HttpServerResponse} HttpServerResponse */

export class GetStaticFileResponseCommand {
    /**
     * @returns {GetStaticFileResponseCommand}
     */
    static new() {
        return new this();
    }

    /**
     * @private
     */
    constructor() {

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
            if (mime_type === null && _stat.isDirectory()) {
                return this.getStaticFileResponse(
                    `${path}${!path.endsWith("/") ? "/" : ""}index.html`,
                    request,
                    mime_type
                );
            }

            return null;
        }

        const ext = extname(path).substring(1).toLowerCase();

        const _content_type = mime_type ?? Object.entries(MIME_DB).find(([
            ,
            value
        ]) => value?.extensions?.includes(ext) ?? false)?.[0] ?? null;

        const headers = new Headers();

        if (_content_type !== null) {
            headers.set(HEADER_CONTENT_TYPE, _content_type);
        }

        headers.set(HEADER_CONTENT_LENGTH, _stat.size);

        return new Response(request.method !== METHOD_HEAD ? Readable.toWeb(createReadStream(path)) : null, {
            headers
        });
    }
}
