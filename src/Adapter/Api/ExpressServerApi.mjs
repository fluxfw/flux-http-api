/** @typedef {import("../ExpressServer/ExpressServer.mjs").ExpressServer} ExpressServer */
/** @typedef {import("../../Service/ExpressServer/Port/ExpressServerService.mjs").ExpressServerService} ExpressServerService */
/** @typedef {import("../ExpressServer/getRouter.mjs").getRouter} getRouter */
/** @typedef {import("../../../../flux-shutdown-handler-api/src/Adapter/ShutdownHandler/ShutdownHandler.mjs").ShutdownHandler} ShutdownHandler */

export class ExpressServerApi {
    /**
     * @type {ExpressServerService | null}
     */
    #express_server_service = null;
    /**
     * @type {ShutdownHandler}
     */
    #shutdown_handler;

    /**
     * @param {ShutdownHandler} shutdown_handler
     * @returns {ExpressServerApi}
     */
    static new(shutdown_handler) {
        return new this(
            shutdown_handler
        );
    }

    /**
     * @param {ShutdownHandler} shutdown_handler
     * @private
     */
    constructor(shutdown_handler) {
        this.#shutdown_handler = shutdown_handler;
    }

    /**
     * @returns {Promise<void>}
     */
    async init() {
        this.#express_server_service ??= await this.#getExpressServerService();
    }

    /**
     * @param {getRouter} get_router
     * @param {ExpressServer | null} express_server
     * @returns {Promise<void>}
     */
    async runExpressServer(get_router, express_server = null) {
        await this.#express_server_service.runExpressServer(
            get_router,
            express_server
        );
    }

    /**
     * @returns {Promise<ExpressServerService>}
     */
    async #getExpressServerService() {
        return (await import("../../Service/ExpressServer/Port/ExpressServerService.mjs")).ExpressServerService.new(
            this.#shutdown_handler
        );
    }
}
