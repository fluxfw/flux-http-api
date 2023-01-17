import { HttpResponse } from "../../../Adapter/Response/HttpResponse.mjs";
import { METHOD_HEAD } from "../../../Adapter/Method/METHOD.mjs";

/** @typedef {import("../../../Adapter/Proxy/ProxyRequest.mjs").ProxyRequest} ProxyRequest */

export class ProxyRequestCommand {
    /**
     * @returns {ProxyRequestCommand}
     */
    static new() {
        return new this();
    }

    /**
     * @private
     */
    constructor() {

    }

    /**
     * @param {ProxyRequest} proxy_request
     * @returns {Promise<HttpResponse>}
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

        const response = await fetch(`${_url}`, {
            ...(Array.isArray(request_method) ? request_method.includes(proxy_request.request.method) : request_method) ? {
                method: proxy_request.request.method
            } : null,
            ...Array.isArray(request_headers) ? {
                headers: request_headers.reduce((headers, key) => {
                    if (!proxy_request.request.hasHeader(key)) {
                        return headers;
                    }

                    headers[key] = proxy_request.request.getHeader(key);

                    return headers;
                }, {})
            } : request_headers ? {
                headers: proxy_request.request.headers
            } : null,
            ...request_body ? {
                body: proxy_request.request.web_body
            } : null,
            ...response_redirect ? {
                redirect: "manual"
            } : null
        });

        if (!response_status && !response.ok) {
            response.body?.cancel();

            return Promise.reject(response);
        }

        if (!response_body || proxy_request.request.method === METHOD_HEAD) {
            response.body?.cancel();
        }

        return HttpResponse.newFromWebBody(
            response_body && proxy_request.request.method !== METHOD_HEAD ? response.body : null,
            response_status ? response.status : null,
            Array.isArray(response_headers) ? response_headers.reduce((headers, key) => {
                if (!response.headers.has(key)) {
                    return headers;
                }

                headers[key] = response.headers.get(key);

                return headers;
            }, {}) : response_headers ? Object.fromEntries(response.headers) : null,
            null,
            response_status ? response.statusText : null
        );
    }
}
