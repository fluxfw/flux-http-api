/** @typedef {import("../../../Adapter/Server/handleRequest.mjs").handleRequest} handleRequest */
/** @typedef {import("node:http")} http */
/** @typedef {import("../../../Adapter/Request/HttpRequest.mjs").HttpRequest} HttpRequest */
/** @typedef {import("../../../Adapter/Response/HttpResponse.mjs").HttpResponse} HttpResponse */
/** @typedef {import("node:http").IncomingMessage} IncomingMessage */
/** @typedef {import("../../../Adapter/Proxy/ProxyRequest.mjs").ProxyRequest} ProxyRequest */
/** @typedef {import("../../../Adapter/Range/RangeUnit.mjs").RangeUnit} RangeUnit */
/** @typedef {import("../../../Adapter/Range/RangeValue.mjs").RangeValue} RangeValue */
/** @typedef {import("../../../Adapter/Server/_Server.mjs").Server} Server */
/** @typedef {import("node:http").ServerResponse} ServerResponse */
/** @typedef {import("../../../../../flux-shutdown-handler-api/src/Adapter/ShutdownHandler/ShutdownHandler.mjs").ShutdownHandler} ShutdownHandler */

export class ServerService {
    /**
     * @type {ShutdownHandler | null}
     */
    #shutdown_handler;

    /**
     * @param {ShutdownHandler | null} shutdown_handler
     * @returns {ServerService}
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
     * @param {HttpRequest} request
     * @param {string | null} content_type
     * @param {{[key: string]: string | string[]} | null} headers
     * @returns {Promise<HttpResponse>}
     */
    async getFilteredStaticFileResponse(root, path, request, content_type = null, headers = null) {
        return (await import("../Command/GetFilteredStaticFileResponseCommand.mjs")).GetFilteredStaticFileResponseCommand.new(
            this
        )
            .getFilteredStaticFileResponse(
                root,
                path,
                request,
                content_type,
                headers
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
     * @param {HttpRequest} request
     * @param {string | null} content_type
     * @param {{[key: string]: string | string[]} | null} headers
     * @returns {Promise<HttpResponse>}
     */
    async getStaticFileResponse(path, request, content_type = null, headers = null) {
        return (await import("../Command/GetStaticFileResponseCommand.mjs")).GetStaticFileResponseCommand.new(
            this
        )
            .getStaticFileResponse(
                path,
                request,
                content_type,
                headers
            );
    }

    /**
     * @param {IncomingMessage} req
     * @param {ServerResponse | null} _res
     * @returns {Promise<HttpRequest | null>}
     */
    async mapRequest(req, _res = null) {
        return (await import("../Command/MapRequestCommand.mjs")).MapRequestCommand.new()
            .mapRequest(
                req,
                _res
            );
    }

    /**
     * @param {HttpResponse} response
     * @param {ServerResponse} res
     * @param {HttpRequest | null} request
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
     * @returns {Promise<HttpResponse>}
     */
    async proxyRequest(proxy_request) {
        return (await import("../Command/ProxyRequestCommand.mjs")).ProxyRequestCommand.new()
            .proxyRequest(
                proxy_request
            );
    }

    /**
     * @param {handleRequest} handle_request
     * @param {Server | null} server
     * @returns {Promise<void>}
     */
    async runServer(handle_request, server = null) {
        if (this.#shutdown_handler === null) {
            throw new Error("Missing ShutdownHandler");
        }

        await (await import("../Command/RunServerCommand.mjs")).RunServerCommand.new(
            this,
            this.#shutdown_handler
        )
            .runServer(
                handle_request,
                server
            );
    }

    /**
     * @param {HttpRequest} request
     * @param {string[]} methods
     * @returns {Promise<HttpResponse | null>}
     */
    async validateMethods(request, methods) {
        return (await import("../Command/ValidateMethodsCommand.mjs")).ValidateMethodsCommand.new()
            .validateMethods(
                request,
                methods
            );
    }

    /**
     * @param {HttpRequest} request
     * @param {RangeUnit[]} units
     * @returns {Promise<RangeValue | HttpResponse | null>}
     */
    async validateRanges(request, units) {
        return (await import("../Command/ValidateRangesCommand.mjs")).ValidateRangesCommand.new()
            .validateRanges(
                request,
                units
            );
    }
}
