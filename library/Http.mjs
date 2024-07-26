/** @typedef {import("./Server/handleRequest.mjs").handleRequest} handleRequest */
/** @typedef {import("./Server/HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */
/** @typedef {import("./Server/HttpServerResponse.mjs").HttpServerResponse} HttpServerResponse */
/** @typedef {import("./Logger/Logger.mjs").Logger} Logger */
/** @typedef {import("./Range/RangeUnit.mjs").RangeUnit} RangeUnit */
/** @typedef {import("./Range/RangeValue.mjs").RangeValue} RangeValue */
/** @typedef {import("./Server/_Server.mjs").Server} Server */
/** @typedef {import("node:http").ServerResponse} ServerResponse */
/** @typedef {import("./ShutdownHandler/ShutdownHandler.mjs").ShutdownHandler} ShutdownHandler */

export class Http {
    /**
     * @type {Logger}
     */
    #logger;
    /**
     * @type {ShutdownHandler | null}
     */
    #shutdown_handler;

    /**
     * @param {Logger | null} logger
     * @param {ShutdownHandler | null} shutdown_handler
     * @returns {Promise<Http>}
     */
    static async new(logger = null, shutdown_handler = null) {
        return new this(
            logger ?? console,
            shutdown_handler
        );
    }

    /**
     * @param {Logger} logger
     * @param {ShutdownHandler | null} shutdown_handler
     * @private
     */
    constructor(logger, shutdown_handler) {
        this.#logger = logger;
        this.#shutdown_handler = shutdown_handler;
    }

    /**
     * @param {HttpServerRequest} request
     * @param {string} schema
     * @param {string | null} parameters
     * @returns {Promise<string | HttpServerResponse>}
     */
    async getAuthorizationParameters(request, schema, parameters = null) {
        return (await (await import("./Server/GetAuthorizationParameters.mjs")).GetAuthorizationParameters.new())
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
        return (await (await import("./Server/GetFilteredStaticFileResponse.mjs")).GetFilteredStaticFileResponse.new(
            this
        ))
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
        return (await (await import("./Server/GetMimeTypeByExtension.mjs")).GetMimeTypeByExtension.new())
            .getMimeTypeByExtension(
                extension
            );
    }

    /**
     * @param {string} path
     * @returns {Promise<string | null>}
     */
    async getMimeTypeByPath(path) {
        return (await (await import("./Server/GetMimeTypeByPath.mjs")).GetMimeTypeByPath.new(
            this
        ))
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
        return (await (await import("./Server/GetStaticFileResponse.mjs")).GetStaticFileResponse.new(
            this
        ))
            .getStaticFileResponse(
                path,
                request,
                content_type,
                headers
            );
    }

    /**
     * @param {handleRequest} handle_request
     * @param {Server | null} server
     * @returns {Promise<void>}
     */
    async runServer(handle_request, server = null) {
        await (await (await import("./Server/RunServer.mjs")).RunServer.new(
            this.#logger,
            this.#shutdown_handler
        ))
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
        await (await (await import("./Server/RunServer.mjs")).RunServer.new(
            this.#logger,
            this.#shutdown_handler
        ))
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
        return (await (await import("./Server/ValidateMethods.mjs")).ValidateMethods.new())
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
        return (await (await import("./Server/ValidateRanges.mjs")).ValidateRanges.new())
            .validateRanges(
                request,
                units
            );
    }
}
