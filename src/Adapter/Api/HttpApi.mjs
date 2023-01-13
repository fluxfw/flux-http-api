/** @typedef {import("../Fetch/Fetch.mjs").Fetch} Fetch */
/** @typedef {import("../Fetch/fetchAuthenticate.mjs").fetchAuthenticate} fetchAuthenticate */
/** @typedef {import("../../Service/Fetch/Port/FetchService.mjs").FetchService} FetchService */
/** @typedef {import("../Fetch/fetchShowError.mjs").fetchShowError} fetchShowError */
/** @typedef {import("../HttpServer/handleRequest.mjs").handleRequest} handleRequest */
/** @typedef {import("../HttpServer/HttpServer.mjs").HttpServer} HttpServer */
/** @typedef {import("../Request/HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */
/** @typedef {import("../Response/HttpServerResponse.mjs").HttpServerResponse} HttpServerResponse */
/** @typedef {import("../../Service/HttpServer/Port/HttpServerService.mjs").HttpServerService} HttpServerService */
/** @typedef {import("../Proxy/ProxyRequest.mjs").ProxyRequest} ProxyRequest */
/** @typedef {import("../Range/RangeUnit.mjs").RangeUnit} RangeUnit */
/** @typedef {import("../Range/RangeValue.mjs").RangeValue} RangeValue */
/** @typedef {import("../../../../flux-shutdown-handler-api/src/Adapter/ShutdownHandler/ShutdownHandler.mjs").ShutdownHandler} ShutdownHandler */

export class HttpApi {
    /**
     * @type {fetchAuthenticate | null}
     */
    #fetch_authenticate;
    /**
     * @type {FetchService | null}
     */
    #fetch_service = null;
    /**
     * @type {fetchShowError | null}
     */
    #fetch_show_error;
    /**
     * @type {HttpServerService | null}
     */
    #http_server_service = null;
    /**
     * @type {ShutdownHandler | null}
     */
    #shutdown_handler;

    /**
     * @param {ShutdownHandler | null} shutdown_handler
     * @param {fetchAuthenticate | null} fetch_authenticate
     * @param {fetchShowError | null} fetch_show_error
     * @returns {HttpApi}
     */
    static new(shutdown_handler = null, fetch_authenticate = null, fetch_show_error = null) {
        return new this(
            shutdown_handler,
            fetch_authenticate,
            fetch_show_error
        );
    }

    /**
     * @param {ShutdownHandler | null} shutdown_handler
     * @param {fetchAuthenticate | null} fetch_authenticate
     * @param {fetchShowError | null} fetch_show_error
     * @private
     */
    constructor(shutdown_handler, fetch_authenticate, fetch_show_error) {
        this.#shutdown_handler = shutdown_handler;
        this.#fetch_authenticate = fetch_authenticate;
        this.#fetch_show_error = fetch_show_error;
    }

    /**
     * @param {Fetch} _fetch
     * @returns {Promise<*>}
     */
    async fetch(_fetch) {
        return (await this.#getFetchService()).fetch(
            _fetch
        );
    }

    /**
     * @param {string} root
     * @param {string} path
     * @param {HttpServerRequest} request
     * @param {string | null} mime_type
     * @returns {Promise<HttpServerResponse>}
     */
    async getFilteredStaticFileResponse(root, path, request, mime_type = null) {
        return (await this.#getHttpServerService()).getFilteredStaticFileResponse(
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
        return (await this.#getHttpServerService()).getMimeTypeByExtension(
            extension
        );
    }

    /**
     * @param {string} path
     * @returns {Promise<string | null>}
     */
    async getMimeTypeByPath(path) {
        return (await this.#getHttpServerService()).getMimeTypeByPath(
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
        return (await this.#getHttpServerService()).getStaticFileResponse(
            path,
            request,
            mime_type
        );
    }

    /**
     * @param {ProxyRequest} proxy_request
     * @returns {Promise<HttpServerResponse>}
     */
    async proxyRequest(proxy_request) {
        return (await this.#getHttpServerService()).proxyRequest(
            proxy_request
        );
    }

    /**
     * @param {handleRequest} handle_request
     * @param {HttpServer | null} http_server
     * @returns {Promise<void>}
     */
    async runHttpServer(handle_request, http_server = null) {
        await (await this.#getHttpServerService()).runHttpServer(
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
        return (await this.#getHttpServerService()).validateMethods(
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
        return (await this.#getHttpServerService()).validateRanges(
            request,
            units
        );
    }

    /**
     * @returns {Promise<FetchService>}
     */
    async #getFetchService() {
        this.#fetch_service ??= (await import("../../Service/Fetch/Port/FetchService.mjs")).FetchService.new(
            this.#fetch_authenticate,
            this.#fetch_show_error
        );

        return this.#fetch_service;
    }

    /**
     * @returns {Promise<HttpServerService>}
     */
    async #getHttpServerService() {
        this.#http_server_service ??= (await import("../../Service/HttpServer/Port/HttpServerService.mjs")).HttpServerService.new(
            this.#shutdown_handler
        );

        return this.#http_server_service;
    }
}
