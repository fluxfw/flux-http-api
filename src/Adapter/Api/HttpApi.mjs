/** @typedef {import("../../Service/Client/Port/ClientService.mjs").ClientService} ClientService */
/** @typedef {import("../Server/handleRequest.mjs").handleRequest} handleRequest */
/** @typedef {import("../Client/HttpClientRequest.mjs").HttpClientRequest} HttpClientRequest */
/** @typedef {import("../Client/HttpClientResponse.mjs").HttpClientResponse} HttpClientResponse */
/** @typedef {import("../Server/HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */
/** @typedef {import("../Server/HttpServerResponse.mjs").HttpServerResponse} HttpServerResponse */
/** @typedef {import("../Proxy/ProxyRequest.mjs").ProxyRequest} ProxyRequest */
/** @typedef {import("../Range/RangeUnit.mjs").RangeUnit} RangeUnit */
/** @typedef {import("../Range/RangeValue.mjs").RangeValue} RangeValue */
/** @typedef {import("../Server/_Server.mjs").Server} Server */
/** @typedef {import("../../Service/Server/Port/ServerService.mjs").ServerService} ServerService */
/** @typedef {import("../../../../flux-shutdown-handler-api/src/Adapter/ShutdownHandler/ShutdownHandler.mjs").ShutdownHandler} ShutdownHandler */

export class HttpApi {
    /**
     * @type {ClientService | null}
     */
    #client_service = null;
    /**
     * @type {ServerService | null}
     */
    #server_service = null;
    /**
     * @type {ShutdownHandler | null}
     */
    #shutdown_handler;

    /**
     * @param {ShutdownHandler | null} shutdown_handler
     * @returns {HttpApi}
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
     * @param {HttpClientRequest} request
     * @returns {Promise<HttpClientResponse>}
     */
    async fetch(request) {
        return (await this.#getClientService()).fetch(
            request
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
     * @returns {Promise<ClientService>}
     */
    async #getClientService() {
        this.#client_service ??= (await import("../../Service/Client/Port/ClientService.mjs")).ClientService.new();

        return this.#client_service;
    }

    /**
     * @returns {Promise<ServerService>}
     */
    async #getServerService() {
        this.#server_service ??= (await import("../../Service/Server/Port/ServerService.mjs")).ServerService.new(
            await this.#getClientService(),
            this.#shutdown_handler
        );

        return this.#server_service;
    }
}
