/** @typedef {import("../Client/HttpClientRequest.mjs").HttpClientRequest} HttpClientRequest */
/** @typedef {import("../Client/HttpClientResponse.mjs").HttpClientResponse} HttpClientResponse */

/**
 * @interface
 */
export class RequestImplementation {
    /**
     * @param {HttpClientRequest} request
     * @returns {Promise<HttpClientResponse>}
     * @abstract
     */
    request(request) { }
}
