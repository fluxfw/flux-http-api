/** @typedef {import("../../../Adapter/HttpServer/handleRequest.mjs").handleRequest} handleRequest */
/** @typedef {import("node:http")} http */
/** @typedef {import("../../../Adapter/HttpServer/HttpServer.mjs").HttpServer} HttpServer */
/** @typedef {import("../../../Adapter/Request/HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */
/** @typedef {import("../../../Adapter/Response/HttpServerResponse.mjs").HttpServerResponse} HttpServerResponse */
/** @typedef {import("node:http").IncomingMessage} IncomingMessage */
/** @typedef {import("../../../Adapter/Proxy/ProxyRequest.mjs").ProxyRequest} ProxyRequest */
/** @typedef {import("../../../Adapter/Range/RangeUnit.mjs").RangeUnit} RangeUnit */
/** @typedef {import("../../../Adapter/Range/RangeValue.mjs").RangeValue} RangeValue */
/** @typedef {import("node:http").ServerResponse} ServerResponse */
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
     * @returns {Promise<HttpServerResponse>}
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
     * @param {string} extension
     * @returns {Promise<string | null>}
     */
    async getMimeTypeByExtension(extension) {
        return (await import("../Command/GetMimeTypeByExtensionCommand.mjs")).GetMimeTypeByExtensionCommand.new()
            .getMimeTypeByExtension(
                extension
            );
    }

    /**
     * @param {string} path
     * @returns {Promise<string | null>}
     */
    async getMimeTypeByPath(path) {
        return (await import("../Command/GetMimeTypeByPathCommand.mjs")).GetMimeTypeByPathCommand.new(
            this
        )
            .getMimeTypeByPath(
                path
            );
    }

    /**
     * @param {string} path
     * @param {HttpServerRequest} request
     * @param {string | null} mime_type
     * @returns {Promise<HttpServerResponse>}
     */
    async getStaticFileResponse(path, request, mime_type = null) {
        return (await import("../Command/GetStaticFileResponseCommand.mjs")).GetStaticFileResponseCommand.new(
            this
        )
            .getStaticFileResponse(
                path,
                request,
                mime_type
            );
    }

    /**
     * @param {IncomingMessage} req
     * @param {ServerResponse} res
     * @returns {Promise<HttpServerRequest | null>}
     */
    async mapRequest(req, res) {
        return (await import("../Command/MapRequestCommand.mjs")).MapRequestCommand.new()
            .mapRequest(
                req,
                res
            );
    }

    /**
     * @param {HttpServerResponse} response
     * @param {ServerResponse} res
     * @param {HttpServerRequest | null} request
     * @returns {Promise<void>}
     */
    async mapResponse(response, res, request = null) {
        await (await import("../Command/MapResponseCommand.mjs")).MapResponseCommand.new()
            .mapResponse(
                response,
                res,
                request
            );
    }

    /**
     * @param {ProxyRequest} proxy_request
     * @returns {Promise<HttpServerResponse>}
     */
    async proxyRequest(proxy_request) {
        return (await import("../Command/ProxyRequestCommand.mjs")).ProxyRequestCommand.new()
            .proxyRequest(
                proxy_request
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

    /**
     * @param {HttpServerRequest} request
     * @param {string[]} methods
     * @returns {Promise<HttpServerResponse | null>}
     */
    async validateMethods(request, methods) {
        return (await import("../Command/ValidateMethodsCommand.mjs")).ValidateMethodsCommand.new()
            .validateMethods(
                request,
                methods
            );
    }

    /**
     * @param {HttpServerRequest} request
     * @param {RangeUnit[]} units
     * @returns {Promise<RangeValue | HttpServerResponse | null>}
     */
    async validateRanges(request, units) {
        return (await import("../Command/ValidateRangesCommand.mjs")).ValidateRangesCommand.new()
            .validateRanges(
                request,
                units
            );
    }
}
