import { HttpClientRequest } from "../../../Adapter/Client/HttpClientRequest.mjs";
import { HttpServerResponse } from "../../../Adapter/Server/HttpServerResponse.mjs";
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
        const request_body = proxy_request.request_body ?? false;
        const response_redirect = proxy_request.response_redirect ?? false;
        const response_status = proxy_request.response_status ?? true;
        const response_headers = proxy_request.response_headers ?? false;
        const response_body = proxy_request.response_body ?? true;

        const _url = new URL(proxy_request.url);

        if (Array.isArray(request_query_params)) {
            for (const key of request_query_params) {
                if (!proxy_request.request.url.searchParams.has(key)) {
                    continue;
                }

                for (const [
                    value
                ] of proxy_request.request.url.searchParams.getAll(request_query_params)) {
                    _url.searchParams.append(key, value);
                }
            }
        } else {
            if (request_query_params) {
                for (const [
                    key,
                    value
                ] of proxy_request.request.url.searchParams) {
                    _url.searchParams.append(key, value);
                }
            }
        }

        const response = await this.#client_service.fetch(
            HttpClientRequest.webStream(
                `${_url}`,
                request_body && proxy_request.request.method !== METHOD_HEAD && proxy_request.request.method !== METHOD_GET ? await proxy_request.request.body.webStream() : null,
                (Array.isArray(request_method) ? request_method.includes(proxy_request.request.method) : request_method) ? proxy_request.request.method : null,
                Array.isArray(request_headers) ? request_headers.reduce((headers, key) => {
                    const value = proxy_request.request.header(key);

                    if (value === null) {
                        return headers;
                    }

                    headers[key] = value;

                    return headers;
                }, {}) : request_headers ? proxy_request.request.headers : null,
                !response_redirect,
                !response_status
            )
        );

        return HttpServerResponse.stream(
            response_body && proxy_request.request.method !== METHOD_HEAD ? await response.body.webStream() : null,
            response_status ? response.status_code : null,
            Array.isArray(response_headers) ? response_headers.reduce((headers, key) => {
                const value = response.header(key);

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
