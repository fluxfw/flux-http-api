import { RunExpressServerCommand } from "../Command/RunExpressServerCommand.mjs";
import { ShutdownHandler } from "../../../../../flux-shutdown-handler-api/src/Adapter/ShutdownHandler/ShutdownHandler.mjs";

/** @typedef {import("../../../Adapter/ExpressServer/ExpressServer.mjs").ExpressServer} ExpressServer */
/** @typedef {import("../../../Adapter/ExpressServer/getRouter.mjs").getRouter} getRouter */

export class ExpressServerService {
    /**
     * @type {ShutdownHandler}
     */
    #shutdown_handler;

    /**
     * @param {ShutdownHandler} shutdown_handler
     * @returns {ExpressServerService}
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
     * @param {getRouter} get_router
     * @param {ExpressServer | null} express_server
     * @returns {Promise<void>}
     */
    async runExpressServer(get_router, express_server = null) {
        await RunExpressServerCommand.new(
            this.#shutdown_handler
        )
            .runExpressServer(
                get_router,
                express_server
            );
    }
}
