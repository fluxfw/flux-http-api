import { createServer as createServerHttp } from "node:http";
import { createServer as createServerHttps } from "node:https";
import { HttpServerRequest } from "../Server/HttpServerRequest.mjs";
import { HttpServerResponse } from "./HttpServerResponse.mjs";
import { NodeBodyImplementation } from "../BodyImplementation/NodeBodyImplementation.mjs";
import { pipeline } from "node:stream/promises";
import { REFERRER_POLICY_NO_REFERRER } from "../Referrer/REFERRER_POLICY.mjs";
import { STATUS_CODE_MESSAGE } from "../Status/STATUS_CODE_MESSAGE.mjs";
import { HEADER_CONTENT_TYPE, HEADER_COOKIE, HEADER_HOST, HEADER_REFERRER_POLICY, HEADER_SET_COOKIE, HEADER_X_FORWARDED_HOST, HEADER_X_FORWARDED_PROTO } from "../Header/HEADER.mjs";
import { METHOD_GET, METHOD_HEAD } from "../Method/METHOD.mjs";
import { PROTOCOL_HTTP, PROTOCOL_HTTPS } from "../Protocol/PROTOCOL.mjs";
import { SERVER_DEFAULT_DISABLE_HTTP_IF_HTTPS, SERVER_DEFAULT_FORWARDED_HEADERS, SERVER_DEFAULT_LISTEN_HTTP_PORT, SERVER_DEFAULT_LISTEN_HTTPS_PORT, SERVER_DEFAULT_NO_DATE, SERVER_DEFAULT_NO_REFERRER, SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS, SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS_PORT, SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS_STATUS_CODE, SERVER_LISTEN_HTTP_PORT_DISABLED, SERVER_LISTEN_HTTPS_PORT_DISABLED } from "./SERVER.mjs";
import { SET_COOKIE_OPTION_DEFAULT_HTTP_ONLY, SET_COOKIE_OPTION_DEFAULT_MAX_AGE, SET_COOKIE_OPTION_DEFAULT_PATH, SET_COOKIE_OPTION_DEFAULT_PRIORITY, SET_COOKIE_OPTION_DEFAULT_SAME_SITE, SET_COOKIE_OPTION_DEFAULT_SECURE, SET_COOKIE_OPTION_EXPIRES, SET_COOKIE_OPTION_HTTP_ONLY, SET_COOKIE_OPTION_MAX_AGE, SET_COOKIE_OPTION_MAX_AGE_SESSION, SET_COOKIE_OPTION_PATH, SET_COOKIE_OPTION_PRIORITY, SET_COOKIE_OPTION_SAME_SITE, SET_COOKIE_OPTION_SECURE } from "../Cookie/SET_COOKIE_OPTION.mjs";
import { STATUS_CODE_400, STATUS_CODE_404, STATUS_CODE_500 } from "../Status/STATUS_CODE.mjs";

/** @typedef {import("./handleRequest.mjs").handleRequest} handleRequest */
/** @typedef {import("node:http").IncomingMessage} IncomingMessage */
/** @typedef {import("./_Server.mjs").Server} Server */
/** @typedef {import("node:http").ServerResponse} ServerResponse */
/** @typedef {import("../ShutdownHandler/ShutdownHandler.mjs").ShutdownHandler} ShutdownHandler */

export class RunServer {
    /**
     * @type {ShutdownHandler | null}
     */
    #shutdown_handler;

    /**
     * @param {ShutdownHandler | null} shutdown_handler
     * @returns {RunServer}
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
     * @param {handleRequest} handle_request
     * @param {Server | null} server
     * @returns {Promise<void>}
     */
    async runServer(handle_request, server = null) {
        const listen_interface = server?.listen_interface ?? null;
        const listen_https_port = server?.listen_https_port ?? SERVER_DEFAULT_LISTEN_HTTPS_PORT;
        const listen_http_port = server?.listen_http_port ?? SERVER_DEFAULT_LISTEN_HTTP_PORT;
        const disable_http_if_https = server?.disable_http_if_https ?? SERVER_DEFAULT_DISABLE_HTTP_IF_HTTPS;
        const redirect_http_to_https = server?.redirect_http_to_https ?? SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS;
        const redirect_http_to_https_port = server?.redirect_http_to_https_port ?? SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS_PORT;
        const redirect_http_to_https_status_code = server?.redirect_http_to_https_status_code ?? SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS_STATUS_CODE;
        const https_certificate = server?.https_certificate ?? null;
        const https_key = server?.https_key ?? null;
        const https_dhparam = server?.https_dhparam ?? null;
        const no_date = server?.no_date ?? SERVER_DEFAULT_NO_DATE;
        const no_referrer = server?.no_referrer ?? SERVER_DEFAULT_NO_REFERRER;
        const forwarded_headers = server?.forwarded_headers ?? SERVER_DEFAULT_FORWARDED_HEADERS;

        const https = listen_https_port !== SERVER_LISTEN_HTTPS_PORT_DISABLED && https_certificate !== null && https_key !== null;
        const http = disable_http_if_https && https ? false : listen_http_port !== SERVER_LISTEN_HTTP_PORT_DISABLED;

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
                no_referrer,
                forwarded_headers
            );
        };

        if (https) {
            await this.#createServer(
                _handle_request,
                createServerHttps,
                listen_https_port,
                listen_interface,
                {
                    cert: https_certificate,
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
     * @param {ServerResponse} _res
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null}} cookies
     * @returns {Promise<void>}
     */
    async _setCookies(_res, cookies) {
        this.#setCookies(
            _res,
            cookies
        );
    }

    /**
     * @param {(req: IncomingMessage, res: ServerResponse) => Promise<void>} handle_request
     * @param {createServerHttp | createServerHttps} create_server
     * @param {number} port
     * @param {string | null} server_listen_interface
     * @param {{[key: string]: *}} options
     * @returns {Promise<void>}
     */
    async #createServer(handle_request, create_server, port, server_listen_interface, options = {}) {
        await new Promise((resolve, reject) => {
            const server = create_server(options, handle_request);

            server.listen(port, server_listen_interface, async error => {
                if (error) {
                    reject(error);
                    return;
                }

                /**
                 * @returns {Promise<void>}
                 */
                const close_server = async () => {
                    await new Promise((_resolve, _reject) => {
                        server.close(_error => {
                            if (_error) {
                                _reject(_error);
                                return;
                            }

                            _resolve();
                        });
                    });
                };

                if (this.#shutdown_handler !== null) {
                    await this.#shutdown_handler.addTask(
                        async () => {
                            await close_server();
                        }
                    );
                } else {
                    for (const name of [
                        "SIGINT",
                        "SIGTERM"
                    ]) {
                        process.on(name, async () => {
                            await close_server();
                        });
                    }
                }

                resolve();
            });
        });
    }

    /**
     * @param {ServerResponse} res
     * @param {string} name
     * @param {{[key: string]: *} | null} options
     * @returns {void}
     */
    #deleteCookie(res, name, options = null) {
        this.#setCookie(
            res,
            name,
            "",
            {
                ...options,
                [SET_COOKIE_OPTION_MAX_AGE]: -1,
                [SET_COOKIE_OPTION_EXPIRES]: null
            }
        );
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
     * @param {boolean} forwarded_headers
     * @returns {Promise<void>}
     */
    async #handleRequest(req, res, handle_request, redirect_http_to_https, redirect_http_to_https_port, redirect_http_to_https_status_code, no_date, no_referrer, forwarded_headers) {
        res.sendDate = !no_date;

        if (no_referrer) {
            res.setHeader(HEADER_REFERRER_POLICY, REFERRER_POLICY_NO_REFERRER);
        }

        let request;
        try {
            request = await this.#mapRequest(
                req,
                res,
                forwarded_headers
            );
        } catch (error) {
            console.error(error);

            await this.#mapResponse(
                HttpServerResponse.text(
                    "Invalid request",
                    STATUS_CODE_400
                ),
                res
            );

            return;
        }

        if (redirect_http_to_https && request.url.protocol !== `${PROTOCOL_HTTPS}:`) {
            await this.#mapResponse(
                HttpServerResponse.redirect(
                    `${PROTOCOL_HTTPS}://${request.url.hostname}${redirect_http_to_https_port !== SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS_PORT ? `:${redirect_http_to_https_port}` : ""}${request.url.pathname}${request.url.search}`,
                    redirect_http_to_https_status_code
                ),
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

            await this.#mapResponse(
                HttpServerResponse.new(
                    null,
                    STATUS_CODE_500
                ),
                res,
                request
            );

            return;
        }

        if (response !== null) {
            await this.#mapResponse(
                response,
                res,
                request
            );
        } else {
            await this.#mapResponse(
                HttpServerResponse.text(
                    "Route not found",
                    STATUS_CODE_404
                ),
                res,
                request
            );
        }
    }

    /**
     * @param {IncomingMessage} req
     * @param {ServerResponse | null} _res
     * @param {boolean | null} forwarded_headers
     * @returns {Promise<HttpServerRequest>}
     */
    async #mapRequest(req, _res = null, forwarded_headers = null) {
        const _forwarded_headers = forwarded_headers ?? SERVER_DEFAULT_FORWARDED_HEADERS;

        return HttpServerRequest.new(
            new URL(req.url, `${(_forwarded_headers ? req.headers[HEADER_X_FORWARDED_PROTO.toLowerCase()] : null) ?? (req.socket.encrypted ? PROTOCOL_HTTPS : PROTOCOL_HTTP)}://${(_forwarded_headers ? req.headers[HEADER_X_FORWARDED_HOST.toLowerCase()] : null) ?? req.headers[HEADER_HOST.toLowerCase()] ?? "host"}`),
            req.method !== METHOD_GET && req.method !== METHOD_HEAD ? NodeBodyImplementation.new(
                req,
                req.headers[HEADER_CONTENT_TYPE.toLowerCase()] ?? null
            ) : null,
            req.method,
            req.headers,
            req.headers[HEADER_COOKIE.toLowerCase()]?.split(";")?.reduce((cookies, cookie) => {
                const [
                    name,
                    ...value
                ] = cookie.trim().split("=");

                cookies[name] = value.join("=");

                return cookies;
            }, {}) ?? null,
            null,
            _res
        );
    }

    /**
     * @param {HttpServerResponse} response
     * @param {ServerResponse} res
     * @param {HttpServerRequest | null} request
     * @returns {Promise<void>}
     */
    async #mapResponse(response, res, request = null) {
        try {
            res.statusCode = response.status_code;
            res.statusMessage = response.status_message;

            for (const [
                key,
                value
            ] of Object.entries(response.headers)) {
                this.#setHeader(
                    res,
                    key,
                    value
                );
            }

            this.#setCookies(
                res,
                response.cookies
            );

            if ((request?.method ?? null) === METHOD_HEAD) {
                return;
            }

            const stream = response.body.stream();

            if (stream === null) {
                return;
            }

            await pipeline(stream, res);
        } catch (error) {
            console.error(error);

            if (!res.headersSent) {
                res.statusCode = STATUS_CODE_500;
                res.statusMessage = STATUS_CODE_MESSAGE[STATUS_CODE_500];
            }
        } finally {
            res.end();
        }
    }

    /**
     * @param {ServerResponse} res
     * @param {string} name
     * @param {*} value
     * @param {{[key: string]: *} | null} options
     * @returns {void}
     */
    #setCookie(res, name, value, options = null) {
        this.#setHeader(
            res,
            HEADER_SET_COOKIE,
            `${name}=${value}${Object.entries({
                [SET_COOKIE_OPTION_HTTP_ONLY]: SET_COOKIE_OPTION_DEFAULT_HTTP_ONLY,
                [SET_COOKIE_OPTION_MAX_AGE]: SET_COOKIE_OPTION_DEFAULT_MAX_AGE,
                [SET_COOKIE_OPTION_PATH]: SET_COOKIE_OPTION_DEFAULT_PATH,
                [SET_COOKIE_OPTION_PRIORITY]: SET_COOKIE_OPTION_DEFAULT_PRIORITY,
                [SET_COOKIE_OPTION_SAME_SITE]: SET_COOKIE_OPTION_DEFAULT_SAME_SITE,
                [SET_COOKIE_OPTION_SECURE]: SET_COOKIE_OPTION_DEFAULT_SECURE,
                ...options
            }).reduce((_options, [
                key,
                _value
            ]) => {
                if ((_value ?? null) === null) {
                    return _options;
                }

                if (typeof _value === "boolean") {
                    return _value ? `${_options}; ${key}` : _options;
                }

                if (key === SET_COOKIE_OPTION_MAX_AGE && _value === SET_COOKIE_OPTION_MAX_AGE_SESSION) {
                    return _options;
                }

                return `${_options}; ${key}=${_value instanceof Date ? _value.toUTCString() : _value}`;
            }, "")}`
        );
    }

    /**
     * @param {ServerResponse} res
     * @param {{[key: string]: string | {value: string | null, options: {[key: string]: *} | null} | null}} cookies
     * @returns {void}
     */
    #setCookies(res, cookies) {
        for (const [
            name,
            value
        ] of Object.entries(cookies)) {
            if (value === null) {
                this.#deleteCookie(
                    res,
                    name
                );
            } else {
                if (typeof value === "object") {
                    if (value.value === null) {
                        this.#deleteCookie(
                            res,
                            name,
                            value.options
                        );
                    } else {
                        this.#setCookie(
                            res,
                            name,
                            value.value,
                            value.options
                        );
                    }
                } else {
                    this.#setCookie(
                        res,
                        name,
                        value
                    );
                }
            }
        }
    }

    /**
     * @param {ServerResponse} res
     * @param {string} key
     * @param {string | string[]} value
     * @returns {void}
     */
    #setHeader(res, key, value) {
        const values = res.getHeader(key) ?? null;

        res.setHeader(key, values !== null ? [
            ...Array.isArray(values) ? values : [
                values
            ],
            ...Array.isArray(value) ? value : [
                value
            ]
        ] : value);
    }
}
