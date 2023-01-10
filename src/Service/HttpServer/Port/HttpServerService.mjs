/** @typedef {import("../../../Adapter/HttpServer/handleRequest.mjs").handleRequest} handleRequest */
/** @typedef {import("node:http")} http */
/** @typedef {import("../../../Adapter/HttpServer/HttpServer.mjs").HttpServer} HttpServer */
/** @typedef {import("../../../Adapter/Request/HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */
/** @typedef {import("../../../Adapter/Response/HttpServerResponse.mjs").HttpServerResponse} HttpServerResponse */
/** @typedef {import("../../../../../flux-shutdown-handler-api/src/Adapter/ShutdownHandler/ShutdownHandler.mjs").ShutdownHandler} ShutdownHandler */

export class HttpServerService {
    /**
     * @type {ShutdownHandler | null}
     */
    #shutdown_handler;

    /**
     * @param {ShutdownHandler | null} shutdown_handler
     * @returns {HttpServerService}
     */
    static new(shutdown_handler = null) {
        return new this(
            shutdown_handler
        );
    }

    /**
     * @param {ShutdownHandler | null} shutdown_handler
     * @private
     */
    constructor(shutdown_handler) {
        this.#shutdown_handler = shutdown_handler;
    }

    /**
     * @param {string} root
     * @param {string} path
     * @param {HttpServerRequest} request
     * @param {string | null} mime_type
     * @returns {Promise<HttpServerResponse | null>}
     */
    async getFilteredStaticFileResponse(root, path, request, mime_type = null) {
        return (await import("../Command/GetFilteredStaticFileResponseCommand.mjs")).GetFilteredStaticFileResponseCommand.new(
            this
        )
            .getFilteredStaticFileResponse(
                root,
                path,
                request,
                mime_type
            );
    }

    /**
     * @param {string} path
     * @param {HttpServerRequest} request
     * @param {string | null} mime_type
     * @returns {Promise<HttpServerResponse | null>}
     */
    async getStaticFileResponse(path, request, mime_type = null) {
        return (await import("../Command/GetStaticFileResponseCommand.mjs")).GetStaticFileResponseCommand.new()
            .getStaticFileResponse(
                path,
                request,
                mime_type
            );
    }

    /**
     * @param {HttpServerResponse} response
     * @param {http.ServerResponse} res
     * @param {HttpServerRequest | null} request
     * @returns {Promise<void>}
     */
    async mapResponseToServerResponse(response, res, request = null) {
        await (await import("../Command/MapResponseToServerResponseCommand.mjs")).MapResponseToServerResponseCommand.new()
            .mapResponseToServerResponse(
                response,
                res,
                request
            );
    }

    /**
     * @param {http.IncomingMessage} req
     * @param {http.ServerResponse} res
     * @returns {Promise<HttpServerRequest | null>}
     */
    async mapServerRequestToRequest(req, res) {
        return (await import("../Command/MapServerRequestToRequestCommand.mjs")).MapServerRequestToRequestCommand.new()
            .mapServerRequestToRequest(
                req,
                res
            );
    }

    /**
     * @param {handleRequest} handle_request
     * @param {HttpServer | null} http_server
     * @returns {Promise<void>}
     */
    async runHttpServer(handle_request, http_server = null) {
        if (this.#shutdown_handler === null) {
            throw new Error("Missing ShutdownHandler");
        }

        await (await import("../Command/RunHttpServerCommand.mjs")).RunHttpServerCommand.new(
            this,
            this.#shutdown_handler
        )
            .runHttpServer(
                handle_request,
                http_server
            );
    }
}
