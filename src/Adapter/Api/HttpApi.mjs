/** @typedef {import("../Fetch/Fetch.mjs").Fetch} Fetch */
/** @typedef {import("../Fetch/fetchAuthenticate.mjs").fetchAuthenticate} fetchAuthenticate */
/** @typedef {import("../../Service/Fetch/Port/FetchService.mjs").FetchService} FetchService */
/** @typedef {import("../Fetch/fetchShowError.mjs").fetchShowError} fetchShowError */
/** @typedef {import("../Server/handleRequest.mjs").handleRequest} handleRequest */
/** @typedef {import("../Request/HttpRequest.mjs").HttpRequest} HttpRequest */
/** @typedef {import("../Response/HttpResponse.mjs").HttpResponse} HttpResponse */
/** @typedef {import("../Proxy/ProxyRequest.mjs").ProxyRequest} ProxyRequest */
/** @typedef {import("../Range/RangeUnit.mjs").RangeUnit} RangeUnit */
/** @typedef {import("../Range/RangeValue.mjs").RangeValue} RangeValue */
/** @typedef {import("../Server/_Server.mjs").Server} Server */
/** @typedef {import("../../Service/Server/Port/ServerService.mjs").ServerService} ServerService */
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
     * @type {ServerService | null}
     */
    #server_service = null;
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
     * @param {HttpRequest} request
     * @param {string | null} content_type
     * @param {{[key: string]: string | string[]} | null} headers
     * @returns {Promise<HttpResponse>}
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
     * @param {HttpRequest} request
     * @param {string | null} content_type
     * @param {{[key: string]: string | string[]} | null} headers
     * @returns {Promise<HttpResponse>}
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
     * @returns {Promise<HttpResponse>}
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
     * @param {HttpRequest} request
     * @param {string[]} methods
     * @returns {Promise<HttpResponse | null>}
     */
    async validateMethods(request, methods) {
        return (await this.#getServerService()).validateMethods(
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
        return (await this.#getServerService()).validateRanges(
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
     * @returns {Promise<ServerService>}
     */
    async #getServerService() {
        this.#server_service ??= (await import("../../Service/Server/Port/ServerService.mjs")).ServerService.new(
            this.#shutdown_handler
        );

        return this.#server_service;
    }
}
