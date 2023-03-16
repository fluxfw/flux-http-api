/** @typedef {import("../../../../flux-shutdown-handler/src/FluxShutdownHandler.mjs").FluxShutdownHandler} FluxShutdownHandler */
/** @typedef {import("../handleRequest.mjs").handleRequest} handleRequest */
/** @typedef {import("../HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */
/** @typedef {import("../HttpServerResponse.mjs").HttpServerResponse} HttpServerResponse */
/** @typedef {import("node:http").IncomingMessage} IncomingMessage */
/** @typedef {import("../../Proxy/ProxyRequest.mjs").ProxyRequest} ProxyRequest */
/** @typedef {import("../../Range/RangeUnit.mjs").RangeUnit} RangeUnit */
/** @typedef {import("../../Range/RangeValue.mjs").RangeValue} RangeValue */
/** @typedef {import("../../RequestImplementation/RequestImplementation.mjs").RequestImplementation} RequestImplementation */
/** @typedef {import("../_Server.mjs").Server} Server */
/** @typedef {import("node:http").ServerResponse} ServerResponse */

export class ServerService {
    /**
     * @type {FluxShutdownHandler | null}
     */
    #flux_shutdown_handler;
    /**
     * @type {RequestImplementation}
     */
    #request_implementation;

    /**
     * @param {RequestImplementation} request_implementation
     * @param {FluxShutdownHandler | null} flux_shutdown_handler
     * @returns {ServerService}
     */
    static new(request_implementation, flux_shutdown_handler = null) {
        return new this(
            request_implementation,
            flux_shutdown_handler
        );
    }

    /**
     * @param {RequestImplementation} request_implementation
     * @param {FluxShutdownHandler | null} flux_shutdown_handler
     * @private
     */
    constructor(request_implementation, flux_shutdown_handler) {
        this.#request_implementation = request_implementation;
        this.#flux_shutdown_handler = flux_shutdown_handler;
    }

    /**
     * @param {HttpServerRequest} request
     * @param {string} schema
     * @param {string | null} parameters
     * @returns {Promise<string | HttpServerResponse>}
     */
    async getAuthorizationParameters(request, schema, parameters = null) {
        return (await import("../Command/GetAuthorizationParametersCommand.mjs")).GetAuthorizationParametersCommand.new()
            .getAuthorizationParameters(
                request,
                schema,
                parameters
            );
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
     * @param {HttpServerRequest} request
     * @param {string | null} content_type
     * @param {{[key: string]: string | string[]} | null} headers
     * @returns {Promise<HttpServerResponse>}
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
     * @param {boolean | null} forwarded_headers
     * @returns {Promise<HttpServerRequest>}
     */
    async mapRequest(req, _res = null, forwarded_headers = null) {
        return (await import("../Command/MapRequestCommand.mjs")).MapRequestCommand.new()
            .mapRequest(
                req,
                _res,
                forwarded_headers
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
        return (await import("../Command/ProxyRequestCommand.mjs")).ProxyRequestCommand.new(
            this.#request_implementation
        )
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
        if (this.#flux_shutdown_handler === null) {
            throw new Error("Missing FluxShutdownHandler");
        }

        await (await import("../Command/RunServerCommand.mjs")).RunServerCommand.new(
            this.#flux_shutdown_handler,
            this
        )
            .runServer(
                handle_request,
                server
            );
    }

    /**
     * @param {ServerResponse} _res
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null}} cookies
     * @returns {Promise<void>}
     */
    async _setCookies(_res, cookies) {
        await (await import("../Command/MapResponseCommand.mjs")).MapResponseCommand.new()
            ._setCookies(
                _res,
                cookies
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
