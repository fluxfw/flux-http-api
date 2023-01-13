import { createServer as createServerHttp } from "node:http";
import { createServer as createServerHttps } from "node:https";
import { REFERRER_POLICY_NO_REFERRER } from "../../../Adapter/Referrer/REFERRER_POLICY.mjs";
import { HEADER_LOCATION, HEADER_REFERRER_POLICY } from "../../../Adapter/Header/HEADER.mjs";
import { HTTP_SERVER_DEFAULT_LISTEN_HTTP_PORT, HTTP_SERVER_DEFAULT_LISTEN_HTTPS_PORT, HTTP_SERVER_DEFAULT_NO_DATE, HTTP_SERVER_DEFAULT_NO_REFERRER, HTTP_SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS, HTTP_SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS_PORT, HTTP_SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS_STATUS_CODE, HTTP_SERVER_LISTEN_HTTP_PORT_DISABLED, HTTP_SERVER_LISTEN_HTTPS_PORT_DISABLED } from "../../../Adapter/HttpServer/HTTP_SERVER.mjs";
import { STATUS_400, STATUS_404, STATUS_500 } from "../../../Adapter/Status/STATUS.mjs";

/** @typedef {import("../../../Adapter/HttpServer/handleRequest.mjs").handleRequest} handleRequest */
/** @typedef {import("node:http")} http */
/** @typedef {import("../../../Adapter/HttpServer/HttpServer.mjs").HttpServer} HttpServer */
/** @typedef {import("../Port/HttpServerService.mjs").HttpServerService} HttpServerService */
/** @typedef {import("node:http").IncomingMessage} IncomingMessage */
/** @typedef {import("node:http").ServerResponse} ServerResponse */
/** @typedef {import("../../../../../flux-shutdown-handler-api/src/Adapter/ShutdownHandler/ShutdownHandler.mjs").ShutdownHandler} ShutdownHandler */

export class RunHttpServerCommand {
    /**
     * @type {HttpServerService}
     */
    #http_server_service;
    /**
     * @type {ShutdownHandler}
     */
    #shutdown_handler;

    /**
     * @param {HttpServerService} http_server_service
     * @param {ShutdownHandler} shutdown_handler
     * @returns {RunHttpServerCommand}
     */
    static new(http_server_service, shutdown_handler) {
        return new this(
            http_server_service,
            shutdown_handler
        );
    }

    /**
     * @param {HttpServerService} http_server_service
     * @param {ShutdownHandler} shutdown_handler
     * @private
     */
    constructor(http_server_service, shutdown_handler) {
        this.#http_server_service = http_server_service;
        this.#shutdown_handler = shutdown_handler;
    }

    /**
     * @param {handleRequest} handle_request
     * @param {HttpServer | null} http_server
     * @returns {Promise<void>}
     */
    async runHttpServer(handle_request, http_server = null) {
        const listen_interface = http_server?.listen_interface ?? null;
        const listen_https_port = http_server?.listen_https_port ?? HTTP_SERVER_DEFAULT_LISTEN_HTTPS_PORT;
        const listen_http_port = http_server?.listen_http_port ?? HTTP_SERVER_DEFAULT_LISTEN_HTTP_PORT;
        const redirect_http_to_https = http_server?.redirect_http_to_https ?? HTTP_SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS;
        const redirect_http_to_https_port = http_server?.redirect_http_to_https_port ?? HTTP_SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS_PORT;
        const redirect_http_to_https_status_code = http_server?.redirect_http_to_https_status_code ?? HTTP_SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS_STATUS_CODE;
        const https_cert = http_server?.https_cert ?? null;
        const https_key = http_server?.https_key ?? null;
        const https_dhparam = http_server?.https_dhparam ?? null;
        const no_date = http_server?.no_date ?? HTTP_SERVER_DEFAULT_NO_DATE;
        const no_referrer = http_server?.no_referrer ?? HTTP_SERVER_DEFAULT_NO_REFERRER;

        const https = listen_https_port !== HTTP_SERVER_LISTEN_HTTPS_PORT_DISABLED && https_cert !== null && https_key !== null;
        const http = listen_http_port !== HTTP_SERVER_LISTEN_HTTP_PORT_DISABLED;

        /**
         * @param {IncomingMessage} req
         * @param {ServerResponse} res
         * @returns {Promise<void>}
         */
        const _handle_request = async (req, res) => {
            await this.#handleRequest(
                req,
                res,
                handle_request,
                redirect_http_to_https && https && http,
                redirect_http_to_https_port,
                redirect_http_to_https_status_code,
                no_date,
                no_referrer
            );
        };

        if (https) {
            await this.#createServer(
                _handle_request,
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

        if (http) {
            await this.#createServer(
                _handle_request,
                createServerHttp,
                listen_http_port,
                listen_interface
            );
        }
    }

    /**
     * @param {(req: http.IncomingMessage, res: http.ServerResponse) => Promise<void>} handle_request
     * @param {createServerHttp | createServerHttps} create_server
     * @param {number} port
     * @param {string | null} server_listen_interface
     * @param {{[key: string]: *}} options
     * @returns {Promise<void>}
     */
    async #createServer(handle_request, create_server, port, server_listen_interface, options = {}) {
        await new Promise((resolve, reject) => {
            const server = create_server(options, handle_request);

            server.listen(port, server_listen_interface, error => {
                if (error) {
                    reject(error);
                    return;
                }

                this.#shutdown_handler.addShutdownTask(async () => {
                    await new Promise((_resolve, _reject) => {
                        server.close(_error => {
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

    /**
     * @param {IncomingMessage} req
     * @param {ServerResponse} res
     * @param {handleRequest} handle_request
     * @param {boolean} redirect_http_to_https
     * @param {number} redirect_http_to_https_port
     * @param {number} redirect_http_to_https_status_code
     * @param {boolean} no_date
     * @param {boolean} no_referrer
     * @returns {Promise<void>}
     */
    async #handleRequest(req, res, handle_request, redirect_http_to_https, redirect_http_to_https_port, redirect_http_to_https_status_code, no_date, no_referrer) {
        res.sendDate = !no_date;

        if (no_referrer) {
            res.setHeader(HEADER_REFERRER_POLICY, REFERRER_POLICY_NO_REFERRER);
        }

        const request = await this.#http_server_service.mapRequest(
            req,
            res
        );

        if (request === null) {
            await this.#http_server_service.mapResponse(
                new Response(null, {
                    status: STATUS_400
                }),
                res
            );
            return;
        }

        if (redirect_http_to_https && request._urlObject.protocol !== "https:") {
            await this.#http_server_service.mapResponse(
                new Response(null, {
                    status: redirect_http_to_https_status_code,
                    headers: {
                        [HEADER_LOCATION]: `https://${request._urlObject.hostname}${redirect_http_to_https_port !== HTTP_SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS_PORT ? `:${redirect_http_to_https_port}` : ""}${request._urlObject.pathname}${request._urlObject.search}`
                    }
                }),
                res,
                request
            );
            return;
        }

        let response;
        try {
            response = await handle_request(
                request
            );
        } catch (error) {
            console.error(error);

            await this.#http_server_service.mapResponse(
                new Response(null, {
                    status: STATUS_500
                }),
                res,
                request
            );

            return;
        }

        if (response !== null) {
            await this.#http_server_service.mapResponse(
                response,
                res,
                request
            );
        } else {
            await this.#http_server_service.mapResponse(
                new Response(null, {
                    status: STATUS_404
                }),
                res,
                request
            );
        }
    }
}
