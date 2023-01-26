/** @typedef {import("../Server/HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */

/**
 * @typedef {{url: string, request: HttpServerRequest, request_method?: string[] | boolean, request_query_params?: string[] | boolean, request_headers?: string[] | boolean, request_body?: boolean, response_redirect?: boolean, response_status?: boolean, response_headers?: string[] | boolean}} ProxyRequest
 */
