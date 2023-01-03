import { createServer as createServerHttp } from "node:http";
import { createServer as createServerHttps } from "node:https";
import express from "express";
import { HEADER_LOCATION, HEADER_REFERRER_POLICY } from "../../../Adapter/Header/HEADER.mjs";
import { HTTP_SERVER_DEFAULT_DEVELOPMENT_MODE, HTTP_SERVER_DEFAULT_LISTEN_HTTP_PORT, HTTP_SERVER_DEFAULT_LISTEN_HTTPS_PORT, HTTP_SERVER_DEFAULT_NO_POWERED_BY, HTTP_SERVER_DEFAULT_NO_REFERRER, HTTP_SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS, HTTP_SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS_PORT, HTTP_SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS_STATUS_CODE, HTTP_SERVER_LISTEN_HTTP_PORT_DISABLED, HTTP_SERVER_LISTEN_HTTPS_PORT_DISABLED } from "../../../Adapter/HttpServer/HTTP_SERVER.mjs";

/** @typedef {import("../../../Adapter/HttpServer/getRouter.mjs").getRouter} getRouter */
/** @typedef {import("../../../Adapter/HttpServer/HttpServer.mjs").HttpServer} HttpServer */
/** @typedef {import("../../../../../flux-shutdown-handler-api/src/Adapter/ShutdownHandler/ShutdownHandler.mjs").ShutdownHandler} ShutdownHandler */

export class RunHttpServerCommand {
    /**
     * @type {ShutdownHandler}
     */
    #shutdown_handler;

    /**
     * @param {ShutdownHandler} shutdown_handler
     * @returns {RunHttpServerCommand}
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
     * @param {HttpServer | null} http_server
     * @returns {Promise<void>}
     */
    async runHttpServer(get_router, http_server = null) {
        const development_mode = http_server?.development_mode ?? HTTP_SERVER_DEFAULT_DEVELOPMENT_MODE;
        const listen_interface = http_server?.listen_interface ?? null;
        const listen_https_port = http_server?.listen_https_port ?? HTTP_SERVER_DEFAULT_LISTEN_HTTPS_PORT;
        const listen_http_port = http_server?.listen_http_port ?? HTTP_SERVER_DEFAULT_LISTEN_HTTP_PORT;
        const redirect_http_to_https = http_server?.redirect_http_to_https ?? HTTP_SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS;
        const redirect_http_to_https_port = http_server?.redirect_http_to_https_port ?? HTTP_SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS_PORT;
        const redirect_http_to_https_status_code = http_server?.redirect_http_to_https_status_code ?? HTTP_SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS_STATUS_CODE;
        const https_cert = http_server?.https_cert ?? null;
        const https_key = http_server?.https_key ?? null;
        const https_dhparam = http_server?.https_dhparam ?? null;
        const no_powered_by = http_server?.no_powered_by ?? HTTP_SERVER_DEFAULT_NO_POWERED_BY;
        const no_referrer = http_server?.no_referrer ?? HTTP_SERVER_DEFAULT_NO_REFERRER;

        const server = express();

        server.set("env", development_mode ? "development" : "production");
        server.set("x-powered-by", !no_powered_by);

        const https = listen_https_port !== HTTP_SERVER_LISTEN_HTTPS_PORT_DISABLED && https_cert !== null && https_key !== null;
        if (https) {
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

        const http = listen_http_port !== HTTP_SERVER_LISTEN_HTTP_PORT_DISABLED;
        if (http) {
            await this.#createNodeServer(
                server,
                createServerHttp,
                listen_http_port,
                listen_interface
            );
        }

        if (redirect_http_to_https && https && http) {
            server.use((req, res, next) => {
                if (req.socket.encrypted) {
                    next();
                    return;
                }

                res.statusCode = redirect_http_to_https_status_code;
                res.setHeader(HEADER_LOCATION, `https://${req.hostname}${redirect_http_to_https_port !== HTTP_SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS_PORT ? `:${redirect_http_to_https_port}` : ""}${req.url}`);
                res.end();
            });
        }

        if (no_referrer) {
            server.use((req, res, next) => {
                res.setHeader(HEADER_REFERRER_POLICY, "no-referrer");
                next();
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
