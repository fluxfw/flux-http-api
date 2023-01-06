/** @typedef {import("../../../Adapter/HttpServer/getRouter.mjs").getRouter} getRouter */
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
     * @returns {Promise<HttpServerRequest>}
     */
    async mapServerRequestToRequest(req) {
        return (await import("../Command/MapServerRequestToRequestCommand.mjs")).MapServerRequestToRequestCommand.new()
            .mapServerRequestToRequest(
                req
            );
    }

    /**
     * @param {getRouter} get_router
     * @param {HttpServer | null} http_server
     * @returns {Promise<void>}
     */
    async runHttpServer(get_router, http_server = null) {
        if (this.#shutdown_handler === null) {
            throw new Error("Missing ShutdownHandler");
        }

        await (await import("../Command/RunHttpServerCommand.mjs")).RunHttpServerCommand.new(
            this.#shutdown_handler
        )
            .runHttpServer(
                get_router,
                http_server
            );
    }
}
