/** @typedef {import("../Fetch/authenticate.mjs").authenticate} _authenticate */
/** @typedef {import("../Fetch/Fetch.mjs").Fetch} Fetch */
/** @typedef {import("../../Service/Fetch/Port/FetchService.mjs").FetchService} FetchService */
/** @typedef {import("../HttpServer/getRouter.mjs").getRouter} getRouter */
/** @typedef {import("../HttpServer/HttpServer.mjs").HttpServer} HttpServer */
/** @typedef {import("../../Service/HttpServer/Port/HttpServerService.mjs").HttpServerService} HttpServerService */
/** @typedef {import("../Fetch/showError.mjs").showError} showError */
/** @typedef {import("../../../../flux-shutdown-handler-api/src/Adapter/ShutdownHandler/ShutdownHandler.mjs").ShutdownHandler} ShutdownHandler */

export class HttpApi {
    /**
     * @type {_authenticate | null}
     */
    #fetch_authenticate;
    /**
     * @type {FetchService | null}
     */
    #fetch_service = null;
    /**
     * @type {showError | null}
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
     * @param {_authenticate | null} fetch_authenticate
     * @param {showError | null} fetch_show_error
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
     * @param {_authenticate | null} fetch_authenticate
     * @param {showError | null} fetch_show_error
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
     * @param {getRouter} get_router
     * @param {HttpServer | null} http_server
     * @returns {Promise<void>}
     */
    async runHttpServer(get_router, http_server = null) {
        await (await this.#getHttpServerService()).runHttpServer(
            get_router,
            http_server
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
