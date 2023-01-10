/** @typedef {import("../Request/HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */
/** @typedef {import("../Response/HttpServerResponse.mjs").HttpServerResponse} HttpServerResponse */

/**
 * @typedef {(request: HttpServerRequest) => Promise<HttpServerResponse | null>} handleRequest
 */
