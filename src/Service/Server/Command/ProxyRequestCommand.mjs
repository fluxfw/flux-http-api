import { HttpClientRequest } from "../../../Adapter/Client/HttpClientRequest.mjs";
import { HttpServerResponse } from "../../../Adapter/Server/HttpServerResponse.mjs";
import { HEADER_X_FORWARDED_HOST, HEADER_X_FORWARDED_PROTO } from "../../../Adapter/Header/HEADER.mjs";
import { METHOD_GET, METHOD_HEAD } from "../../../Adapter/Method/METHOD.mjs";

/** @typedef {import("../../Client/Port/ClientService.mjs").ClientService} ClientService */
/** @typedef {import("../../../Adapter/Proxy/ProxyRequest.mjs").ProxyRequest} ProxyRequest */

export class ProxyRequestCommand {
    /**
     * @type {ClientService}
     */
    #client_service;

    /**
     * @param {ClientService} client_service
     * @returns {ProxyRequestCommand}
     */
    static new(client_service) {
        return new this(
            client_service
        );
    }

    /**
     * @param {ClientService} client_service
     * @private
     */
    constructor(client_service) {
        this.#client_service = client_service;
    }

    /**
     * @param {ProxyRequest} proxy_request
     * @returns {Promise<HttpServerResponse>}
     */
    async proxyRequest(proxy_request) {
        const request_method = proxy_request.request_method ?? false;
        const request_query_params = proxy_request.request_query_params ?? false;
        const request_headers = proxy_request.request_headers ?? false;
        const request_forwarded_headers = proxy_request.request_forwarded_headers ?? false;
        const request_body = proxy_request.request_body ?? false;
        const response_redirect = proxy_request.response_redirect ?? false;
        const response_status = proxy_request.response_status ?? true;
        const response_headers = proxy_request.response_headers ?? false;
        const response_body = proxy_request.response_body ?? true;
        const server_certificate = proxy_request.server_certificate ?? null;

        const url = new URL(proxy_request.url);

        if (Array.isArray(request_query_params)) {
            for (const key of request_query_params) {
                if (!proxy_request.request.url.searchParams.has(key)) {
                    continue;
                }

                for (const [
                    value
                ] of proxy_request.request.url.searchParams.getAll(request_query_params)) {
                    url.searchParams.append(key, value);
                }
            }
        } else {
            if (request_query_params) {
                for (const [
                    key,
                    value
                ] of proxy_request.request.url.searchParams) {
                    url.searchParams.append(key, value);
                }
            }
        }

        const response = await this.#client_service.request(
            await HttpClientRequest.nodeStream(
                url,
                request_body && proxy_request.request.method !== METHOD_HEAD && proxy_request.request.method !== METHOD_GET ? proxy_request.request.body.stream() : null,
                (Array.isArray(request_method) ? request_method.includes(proxy_request.request.method) : request_method) ? proxy_request.request.method : null,
                {
                    ...Array.isArray(request_headers) ? request_headers.reduce((headers, key) => {
                        const value = proxy_request.request.header(
                            key
                        );

                        if (value === null) {
                            return headers;
                        }

                        headers[key] = value;

                        return headers;
                    }, {}) : request_headers ? proxy_request.request.headers : null,
                    ...request_forwarded_headers ? {
                        [HEADER_X_FORWARDED_HOST]: proxy_request.request.url.host,
                        [HEADER_X_FORWARDED_PROTO]: proxy_request.request.url.protocol.slice(0, -1)
                    } : null
                },
                !response_status,
                response_body,
                !response_redirect,
                server_certificate
            )
        );

        return HttpServerResponse.stream(
            response_body && proxy_request.request.method !== METHOD_HEAD ? response.body.stream() : null,
            response_status ? response.status_code : null,
            Array.isArray(response_headers) ? response_headers.reduce((headers, key) => {
                const value = response.header(
                    key
                );

                if (value === null) {
                    return headers;
                }

                headers[key] = value;

                return headers;
            }, {}) : response_headers ? response.headers : null,
            null,
            response_status ? response.status_message : null
        );
    }
}
