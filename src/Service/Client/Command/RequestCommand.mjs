/** @typedef {import("../../../Adapter/Client/HttpClientRequest.mjs").HttpClientRequest} HttpClientRequest */
/** @typedef {import("../../../Adapter/Client/HttpClientResponse.mjs").HttpClientResponse} HttpClientResponse */
/** @typedef {import("../../../Adapter/RequestImplementation/RequestImplementation.mjs").RequestImplementation} RequestImplementation */

export class RequestCommand {
    /**
     * @type {RequestImplementation}
     */
    #request_implementation;

    /**
     * @param {RequestImplementation} request_implementation
     * @returns {RequestCommand}
     */
    static new(request_implementation) {
        return new this(
            request_implementation
        );
    }

    /**
     * @param {RequestImplementation} request_implementation
     * @private
     */
    constructor(request_implementation) {
        this.#request_implementation = request_implementation;
    }

    /**
     * @param {HttpClientRequest} request
     * @returns {Promise<HttpClientResponse>}
     */
    async request(request) {
        return this.#request_implementation.request(
            request
        );
    }
}
