/** @typedef {import("../../flux-shutdown-handler/src/FluxShutdownHandler.mjs").FluxShutdownHandler} FluxShutdownHandler */
/** @typedef {import("./Server/handleRequest.mjs").handleRequest} handleRequest */
/** @typedef {import("./Client/HttpClientRequest.mjs").HttpClientRequest} HttpClientRequest */
/** @typedef {import("./Client/HttpClientResponse.mjs").HttpClientResponse} HttpClientResponse */
/** @typedef {import("./Server/HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */
/** @typedef {import("./Server/HttpServerResponse.mjs").HttpServerResponse} HttpServerResponse */
/** @typedef {import("./Proxy/ProxyRequest.mjs").ProxyRequest} ProxyRequest */
/** @typedef {import("./Range/RangeUnit.mjs").RangeUnit} RangeUnit */
/** @typedef {import("./Range/RangeValue.mjs").RangeValue} RangeValue */
/** @typedef {import("./RequestImplementation/RequestImplementation.mjs").RequestImplementation} RequestImplementation */
/** @typedef {import("./Server/_Server.mjs").Server} Server */
/** @typedef {import("node:http").ServerResponse} ServerResponse */
/** @typedef {import("./Server/Port/ServerService.mjs").ServerService} ServerService */

export class FluxHttpApi {
    /**
     * @type {FluxShutdownHandler | null}
     */
    #flux_shutdown_handler;
    /**
     * @type {RequestImplementation | null}
     */
    #request_implementation = null;
    /**
     * @type {ServerService | null}
     */
    #server_service = null;

    /**
     * @param {FluxShutdownHandler | null} flux_shutdown_handler
     * @returns {FluxHttpApi}
     */
    static new(flux_shutdown_handler = null) {
        return new this(
            flux_shutdown_handler
        );
    }

    /**
     * @param {FluxShutdownHandler | null} flux_shutdown_handler
     * @private
     */
    constructor(flux_shutdown_handler) {
        this.#flux_shutdown_handler = flux_shutdown_handler;
    }

    /**
     * @param {HttpServerRequest} request
     * @param {string} schema
     * @param {string | null} parameters
     * @returns {Promise<string | HttpServerResponse>}
     */
    async getAuthorizationParameters(request, schema, parameters = null) {
        return (await this.#getServerService()).getAuthorizationParameters(
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
        return (await this.#getServerService()).getFilteredStaticFileResponse(
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
        return (await this.#getServerService()).getMimeTypeByExtension(
            extension
        );
    }

    /**
     * @param {string} path
     * @returns {Promise<string | null>}
     */
    async getMimeTypeByPath(path) {
        return (await this.#getServerService()).getMimeTypeByPath(
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
        return (await this.#getServerService()).getStaticFileResponse(
            path,
            request,
            content_type,
            headers
        );
    }

    /**
     * @param {ProxyRequest} proxy_request
     * @returns {Promise<HttpServerResponse>}
     */
    async proxyRequest(proxy_request) {
        return (await this.#getServerService()).proxyRequest(
            proxy_request
        );
    }

    /**
     * @param {HttpClientRequest} request
     * @returns {Promise<HttpClientResponse>}
     */
    async request(request) {
        return (await this.#getRequestImplementation()).request(
            request
        );
    }

    /**
     * @param {handleRequest} handle_request
     * @param {Server | null} server
     * @returns {Promise<void>}
     */
    async runServer(handle_request, server = null) {
        await (await this.#getServerService()).runServer(
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
        await (await this.#getServerService())._setCookies(
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
        return (await this.#getServerService()).validateMethods(
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
        return (await this.#getServerService()).validateRanges(
            request,
            units
        );
    }

    /**
     * @returns {Promise<RequestImplementation>}
     */
    async #getRequestImplementation() {
        this.#request_implementation ??= typeof process !== "undefined" ? (await import("./RequestImplementation/NodeRequestImplementation.mjs")).NodeRequestImplementation.new() : (await import("./RequestImplementation/WebRequestImplementation.mjs")).WebRequestImplementation.new();

        return this.#request_implementation;
    }

    /**
     * @returns {Promise<ServerService>}
     */
    async #getServerService() {
        this.#server_service ??= (await import("./Server/Port/ServerService.mjs")).ServerService.new(
            await this.#getRequestImplementation(),
            this.#flux_shutdown_handler
        );

        return this.#server_service;
    }
}
