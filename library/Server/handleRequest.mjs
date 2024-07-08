/** @typedef {import("../Server/HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */
/** @typedef {import("../Server/HttpServerResponse.mjs").HttpServerResponse} HttpServerResponse */

/**
 * @typedef {(request: HttpServerRequest) => Promise<HttpServerResponse | null>} handleRequest
 */
