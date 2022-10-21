import { createServer as createServerHttp } from "node:http";
import { createServer as createServerHttps } from "node:https";
import express from "express";
import { EXPRESS_SERVER_DEFAULT_LISTEN_HTTP_PORT, EXPRESS_SERVER_DEFAULT_LISTEN_HTTPS_PORT, EXPRESS_SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS, EXPRESS_SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS_PORT, EXPRESS_SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS_STATUS_CODE, EXPRESS_SERVER_LISTEN_HTTP_PORT_DISABLED, EXPRESS_SERVER_LISTEN_HTTPS_PORT_DISABLED } from "../../../Adapter/ExpressServer/EXPRESS_SERVER.mjs";

/** @typedef {import("../../../Adapter/ExpressServer/ExpressServer.mjs").ExpressServer} ExpressServer */
/** @typedef {import("../../../Adapter/ExpressServer/getRouter.mjs").getRouter} getRouter */
/** @typedef {import("../../../../../flux-shutdown-handler-api/src/Adapter/ShutdownHandler/ShutdownHandler.mjs").ShutdownHandler} ShutdownHandler */

export class RunExpressServerCommand {
    /**
     * @type {ShutdownHandler}
     */
    #shutdown_handler;

    /**
     * @param {ShutdownHandler} shutdown_handler
     * @returns {RunExpressServerCommand}
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
        const listen_interface = express_server?.listen_interface ?? null;
        const listen_https_port = express_server?.listen_https_port ?? EXPRESS_SERVER_DEFAULT_LISTEN_HTTPS_PORT;
        const listen_http_port = express_server?.listen_http_port ?? EXPRESS_SERVER_DEFAULT_LISTEN_HTTP_PORT;
        const redirect_http_to_https = express_server?.redirect_http_to_https ?? EXPRESS_SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS;
        const redirect_http_to_https_port = express_server?.redirect_http_to_https_port ?? EXPRESS_SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS_PORT;
        const redirect_http_to_https_status_code = express_server?.redirect_http_to_https_status_code ?? EXPRESS_SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS_STATUS_CODE;
        const https_cert = express_server?.https_cert ?? null;
        const https_key = express_server?.https_key ?? null;
        const https_dhparam = express_server?.https_dhparam ?? null;

        const server = express();

        const https_server = listen_https_port !== EXPRESS_SERVER_LISTEN_HTTPS_PORT_DISABLED && https_cert !== null && https_key !== null;
        if (https_server) {
            await this.#createNodeServer(
                server,
                createServerHttps,
                listen_https_port,
                listen_interface,
                {
                    cert: https_cert,
                    key: https_key,
                    dhparam: https_dhparam
                }
            );
        }

        const http_server = listen_http_port !== EXPRESS_SERVER_LISTEN_HTTP_PORT_DISABLED;
        if (http_server) {
            await this.#createNodeServer(
                server,
                createServerHttp,
                listen_http_port,
                listen_interface
            );
        }

        if (redirect_http_to_https && https_server && http_server) {
            server.use((req, res, next) => {
                if (req.secure) {
                    next();
                    return;
                }

                res.redirect(redirect_http_to_https_status_code, `https://${req.hostname}${redirect_http_to_https_port !== EXPRESS_SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS_PORT ? `:${redirect_http_to_https_port}` : ""}${req.url}`);
            });
        }

        server.use(await get_router());
    }

    /**
     * @param {express} server
     * @param {createServerHttp | createServerHttps} createServer
     * @param {number} port
     * @param {string | null} server_listen_interface
     * @param {{[key: string]: *}} options
     * @returns {Promise<void>}
     */
    async #createNodeServer(server, createServer, port, server_listen_interface, options = {}) {
        await new Promise((resolve, reject) => {
            const node_server = createServer(options, server);

            node_server.listen(port, server_listen_interface, error => {
                if (error) {
                    reject(error);
                    return;
                }

                this.#shutdown_handler.addShutdownTask(async () => {
                    await new Promise((_resolve, _reject) => {
                        node_server.close(_error => {
                            if (_error) {
                                _reject(_error);
                                return;
                            }

                            _resolve();
                        });
                    });
                });

                resolve();
            });
        });
    }
}
